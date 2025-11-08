/**
 * Retry utilities with exponential backoff
 */

import { INITIAL_RETRY_DELAY, MAX_RETRY_DELAY, MAX_RETRY_ATTEMPTS } from './constants'

export interface RetryOptions {
  maxAttempts?: number
  initialDelay?: number
  maxDelay?: number
  shouldRetry?: (error: Error) => boolean
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = MAX_RETRY_ATTEMPTS,
    initialDelay = INITIAL_RETRY_DELAY,
    maxDelay = MAX_RETRY_DELAY,
    shouldRetry = () => true,
  } = options

  let lastError: Error | undefined
  let delay = initialDelay

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error

      if (attempt === maxAttempts || !shouldRetry(lastError)) {
        throw lastError
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay))

      // Exponential backoff with cap
      delay = Math.min(delay * 2, maxDelay)
    }
  }

  throw lastError
}

/**
 * Check if an error is retryable based on code or message
 */
export function isRetryableError(error: Error): boolean {
  const message = error.message.toLowerCase()

  // Rate limit errors
  if (message.includes('429') || message.includes('rate limit')) {
    return true
  }

  // Network errors
  if (
    message.includes('econnreset') ||
    message.includes('etimedout') ||
    message.includes('network')
  ) {
    return true
  }

  return false
}
