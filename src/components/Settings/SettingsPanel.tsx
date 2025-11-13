/**
 * Enhanced Settings panel with rule management
 */

import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  Stack,
  Text,
  Switch,
  Badge,
  Spinner,
  useToast,
} from '@sanity/ui'
import { AddIcon, TrashIcon, EditIcon } from '@sanity/icons'
import type { ContentSyncConfig, SyncRuleRecord } from '../../types'
import { RuleEditor } from './RuleEditor'

interface SettingsPanelProps {
  config: ContentSyncConfig
}

export function SettingsPanel({ config }: SettingsPanelProps) {
  const toast = useToast()
  const [rules, setRules] = useState<SyncRuleRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [editingRule, setEditingRule] = useState<SyncRuleRecord | null>(null)
  const [isCreatingNew, setIsCreatingNew] = useState(false)

  const loadRules = async () => {
    setIsLoading(true)
    try {
      // TODO: Fetch actual rules from Sanity
      // For now, use mock data
      await new Promise((resolve) => setTimeout(resolve, 500))

      const mockRules: SyncRuleRecord[] = [
        {
          _id: 'rule-1',
          _type: 'syncRule',
          name: 'Preserve Dev Test Data',
          direction: 'pull',
          match: {
            documentTypes: ['testData', 'devConfig'],
          },
          preserveFields: ['devOnly', 'testMeta'],
          enabled: true,
        },
        {
          _id: 'rule-2',
          _type: 'syncRule',
          name: 'Keep Draft Annotations',
          direction: 'both',
          match: {
            documentTypes: ['article', 'page'],
            idPatterns: ['drafts.*'],
          },
          preserveFields: ['_keepLocal', 'internalNotes'],
          preserveWhenTargetIsNewer: true,
          enabled: true,
        },
      ]

      setRules(mockRules)
    } catch (error) {
      toast.push({
        status: 'error',
        title: 'Failed to load rules',
        description: error instanceof Error ? error.message : 'Failed to load sync rules',
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadRules()
  }, [])

  const handleToggleRule = (ruleId: string) => {
    setRules((prev) =>
      prev.map((r) => (r._id === ruleId ? { ...r, enabled: !r.enabled } : r))
    )
    // TODO: Save to Sanity
  }

  const handleDeleteRule = (ruleId: string) => {
    if (confirm('Are you sure you want to delete this rule?')) {
      setRules((prev) => prev.filter((r) => r._id !== ruleId))
      // TODO: Delete from Sanity
    }
  }

  const handleCreateRule = () => {
    setIsCreatingNew(true)
    setEditingRule({
      _id: `rule-${Date.now()}`,
      _type: 'syncRule',
      name: '',
      direction: 'both',
      match: {},
      enabled: true,
    })
  }

  const handleSaveRule = (rule: SyncRuleRecord) => {
    if (isCreatingNew) {
      setRules((prev) => [...prev, rule])
    } else {
      setRules((prev) => prev.map((r) => (r._id === rule._id ? rule : r)))
    }
    // TODO: Save to Sanity
    setEditingRule(null)
    setIsCreatingNew(false)
  }

  const handleCancelEdit = () => {
    setEditingRule(null)
    setIsCreatingNew(false)
  }

  return (
    <Stack space={4}>
      <Box>
        <Heading size={3}>Settings</Heading>
        <Text muted size={1} style={{ marginTop: '0.5rem' }}>
          Configure sync behavior and manage rules
        </Text>
      </Box>

      <Card padding={4} radius={2} shadow={1}>
        <Stack space={3}>
          <Heading size={1}>Plugin Configuration</Heading>

          <Stack space={2}>
            <Text size={1} weight="semibold">
              Datasets
            </Text>
            {config.datasets.map((ds) => (
              <Text key={ds.id} size={1}>
                • {ds.label} ({ds.id})
              </Text>
            ))}
          </Stack>

          <Stack space={2}>
            <Text size={1} weight="semibold">
              Defaults
            </Text>
            <Text size={1}>Default Source: {config.defaultSource || 'None'}</Text>
            <Text size={1}>Default Target: {config.defaultTarget || 'None'}</Text>
            <Text size={1}>Batch Size: {config.batchSize || 50}</Text>
            <Text size={1}>Concurrency: {config.concurrency || 4}</Text>
          </Stack>

          <Stack space={2}>
            <Text size={1} weight="semibold">
              Preserve Hint Fields
            </Text>
            <Text size={1}>
              {config.preserveHintFields?.join(', ') || 'None'}
            </Text>
          </Stack>
        </Stack>
      </Card>

      <Card padding={4} radius={2} shadow={1}>
        <Stack space={3}>
          <Flex justify="space-between" align="center">
            <Heading size={1}>Sync Rules</Heading>
            <Button
              text="New Rule"
              icon={AddIcon}
              tone="primary"
              onClick={handleCreateRule}
              disabled={isLoading || editingRule !== null}
            />
          </Flex>

          {isLoading && (
            <Flex align="center" gap={3}>
              <Spinner />
              <Text>Loading rules...</Text>
            </Flex>
          )}

          {!isLoading && rules.length === 0 && (
            <Text muted align="center">
              No sync rules defined. Create one to preserve specific fields or documents.
            </Text>
          )}

          {!isLoading && rules.length > 0 && (
            <Stack space={2}>
              {rules.map((rule) => (
                <Card key={rule._id} padding={3} radius={2} tone="default" border>
                  <Flex justify="space-between" align="center">
                    <Box flex={1}>
                      <Flex gap={2} align="center" style={{ marginBottom: '0.25rem' }}>
                        <Text size={1} weight="semibold">
                          {rule.name}
                        </Text>
                        <Badge tone={rule.enabled ? 'positive' : 'default'}>
                          {rule.enabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                        <Badge tone="primary">{rule.direction}</Badge>
                      </Flex>

                      {rule.match.documentTypes && (
                        <Text size={1} muted>
                          Types: {rule.match.documentTypes.join(', ')}
                        </Text>
                      )}

                      {rule.preserveFields && rule.preserveFields.length > 0 && (
                        <Text size={1} muted>
                          Preserve: {rule.preserveFields.join(', ')}
                        </Text>
                      )}
                    </Box>

                    <Flex gap={2} align="center">
                      <Switch
                        checked={rule.enabled}
                        onChange={() => handleToggleRule(rule._id)}
                      />
                      <Button
                        icon={EditIcon}
                        mode="ghost"
                        onClick={() => {
                          setEditingRule(rule)
                          setIsCreatingNew(false)
                        }}
                        disabled={editingRule !== null}
                      />
                      <Button
                        icon={TrashIcon}
                        mode="ghost"
                        tone="critical"
                        onClick={() => handleDeleteRule(rule._id)}
                        disabled={editingRule !== null}
                      />
                    </Flex>
                  </Flex>
                </Card>
              ))}
            </Stack>
          )}
        </Stack>
      </Card>

      {editingRule && (
        <RuleEditor
          rule={editingRule}
          onSave={handleSaveRule}
          onCancel={handleCancelEdit}
          isNew={isCreatingNew}
        />
      )}
    </Stack>
  )
}
