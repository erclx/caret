export function fuzzyMatch(pattern: string, str: string): boolean {
  if (!pattern) return true

  const p = pattern.toLowerCase()
  const s = str.toLowerCase()

  let patternIdx = 0
  for (let i = 0; i < s.length && patternIdx < p.length; i++) {
    if (p[patternIdx] === s[i]) patternIdx++
  }

  return patternIdx === p.length
}

export function scoreMatch(pattern: string, str: string): number {
  if (!pattern) return 0

  const p = pattern.toLowerCase()
  const s = str.toLowerCase()

  if (s.startsWith(p)) return 2
  if (s.includes(p)) return 1
  return 0
}
