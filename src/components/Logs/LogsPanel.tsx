/**
 * Enhanced Logs panel with job history
 */

import { useState, useEffect } from 'react'
import { Box, Button, Card, Flex, Heading, Stack, Text, Badge, Spinner } from '@sanity/ui'
import { RefreshIcon, DocumentIcon } from '@sanity/icons'
import type { ContentSyncConfig, SyncJobRecord } from '../../types'
import { JobDetails } from './JobDetails'

interface LogsPanelProps {
  config: ContentSyncConfig
}

export function LogsPanel({ config }: LogsPanelProps) {
  const [jobs, setJobs] = useState<SyncJobRecord[]>([])
  const [selectedJob, setSelectedJob] = useState<SyncJobRecord | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const loadJobs = async () => {
    setIsLoading(true)
    try {
      // TODO: Fetch actual jobs from Sanity
      // For now, use mock data
      await new Promise((resolve) => setTimeout(resolve, 500))

      const mockJobs: SyncJobRecord[] = [
        {
          _id: 'job-1',
          _type: 'syncJob',
          jobId: 'sync-1704123456789',
          source: 'staging',
          target: 'production',
          mode: 'push',
          status: 'completed',
          startedAt: new Date(Date.now() - 3600000).toISOString(),
          completedAt: new Date(Date.now() - 3000000).toISOString(),
          changes: [
            {
              docId: 'article-1',
              type: 'article',
              action: 'updated',
              fieldsChanged: ['title', 'content'],
            },
          ],
        },
        {
          _id: 'job-2',
          _type: 'syncJob',
          jobId: 'sync-1704123456790',
          source: 'production',
          target: 'dev',
          mode: 'pull',
          status: 'partial',
          startedAt: new Date(Date.now() - 7200000).toISOString(),
          completedAt: new Date(Date.now() - 6000000).toISOString(),
          changes: [
            {
              docId: 'page-2',
              type: 'page',
              action: 'added',
            },
          ],
          errors: [
            {
              docId: 'article-3',
              code: 'conflict',
              message: 'Document has been modified in both datasets',
              timestamp: new Date(Date.now() - 6000000).toISOString(),
              retryable: false,
            },
          ],
        },
      ]

      setJobs(mockJobs)
    } catch (error) {
      console.error('Failed to load jobs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadJobs()
  }, [])

  const getStatusColor = (
    status: string
  ): 'positive' | 'caution' | 'critical' | 'default' => {
    switch (status) {
      case 'completed':
        return 'positive'
      case 'partial':
        return 'caution'
      case 'failed':
        return 'critical'
      default:
        return 'default'
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString()
  }

  const getDuration = (job: SyncJobRecord) => {
    if (!job.completedAt) return 'Running...'
    const start = new Date(job.startedAt).getTime()
    const end = new Date(job.completedAt).getTime()
    const seconds = Math.round((end - start) / 1000)
    return `${seconds}s`
  }

  return (
    <Stack space={4}>
      <Flex justify="space-between" align="center">
        <Box>
          <Heading size={3}>Sync Logs</Heading>
          <Text muted size={1} style={{ marginTop: '0.5rem' }}>
            View history of sync operations
          </Text>
        </Box>
        <Button
          text="Refresh"
          icon={RefreshIcon}
          mode="ghost"
          onClick={loadJobs}
          disabled={isLoading}
        />
      </Flex>

      {isLoading && (
        <Card padding={4} tone="primary">
          <Flex align="center" gap={3}>
            <Spinner />
            <Text>Loading jobs...</Text>
          </Flex>
        </Card>
      )}

      {!isLoading && jobs.length === 0 && (
        <Card padding={4} tone="transparent" border>
          <Text muted align="center">
            No sync jobs found. Execute a sync to see logs here.
          </Text>
        </Card>
      )}

      {!isLoading && jobs.length > 0 && (
        <Stack space={3}>
          {jobs.map((job) => (
            <Card key={job._id} padding={3} radius={2} shadow={1}>
              <Flex justify="space-between" align="center">
                <Box flex={1}>
                  <Flex gap={2} align="center" style={{ marginBottom: '0.5rem' }}>
                    <Badge tone={getStatusColor(job.status)}>{job.status}</Badge>
                    <Text size={1} weight="semibold">
                      {job.source} → {job.target}
                    </Text>
                    <Text size={1} muted>
                      ({job.mode})
                    </Text>
                  </Flex>

                  <Text size={1} muted>
                    Job ID: {job.jobId}
                  </Text>

                  <Flex gap={3} style={{ marginTop: '0.25rem' }}>
                    <Text size={1} muted>
                      Started: {formatDate(job.startedAt)}
                    </Text>
                    <Text size={1} muted>
                      Duration: {getDuration(job)}
                    </Text>
                  </Flex>

                  <Flex gap={3} style={{ marginTop: '0.25rem' }}>
                    <Text size={1}>
                      Changes: {job.changes.length}
                    </Text>
                    {job.errors && job.errors.length > 0 && (
                      <Text size={1} tone="critical">
                        Errors: {job.errors.length}
                      </Text>
                    )}
                  </Flex>
                </Box>

                <Button
                  text="View Details"
                  icon={DocumentIcon}
                  mode="ghost"
                  fontSize={1}
                  onClick={() => setSelectedJob(job)}
                />
              </Flex>
            </Card>
          ))}
        </Stack>
      )}

      {selectedJob && (
        <JobDetails job={selectedJob} onClose={() => setSelectedJob(null)} />
      )}
    </Stack>
  )
}
