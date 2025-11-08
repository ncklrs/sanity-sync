/**
 * Tests for field diff computation
 */

import { describe, it, expect } from 'vitest'
import { computeFieldDiff } from './fieldDiff'

describe('fieldDiff', () => {
  it('should detect no change for identical values', () => {
    const result = computeFieldDiff('title', 'Same Value', 'Same Value')

    expect(result.changed).toBe(false)
    expect(result.op).toBe('none')
  })

  it('should detect field addition', () => {
    const result = computeFieldDiff('newField', 'new value', undefined)

    expect(result.changed).toBe(true)
    expect(result.op).toBe('add')
    expect(result.suggestion).toBe('source')
  })

  it('should detect field removal', () => {
    const result = computeFieldDiff('oldField', undefined, 'old value')

    expect(result.changed).toBe(true)
    expect(result.op).toBe('remove')
    expect(result.suggestion).toBe('target')
  })

  it('should detect field replacement and conflict', () => {
    const result = computeFieldDiff('title', 'New Title', 'Old Title')

    expect(result.changed).toBe(true)
    expect(result.op).toBe('replace')
    expect(result.conflict).toBe(true)
  })

  it('should handle complex objects', () => {
    const obj1 = { nested: { value: 1 } }
    const obj2 = { nested: { value: 2 } }

    const result = computeFieldDiff('data', obj1, obj2)

    expect(result.changed).toBe(true)
    expect(result.op).toBe('replace')
  })

  it('should handle arrays', () => {
    const arr1 = [1, 2, 3]
    const arr2 = [1, 2, 4]

    const result = computeFieldDiff('items', arr1, arr2)

    expect(result.changed).toBe(true)
    expect(result.op).toBe('replace')
  })
})
