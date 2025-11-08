import { definePlugin } from 'sanity'
import { SyncIcon } from '@sanity/icons'
import { schemas } from './schemas'
import { ContentSyncTool } from './components/ContentSyncTool'
import type { ContentSyncConfig } from './types'

/**
 * Sanity plugin for content sync between datasets
 */
export const contentSync = definePlugin<ContentSyncConfig | void>((config = {}) => {
  const defaultConfig: ContentSyncConfig = {
    datasets: [],
    defaultSource: undefined,
    defaultTarget: undefined,
    readTokenEnv: 'SANITY_SYNC_READ_TOKEN',
    writeTokenEnv: 'SANITY_SYNC_WRITE_TOKEN',
    preserveHintFields: ['_keepLocal', 'devOnly', 'testMeta'],
    batchSize: 50,
    concurrency: 4,
    ...config,
  }

  return {
    name: 'sanity-plugin-content-sync',

    // Add schemas to the studio
    schema: {
      types: schemas,
    },

    // Add the sync tool to the studio
    tools: [
      {
        name: 'content-sync',
        title: 'Content Sync',
        icon: SyncIcon,
        component: (props) => <ContentSyncTool {...props} config={defaultConfig} />,
      },
    ],
  }
})
