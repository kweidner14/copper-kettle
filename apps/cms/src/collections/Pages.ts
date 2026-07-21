import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { seoField } from '../fields/seo'
import { triggerRebuild } from '../hooks/triggerRebuild'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
  },
  access: {
    read: ({ req: { user } }) => {
      // Public API only ever sees published docs; logged-in editors can
      // preview drafts in the admin UI.
      if (user) return true
      return { _status: { equals: 'published' } }
    },
  },
  versions: {
    drafts: true,
  },
  hooks: {
    afterChange: [triggerRebuild],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL path segment, e.g. "about" for /about.',
      },
    },
    {
      name: 'content',
      type: 'richText',
      editor: lexicalEditor(),
    },
    seoField(),
  ],
}
