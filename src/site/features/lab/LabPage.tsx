import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { Link } from 'react-router';

import { MetricsRow, type Metric } from '@/site/components/molecules/MetricsRow';
import { SiteFooter } from '@/site/components/organisms/SiteFooter';
import { SiteHeader } from '@/site/components/organisms/SiteHeader';
import { CONTACT_EMAIL } from '@/site/config/site';
import { isExternal, TURA_URL } from '@/site/config/products';
import '@/site/features/lab/lab.css';

/**
 * Sankhya AI Labs' home: watercolour on paper.
 *
 * Six paintings carry it (public/art/lab) on Tura's paper and its four pastels
 * (sky blue, rose, sage, sand), one tone to a section, and no two sections hang them the
 * same way: the hero is the whole painting with words on its sky; Bengaluru
 * carries the lab's statement as cards on a grid over it (Tura's How it works); India Gate, the Sea Link and the
 * Taj Mahal carry the three groups of products the same way, each with its
 * cards in a different place; Jantar Mantar is a framed plate beside
 * the results. Every painting is shown whole, never cropped, and carries no caption.
 * Every claim is true of what ships today.
 */

function SiteLink({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  return isExternal(href) ? (
    <a className={className} href={href} target="_blank" rel="noopener">{children}</a>
  ) : (
    <Link className={className} to={href}>{children}</Link>
  );
}

type Item = { name: string; href: string; line: string };
type Chapter = {
  id: string;
  plate: string;
  kicker: string;
  title: ReactNode;
  art: { src: string; alt: string; caption: string };
  items: readonly Item[];
};

const CHAPTERS: readonly Chapter[] = [
  {
    id: 'people',
    plate: 'I',
    kicker: 'For people',
    title: <>For the student with an exam, <em>and the advocate with a docket.</em></>,
    art: {
      src: '/art/lab/india-gate.webp',
      alt: 'Watercolour of India Gate at sunset under a saffron sun, with a faint AI chip and a bar chart drawn in the sky beside it',
      caption: 'India Gate, New Delhi',
    },
    items: [
      { name: 'Manu', href: '/manu', line: 'A case diary for Indian courts. Give it a CNR; each morning it reads every new order and shows the words each line came from.' },
      { name: 'Tura', href: TURA_URL, line: 'A tutor that teaches from your own lecture notes, in the shape your past papers ask.' },
    ],
  },
  {
    id: 'agents',
    plate: 'II',
    kicker: 'Agents',
    title: <>Agents that use your Mac, <em>and ask your team.</em></>,
    art: {
      src: '/art/lab/sea-link.webp',
      alt: 'Watercolour of the Bandra–Worli Sea Link at dusk, a glass skyline beside it and translucent data panels showing a dotted map of India',
      caption: 'Bandra–Worli Sea Link, Mumbai',
    },
    items: [
      { name: 'root', href: '/root', line: 'The coding agent our team works in. Any model, every turn undoable, free for the Mac.' },
      { name: 'root-driver', href: '/root-driver', line: 'Lets any agent use your Mac’s apps in the background, so the cursor stays yours.' },
      { name: 'Chamber', href: 'https://chamber.sankhyaailabs.com', line: 'Your agent asks a teammate’s agent and gets the answer back. Open source.' },
    ],
  },
  {
    id: 'models',
    plate: 'III',
    kicker: 'Memory and models',
    title: <>Models that decide fast, <em>and a memory that keeps up.</em></>,
    art: {
      src: '/art/lab/taj-mahal.webp',
      alt: 'Watercolour of the Taj Mahal seen down its long reflecting pool, a thin line of data waves drifting across the sky',
      caption: 'The Taj Mahal, Agra',
    },
    items: [
      { name: 'Dhee', href: '/dhee', line: 'What a student knows in Tura, what a codebase expects in root. Kept as typed facts, replaced when they change.' },
      { name: 'Tura-S1', href: '/tura-s1', line: 'A 4B model that picks an agent’s next step in one forward pass. Open weights.' },
      { name: 'Manu-S1', href: '/manu-s1', line: 'Court procedure, trained from Tura-S1. Open weights.' },
    ],
  },
];

const FOUNDATIONS: readonly { name: string; line: string }[] = [
  { name: 'Our own servers', line: 'Tura, its study sessions and every student’s library run on machines we operate.' },
  { name: 'Training runs', line: 'Fine-tunes on GPUs we rent by the hour, from data we label ourselves.' },
  { name: 'Held-out evaluations', line: 'Built from real work: Tura’s agent decisions, High Court orders, a real trial file.' },
  { name: 'Native apps', line: 'root, Chamber and root-driver ship as signed Mac apps.' },
];

const METRICS: readonly Metric[] = [
  { value: 98.5, decimals: 1, suffix: '%', label: 'Tura-S1, agent steps', note: 'Which tool next, or reply, on decisions it never saw. Its base model: 49.6%.' },
  { value: 91.8, decimals: 1, suffix: '%', label: 'Manu-S1, court orders', note: 'On 2,346 High Court orders it never saw.' },
  { value: 99.4, decimals: 1, suffix: '%', label: 'Dhee, recall', note: 'R@5 on LongMemEval, the long-memory benchmark.' },
  { value: 64, decimals: 0, suffix: ' ms', label: 'Manu-S1, one decision', note: 'Median, on one NVIDIA L40S.' },
];

const HERO_NAV: readonly { name: string; href: string }[] = [
  { name: 'Manu', href: '/manu' },
  { name: 'Tura', href: TURA_URL },
  { name: 'root', href: '/root' },
  { name: 'root-driver', href: '/root-driver' },
  { name: 'Chamber', href: 'https://chamber.sankhyaailabs.com' },
  { name: 'Dhee', href: '/dhee' },
  { name: 'Tura-S1', href: '/tura-s1' },
  { name: 'Manu-S1', href: '/manu-s1' },
];

/**
 * Elements marked data-reveal ease in once as they scroll into view. The hidden
 * starting state only exists once this has run (class is-armed) and only for
 * visitors who haven't asked for reduced motion, so the prerendered page and a
 * page without scripts are fully readable.
 */
function useReveal() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    el.classList.add('is-armed');
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-in');
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.18, rootMargin: '0px 0px -6% 0px' },
    );
    el.querySelectorAll('[data-reveal]').forEach((node) => observer.observe(node));
    return () => {
      observer.disconnect();
      el.classList.remove('is-armed');
    };
  }, []);
  return root;
}

type Painting = { src: string; srcSet?: string; alt: string; width: number; height: number };
type GridCard = { key: string; step?: string; name: string; line: string; href?: string };

/**
 * Tura's "How it works" component (turalearn.com): a painting at its own
 * proportions (never cropped) under a faint grid, with an intro card and
 * cards placed on the grid. `layout` picks where the cards sit, so no two
 * sections hang the same way; below 1200px the painting sits on top and the
 * cards follow it.
 */
function PaintedGrid({ id, layout, painting, kicker, title, titleId, text, cards }: {
  id: string;
  layout: string;
  painting: Painting;
  kicker: string;
  title: ReactNode;
  titleId: string;
  text?: ReactNode;
  cards: readonly GridCard[];
}) {
  return (
    <section
      className={`lab-grid lab-grid--${layout}`}
      id={id}
      aria-labelledby={titleId}
      style={{ '--ratio': painting.width / painting.height } as CSSProperties}
    >
      <img
        className="lab-grid__painting"
        src={painting.src}
        srcSet={painting.srcSet}
        sizes={painting.srcSet ? '100vw' : undefined}
        alt={painting.alt}
        width={painting.width}
        height={painting.height}
        loading="lazy"
        decoding="async"
      />
      <div className="lab-grid__wash" aria-hidden="true" />
      <div className="lab-grid__grid">
        <header className="lab-grid__intro">
          <p className="lab-kicker">{kicker}</p>
          <h2 id={titleId}>{title}</h2>
          {text ? <p>{text}</p> : null}
        </header>
        {cards.map((card, index) => {
          const body = (
            <>
              {card.step ? <span className="lab-grid__step">{card.step}</span> : null}
              <h3>
                {card.name}
                {card.href ? <ArrowUpRight size={16} strokeWidth={1.8} aria-hidden="true" /> : null}
              </h3>
              <p>{card.line}</p>
            </>
          );
          const className = `lab-grid__card lab-grid__card--${index + 1}`;
          return card.href ? (
            <SiteLink key={card.key} href={card.href} className={className}>{body}</SiteLink>
          ) : (
            <article key={card.key} className={className}>{body}</article>
          );
        })}
      </div>
    </section>
  );
}

export function LabPage() {
  const root = useReveal();
  return (
    <div className="lab-tone lab-page" id="top" ref={root}>
      <SiteHeader />
      <main>
        <section className="lab-hero" aria-labelledby="lab-hero-title">
          <figure className="lab-hero__art">
            <img
              src="/art/lab/hero.webp"
              srcSet="/art/lab/hero-960.webp 960w, /art/lab/hero.webp 1774w"
              sizes="100vw"
              alt="Watercolour of Mumbai’s sea front at sunset: a saffron sun over the water, the Gateway of India far off, and a glass skyline above the promenade"
              width="1774"
              height="887"
              fetchPriority="high"
            />
          </figure>
          <div className="lab-hero__copy">
            <p className="lab-kicker">Sankhya AI Labs · India</p>
            <h1 id="lab-hero-title">
              We build AI from the model up, <em>here in India.</em>
            </h1>
            <p className="lab-hero__lede">
              Our own models, memory and agents, on servers we run. Today they work as a tutor for students and a case
              diary for Indian courts.
            </p>
            <a className="lab-hero__more" href="#lab">
              Read on <ArrowDown size={15} strokeWidth={1.8} aria-hidden="true" />
            </a>
          </div>
          <nav className="lab-hero__index" aria-label="Products">
            {HERO_NAV.map((product) => (
              <SiteLink key={product.name} href={product.href}>{product.name}</SiteLink>
            ))}
          </nav>
        </section>

        <PaintedGrid
          id="lab"
          layout="lab"
          painting={{
            src: '/art/lab/bengaluru.webp',
            srcSet: '/art/lab/bengaluru-960.webp 960w, /art/lab/bengaluru.webp 1672w',
            alt: 'Watercolour of Bengaluru: the Vidhana Soudha among flame trees, a metro train crossing glass offices, and a faint network dome over the city',
            width: 1672,
            height: 941,
          }}
          kicker="The lab"
          titleId="lab-statement-title"
          title={<>Made in India, <em>for India and the world.</em></>}
          text={
            <>
              We start from open base models and build everything above them: the decision models, the memory, the
              agents, the servers and the products. We release what we can: our models have open weights, and Chamber
              is open source.
            </>
          }
          cards={FOUNDATIONS.map((item, index) => ({ key: item.name, step: String(index + 1).padStart(2, '0'), name: item.name, line: item.line }))}
        />

        <section className="lab-products" id="products" aria-labelledby="lab-products-title">
          <div className="lab-products__head">
            <p className="lab-kicker" data-reveal>What we make</p>
            <h2 id="lab-products-title" data-reveal>
              Eight things, <em>one stack.</em>
            </h2>
            <p data-reveal>Two products people use every day, the agents our own team works in, and the models and memory under all of them.</p>
          </div>
        </section>
        {CHAPTERS.map((chapter, index) => (
          <PaintedGrid
            key={chapter.id}
            id={chapter.id}
            layout={chapter.id}
            painting={{ src: chapter.art.src, alt: chapter.art.alt, width: 885, height: 441 }}
            kicker={`${String(index + 1).padStart(2, '0')} · ${chapter.kicker}`}
            titleId={`lab-${chapter.id}-title`}
            title={chapter.title}
            cards={chapter.items.map((item) => ({ key: item.name, name: item.name, line: item.line, href: item.href }))}
          />
        ))}

        <section className="lab-results" id="results" aria-labelledby="lab-results-title">
          <div className="lab-results__grid">
            <div className="lab-results__card" data-reveal>
              <p className="lab-kicker">Results</p>
              <h2 id="lab-results-title">
                Measured on work <em>the models never saw.</em>
              </h2>
              <p>
                Every number is from a held-out set built from real work: agent decisions from Tura, orders from High
                Courts, and the long-memory benchmark everyone uses.
              </p>
            </div>
            <figure className="lab-plate" data-reveal>
              <img
                src="/art/lab/jantar-mantar.webp"
                alt="Watercolour of the red sandstone instruments of Jantar Mantar among trees, the arcs and phases of the moon drawn faintly in the sky"
                width="885"
                height="441"
                loading="lazy"
                decoding="async"
              />
            </figure>
          </div>
          <div className="lab-results__numbers" data-reveal>
            <MetricsRow metrics={METRICS} label="Sankhya's models and memory in numbers" />
          </div>
        </section>

        <section className="lab-closing" aria-labelledby="lab-closing-title">
          <div className="lab-closing__copy">
            <p className="lab-kicker" data-reveal>Contact</p>
            <h2 id="lab-closing-title" data-reveal>Write to the lab.</h2>
            <p data-reveal>About a model, a repository, or putting one of our products to work where you are.</p>
            <a className="lab-mail" href={`mailto:${CONTACT_EMAIL}`} data-reveal>
              {CONTACT_EMAIL}
              <ArrowUpRight size={16} strokeWidth={1.8} aria-hidden="true" />
            </a>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
