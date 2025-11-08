/**
 * Tests for retry utilities
 */

import { describe, it, expect, vi } from 'vitest'
import { retryWithBackoff, isRetryableError } from './retry'

describe('retry', () => {
  describe('retryWithBackoff', () => {
    it('should return result on first try if successful', async () => {
      const fn = vi.fn().mockResolvedValue('success')

      const result = await retryWithBackoff(fn, { maxAttempts: 3 })

      expect(result).toBe('success')
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('should retry on failure', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValueOnce('success')

      const result = await retryWithBackoff(fn, {
        maxAttempts: 3,
        initialDelay: 10,
      })

      expect(result).toBe('success')
      expect(fn).toHaveBeenCalledTimes(3)
    })

    it('should throw last error after max attempts', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('fail'))

      await expect(
        retryWithBackoff(fn, { maxAttempts: 2, initialDelay: 10 })
      ).rejects.toThrow('fail')

      expect(fn).toHaveBeenCalledTimes(2)
    })

    it('should respect shouldRetry function', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('do not retry'))

      await expect(
        retryWithBackoff(fn, {
          maxAttempts: 3,
          initialDelay: 10,
          shouldRetry: () => false,
        })
      ).rejects.toThrow('do not retry')

      expect(fn).toHaveBeenCalledTimes(1) // Should not retry
    })
  })

  describe('isRetryableError', () => {
    it('should detect rate limit errors', () => {
      expect(isRetryableError(new Error('429 rate limit'))).toBe(true)
      expect(isRetryableError(new Error('Rate limit exceeded'))).toBe(true)
    })

    it('should detect network errors', () => {
      expect(isRetryableError(new Error('ECONNRESET'))).toBe(true)
      expect(isRetryableError(new Error('ETIMEDOUT'))).toBe(true)
      expect(isRetryableError(new Error('Network error'))).toBe(true)
    })

    it('should return false for non-retryable errors', () => {
      expect(isRetryableError(new Error('Invalid request'))).toBe(false)
      expect(isRetryableError(new Error('Not found'))).toBe(false)
    })
  })
})
