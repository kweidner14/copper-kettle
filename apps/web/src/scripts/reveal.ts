// Scroll-reveal via IntersectionObserver + [data-reveal] attribute.
// Only ever animates opacity/transform (see [data-reveal] rules in
// global.scss) so this can never introduce layout shift (CLS).
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

const revealElements = document.querySelectorAll<HTMLElement>('[data-reveal]')

if (prefersReducedMotion || !('IntersectionObserver' in window)) {
  revealElements.forEach((el) => el.classList.add('is-revealed'))
} else {
  const observer = new IntersectionObserver(
    (entries, obs) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed')
          obs.unobserve(entry.target)
        }
      }
    },
    { threshold: 0.15, rootMargin: '0px 0px -10% 0px' },
  )

  revealElements.forEach((el) => observer.observe(el))
}
