import { describe, expect, it } from 'vitest'

describe('Unit Test Infrastructure', () => {
  it('should run this test successfully', () => {
    expect(true).toBe(true)
  })

  it('should support environment variables', () => {
    expect(import.meta.env.MODE).toBeDefined()
  })
})
