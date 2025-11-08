/**
 * Document-level diff algorithm
 */

import type { SanityDocument } from '@sanity/types'
import type { DiffResult, FieldDiff } from '../../types'
import { computeFieldDiff } from './fieldDiff'
import { calculateConflictScore } from './conflictScore'

/**
 * Compute diff between two documents
 */
export function computeDocumentDiff(
  sourceDoc: SanityDocument | null,
  targetDoc: SanityDocument | null,
  docId: string
): DiffResult {
  // Case 1: Document added to source
  if (sourceDoc && !targetDoc) {
    return {
      docId,
      sourceDoc,
      targetDoc: null,
      fieldDiffs: computeAllFieldDiffs(sourceDoc, null),
      hasConflicts: false,
    }
  }

  // Case 2: Document removed from source
  if (!sourceDoc && targetDoc) {
    return {
      docId,
      sourceDoc: null,
      targetDoc,
      fieldDiffs: computeAllFieldDiffs(null, targetDoc),
      hasConflicts: false,
    }
  }

  // Case 3: Document doesn't exist in either (shouldn't happen)
  if (!sourceDoc && !targetDoc) {
    return {
      docId,
      sourceDoc: null,
      targetDoc: null,
      fieldDiffs: [],
      hasConflicts: false,
    }
  }

  // Case 4: Document exists in both - compute field diffs
  const fieldDiffs = computeAllFieldDiffs(sourceDoc!, targetDoc!)
  const hasConflicts = fieldDiffs.some((diff) => diff.conflict)
  const conflictScore = hasConflicts
    ? calculateConflictScore(sourceDoc!, targetDoc!, fieldDiffs)
    : 0

  return {
    docId,
    sourceDoc: sourceDoc!,
    targetDoc: targetDoc!,
    fieldDiffs,
    hasConflicts,
    conflictScore,
  }
}

/**
 * Compute diffs for all fields in documents
 */
function computeAllFieldDiffs(
  sourceDoc: SanityDocument | null,
  targetDoc: SanityDocument | null
): FieldDiff[] {
  const diffs: FieldDiff[] = []

  // Get all unique field paths from both documents
  const sourceFields = sourceDoc ? getAllFieldPaths(sourceDoc) : new Set<string>()
  const targetFields = targetDoc ? getAllFieldPaths(targetDoc) : new Set<string>()
  const allFields = new Set([...sourceFields, ...targetFields])

  for (const fieldPath of allFields) {
    const sourceValue = sourceDoc ? getValueAtPath(sourceDoc, fieldPath) : undefined
    const targetValue = targetDoc ? getValueAtPath(targetDoc, fieldPath) : undefined

    const diff = computeFieldDiff(fieldPath, sourceValue, targetValue)
    diffs.push(diff)
  }

  return diffs
}

/**
 * Get all field paths in a document
 */
function getAllFieldPaths(obj: any, prefix = ''): Set<string> {
  const paths = new Set<string>()

  if (obj === null || typeof obj !== 'object') {
    return paths
  }

  for (const [key, value] of Object.entries(obj)) {
    // Skip system fields that start with _
    if (key.startsWith('_')) {
      continue
    }

    const path = prefix ? `${prefix}.${key}` : key
    paths.add(path)

    // Recurse for objects (but not arrays - we treat them as single values)
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const nestedPaths = getAllFieldPaths(value, path)
      nestedPaths.forEach((p) => paths.add(p))
    }
  }

  return paths
}

/**
 * Get value at a dot-notation path
 */
function getValueAtPath(obj: any, path: string): any {
  const parts = path.split('.')
  let current = obj

  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined
    }
    current = current[part]
  }

  return current
}

/**
 * Quick check if two documents are identical based on _updatedAt
 */
export function areDocumentsIdentical(
  sourceDoc: SanityDocument,
  targetDoc: SanityDocument
): boolean {
  return sourceDoc._updatedAt === targetDoc._updatedAt
}
