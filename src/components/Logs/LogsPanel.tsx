/**
 * Logs panel component
 */

import { Box, Heading, Stack, Text } from '@sanity/ui'
import type { ContentSyncConfig } from '../../types'

interface LogsPanelProps {
  config: ContentSyncConfig
}

export function LogsPanel({ config }: LogsPanelProps) {
  return (
    <Stack space={4}>
      <Box>
        <Heading size={3}>Sync Logs</Heading>
        <Text muted size={1} style={{ marginTop: '0.5rem' }}>
          View history of sync operations
        </Text>
      </Box>

      <Text muted>Logs will be displayed here</Text>
    </Stack>
  )
}
