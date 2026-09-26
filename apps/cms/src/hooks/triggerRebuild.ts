import type { CollectionAfterChangeHook } from 'payload'

/**
 * Fires the frontend host's deploy hook whenever a document is published.
 * The storefront is SSR, but the pages that read Payload (home, About, Privacy)
 * are prerendered, so they only pick up new content from a fresh build.
 *
 * Fires on every publish, including republishing a page that was already live;
 * checking only for the transition into "published" meant edits to a live page
 * never reached the site. Draft saves carry _status "draft", so iterating on a
 * draft still triggers nothing.
 */
export const triggerRebuild: CollectionAfterChangeHook = async ({ doc, req }) => {
  const webhookUrl = process.env.REBUILD_WEBHOOK_URL
  if (!webhookUrl) return doc

  if (doc?._status === 'published') {
    try {
      await fetch(webhookUrl, { method: 'POST' })
    } catch (err) {
      req.payload.logger.error(`Failed to trigger rebuild webhook: ${String(err)}`)
    }
  }

  return doc
}
