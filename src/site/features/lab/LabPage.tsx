import { ArrowUpRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';

import { ButtonLink } from '@/site/components/atoms/ButtonLink';
import { MetricsRow, type Metric } from '@/site/components/molecules/MetricsRow';
import { SiteFooter } from '@/site/components/organisms/SiteFooter';
import { SiteHeader } from '@/site/components/organisms/SiteHeader';
import { CONTACT_EMAIL } from '@/site/config/site';
import { isExternal, PRODUCTS, TURA_URL } from '@/site/config/products';
import { RootAppScreen } from '@/site/features/root/RootScreens';
import '@/site/features/lab/lab.css';

/**
 * Sankhya AI Labs' home, in Tura's paper and pastels.
 *
 * Kept as plain as block.xyz: one sentence about what the lab is, and the
 * products named under it. Then the case for "deep tech, our own stack" made
 * with the stack itself (each layer above the base model, and what we built
 * for it), the numbers the parts score, and the products as their own screens.
 * Every line is true of what ships today.
 */

function SiteLink({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  return isExternal(href) ? (
    <a className={className} href={href} target="_blank" rel="noopener">{children}</a>
  ) : (
    <Link className={className} to={href}>{children}</Link>
  );
}

type Tone = 'sand' | 'rose' | 'sage' | 'blue' | 'base';
type Layer = { tone: Tone; name: string; copy: string; items: ReadonlyArray<{ name: string; href?: string; line: string }> };

/** Top to bottom: what people use, down to what it all runs on. */
const STACK: readonly Layer[] = [
  {
    tone: 'sand',
    name: 'Products',
    copy: 'Where the work meets people.',
    items: [
      { name: 'Tura', href: TURA_URL, line: 'A tutor that teaches from a student’s own lecture notes, in the shape their past papers ask.' },
      { name: 'Manu', href: '/manu', line: 'A case diary for Indian courts. It follows a case by its CNR and reads every new order.' },
    ],
  },
  {
    tone: 'rose',
    name: 'Agents',
    copy: 'What does the work, and how agents reach apps and each other.',
    items: [
      { name: 'root', href: '/root', line: 'The coding agent our team works in. Any model, every turn undoable.' },
      { name: 'root-driver', href: '/root-driver', line: 'Lets any agent use a Mac’s apps in the background.' },
      { name: 'Chamber', href: '/chamber', line: 'An agent asks a teammate’s agent, and gets the answer back.' },
    ],
  },
  {
    tone: 'sage',
    name: 'Memory',
    copy: 'What an agent keeps between turns, typed, and replaced when it changes.',
    items: [{ name: 'Dhee', href: '/dhee', line: 'Remembers what a student knows in Tura, and a codebase’s conventions in root.' }],
  },
  {
    tone: 'blue',
    name: 'Models',
    copy: 'Small decision models, trained on the choices our own agents make.',
    items: [
      { name: 'Tura-S1-4B', href: '/tura-s1', line: 'Picks an agent’s next step in one forward pass. Open weights.' },
      { name: 'Manu-S1', href: '/manu-s1', line: 'Court procedure, trained from Tura-S1. Open weights.' },
    ],
  },
  {
    tone: 'base',
    name: 'Infrastructure',
    copy: 'What the layers above run on, and how we know they work.',
    items: [
      { name: 'Our own servers', line: 'Tura, its study sessions and every student’s library run on machines we operate.' },
      { name: 'Training runs', line: 'Fine-tunes on GPUs we rent by the hour, from data we label ourselves.' },
      { name: 'Held-out evaluations', line: 'Built from real work: Tura’s agent decisions, High Court orders, a real trial file.' },
      { name: 'Native apps', line: 'root, Chamber and root-driver ship as signed Mac apps.' },
    ],
  },
];

const METRICS: readonly Metric[] = [
  { value: 98.5, decimals: 1, suffix: '%', label: 'Tura-S1, agent steps', note: 'Which tool next, or reply, on decisions it never saw. Its base model: 49.6%.' },
  { value: 91.8, decimals: 1, suffix: '%', label: 'Manu-S1, court orders', note: 'On 2,346 High Court orders it never saw.' },
  { value: 99.4, decimals: 1, suffix: '%', label: 'Dhee, recall', note: 'R@5 on LongMemEval, the long-memory benchmark.' },
  { value: 64, decimals: 0, suffix: ' ms', label: 'Manu-S1, one decision', note: 'Median, on one NVIDIA L40S.' },
];

type Showcase = { tone: Tone; name: string; href: string; kicker: string; title: string; media: ReactNode; wide?: boolean };

const SHOWCASE: readonly Showcase[] = [
  {
    tone: 'sand',
    name: 'Tura',
    href: TURA_URL,
    kicker: 'Tura · for students',
    title: 'A tutor that works from the student’s own books and past papers.',
    media: <img src="/art/tura-course-interface.webp" alt="Tura's course screen: a module's topics in order, each with an explainer, a quiz, a video and questions" width="2880" height="1624" loading="lazy" decoding="async" />,
    wide: true,
  },
  {
    tone: 'rose',
    name: 'Manu',
    href: '/manu',
    kicker: 'Manu · for courts',
    title: 'A case diary that reads every new order, with the words each line came from.',
    media: <img src="/art/screens/manu-today.webp" alt="Manu's Today screen: the day's cause list and what changed in each case" width="1800" height="1000" loading="lazy" decoding="async" />,
  },
  {
    tone: 'blue',
    name: 'root',
    href: '/root',
    kicker: 'root · coding agent',
    title: 'The coding agent our team works in, free for the Mac.',
    media: <div className="lab-show__screen"><RootAppScreen /></div>,
  },
  {
    tone: 'sage',
    name: 'root-driver',
    href: '/root-driver',
    kicker: 'root-driver · computer use',
    title: 'Any agent can use your Mac’s apps while you keep your cursor.',
    media: <img className="lab-show__diagram" src="/art/root-driver/how-it-works-light.svg" alt="Any agent runs root-driver; one background RootDriver.app holds the macOS permissions and drives your apps" loading="lazy" decoding="async" />,
  },
  {
    tone: 'sand',
    name: 'Chamber',
    href: '/chamber',
    kicker: 'Chamber · open source',
    title: 'Your team’s coding agents ask and answer each other.',
    media: <img src="/art/chamber/app.webp" alt="The Chamber app: an inbox of conversations between agents" width="1800" height="1320" loading="lazy" decoding="async" />,
  },
];

function LayerItem({ name, href, line }: Layer['items'][number]) {
  const inner = (
    <>
      <b>
        {name}
        {href ? <ArrowUpRight size={13} strokeWidth={2} aria-hidden="true" /> : null}
      </b>
      <span>{line}</span>
    </>
  );
  return href ? <SiteLink href={href}>{inner}</SiteLink> : <div>{inner}</div>;
}

export function LabPage() {
  return (
    <div className="lab-tone lab-page" id="top">
      <SiteHeader />
      <main>
        <section className="lab-hero" aria-labelledby="lab-hero-title">
          <img
            className="lab-hero__painting"
            src="/art/tura-ai-research.webp"
            alt="A team at work under a pavilion roof hung with a lattice model, a town and a lake below, in ink and watercolour"
            width="1448"
            height="1086"
            fetchPriority="high"
          />
          <div className="lab-hero__wash" aria-hidden="true" />
          <div className="lab-hero__content">
            <p className="lab-kicker lab-hero__kicker">An AI lab in India</p>
            <h1 id="lab-hero-title">
              We build AI from the model up, <em>and ship it as products.</em>
            </h1>
            <p>
              Our own decision models, memory and agents, on servers we run, put to work in a tutor for students and a
              case diary for Indian courts.
            </p>
          </div>
          <nav className="lab-hero__products" aria-label="Products">
            {PRODUCTS.map((product) => (
              <SiteLink key={product.name} href={product.href}>{product.name}</SiteLink>
            ))}
          </nav>
        </section>

        <section className="lab-stack" id="stack" aria-labelledby="lab-stack-title">
          <div className="lab-stack__intro">
            <header className="lab-head lab-head--left">
              <p className="lab-kicker">The stack</p>
              <h2 id="lab-stack-title">Every layer above the base model <em>is ours.</em></h2>
              <p>
                We start from open base models and build the rest: the decision models, the memory, the agents, the
                servers, and the products people use.
              </p>
            </header>
            <figure className="lab-stack__art">
              <img src="/art/tura-ai-memory-infrastructure.webp" alt="Terraced buildings of glass and stone holding racks of servers, a team reading a plan on the path below" width="1448" height="1086" loading="lazy" decoding="async" />
            </figure>
          </div>

          <div className="lab-stack__body">
            <ol className="lab-stack__layers">
              {STACK.map((layer, index) => (
                <li key={layer.name} className={`lab-layer tone-${layer.tone}`}>
                  <div className="lab-layer__label">
                    <span>{String(STACK.length - index).padStart(2, '0')}</span>
                    <h3>{layer.name}</h3>
                    <p>{layer.copy}</p>
                  </div>
                  <ul className="lab-layer__items">
                    {layer.items.map((item) => (
                      <li key={item.name}><LayerItem {...item} /></li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="lab-results" aria-labelledby="lab-results-title">
          <header className="lab-head">
            <p className="lab-kicker">Results</p>
            <h2 id="lab-results-title">What the parts score <em>on work they never saw.</em></h2>
          </header>
          <MetricsRow metrics={METRICS} label="Sankhya's models and memory in numbers" />
        </section>

        <section className="lab-show" id="products" aria-labelledby="lab-show-title">
          <header className="lab-head">
            <p className="lab-kicker">Products</p>
            <h2 id="lab-show-title">What it looks like <em>when people use it.</em></h2>
          </header>
          <div className="lab-show__grid">
            {SHOWCASE.map((item) => (
              <SiteLink key={item.name} href={item.href} className={`lab-show__card tone-${item.tone}${item.wide ? ' is-wide' : ''}`}>
                <div className="lab-show__copy">
                  <p>{item.kicker}</p>
                  <h3>{item.title}</h3>
                </div>
                <div className="lab-show__frame">{item.media}</div>
                <span className="lab-show__go">
                  {isExternal(item.href) ? 'Open turalearn.com' : `See ${item.name}`}
                  <ArrowUpRight size={15} strokeWidth={1.8} aria-hidden="true" />
                </span>
              </SiteLink>
            ))}
          </div>
        </section>

        <section className="lab-closing" aria-labelledby="lab-closing-title">
          <img src="/art/tura-ai-systems.webp" alt="" aria-hidden="true" width="1448" height="1086" loading="lazy" decoding="async" />
          <div className="lab-closing__wash" aria-hidden="true" />
          <div className="lab-closing__copy">
            <h2 id="lab-closing-title">Write to the lab.</h2>
            <p>About a model, a repository, or putting one of our products to work where you are.</p>
            <ButtonLink href={`mailto:${CONTACT_EMAIL}`} tone="paper">{CONTACT_EMAIL}</ButtonLink>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
