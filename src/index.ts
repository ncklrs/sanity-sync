/**
 * Main entry point for sanity-plugin-content-sync
 */

export { contentSync } from './plugin'

// Export types for consumers
export type {
  ContentSyncConfig,
  DatasetConfig,
  SyncJobRecord,
  SyncRuleRecord,
  SyncPolicy,
  SyncDirection,
  ChangeAction,
  JobStatus,
  DiffResult,
  FieldDiff,
  ScanResult,
  PreviewResult,
  ExecuteResult,
} from './types'
