// Build-time only: each public page rendered to HTML, so a crawler or an AI
// engine that does not run JavaScript reads the page's words, not an empty
// <div id="root">. scripts/prerender-heads.mjs puts the result inside each
// route's index.html; in the browser, main.tsx then renders the app over it.
import type { ReactNode } from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';

import { AccountFooter, AccountHeader } from '@/account/AccountChrome';
import { SitePage } from '@/site/components/SitePage';
import { ChamberPage } from '@/site/features/chamber/ChamberPage';
import { DheePage } from '@/site/features/dhee/DheePage';
import { LabPage } from '@/site/features/lab/LabPage';
import { MarketingPage } from '@/site/features/marketing/MarketingPage';
import { ModelPage } from '@/site/features/model/ModelPage';
import { RootPage } from '@/site/features/root/RootPage';
import { RootDriverPage } from '@/site/features/root-driver/RootDriverPage';
import { TuraS1Page } from '@/site/features/tura-s1/TuraS1Page';
import { PrivacyPage } from '@/pages/PrivacyPage';

const PAGES: Record<string, () => ReactNode> = {
  '/': () => <SitePage><LabPage /></SitePage>,
  '/manu': () => <SitePage><MarketingPage /></SitePage>,
  '/manu-s1': () => <SitePage><ModelPage /></SitePage>,
  '/root': () => <SitePage><RootPage /></SitePage>,
  '/root-driver': () => <SitePage><RootDriverPage /></SitePage>,
  '/chamber': () => <SitePage><ChamberPage /></SitePage>,
  '/dhee': () => <SitePage><DheePage /></SitePage>,
  '/tura-s1': () => <SitePage><TuraS1Page /></SitePage>,
  // As AccountApp lays it out.
  '/privacy': () => (
    <div className="min-h-screen bg-cream">
      <AccountHeader />
      <PrivacyPage />
      <AccountFooter />
    </div>
  ),
};

/** The page's body HTML, or null for a route with no public page. */
export function render(route: string): string | null {
  const page = PAGES[route];
  if (!page) return null;
  // On chamber.sankhyaailabs.com the Chamber page is served at "/".
  const location = route === '/chamber' ? '/' : route;
  return renderToString(<StaticRouter location={location}>{page()}</StaticRouter>);
}
