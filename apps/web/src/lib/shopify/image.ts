import type { ShopImage } from './models'

/**
 * Sized image URLs from Shopify's CDN.
 *
 * The Storefront API hands back the original upload, and every <img> on the
 * site used to request it as-is: a 5rem gallery thumbnail downloaded the same
 * file as the full product shot. The CDN resizes on request with a `width`
 * query parameter (and negotiates WebP/AVIF from the Accept header on its own),
 * so the fix is to ask for the size each slot actually renders at.
 *
 * It never upscales: asking for more than the original's width returns the
 * original. Widths above the intrinsic width are dropped from srcset for the
 * same reason, so the browser is not offered several identical files.
 *
 * Plain functions with no Astro imports, so the cart drawer island can use
 * them too.
 */

/** Candidate widths for fluid images. Covers a 300px card at 1x through a
 *  full-width phone image at 3x. */
const FLUID_WIDTHS = [240, 360, 480, 640, 800, 960, 1200, 1600]

type ImageSource = Pick<ShopImage, 'url' | 'width'>

/** The CDN URL for `image` at `width` CSS pixels, never wider than the original. */
export function imageUrl(image: ImageSource, width: number): string {
  const target = image.width ? Math.min(width, image.width) : width
  const url = new URL(image.url)
  url.searchParams.set('width', String(Math.round(target)))
  return url.toString()
}

export interface FluidImageAttributes {
  src: string
  srcset: string
  sizes: string
}

/**
 * For images whose rendered width depends on the layout. `sizes` must describe
 * that layout; it is what lets the browser pick from `srcset` before CSS loads.
 * `src` is the fallback for browsers without srcset, at a sensible middle width.
 */
export function fluidImage(
  image: ImageSource,
  sizes: string,
  {
    fallbackWidth = 800,
    widths = FLUID_WIDTHS,
  }: { fallbackWidth?: number; widths?: number[] } = {},
): FluidImageAttributes {
  const usable = image.width ? widths.filter((width) => width < image.width!) : widths
  // The original itself is always a candidate, so the largest slot is covered
  // even when the upload is narrower than every width in the list.
  const candidates = image.width ? [...usable, image.width] : usable

  return {
    src: imageUrl(image, fallbackWidth),
    srcset: candidates.map((width) => `${imageUrl(image, width)} ${width}w`).join(', '),
    sizes,
  }
}

export interface FixedImageAttributes {
  src: string
  srcset: string
}

/** For images that always render at one size (cart line thumbnails). */
export function fixedImage(image: ImageSource, width: number): FixedImageAttributes {
  return {
    src: imageUrl(image, width),
    srcset: `${imageUrl(image, width)} 1x, ${imageUrl(image, width * 2)} 2x`,
  }
}
