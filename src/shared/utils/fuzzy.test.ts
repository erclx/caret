import { describe, expect, it } from 'vitest'

import { fuzzyMatch } from './fuzzy'

describe('fuzzyMatch', () => {
  it('should match exact string', () => {
    expect(fuzzyMatch('test', 'test')).toBe(true)
  })

  it('should match case-insensitive', () => {
    expect(fuzzyMatch('TeSt', 'tEsT')).toBe(true)
  })

  it('should match characters in order with gaps', () => {
    expect(fuzzyMatch('st', 'summarize text')).toBe(true)
  })

  it('should not match characters out of order', () => {
    expect(fuzzyMatch('ts', 'summarize text')).toBe(false)
  })

  it('should handle empty pattern gracefully', () => {
    expect(fuzzyMatch('', 'any text')).toBe(true)
  })
})
