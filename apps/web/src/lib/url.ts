/**
 * The public path of the current page: no trailing slash, no ".html".
 *
 * Prerendered pages are built with `build.format: 'file'`, so while they
 * render, Astro.url.pathname is the output file ("/about.html", "/index.html")
 * rather than the URL visitors use. SSR routes answer on both "/products" and
 * "/products/". Anything that compares or prints the current path (canonical
 * tags, the header's current-page marker) goes through this so all of those
 * forms agree on one URL.
 */
export function publicPath(pathname: string): string {
  const path = pathname
    .replace(/\.html$/, '')
    .replace(/\/index$/, '/')
    .replace(/(.)\/+$/, '$1')
  return path || '/'
}
