/**
 * Preview API endpoint
 * Shows what would be synced without executing
 */

import type { SanityClient } from '@sanity/client'
import type { PreviewResult, SyncOptions, SyncRuleRecord } from '../../types'
import { computePatches } from '../../lib/merge/patcher'

export interface PreviewRequest {
  selectedDocIds: string[]
  source: string
  target: string
  syncPolicy: string
  rules?: SyncRuleRecord[]
  options?: SyncOptions
}

export interface PreviewResponse {
  success: boolean
  preview?: PreviewResult
  error?: string
}

/**
 * Handle preview request
 */
export async function handlePreview(
  request: PreviewRequest,
  sourceClient: SanityClient,
  targetClient: SanityClient
): Promise<PreviewResponse> {
  try {
    const { selectedDocIds, syncPolicy, rules, options } = request

    // Fetch selected documents from both datasets
    const [sourceDocs, targetDocs] = await Promise.all([
      fetchDocumentsBatch(sourceClient, selectedDocIds),
      fetchDocumentsBatch(targetClient, selectedDocIds),
    ])

    // Compute patches
    const patches = await computePatches(sourceDocs, targetDocs, {
      policy: syncPolicy as any,
      rules,
      options,
    })

    const preview: PreviewResult = {
      jobId: `preview-${Date.now()}`,
      estimatedOperations: patches.length,
      patches,
      warnings: [],
    }

    return {
      success: true,
      preview,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Fetch multiple documents by IDs
 */
async function fetchDocumentsBatch(client: SanityClient, ids: string[]): Promise<any[]> {
  if (ids.length === 0) return []

  const query = `*[_id in $ids]`
  return client.fetch(query, { ids })
}
