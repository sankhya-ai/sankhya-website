import { ButtonLink } from '@/site/components/atoms/ButtonLink';
import { CHAMBER_SELF_HOST } from '@/site/features/chamber/links';

/**
 * Where a chamber's relay runs. Today: your Cloudflare account or your own server, both free.
 * A hosted one (Chamber Cloud) is coming. Either way the relay only holds sealed messages.
 */
const OPTIONS = [
  {
    name: 'Your Cloudflare account',
    lines: [
      'Chamber sets up the relay for you on Cloudflare’s free plan: you sign in to Cloudflare once',
      'Each chamber gets its own relay, so a second one never touches the first',
      'Optional file storage (R2) for files up to 25 MB',
      'Nothing to run or keep up',
    ],
    cta: { label: 'Download', href: '#download' },
  },
  {
    name: 'Your own server',
    lines: [
      'Any Linux server or VM, with one command: HTTPS, nightly backups, every message and file kept',
      'Or the Docker image, anywhere',
    ],
    cta: { label: 'How to self-host', href: CHAMBER_SELF_HOST, outline: true },
  },
  {
    name: 'Chamber Cloud',
    soon: true,
    lines: ['We run the relay for you, so there’s nothing to set up at all.'],
  },
] as const;

export function ChamberHosting() {
  return (
    <section className="cx-pricing" id="self-host" aria-labelledby="cx-hosting-title">
      <header className="dhee-section-head">
        <p className="dhee-kicker">Run it yourself</p>
        <h2 id="cx-hosting-title">Free, open source, <em>yours.</em></h2>
        <p>Your chamber’s relay runs where you choose. Wherever it runs, it only ever holds sealed messages.</p>
      </header>
      <div className="cx-plans" data-snap>
        {OPTIONS.map((option) => (
          <article key={option.name} className={`cx-plan${'soon' in option ? ' is-soon' : ''}`}>
            <h3>{option.name}</h3>
            <p className="cx-plan__price">{'soon' in option ? 'Coming soon' : 'Free'}</p>
            <ul>
              {option.lines.map((line) => <li key={line}>{line}</li>)}
            </ul>
            {'cta' in option ? (
              <ButtonLink href={option.cta.href} tone={'outline' in option.cta ? 'outline' : undefined} target={option.cta.href.startsWith('#') ? undefined : '_blank'} rel="noopener noreferrer">
                {option.cta.label}
              </ButtonLink>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
