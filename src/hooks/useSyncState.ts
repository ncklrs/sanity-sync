/**
 * Hook for managing sync state
 */

import { useState, useCallback } from 'react'
import type { ContentSyncConfig, SyncState, ChangeRecord, DiffResult, SyncFilters } from '../types'

export function useSyncState(config: ContentSyncConfig) {
  const [state, setState] = useState<SyncState>({
    sourceDataset: config.defaultSource || null,
    targetDataset: config.defaultTarget || null,
    currentTab: 'overview',
    isScanning: false,
    isSyncing: false,
    changes: [],
    selectedDocIds: new Set<string>(),
    currentDiff: null,
    syncPolicy: 'overwrite',
    filters: {},
    includeAssets: true,
    dryRun: false,
  })

  const setSourceDataset = useCallback((dataset: string | null) => {
    setState((prev) => ({ ...prev, sourceDataset: dataset }))
  }, [])

  const setTargetDataset = useCallback((dataset: string | null) => {
    setState((prev) => ({ ...prev, targetDataset: dataset }))
  }, [])

  const setIsScanning = useCallback((isScanning: boolean) => {
    setState((prev) => ({ ...prev, isScanning }))
  }, [])

  const setIsSyncing = useCallback((isSyncing: boolean) => {
    setState((prev) => ({ ...prev, isSyncing }))
  }, [])

  const setChanges = useCallback((changes: ChangeRecord[]) => {
    setState((prev) => ({ ...prev, changes }))
  }, [])

  const setSelectedDocIds = useCallback((selectedDocIds: Set<string>) => {
    setState((prev) => ({ ...prev, selectedDocIds }))
  }, [])

  const setCurrentDiff = useCallback((diff: DiffResult | null) => {
    setState((prev) => ({ ...prev, currentDiff: diff }))
  }, [])

  const setSyncPolicy = useCallback((policy: any) => {
    setState((prev) => ({ ...prev, syncPolicy: policy }))
  }, [])

  const setFilters = useCallback((filters: SyncFilters) => {
    setState((prev) => ({ ...prev, filters }))
  }, [])

  const setIncludeAssets = useCallback((includeAssets: boolean) => {
    setState((prev) => ({ ...prev, includeAssets }))
  }, [])

  const setDryRun = useCallback((dryRun: boolean) => {
    setState((prev) => ({ ...prev, dryRun }))
  }, [])

  return {
    state,
    setSourceDataset,
    setTargetDataset,
    setIsScanning,
    setIsSyncing,
    setChanges,
    setSelectedDocIds,
    setCurrentDiff,
    setSyncPolicy,
    setFilters,
    setIncludeAssets,
    setDryRun,
  }
}
