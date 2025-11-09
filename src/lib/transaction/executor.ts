/**
 * Transaction executor for sync operations
 */

import type { SanityClient } from '@sanity/client'
import type { SanityDocument } from '@sanity/types'
import type { ExecuteResult, ChangeRecord, ErrorRecord } from '../../types'
import { computePatches, type PatchContext } from '../merge/patcher'
import { retryWithBackoff, isRetryableError } from '../../utils/retry'
import { DEFAULT_BATCH_SIZE } from '../../utils/constants'
import { findAssetReferences, transferAssets, remapAssetReferences } from '../asset/transfer'

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

  // Handle asset transfer if enabled
  const includeAssets = context.options?.includeAssets !== false
  const processedSourceDocs: SanityDocument[] = []

  if (includeAssets && !dryRun) {
    // Process each document for asset transfer
    for (const sourceDoc of sourceDocs) {
      try {
        // Find all asset references in the document
        const assetIds = findAssetReferences(sourceDoc as Record<string, unknown>)

        if (assetIds.length > 0) {
          // Transfer assets
          const assetMap = await transferAssets(sourceClient, targetClient, assetIds, {
            linkExistingAssets: true,
            skipAssets: false,
          })

          // Remap asset references in the document
          const remappedDoc = remapAssetReferences(
            sourceDoc as Record<string, unknown>,
            assetMap
          )
          processedSourceDocs.push(remappedDoc as SanityDocument)
        } else {
          processedSourceDocs.push(sourceDoc)
        }
      } catch (error) {
        // Log asset transfer error but continue with original document
        errors.push({
          docId: sourceDoc._id,
          code: 'asset-failure',
          message: error instanceof Error ? error.message : 'Asset transfer failed',
          timestamp: new Date().toISOString(),
          retryable: false,
        })
        processedSourceDocs.push(sourceDoc)
      }
    }
  } else {
    processedSourceDocs.push(...sourceDocs)
  }

  // Compute patches
  const patches = await computePatches(processedSourceDocs, targetDocs, context)

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
async function fetchDocuments(client: SanityClient, ids: string[]): Promise<SanityDocument[]> {
  if (ids.length === 0) return []

  const query = `*[_id in $ids]`
  return client.fetch<SanityDocument[]>(query, { ids })
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
