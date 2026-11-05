import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
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
 * same way: the hero is the whole painting with words on its sky; the
 * products follow it directly; India Gate, the Sea Link and the
 * Taj Mahal head the three panels of a sideways accordion of products;
 * Jantar Mantar is a framed plate beside
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
  tone: 'rose' | 'blue' | 'sage';
  plate: string;
  kicker: string;
  title: ReactNode;
  art: { src: string; alt: string; caption: string };
  items: readonly Item[];
};

const CHAPTERS: readonly Chapter[] = [
  {
    id: 'people',
    tone: 'rose',
    plate: 'I',
    kicker: 'For people',
    title: <>For the student with an exam, the advocate with a docket, <em>and the builder with a goal.</em></>,
    art: {
      src: '/art/lab/india-gate.webp',
      alt: 'Watercolour of India Gate at sunset under a saffron sun, with a faint AI chip and a bar chart drawn in the sky beside it',
      caption: 'India Gate, New Delhi',
    },
    items: [
      { name: 'Manu', href: '/manu', line: 'A case diary for Indian courts. Give it a CNR; each morning it reads every new order and shows the words each line came from.' },
      { name: 'Tura', href: TURA_URL, line: 'A tutor that teaches from your own lecture notes, in the shape your past papers ask.' },
      { name: 'Skye', href: 'https://skye.sankhyaailabs.com', line: 'A software team you text. Send a goal on iMessage or Telegram; it plans, builds, reviews and sends the pull request.' },
    ],
  },
  {
    id: 'agents',
    tone: 'blue',
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
    tone: 'sage',
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

const METRICS: readonly Metric[] = [
  { value: 98.5, decimals: 1, suffix: '%', label: 'Tura-S1, agent steps', note: 'Which tool next, or reply, on decisions it never saw. Its base model: 49.6%.' },
  { value: 91.8, decimals: 1, suffix: '%', label: 'Manu-S1, court orders', note: 'On 2,346 High Court orders it never saw.' },
  { value: 99.4, decimals: 1, suffix: '%', label: 'Dhee, recall', note: 'R@5 on LongMemEval, the long-memory benchmark.' },
  { value: 64, decimals: 0, suffix: ' ms', label: 'Manu-S1, one decision', note: 'Median, on one NVIDIA L40S.' },
];

const HERO_NAV: readonly { name: string; href: string }[] = [
  { name: 'Manu', href: '/manu' },
  { name: 'Tura', href: TURA_URL },
  { name: 'Skye', href: 'https://skye.sankhyaailabs.com' },
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

/**
 * The products as a sideways accordion: one panel open (hover, click or focus
 * opens another), the rest narrow numbered strips. The open panel is its
 * painting, whole, with a faint grid over it and its heading and products
 * floating on it as cards, as the lab's grid does. On phones the panels stack, all
 * open. Every panel's words are in the page whether it is open or not.
 */
function ProductPanels() {
  const [open, setOpen] = useState(0);
  return (
    <div className="lab-panels">
      {CHAPTERS.map((chapter, index) => {
        const isOpen = index === open;
        const n = String(index + 1).padStart(2, '0');
        return (
          <article
            key={chapter.id}
            id={chapter.id}
            className={`lab-panel lab-panel--${chapter.tone}${isOpen ? ' is-open' : ''}`}
            aria-labelledby={`lab-${chapter.id}-title`}
            onMouseEnter={() => setOpen(index)}
          >
            <button
              type="button"
              className="lab-panel__tab"
              aria-expanded={isOpen}
              aria-controls={`lab-${chapter.id}-body`}
              onClick={() => setOpen(index)}
              onFocus={() => setOpen(index)}
            >
              <span className="lab-panel__n">{n}</span>
              <span className="lab-panel__label">{chapter.kicker}</span>
            </button>
            <div className="lab-panel__body" id={`lab-${chapter.id}-body`}>
              <img className="lab-panel__painting" src={chapter.art.src} alt={chapter.art.alt} width="885" height="441" loading="lazy" decoding="async" />
              <div className="lab-panel__float">
                <div className="lab-panel__head">
                  <p className="lab-kicker">{n} · {chapter.kicker}</p>
                  <h3 id={`lab-${chapter.id}-title`}>{chapter.title}</h3>
                </div>
                <ul className="lab-panel__cards" style={{ '--cols': chapter.items.length } as CSSProperties}>
                  {chapter.items.map((item) => (
                    <li key={item.name}>
                      <SiteLink href={item.href} className="lab-grid__card lab-panel__card">
                        <h3>
                          {item.name}
                          <ArrowUpRight size={16} strokeWidth={1.8} aria-hidden="true" />
                        </h3>
                        <p>{item.line}</p>
                      </SiteLink>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        );
      })}
    </div>
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
            <a className="lab-hero__more" href="#products">
              Read on <ArrowDown size={15} strokeWidth={1.8} aria-hidden="true" />
            </a>
          </div>
          <nav className="lab-hero__index" aria-label="Products">
            {HERO_NAV.map((product) => (
              <SiteLink key={product.name} href={product.href}>{product.name}</SiteLink>
            ))}
          </nav>
        </section>

        <section className="lab-products" id="products" aria-labelledby="lab-products-title">
          <div className="lab-products__head">
            <p className="lab-kicker" data-reveal>What we make</p>
            <h2 id="lab-products-title" data-reveal>
              Nine things, <em>one stack.</em>
            </h2>
            <p data-reveal>Two products people use every day, the agents our own team works in, and the models and memory under all of them.</p>
          </div>
          <ProductPanels />
        </section>

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
          <div className="lab-closing__frame">
          <img
            className="lab-closing__painting"
            src="/art/lab/bengaluru.webp"
            srcSet="/art/lab/bengaluru-960.webp 960w, /art/lab/bengaluru.webp 1672w"
            sizes="100vw"
            alt="Watercolour of Bengaluru: the Vidhana Soudha among flame trees, a metro train crossing glass offices, and a faint network dome over the city"
            width="1672"
            height="941"
            loading="lazy"
            decoding="async"
          />
          <div className="lab-closing__copy">
            <p className="lab-kicker" data-reveal>Contact</p>
            <h2 id="lab-closing-title" data-reveal>Write to the lab.</h2>
            <p data-reveal>About a model, a repository, or putting one of our products to work where you are.</p>
            <a className="lab-mail" href={`mailto:${CONTACT_EMAIL}`} data-reveal>
              {CONTACT_EMAIL}
              <ArrowUpRight size={16} strokeWidth={1.8} aria-hidden="true" />
            </a>
          </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
