/**
 * Enhanced Preview & Execute panel with progress tracking
 */

import { useCallback, useState } from 'react'
import {
  Box,
  Button,
  Card,
  Checkbox,
  Flex,
  Heading,
  Stack,
  Text,
  Badge,
  Spinner,
  useToast,
} from '@sanity/ui'
import { PlayIcon, EyeOpenIcon } from '@sanity/icons'
import type { ExecuteResult } from '../../types'

interface PreviewPanelProps {
  syncState: any
}

export function PreviewPanel({ syncState }: PreviewPanelProps) {
  const { state, setIsSyncing, setDryRun } = syncState
  const [previewResult, setPreviewResult] = useState<any>(null)
  const [executeResult, setExecuteResult] = useState<ExecuteResult | null>(null)
  const [progress, setProgress] = useState(0)
  const toast = useToast()

  const handlePreview = useCallback(async () => {
    if (state.selectedDocIds.size === 0) return

    try {
      // TODO: Call actual preview API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setPreviewResult({
        estimatedOperations: state.selectedDocIds.size,
        estimatedTime: Math.ceil(state.selectedDocIds.size / 10),
        warnings: [],
      })
    } catch (error) {
      toast.push({
        status: 'error',
        title: 'Preview failed',
        description: error instanceof Error ? error.message : 'Failed to preview changes',
      })
    }
  }, [state.selectedDocIds])

  const handleExecute = useCallback(async () => {
    if (state.selectedDocIds.size === 0) return

    setIsSyncing(true)
    setProgress(0)
    setExecuteResult(null)

    try {
      // Simulate progress
      const total = state.selectedDocIds.size
      for (let i = 0; i <= total; i++) {
        await new Promise((resolve) => setTimeout(resolve, 100))
        setProgress((i / total) * 100)
      }

      // TODO: Call actual execute API
      const result: ExecuteResult = {
        jobId: `job-${Date.now()}`,
        status: 'completed',
        successCount: state.selectedDocIds.size,
        failureCount: 0,
        changes: [],
      }

      setExecuteResult(result)
    } catch (error) {
      toast.push({
        status: 'error',
        title: 'Execute failed',
        description: error instanceof Error ? error.message : 'Failed to execute sync',
      })
    } finally {
      setIsSyncing(false)
    }
  }, [state.selectedDocIds, setIsSyncing])

  const canExecute =
    !state.isSyncing &&
    state.selectedDocIds.size > 0 &&
    state.sourceDataset &&
    state.targetDataset

  return (
    <Stack space={4}>
      <Box>
        <Heading size={3}>Preview & Execute</Heading>
        <Text muted size={1} style={{ marginTop: '0.5rem' }}>
          Preview changes and execute sync operation
        </Text>
      </Box>

      <Card padding={4} radius={2} shadow={1}>
        <Stack space={3}>
          <Flex justify="space-between" align="center">
            <Box>
              <Text size={1} weight="semibold">
                Ready to Sync
              </Text>
              <Text size={1} muted>
                {state.selectedDocIds.size} documents selected
              </Text>
            </Box>
            <Badge tone="primary" fontSize={2}>
              {state.syncPolicy}
            </Badge>
          </Flex>

          <Flex align="center" gap={2}>
            <Checkbox checked={state.dryRun} onChange={(e) => setDryRun(e.currentTarget.checked)} />
            <Text size={1}>Dry run (preview only, no writes)</Text>
          </Flex>

          <Flex gap={3}>
            <Button
              text="Preview Changes"
              icon={EyeOpenIcon}
              mode="ghost"
              onClick={handlePreview}
              disabled={state.selectedDocIds.size === 0}
              flex={1}
            />
            <Button
              text={state.dryRun ? 'Run Dry Run' : 'Execute Sync'}
              icon={PlayIcon}
              tone={state.dryRun ? 'primary' : 'positive'}
              onClick={handleExecute}
              disabled={!canExecute}
              loading={state.isSyncing}
              flex={1}
            />
          </Flex>
        </Stack>
      </Card>

      {previewResult && (
        <Card padding={4} tone="primary" radius={2}>
          <Stack space={3}>
            <Heading size={1}>Preview Result</Heading>
            <Flex gap={4}>
              <Box>
                <Text size={1} muted>
                  Operations
                </Text>
                <Text size={2} weight="bold">
                  {previewResult.estimatedOperations}
                </Text>
              </Box>
              <Box>
                <Text size={1} muted>
                  Est. Time
                </Text>
                <Text size={2} weight="bold">
                  ~{previewResult.estimatedTime}s
                </Text>
              </Box>
            </Flex>
            {previewResult.warnings.length > 0 && (
              <Card padding={3} tone="caution">
                <Text size={1} weight="semibold">
                  Warnings:
                </Text>
                {previewResult.warnings.map((w: string, i: number) => (
                  <Text key={i} size={1}>
                    • {w}
                  </Text>
                ))}
              </Card>
            )}
          </Stack>
        </Card>
      )}

      {state.isSyncing && (
        <Card padding={4} tone="primary">
          <Stack space={3}>
            <Flex align="center" gap={3}>
              <Spinner />
              <Text weight="semibold">
                {state.dryRun ? 'Running dry run...' : 'Syncing...'}
              </Text>
            </Flex>
            <Progress value={progress} />
            <Text size={1} muted>
              {Math.round(progress)}% complete
            </Text>
          </Stack>
        </Card>
      )}

      {executeResult && (
        <Card padding={4} tone={executeResult.status === 'completed' ? 'positive' : 'caution'}>
          <Stack space={3}>
            <Heading size={1}>
              {executeResult.status === 'completed' ? '✓ Sync Complete' : '⚠ Sync Partial'}
            </Heading>
            <Flex gap={4}>
              <Box>
                <Text size={1} muted>
                  Job ID
                </Text>
                <Text size={1} weight="semibold">
                  {executeResult.jobId}
                </Text>
              </Box>
              <Box>
                <Text size={1} muted>
                  Success
                </Text>
                <Text size={2} weight="bold">
                  {executeResult.successCount}
                </Text>
              </Box>
              {executeResult.failureCount > 0 && (
                <Box>
                  <Text size={1} muted>
                    Failed
                  </Text>
                  <Text size={2} weight="bold" tone="critical">
                    {executeResult.failureCount}
                  </Text>
                </Box>
              )}
            </Flex>
          </Stack>
        </Card>
      )}
    </Stack>
  )
}
