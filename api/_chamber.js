// Chamber Cloud billing: a team's chamber lives on the hosted relay (a 7-day trial), then pays a
// seat per teammate through Razorpay. The relay is the source of truth for who may connect; this
// tells it about payments. Nothing here is stored on our side: the relay keeps each chamber's plan,
// Razorpay keeps the subscription (noted with the chamber's line id).
//
// The chamber's admin opens the billing page from the app with a link the admin key signed
// ({op: "billing", line, iat}); the relay says which key that is.

import crypto from 'node:crypto';

const SPKI_ED25519 = Buffer.from('302a300506032b6570032100', 'hex');
const LINK_MAX_AGE_S = 3 * 24 * 3600;
const LINE = /^[0-9a-f]{32}$/;
export const MAX_SEATS = 500;

function env(name) {
  const value = String(process.env[name] || '').trim();
  if (!value) throw Object.assign(new Error(`${name} is not set`), { status: 503 });
  return value;
}

/** The claims of a link the chamber's admin signed, or null. */
export function verifyAdminLink(adminKey, proof, line, now = Date.now()) {
  if (!adminKey || typeof proof !== 'string') return null;
  const [body, sig] = proof.split('.');
  if (!body || !sig) return null;
  try {
    const key = crypto.createPublicKey({ key: Buffer.concat([SPKI_ED25519, Buffer.from(adminKey, 'base64url')]), format: 'der', type: 'spki' });
    if (!crypto.verify(null, Buffer.from(body), key, Buffer.from(sig, 'base64url'))) return null;
    const claims = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (claims.op !== 'billing' || claims.line !== line) return null;
    if (!Number.isFinite(claims.iat) || now / 1000 - claims.iat > LINK_MAX_AGE_S) return null;
    return claims;
  } catch {
    return null;
  }
}

async function relay(path, { method = 'GET', body, fetchImpl = fetch } = {}) {
  const response = await fetchImpl(`${env('CHAMBER_RELAY_URL')}${path}`, {
    method,
    headers: { authorization: `Bearer ${env('CHAMBER_HOSTED_SECRET')}`, 'content-type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(data.error || `the relay answered ${response.status}`), { status: response.status === 404 ? 404 : 502 });
  return data;
}

async function razorpay(path, { method = 'GET', body, fetchImpl = fetch } = {}) {
  const auth = Buffer.from(`${env('CHAMBER_RAZORPAY_KEY_ID')}:${env('CHAMBER_RAZORPAY_KEY_SECRET')}`).toString('base64');
  const response = await fetchImpl(`https://api.razorpay.com/v1${path}`, {
    method,
    headers: { authorization: `Basic ${auth}`, 'content-type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(data?.error?.description || `Razorpay answered ${response.status}`), { status: 502 });
  return data;
}

/** The chamber's plan, after checking the link really is from its admin. */
export async function adminStatus({ line, proof }, deps = {}) {
  if (!LINE.test(String(line || ''))) throw Object.assign(new Error('Open billing from the Chamber app (the link names your chamber).'), { status: 400 });
  const status = await relay(`/v1/hosted/status?line=${line}`, deps);
  if (!status.registered) throw Object.assign(new Error('That chamber isn’t on Chamber Cloud.'), { status: 404 });
  if (!verifyAdminLink(status.adminKey, proof, line, deps.now)) {
    throw Object.assign(new Error('This billing link has expired or isn’t from your chamber’s admin. Open billing again from the Chamber app.'), { status: 403 });
  }
  const { adminKey, ...plan } = status;
  return plan;
}

const ACTIVE = new Set(['authenticated', 'active', 'pending']);

/** What the relay should know about a Razorpay subscription. */
export function planFromSubscription(sub) {
  const active = ACTIVE.has(sub.status);
  // Paid through the end of the current period; a mandate in a trial counts from when the first charge falls.
  const paidUntil = (sub.current_end || sub.charge_at || sub.start_at || 0) * 1000;
  return { status: active ? 'active' : 'cancelled', seats: Number(sub.quantity) || 0, paidUntil, account: sub.id };
}

/** Tell the relay about the chamber's subscription, as Razorpay has it now. */
export async function syncChamber(line, subscriptionId, deps = {}) {
  const sub = await razorpay(`/subscriptions/${encodeURIComponent(subscriptionId)}`, deps);
  if (sub?.notes?.chamber_line !== line) throw Object.assign(new Error('That subscription isn’t this chamber’s.'), { status: 400 });
  return relay('/v1/hosted/billing', { ...deps, method: 'POST', body: { line, ...planFromSubscription(sub) } });
}

/**
 * Start a subscription for `seats` teammates. During the trial the first charge falls when it
 * ends, so a team never pays for days it had free. Resolves to the Razorpay checkout link.
 */
export async function subscribe({ line, proof, seats }, deps = {}) {
  const plan = await adminStatus({ line, proof }, deps);
  const quantity = Math.floor(Number(seats));
  if (!Number.isFinite(quantity) || quantity < Math.max(1, plan.members) || quantity > MAX_SEATS) {
    throw Object.assign(new Error(`Choose ${Math.max(1, plan.members)} to ${MAX_SEATS} seats: one for each teammate in the chamber.`), { status: 400 });
  }
  if (plan.status === 'active' && plan.account) throw Object.assign(new Error('This chamber already has a plan; change its seats instead.'), { status: 409 });
  const now = (deps.now ?? Date.now()) / 1000;
  const startAt = plan.trial && plan.trialEnds / 1000 > now + 600 ? Math.floor(plan.trialEnds / 1000) : undefined;
  const sub = await razorpay('/subscriptions', {
    ...deps,
    method: 'POST',
    body: {
      plan_id: env('CHAMBER_RAZORPAY_PLAN_ID'),
      quantity,
      total_count: 120,
      customer_notify: 1,
      ...(startAt ? { start_at: startAt } : {}),
      notes: { product: 'chamber-cloud', chamber_line: line },
    },
  });
  return { url: sub.short_url, subscription: sub.id };
}

/** Change the number of seats on the chamber's plan, from now. */
export async function changeSeats({ line, proof, seats }, deps = {}) {
  const plan = await adminStatus({ line, proof }, deps);
  const quantity = Math.floor(Number(seats));
  if (!plan.account) throw Object.assign(new Error('This chamber has no plan yet.'), { status: 409 });
  if (!Number.isFinite(quantity) || quantity < Math.max(1, plan.members) || quantity > MAX_SEATS) {
    throw Object.assign(new Error(`Choose ${Math.max(1, plan.members)} to ${MAX_SEATS} seats: at least one for each teammate in the chamber.`), { status: 400 });
  }
  await razorpay(`/subscriptions/${encodeURIComponent(plan.account)}`, { ...deps, method: 'PATCH', body: { quantity, schedule_change_at: 'now' } });
  return syncChamber(line, plan.account, deps);
}

/** Every Chamber Cloud subscription, told to the relay (the daily sweep, and after a checkout). */
export async function syncAllChambers(deps = {}) {
  const planId = env('CHAMBER_RAZORPAY_PLAN_ID');
  let synced = 0;
  for (let skip = 0; ; skip += 100) {
    const page = await razorpay(`/subscriptions?plan_id=${planId}&count=100&skip=${skip}`, deps);
    const items = page.items || [];
    // The newest subscription of a chamber wins (an old cancelled one must not undo a new one).
    const newest = new Map();
    for (const sub of items) {
      const line = sub?.notes?.chamber_line;
      if (LINE.test(String(line || '')) && (!newest.has(line) || sub.created_at > newest.get(line).created_at)) newest.set(line, sub);
    }
    for (const [line, sub] of newest) {
      await relay('/v1/hosted/billing', { ...deps, method: 'POST', body: { line, ...planFromSubscription(sub) } }).then(() => synced++, () => {});
    }
    if (items.length < 100) break;
  }
  return { synced };
}

/** After checkout: find the chamber's newest subscription and tell the relay. */
export async function syncAfterCheckout({ line, proof }, deps = {}) {
  await adminStatus({ line, proof }, deps);
  const page = await razorpay(`/subscriptions?plan_id=${env('CHAMBER_RAZORPAY_PLAN_ID')}&count=100`, deps);
  const mine = (page.items || []).filter((s) => s?.notes?.chamber_line === line).sort((a, b) => b.created_at - a.created_at)[0];
  if (mine) await relay('/v1/hosted/billing', { ...deps, method: 'POST', body: { line, ...planFromSubscription(mine) } });
  return adminStatus({ line, proof }, deps);
}
