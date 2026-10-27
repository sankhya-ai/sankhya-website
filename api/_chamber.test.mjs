import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { beforeEach, test } from 'node:test';

import { adminStatus, changeSeats, planFromSubscription, subscribe, syncAllChambers, verifyAdminLink } from './_chamber.js';

const LINE = 'a'.repeat(32);
const OTHER = 'b'.repeat(32);
const b64 = (bytes) => Buffer.from(bytes).toString('base64url');

/** A chamber admin's key, and a billing link signed with it (as the Chamber app makes it). */
function adminKey() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519');
  const pub = b64(publicKey.export({ format: 'der', type: 'spki' }).subarray(-32));
  const link = (claims) => {
    const body = b64(JSON.stringify({ v: 1, iat: Math.floor(Date.now() / 1000), op: 'billing', line: LINE, ...claims }));
    return `${body}.${b64(crypto.sign(null, Buffer.from(body), privateKey))}`;
  };
  return { pub, link };
}

/** The hosted relay and Razorpay, faked: records what was asked. */
function world({ plan = {}, subs = [] } = {}) {
  const calls = [];
  const fetchImpl = async (url, init = {}) => {
    const body = init.body ? JSON.parse(init.body) : undefined;
    calls.push({ url, method: init.method || 'GET', body, auth: init.headers?.authorization });
    const ok = (data) => ({ ok: true, status: 200, json: async () => data });
    if (url.includes('/v1/hosted/status')) return ok({ registered: true, members: 3, trial: false, status: 'trial', ...plan });
    if (url.includes('/v1/hosted/billing')) return ok({ registered: true, ...body });
    if (url.endsWith('/v1/subscriptions') && init.method === 'POST') return ok({ id: 'sub_new', short_url: 'https://rzp.io/i/x' });
    if (url.includes('/v1/subscriptions?')) return ok({ items: subs });
    if (url.includes('/v1/subscriptions/')) return ok(subs.find((s) => url.includes(s.id)) || { id: 'sub_1', status: 'active', quantity: 5, current_end: 2e9, notes: { chamber_line: LINE } });
    return { ok: false, status: 404, json: async () => ({}) };
  };
  return { calls, fetchImpl };
}

beforeEach(() => {
  Object.assign(process.env, {
    CHAMBER_RELAY_URL: 'https://relay.test',
    CHAMBER_HOSTED_SECRET: 'secret',
    CHAMBER_RAZORPAY_KEY_ID: 'rzp_test_x',
    CHAMBER_RAZORPAY_KEY_SECRET: 'y',
    CHAMBER_RAZORPAY_PLAN_ID: 'plan_chamber',
  });
});

test('a billing link counts only if this chamber\'s admin signed it, for billing, recently', () => {
  const admin = adminKey();
  assert.ok(verifyAdminLink(admin.pub, admin.link(), LINE));
  assert.equal(verifyAdminLink(admin.pub, admin.link({ line: OTHER }), LINE), null, 'another chamber');
  assert.equal(verifyAdminLink(admin.pub, admin.link({ op: 'pass' }), LINE), null, 'a pass is not a billing link');
  assert.equal(verifyAdminLink(adminKey().pub, admin.link(), LINE), null, 'someone else\'s key');
  assert.equal(verifyAdminLink(admin.pub, admin.link({ iat: Math.floor(Date.now() / 1000) - 4 * 86400 }), LINE), null, 'too old');
  assert.equal(verifyAdminLink(admin.pub, 'garbage', LINE), null);
});

test('status needs the admin\'s link, and never hands out the admin key', async () => {
  const admin = adminKey();
  const { fetchImpl, calls } = world({ plan: { adminKey: admin.pub } });
  const plan = await adminStatus({ line: LINE, proof: admin.link() }, { fetchImpl });
  assert.equal(plan.adminKey, undefined);
  assert.equal(calls[0].auth, 'Bearer secret');
  await assert.rejects(adminStatus({ line: LINE, proof: adminKey().link() }, { fetchImpl }), /expired or isn’t from your chamber’s admin/);
});

test('subscribing: a seat for every member at least; in the trial the first charge waits for its end', async () => {
  const admin = adminKey();
  const trialEnds = Date.now() + 3 * 86400e3;
  const { fetchImpl, calls } = world({ plan: { adminKey: admin.pub, trial: true, trialEnds } });
  await assert.rejects(subscribe({ line: LINE, proof: admin.link(), seats: 2 }, { fetchImpl }), /Choose 3 to 500 seats/);
  const result = await subscribe({ line: LINE, proof: admin.link(), seats: 4 }, { fetchImpl });
  assert.equal(result.url, 'https://rzp.io/i/x');
  const created = calls.find((c) => c.method === 'POST' && c.url.endsWith('/v1/subscriptions')).body;
  assert.equal(created.quantity, 4);
  assert.equal(created.plan_id, 'plan_chamber');
  assert.equal(created.start_at, Math.floor(trialEnds / 1000));
  assert.deepEqual(created.notes, { product: 'chamber-cloud', chamber_line: LINE });
});

test('after the trial the charge starts now; a chamber with a plan changes seats instead', async () => {
  const admin = adminKey();
  let { fetchImpl, calls } = world({ plan: { adminKey: admin.pub, trial: false, trialEnds: Date.now() - 1 } });
  await subscribe({ line: LINE, proof: admin.link(), seats: 3 }, { fetchImpl });
  assert.equal(calls.find((c) => c.method === 'POST' && c.url.endsWith('/v1/subscriptions')).body.start_at, undefined);

  ({ fetchImpl, calls } = world({ plan: { adminKey: admin.pub, status: 'active', account: 'sub_1' } }));
  await assert.rejects(subscribe({ line: LINE, proof: admin.link(), seats: 3 }, { fetchImpl }), /change its seats/);
  const told = await changeSeats({ line: LINE, proof: admin.link(), seats: 5 }, { fetchImpl });
  assert.deepEqual(calls.find((c) => c.method === 'PATCH').body, { quantity: 5, schedule_change_at: 'now' });
  assert.deepEqual([told.status, told.seats, told.account], ['active', 5, 'sub_1']);
});

test('Razorpay\'s state becomes the relay\'s plan; the daily sweep takes each chamber\'s newest subscription', async () => {
  assert.deepEqual(planFromSubscription({ id: 's', status: 'active', quantity: 4, current_end: 1_900_000_000 }), { status: 'active', seats: 4, paidUntil: 1_900_000_000_000, account: 's' });
  assert.equal(planFromSubscription({ id: 's', status: 'authenticated', quantity: 2, start_at: 1_900_000_000 }).status, 'active', 'a mandate in the trial');
  assert.equal(planFromSubscription({ id: 's', status: 'halted', quantity: 2 }).status, 'cancelled');

  const subs = [
    { id: 'old', created_at: 1, status: 'cancelled', quantity: 2, notes: { chamber_line: LINE } },
    { id: 'new', created_at: 2, status: 'active', quantity: 6, current_end: 2e9, notes: { chamber_line: LINE } },
    { id: 'tura', created_at: 3, status: 'active', quantity: 1, notes: {} },
  ];
  const { fetchImpl, calls } = world({ subs });
  assert.deepEqual(await syncAllChambers({ fetchImpl }), { synced: 1 });
  const told = calls.filter((c) => c.url.includes('/v1/hosted/billing')).map((c) => c.body);
  assert.deepEqual(told, [{ line: LINE, status: 'active', seats: 6, paidUntil: 2e12, account: 'new' }]);
});
