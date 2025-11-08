/**
 * UI component types
 */

import type { SyncPolicy, SyncFilters, ChangeRecord, DiffResult } from './sync'

export type TabView = 'overview' | 'scan' | 'selection' | 'preview' | 'logs' | 'settings'

export interface SyncState {
  sourceDataset: string | null
  targetDataset: string | null
  currentTab: TabView
  isScanning: boolean
  isSyncing: boolean
  changes: ChangeRecord[]
  selectedDocIds: Set<string>
  currentDiff: DiffResult | null
  syncPolicy: SyncPolicy
  filters: SyncFilters
  includeAssets: boolean
  dryRun: boolean
}

export interface SyncStats {
  totalChanges: number
  added: number
  removed: number
  updated: number
  unchanged: number
}

export interface UIAction {
  type: string
  payload?: any
}
