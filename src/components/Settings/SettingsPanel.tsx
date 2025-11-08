/**
 * Settings panel component
 */

import { Box, Heading, Stack, Text } from '@sanity/ui'
import type { ContentSyncConfig } from '../../types'

interface SettingsPanelProps {
  config: ContentSyncConfig
}

export function SettingsPanel({ config }: SettingsPanelProps) {
  return (
    <Stack space={4}>
      <Box>
        <Heading size={3}>Settings</Heading>
        <Text muted size={1} style={{ marginTop: '0.5rem' }}>
          Configure sync behavior and manage rules
        </Text>
      </Box>

      <Text muted>Settings will be displayed here</Text>
    </Stack>
  )
}
