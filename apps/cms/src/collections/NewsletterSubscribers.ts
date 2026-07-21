import type { CollectionConfig } from 'payload'

/**
 * Newsletter signups, written only via the /api/newsletter custom endpoint
 * (see src/endpoints/newsletter.ts). Swap this out for a direct call to
 * your ESP (Mailchimp, Buttondown, etc.) from that endpoint if you'd rather
 * not store subscribers in Payload at all.
 */
export const NewsletterSubscribers: CollectionConfig = {
  slug: 'newsletter-subscribers',
  admin: {
    useAsTitle: 'email',
  },
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: () => false,
    update: () => false,
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [{ name: 'email', type: 'email', required: true, unique: true }],
}
