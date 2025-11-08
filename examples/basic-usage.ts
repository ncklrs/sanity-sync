/**
 * Example: Basic usage of sanity-plugin-content-sync
 */

import { defineConfig } from 'sanity'
import { contentSync } from 'sanity-plugin-content-sync'

export default defineConfig({
  name: 'default',
  title: 'My Sanity Project',

  projectId: 'your-project-id',
  dataset: 'production',

  plugins: [
    // Add the content sync plugin
    contentSync({
      // Define your datasets
      datasets: [
        {
          id: 'dev',
          label: 'Development',
          projectId: 'your-project-id',
        },
        {
          id: 'staging',
          label: 'Staging',
          projectId: 'your-project-id',
        },
        {
          id: 'production',
          label: 'Production',
          projectId: 'your-project-id',
        },
      ],

      // Set defaults
      defaultSource: 'staging',
      defaultTarget: 'production',

      // Environment variables for API tokens
      readTokenEnv: 'SANITY_SYNC_READ_TOKEN',
      writeTokenEnv: 'SANITY_SYNC_WRITE_TOKEN',

      // Fields that hint content should be preserved
      preserveHintFields: ['_keepLocal', 'devOnly', 'testMeta'],

      // Optional: Batch size and concurrency
      batchSize: 50,
      concurrency: 4,
    }),
  ],

  // ... rest of your config
})
