/**
 * Patch computation for sync operations
 */

import type { SanityDocument } from '@sanity/types'
import type { PatchPreview, SyncPolicy, SyncRuleRecord, SyncOptions } from '../../types'
import { applyMergePolicy } from './policy'

export interface PatchContext {
  policy: SyncPolicy
  rules?: SyncRuleRecord[]
  options?: SyncOptions
}

/**
 * Compute patches for a set of documents
 */
export async function computePatches(
  sourceDocs: SanityDocument[],
  targetDocs: SanityDocument[],
  context: PatchContext
): Promise<PatchPreview[]> {
  const patches: PatchPreview[] = []

  // Build target doc map
  const targetMap = new Map<string, SanityDocument>()
  targetDocs.forEach((doc) => targetMap.set(doc._id, doc))

  for (const sourceDoc of sourceDocs) {
    const targetDoc = targetMap.get(sourceDoc._id)

    if (!targetDoc) {
      // New document - create
      patches.push({
        docId: sourceDoc._id,
        type: sourceDoc._type,
        operation: 'create',
        fields: Object.keys(sourceDoc).filter((k) => !k.startsWith('_')),
        preview: sourceDoc,
      })
    } else {
      // Existing document - apply merge policy
      const mergedDoc = applyMergePolicy(sourceDoc, targetDoc, context.policy, context.rules)

      // Check if anything changed
      const changedFields = getChangedFields(targetDoc, mergedDoc)

      if (changedFields.length > 0) {
        patches.push({
          docId: sourceDoc._id,
          type: sourceDoc._type,
          operation: 'patch',
          fields: changedFields,
          preview: mergedDoc,
        })
      }
    }
  }

  return patches
}

/**
 * Get list of fields that changed between two documents
 */
function getChangedFields(oldDoc: any, newDoc: any): string[] {
  const changed: string[] = []

  for (const key of Object.keys(newDoc)) {
    if (key.startsWith('_')) continue

    if (JSON.stringify(oldDoc[key]) !== JSON.stringify(newDoc[key])) {
      changed.push(key)
    }
  }

  return changed
}
