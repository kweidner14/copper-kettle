/**
 * In-place variant switching on the product page.
 *
 * Every option in the variant picker is a real link to the product URL with
 * that selection in the query string, and the server renders the matching
 * variant. That stays the source of truth, and with no JavaScript it is all
 * there is. This upgrades a click: fetch the same URL in the background, swap
 * the parts of the page that depend on the variant, and push the URL. No full
 * reload, no jump to the top of the page, no flash.
 *
 * The fetch starts on hover or focus, so by the time the click lands the page
 * is usually already here. Prefetched pages are only reused for a short while,
 * because stock is the one thing this page must not be wrong about.
 *
 * Anything unexpected (an error status, a page without the regions to swap)
 * falls back to ordinary navigation.
 */

const PICKER_LINK = '.variant-picker a[href]'
const REGIONS = ['.product__media', '.product__details']
/** How long a prefetched page may be reused, in ms. */
const FRESH_FOR = 15_000

const cache = new Map<string, { at: number; page: Promise<Document> }>()

function load(url: string): Promise<Document> {
  const hit = cache.get(url)
  if (hit && Date.now() - hit.at < FRESH_FOR) return hit.page

  const page = fetch(url, { headers: { Accept: 'text/html' } })
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return response.text()
    })
    .then((html) => new DOMParser().parseFromString(html, 'text/html'))
  // A failed prefetch must not be served to the click that follows it.
  page.catch(() => cache.delete(url))
  cache.set(url, { at: Date.now(), page })
  return page
}

function mainImageSrc(root: ParentNode): string | null {
  return root.querySelector<HTMLImageElement>('[data-gallery-main]')?.getAttribute('src') ?? null
}

async function swap(url: string, { push }: { push: boolean }): Promise<void> {
  const details = document.querySelector<HTMLElement>('.product__details')
  // Only dim the page if the answer is not already in hand.
  const slow = setTimeout(() => details?.classList.add('is-loading'), 120)

  try {
    const next = await load(url)
    if (!REGIONS.every((selector) => next.querySelector(selector))) throw new Error('No regions')

    // Remember which option had focus, to put it back on the same option in
    // the new markup. Keyboard users would otherwise be dropped to <body>.
    const focusedHref = (document.activeElement as HTMLAnchorElement | null)?.closest?.(PICKER_LINK)
      ? (document.activeElement as HTMLAnchorElement).getAttribute('href')
      : null
    const focusedLegend = (document.activeElement as HTMLElement | null)
      ?.closest('fieldset')
      ?.querySelector('legend')?.textContent

    for (const selector of REGIONS) {
      const current = document.querySelector(selector)
      const incoming = next.querySelector(selector)
      if (!current || !incoming) continue
      // Same image on both variants: leave the media alone, so the frame does
      // not repaint and a thumbnail the visitor picked stays picked.
      if (selector === '.product__media' && mainImageSrc(current) === mainImageSrc(incoming))
        continue
      current.replaceWith(document.importNode(incoming, true))
    }

    document.title = next.title
    if (push) history.pushState({ variantSwap: true }, '', url)

    if (focusedHref || focusedLegend) {
      const candidates = [...document.querySelectorAll<HTMLAnchorElement>(PICKER_LINK)]
      const target =
        candidates.find((link) => link.getAttribute('href') === focusedHref) ??
        candidates.find(
          (link) =>
            link.closest('fieldset')?.querySelector('legend')?.textContent === focusedLegend,
        )
      target?.focus({ preventScroll: true })
    }

    // The swapped price and stock line are what changed; say them.
    const status = document.getElementById('variant-status')
    if (status) {
      const price = document
        .querySelector('.product__price')
        ?.textContent?.replace(/\s+/g, ' ')
        .trim()
      const stock = document
        .querySelector('.product__stock')
        ?.textContent?.replace(/\s+/g, ' ')
        .trim()
      status.textContent = [price, stock].filter(Boolean).join('. ')
    }
  } catch {
    window.location.assign(url)
  } finally {
    clearTimeout(slow)
    document.querySelector('.product__details')?.classList.remove('is-loading')
  }
}

function pickerLink(event: Event): HTMLAnchorElement | null {
  const link = (event.target as Element | null)?.closest?.<HTMLAnchorElement>(PICKER_LINK)
  if (!link) return null
  const url = new URL(link.href, location.href)
  // Only same-page variant links; anything else navigates as normal.
  return url.origin === location.origin && url.pathname === location.pathname ? link : null
}

document.addEventListener('click', (event) => {
  // New tab, new window, download: leave the browser to it.
  if (event.defaultPrevented || event.button !== 0) return
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
  const link = pickerLink(event)
  if (!link) return
  event.preventDefault()
  if (link.getAttribute('aria-current') === 'true') return
  void swap(link.href, { push: true })
})

// Prefetch on intent. Pointer hover covers mouse and pen, focus covers the
// keyboard, and touchstart buys a phone the 100ms or so before the click.
for (const type of ['pointerover', 'focusin', 'touchstart'] as const) {
  document.addEventListener(
    type,
    (event) => {
      const link = pickerLink(event)
      if (link && link.getAttribute('aria-current') !== 'true') void load(link.href).catch(() => {})
    },
    { passive: true },
  )
}

// Back and forward between variants: swap again rather than leave a URL that
// does not match the page.
window.addEventListener('popstate', () => {
  void swap(location.href, { push: false })
})
