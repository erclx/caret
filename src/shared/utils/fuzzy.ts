export function fuzzyMatch(pattern: string, str: string): boolean {
  let patternIdx = 0
  let strIdx = 0
  const pLen = pattern.length
  const sLen = str.length

  const p = pattern.toLowerCase()
  const s = str.toLowerCase()

  while (patternIdx < pLen && strIdx < sLen) {
    if (p[patternIdx] === s[strIdx]) {
      patternIdx++
    }
    strIdx++
  }

  return patternIdx === pLen
}
