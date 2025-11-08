/**
 * Diff viewer component for side-by-side comparison
 */

import { Card, Stack, Text, Button, Flex, Box, Code, Heading } from '@sanity/ui'
import { CloseIcon } from '@sanity/icons'
import type { DiffResult } from '../../types'

interface DiffViewerProps {
  diff: DiffResult
  onClose: () => void
}

export function DiffViewer({ diff, onClose }: DiffViewerProps) {
  return (
    <Card padding={4} radius={2} shadow={2} tone="primary">
      <Stack space={4}>
        <Flex justify="space-between" align="center">
          <Heading size={2}>Diff: {diff.docId}</Heading>
          <Button icon={CloseIcon} mode="bleed" onClick={onClose} />
        </Flex>

        {diff.hasConflicts && (
          <Card padding={3} tone="caution" radius={2}>
            <Text size={1} weight="semibold">
              ⚠️ Conflicts detected (score: {diff.conflictScore})
            </Text>
          </Card>
        )}

        <Stack space={3}>
          {diff.fieldDiffs.map((fieldDiff) => (
            <Card
              key={fieldDiff.path}
              padding={3}
              radius={2}
              tone={fieldDiff.changed ? 'default' : 'transparent'}
              border
            >
              <Stack space={2}>
                <Flex justify="space-between" align="center">
                  <Text size={1} weight="semibold">
                    {fieldDiff.path}
                  </Text>
                  <Text size={1} muted>
                    {fieldDiff.op}
                  </Text>
                </Flex>

                <Flex gap={3}>
                  <Box flex={1}>
                    <Text size={1} muted style={{ marginBottom: '0.25rem' }}>
                      Source
                    </Text>
                    <Card padding={2} tone="transparent" border>
                      <Code size={1}>
                        {fieldDiff.sourceValue !== undefined
                          ? JSON.stringify(fieldDiff.sourceValue, null, 2)
                          : '(undefined)'}
                      </Code>
                    </Card>
                  </Box>

                  <Box flex={1}>
                    <Text size={1} muted style={{ marginBottom: '0.25rem' }}>
                      Target
                    </Text>
                    <Card padding={2} tone="transparent" border>
                      <Code size={1}>
                        {fieldDiff.targetValue !== undefined
                          ? JSON.stringify(fieldDiff.targetValue, null, 2)
                          : '(undefined)'}
                      </Code>
                    </Card>
                  </Box>
                </Flex>

                {fieldDiff.conflict && (
                  <Text size={1} tone="caution">
                    Suggested: {fieldDiff.suggestion}
                  </Text>
                )}
              </Stack>
            </Card>
          ))}
        </Stack>
      </Stack>
    </Card>
  )
}
