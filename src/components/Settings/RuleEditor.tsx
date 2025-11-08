/**
 * Rule editor component
 */

import { useState } from 'react'
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
  TextInput,
} from '@sanity/ui'
import { CheckmarkIcon, CloseIcon } from '@sanity/icons'
import type { SyncRuleRecord } from '../../types'

interface RuleEditorProps {
  rule: SyncRuleRecord
  onSave: (rule: SyncRuleRecord) => void
  onCancel: () => void
  isNew: boolean
}

export function RuleEditor({ rule, onSave, onCancel, isNew }: RuleEditorProps) {
  const [editedRule, setEditedRule] = useState<SyncRuleRecord>(rule)

  const handleSave = () => {
    if (!editedRule.name.trim()) {
      alert('Rule name is required')
      return
    }
    onSave(editedRule)
  }

  return (
    <Card padding={4} radius={2} shadow={2} tone="primary">
      <Stack space={4}>
        <Flex justify="space-between" align="center">
          <Heading size={2}>{isNew ? 'Create New Rule' : 'Edit Rule'}</Heading>
          <Button icon={CloseIcon} mode="bleed" onClick={onCancel} />
        </Flex>

        <Stack space={3}>
          <Box>
            <Text size={1} weight="semibold" style={{ marginBottom: '0.5rem' }}>
              Rule Name *
            </Text>
            <TextInput
              value={editedRule.name}
              onChange={(e) =>
                setEditedRule({ ...editedRule, name: e.currentTarget.value })
              }
              placeholder="e.g., Preserve Dev Test Data"
            />
          </Box>

          <Box>
            <Text size={1} weight="semibold" style={{ marginBottom: '0.5rem' }}>
              Direction
            </Text>
            <Select
              value={editedRule.direction}
              onChange={(e) =>
                setEditedRule({
                  ...editedRule,
                  direction: e.currentTarget.value as any,
                })
              }
            >
              <option value="push">Push Only</option>
              <option value="pull">Pull Only</option>
              <option value="both">Both Directions</option>
            </Select>
          </Box>

          <Box>
            <Text size={1} weight="semibold" style={{ marginBottom: '0.5rem' }}>
              Document Types (comma-separated)
            </Text>
            <TextInput
              value={editedRule.match.documentTypes?.join(', ') || ''}
              onChange={(e) => {
                const types = e.currentTarget.value
                  .split(',')
                  .map((t) => t.trim())
                  .filter(Boolean)
                setEditedRule({
                  ...editedRule,
                  match: { ...editedRule.match, documentTypes: types },
                })
              }}
              placeholder="e.g., article, page, product"
            />
          </Box>

          <Box>
            <Text size={1} weight="semibold" style={{ marginBottom: '0.5rem' }}>
              ID Patterns (comma-separated, glob syntax)
            </Text>
            <TextInput
              value={editedRule.match.idPatterns?.join(', ') || ''}
              onChange={(e) => {
                const patterns = e.currentTarget.value
                  .split(',')
                  .map((p) => p.trim())
                  .filter(Boolean)
                setEditedRule({
                  ...editedRule,
                  match: { ...editedRule.match, idPatterns: patterns },
                })
              }}
              placeholder="e.g., drafts.*, test-*"
            />
          </Box>

          <Box>
            <Text size={1} weight="semibold" style={{ marginBottom: '0.5rem' }}>
              Tags to Include (comma-separated)
            </Text>
            <TextInput
              value={editedRule.match.tagInclude?.join(', ') || ''}
              onChange={(e) => {
                const tags = e.currentTarget.value
                  .split(',')
                  .map((t) => t.trim())
                  .filter(Boolean)
                setEditedRule({
                  ...editedRule,
                  match: { ...editedRule.match, tagInclude: tags },
                })
              }}
              placeholder="e.g., dev-only, internal"
            />
          </Box>

          <Box>
            <Text size={1} weight="semibold" style={{ marginBottom: '0.5rem' }}>
              Preserve Fields (comma-separated)
            </Text>
            <TextInput
              value={editedRule.preserveFields?.join(', ') || ''}
              onChange={(e) => {
                const fields = e.currentTarget.value
                  .split(',')
                  .map((f) => f.trim())
                  .filter(Boolean)
                setEditedRule({
                  ...editedRule,
                  preserveFields: fields,
                })
              }}
              placeholder="e.g., _keepLocal, devOnly, testMeta"
            />
            <Text size={1} muted style={{ marginTop: '0.25rem' }}>
              Fields to always keep from target dataset
            </Text>
          </Box>

          <Flex align="center" gap={2}>
            <Checkbox
              checked={editedRule.preserveWhenTargetIsNewer || false}
              onChange={(e) =>
                setEditedRule({
                  ...editedRule,
                  preserveWhenTargetIsNewer: e.currentTarget.checked,
                })
              }
            />
            <Text size={1}>Preserve target value when it's newer</Text>
          </Flex>

          <Flex align="center" gap={2}>
            <Checkbox
              checked={editedRule.enabled !== false}
              onChange={(e) =>
                setEditedRule({ ...editedRule, enabled: e.currentTarget.checked })
              }
            />
            <Text size={1}>Rule enabled</Text>
          </Flex>
        </Stack>

        <Flex gap={3}>
          <Button
            text="Cancel"
            icon={CloseIcon}
            mode="ghost"
            onClick={onCancel}
            flex={1}
          />
          <Button
            text={isNew ? 'Create Rule' : 'Save Changes'}
            icon={CheckmarkIcon}
            tone="positive"
            onClick={handleSave}
            flex={1}
          />
        </Flex>
      </Stack>
    </Card>
  )
}
