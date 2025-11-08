/**
 * Tests for document diff algorithm
 */

import { describe, it, expect } from 'vitest'
import { computeDocumentDiff, areDocumentsIdentical } from './documentDiff'

describe('documentDiff', () => {
  describe('areDocumentsIdentical', () => {
    it('should return true for identical timestamps', () => {
      const doc1 = { _id: 'test', _updatedAt: '2024-01-01T00:00:00Z', title: 'Test' }
      const doc2 = { _id: 'test', _updatedAt: '2024-01-01T00:00:00Z', title: 'Different' }

      expect(areDocumentsIdentical(doc1 as any, doc2 as any)).toBe(true)
    })

    it('should return false for different timestamps', () => {
      const doc1 = { _id: 'test', _updatedAt: '2024-01-01T00:00:00Z', title: 'Test' }
      const doc2 = { _id: 'test', _updatedAt: '2024-01-02T00:00:00Z', title: 'Test' }

      expect(areDocumentsIdentical(doc1 as any, doc2 as any)).toBe(false)
    })
  })

  describe('computeDocumentDiff', () => {
    it('should detect added document', () => {
      const sourceDoc = { _id: 'test', _type: 'article', title: 'Test' }
      const result = computeDocumentDiff(sourceDoc as any, null, 'test')

      expect(result.sourceDoc).toEqual(sourceDoc)
      expect(result.targetDoc).toBeNull()
      expect(result.hasConflicts).toBe(false)
    })

    it('should detect removed document', () => {
      const targetDoc = { _id: 'test', _type: 'article', title: 'Test' }
      const result = computeDocumentDiff(null, targetDoc as any, 'test')

      expect(result.sourceDoc).toBeNull()
      expect(result.targetDoc).toEqual(targetDoc)
      expect(result.hasConflicts).toBe(false)
    })

    it('should detect changed fields', () => {
      const sourceDoc = {
        _id: 'test',
        _type: 'article',
        _updatedAt: '2024-01-02T00:00:00Z',
        title: 'New Title',
        content: 'Same content',
      }
      const targetDoc = {
        _id: 'test',
        _type: 'article',
        _updatedAt: '2024-01-01T00:00:00Z',
        title: 'Old Title',
        content: 'Same content',
      }

      const result = computeDocumentDiff(sourceDoc as any, targetDoc as any, 'test')

      expect(result.hasConflicts).toBe(true)
      expect(result.fieldDiffs.some((d) => d.path === 'title' && d.changed)).toBe(true)
      expect(result.fieldDiffs.some((d) => d.path === 'content' && !d.changed)).toBe(true)
    })
  })
})
