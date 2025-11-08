/**
 * Test setup file for Vitest
 */

import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Runs a cleanup after each test case
afterEach(() => {
  cleanup()
})

// Custom matchers can be added here
