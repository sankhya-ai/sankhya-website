// chamber.sankhyaailabs.com is Chamber's own address. Vercel serves the static index.html for "/"
// before any rewrite, so without this a link preview of chamber.sankhyaailabs.com would show the
// lab's title and card. On that host, "/" gets Chamber's prerendered page instead
// (the app then picks the route by hostname). Routing middleware, not a function.
export const config = { matcher: ['/'] };

export default function middleware(request) {
  const url = new URL(request.url);
  if (!url.hostname.startsWith('chamber.')) return undefined;
  return new Response(null, { headers: { 'x-middleware-rewrite': new URL('/chamber/index.html', url).toString() } });
}
