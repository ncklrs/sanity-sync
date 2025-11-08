/**
 * Job details component
 */

import { Card, Stack, Text, Button, Flex, Box, Heading, Badge } from '@sanity/ui'
import { CloseIcon } from '@sanity/icons'
import type { SyncJobRecord } from '../../types'

interface JobDetailsProps {
  job: SyncJobRecord
  onClose: () => void
}

export function JobDetails({ job, onClose }: JobDetailsProps) {
  return (
    <Card padding={4} radius={2} shadow={2} tone="primary">
      <Stack space={4}>
        <Flex justify="space-between" align="center">
          <Heading size={2}>Job Details: {job.jobId}</Heading>
          <Button icon={CloseIcon} mode="bleed" onClick={onClose} />
        </Flex>

        <Card padding={3} radius={2}>
          <Stack space={2}>
            <Flex gap={3}>
              <Box flex={1}>
                <Text size={1} muted>
                  Source
                </Text>
                <Text size={1} weight="semibold">
                  {job.source}
                </Text>
              </Box>
              <Box flex={1}>
                <Text size={1} muted>
                  Target
                </Text>
                <Text size={1} weight="semibold">
                  {job.target}
                </Text>
              </Box>
              <Box flex={1}>
                <Text size={1} muted>
                  Mode
                </Text>
                <Text size={1} weight="semibold">
                  {job.mode}
                </Text>
              </Box>
              <Box flex={1}>
                <Text size={1} muted>
                  Status
                </Text>
                <Badge
                  tone={
                    job.status === 'completed'
                      ? 'positive'
                      : job.status === 'partial'
                        ? 'caution'
                        : 'critical'
                  }
                >
                  {job.status}
                </Badge>
              </Box>
            </Flex>

            <Flex gap={3}>
              <Box flex={1}>
                <Text size={1} muted>
                  Started At
                </Text>
                <Text size={1}>{new Date(job.startedAt).toLocaleString()}</Text>
              </Box>
              {job.completedAt && (
                <Box flex={1}>
                  <Text size={1} muted>
                    Completed At
                  </Text>
                  <Text size={1}>{new Date(job.completedAt).toLocaleString()}</Text>
                </Box>
              )}
            </Flex>
          </Stack>
        </Card>

        {job.options && (
          <Card padding={3} radius={2}>
            <Stack space={2}>
              <Heading size={1}>Options</Heading>
              <Flex gap={3} wrap="wrap">
                {job.options.includeAssets !== undefined && (
                  <Text size={1}>
                    Include Assets: {job.options.includeAssets ? 'Yes' : 'No'}
                  </Text>
                )}
                {job.options.dryRun !== undefined && (
                  <Text size={1}>Dry Run: {job.options.dryRun ? 'Yes' : 'No'}</Text>
                )}
                {job.options.batchSize !== undefined && (
                  <Text size={1}>Batch Size: {job.options.batchSize}</Text>
                )}
              </Flex>
            </Stack>
          </Card>
        )}

        <Card padding={3} radius={2}>
          <Stack space={2}>
            <Heading size={1}>Changes ({job.changes.length})</Heading>
            <Stack space={1}>
              {job.changes.map((change, i) => (
                <Flex key={i} gap={2} align="center">
                  <Badge
                    tone={
                      change.action === 'added'
                        ? 'positive'
                        : change.action === 'removed'
                          ? 'critical'
                          : 'caution'
                    }
                  >
                    {change.action}
                  </Badge>
                  <Text size={1}>
                    {change.docId} ({change.type})
                  </Text>
                  {change.fieldsChanged && change.fieldsChanged.length > 0 && (
                    <Text size={1} muted>
                      Fields: {change.fieldsChanged.join(', ')}
                    </Text>
                  )}
                </Flex>
              ))}
            </Stack>
          </Stack>
        </Card>

        {job.errors && job.errors.length > 0 && (
          <Card padding={3} radius={2} tone="critical">
            <Stack space={2}>
              <Heading size={1}>Errors ({job.errors.length})</Heading>
              <Stack space={2}>
                {job.errors.map((error, i) => (
                  <Card key={i} padding={2} tone="default">
                    <Stack space={1}>
                      <Flex gap={2} align="center">
                        <Badge tone="critical">{error.code}</Badge>
                        {error.docId && <Text size={1}>{error.docId}</Text>}
                      </Flex>
                      <Text size={1}>{error.message}</Text>
                      <Text size={1} muted>
                        {new Date(error.timestamp).toLocaleString()}
                      </Text>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            </Stack>
          </Card>
        )}
      </Stack>
    </Card>
  )
}
