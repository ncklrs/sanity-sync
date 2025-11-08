/**
 * Sync operation types
 */

import type { SanityDocument } from '@sanity/types'

export type SyncDirection = 'push' | 'pull' | 'both'

export type SyncPolicy =
  | 'overwrite'
  | 'merge_preserve'
  | 'preserve_target_if_newer'
  | 'preserve_by_type'
  | 'smart_merge'

export type ChangeAction = 'added' | 'removed' | 'updated' | 'unchanged'

export type JobStatus = 'pending' | 'running' | 'completed' | 'partial' | 'failed'

export type ConflictResolutionMode = 'auto-latest' | 'auto-source' | 'manual'

export interface SyncJobRecord {
  _id: string
  _type: 'syncJob'
  jobId: string
  source: string
  target: string
  mode: SyncDirection
  status: JobStatus
  startedAt: string
  completedAt?: string
  changes: ChangeRecord[]
  errors?: ErrorRecord[]
  options?: SyncOptions
}

export interface ChangeRecord {
  docId: string
  type: string
  action: ChangeAction
  fieldsChanged?: string[]
  sourceTimestamp?: string
  targetTimestamp?: string
}

export interface ErrorRecord {
  docId?: string
  code: ErrorCode
  message: string
  timestamp: string
  retryable: boolean
}

export type ErrorCode =
  | 'auth'
  | 'rate-limit'
  | 'conflict'
  | 'schema-mismatch'
  | 'asset-failure'
  | 'network'
  | 'unknown'

export interface SyncRuleRecord {
  _id: string
  _type: 'syncRule'
  name: string
  direction: SyncDirection
  match: RuleMatchCriteria
  preserveFields?: string[]
  preserveWhenTargetIsNewer?: boolean
  enabled?: boolean
}

export interface RuleMatchCriteria {
  documentTypes?: string[]
  idPatterns?: string[]
  tagInclude?: string[]
}

export interface SyncOptions {
  includeAssets?: boolean
  dryRun?: boolean
  batchSize?: number
  concurrency?: number
  conflictResolution?: ConflictResolutionMode
  ruleSet?: string[]
  filters?: SyncFilters
}

export interface SyncFilters {
  documentTypes?: string[]
  idPatterns?: string[]
  tags?: string[]
  updatedAfter?: string
  updatedBefore?: string
}

export interface DocumentSummary {
  _id: string
  _type: string
  _updatedAt: string
  _rev?: string
  title?: string
}

export interface ScanResult {
  changes: ChangeRecord[]
  totalDocs: number
  cursor?: string
  hasMore: boolean
}

export interface DiffResult {
  docId: string
  sourceDoc: SanityDocument | null
  targetDoc: SanityDocument | null
  fieldDiffs: FieldDiff[]
  hasConflicts: boolean
  conflictScore?: number
}

export interface FieldDiff {
  path: string
  changed: boolean
  op: 'add' | 'replace' | 'remove' | 'none'
  sourceValue: any
  targetValue: any
  conflict?: boolean
  suggestion?: 'source' | 'target'
}

export interface PreviewResult {
  jobId: string
  estimatedOperations: number
  patches: PatchPreview[]
  estimatedTime?: number
  warnings?: string[]
}

export interface PatchPreview {
  docId: string
  type: string
  operation: 'create' | 'createOrReplace' | 'patch' | 'delete'
  fields: string[]
  preview?: any
}

export interface ExecuteResult {
  jobId: string
  status: JobStatus
  successCount: number
  failureCount: number
  errors?: ErrorRecord[]
  changes: ChangeRecord[]
}

export interface AssetTransferOptions {
  skipAssets?: boolean
  linkExistingAssets?: boolean
  forceCopy?: boolean
}
