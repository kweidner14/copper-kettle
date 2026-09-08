import { vitePreprocess } from '@astrojs/svelte'

/**
 * Without this, Svelte components get no preprocessing and `<style lang="scss">`
 * is handed to the browser as raw SCSS. That fails *quietly*: top-level rules
 * survive, but every `&__nested` block vanishes and any declaration using SCSS
 * syntax (`@include`, `vars.$spacing-unit * 2`) is dropped as unparseable. The
 * component ends up about 60% styled, which looks like a design problem rather
 * than a build one.
 *
 * @type {import('@sveltejs/vite-plugin-svelte').SvelteConfig}
 */
export default {
  preprocess: vitePreprocess(),
}
