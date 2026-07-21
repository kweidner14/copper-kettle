// Loads GA4 only after the first user interaction, not on page load, so
// analytics can never contend with LCP/other Core Web Vitals during the
// initial paint.
const GA4_ID = document.documentElement.dataset.ga4Id

if (GA4_ID) {
  const interactionEvents: Array<keyof DocumentEventMap> = [
    'scroll',
    'mousemove',
    'keydown',
    'touchstart',
  ]

  let loaded = false

  const loadGa4 = () => {
    if (loaded) return
    loaded = true

    interactionEvents.forEach((event) => document.removeEventListener(event, loadGa4))

    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`
    document.head.appendChild(script)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any
    w.dataLayer = w.dataLayer || []
    function gtag(...args: unknown[]) {
      w.dataLayer.push(args)
    }
    w.gtag = gtag
    gtag('js', new Date())
    gtag('config', GA4_ID)
  }

  interactionEvents.forEach((event) =>
    document.addEventListener(event, loadGa4, { once: true, passive: true }),
  )
}
