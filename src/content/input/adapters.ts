export interface InputAdapter {
  element: HTMLElement
  getValue(): string
  getCursorPosition(): number
  getTextBeforeCursor(): string
  getRect(): DOMRect
}

export class TextareaAdapter implements InputAdapter {
  element: HTMLTextAreaElement

  constructor(element: HTMLTextAreaElement) {
    this.element = element
  }

  public getValue(): string {
    return this.element.value
  }

  public getCursorPosition(): number {
    return this.element.selectionEnd || 0
  }

  public getTextBeforeCursor(): string {
    return this.getValue().slice(0, this.getCursorPosition())
  }

  public getRect(): DOMRect {
    return this.element.getBoundingClientRect()
  }
}

export class ContentEditableAdapter implements InputAdapter {
  element: HTMLElement

  constructor(element: HTMLElement) {
    this.element = element
  }

  public getValue(): string {
    return this.element.textContent || ''
  }

  public getCursorPosition(): number {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) {
      return 0
    }

    const range = selection.getRangeAt(0)
    if (!this.element.contains(range.startContainer)) {
      return 0
    }

    const preCaretRange = range.cloneRange()
    preCaretRange.selectNodeContents(this.element)
    preCaretRange.setEnd(range.startContainer, range.startOffset)
    return preCaretRange.cloneContents().textContent?.length || 0
  }

  public getTextBeforeCursor(): string {
    return this.getValue().slice(0, this.getCursorPosition())
  }

  public getRect(): DOMRect {
    return this.element.getBoundingClientRect()
  }
}

export function createAdapter(element: HTMLElement): InputAdapter | null {
  if (element instanceof HTMLTextAreaElement) {
    return new TextareaAdapter(element)
  }
  if (
    element.isContentEditable ||
    element.getAttribute('contenteditable') === 'true'
  ) {
    return new ContentEditableAdapter(element)
  }
  return null
}
