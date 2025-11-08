import { defineType, defineField } from 'sanity'

export const syncRule = defineType({
  name: 'syncRule',
  title: 'Sync Rule',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Rule Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'direction',
      title: 'Direction',
      type: 'string',
      options: {
        list: [
          { title: 'Push Only', value: 'push' },
          { title: 'Pull Only', value: 'pull' },
          { title: 'Both Directions', value: 'both' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'match',
      title: 'Match Criteria',
      type: 'object',
      fields: [
        defineField({
          name: 'documentTypes',
          title: 'Document Types',
          type: 'array',
          of: [{ type: 'string' }],
          description: 'Match documents of these types',
        }),
        defineField({
          name: 'idPatterns',
          title: 'ID Patterns',
          type: 'array',
          of: [{ type: 'string' }],
          description: 'Glob or regex patterns to match document IDs',
        }),
        defineField({
          name: 'tagInclude',
          title: 'Tags to Include',
          type: 'array',
          of: [{ type: 'string' }],
          description: 'Only include documents with these tags',
        }),
      ],
    }),
    defineField({
      name: 'preserveFields',
      title: 'Preserve Fields',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Field paths to always keep from target dataset',
    }),
    defineField({
      name: 'preserveWhenTargetIsNewer',
      title: 'Preserve When Target is Newer',
      type: 'boolean',
      description: 'Keep target field values when target has been updated more recently',
      initialValue: false,
    }),
    defineField({
      name: 'enabled',
      title: 'Enabled',
      type: 'boolean',
      description: 'Enable or disable this rule',
      initialValue: true,
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      description: 'Describe what this rule does',
    }),
  ],
  preview: {
    select: {
      name: 'name',
      direction: 'direction',
      enabled: 'enabled',
      description: 'description',
    },
    prepare({ name, direction, enabled, description }) {
      return {
        title: name,
        subtitle: `${direction} - ${enabled ? 'Enabled' : 'Disabled'}`,
        description: description,
      }
    },
  },
})
