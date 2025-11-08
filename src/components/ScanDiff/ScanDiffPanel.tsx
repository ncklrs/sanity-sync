/**
 * Scan & Diff panel component
 */

import { Box, Button, Card, Heading, Stack, Text } from '@sanity/ui'
import { SearchIcon } from '@sanity/icons'
import type { ContentSyncConfig } from '../../types'

interface ScanDiffPanelProps {
  config: ContentSyncConfig
  syncState: any
}

export function ScanDiffPanel({ config, syncState }: ScanDiffPanelProps) {
  const { state, setIsScanning } = syncState

  const handleScan = () => {
    setIsScanning(true)
    // TODO: Implement scan logic
    setTimeout(() => setIsScanning(false), 1000)
  }

  return (
    <Stack space={4}>
      <Box>
        <Heading size={3}>Scan & Diff</Heading>
        <Text muted size={1} style={{ marginTop: '0.5rem' }}>
          Scan for changes between datasets and view field-level diffs
        </Text>
      </Box>

      <Card padding={4}>
        <Button
          text="Scan for Changes"
          icon={SearchIcon}
          onClick={handleScan}
          disabled={!state.sourceDataset || !state.targetDataset || state.isScanning}
          loading={state.isScanning}
          tone="primary"
        />
      </Card>

      <Card padding={4}>
        <Text muted>
          {state.changes.length > 0
            ? `Found ${state.changes.length} changes`
            : 'No changes scanned yet. Click "Scan for Changes" to begin.'}
        </Text>
      </Card>
    </Stack>
  )
}
