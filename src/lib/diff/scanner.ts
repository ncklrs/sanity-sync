/**
 * Dataset scanning algorithm
 */

import type { SanityClient } from '@sanity/client'
import type { ChangeRecord, ScanResult, SyncFilters, DocumentSummary } from '../../types'
import { DEFAULT_PAGE_SIZE } from '../../utils/constants'
import {
  sanitizeGroqString,
  sanitizeIdPattern,
  sanitizeDocumentTypes,
  validateIsoDate,
} from '../../utils/sanitize'

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

  // Filter by document types with sanitization
  if (filters.documentTypes && filters.documentTypes.length > 0) {
    const sanitizedTypes = sanitizeDocumentTypes(filters.documentTypes)
    const types = sanitizedTypes.map((t) => `"${t}"`).join(', ')
    conditions.push(`_type in [${types}]`)
  }

  // Filter by ID patterns with sanitization
  if (filters.idPatterns && filters.idPatterns.length > 0) {
    const patterns = filters.idPatterns
      .map((pattern) => {
        const sanitized = sanitizeIdPattern(pattern)
        return `_id match "${sanitized}"`
      })
      .join(' || ')
    conditions.push(`(${patterns})`)
  }

  // Filter by update date range with validation
  if (filters.updatedAfter) {
    if (!validateIsoDate(filters.updatedAfter)) {
      throw new Error('Invalid updatedAfter date format')
    }
    const sanitized = sanitizeGroqString(filters.updatedAfter)
    conditions.push(`_updatedAt > "${sanitized}"`)
  }

  if (filters.updatedBefore) {
    if (!validateIsoDate(filters.updatedBefore)) {
      throw new Error('Invalid updatedBefore date format')
    }
    const sanitized = sanitizeGroqString(filters.updatedBefore)
    conditions.push(`_updatedAt < "${sanitized}"`)
  }

  // Cursor-based pagination with sanitization
  if (cursor) {
    const sanitized = sanitizeGroqString(cursor)
    conditions.push(`_id > "${sanitized}"`)
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
