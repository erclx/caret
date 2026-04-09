import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { InputDetector, type TriggerState } from './detector'

let activeResizeCallback: ResizeObserverCallback | null = null

class MockResizeObserver {
  constructor(callback: ResizeObserverCallback) {
    activeResizeCallback = callback
  }
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}

vi.stubGlobal('ResizeObserver', MockResizeObserver)

function typeIntoTextarea(textarea: HTMLTextAreaElement, text: string) {
  for (const char of text) {
    if (char === '\x1B') {
      textarea.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
      )
    } else {
      textarea.dispatchEvent(
        new KeyboardEvent('keydown', { key: char, bubbles: true }),
      )
      textarea.value += char
      textarea.dispatchEvent(new Event('input', { bubbles: true }))
    }
  }
}

describe('InputDetector', () => {
  let detector: InputDetector
  let stateCallback: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    activeResizeCallback = null
    stateCallback = vi.fn()
    detector = new InputDetector(
      stateCallback as unknown as (state: TriggerState) => void,
    )
    document.body.innerHTML = ''
  })

  afterEach(() => {
    detector.detach()
    vi.useRealTimers()
  })

  it('should detect trigger symbol at position 0 in textarea', () => {
    const textarea = document.createElement('textarea')
    document.body.appendChild(textarea)
    detector.attach(textarea)
    detector.setTriggerSymbol('>')

    typeIntoTextarea(textarea, '>')
    vi.runAllTimers()

    expect(stateCallback).toHaveBeenCalledWith(
      expect.objectContaining({ isActive: true, triggerSymbol: '>' }),
    )
  })

  it('should not detect mid-word trigger symbol', () => {
    const textarea = document.createElement('textarea')
    document.body.appendChild(textarea)
    detector.attach(textarea)
    detector.setTriggerSymbol('>')

    typeIntoTextarea(textarea, 'word>')
    vi.runAllTimers()

    const activeCalls = stateCallback.mock.calls.filter(
      (call) => call[0].isActive === true,
    )
    expect(activeCalls.length).toBe(0)
  })

  it('should detect trigger symbol immediately preceded by whitespace', () => {
    const textarea = document.createElement('textarea')
    document.body.appendChild(textarea)
    detector.attach(textarea)
    detector.setTriggerSymbol('>')

    typeIntoTextarea(textarea, 'hello >')
    vi.runAllTimers()

    const activeCalls = stateCallback.mock.calls.filter(
      (call) => call[0].isActive === true,
    )
    expect(activeCalls.length).toBeGreaterThan(0)
  })

  it('should deactivate on Escape key', () => {
    const textarea = document.createElement('textarea')
    document.body.appendChild(textarea)
    detector.attach(textarea)
    detector.setTriggerSymbol('>')

    typeIntoTextarea(textarea, '>')
    vi.runAllTimers()

    expect(stateCallback).toHaveBeenLastCalledWith(
      expect.objectContaining({ isActive: true }),
    )

    typeIntoTextarea(textarea, '\x1B')
    vi.runAllTimers()

    expect(stateCallback).toHaveBeenLastCalledWith(
      expect.objectContaining({ isActive: false }),
    )
  })

  it('should deactivate when user types a space invalidating the trigger', () => {
    const textarea = document.createElement('textarea')
    document.body.appendChild(textarea)
    detector.attach(textarea)
    detector.setTriggerSymbol('>')

    typeIntoTextarea(textarea, '>')
    vi.runAllTimers()

    expect(stateCallback).toHaveBeenLastCalledWith(
      expect.objectContaining({ isActive: true }),
    )

    typeIntoTextarea(textarea, ' ')
    vi.runAllTimers()

    expect(stateCallback).toHaveBeenLastCalledWith(
      expect.objectContaining({ isActive: false }),
    )
  })

  it('should detect trigger symbol in contenteditable', () => {
    const div = document.createElement('div')
    div.setAttribute('contenteditable', 'true')
    div.contentEditable = 'true'
    document.body.appendChild(div)
    detector.attach(div)
    detector.setTriggerSymbol('>')

    vi.spyOn(window, 'getSelection').mockReturnValue({
      rangeCount: 1,
      getRangeAt: () => ({
        startContainer: div,
        startOffset: 0,
        getBoundingClientRect: () => new DOMRect(0, 0, 0, 0),
      }),
    } as unknown as Selection)

    div.dispatchEvent(new KeyboardEvent('keydown', { key: '>' }))
    div.appendChild(document.createTextNode('>'))

    const textNode = div.firstChild as Text
    vi.spyOn(window, 'getSelection').mockReturnValue({
      rangeCount: 1,
      getRangeAt: () => ({
        startContainer: textNode,
        startOffset: 1,
        getBoundingClientRect: () => new DOMRect(0, 0, 0, 0),
      }),
    } as unknown as Selection)

    div.dispatchEvent(new Event('input', { bubbles: true }))

    expect(stateCallback).toHaveBeenCalledWith(
      expect.objectContaining({ isActive: true, triggerSymbol: '>' }),
    )
  })

  it('should detect trigger symbol at the start of a new block after pasted content', () => {
    const div = document.createElement('div')
    div.setAttribute('contenteditable', 'true')
    div.contentEditable = 'true'
    document.body.appendChild(div)
    detector.attach(div)
    detector.setTriggerSymbol('>')

    const p1 = document.createElement('p')
    p1.textContent = 'pasted paragraph'
    const p2 = document.createElement('p')
    div.appendChild(p1)
    div.appendChild(p2)

    vi.spyOn(window, 'getSelection').mockReturnValue({
      rangeCount: 1,
      getRangeAt: () => ({
        startContainer: p2,
        startOffset: 0,
        getBoundingClientRect: () => new DOMRect(0, 0, 0, 0),
      }),
    } as unknown as Selection)

    div.dispatchEvent(new KeyboardEvent('keydown', { key: '>' }))

    p2.appendChild(document.createTextNode('>'))

    vi.spyOn(window, 'getSelection').mockReturnValue({
      rangeCount: 1,
      getRangeAt: () => ({
        startContainer: p2.firstChild!,
        startOffset: 1,
        getBoundingClientRect: () => new DOMRect(0, 0, 0, 0),
      }),
    } as unknown as Selection)

    div.dispatchEvent(new Event('input', { bubbles: true }))

    expect(stateCallback).toHaveBeenCalledWith(
      expect.objectContaining({ isActive: true, triggerSymbol: '>' }),
    )
  })

  it('should insert text and emit deactivated state when insertPrompt is called while active', () => {
    const textarea = document.createElement('textarea')
    document.body.appendChild(textarea)
    detector.attach(textarea)
    detector.setTriggerSymbol('>')

    typeIntoTextarea(textarea, '>sum')
    vi.runAllTimers()

    expect(stateCallback).toHaveBeenLastCalledWith(
      expect.objectContaining({ isActive: true, query: 'sum' }),
    )
    stateCallback.mockClear()

    detector.insertPrompt('Summarize this')

    expect(stateCallback).toHaveBeenCalledWith(
      expect.objectContaining({ isActive: false }),
    )
    expect(textarea.value).toBe('Summarize this ')
  })

  it('should trim trailing spaces from the prompt and insert a single trailing space', () => {
    const textarea = document.createElement('textarea')
    document.body.appendChild(textarea)
    detector.attach(textarea)
    detector.setTriggerSymbol('>')

    typeIntoTextarea(textarea, '>sum')
    vi.runAllTimers()

    detector.insertPrompt('Summarize this   ')

    expect(textarea.value).toBe('Summarize this ')
  })

  it('should trim trailing newlines from the prompt and insert a single trailing space', () => {
    const textarea = document.createElement('textarea')
    document.body.appendChild(textarea)
    detector.attach(textarea)
    detector.setTriggerSymbol('>')

    typeIntoTextarea(textarea, '>sum')
    vi.runAllTimers()

    detector.insertPrompt('Summarize this\n\n')

    expect(textarea.value).toBe('Summarize this ')
  })

  it('should do nothing when insertPrompt is called while not active', () => {
    const textarea = document.createElement('textarea')
    textarea.value = 'hello'
    document.body.appendChild(textarea)
    detector.attach(textarea)
    detector.setTriggerSymbol('>')

    detector.insertPrompt('Summarize this')

    expect(stateCallback).not.toHaveBeenCalled()
    expect(textarea.value).toBe('hello')
  })

  it('should update the query as user types after the trigger', () => {
    const textarea = document.createElement('textarea')
    document.body.appendChild(textarea)
    detector.attach(textarea)
    detector.setTriggerSymbol('>')

    typeIntoTextarea(textarea, '>sum')
    vi.runAllTimers()

    expect(stateCallback).toHaveBeenLastCalledWith(
      expect.objectContaining({ isActive: true, query: 'sum' }),
    )
  })

  it('should update state on resize', () => {
    const textarea = document.createElement('textarea')
    document.body.appendChild(textarea)
    detector.attach(textarea)
    detector.setTriggerSymbol('>')

    textarea.dispatchEvent(new KeyboardEvent('keydown', { key: '>' }))
    textarea.value = '>'
    textarea.dispatchEvent(new Event('input', { bubbles: true }))

    expect(stateCallback).toHaveBeenLastCalledWith(
      expect.objectContaining({ isActive: true }),
    )
    stateCallback.mockClear()

    if (activeResizeCallback) {
      activeResizeCallback(
        [],
        new MockResizeObserver(
          activeResizeCallback,
        ) as unknown as ResizeObserver,
      )
    }

    expect(stateCallback).toHaveBeenCalledWith(
      expect.objectContaining({ isActive: true }),
    )
  })
})
