import { lazy, Suspense, useEffect, useRef } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router';
import { Analytics } from '@vercel/analytics/react';
import { ReactLenis } from 'lenis/react';
// The public site's faces and sheet (Tura's design): Baloo 2 for the wordmark,
// Averia Serif Libre for display, Roboto Flex for everything else.
import '@fontsource/baloo-2/700.css';
import '@fontsource/averia-serif-libre/latin-300.css';
import '@fontsource/averia-serif-libre/latin-300-italic.css';
import '@fontsource-variable/roboto-flex/wght.css';
import '@/site/styles/global.css';
import '@/site/styles/products.css';
import SEO_ROUTES from '@/site/config/seo-routes.json';

import { ChamberPage } from '@/site/features/chamber/ChamberPage';
import { DheePage } from '@/site/features/dhee/DheePage';
import { LabPage } from '@/site/features/lab/LabPage';
import { MarketingPage } from '@/site/features/marketing/MarketingPage';
import { ModelPage } from '@/site/features/model/ModelPage';
import { RootPage } from '@/site/features/root/RootPage';
import { RootDriverPage } from '@/site/features/root-driver/RootDriverPage';
import { TuraS1Page } from '@/site/features/tura-s1/TuraS1Page';

/**
 * Two halves in one deployment.
 *
 * The public site is Sankhya AI Labs: the lab at `/`, Manu at `/manu`, and a
 * page for each of the parts we make (`/root`, `/root-driver`, `/chamber`, `/dhee`, `/tura-s1`,
 * which moved here from turalearn.com). Tura itself lives on turalearn.com. The account
 * area (`/account/*`) and the privacy policy stay as they were: customers sign
 * in, pay and hand off to the desktop apps there, and the API behind them
 * (`api/`) is unchanged. The account half brings its own Tailwind sheet and is
 * loaded only when it is visited.
 */
const AccountApp = lazy(() => import('@/account/AccountApp').then((module) => ({ default: module.AccountApp })));

const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '[::1]']);

/** Each public page's title, description and card; also read at build by scripts/prerender-heads.mjs. */
const SEO = SEO_ROUTES as Record<string, { title: string; description: string; image: string; imageAlt: string; keywords?: string }>;
const SITE_URL = 'https://www.sankhyaailabs.com';

/** Chamber has its own address: chamber.sankhyaailabs.com. */
export const CHAMBER_SITE = 'https://chamber.sankhyaailabs.com';
const ON_CHAMBER = typeof window !== 'undefined' && window.location.hostname.startsWith('chamber.');

/** Sets one attribute on a head element, creating the element if the page has none. */
function setHead(selector: string, tag: 'meta' | 'link', identity: Record<string, string>, attribute: string, value: string) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement(tag);
    for (const [key, val] of Object.entries(identity)) element.setAttribute(key, val);
    document.head.appendChild(element);
  }
  element.setAttribute(attribute, value);
}

function meta(key: string, content: string, attribute: 'name' | 'property' = 'name') {
  setHead(`meta[${attribute}="${key}"]`, 'meta', { [attribute]: key }, 'content', content);
}

/** The head a crawler or a link preview reads, kept right as the page changes in the app. */
function applySeo(pathname: string) {
  const page = ON_CHAMBER ? SEO['/chamber'] : SEO[pathname] ?? SEO['/'];
  const url = ON_CHAMBER ? `${CHAMBER_SITE}${pathname}` : `${SITE_URL}${pathname === '/' ? '/' : pathname}`;
  document.title = page.title;
  meta('description', page.description);
  if (page.keywords) meta('keywords', page.keywords);
  setHead('link[rel="canonical"]', 'link', { rel: 'canonical' }, 'href', url);
  meta('og:title', page.title, 'property');
  meta('og:description', page.description, 'property');
  meta('og:url', url, 'property');
  meta('og:image', `${SITE_URL}${page.image}`, 'property');
  meta('og:image:alt', page.imageAlt, 'property');
  meta('twitter:title', page.title);
  meta('twitter:description', page.description);
  meta('twitter:image', `${SITE_URL}${page.image}`);
  meta('twitter:image:alt', page.imageAlt);
}

function isAccountPath(pathname: string) {
  return pathname === '/account' || pathname.startsWith('/account/') || pathname === '/privacy';
}

/**
 * The two halves style the page globally (Tailwind's reset on one side, the
 * site's sheet on the other), so moving between them inside the app would
 * leave both sheets applied. Crossing over is a fresh load instead.
 */
function useHalfBoundary(accountHalf: boolean) {
  const first = useRef(accountHalf);
  useEffect(() => {
    if (accountHalf !== first.current) window.location.reload();
  }, [accountHalf]);
}

/** A new page on the site starts at its top and says which page it is in the tab. */
function useSitePageChange(pathname: string, hash: string, active: boolean) {
  useEffect(() => {
    if (!active) return;
    applySeo(pathname);
    if (!hash) window.scrollTo(0, 0);
  }, [active, pathname, hash]);
}

function Opening() {
  return (
    <main style={{ display: 'grid', minHeight: '100vh', placeItems: 'center', background: '#f0ede6' }}>
      <img src="/assets/sankhya-logo.png" alt="" width="36" height="36" />
    </main>
  );
}

function App() {
  const { pathname, hash } = useLocation();
  const accountHalf = isAccountPath(pathname);
  useHalfBoundary(accountHalf);
  useSitePageChange(pathname, hash, !accountHalf);

  return (
    <>
      {ON_CHAMBER ? (
        <Routes>
          <Route path="/" element={<ReactLenis root options={{ lerp: 0.085, smoothWheel: true }}><ChamberPage /></ReactLenis>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      ) : accountHalf ? (
        <Suspense fallback={<Opening />}>
          <AccountApp />
        </Suspense>
      ) : (
        <Routes>
          <Route path="/manu-s1" element={<ReactLenis root options={{ lerp: 0.085, smoothWheel: true }}><ModelPage /></ReactLenis>} />
          <Route path="/manu" element={<ReactLenis root options={{ lerp: 0.085, smoothWheel: true }}><MarketingPage /></ReactLenis>} />
          <Route path="/root" element={<ReactLenis root options={{ lerp: 0.085, smoothWheel: true }}><RootPage /></ReactLenis>} />
          <Route path="/root-driver" element={<ReactLenis root options={{ lerp: 0.085, smoothWheel: true }}><RootDriverPage /></ReactLenis>} />
          <Route path="/dhee" element={<ReactLenis root options={{ lerp: 0.085, smoothWheel: true }}><DheePage /></ReactLenis>} />
          <Route path="/tura-s1" element={<ReactLenis root options={{ lerp: 0.085, smoothWheel: true }}><TuraS1Page /></ReactLenis>} />
          <Route path="/" element={<ReactLenis root options={{ lerp: 0.085, smoothWheel: true }}><LabPage /></ReactLenis>} />
          {/* The old product and blog pages are gone; their addresses land on the home page. */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
      {LOCAL_HOSTNAMES.has(window.location.hostname) ? null : <Analytics />}
    </>
  );
}

export default App;
