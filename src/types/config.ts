/**
 * Plugin configuration types
 */

export interface DatasetConfig {
  /** Dataset ID */
  id: string
  /** Human-readable label */
  label: string
  /** Sanity project ID */
  projectId: string
  /** Optional API version override */
  apiVersion?: string
}

export interface ContentSyncConfig {
  /** Array of dataset configurations */
  datasets: DatasetConfig[]
  /** Default source dataset ID */
  defaultSource?: string
  /** Default target dataset ID */
  defaultTarget?: string
  /** Environment variable name for read token */
  readTokenEnv?: string
  /** Environment variable name for write token */
  writeTokenEnv?: string
  /** Field names that hint content should be preserved locally */
  preserveHintFields?: string[]
  /** Default batch size for transactions */
  batchSize?: number
  /** Default concurrency for parallel operations */
  concurrency?: number
  /** Transform hook for customizing document transformations */
  transformHook?: TransformHook
  /** Asset transform hook for asset transfer control */
  assetTransformHook?: AssetTransformHook
  /** Lifecycle hooks */
  onJobStart?: JobLifecycleHook
  onJobComplete?: JobLifecycleHook
}

export type TransformHook = (doc: any, context: TransformContext) => any | Promise<any>

export type AssetTransformHook = (
  assetMeta: AssetMetadata
) => { copy: boolean } | Promise<{ copy: boolean }>

export type JobLifecycleHook = (job: SyncJobRecord) => void | Promise<void>

export interface TransformContext {
  sourceDataset: string
  targetDataset: string
  syncPolicy: SyncPolicy
}

export interface AssetMetadata {
  _id: string
  url?: string
  size?: number
  mimeType?: string
  sha1hash?: string
}
