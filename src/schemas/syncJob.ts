import { defineType, defineField } from 'sanity'

export const syncJob = defineType({
  name: 'syncJob',
  title: 'Sync Job',
  type: 'document',
  fields: [
    defineField({
      name: 'jobId',
      title: 'Job ID',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'source',
      title: 'Source Dataset',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'target',
      title: 'Target Dataset',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'mode',
      title: 'Mode',
      type: 'string',
      options: {
        list: [
          { title: 'Push', value: 'push' },
          { title: 'Pull', value: 'pull' },
          { title: 'Both', value: 'both' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Pending', value: 'pending' },
          { title: 'Running', value: 'running' },
          { title: 'Completed', value: 'completed' },
          { title: 'Partial', value: 'partial' },
          { title: 'Failed', value: 'failed' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'startedAt',
      title: 'Started At',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'completedAt',
      title: 'Completed At',
      type: 'datetime',
    }),
    defineField({
      name: 'changes',
      title: 'Changes',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'docId',
              title: 'Document ID',
              type: 'string',
            }),
            defineField({
              name: 'type',
              title: 'Document Type',
              type: 'string',
            }),
            defineField({
              name: 'action',
              title: 'Action',
              type: 'string',
              options: {
                list: ['added', 'removed', 'updated', 'unchanged'],
              },
            }),
            defineField({
              name: 'fieldsChanged',
              title: 'Fields Changed',
              type: 'array',
              of: [{ type: 'string' }],
            }),
            defineField({
              name: 'sourceTimestamp',
              title: 'Source Timestamp',
              type: 'string',
            }),
            defineField({
              name: 'targetTimestamp',
              title: 'Target Timestamp',
              type: 'string',
            }),
          ],
        },
      ],
    }),
    defineField({
      name: 'errors',
      title: 'Errors',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'docId',
              title: 'Document ID',
              type: 'string',
            }),
            defineField({
              name: 'code',
              title: 'Error Code',
              type: 'string',
            }),
            defineField({
              name: 'message',
              title: 'Error Message',
              type: 'text',
            }),
            defineField({
              name: 'timestamp',
              title: 'Timestamp',
              type: 'string',
            }),
            defineField({
              name: 'retryable',
              title: 'Retryable',
              type: 'boolean',
            }),
          ],
        },
      ],
    }),
    defineField({
      name: 'options',
      title: 'Options',
      type: 'object',
      fields: [
        defineField({
          name: 'includeAssets',
          title: 'Include Assets',
          type: 'boolean',
        }),
        defineField({
          name: 'dryRun',
          title: 'Dry Run',
          type: 'boolean',
        }),
        defineField({
          name: 'batchSize',
          title: 'Batch Size',
          type: 'number',
        }),
        defineField({
          name: 'concurrency',
          title: 'Concurrency',
          type: 'number',
        }),
      ],
    }),
  ],
  preview: {
    select: {
      jobId: 'jobId',
      source: 'source',
      target: 'target',
      status: 'status',
      startedAt: 'startedAt',
    },
    prepare({ jobId, source, target, status, startedAt }) {
      return {
        title: `${source} → ${target}`,
        subtitle: `${jobId} - ${status} (${new Date(startedAt).toLocaleString()})`,
      }
    },
  },
})
