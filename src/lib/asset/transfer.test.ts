/**
 * Tests for asset transfer
 */

import { describe, it, expect } from 'vitest'
import { findAssetReferences, remapAssetReferences } from './transfer'

describe('assetTransfer', () => {
  describe('findAssetReferences', () => {
    it('should find image asset references', () => {
      const doc = {
        mainImage: {
          _type: 'image',
          asset: {
            _ref: 'image-123',
            _type: 'reference',
          },
        },
      }

      const assetIds = findAssetReferences(doc)

      expect(assetIds).toContain('image-123')
      expect(assetIds).toHaveLength(1)
    })

    it('should find file asset references', () => {
      const doc = {
        attachment: {
          _type: 'file',
          asset: {
            _ref: 'file-456',
            _type: 'reference',
          },
        },
      }

      const assetIds = findAssetReferences(doc)

      expect(assetIds).toContain('file-456')
      expect(assetIds).toHaveLength(1)
    })

    it('should find nested asset references', () => {
      const doc = {
        content: [
          {
            _type: 'block',
            children: [{ text: 'test' }],
          },
          {
            _type: 'image',
            asset: {
              _ref: 'image-789',
              _type: 'reference',
            },
          },
        ],
      }

      const assetIds = findAssetReferences(doc)

      expect(assetIds).toContain('image-789')
      expect(assetIds).toHaveLength(1)
    })

    it('should deduplicate asset references', () => {
      const doc = {
        image1: {
          _type: 'image',
          asset: { _ref: 'image-123', _type: 'reference' },
        },
        image2: {
          _type: 'image',
          asset: { _ref: 'image-123', _type: 'reference' },
        },
      }

      const assetIds = findAssetReferences(doc)

      expect(assetIds).toHaveLength(1)
      expect(assetIds[0]).toBe('image-123')
    })
  })

  describe('remapAssetReferences', () => {
    it('should remap asset references', () => {
      const doc = {
        mainImage: {
          _type: 'image',
          asset: {
            _ref: 'old-asset-id',
            _type: 'reference',
          },
        },
      }

      const assetMap = new Map([
        [
          'old-asset-id',
          {
            originalId: 'old-asset-id',
            newId: 'new-asset-id',
            skipped: false,
          },
        ],
      ])

      const result = remapAssetReferences(doc, assetMap)

      expect(result.mainImage.asset._ref).toBe('new-asset-id')
    })

    it('should not remap skipped assets', () => {
      const doc = {
        mainImage: {
          _type: 'image',
          asset: {
            _ref: 'skipped-asset',
            _type: 'reference',
          },
        },
      }

      const assetMap = new Map([
        [
          'skipped-asset',
          {
            originalId: 'skipped-asset',
            skipped: true,
          },
        ],
      ])

      const result = remapAssetReferences(doc, assetMap)

      expect(result.mainImage.asset._ref).toBe('skipped-asset')
    })
  })
})
