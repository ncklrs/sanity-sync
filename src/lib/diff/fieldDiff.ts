/**
 * Field-level diff computation
 */

import fastDeepEqual from 'fast-deep-equal'
import type { FieldDiff } from '../../types'

/**
 * Compute diff for a single field
 */
export function computeFieldDiff(
  path: string,
  sourceValue: any,
  targetValue: any
): FieldDiff {
  const sourceExists = sourceValue !== undefined
  const targetExists = targetValue !== undefined

  // Both values are the same
  if (fastDeepEqual(sourceValue, targetValue)) {
    return {
      path,
      changed: false,
      op: 'none',
      sourceValue,
      targetValue,
      conflict: false,
    }
  }

  // Field added in source
  if (sourceExists && !targetExists) {
    return {
      path,
      changed: true,
      op: 'add',
      sourceValue,
      targetValue: undefined,
      conflict: false,
      suggestion: 'source',
    }
  }

  // Field removed from source (exists in target only)
  if (!sourceExists && targetExists) {
    return {
      path,
      changed: true,
      op: 'remove',
      sourceValue: undefined,
      targetValue,
      conflict: false,
      suggestion: 'target',
    }
  }

  // Field changed in both - potential conflict
  return {
    path,
    changed: true,
    op: 'replace',
    sourceValue,
    targetValue,
    conflict: true, // Mark as conflict when both have different values
    suggestion: 'source', // Default suggestion
  }
}

/**
 * Compute diff for array fields with structural comparison
 */
export function computeArrayDiff(sourcePath: string, sourceArray: any[], targetArray: any[]) {
  // For arrays, we compare them as a whole by default
  // For block content and structured arrays, we could do element-by-element comparison
  return computeFieldDiff(sourcePath, sourceArray, targetArray)
}

/**
 * Check if a value is a Portable Text block
 */
export function isPortableText(value: any): boolean {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((block) => block._type && typeof block._type === 'string')
  )
}

/**
 * Compute diff for Portable Text blocks
 */
export function computePortableTextDiff(
  path: string,
  sourceBlocks: any[],
  targetBlocks: any[]
): FieldDiff {
  // For now, treat as regular array
  // Could implement block-level diff in the future
  return computeFieldDiff(path, sourceBlocks, targetBlocks)
}
