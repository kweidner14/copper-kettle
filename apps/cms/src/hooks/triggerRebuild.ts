import type { CollectionAfterChangeHook } from 'payload'

/**
 * Fires the static site host's deploy hook whenever a document is published.
 * The frontend is fully static (Astro SSG on Cloudflare Pages), so it has no
 * way to know content changed short of being told to rebuild.
 *
 * Only fires on the transition into "published" to avoid a rebuild storm
 * while an editor is iterating on a draft.
 */
export const triggerRebuild: CollectionAfterChangeHook = async ({ doc, previousDoc, req }) => {
  const webhookUrl = process.env.REBUILD_WEBHOOK_URL
  if (!webhookUrl) return doc

  const wasPublished = previousDoc?._status === 'published'
  const isPublished = doc?._status === 'published'
  if (isPublished && !wasPublished) {
    try {
      await fetch(webhookUrl, { method: 'POST' })
    } catch (err) {
      req.payload.logger.error(`Failed to trigger rebuild webhook: ${String(err)}`)
    }
  }

  return doc
}
