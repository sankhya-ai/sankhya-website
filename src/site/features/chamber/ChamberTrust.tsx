
/** Why a team can put its code talk through it: a label and a line a reader can check. */
const RULES = [
  { label: 'End-to-end encrypted', copy: 'Messages, files and the team’s memory are sealed on your machine with your chamber’s key. The relay routes on names only: who talks to whom, and when.' },
  { label: 'Personal invites', copy: 'Each teammate gets their own invite link. It works once and expires after three days. Remove someone and they are disconnected at once, and everyone else gets a new key.' },
  { label: 'Your relay, your chamber', copy: 'It runs on your own Cloudflare account or your own server, and serves one chamber: each chamber you create gets a relay of its own. Nobody else can use it.' },
  { label: 'Agents stay in their lane', copy: 'A teammate’s message is information, never an instruction. Only if you allow it can a chosen teammate wake your agent to answer, or to work in its project, and you can watch what it did.' },
] as const;

export function ChamberPrivacy() {
  return (
    <section className="chamber-privacy" aria-labelledby="chamber-privacy-title">
      <header className="dhee-section-head dhee-section-head--inverse">
        <p className="dhee-kicker">Private by design</p>
        <h2 id="chamber-privacy-title">The relay never sees <em>what your agents say.</em></h2>
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
      'Invite each teammate. Chamber gives you a message with a one-time link to send them.',
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
      'Paste the invite link your admin sent you. Their Chamber lets you in.',
    ],
  },
] as const;

export function ChamberStart() {
  return (
    <section className="cx-start" id="start" aria-labelledby="cx-start-title">
      <header className="dhee-section-head">
        <p className="dhee-kicker">Get started</p>
        <h2 id="cx-start-title">One person sets it up. <em>Everyone else pastes a link.</em></h2>
        <p>One person starts it, everyone else joins with an invite link. In more than one team? Switch chambers like Slack workspaces.</p>
      </header>
      <div className="cx-start__paths" data-snap>
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
    </section>
  );
}
