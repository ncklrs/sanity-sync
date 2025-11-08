/**
 * Transaction executor for sync operations
 */

import type { SanityClient } from '@sanity/client'
import type { ExecuteResult, ChangeRecord, ErrorRecord, SyncPolicy } from '../../types'
import { computePatches, type PatchContext } from '../merge/patcher'
import { retryWithBackoff, isRetryableError } from '../../utils/retry'
import { DEFAULT_BATCH_SIZE } from '../../utils/constants'

/**
 * Execute sync operation
 */
export async function executeSync(
  sourceClient: SanityClient,
  targetClient: SanityClient,
  selectedDocIds: string[],
  context: PatchContext
): Promise<ExecuteResult> {
  const jobId = `sync-${Date.now()}`
  const batchSize = context.options?.batchSize || DEFAULT_BATCH_SIZE
  const dryRun = context.options?.dryRun || false

  const changes: ChangeRecord[] = []
  const errors: ErrorRecord[] = []

  // Process in batches
  const batches = chunkArray(selectedDocIds, batchSize)

  for (const batch of batches) {
    try {
      await processBatch(
        sourceClient,
        targetClient,
        batch,
        context,
        dryRun,
        changes,
        errors
      )
    } catch (error) {
      errors.push({
        code: 'unknown',
        message: error instanceof Error ? error.message : 'Batch failed',
        timestamp: new Date().toISOString(),
        retryable: false,
      })
    }
  }

  return {
    jobId,
    status: errors.length === 0 ? 'completed' : 'partial',
    successCount: changes.filter((c) => c.action !== 'unchanged').length,
    failureCount: errors.length,
    errors: errors.length > 0 ? errors : undefined,
    changes,
  }
}

/**
 * Process a single batch of documents
 */
async function processBatch(
  sourceClient: SanityClient,
  targetClient: SanityClient,
  docIds: string[],
  context: PatchContext,
  dryRun: boolean,
  changes: ChangeRecord[],
  errors: ErrorRecord[]
): Promise<void> {
  // Fetch documents
  const [sourceDocs, targetDocs] = await Promise.all([
    fetchDocuments(sourceClient, docIds),
    fetchDocuments(targetClient, docIds),
  ])

  // Compute patches
  const patches = await computePatches(sourceDocs, targetDocs, context)

  if (dryRun) {
    // Just record what would happen
    patches.forEach((patch) => {
      changes.push({
        docId: patch.docId,
        type: patch.type,
        action: patch.operation === 'create' ? 'added' : 'updated',
        fieldsChanged: patch.fields,
      })
    })
    return
  }

  // Execute patches with retry
  for (const patch of patches) {
    try {
      await retryWithBackoff(
        async () => {
          if (patch.operation === 'create') {
            await targetClient.create(patch.preview)
          } else if (patch.operation === 'patch') {
            await targetClient.createOrReplace(patch.preview)
          }
        },
        { shouldRetry: isRetryableError }
      )

      changes.push({
        docId: patch.docId,
        type: patch.type,
        action: patch.operation === 'create' ? 'added' : 'updated',
        fieldsChanged: patch.fields,
      })
    } catch (error) {
      errors.push({
        docId: patch.docId,
        code: 'unknown',
        message: error instanceof Error ? error.message : 'Patch failed',
        timestamp: new Date().toISOString(),
        retryable: isRetryableError(error as Error),
      })
    }
  }
}

/**
 * Fetch documents by IDs
 */
async function fetchDocuments(client: SanityClient, ids: string[]): Promise<any[]> {
  if (ids.length === 0) return []

  const query = `*[_id in $ids]`
  return client.fetch(query, { ids })
}

/**
 * Split array into chunks
 */
function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}
