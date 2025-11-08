/**
 * Execute API endpoint
 * Executes the sync operation
 */

import type { SanityClient } from '@sanity/client'
import type { ExecuteResult, SyncOptions, SyncRuleRecord } from '../../types'
import { executeSync } from '../../lib/transaction/executor'

export interface ExecuteRequest {
  selectedDocIds: string[]
  source: string
  target: string
  syncPolicy: string
  rules?: SyncRuleRecord[]
  options?: SyncOptions
}

export interface ExecuteResponse {
  success: boolean
  result?: ExecuteResult
  error?: string
}

/**
 * Handle execute request
 */
export async function handleExecute(
  request: ExecuteRequest,
  sourceClient: SanityClient,
  targetClient: SanityClient
): Promise<ExecuteResponse> {
  try {
    const { selectedDocIds, syncPolicy, rules, options } = request

    const result = await executeSync(sourceClient, targetClient, selectedDocIds, {
      policy: syncPolicy as any,
      rules,
      options,
    })

    return {
      success: true,
      result,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
