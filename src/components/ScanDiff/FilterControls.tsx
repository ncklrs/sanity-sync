/**
 * Filter controls component
 */

import { Card, Flex, Stack, Text, TextInput, Box } from '@sanity/ui'
import type { SyncFilters } from '../../types'

interface FilterControlsProps {
  filters: SyncFilters
  onFiltersChange: (filters: SyncFilters) => void
}

export function FilterControls({ filters, onFiltersChange }: FilterControlsProps) {
  return (
    <Card padding={4} radius={2} shadow={1}>
      <Stack space={3}>
        <Text size={1} weight="semibold">
          Filters
        </Text>

        <Flex gap={3} wrap="wrap">
          <Box flex={1} style={{ minWidth: '200px' }}>
            <Text size={1} muted style={{ marginBottom: '0.5rem' }}>
              Document Types (comma-separated)
            </Text>
            <TextInput
              placeholder="e.g., article, page, product"
              value={filters.documentTypes?.join(', ') || ''}
              onChange={(e) => {
                const types = e.currentTarget.value
                  .split(',')
                  .map((t) => t.trim())
                  .filter(Boolean)
                onFiltersChange({ ...filters, documentTypes: types })
              }}
            />
          </Box>

          <Box flex={1} style={{ minWidth: '200px' }}>
            <Text size={1} muted style={{ marginBottom: '0.5rem' }}>
              ID Pattern (glob)
            </Text>
            <TextInput
              placeholder="e.g., drafts.*, prod-*"
              value={filters.idPatterns?.[0] || ''}
              onChange={(e) => {
                const pattern = e.currentTarget.value
                onFiltersChange({
                  ...filters,
                  idPatterns: pattern ? [pattern] : undefined,
                })
              }}
            />
          </Box>
        </Flex>

        <Flex gap={3} wrap="wrap">
          <Box flex={1} style={{ minWidth: '200px' }}>
            <Text size={1} muted style={{ marginBottom: '0.5rem' }}>
              Updated After
            </Text>
            <TextInput
              type="date"
              value={filters.updatedAfter || ''}
              onChange={(e) => {
                onFiltersChange({ ...filters, updatedAfter: e.currentTarget.value })
              }}
            />
          </Box>

          <Box flex={1} style={{ minWidth: '200px' }}>
            <Text size={1} muted style={{ marginBottom: '0.5rem' }}>
              Updated Before
            </Text>
            <TextInput
              type="date"
              value={filters.updatedBefore || ''}
              onChange={(e) => {
                onFiltersChange({ ...filters, updatedBefore: e.currentTarget.value })
              }}
            />
          </Box>
        </Flex>
      </Stack>
    </Card>
  )
}
