import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  ContentEditableAdapter,
  createAdapter,
  TextareaAdapter,
} from './adapters'

// jsdom does not define document.execCommand
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
