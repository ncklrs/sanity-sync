/**
 * Dataset scanning algorithm
 */

import type { SanityClient } from '@sanity/client'
import type { ChangeRecord, ScanResult, SyncFilters, DocumentSummary } from '../../types'
import { DEFAULT_PAGE_SIZE } from '../../utils/constants'

/**
 * Scan changes between two datasets
 */
export async function scanChanges(
  sourceClient: SanityClient,
  targetClient: SanityClient,
  filters: SyncFilters = {},
  cursor?: string
): Promise<ScanResult> {
  const pageSize = DEFAULT_PAGE_SIZE

  // Build GROQ query based on filters
  const query = buildScanQuery(filters, pageSize, cursor)

  // Fetch document summaries from source
  const sourceResults = await sourceClient.fetch<DocumentSummary[]>(query)

  if (sourceResults.length === 0) {
    return {
      changes: [],
      totalDocs: 0,
      hasMore: false,
    }
  }

  // Get IDs to compare
  const sourceIds = sourceResults.map((doc) => doc._id)

  // Fetch same docs from target
  const targetQuery = `*[_id in $ids]{_id, _type, _updatedAt, _rev}`
  const targetResults = await targetClient.fetch<DocumentSummary[]>(targetQuery, {
    ids: sourceIds,
  })

  // Build lookup map for target docs
  const targetMap = new Map<string, DocumentSummary>()
  targetResults.forEach((doc) => targetMap.set(doc._id, doc))

  // Compare and build change records
  const changes: ChangeRecord[] = []

  for (const sourceDoc of sourceResults) {
    const targetDoc = targetMap.get(sourceDoc._id)

    if (!targetDoc) {
      // Document doesn't exist in target
      changes.push({
        docId: sourceDoc._id,
        type: sourceDoc._type,
        action: 'added',
        sourceTimestamp: sourceDoc._updatedAt,
      })
    } else if (sourceDoc._updatedAt !== targetDoc._updatedAt) {
      // Document has different timestamps
      changes.push({
        docId: sourceDoc._id,
        type: sourceDoc._type,
        action: 'updated',
        sourceTimestamp: sourceDoc._updatedAt,
        targetTimestamp: targetDoc._updatedAt,
      })
    } else {
      // Documents are identical
      changes.push({
        docId: sourceDoc._id,
        type: sourceDoc._type,
        action: 'unchanged',
        sourceTimestamp: sourceDoc._updatedAt,
        targetTimestamp: targetDoc._updatedAt,
      })
    }
  }

  const hasMore = sourceResults.length === pageSize
  const nextCursor = hasMore ? sourceResults[sourceResults.length - 1]._id : undefined

  return {
    changes,
    totalDocs: sourceResults.length,
    cursor: nextCursor,
    hasMore,
  }
}

/**
 * Build GROQ query for scanning with filters
 */
function buildScanQuery(filters: SyncFilters, limit: number, cursor?: string): string {
  const conditions: string[] = []

  // Filter by document types
  if (filters.documentTypes && filters.documentTypes.length > 0) {
    const types = filters.documentTypes.map((t) => `"${t}"`).join(', ')
    conditions.push(`_type in [${types}]`)
  }

  // Filter by ID patterns (simple contains for now)
  if (filters.idPatterns && filters.idPatterns.length > 0) {
    const patterns = filters.idPatterns
      .map((pattern) => `_id match "${pattern}"`)
      .join(' || ')
    conditions.push(`(${patterns})`)
  }

  // Filter by update date range
  if (filters.updatedAfter) {
    conditions.push(`_updatedAt > "${filters.updatedAfter}"`)
  }

  if (filters.updatedBefore) {
    conditions.push(`_updatedAt < "${filters.updatedBefore}"`)
  }

  // Cursor-based pagination
  if (cursor) {
    conditions.push(`_id > "${cursor}"`)
  }

  // Build final query
  const whereClause = conditions.length > 0 ? conditions.join(' && ') : 'true'

  return `*[${whereClause}] | order(_id asc) [0...${limit}] {
    _id,
    _type,
    _updatedAt,
    _rev,
    title
  }`
}
