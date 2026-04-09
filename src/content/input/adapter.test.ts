import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  ContentEditableAdapter,
  createAdapter,
  TextareaAdapter,
} from './adapters'

document.execCommand = vi.fn().mockReturnValue(true)

function makeTextarea(value = ''): HTMLTextAreaElement {
  const el = document.createElement('textarea')
  el.value = value
  document.body.appendChild(el)
  return el
}

function makeContentEditable(text = ''): HTMLElement {
  const el = document.createElement('div')
  el.setAttribute('contenteditable', 'true')
  el.textContent = text
  document.body.appendChild(el)
  return el
}

afterEach(() => {
  document.body.innerHTML = ''
  vi.restoreAllMocks()
})

describe('createAdapter', () => {
  it('should return TextareaAdapter for textarea elements', () => {
    expect(createAdapter(makeTextarea())).toBeInstanceOf(TextareaAdapter)
  })

  it('should return ContentEditableAdapter for contenteditable elements', () => {
    expect(createAdapter(makeContentEditable())).toBeInstanceOf(
      ContentEditableAdapter,
    )
  })

  it('should return null for non-interactive elements', () => {
    expect(createAdapter(document.createElement('div'))).toBeNull()
  })
})

describe('TextareaAdapter', () => {
  describe('getValue', () => {
    it('should return the current value of the textarea', () => {
      expect(new TextareaAdapter(makeTextarea('hello')).getValue()).toBe(
        'hello',
      )
    })
  })

  describe('getCursorPosition', () => {
    it('should return the selectionEnd position', () => {
      const el = makeTextarea('hello')
      el.setSelectionRange(3, 3)
      expect(new TextareaAdapter(el).getCursorPosition()).toBe(3)
    })
  })

  describe('getTextBeforeCursor', () => {
    it('should return text from start up to cursor position', () => {
      const el = makeTextarea('hello world')
      el.setSelectionRange(5, 5)
      expect(new TextareaAdapter(el).getTextBeforeCursor()).toBe('hello')
    })
  })

  describe('getRect', () => {
    it('should delegate to getBoundingClientRect', () => {
      const el = makeTextarea()
      const rect = { top: 10, left: 20 } as DOMRect
      vi.spyOn(el, 'getBoundingClientRect').mockReturnValue(rect)
      expect(new TextareaAdapter(el).getRect()).toBe(rect)
    })
  })

  describe('insertText', () => {
    it('should replace trigger+query with inserted text', () => {
      const el = makeTextarea('>sum')
      el.setSelectionRange(4, 4)
      new TextareaAdapter(el).insertText('Summarize this', 4)
      expect(el.value).toBe('Summarize this')
    })

    it('should preserve text before the trigger', () => {
      const el = makeTextarea('hello >sum')
      el.setSelectionRange(10, 10)
      new TextareaAdapter(el).insertText('Summarize this', 4)
      expect(el.value).toBe('hello Summarize this')
    })

    it('should position cursor after inserted text', () => {
      const el = makeTextarea('>sum')
      el.setSelectionRange(4, 4)
      new TextareaAdapter(el).insertText('Summarize this', 4)
      expect(el.selectionStart).toBe('Summarize this'.length)
    })

    it('should dispatch input event with full inserted text', () => {
      const el = makeTextarea('>sum')
      el.setSelectionRange(4, 4)
      const handler = vi.fn()
      el.addEventListener('input', handler)
      new TextareaAdapter(el).insertText('Summarize this', 4)
      expect(handler).toHaveBeenCalledOnce()
      expect((handler.mock.calls[0][0] as InputEvent).data).toBe(
        'Summarize this',
      )
    })

    it('should skip insertion if native setter is unavailable', () => {
      const el = makeTextarea('>sum')
      el.setSelectionRange(4, 4)
      vi.spyOn(Object, 'getOwnPropertyDescriptor').mockReturnValue(undefined)
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      new TextareaAdapter(el).insertText('Summarize this', 4)
      expect(el.value).toBe('>sum')
      expect(errorSpy).toHaveBeenCalledOnce()
    })
  })
})

describe('ContentEditableAdapter', () => {
  describe('getValue', () => {
    it('should return the text content of the element', () => {
      expect(
        new ContentEditableAdapter(makeContentEditable('hello')).getValue(),
      ).toBe('hello')
    })
  })

  describe('getRect', () => {
    it('should return cursor-based rect when selection is available', () => {
      const el = makeContentEditable('hello')
      const elementRect = new DOMRect(10, 100, 300, 40)
      const caretRect = new DOMRect(10, 50, 0, 20)
      vi.spyOn(el, 'getBoundingClientRect').mockReturnValue(elementRect)
      vi.spyOn(window, 'getSelection').mockReturnValue({
        rangeCount: 1,
        getRangeAt: () => ({ getBoundingClientRect: () => caretRect }),
      } as unknown as Selection)

      const result = new ContentEditableAdapter(el).getRect()

      expect(result.left).toBe(elementRect.left)
      expect(result.width).toBe(elementRect.width)
      expect(result.top).toBe(caretRect.top)
      expect(result.height).toBe(caretRect.height)
    })

    it('should fall back to container rect when caret rect has zero height', () => {
      const el = document.createElement('div')
      el.setAttribute('contenteditable', 'true')
      const p = document.createElement('p')
      el.appendChild(p)
      document.body.appendChild(el)

      const elementRect = new DOMRect(10, 100, 300, 400)
      const containerRect = new DOMRect(10, 450, 300, 20)
      vi.spyOn(el, 'getBoundingClientRect').mockReturnValue(elementRect)
      vi.spyOn(p, 'getBoundingClientRect').mockReturnValue(containerRect)
      vi.spyOn(window, 'getSelection').mockReturnValue({
        rangeCount: 1,
        getRangeAt: () => ({
          startContainer: p,
          startOffset: 0,
          getBoundingClientRect: () => new DOMRect(0, 0, 0, 0),
        }),
      } as unknown as Selection)

      const result = new ContentEditableAdapter(el).getRect()

      expect(result.left).toBe(elementRect.left)
      expect(result.width).toBe(elementRect.width)
      expect(result.top).toBe(containerRect.top)
      expect(result.height).toBe(containerRect.height)
    })

    it('should fall back to getBoundingClientRect when selection is unavailable', () => {
      const el = makeContentEditable()
      const elementRect = new DOMRect(10, 100, 300, 40)
      vi.spyOn(el, 'getBoundingClientRect').mockReturnValue(elementRect)
      vi.spyOn(window, 'getSelection').mockReturnValue(null)

      expect(new ContentEditableAdapter(el).getRect()).toBe(elementRect)
    })
  })

  describe('getCursorPosition', () => {
    it('should return 0 when selection is outside the element', () => {
      const el = makeContentEditable('hello')
      const outside = document.createElement('div')
      outside.textContent = 'other'
      document.body.appendChild(outside)

      const range = document.createRange()
      range.setStart(outside.firstChild!, 2)
      range.collapse(true)
      const selection = window.getSelection()!
      selection.removeAllRanges()
      selection.addRange(range)

      expect(new ContentEditableAdapter(el).getCursorPosition()).toBe(0)
    })

    it('should return textContent-based offset excluding block newlines', () => {
      const el = document.createElement('div')
      el.setAttribute('contenteditable', 'true')
      const p1 = document.createElement('p')
      p1.textContent = 'hello'
      const p2 = document.createElement('p')
      p2.textContent = 'world'
      el.appendChild(p1)
      el.appendChild(p2)
      document.body.appendChild(el)

      const range = document.createRange()
      range.setStart(p2.firstChild!, 3)
      range.collapse(true)
      const selection = window.getSelection()!
      selection.removeAllRanges()
      selection.addRange(range)

      expect(new ContentEditableAdapter(el).getCursorPosition()).toBe(8)
    })

    it('should return correct offset when cursor is in an element node (empty paragraph)', () => {
      const el = document.createElement('div')
      el.setAttribute('contenteditable', 'true')
      const p1 = document.createElement('p')
      p1.textContent = 'hello'
      const p2 = document.createElement('p')
      el.appendChild(p1)
      el.appendChild(p2)
      document.body.appendChild(el)

      const range = document.createRange()
      range.setStart(p2, 0)
      range.collapse(true)
      const selection = window.getSelection()!
      selection.removeAllRanges()
      selection.addRange(range)

      expect(new ContentEditableAdapter(el).getCursorPosition()).toBe(5)
    })
  })

  describe('getTextBeforeCursor', () => {
    it('should use range instead of slicing getValue', () => {
      const el = makeContentEditable('hello world')
      const textNode = el.firstChild!
      const range = document.createRange()
      range.setStart(textNode, 5)
      range.collapse(true)
      const selection = window.getSelection()!
      selection.removeAllRanges()
      selection.addRange(range)

      expect(new ContentEditableAdapter(el).getTextBeforeCursor()).toBe('hello')
    })

    it('should return empty string when selection is unavailable', () => {
      const el = makeContentEditable('hello')
      vi.spyOn(window, 'getSelection').mockReturnValue(null)

      expect(new ContentEditableAdapter(el).getTextBeforeCursor()).toBe('')
    })

    it('should return empty string when cursor is outside the element', () => {
      const el = makeContentEditable('hello')
      const outside = document.createElement('div')
      outside.textContent = 'other'
      document.body.appendChild(outside)

      const range = document.createRange()
      range.setStart(outside.firstChild!, 2)
      range.collapse(true)
      const selection = window.getSelection()!
      selection.removeAllRanges()
      selection.addRange(range)

      expect(new ContentEditableAdapter(el).getTextBeforeCursor()).toBe('')
    })

    it('should append newline when cursor is at the start of a non-first block element', () => {
      const el = document.createElement('div')
      el.setAttribute('contenteditable', 'true')
      const p1 = document.createElement('p')
      p1.textContent = 'hello'
      const p2 = document.createElement('p')
      el.appendChild(p1)
      el.appendChild(p2)
      document.body.appendChild(el)

      const range = document.createRange()
      range.setStart(p2, 0)
      range.collapse(true)
      const selection = window.getSelection()!
      selection.removeAllRanges()
      selection.addRange(range)

      const result = new ContentEditableAdapter(el).getTextBeforeCursor()

      expect(result).toBe('hello\n')
    })

    it('should append newline when cursor is mid-text inside a non-first block', () => {
      const el = document.createElement('div')
      el.setAttribute('contenteditable', 'true')
      const p1 = document.createElement('p')
      p1.textContent = 'hello'
      const p2 = document.createElement('p')
      p2.textContent = 'world'
      el.appendChild(p1)
      el.appendChild(p2)
      document.body.appendChild(el)

      const range = document.createRange()
      range.setStart(p2.firstChild!, 5)
      range.collapse(true)
      const selection = window.getSelection()!
      selection.removeAllRanges()
      selection.addRange(range)

      const result = new ContentEditableAdapter(el).getTextBeforeCursor()

      expect(result).toBe('hello\nworld')
    })

    it('should not append newline when cursor is in the first block element', () => {
      const el = document.createElement('div')
      el.setAttribute('contenteditable', 'true')
      const p1 = document.createElement('p')
      p1.textContent = 'hello'
      el.appendChild(p1)
      document.body.appendChild(el)

      const range = document.createRange()
      range.setStart(p1, 0)
      range.collapse(true)
      const selection = window.getSelection()!
      selection.removeAllRanges()
      selection.addRange(range)

      const result = new ContentEditableAdapter(el).getTextBeforeCursor()

      expect(result).toBe('')
    })
  })

  describe('insertText', () => {
    beforeEach(() => {
      vi.mocked(document.execCommand).mockClear()
    })

    it('should dispatch beforeinput before execCommand', () => {
      const el = makeContentEditable('>sum')
      const range = document.createRange()
      range.setStart(el.firstChild!, 4)
      range.collapse(true)
      const selection = window.getSelection()!
      selection.removeAllRanges()
      selection.addRange(range)

      const events: string[] = []
      el.addEventListener('beforeinput', () => events.push('beforeinput'))
      vi.mocked(document.execCommand).mockImplementation(() => {
        events.push('execCommand')
        return true
      })

      new ContentEditableAdapter(el).insertText('Summarize this', 4)
      expect(events).toEqual(['beforeinput', 'execCommand'])
    })

    it('should skip execCommand when beforeinput is cancelled', () => {
      const el = makeContentEditable('>sum')
      const range = document.createRange()
      range.setStart(el.firstChild!, 4)
      range.collapse(true)
      const selection = window.getSelection()!
      selection.removeAllRanges()
      selection.addRange(range)

      el.addEventListener('beforeinput', (e) => e.preventDefault())
      new ContentEditableAdapter(el).insertText('Summarize this', 4)
      expect(document.execCommand).not.toHaveBeenCalled()
    })

    it('should run execCommand when beforeinput is not cancelled', () => {
      const el = makeContentEditable('>sum')
      const range = document.createRange()
      range.setStart(el.firstChild!, 4)
      range.collapse(true)
      const selection = window.getSelection()!
      selection.removeAllRanges()
      selection.addRange(range)

      new ContentEditableAdapter(el).insertText('Summarize this', 4)
      expect(document.execCommand).toHaveBeenCalledWith(
        'insertText',
        false,
        'Summarize this',
      )
    })

    it('should return early when there is no selection', () => {
      vi.spyOn(window, 'getSelection').mockReturnValue(null)
      new ContentEditableAdapter(makeContentEditable('>sum')).insertText(
        'Summarize this',
        4,
      )
      expect(document.execCommand).not.toHaveBeenCalled()
    })
  })
})
