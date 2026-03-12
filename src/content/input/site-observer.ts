const SITE_CONFIGS: Record<string, string> = {
  'claude.ai': '.ProseMirror[contenteditable="true"]',
  'gemini.google.com': 'rich-textarea div[contenteditable="true"]',
  'chatgpt.com': '#prompt-textarea',
}

export function startSiteObserver(
  onInputFound: (el: HTMLElement) => void,
): () => void {
  const hostname = window.location.hostname
  const site = Object.keys(SITE_CONFIGS).find((k) => hostname.includes(k))

  if (!site) {
    return () => {}
  }

  const selector = SITE_CONFIGS[site]
  let currentElement: HTMLElement | null = null
  let timeoutId: number | null = null

  const check = () => {
    const el = document.querySelector<HTMLElement>(selector)

    if (el) {
      if (el !== currentElement) {
        currentElement = el
        onInputFound(el)
      }
    } else {
      currentElement = null
    }
  }

  check()

  const observer = new MutationObserver(() => {
    if (timeoutId === null) {
      timeoutId = window.setTimeout(() => {
        check()
        timeoutId = null
      }, 250)
    }
  })

  observer.observe(document.body, { childList: true, subtree: true })

  return () => {
    if (timeoutId !== null) window.clearTimeout(timeoutId)
    observer.disconnect()
    currentElement = null
  }
}
