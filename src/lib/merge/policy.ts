/**
 * Merge policy implementation
 */

import type { SanityDocument } from '@sanity/types'
import type { SyncPolicy, SyncRuleRecord } from '../../types'

/**
 * Apply merge policy to combine source and target documents
 */
export function applyMergePolicy(
  sourceDoc: SanityDocument,
  targetDoc: SanityDocument,
  policy: SyncPolicy,
  rules?: SyncRuleRecord[]
): SanityDocument {
  switch (policy) {
    case 'overwrite':
      return applyOverwrite(sourceDoc, targetDoc)

    case 'merge_preserve':
      return applyMergePreserve(sourceDoc, targetDoc, rules)

    case 'preserve_target_if_newer':
      return applyPreserveIfNewer(sourceDoc, targetDoc)

    case 'smart_merge':
      return applySmartMerge(sourceDoc, targetDoc, rules)

    default:
      return applyOverwrite(sourceDoc, targetDoc)
  }
}

/**
 * Overwrite: source wins completely
 */
function applyOverwrite(sourceDoc: SanityDocument, targetDoc: SanityDocument): SanityDocument {
  return {
    ...sourceDoc,
    _id: targetDoc._id,
    _rev: targetDoc._rev,
  }
}

/**
 * Merge & Preserve: keep specific fields from target
 */
function applyMergePreserve(
  sourceDoc: SanityDocument,
  targetDoc: SanityDocument,
  rules?: SyncRuleRecord[]
): SanityDocument {
  const merged = { ...sourceDoc }

  // Find matching rules
  const matchingRules = rules?.filter((rule) => matchesRule(sourceDoc, rule)) || []

  // Collect all preserve fields
  const preserveFields = new Set<string>()
  matchingRules.forEach((rule) => {
    rule.preserveFields?.forEach((field) => preserveFields.add(field))
  })

  // Keep preserved fields from target
  preserveFields.forEach((field) => {
    if (targetDoc[field] !== undefined) {
      merged[field] = targetDoc[field]
    }
  })

  merged._id = targetDoc._id
  merged._rev = targetDoc._rev

  return merged
}

/**
 * Preserve if newer: for each field, keep the one from newer document
 */
function applyPreserveIfNewer(
  sourceDoc: SanityDocument,
  targetDoc: SanityDocument
): SanityDocument {
  const sourceTime = new Date(sourceDoc._updatedAt).getTime()
  const targetTime = new Date(targetDoc._updatedAt).getTime()

  // If target is newer, keep target; otherwise use source
  if (targetTime > sourceTime) {
    return {
      ...targetDoc,
    }
  }

  return {
    ...sourceDoc,
    _id: targetDoc._id,
    _rev: targetDoc._rev,
  }
}

/**
 * Smart merge: union arrays and references, preserve local-only entries
 */
function applySmartMerge(
  sourceDoc: SanityDocument,
  targetDoc: SanityDocument,
  rules?: SyncRuleRecord[]
): SanityDocument {
  const merged = { ...sourceDoc }

  // For each field in target
  for (const [key, targetValue] of Object.entries(targetDoc)) {
    if (key.startsWith('_')) continue

    const sourceValue = sourceDoc[key]

    // If field is array, try to merge
    if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
      merged[key] = mergeArrays(sourceValue, targetValue)
    } else if (sourceValue === undefined && targetValue !== undefined) {
      // Keep target-only fields
      merged[key] = targetValue
    }
  }

  merged._id = targetDoc._id
  merged._rev = targetDoc._rev

  return merged
}

/**
 * Merge two arrays with deduplication
 */
function mergeArrays(sourceArray: any[], targetArray: any[]): any[] {
  const seen = new Set()
  const result = []

  for (const item of [...sourceArray, ...targetArray]) {
    const key = item._key || JSON.stringify(item)
    if (!seen.has(key)) {
      seen.add(key)
      result.push(item)
    }
  }

  return result
}

/**
 * Check if a document matches a rule
 */
function matchesRule(doc: SanityDocument, rule: SyncRuleRecord): boolean {
  const { match } = rule

  // Check document type
  if (match.documentTypes && match.documentTypes.length > 0) {
    if (!match.documentTypes.includes(doc._type)) {
      return false
    }
  }

  // Check ID patterns
  if (match.idPatterns && match.idPatterns.length > 0) {
    const matchesPattern = match.idPatterns.some((pattern) => {
      // Simple glob matching (could be enhanced)
      const regex = new RegExp(pattern.replace('*', '.*'))
      return regex.test(doc._id)
    })

    if (!matchesPattern) {
      return false
    }
  }

  return true
}
