/**
 * Preview & Execute panel component
 */

import { Box, Heading, Stack, Text } from '@sanity/ui'
import type { ContentSyncConfig } from '../../types'

interface PreviewPanelProps {
  config: ContentSyncConfig
  syncState: any
}

export function PreviewPanel({ config, syncState }: PreviewPanelProps) {
  return (
    <Stack space={4}>
      <Box>
        <Heading size={3}>Preview & Execute</Heading>
        <Text muted size={1} style={{ marginTop: '0.5rem' }}>
          Preview changes and execute sync
        </Text>
      </Box>

      <Text muted>Preview and execution controls will be implemented here</Text>
    </Stack>
  )
}
