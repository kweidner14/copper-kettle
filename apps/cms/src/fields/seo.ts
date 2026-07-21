import type { GroupField } from 'payload'

/**
 * Reusable SEO field group. Spread this into any content collection:
 *
 *   fields: [ ...otherFields, seoField() ]
 */
export const seoField = (): GroupField => ({
  name: 'seo',
  type: 'group',
  label: 'SEO',
  admin: {
    position: 'sidebar',
  },
  fields: [
    {
      name: 'metaTitle',
      type: 'text',
      label: 'Meta title',
      admin: {
        description: 'Falls back to the page/post title if left blank.',
      },
    },
    {
      name: 'metaDescription',
      type: 'textarea',
      label: 'Meta description',
    },
    {
      name: 'canonicalUrl',
      type: 'text',
      label: 'Canonical URL',
      admin: {
        description: 'Absolute URL. Leave blank to use the default canonical for this page.',
      },
    },
    {
      name: 'robotsIndex',
      type: 'checkbox',
      label: 'Allow search engines to index this page',
      defaultValue: true,
    },
    {
      name: 'robotsFollow',
      type: 'checkbox',
      label: 'Allow search engines to follow links on this page',
      defaultValue: true,
    },
    {
      name: 'ogImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Open Graph / Twitter image',
    },
    {
      name: 'ogTitleOverride',
      type: 'text',
      label: 'Open Graph title override',
    },
    {
      name: 'ogDescriptionOverride',
      type: 'textarea',
      label: 'Open Graph description override',
    },
  ],
})
