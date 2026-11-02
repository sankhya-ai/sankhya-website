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
 * Six paintings carry it (public/art/lab): the hero, Bengaluru behind the lab's
 * statement, India Gate, the Sea Link and the Taj Mahal beside the three groups
 * of products, and Jantar Mantar beside the results. Each bleeds off the page
 * and fades into the paper, so a section is a painting with words on it, not a
 * card with a picture in it. Every claim is true of what ships today.
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
  side: 'left' | 'right';
  kicker: string;
  title: ReactNode;
  art: { src: string; alt: string; caption: string; pos: string };
  items: readonly Item[];
};

const CHAPTERS: readonly Chapter[] = [
  {
    id: 'people',
    plate: 'I',
    side: 'right',
    kicker: 'For people',
    title: <>For the student with an exam, <em>and the advocate with a docket.</em></>,
    art: {
      src: '/art/lab/india-gate.webp',
      alt: 'Watercolour of India Gate at sunset under a saffron sun, with a faint AI chip and a bar chart drawn in the sky beside it',
      caption: 'India Gate, New Delhi',
      pos: '52%',
    },
    items: [
      { name: 'Manu', href: '/manu', line: 'A case diary for Indian courts. Give it a CNR; each morning it reads every new order and shows the words each line came from.' },
      { name: 'Tura', href: TURA_URL, line: 'A tutor that teaches from your own lecture notes, in the shape your past papers ask.' },
    ],
  },
  {
    id: 'agents',
    plate: 'II',
    side: 'left',
    kicker: 'Agents',
    title: <>Agents that use your Mac, <em>and ask your team.</em></>,
    art: {
      src: '/art/lab/sea-link.webp',
      alt: 'Watercolour of the Bandra–Worli Sea Link at dusk, a glass skyline beside it and translucent data panels showing a dotted map of India',
      caption: 'Bandra–Worli Sea Link, Mumbai',
      pos: '58%',
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
    side: 'right',
    kicker: 'Memory and models',
    title: <>Models that decide fast, <em>and a memory that keeps up.</em></>,
    art: {
      src: '/art/lab/taj-mahal.webp',
      alt: 'Watercolour of the Taj Mahal seen down its long reflecting pool, a thin line of data waves drifting across the sky',
      caption: 'The Taj Mahal, Agra',
      pos: '66%',
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
  { name: 'root', href: '/root' },
  { name: 'root-driver', href: '/root-driver' },
  { name: 'Chamber', href: 'https://chamber.sankhyaailabs.com' },
  { name: 'Dhee', href: '/dhee' },
  { name: 'Tura-S1', href: '/tura-s1' },
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
          <p className="lab-caption lab-hero__caption" aria-hidden="true">Mumbai, at sunset</p>
        </section>

        <section className="lab-statement" id="lab" aria-labelledby="lab-statement-title">
          <figure className="lab-statement__art">
            <img
              src="/art/lab/bengaluru.webp"
              srcSet="/art/lab/bengaluru-960.webp 960w, /art/lab/bengaluru.webp 1672w"
              sizes="100vw"
              alt="Watercolour of Bengaluru: the Vidhana Soudha among flame trees, a metro train crossing glass offices, and a faint network dome over the city"
              width="1672"
              height="941"
              loading="lazy"
              decoding="async"
            />
            <figcaption className="lab-caption">Bengaluru</figcaption>
          </figure>
          <div className="lab-statement__copy">
            <p className="lab-kicker" data-reveal>The lab</p>
            <h2 id="lab-statement-title" data-reveal>
              Made in India, <em>for India and the world.</em>
            </h2>
            <p data-reveal>
              We start from open base models and build everything above them: the decision models, the memory, the agents,
              the servers and the products. We begin with the courts, classrooms and codebases we know first, and we
              release what we can: our models have open weights, and Chamber is open source.
            </p>
            <ul className="lab-foundations" aria-label="What the lab runs on" data-reveal>
              {FOUNDATIONS.map((item) => (
                <li key={item.name}>
                  <b>{item.name}</b>
                  <span>{item.line}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <div id="products" className="lab-products">
          {CHAPTERS.map((chapter) => (
            <section
              key={chapter.id}
              className={`lab-chapter lab-chapter--${chapter.side}`}
              id={chapter.id}
              aria-labelledby={`lab-${chapter.id}-title`}
            >
              <figure className="lab-chapter__art" style={{ '--pos': chapter.art.pos } as CSSProperties} data-reveal>
                <img src={chapter.art.src} alt={chapter.art.alt} width="885" height="441" loading="lazy" decoding="async" />
                <figcaption className="lab-caption">Plate {chapter.plate} · {chapter.art.caption}</figcaption>
              </figure>
              <div className="lab-chapter__copy">
                <p className="lab-kicker" data-reveal>{chapter.kicker}</p>
                <h2 id={`lab-${chapter.id}-title`} data-reveal>{chapter.title}</h2>
                <ul className="lab-items">
                  {chapter.items.map((item) => (
                    <li key={item.name} data-reveal>
                      <SiteLink href={item.href}>
                        <b>
                          {item.name}
                          <ArrowUpRight size={16} strokeWidth={1.8} aria-hidden="true" />
                        </b>
                        <span>{item.line}</span>
                      </SiteLink>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          ))}
        </div>

        <section className="lab-results lab-chapter lab-chapter--right" id="results" aria-labelledby="lab-results-title">
          <figure className="lab-chapter__art" data-reveal>
            <img
              src="/art/lab/jantar-mantar.webp"
              alt="Watercolour of the red sandstone instruments of Jantar Mantar among trees, the arcs and phases of the moon drawn faintly in the sky"
              width="885"
              height="441"
              loading="lazy"
              decoding="async"
            />
            <figcaption className="lab-caption">Plate IV · Jantar Mantar</figcaption>
          </figure>
          <div className="lab-chapter__copy">
            <p className="lab-kicker" data-reveal>Results</p>
            <h2 id="lab-results-title" data-reveal>
              Measured on work <em>the models never saw.</em>
            </h2>
          </div>
          <div className="lab-results__numbers" data-reveal>
            <MetricsRow metrics={METRICS} label="Sankhya's models and memory in numbers" />
          </div>
        </section>

        <section className="lab-closing" aria-labelledby="lab-closing-title">
          <div className="lab-closing__sun" aria-hidden="true" />
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
