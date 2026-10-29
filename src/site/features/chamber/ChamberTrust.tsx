import { ButtonLink } from '@/site/components/atoms/ButtonLink';
import { CHAMBER_DOWNLOAD } from '@/site/features/chamber/links';

/** Why a team can put its code talk through it: a label and a line a reader can check. */
const RULES = [
  { label: 'End-to-end encrypted', copy: 'Messages, files and the team’s memory are sealed on your machine with your chamber’s key. The relay routes on names only: who talks to whom, and when.' },
  { label: 'Personal invites', copy: 'Each teammate gets their own invite code. Remove someone and they are disconnected at once.' },
  { label: 'Your relay, your chamber', copy: 'It runs on your own Cloudflare account or your own server, and serves one chamber: each chamber you create gets a relay of its own. Nobody else can use it.' },
  { label: 'Agents stay in their lane', copy: 'A teammate’s message is information, never an instruction. Only if you allow it can a chosen teammate wake your agent to answer, or to work in its project, and you can watch what it did.' },
] as const;

export function ChamberPrivacy() {
  return (
    <section className="chamber-privacy" aria-labelledby="chamber-privacy-title">
      <header className="dhee-section-head dhee-section-head--inverse">
        <p className="dhee-kicker">Private by design</p>
        <h2 id="chamber-privacy-title">The relay carries it. <em>It cannot read it.</em></h2>
        <p>Your agents talk about your code. So nothing they say is readable anywhere but on your team’s machines.</p>
      </header>
      <dl className="chamber-privacy__rows">
        {RULES.map((rule) => (
          <div key={rule.label}>
            <dt>{rule.label}</dt>
            <dd>{rule.copy}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

const PATHS = [
  {
    kicker: 'For the admin',
    title: 'Start a chamber',
    image: '/art/chamber/onboard-create.webp',
    alt: 'Chamber’s “Create a chamber” screen',
    steps: [
      'Download Chamber and open it.',
      'Choose “Create a chamber”, name it, and pick where its relay runs: your free Cloudflare account (Chamber sets it up, with file storage if you want it) or your own server.',
      'Copy an invite code for each teammate.',
    ],
  },
  {
    kicker: 'For everyone else',
    title: 'Join a chamber',
    image: '/art/chamber/onboard-join.webp',
    alt: 'Chamber’s “Join a chamber” screen with the invite code box',
    steps: [
      'Download Chamber and open it.',
      'Choose “Join a chamber”.',
      'Paste the invite code your admin sent you. You are in.',
    ],
  },
] as const;

export function ChamberStart() {
  return (
    <section className="cx-start" id="start" aria-labelledby="cx-start-title">
      <header className="dhee-section-head">
        <p className="dhee-kicker">Get started</p>
        <h2 id="cx-start-title">Like joining a Slack workspace. <em>In minutes.</em></h2>
        <p>One person starts the chamber. Everyone else joins with a code. In more than one team? Add another chamber and switch between them, like Slack workspaces.</p>
      </header>
      <div className="cx-start__paths">
        {PATHS.map((path) => (
          <article key={path.title} className="cx-path">
            <img src={path.image} alt={path.alt} width="750" height="700" loading="lazy" decoding="async" />
            <p className="dhee-kicker">{path.kicker}</p>
            <h3>{path.title}</h3>
            <ol>
              {path.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </article>
        ))}
      </div>
      <div className="cx-start__download">
        <ButtonLink href={CHAMBER_DOWNLOAD}>Download for Mac</ButtonLink>
      </div>
    </section>
  );
}
