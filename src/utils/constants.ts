/**
 * Constants used throughout the plugin
 */

export const DEFAULT_BATCH_SIZE = 50
export const DEFAULT_CONCURRENCY = 4
export const DEFAULT_PAGE_SIZE = 100
export const MAX_RETRY_ATTEMPTS = 3
export const INITIAL_RETRY_DELAY = 2000 // 2 seconds
export const MAX_RETRY_DELAY = 16000 // 16 seconds

export const SYNC_POLICIES = {
  OVERWRITE: 'overwrite',
  MERGE_PRESERVE: 'merge_preserve',
  PRESERVE_TARGET_IF_NEWER: 'preserve_target_if_newer',
  PRESERVE_BY_TYPE: 'preserve_by_type',
  SMART_MERGE: 'smart_merge',
} as const

export const ERROR_CODES = {
  AUTH: 'auth',
  RATE_LIMIT: 'rate-limit',
  CONFLICT: 'conflict',
  SCHEMA_MISMATCH: 'schema-mismatch',
  ASSET_FAILURE: 'asset-failure',
  NETWORK: 'network',
  UNKNOWN: 'unknown',
} as const

export const RETRYABLE_ERROR_CODES = [
  ERROR_CODES.RATE_LIMIT,
  ERROR_CODES.NETWORK,
] as const
