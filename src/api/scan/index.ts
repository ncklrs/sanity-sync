/**
 * Scan API endpoint
 * Scans and lists changes between two datasets
 */

import type { SanityClient } from '@sanity/client'
import type { ScanResult, SyncFilters } from '../../types'
import { scanChanges } from '../../lib/diff'

export interface ScanRequest {
  source: string
  target: string
  filters?: SyncFilters
  cursor?: string
}

export interface ScanResponse extends ScanResult {
  success: boolean
  error?: string
}

/**
 * Handle scan request
 */
export async function handleScan(
  request: ScanRequest,
  sourceClient: SanityClient,
  targetClient: SanityClient
): Promise<ScanResponse> {
  try {
    const { filters, cursor } = request

    const result = await scanChanges(sourceClient, targetClient, filters, cursor)

    return {
      success: true,
      ...result,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      changes: [],
      totalDocs: 0,
      hasMore: false,
    }
  }
}
