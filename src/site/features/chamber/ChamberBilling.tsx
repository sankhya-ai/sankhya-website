import { useEffect, useMemo, useState } from 'react';
import { ChamberFooter, ChamberHeader } from '@/site/features/chamber/ChamberChrome';
import { CHAMBER_CONTACT } from '@/site/features/chamber/links';

/**
 * A chamber's billing on Chamber Cloud. The admin opens it from the app (Sidebar → "Choose a
 * plan"), with a link the admin key signed; nothing here needs an account. Checkout is Razorpay's;
 * when the admin comes back, the page asks Razorpay again and the relay lets the team in.
 */
type Plan = {
  trial: boolean;
  trialEnds: number;
  status: 'trial' | 'active' | 'cancelled' | 'enterprise';
  seats: number;
  members: number;
  access: boolean;
  paidUntil: number;
};

const SEAT_USD = 5;
const SEAT_INR = 449;
const DAY = 24 * 3600 * 1000;

async function call<T>(op: string, body: object): Promise<T> {
  const response = await fetch(`/api/web?op=${op}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Something went wrong. Try again.');
  return data as T;
}

const date = (ms: number) => new Date(ms).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });

export function ChamberBilling() {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const auth = useMemo(() => ({ line: params.get('line') || '', proof: params.get('proof') || '' }), [params]);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [seats, setSeats] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [checkout, setCheckout] = useState('');

  const load = async () => {
    setError('');
    try {
      const next = await call<Plan>('chamber-synced', auth);
      setPlan(next);
      setSeats(Math.max(next.members, next.seats, 1));
    } catch (e) {
      setError((e as Error).message);
    }
  };
  useEffect(() => {
    if (auth.line) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const subscribe = async () => {
    setBusy(true);
    setError('');
    try {
      const { url } = await call<{ url: string }>('chamber-subscribe', { ...auth, seats });
      setCheckout(url);
      window.open(url, '_blank', 'noopener');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const changeSeats = async () => {
    setBusy(true);
    setError('');
    try {
      await call('chamber-seats', { ...auth, seats });
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const paying = plan && (plan.status === 'active' || plan.status === 'enterprise');
  const daysLeft = plan ? Math.max(0, Math.ceil((plan.trialEnds - Date.now()) / DAY)) : 0;

  return (
    <div className="lab-tone dhee-page chamber-page">
      <ChamberHeader />
      <main className="cx-billing">
        <p className="dhee-kicker">Chamber Cloud</p>
        <h1>Your team’s plan</h1>

        {!auth.line ? (
          <p className="cx-billing__note">
            Open billing from the Chamber app: as your chamber’s admin, choose <strong>Choose a plan</strong> at the bottom of the sidebar.
            The link it opens proves it’s you, so there’s no account to sign in to.
          </p>
        ) : !plan && !error ? (
          <p className="cx-billing__note">Looking up your chamber…</p>
        ) : null}

        {plan ? (
          <div className="cx-billing__card">
            <dl>
              <div><dt>Status</dt><dd>{paying ? (plan.status === 'enterprise' ? 'Enterprise' : 'Active') : plan.trial ? `Free trial, ${daysLeft} day${daysLeft === 1 ? '' : 's'} left` : plan.status === 'trial' ? 'Trial ended' : 'Not active'}</dd></div>
              <div><dt>Teammates</dt><dd>{plan.members}</dd></div>
              {paying ? <div><dt>Seats</dt><dd>{plan.seats}</dd></div> : null}
              {paying && plan.paidUntil ? <div><dt>Paid until</dt><dd>{date(plan.paidUntil)}</dd></div> : plan.trial ? <div><dt>Trial ends</dt><dd>{date(plan.trialEnds)}</dd></div> : null}
            </dl>

            {plan.status !== 'enterprise' ? (
              <div className="cx-billing__seats">
                <label htmlFor="seats">Seats: one for each teammate</label>
                <div>
                  <input id="seats" type="number" min={Math.max(plan.members, 1)} max={500} value={seats} onChange={(e) => setSeats(Number(e.target.value))} />
                  <span>× US${SEAT_USD} (₹{SEAT_INR}) a month = <strong>₹{(seats * SEAT_INR).toLocaleString('en-IN')}</strong> a month</span>
                </div>
                {paying ? (
                  <button type="button" className="button-link button-link--ink" disabled={busy || seats === plan.seats} onClick={() => void changeSeats()}>
                    {busy ? 'Saving…' : 'Change seats'}
                  </button>
                ) : (
                  <button type="button" className="button-link button-link--ink" disabled={busy} onClick={() => void subscribe()}>
                    {busy ? 'Opening checkout…' : plan.trial ? 'Subscribe (first charge when the trial ends)' : 'Subscribe'}
                  </button>
                )}
              </div>
            ) : null}

            {checkout ? (
              <p className="cx-billing__note">
                Checkout opened in a new tab (<a href={checkout} target="_blank" rel="noopener noreferrer">open it again</a>). Paid?{' '}
                <button type="button" className="cx-billing__link" onClick={() => void load()}>Check again</button>: your team can connect as soon as it shows Active.
              </p>
            ) : null}
            <p className="cx-billing__fine">
              Charged in INR by Razorpay; cards from outside India are converted by your bank. Cancel any time from Razorpay’s email.
              Larger team? <a href={CHAMBER_CONTACT}>Talk to us about Enterprise</a>.
            </p>
          </div>
        ) : null}

        {error ? <p className="cx-billing__error" role="alert">{error}</p> : null}
      </main>
      <ChamberFooter />
    </div>
  );
}
