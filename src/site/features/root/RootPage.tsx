import type { ReactNode } from 'react';

import { ButtonLink } from '@/site/components/atoms/ButtonLink';
import { SiteFooter } from '@/site/components/organisms/SiteFooter';
import { SiteHeader } from '@/site/components/organisms/SiteHeader';
import { ROOT_DOWNLOAD } from '@/site/features/root/links';
import { JevScreen, LearningScreen, MemoryScreen, RootAppScreen } from '@/site/features/root/RootScreens';

/**
 * root, the coding agent our team works in, free for the Mac.
 *
 * Kept as plain as Qwen Code's page: what it is, why it is different, how to
 * start. What makes it different is what we built it around: Jev, which picks
 * every step so smaller models stop dropping long tasks; Dhee, typed memory as
 * its spine rather than a notes file; and a loop that learns from its own work
 * and keeps only what keeps helping. The screens are root's own (RootScreens),
 * and every line on them is something root really does.
 */
const ALSO = [
  ['Undo any turn', 'root snapshots your files before each turn. One click puts them back, and the undo can be undone.'],
  ['Asks before it acts', 'Edits and commands wait for your yes unless you say otherwise. Outside the folder you opened, it always asks.'],
  ['Installs what a task needs', 'Need pandas or a PDF library? root installs it into its own Python, never your system or project, and hands you the file it made.'],
  ['Reads your documents', 'PDF, Word, Excel and PowerPoint. It edits spreadsheets and PDFs too.'],
  ['GitHub and Gmail', 'Issues, pull requests, reviews and checks; your mail, with replies left as drafts. Anything it would write waits for you.'],
  ['Schedules', 'Prompts it runs by itself: a nightly test run, a morning summary of open pull requests.'],
] as const;

const STEPS = [
  ['Download root', 'Open the disk image and drag root to Applications.'],
  ['Add your OpenRouter key', 'Settings → Model. Make a key at openrouter.ai/keys and pick a model.'],
  ['Open a folder and ask', 'Choose a project and say what you want done. root asks before it changes anything.'],
] as const;

const QUESTIONS = [
  ['Is root really free?', 'Yes. The app is free to download and use, with no account and no login. You pay OpenRouter for the model tokens you use, at their prices; nothing comes to us.'],
  ['Which models work best?', 'Frontier models do the most on their own, and root is at its best with them. Where it changes things is on smaller, cheaper models that write good code but stumble over tool calls on a long task: with Jev choosing each step and Dhee remembering the project, they finish work they would otherwise drop.'],
  ['What is Jev?', 'A decision model. Before every step it scores the options — answer now, or which tool to call next — and the agent takes that step. The model you chose writes the code; Jev keeps the task moving. It runs through OpenRouter on your same key.'],
  ['How is Dhee different from a memory file?', 'A memory file is text an agent appends to and rereads. Dhee keeps typed memories — a decision, a convention, a command, a preference — scoped to the project or to you, brings back the ones that matter for the request, and replaces a fact when it changes instead of piling the new one beside it. We build it, and Tura and root both run on it.'],
  ['How does it get better on its own?', 'After real work, a reviewer reads what root did and proposes a skill — a step-by-step playbook — and memories. You keep or discard them, or let root keep what passes its overfit check. Each skill is then measured on the turns that use it: a new version that does worse than the one it replaced is rolled back, and one that hurts is retired.'],
  ['Does my code leave my Mac?', 'root runs on your Mac. What the model needs to read goes to the model you chose, through OpenRouter, under your key. Web searches, if you leave them on, go to a search service. Nothing goes to us.'],
  ['Can it break things?', 'It asks before editing files or running commands unless you choose otherwise, never reaches outside the folder you opened without asking, and every turn can be undone.'],
  ['Which Macs does it run on?', 'Macs with Apple silicon on macOS 13 or later.'],
  ['Do you use it yourselves?', 'Every day. This is the coding agent our team works in, the same app you download.'],
] as const;

type Feature = { kicker: string; title: string; copy: ReactNode; points: string[]; screen: ReactNode };

const FEATURES: Feature[] = [
  {
    kicker: 'Jev',
    title: 'Jev picks every step.',
    copy: (
      <>
        Plenty of smaller models write good code and then lose the thread: a dozen tool calls in, they describe the work
        instead of doing it, or reach for the wrong tool. In root, Jev, a decision model, chooses before every step: call a
        tool, which one, or answer. The model does what it is good at, the code; Jev keeps the task moving to the end.
      </>
    ),
    points: ['A decision before every step, in well under a second', 'Broken tool arguments repaired, not thrown away', 'Long tasks finish on models that cost a fraction'],
    screen: <JevScreen />,
  },
  {
    kicker: 'Dhee',
    title: 'Memory is the spine.',
    copy: (
      <>
        Most coding agents remember through a Markdown file they append to. root was built on <a href="/dhee">Dhee</a> from
        the start: typed memory of your project’s conventions, commands and decisions, and of how you like to work. It comes
        back before every turn, is written after real work, and a fact said twice updates the first instead of piling up
        beside it.
      </>
    ),
    points: ['Typed: decisions, conventions, commands, preferences', 'Recalled before every turn, kept after real work', 'Per project, and yours across projects'],
    screen: <MemoryScreen />,
  },
  {
    kicker: 'Learning',
    title: 'It gets better as you use it.',
    copy: (
      <>
        After real work, root reviews what it did and turns it into a skill — a step-by-step playbook for next time — and
        into memories. You keep what is worth keeping. Then it keeps score: every skill is measured on the turns that use
        it, a version that does worse than the one before is rolled back, and one that hurts is retired.
      </>
    ),
    points: ['Skills written from its own finished work', 'Kept only while they keep helping', 'Checks you approve often stop needing a yes'],
    screen: <LearningScreen />,
  },
];

function Download() {
  return (
    <div className="dhee-hero__actions">
      <ButtonLink href={ROOT_DOWNLOAD} download>Download for Mac</ButtonLink>
    </div>
  );
}

function Hero() {
  return (
    <section className="chamber-hero root-hero" aria-labelledby="root-hero-title">
      <div className="dhee-hero__copy">
        <p className="dhee-hero__eyebrow"><span aria-hidden="true" />root · free for Mac, from Sankhya AI Labs</p>
        <h1 id="root-hero-title">The coding agent <em>we work in.</em></h1>
        <p>
          Bring your OpenRouter key, pick any model, and give it real work. root is at its best on frontier models,
          and it carries smaller, cheaper ones through long tasks they would otherwise drop.
        </p>
        <Download />
        <p className="root-hero__note">Free · no account · macOS 13+ on Apple silicon</p>
      </div>
      <div className="root-hero__app" data-snap>
        <RootAppScreen />
      </div>
    </section>
  );
}

function ModelSettings() {
  const rows = [
    ['Model', 'deepseek/deepseek-v4.1-flash'],
    ['Fallback models', 'qwen/qwen3-coder, z-ai/glm-4.6'],
    ['Provider preference', 'Fastest'],
    ['Jev step director', 'On'],
    ['Memory', 'OpenRouter'],
    ['API key', 'Saved (…4f2a)'],
  ];
  return (
    <figure className="root-settings">
      <figcaption>Settings · Model</figcaption>
      <dl>
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </figure>
  );
}

function Features() {
  const rows: Feature[] = [
    ...FEATURES,
    {
      kicker: 'Models',
      title: 'Your key. Any model.',
      copy: (
        <>
          Paste an OpenRouter key and choose any model that can call tools: a frontier model for the hardest work, a fast,
          cheap one for the rest, and fallbacks for when a provider is down. The key stays in your Mac’s Keychain. The agent
          never sees it, and there is no server of ours in between.
        </>
      ),
      points: ['Every tool-capable model on OpenRouter', 'Fallbacks when a model or provider is down', 'Your key in your Keychain, never on our servers'],
      screen: <ModelSettings />,
    },
  ];
  return (
    <section className="chamber-features" aria-labelledby="root-features-title">
      <header className="dhee-section-head">
        <p className="dhee-kicker">How it works</p>
        <h2 id="root-features-title">Bigger tasks from <em>smaller models.</em></h2>
        <p>What root was built around from the first line, and the one thing it leaves to you.</p>
      </header>
      <div className="chamber-features__list">
        {rows.map((feature, index) => (
          <article key={feature.title} className={`chamber-feature${index % 2 ? ' is-flipped' : ''}`} data-snap>
            <div className="chamber-feature__copy">
              <p className="chamber-feature__kicker">{feature.kicker}</p>
              <h3>{feature.title}</h3>
              <p>{feature.copy}</p>
              <ul>
                {feature.points.map((point) => <li key={point}>{point}</li>)}
              </ul>
            </div>
            {feature.screen}
          </article>
        ))}
      </div>
    </section>
  );
}

function Also() {
  return (
    <section className="root-also" aria-labelledby="root-also-title">
      <header className="dhee-section-head">
        <p className="dhee-kicker">In the box</p>
        <h2 id="root-also-title">Everything else <em>a coding agent needs.</em></h2>
      </header>
      <ul className="root-also__list">
        {ALSO.map(([title, copy]) => (
          <li key={title}>
            <strong>{title}</strong>
            <span>{copy}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Start() {
  return (
    <section className="root-start" id="start" aria-labelledby="root-start-title">
      <header className="dhee-section-head">
        <p className="dhee-kicker">Get started</p>
        <h2 id="root-start-title">Working in <em>two minutes.</em></h2>
      </header>
      <ol className="root-start__steps">
        {STEPS.map(([title, copy], index) => (
          <li key={title}>
            <span className="root-start__dot" aria-hidden="true">{index + 1}</span>
            <strong>{title}</strong>
            <span>{copy}</span>
          </li>
        ))}
      </ol>
      <Download />
    </section>
  );
}

export function RootPage() {
  return (
    <div className="lab-tone dhee-page chamber-page root-page" id="top">
      <SiteHeader />
      <main>
        <Hero />
        <Features />
        <Also />
        <Start />

        <section className="faq-section" id="questions">
          <header className="faq-section__heading">
            <p className="dhee-kicker">Questions</p>
            <h2>What people ask first.</h2>
          </header>
          <div className="faq-section__list">
            {QUESTIONS.map(([question, answer]) => (
              <details key={question}>
                <summary>{question} <i>+</i></summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="chamber-closing">
          <h2>Built for ourselves. <em>Free for you.</em></h2>
          <p>Download root, paste your OpenRouter key, and give it something real.</p>
          <div className="dhee-closing__actions">
            <ButtonLink href={ROOT_DOWNLOAD} download>Download for Mac</ButtonLink>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
