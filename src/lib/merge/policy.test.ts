/**
 * Tests for merge policies
 */

import { describe, it, expect } from 'vitest'
import { applyMergePolicy } from './policy'

describe('mergePolicy', () => {
  const sourceDoc = {
    _id: 'test',
    _type: 'article',
    _rev: 'source-rev',
    _updatedAt: '2024-01-02T00:00:00Z',
    title: 'Source Title',
    content: 'Source Content',
    sourceOnly: 'source value',
  }

  const targetDoc = {
    _id: 'test',
    _type: 'article',
    _rev: 'target-rev',
    _updatedAt: '2024-01-01T00:00:00Z',
    title: 'Target Title',
    content: 'Target Content',
    targetOnly: 'target value',
  }

  describe('overwrite policy', () => {
    it('should use all source values', () => {
      const result = applyMergePolicy(sourceDoc as any, targetDoc as any, 'overwrite')

      expect(result.title).toBe('Source Title')
      expect(result.content).toBe('Source Content')
      expect(result.sourceOnly).toBe('source value')
      expect(result._rev).toBe('target-rev') // Should keep target rev
    })
  })

  describe('preserve_target_if_newer policy', () => {
    it('should keep source when source is newer', () => {
      const result = applyMergePolicy(
        sourceDoc as any,
        targetDoc as any,
        'preserve_target_if_newer'
      )

      expect(result.title).toBe('Source Title')
      expect(result.content).toBe('Source Content')
    })

    it('should keep target when target is newer', () => {
      const newerTarget = { ...targetDoc, _updatedAt: '2024-01-03T00:00:00Z' }

      const result = applyMergePolicy(
        sourceDoc as any,
        newerTarget as any,
        'preserve_target_if_newer'
      )

      expect(result.title).toBe('Target Title')
      expect(result.content).toBe('Target Content')
    })
  })

  describe('merge_preserve policy', () => {
    it('should preserve specified fields from target', () => {
      const rules = [
        {
          _id: 'rule-1',
          _type: 'syncRule' as const,
          name: 'test',
          direction: 'both' as const,
          match: { documentTypes: ['article'] },
          preserveFields: ['targetOnly'],
        },
      ]

      const result = applyMergePolicy(
        sourceDoc as any,
        targetDoc as any,
        'merge_preserve',
        rules
      )

      expect(result.title).toBe('Source Title') // From source
      expect(result.targetOnly).toBe('target value') // Preserved from target
    })
  })

  describe('smart_merge policy', () => {
    it('should merge arrays with deduplication', () => {
      const sourceWithArray = {
        ...sourceDoc,
        tags: [{ _key: '1', value: 'tag1' }, { _key: '2', value: 'tag2' }],
      }
      const targetWithArray = {
        ...targetDoc,
        tags: [{ _key: '2', value: 'tag2' }, { _key: '3', value: 'tag3' }],
      }

      const result = applyMergePolicy(
        sourceWithArray as any,
        targetWithArray as any,
        'smart_merge'
      )

      expect(result.tags).toHaveLength(3) // 3 unique tags
      expect(result.tags.some((t: any) => t.value === 'tag1')).toBe(true)
      expect(result.tags.some((t: any) => t.value === 'tag3')).toBe(true)
    })
  })
})
