import { ReactLenis, useLenis } from 'lenis/react';
import Snap from 'lenis/snap';
import { useEffect, type ReactNode } from 'react';

/**
 * Every page of the site: smooth scrolling, and sections that settle into view. When you stop
 * scrolling near a section that fits on the screen, the page eases it into place, just below the
 * header; scroll on and it lets you go (proximity, not a trap). A section taller than the screen
 * is never a stop, so it scrolls freely. Off on touch screens, small windows and reduced motion.
 */
export function SitePage({ children }: { children: ReactNode }) {
  return (
    <ReactLenis root options={{ lerp: 0.085, smoothWheel: true }}>
      <SectionSnap />
      {children}
    </ReactLenis>
  );
}

/** What can be a stop: each section of a page, and the items of a long one (data-snap: a card, a step). */
const SECTIONS = 'main > section, main > header, main > div > section, [data-snap]';

/** Below the fixed header, with a little air: where a section's content starts once snapped. */
const AIR = 20;

/** The bottom of whatever is pinned to the top of the window (the site's header), or 0. */
function headerBottom() {
  let bottom = 0;
  for (const el of document.querySelectorAll<HTMLElement>('header, nav, [class*="nav"]')) {
    const style = getComputedStyle(el);
    if (style.position !== 'fixed' && style.position !== 'sticky') continue;
    const rect = el.getBoundingClientRect();
    if (rect.top < 40 && rect.height < 160 && rect.width > window.innerWidth / 2) bottom = Math.max(bottom, rect.bottom);
  }
  return bottom;
}

/** Where a section's content starts and ends (its children, not its padding or backdrop), in page coordinates. */
function contentBox(section: HTMLElement) {
  let top = Infinity;
  let bottom = -Infinity;
  for (const child of section.children) {
    // A painting or wash behind the section is its backdrop, not what you read.
    if (/absolute|fixed/.test(getComputedStyle(child).position)) continue;
    const rect = child.getBoundingClientRect();
    if (!rect.height) continue;
    top = Math.min(top, rect.top);
    bottom = Math.max(bottom, rect.bottom);
  }
  const own = section.getBoundingClientRect();
  const sectionTop = own.top + scrollY;
  const sectionBottom = own.bottom + scrollY;
  if (top === Infinity) return { top: sectionTop, bottom: sectionBottom, sectionTop, sectionBottom };
  return { top: top + scrollY, bottom: bottom + scrollY, sectionTop, sectionBottom };
}

function SectionSnap() {
  const lenis = useLenis();
  useEffect(() => {
    if (!lenis) return;
    const wanted = window.matchMedia('(min-width: 900px) and (min-height: 520px) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
    let snap: Snap | null = null;
    let frame = 0;

    const build = () => {
      snap?.destroy();
      snap = null;
      if (!wanted.matches) return;
      snap = new Snap(lenis, { type: 'proximity', distanceThreshold: '28%', duration: 0.6, debounce: 160 });
      const header = headerBottom();
      const candidates: { at: number; bottom: number }[] = [];
      for (const section of document.querySelectorAll<HTMLElement>(SECTIONS)) {
        const box = contentBox(section);
        // A full-window section (a painted hero) is a screen as it is: it stops at its own top.
        if (box.sectionBottom - box.sectionTop <= window.innerHeight + 4) {
          candidates.push({ at: box.sectionTop, bottom: box.sectionBottom });
          continue;
        }
        // The scroll position that shows this section from its top, its content just below the header.
        const at = Math.max(0, Math.min(box.sectionTop, box.top - header - AIR));
        // Only a section that fits on the screen is a stop: a taller one scrolls freely.
        if (box.bottom - at <= window.innerHeight + 4) candidates.push({ at, bottom: box.bottom });
      }
      // Top to bottom; a stop the one before already shows whole (a card right under its heading) is no stop.
      let shown = window.innerHeight;
      snap.add(0);
      for (const c of candidates.sort((x, y) => x.at - y.at)) {
        if (c.at <= 0 || c.bottom <= shown) continue;
        snap.add(Math.round(c.at));
        shown = c.at + window.innerHeight;
      }
    };
    const rebuild = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(build);
    };

    rebuild();
    // Images and fonts loading, the window resizing, a FAQ opening: positions move, so find them again.
    const observer = new ResizeObserver(rebuild);
    observer.observe(document.body);
    wanted.addEventListener('change', rebuild);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      wanted.removeEventListener('change', rebuild);
      snap?.destroy();
    };
  }, [lenis]);
  return null;
}
