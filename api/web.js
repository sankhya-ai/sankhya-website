import {
  consumeDailyBudget,
  dailyLimit,
  readWithProviders,
  searchWithProviders,
  verifyEntitlementBearer,
} from './_web-providers.js';
import { joinWaitlist } from './_waitlist.js';
import { adminStatus, changeSeats, subscribe, syncAfterCheckout } from './_chamber.js';

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  const body = Buffer.concat(chunks).toString('utf8');
  return body ? JSON.parse(body) : {};
}

// One function serves the web ops, Manu's waitlist and Chamber Cloud's billing (Hobby plan
// caps the project at 12 functions); vercel.json rewrites /api/web-search, /api/web-read and
// /api/waitlist here.

/** Chamber Cloud billing, for a chamber's admin (who proves it with a link the app signs). */
const CHAMBER_OPS = {
  'chamber-status': adminStatus,
  'chamber-subscribe': subscribe,
  'chamber-seats': changeSeats,
  'chamber-synced': syncAfterCheckout,
};
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const op = new URL(req.url, 'http://localhost').searchParams.get('op');
    // Manu's waitlist is public: no entitlement, so it is answered before the check below.
    if (op === 'waitlist') return joinWaitlist(req, res);
    if (CHAMBER_OPS[op]) {
      res.setHeader('Cache-Control', 'private, no-store, max-age=0');
      try {
        return res.status(200).json(await CHAMBER_OPS[op](await readJson(req)));
      } catch (error) {
        if (!error.status || error.status >= 500) console.error(`${op} failed:`, error.message);
        return res.status(error.status || 500).json({ error: error.message });
      }
    }
    if (op !== 'search' && op !== 'read') return res.status(404).json({ error: 'Unknown web op' });

    const identity = verifyEntitlementBearer(req.headers.authorization);
    const body = await readJson(req);
    res.setHeader('Cache-Control', 'private, no-store, max-age=0');

    if (op === 'search') {
      await consumeDailyBudget(
        identity.licenseId,
        'search',
        dailyLimit(process.env, 'CHOTU_WEB_SEARCH_DAILY_LIMIT', 400),
      );
      const { provider, results } = await searchWithProviders(body.query, body.limit);
      return res.status(200).json({
        schema_version: 'chotu.web_search_proxy.v1',
        provider,
        results,
      });
    }

    await consumeDailyBudget(
      identity.licenseId,
      'read',
      dailyLimit(process.env, 'CHOTU_WEB_READ_DAILY_LIMIT', 800),
    );
    const payload = await readWithProviders(body.url);
    return res.status(200).json({
      schema_version: 'chotu.web_read_proxy.v1',
      ...payload,
    });
  } catch (error) {
    const status = error.statusCode || 500;
    if (status >= 500) console.error('web proxy failed:', error.message);
    return res.status(status).json({ error: error.message, code: error.code || null });
  }
}
