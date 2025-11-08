/**
 * Overview panel component
 */

import { Box, Card, Flex, Heading, Select, Text, Stack } from '@sanity/ui'
import type { ContentSyncConfig } from '../../types'

interface OverviewPanelProps {
  config: ContentSyncConfig
  syncState: any
}

export function OverviewPanel({ config, syncState }: OverviewPanelProps) {
  const { state, setSourceDataset, setTargetDataset } = syncState

  return (
    <Stack space={4}>
      <Box>
        <Heading size={3}>Content Sync Overview</Heading>
        <Text muted size={1} style={{ marginTop: '0.5rem' }}>
          Select source and target datasets to begin syncing content
        </Text>
      </Box>

      <Card padding={4} radius={2} shadow={1}>
        <Stack space={4}>
          <Box>
            <Text size={1} weight="semibold" style={{ marginBottom: '0.5rem' }}>
              Source Dataset
            </Text>
            <Select
              value={state.sourceDataset || ''}
              onChange={(e) => setSourceDataset(e.currentTarget.value || null)}
            >
              <option value="">Select source...</option>
              {config.datasets.map((ds) => (
                <option key={ds.id} value={ds.id}>
                  {ds.label}
                </option>
              ))}
            </Select>
          </Box>

          <Box>
            <Text size={1} weight="semibold" style={{ marginBottom: '0.5rem' }}>
              Target Dataset
            </Text>
            <Select
              value={state.targetDataset || ''}
              onChange={(e) => setTargetDataset(e.currentTarget.value || null)}
            >
              <option value="">Select target...</option>
              {config.datasets.map((ds) => (
                <option key={ds.id} value={ds.id}>
                  {ds.label}
                </option>
              ))}
            </Select>
          </Box>
        </Stack>
      </Card>

      <Card padding={4} radius={2} tone="primary">
        <Stack space={3}>
          <Heading size={1}>Quick Stats</Heading>
          <Flex gap={3}>
            <Box flex={1}>
              <Text size={1} muted>
                Total Changes
              </Text>
              <Text size={3} weight="bold">
                {state.changes.length}
              </Text>
            </Box>
            <Box flex={1}>
              <Text size={1} muted>
                Selected
              </Text>
              <Text size={3} weight="bold">
                {state.selectedDocIds.size}
              </Text>
            </Box>
          </Flex>
        </Stack>
      </Card>
    </Stack>
  )
}
