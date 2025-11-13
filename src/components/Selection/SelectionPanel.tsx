/**
 * Enhanced Selection panel with bulk selection and filtering
 */

import { useCallback, useMemo } from 'react'
import {
  Box,
  Button,
  Card,
  Checkbox,
  Flex,
  Heading,
  Select,
  Stack,
  Text,
  Badge,
} from '@sanity/ui'
import { CheckmarkIcon, CloseIcon } from '@sanity/icons'
import type { SyncPolicy } from '../../types'

interface SelectionPanelProps {
  syncState: any
}

export function SelectionPanel({ syncState }: SelectionPanelProps) {
  const { state, setSelectedDocIds, setSyncPolicy, setIncludeAssets } = syncState

  const groupedChanges = useMemo(() => {
    const groups: Record<string, any[]> = {}
    state.changes.forEach((change: any) => {
      if (!groups[change.type]) {
        groups[change.type] = []
      }
      groups[change.type].push(change)
    })
    return groups
  }, [state.changes])

  const handleSelectAll = useCallback(() => {
    const allIds = new Set(state.changes.map((c: any) => c.docId))
    setSelectedDocIds(allIds)
  }, [state.changes, setSelectedDocIds])

  const handleDeselectAll = useCallback(() => {
    setSelectedDocIds(new Set())
  }, [setSelectedDocIds])

  const handleToggleDoc = useCallback(
    (docId: string) => {
      const newSelection = new Set(state.selectedDocIds)
      if (newSelection.has(docId)) {
        newSelection.delete(docId)
      } else {
        newSelection.add(docId)
      }
      setSelectedDocIds(newSelection)
    },
    [state.selectedDocIds, setSelectedDocIds]
  )

  const handleToggleType = useCallback(
    (type: string) => {
      const typeDocIds = groupedChanges[type].map((c: any) => c.docId)
      const allSelected = typeDocIds.every((id: string) => state.selectedDocIds.has(id))

      const newSelection = new Set(state.selectedDocIds)
      if (allSelected) {
        typeDocIds.forEach((id: string) => newSelection.delete(id))
      } else {
        typeDocIds.forEach((id: string) => newSelection.add(id))
      }
      setSelectedDocIds(newSelection)
    },
    [groupedChanges, state.selectedDocIds, setSelectedDocIds]
  )

  return (
    <Stack space={4}>
      <Box>
        <Heading size={3}>Selection</Heading>
        <Text muted size={1} style={{ marginTop: '0.5rem' }}>
          Choose which documents to sync
        </Text>
      </Box>

      <Card padding={4} radius={2} shadow={1}>
        <Stack space={3}>
          <Flex justify="space-between" align="center">
            <Text size={1} weight="semibold">
              Selected: {state.selectedDocIds.size} / {state.changes.length}
            </Text>
            <Flex gap={2}>
              <Button
                text="Select All"
                icon={CheckmarkIcon}
                mode="ghost"
                fontSize={1}
                onClick={handleSelectAll}
              />
              <Button
                text="Deselect All"
                icon={CloseIcon}
                mode="ghost"
                fontSize={1}
                onClick={handleDeselectAll}
              />
            </Flex>
          </Flex>

          <Box>
            <Text size={1} weight="semibold" style={{ marginBottom: '0.5rem' }}>
              Sync Policy
            </Text>
            <Select
              value={state.syncPolicy}
              onChange={(e) => setSyncPolicy(e.currentTarget.value as SyncPolicy)}
            >
              <option value="overwrite">Overwrite - Source wins completely</option>
              <option value="merge_preserve">Merge & Preserve - Keep specific fields</option>
              <option value="preserve_target_if_newer">
                Preserve if Newer - Keep newer values
              </option>
              <option value="smart_merge">Smart Merge - Union arrays with dedupe</option>
            </Select>
          </Box>

          <Flex align="center" gap={2}>
            <Checkbox
              checked={state.includeAssets}
              onChange={(e) => setIncludeAssets(e.currentTarget.checked)}
            />
            <Text size={1}>Include assets</Text>
          </Flex>
        </Stack>
      </Card>

      {state.changes.length > 0 ? (
        <Stack space={3}>
          {Object.entries(groupedChanges).map(([type, changes]) => {
            const typeSelected = changes.every((c: any) => state.selectedDocIds.has(c.docId))
            const someSelected = changes.some((c: any) => state.selectedDocIds.has(c.docId))

            return (
              <Card key={type} padding={3} radius={2} shadow={1}>
                <Stack space={2}>
                  <Flex justify="space-between" align="center">
                    <Flex align="center" gap={2}>
                      <Checkbox
                        checked={typeSelected}
                        indeterminate={someSelected && !typeSelected}
                        onChange={() => handleToggleType(type)}
                      />
                      <Text size={1} weight="semibold">
                        {type}
                      </Text>
                      <Badge tone="primary">{changes.length}</Badge>
                    </Flex>
                  </Flex>

                  <Stack space={1} paddingLeft={4}>
                    {changes.map((change: any) => (
                      <Flex key={change.docId} align="center" gap={2}>
                        <Checkbox
                          checked={state.selectedDocIds.has(change.docId)}
                          onChange={() => handleToggleDoc(change.docId)}
                        />
                        <Text size={1}>{change.docId}</Text>
                        <Badge tone={change.action === 'added' ? 'positive' : 'caution'}>
                          {change.action}
                        </Badge>
                      </Flex>
                    ))}
                  </Stack>
                </Stack>
              </Card>
            )
          })}
        </Stack>
      ) : (
        <Card padding={4} tone="transparent" border>
          <Text muted align="center">
            No changes available. Scan for changes first.
          </Text>
        </Card>
      )}
    </Stack>
  )
}
