import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { Bell, CalendarDays, Check, FolderOpen, Scale, type LucideIcon } from 'lucide-react';
import { useLenis } from 'lenis/react';

/**
 * Four real screens from the demo court, captioned by what is on them.
 *
 * The caption's only job is to say what the reader is looking at. The three
 * lines under each one restate the description or name something printed on
 * the screen itself; none of them promises more than the screen shows.
 */
const PRODUCT_SCREENS = [
  {
    id: 'case',
    label: 'The case',
    icon: FolderOpen,
    tone: 'blue',
    title: 'Where it stands, and what comes next.',
    description: 'The stage the case has reached, the next hearing and what it is for, the last order in the court’s words, and what somebody has to do by when. Every line opens the order it came from.',
    details: ['The stage track, from FIR to judgment', 'The next hearing and the last order', 'Every line opens its source'],
    image: '/art/screens/manu-case.webp',
    alt: 'The case page for State v. Aamir Khan: the stage track at prosecution evidence, the next hearing on 5 October, directions to the IO and the custody meter',
  },
  {
    id: 'changes',
    label: 'What changed',
    icon: Bell,
    tone: 'terracotta',
    title: 'What moved overnight, case by case.',
    description: 'New orders, moved dates, directions found and status changes, each case folded to one line with the kinds of change on it. Open one to read the changes in full.',
    details: ['One line per case', 'The kinds of change at a glance', 'Each change with its source'],
    image: '/art/screens/manu-changes.webp',
    alt: 'Manu’s What changed screen: one folded card per case, with badges for a new order, a direction and a moved date',
  },
  {
    id: 'bail',
    label: 'Bail',
    icon: Scale,
    tone: 'saffron',
    title: 'The custody arithmetic, drawn.',
    description: 'Days in custody against the Section 479 line, default bail with its date, and the facts a bail hearing turns on. The working is one click away, and it never recommends an outcome.',
    details: ['Custody against the s.479 line', 'Default bail, with its date', 'Facts only, never a recommendation'],
    image: '/art/screens/manu-bail.webp',
    alt: 'The Bail tab for Aamir Khan: 361 days in custody, the s.479 threshold in four days, offences and bail facts as tiles',
  },
  {
    id: 'week',
    label: 'This week',
    icon: CalendarDays,
    tone: 'mint',
    title: 'Seven days at a glance.',
    description: 'A tile for each day with a mark for every hearing, direction due and liberty date. Pick a day to see it in full.',
    details: ['Hearings, directions and liberty dates', 'Every court you appear in', 'The day you pick, in full'],
    image: '/art/screens/manu-week.webp',
    alt: 'Manu’s This week screen: seven day tiles with marks for hearings and directions, and today’s five items below',
  },
] as const satisfies ReadonlyArray<{
  id: string;
  label: string;
  icon: LucideIcon;
  tone: 'blue' | 'terracotta' | 'olive' | 'saffron' | 'mint';
  title: string;
  description: string;
  details: readonly [string, string, string];
  image: string;
  alt: string;
}>;

/* Where the first card pins: the fixed header ends at 74px. Each later card
   pins a little lower, so the one it covers leaves its top edge showing. */
const STACK_TOP = 112;
const STACK_STEP = 14;
/* Space kept under a pinned card so its bullets never sit on the fold. */
const STACK_FOOT = 28;
const DESKTOP_QUERY = '(min-width: 1024px)';
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/** Two lines of roughly equal length, so a row of three reads as a row. */
function balance(text: string): [string, string | null] {
  const words = text.split(' ');
  if (words.length < 3) return [text, null];
  let best = 1;
  let bestDelta = Number.POSITIVE_INFINITY;
  for (let split = 1; split < words.length; split += 1) {
    const delta = Math.abs(words.slice(0, split).join(' ').length - words.slice(split).join(' ').length);
    if (delta < bestDelta) {
      bestDelta = delta;
      best = split;
    }
  }
  return [words.slice(0, best).join(' '), words.slice(best).join(' ')];
}

function useStacked() {
  const [stacked, setStacked] = useState(false);
  useEffect(() => {
    const desktop = window.matchMedia(DESKTOP_QUERY);
    const reduced = window.matchMedia(REDUCED_MOTION_QUERY);
    const update = () => setStacked(desktop.matches && !reduced.matches);
    update();
    desktop.addEventListener('change', update);
    reduced.addEventListener('change', update);
    return () => {
      desktop.removeEventListener('change', update);
      reduced.removeEventListener('change', update);
    };
  }, []);
  return stacked;
}

export function ProductTour() {
  const stacked = useStacked();
  const lenis = useLenis();
  const [activeIndex, setActiveIndex] = useState(0);
  const deckRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<Array<HTMLElement | null>>([]);
  const frameRefs = useRef<Array<HTMLDivElement | null>>([]);
  const scrollLock = useRef<number | null>(null);

  /* A pinned card reports where it is pinned, not where it sits in the page,
     so every scroll position is worked out from the deck's own top down. */
  const naturalTops = useCallback(() => {
    const deck = deckRef.current;
    if (!deck) return [];
    const gap = parseFloat(getComputedStyle(deck).rowGap) || 0;
    let top = deck.getBoundingClientRect().top + window.scrollY;
    return cardRefs.current.map((card) => {
      const current = top;
      top += (card?.offsetHeight ?? 0) + gap;
      return current;
    });
  }, []);

  /* Keep the rail centred on the screen, whatever height its buttons wrap to. */
  useLayoutEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const place = () => {
      rail.style.top = `calc(50vh - ${Math.round(rail.offsetHeight / 2)}px)`;
    };
    place();
    const observer = new ResizeObserver(place);
    observer.observe(rail);
    return () => observer.disconnect();
  }, []);

  /* Size each screenshot so its whole card fits under the header while pinned.
     What the frame gives up in height comes back as the tinted stage on its
     sides. Only the text above and below the frame is measured, so resizing
     the frame cannot feed back into the measurement. */
  useLayoutEffect(() => {
    const deck = deckRef.current;
    if (!deck) return;
    const fit = () => {
      cardRefs.current.forEach((card, index) => {
        const frame = frameRefs.current[index];
        if (!card || !frame) return;
        if (!stacked) {
          card.style.removeProperty('--frame-height');
          return;
        }
        const around = card.offsetHeight - frame.offsetHeight;
        const room = window.innerHeight - (STACK_TOP + index * STACK_STEP) - STACK_FOOT - around;
        card.style.setProperty('--frame-height', `${Math.max(220, Math.floor(room))}px`);
      });
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(deck);
    window.addEventListener('resize', fit);
    void document.fonts?.ready.then(fit);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', fit);
    };
  }, [stacked]);

  /* The active screen is the last one whose card has reached the middle of the
     screen. Read once a frame at most, and not at all while a rail click is
     still carrying the page to its card. */
  useEffect(() => {
    if (!stacked) return;
    let frame: number | null = null;
    const read = () => {
      frame = null;
      if (scrollLock.current !== null) return;
      const middle = window.scrollY + window.innerHeight * 0.5;
      let next = 0;
      naturalTops().forEach((top, index) => {
        if (top <= middle) next = index;
      });
      setActiveIndex((current) => (current === next ? current : next));
    };
    const schedule = () => {
      if (frame === null) frame = requestAnimationFrame(read);
    };
    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [stacked, naturalTops]);

  useEffect(() => () => {
    if (scrollLock.current !== null) window.clearTimeout(scrollLock.current);
  }, []);

  const goTo = (index: number) => {
    const top = naturalTops()[index];
    if (top === undefined) return;
    setActiveIndex(index);
    const target = top - (STACK_TOP + index * STACK_STEP);
    if (scrollLock.current !== null) window.clearTimeout(scrollLock.current);
    scrollLock.current = window.setTimeout(() => {
      scrollLock.current = null;
    }, 1100);
    if (lenis) lenis.scrollTo(target, { duration: 0.9 });
    else window.scrollTo({ top: target, behavior: 'smooth' });
  };

  return (
    <section className="product-tour" id="screens" aria-labelledby="product-tour-title">
      <div className="product-tour__inner">
        <header className="product-tour__header">
          <h2 id="product-tour-title">Screens from the product.</h2>
          <p>Four screens from Manu’s demo court, as Manu draws them.</p>
        </header>

        <div className="product-tour__body">
          <aside className="product-tour__aside">
            <nav ref={railRef} className="product-tour__rail" aria-label="Screens in the product">
              {PRODUCT_SCREENS.map((screen, index) => {
                const Icon = screen.icon;
                return (
                  <button
                    type="button"
                    key={screen.id}
                    className={`product-tour__rail-item tone-${screen.tone}`}
                    aria-current={activeIndex === index ? 'step' : undefined}
                    onClick={() => goTo(index)}
                  >
                    <Icon size={20} strokeWidth={1.8} aria-hidden="true" />
                    <span>{screen.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          <div ref={deckRef} className={`product-tour__deck${stacked ? ' is-stacked' : ''}`}>
            {PRODUCT_SCREENS.map((screen, index) => {
              const Icon = screen.icon;
              const style = { '--stack-top': `${STACK_TOP + index * STACK_STEP}px`, zIndex: index + 1 } as CSSProperties;
              return (
                <article
                  key={screen.id}
                  ref={(node) => { cardRefs.current[index] = node; }}
                  className={`product-tour__card tone-${screen.tone}`}
                  style={style}
                  aria-labelledby={`product-tour-${screen.id}`}
                >
                  <p className="product-tour__card-label">
                    <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
                    {screen.label}
                  </p>
                  <div className="product-tour__card-copy">
                    <h3 id={`product-tour-${screen.id}`}>{screen.title}</h3>
                    <p>{screen.description}</p>
                  </div>
                  <div className="product-tour__stage">
                    <div
                      ref={(node) => { frameRefs.current[index] = node; }}
                      className="product-tour__frame"
                    >
                      <img src={screen.image} alt={screen.alt} width="1800" height="1000" loading="lazy" decoding="async" />
                    </div>
                  </div>
                  <ul className="product-tour__details">
                    {screen.details.map((detail) => {
                      const [first, second] = balance(detail);
                      return (
                        <li key={detail}>
                          <Check size={16} strokeWidth={2.4} aria-hidden="true" />
                          <span>
                            {second === null ? first : <>{first} <br />{second}</>}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </article>
              );
            })}
            {stacked && <div className="product-tour__deck-end" aria-hidden="true" />}
          </div>
        </div>
      </div>
    </section>
  );
}
