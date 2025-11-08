/**
 * Example: Advanced usage with hooks and custom transforms
 */

import { defineConfig } from 'sanity'
import { contentSync } from 'sanity-plugin-content-sync'

export default defineConfig({
  name: 'default',
  title: 'My Sanity Project',

  projectId: 'your-project-id',
  dataset: 'production',

  plugins: [
    contentSync({
      datasets: [
        { id: 'dev', label: 'Development', projectId: 'your-project-id' },
        { id: 'staging', label: 'Staging', projectId: 'your-project-id' },
        { id: 'prod', label: 'Production', projectId: 'your-project-id' },
      ],

      defaultSource: 'staging',
      defaultTarget: 'prod',

      // Custom transform hook
      transformHook: async (doc, context) => {
        // Example: Remove test fields before syncing to production
        if (context.targetDataset === 'prod') {
          const { testField, _keepLocal, ...rest } = doc
          return rest
        }
        return doc
      },

      // Asset transform hook
      assetTransformHook: async (assetMeta) => {
        // Example: Skip large assets over 10MB
        const maxSize = 10 * 1024 * 1024 // 10MB
        return {
          copy: !assetMeta.size || assetMeta.size < maxSize,
        }
      },

      // Lifecycle hooks
      onJobStart: async (job) => {
        console.log(`Sync job started: ${job.jobId}`)
        // Could send notification, update external system, etc.
      },

      onJobComplete: async (job) => {
        console.log(`Sync job completed: ${job.jobId}`)
        console.log(`Status: ${job.status}`)
        console.log(`Changes: ${job.changes.length}`)
        // Could send completion notification, update CI/CD, etc.
      },

      preserveHintFields: ['_keepLocal', 'devOnly', 'testMeta'],
      batchSize: 25, // Smaller batches for safety
      concurrency: 2, // Lower concurrency to avoid rate limits
    }),
  ],
})
