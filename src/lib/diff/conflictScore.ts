/**
 * Conflict scoring algorithm
 */

import type { SanityDocument } from '@sanity/types'
import type { FieldDiff } from '../../types'

/**
 * Calculate a conflict score for a document
 * Higher score means more likely to have significant conflicts
 * Range: 0-100
 */
export function calculateConflictScore(
  sourceDoc: SanityDocument,
  targetDoc: SanityDocument,
  fieldDiffs: FieldDiff[]
): number {
  let score = 0

  // Factor 1: Time delta between updates (max 40 points)
  const timeDelta = calculateTimeDelta(sourceDoc, targetDoc)
  score += Math.min(timeDelta * 20, 40)

  // Factor 2: Number of conflicting fields (max 30 points)
  const conflictCount = fieldDiffs.filter((d) => d.conflict).length
  const totalFields = fieldDiffs.length
  const conflictRatio = totalFields > 0 ? conflictCount / totalFields : 0
  score += conflictRatio * 30

  // Factor 3: Depth of changes (max 30 points)
  const depthScore = calculateDepthScore(fieldDiffs)
  score += depthScore * 30

  return Math.min(Math.round(score), 100)
}

/**
 * Calculate time delta score (0-2)
 * 0 = same time or very close
 * 1 = moderate delta
 * 2 = large delta
 */
function calculateTimeDelta(sourceDoc: SanityDocument, targetDoc: SanityDocument): number {
  const sourceTime = new Date(sourceDoc._updatedAt).getTime()
  const targetTime = new Date(targetDoc._updatedAt).getTime()

  const deltaMs = Math.abs(sourceTime - targetTime)
  const deltaHours = deltaMs / (1000 * 60 * 60)

  if (deltaHours < 1) return 0
  if (deltaHours < 24) return 1
  return 2
}

/**
 * Calculate depth score (0-1)
 * Higher when deep nested fields are changed
 */
function calculateDepthScore(fieldDiffs: FieldDiff[]): number {
  if (fieldDiffs.length === 0) return 0

  const depths = fieldDiffs
    .filter((d) => d.changed)
    .map((d) => d.path.split('.').length - 1)

  const avgDepth = depths.reduce((sum, d) => sum + d, 0) / depths.length
  return Math.min(avgDepth / 3, 1) // Normalize to 0-1
}

/**
 * Suggest winner based on timestamps
 */
export function suggestWinner(
  sourceDoc: SanityDocument,
  targetDoc: SanityDocument
): 'source' | 'target' {
  const sourceTime = new Date(sourceDoc._updatedAt).getTime()
  const targetTime = new Date(targetDoc._updatedAt).getTime()

  return sourceTime >= targetTime ? 'source' : 'target'
}
