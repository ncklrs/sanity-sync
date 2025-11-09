/**
 * Asset transfer logic
 */

import type { SanityClient } from '@sanity/client'
import type { AssetMetadata, AssetTransformHook } from '../../types'
import { retryWithBackoff, isRetryableError } from '../../utils/retry'

export interface AssetReference {
  _type: 'reference' | 'image' | 'file'
  asset: {
    _ref: string
    _type: 'reference'
  }
}

export interface AssetTransferOptions {
  skipAssets?: boolean
  linkExistingAssets?: boolean
  forceCopy?: boolean
  assetHook?: AssetTransformHook
}

export interface AssetTransferResult {
  originalId: string
  newId?: string
  skipped: boolean
  error?: string
}

/**
 * Find all asset references in a document
 */
export function findAssetReferences(doc: Record<string, unknown>): string[] {
  const assetIds = new Set<string>()

  function traverse(obj: unknown): void {
    if (!obj || typeof obj !== 'object') return

    const record = obj as Record<string, unknown>
    if (record._type === 'image' || record._type === 'file') {
      const assetRef = (record.asset as { _ref?: string })?._ref
      if (assetRef) {
        assetIds.add(assetRef)
      }
    }

    if (Array.isArray(obj)) {
      obj.forEach(traverse)
    } else {
      Object.values(record).forEach(traverse)
    }
  }

  traverse(doc)
  return Array.from(assetIds)
}

/**
 * Transfer assets from source to target
 */
export async function transferAssets(
  sourceClient: SanityClient,
  targetClient: SanityClient,
  assetIds: string[],
  options: AssetTransferOptions = {}
): Promise<Map<string, AssetTransferResult>> {
  const results = new Map<string, AssetTransferResult>()

  if (options.skipAssets) {
    assetIds.forEach((id) => {
      results.set(id, { originalId: id, skipped: true })
    })
    return results
  }

  for (const assetId of assetIds) {
    try {
      const result = await transferAsset(sourceClient, targetClient, assetId, options)
      results.set(assetId, result)
    } catch (error) {
      results.set(assetId, {
        originalId: assetId,
        skipped: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  return results
}

/**
 * Transfer a single asset
 */
async function transferAsset(
  sourceClient: SanityClient,
  targetClient: SanityClient,
  assetId: string,
  options: AssetTransferOptions
): Promise<AssetTransferResult> {
  // Fetch asset metadata from source
  const sourceAsset = await sourceClient.getDocument(assetId)

  if (!sourceAsset) {
    return {
      originalId: assetId,
      skipped: false,
      error: 'Asset not found in source',
    }
  }

  const assetMeta: AssetMetadata = {
    _id: sourceAsset._id,
    url: sourceAsset.url,
    size: sourceAsset.size,
    mimeType: sourceAsset.mimeType,
    sha1hash: sourceAsset.sha1hash,
  }

  // Check if asset transform hook allows copy
  if (options.assetHook) {
    const hookResult = await options.assetHook(assetMeta)
    if (!hookResult.copy) {
      return {
        originalId: assetId,
        skipped: true,
      }
    }
  }

  // Check if asset already exists in target
  if (options.linkExistingAssets && !options.forceCopy) {
    const existingAsset = await findExistingAsset(targetClient, assetMeta)
    if (existingAsset) {
      return {
        originalId: assetId,
        newId: existingAsset._id,
        skipped: false,
      }
    }
  }

  // Download and upload asset
  return await retryWithBackoff(
    async () => {
      const newAsset = await copyAssetBinary(sourceClient, targetClient, sourceAsset)
      return {
        originalId: assetId,
        newId: newAsset._id,
        skipped: false,
      }
    },
    { shouldRetry: isRetryableError }
  )
}

/**
 * Find existing asset by checksum or URL
 */
async function findExistingAsset(
  client: SanityClient,
  assetMeta: AssetMetadata
): Promise<{ _id: string } | null> {
  if (!assetMeta.sha1hash) return null

  const query = `*[_type in ["sanity.imageAsset", "sanity.fileAsset"] && sha1hash == $hash][0]`
  return client.fetch(query, { hash: assetMeta.sha1hash })
}

interface AssetDocument {
  _id: string
  _type: string
  url?: string
  originalFilename?: string
}

/**
 * Copy asset binary from source to target
 */
async function copyAssetBinary(
  sourceClient: SanityClient,
  targetClient: SanityClient,
  sourceAsset: AssetDocument
): Promise<{ _id: string }> {
  if (!sourceAsset.url) {
    throw new Error('Asset URL not available')
  }

  // Download from source
  const response = await fetch(sourceAsset.url)
  if (!response.ok) {
    throw new Error(`Failed to download asset: ${response.statusText}`)
  }

  const blob = await response.blob()

  // Upload to target
  const isImage = sourceAsset._type === 'sanity.imageAsset'
  const uploadedAsset = await targetClient.assets.upload(
    isImage ? 'image' : 'file',
    blob,
    {
      filename: sourceAsset.originalFilename || 'asset',
    }
  )

  return uploadedAsset
}

/**
 * Remap asset references in a document
 */
export function remapAssetReferences(
  doc: Record<string, unknown>,
  assetMap: Map<string, AssetTransferResult>
): Record<string, unknown> {
  function traverse(obj: unknown): unknown {
    if (!obj || typeof obj !== 'object') return obj

    const record = obj as Record<string, unknown>
    if (record._type === 'image' || record._type === 'file') {
      const assetRef = (record.asset as { _ref?: string })?._ref
      if (assetRef && assetMap.has(assetRef)) {
        const result = assetMap.get(assetRef)!
        if (result.newId && !result.skipped) {
          return {
            ...record,
            asset: {
              ...(record.asset as Record<string, unknown>),
              _ref: result.newId,
            },
          }
        }
      }
      return obj
    }

    if (Array.isArray(obj)) {
      return obj.map(traverse)
    }

    const remapped: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(record)) {
      remapped[key] = traverse(value)
    }
    return remapped
  }

  return traverse(doc) as Record<string, unknown>
}
