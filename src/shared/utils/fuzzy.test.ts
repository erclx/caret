import { describe, expect, it } from 'vitest'

import { fuzzyMatch, scoreMatch } from './fuzzy'

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

describe('scoreMatch', () => {
  it('should return 2 for prefix match', () => {
    expect(scoreMatch('code', 'code-search')).toBe(2)
  })

  it('should return 1 for substring match that is not a prefix', () => {
    expect(scoreMatch('search', 'code-search')).toBe(1)
  })

  it('should return 0 when pattern is not a substring', () => {
    expect(scoreMatch('xyz', 'code-search')).toBe(0)
  })

  it('should be case-insensitive', () => {
    expect(scoreMatch('CODE', 'code-search')).toBe(2)
  })

  it('should return 0 for empty pattern', () => {
    expect(scoreMatch('', 'code-search')).toBe(0)
  })
})
