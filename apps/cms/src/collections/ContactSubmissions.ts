import type { CollectionConfig } from 'payload'

/**
 * Stores contact form submissions so editors can see them in the admin UI.
 * Writing happens exclusively through the /api/contact custom endpoint
 * (see src/endpoints/contact.ts), which uses the local API and so bypasses
 * this access control — direct public REST writes are blocked below so the
 * custom endpoint stays the only path in (room to add spam checks there).
 */
export const ContactSubmissions: CollectionConfig = {
  slug: 'contact-submissions',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['name', 'email', 'createdAt'],
  },
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: () => false,
    update: () => false,
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'email', type: 'email', required: true },
    { name: 'message', type: 'textarea', required: true },
  ],
}
