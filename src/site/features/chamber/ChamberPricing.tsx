import { ButtonLink } from '@/site/components/atoms/ButtonLink';
import { CHAMBER_CONTACT, CHAMBER_DOWNLOAD, CHAMBER_SELF_HOST } from '@/site/features/chamber/links';

/**
 * Three ways to run a chamber. The app is the same in all three and so is the privacy: messages
 * are sealed on each machine before they leave, so the relay only ever holds ciphertext.
 */
const PLANS = [
  {
    id: 'self-host',
    name: 'Self-hosted',
    price: 'Free',
    per: 'open source',
    lines: [
      'Your relay on your own Cloudflare account (the app sets it up), or on any Linux server or VM',
      'One command for a server: HTTPS, nightly backups, every message and file kept',
      'Or the Docker image, anywhere',
    ],
    cta: { label: 'How to self-host', href: CHAMBER_SELF_HOST, outline: true },
  },
  {
    id: 'cloud',
    name: 'Chamber Cloud',
    price: 'US$5',
    per: 'per teammate a month · ₹449',
    lines: [
      'We run the relay for you: nothing to set up, choose Chamber Cloud when you create a chamber',
      'Free for 7 days, no card. Then a seat for each teammate',
      'Change seats any time from the app',
    ],
    cta: { label: 'Start free', href: CHAMBER_DOWNLOAD },
    featured: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Let’s talk',
    per: 'for larger teams',
    lines: [
      'A dedicated relay in the region you choose, or on your own infrastructure with our help',
      'Invoices, annual billing and a support contact',
      'Help rolling Chamber out to your engineers and their agents',
    ],
    cta: { label: 'Contact us', href: CHAMBER_CONTACT, outline: true },
  },
] as const;

export function ChamberPricing() {
  return (
    <section className="cx-pricing" id="pricing" aria-labelledby="cx-pricing-title">
      <header className="dhee-section-head">
        <p className="dhee-kicker">Pricing</p>
        <h2 id="cx-pricing-title">Run it yourself, <em>or let us.</em></h2>
        <p>Every plan is end-to-end encrypted: the relay, wherever it runs, stores only ciphertext.</p>
      </header>
      <div className="cx-plans">
        {PLANS.map((plan) => (
          <article key={plan.id} id={plan.id === 'self-host' ? 'self-host' : undefined} className={`cx-plan${'featured' in plan ? ' is-featured' : ''}`}>
            <h3>{plan.name}</h3>
            <p className="cx-plan__price">{plan.price}<span>{plan.per}</span></p>
            <ul>
              {plan.lines.map((line) => <li key={line}>{line}</li>)}
            </ul>
            <ButtonLink href={plan.cta.href} tone={'outline' in plan.cta ? 'outline' : undefined} target={plan.cta.href.startsWith('http') && !plan.cta.href.endsWith('.dmg') ? '_blank' : undefined} rel="noopener noreferrer">
              {plan.cta.label}
            </ButtonLink>
          </article>
        ))}
      </div>
    </section>
  );
}
