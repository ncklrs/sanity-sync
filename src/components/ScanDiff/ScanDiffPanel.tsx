/**
 * Enhanced Scan & Diff panel with full UI interactions
 */

import { useCallback, useState } from 'react'
import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  Stack,
  Text,
  Spinner,
  Badge,
  useToast,
} from '@sanity/ui'
import { SearchIcon, RefreshIcon } from '@sanity/icons'
import type { ChangeRecord } from '../../types'
import { ChangeList } from './ChangeList'
import { DiffViewer } from './DiffViewer'
import { FilterControls } from './FilterControls'

interface ScanDiffPanelProps {
  syncState: any
}

export function ScanDiffPanel({ syncState }: ScanDiffPanelProps) {
  const { state, setIsScanning, setChanges, setCurrentDiff, setFilters } = syncState
  const [selectedChange, setSelectedChange] = useState<ChangeRecord | null>(null)
  const toast = useToast()

  const handleScan = useCallback(async () => {
    if (!state.sourceDataset || !state.targetDataset) {
      return
    }

    setIsScanning(true)
    try {
      // TODO: Call actual scan API
      // For now, simulate with mock data
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const mockChanges: ChangeRecord[] = [
        {
          docId: 'article-1',
          type: 'article',
          action: 'updated',
          sourceTimestamp: new Date().toISOString(),
          targetTimestamp: new Date(Date.now() - 86400000).toISOString(),
          fieldsChanged: ['title', 'content'],
        },
        {
          docId: 'page-2',
          type: 'page',
          action: 'added',
          sourceTimestamp: new Date().toISOString(),
        },
        {
          docId: 'product-3',
          type: 'product',
          action: 'updated',
          sourceTimestamp: new Date().toISOString(),
          targetTimestamp: new Date(Date.now() - 3600000).toISOString(),
          fieldsChanged: ['price', 'stock'],
        },
      ]

      setChanges(mockChanges)
    } catch (error) {
      toast.push({
        status: 'error',
        title: 'Scan failed',
        description: error instanceof Error ? error.message : 'Failed to scan datasets',
      })
    } finally {
      setIsScanning(false)
    }
  }, [state.sourceDataset, state.targetDataset, setIsScanning, setChanges, toast])

  const handleViewDiff = useCallback(
    async (change: ChangeRecord) => {
      setSelectedChange(change)
      // TODO: Call actual diff API
      // setCurrentDiff with the result
    },
    [setCurrentDiff]
  )

  return (
    <Stack space={4}>
      <Box>
        <Heading size={3}>Scan & Diff</Heading>
        <Text muted size={1} style={{ marginTop: '0.5rem' }}>
          Scan for changes between datasets and view field-level diffs
        </Text>
      </Box>

      <FilterControls filters={state.filters} onFiltersChange={setFilters} />

      <Card padding={4}>
        <Flex gap={3}>
          <Button
            text="Scan for Changes"
            icon={SearchIcon}
            onClick={handleScan}
            disabled={!state.sourceDataset || !state.targetDataset || state.isScanning}
            loading={state.isScanning}
            tone="primary"
            flex={1}
          />
          <Button
            text="Refresh"
            icon={RefreshIcon}
            onClick={handleScan}
            disabled={!state.sourceDataset || !state.targetDataset || state.isScanning}
            mode="ghost"
          />
        </Flex>
      </Card>

      {state.isScanning && (
        <Card padding={4} tone="primary">
          <Flex align="center" gap={3}>
            <Spinner />
            <Text>Scanning datasets for changes...</Text>
          </Flex>
        </Card>
      )}

      {!state.isScanning && state.changes.length > 0 && (
        <Card padding={4}>
          <Stack space={3}>
            <Flex justify="space-between" align="center">
              <Heading size={1}>Changes Found</Heading>
              <Badge tone="primary">{state.changes.length} documents</Badge>
            </Flex>
            <ChangeList changes={state.changes} onViewDiff={handleViewDiff} />
          </Stack>
        </Card>
      )}

      {!state.isScanning && state.changes.length === 0 && (
        <Card padding={4} tone="transparent" border>
          <Text muted align="center">
            No changes scanned yet. Click &quot;Scan for Changes&quot; to begin.
          </Text>
        </Card>
      )}

      {selectedChange && state.currentDiff && (
        <DiffViewer diff={state.currentDiff} onClose={() => setSelectedChange(null)} />
      )}
    </Stack>
  )
}
