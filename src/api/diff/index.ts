/**
 * Diff API endpoint
 * Computes field-level diff for a specific document
 */

import type { SanityClient } from '@sanity/client'
import type { DiffResult } from '../../types'
import { computeDocumentDiff } from '../../lib/diff'

export interface DiffRequest {
  docId: string
  source: string
  target: string
}

export interface DiffResponse {
  success: boolean
  diff?: DiffResult
  error?: string
}

/**
 * Handle diff request
 */
export async function handleDiff(
  request: DiffRequest,
  sourceClient: SanityClient,
  targetClient: SanityClient
): Promise<DiffResponse> {
  try {
    const { docId } = request

    // Fetch full documents
    const [sourceDoc, targetDoc] = await Promise.all([
      sourceClient.getDocument(docId).catch(() => null),
      targetClient.getDocument(docId).catch(() => null),
    ])

    const diff = computeDocumentDiff(sourceDoc ?? null, targetDoc ?? null, docId)

    return {
      success: true,
      diff,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
