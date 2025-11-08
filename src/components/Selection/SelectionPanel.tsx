/**
 * Selection panel component
 */

import { Box, Heading, Stack, Text } from '@sanity/ui'
import type { ContentSyncConfig } from '../../types'

interface SelectionPanelProps {
  config: ContentSyncConfig
  syncState: any
}

export function SelectionPanel({ config, syncState }: SelectionPanelProps) {
  return (
    <Stack space={4}>
      <Box>
        <Heading size={3}>Selection</Heading>
        <Text muted size={1} style={{ marginTop: '0.5rem' }}>
          Choose which documents to sync
        </Text>
      </Box>

      <Text muted>Selection controls will be implemented here</Text>
    </Stack>
  )
}
