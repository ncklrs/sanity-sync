/**
 * Sanity client factory for API endpoints
 */

import { createClient, type SanityClient } from '@sanity/client'

export interface ClientConfig {
  projectId: string
  dataset: string
  apiVersion?: string
  token?: string
}

/**
 * Create a Sanity client for a dataset
 */
export function createSanityClient(config: ClientConfig): SanityClient {
  const { projectId, dataset, apiVersion = '2024-01-01', token } = config

  return createClient({
    projectId,
    dataset,
    apiVersion,
    token,
    useCdn: false, // Don't use CDN for sync operations
    perspective: 'raw', // Get unpublished documents too
  })
}

/**
 * Get read and write tokens from environment
 */
export function getTokensFromEnv(
  readTokenEnv = 'SANITY_SYNC_READ_TOKEN',
  writeTokenEnv = 'SANITY_SYNC_WRITE_TOKEN'
): { readToken?: string; writeToken?: string } {
  return {
    readToken: process.env[readTokenEnv],
    writeToken: process.env[writeTokenEnv],
  }
}
