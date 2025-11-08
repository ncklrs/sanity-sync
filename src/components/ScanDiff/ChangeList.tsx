/**
 * List of changes with action badges
 */

import { Box, Card, Stack, Text, Button, Flex, Badge } from '@sanity/ui'
import { EyeOpenIcon } from '@sanity/icons'
import type { ChangeRecord } from '../../types'

interface ChangeListProps {
  changes: ChangeRecord[]
  onViewDiff: (change: ChangeRecord) => void
}

export function ChangeList({ changes, onViewDiff }: ChangeListProps) {
  const getActionColor = (
    action: string
  ): 'positive' | 'caution' | 'critical' | 'primary' | 'default' => {
    switch (action) {
      case 'added':
        return 'positive'
      case 'updated':
        return 'caution'
      case 'removed':
        return 'critical'
      default:
        return 'default'
    }
  }

  return (
    <Stack space={2}>
      {changes.map((change) => (
        <Card key={change.docId} padding={3} radius={2} shadow={1}>
          <Flex justify="space-between" align="center">
            <Box flex={1}>
              <Flex gap={2} align="center">
                <Badge tone={getActionColor(change.action)}>{change.action}</Badge>
                <Text size={1} weight="semibold">
                  {change.docId}
                </Text>
                <Text size={1} muted>
                  ({change.type})
                </Text>
              </Flex>
              {change.fieldsChanged && change.fieldsChanged.length > 0 && (
                <Text size={1} muted style={{ marginTop: '0.25rem' }}>
                  Fields: {change.fieldsChanged.join(', ')}
                </Text>
              )}
            </Box>
            <Button
              text="View Diff"
              icon={EyeOpenIcon}
              mode="ghost"
              fontSize={1}
              padding={2}
              onClick={() => onViewDiff(change)}
            />
          </Flex>
        </Card>
      ))}
    </Stack>
  )
}
