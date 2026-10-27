// Writes a page per public route with that route's own <head>.
//
// The site renders in the browser, so without this every address served the
// same index.html: a link to /root previewed as the home page, and a crawler
// that does not run JavaScript saw one title for the whole site. After the
// Vite build, this copies dist/index.html once per route in
// src/site/config/seo-routes.json, swapping in the route's title, description,
// canonical address, social card, hero preload and structured data.
// vercel.json serves dist/<route>/index.html for each of those addresses.
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const dist = path.join(root, 'dist');
const SITE = 'https://www.sankhyaailabs.com';
const routes = JSON.parse(fs.readFileSync(path.join(root, 'src/site/config/seo-routes.json'), 'utf8'));
const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');

const ORG = {
  '@type': 'Organization',
  '@id': `${SITE}/#org`,
  name: 'Sankhya AI Labs',
  alternateName: ['Sankhya', 'सांख्य'],
  description: 'An AI lab in India that builds decision models, agent memory and agents, and ships them as products.',
  url: `${SITE}/`,
  logo: `${SITE}/brand/sankhya-mark.png`,
  email: 'hello@sankhyaailabs.com',
  address: { '@type': 'PostalAddress', addressCountry: 'IN' },
  knowsAbout: ['Artificial intelligence', 'Decision models', 'Agent memory', 'AI agents', 'Computer use', 'Legal AI', 'AI tutoring'],
  sameAs: ['https://github.com/Sankhya-AI', 'https://github.com/tura-learn', 'https://huggingface.co/sankhya-aI', 'https://www.turalearn.com'],
};
const SITE_ENTITY = { '@type': 'WebSite', '@id': `${SITE}/#site`, name: 'Sankhya AI Labs', url: `${SITE}/`, inLanguage: 'en-IN', publisher: { '@id': `${SITE}/#org` } };
const by = { creator: { '@id': `${SITE}/#org` }, publisher: { '@id': `${SITE}/#org` } };
const macApp = (name, description, url, extra = {}) => ({
  '@type': 'SoftwareApplication', name, description, url, applicationCategory: 'DeveloperApplication', operatingSystem: 'macOS 13 or later',
  isAccessibleForFree: true, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, ...extra, ...by,
});
const code = (name, description, url, repository, extra = {}) => ({
  '@type': 'SoftwareSourceCode', name, description, url, codeRepository: repository, ...extra, ...by,
});

/** What each page is about, for search engines. */
const ENTITY = {
  '/': {
    '@type': 'ItemList',
    name: 'What Sankhya AI Labs makes',
    itemListElement: ['/manu', '/manu-s1', 'https://www.turalearn.com', '/root', '/root-driver', '/chamber', '/dhee', '/tura-s1'].map((href, index) => ({
      '@type': 'ListItem', position: index + 1, url: href.startsWith('http') ? href : `${SITE}${href}`,
    })),
  },
  '/manu': {
    '@type': 'SoftwareApplication', name: 'Manu', alternateName: 'Manu case diary', applicationCategory: 'BusinessApplication',
    applicationSubCategory: 'Legal case management', operatingSystem: 'Web', url: `${SITE}/manu`, image: `${SITE}/brand/manu-social-card.jpg`,
    description: routes['/manu'].description, audience: { '@type': 'Audience', audienceType: 'Advocates, law firms and judges in India' },
    areaServed: { '@type': 'Country', name: 'India' }, ...by,
  },
  '/manu-s1': code('Manu-S1', routes['/manu-s1'].description, `${SITE}/manu-s1`, 'https://huggingface.co/sankhya-aI/manu-s1-4b'),
  '/root': macApp('root', routes['/root'].description, `${SITE}/root`),
  '/root-driver': code('root-driver', routes['/root-driver'].description, `${SITE}/root-driver`, 'https://github.com/tura-learn/root-driver', { programmingLanguage: 'Swift', runtimePlatform: 'macOS' }),
  '/chamber': macApp('Chamber', routes['/chamber'].description, `${SITE}/chamber`, { sameAs: 'https://github.com/tura-learn/chamber', license: 'https://www.apache.org/licenses/LICENSE-2.0' }),
  '/dhee': code('Dhee', routes['/dhee'].description, `${SITE}/dhee`, 'https://github.com/tura-learn/Dhee', { programmingLanguage: 'Python' }),
  '/tura-s1': code('Tura-S1-4B', routes['/tura-s1'].description, `${SITE}/tura-s1`, 'https://huggingface.co/AshishDwi99/tura-s1-4b', { license: 'https://www.apache.org/licenses/LICENSE-2.0' }),
};

const escape = (text) => text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

function replaceTag(html, pattern, replacement, label) {
  if (!pattern.test(html)) throw new Error(`prerender-heads: index.html has no ${label}`);
  return html.replace(pattern, replacement);
}

function headFor(route, page) {
  const url = `${SITE}${route === '/' ? '/' : route}`;
  const image = `${SITE}${page.image}`;
  let html = template;
  html = replaceTag(html, /<title>[^<]*<\/title>/, `<title>${escape(page.title)}</title>`, 'title');
  const metas = [
    [/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${escape(page.description)}" />`],
    [/<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${url}" />`],
    [/<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${escape(page.title)}" />`],
    [/<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${escape(page.description)}" />`],
    [/<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${url}" />`],
    [/<meta property="og:image" content="[^"]*" \/>/, `<meta property="og:image" content="${image}" />`],
    [/<meta property="og:image:alt" content="[^"]*" \/>/, `<meta property="og:image:alt" content="${escape(page.imageAlt)}" />`],
    [/<meta name="twitter:title" content="[^"]*" \/>/, `<meta name="twitter:title" content="${escape(page.title)}" />`],
    [/<meta name="twitter:description" content="[^"]*" \/>/, `<meta name="twitter:description" content="${escape(page.description)}" />`],
    [/<meta name="twitter:image" content="[^"]*" \/>/, `<meta name="twitter:image" content="${image}" />`],
    [/<meta name="twitter:image:alt" content="[^"]*" \/>/, `<meta name="twitter:image:alt" content="${escape(page.imageAlt)}" />`],
  ];
  for (const [pattern, replacement] of metas) html = replaceTag(html, pattern, replacement, String(pattern));
  if (page.keywords) html = html.replace('</title>', `</title>\n    <meta name="keywords" content="${escape(page.keywords)}" />`);

  // The hero worth fetching early is the route's own; other pages preload nothing.
  html = replaceTag(html, /    <link rel="preload" href="\/art\/manu-terrace\.webp"[^>]*\/>\n/, '', 'hero preload');
  if (page.preload === '/art/manu-terrace.webp') {
    html = html.replace('</head>', '    <link rel="preload" href="/art/manu-terrace.webp" as="image" type="image/webp" imagesrcset="/art/manu-terrace-960.webp 960w, /art/manu-terrace.webp 1774w" imagesizes="100vw" fetchpriority="high" />\n  </head>');
  } else if (page.preload) {
    html = html.replace('</head>', `    <link rel="preload" href="${page.preload}" as="image" type="image/webp" fetchpriority="high" />\n  </head>`);
  }

  const graph = { '@context': 'https://schema.org', '@graph': [ORG, SITE_ENTITY, ENTITY[route]].filter(Boolean) };
  html = replaceTag(html, /<script type="application\/ld\+json">[\s\S]*?<\/script>/, `<script type="application/ld+json">${JSON.stringify(graph)}</script>`, 'JSON-LD');
  return html;
}

for (const [route, page] of Object.entries(routes)) {
  const file = route === '/' ? path.join(dist, 'index.html') : path.join(dist, route.slice(1), 'index.html');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, headFor(route, page));
  console.log(`prerender-heads: ${route} → ${path.relative(root, file)}`);
}
