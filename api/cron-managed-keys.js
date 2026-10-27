import crypto from 'node:crypto';
import { privateBillingRef, upstreamLimitUsd } from './_credits.js';
import { admin, getAdminDb, requireEnv } from './_firebase-admin.js';
import { createProvisionedKey, disableKey, updateKeyLimit } from './_openrouter.js';
import { syncAllChambers } from './_chamber.js';

const STALE_LOCK_MS = 5 * 60 * 1000;
const BATCH_LIMIT = 5;

function verifyCronSecret(req) {
  const cronSecret = requireEnv('CRON_SECRET');
  const auth = req.headers.authorization || '';
  const provided = Buffer.from(auth.startsWith('Bearer ') ? auth.slice(7) : '');
  const expected = Buffer.from(cronSecret);
  if (provided.length !== expected.length) return false;
  return crypto.timingSafeEqual(provided, expected);
}

async function provisionKey(db, subRef, uid) {
  let didLock = false;
  let expiresAt = null;
  await db.runTransaction(async (t) => {
    const snap = await t.get(subRef);
    const sub = snap.data();
    const status = sub?.managedApiKey?.status;
    if (status !== 'pending' || !sub?.access?.managedKeys) return;
    const subscriptionExpiry = new Date(sub.currentPeriodEnd || sub.updateUntil || 0).getTime();
    expiresAt = new Date(
      Number.isFinite(subscriptionExpiry) && subscriptionExpiry > Date.now()
        ? subscriptionExpiry
        : Date.now() + 31 * 24 * 60 * 60 * 1000
    ).toISOString();
    t.update(subRef, {
      'managedApiKey.status': 'provisioning',
      'managedApiKey.provisionedAt': new Date().toISOString(),
    });
    didLock = true;
  });

  if (!didLock) return;

  let createdHash = null;
  try {
    const name = `chotu_${uid.slice(0, 8)}_${Math.floor(Date.now() / 1000)}`;
    const limitUsd = requireEnv('OPENROUTER_CREDIT_LIMIT_USD');
    const { key, hash } = await createProvisionedKey(name, limitUsd, expiresAt);
    createdHash = hash;

    const secretRef = db.collection('users').doc(uid).collection('secrets').doc('openrouter');
    let shouldDisableCreatedKey = false;
    await db.runTransaction(async (t) => {
      const freshSnap = await t.get(subRef);
      const fresh = freshSnap.data();
      if (!fresh?.access?.managedKeys || fresh?.managedApiKey?.status !== 'provisioning') {
        shouldDisableCreatedKey = true;
        t.update(subRef, {
          'managedApiKey.status': 'pending_revocation',
          'managedApiKey.openrouterKeyHash': hash,
          'managedApiKey.provisionedAt': new Date().toISOString(),
        });
        return;
      }

      t.set(secretRef, { apiKey: key, createdAt: admin.firestore.FieldValue.serverTimestamp() });
      t.update(subRef, {
        'managedApiKey.status': 'active',
        'managedApiKey.openrouterKeyHash': hash,
        'managedApiKey.provisionedAt': new Date().toISOString(),
      });
    });

    if (shouldDisableCreatedKey) {
      try {
        await disableKey(hash);
        await subRef.update({
          'managedApiKey.status': 'disabled',
          'managedApiKey.provisionedAt': null,
        });
      } catch (disableError) {
        console.error(`[cron] created key after plan changed; queued revocation uid=${uid}:`, disableError);
      }
    }
  } catch (err) {
    console.error(`[cron] provision failed uid=${uid}:`, err);
    if (createdHash) {
      await disableKey(createdHash)
        .then(() => subRef.update({
          'managedApiKey.status': 'disabled',
          'managedApiKey.openrouterKeyHash': createdHash,
          'managedApiKey.provisionedAt': null,
        }))
        .catch((e) => {
          console.error('[cron] failed to disable orphaned key:', e);
          return subRef.update({
            'managedApiKey.status': 'pending_revocation',
            'managedApiKey.openrouterKeyHash': createdHash,
            'managedApiKey.provisionedAt': null,
          });
        });
    } else {
      await subRef.update({
        'managedApiKey.status': 'pending',
        'managedApiKey.provisionedAt': null,
      }).catch((e) => console.error('[cron] reset failed:', e));
    }
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!verifyCronSecret(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Chamber Cloud: renewals and lapses reach the hosted relay once a day (its grace covers the gap).
  // Separate from the keys below, and never stops them.
  if (process.env.CHAMBER_RAZORPAY_PLAN_ID) {
    await syncAllChambers().then(
      (result) => console.log('[cron] chamber cloud synced', result.synced),
      (err) => console.error('[cron] chamber cloud sync failed:', err.message),
    );
  }

  const db = getAdminDb();
  let processed = 0;

  // 1. Provision pending keys
  try {
    const pendingSnap = await db.collectionGroup('subscriptions')
      .where('managedApiKey.status', '==', 'pending')
      .limit(BATCH_LIMIT)
      .get();

    for (const doc of pendingSnap.docs) {
      const uid = doc.ref.parent.parent.id;
      try {
        await provisionKey(db, doc.ref, uid);
        processed++;
      } catch (err) {
        console.error(`[cron] pending uid=${uid}:`, err);
      }
    }
  } catch (err) {
    console.error('[cron] pending query failed:', err);
  }

  // 2. Revoke pending_revocation keys
  try {
    const revokeSnap = await db.collectionGroup('subscriptions')
      .where('managedApiKey.status', '==', 'pending_revocation')
      .limit(BATCH_LIMIT)
      .get();

    for (const doc of revokeSnap.docs) {
      const uid = doc.ref.parent.parent.id;
      const hash = doc.data()?.managedApiKey?.openrouterKeyHash;
      try {
        if (!hash) {
          console.warn(`[cron] revoke uid=${uid}: no hash, marking disabled`);
          await doc.ref.update({
            'managedApiKey.status': 'disabled',
            'managedApiKey.provisionedAt': null,
          });
          processed++;
          continue;
        }
        await disableKey(hash);
        await doc.ref.update({ 'managedApiKey.status': 'disabled' });
        processed++;
      } catch (err) {
        console.error(`[cron] revoke uid=${uid}:`, err);
      }
    }
  } catch (err) {
    console.error('[cron] revoke query failed:', err);
  }

  // 3b. Sync managed key credit limits (top-ups + monthly resets). Flag-driven so
  // it stays cheap; converges even if the webhook's immediate PATCH failed.
  try {
    const syncSnap = await db.collectionGroup('subscriptions')
      .where('managedApiKey.limitSyncPending', '==', true)
      .limit(BATCH_LIMIT)
      .get();

    for (const doc of syncSnap.docs) {
      const uid = doc.ref.parent.parent.id;
      const key = doc.data()?.managedApiKey || {};
      try {
        if (key.status !== 'active' || !key.openrouterKeyHash) {
          await doc.ref.set({ managedApiKey: { limitSyncPending: false } }, { merge: true });
          continue;
        }
        // The dollar limit lives in the server-only billing doc now; legacy
        // subscription documents still carry it until their next write.
        const privateSnap = await privateBillingRef(db, uid).get();
        const limit = upstreamLimitUsd({
          privateData: privateSnap.data(),
          subscriptionData: doc.data(),
          fallbackUsd: 0,
        });
        if (Number.isFinite(limit) && limit > 0) {
          await updateKeyLimit(key.openrouterKeyHash, limit);
        }
        await doc.ref.set({ managedApiKey: { limitSyncPending: false } }, { merge: true });
        processed++;
      } catch (err) {
        console.error(`[cron] limit-sync uid=${uid}:`, err);
      }
    }
  } catch (err) {
    console.error('[cron] limit-sync query failed:', err);
  }

  // 3. Reset stale provisioning locks
  try {
    const staleSnap = await db.collectionGroup('subscriptions')
      .where('managedApiKey.status', '==', 'provisioning')
      .limit(BATCH_LIMIT)
      .get();

    const cutoff = new Date(Date.now() - STALE_LOCK_MS).toISOString();
    for (const doc of staleSnap.docs) {
      const uid = doc.ref.parent.parent.id;
      const data = doc.data();
      const provisionedAt = data?.managedApiKey?.provisionedAt;
      if (provisionedAt && provisionedAt < cutoff) {
        try {
          await doc.ref.update({
            'managedApiKey.status': data?.access?.managedKeys ? 'pending' : 'disabled',
            'managedApiKey.provisionedAt': null,
          });
          processed++;
        } catch (err) {
          console.error(`[cron] stale-lock-reset uid=${uid}:`, err);
        }
      }
    }
  } catch (err) {
    console.error('[cron] stale-lock query failed:', err);
  }

  return res.status(200).json({ ok: true, processed });
}
