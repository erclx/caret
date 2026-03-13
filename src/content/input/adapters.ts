export interface InputAdapter {
  element: HTMLElement
  getValue(): string
  getCursorPosition(): number
  getTextBeforeCursor(): string
  getRect(): DOMRect
  insertText(text: string, deleteLength: number): void
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

  public insertText(text: string, deleteLength: number): void {
    this.element.focus()
    const start = this.element.selectionStart ?? 0
    const end = this.element.selectionEnd ?? 0
    const before = this.element.value.substring(0, start - deleteLength)
    const after = this.element.value.substring(end)
    const newValue = before + text + after

    const nativeSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      'value',
    )?.set

    if (!nativeSetter) {
      console.error(
        '[caret] HTMLTextAreaElement native setter not found — insertion skipped',
      )
      return
    }

    nativeSetter.call(this.element, newValue)

    const newCursor = before.length + text.length
    this.element.setSelectionRange(newCursor, newCursor)

    this.element.dispatchEvent(
      new InputEvent('input', {
        bubbles: true,
        cancelable: true,
        inputType: 'insertText',
        data: text,
      }),
    )
    this.element.dispatchEvent(new Event('change', { bubbles: true }))
  }
}

export class ContentEditableAdapter implements InputAdapter {
  element: HTMLElement

  constructor(element: HTMLElement) {
    this.element = element
  }

  public getValue(): string {
    return this.element.innerText || this.element.textContent || ''
  }

  public getCursorPosition(): number {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return 0

    const range = selection.getRangeAt(0)
    if (!this.element.contains(range.startContainer)) return 0

    return this.getTextOffsetToNode(range.startContainer, range.startOffset)
  }

  public getTextBeforeCursor(): string {
    return this.getValue().slice(0, this.getCursorPosition())
  }

  public getRect(): DOMRect {
    return this.element.getBoundingClientRect()
  }

  public insertText(text: string, deleteLength: number): void {
    this.element.focus()

    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    const absoluteEnd = this.getCursorPosition()
    const absoluteStart = Math.max(0, absoluteEnd - deleteLength)

    const startPosition = this.findTextPosition(absoluteStart)
    const endPosition = this.findTextPosition(absoluteEnd)

    if (!startPosition || !endPosition) return

    const range = document.createRange()
    range.setStart(startPosition.node, startPosition.offset)
    range.setEnd(endPosition.node, endPosition.offset)

    selection.removeAllRanges()
    selection.addRange(range)

    const beforeInputEvent = new InputEvent('beforeinput', {
      bubbles: true,
      cancelable: true,
      inputType: 'insertText',
      data: text,
    })
    const notCancelled = this.element.dispatchEvent(beforeInputEvent)

    if (notCancelled) {
      document.execCommand('insertText', false, text)
    }
  }

  private getTextOffsetToNode(targetNode: Node, targetOffset: number): number {
    const walker = document.createTreeWalker(
      this.element,
      NodeFilter.SHOW_TEXT,
      null,
    )
    let total = 0
    let node = walker.nextNode()
    while (node) {
      if (node === targetNode) {
        return total + targetOffset
      }
      total += node.textContent?.length ?? 0
      node = walker.nextNode()
    }
    return total
  }

  private findTextPosition(
    absolutePosition: number,
  ): { node: Node; offset: number } | null {
    const walker = document.createTreeWalker(
      this.element,
      NodeFilter.SHOW_TEXT,
      null,
    )
    let running = 0
    let node = walker.nextNode()
    while (node) {
      const length = node.textContent?.length ?? 0
      if (running + length >= absolutePosition) {
        return { node, offset: absolutePosition - running }
      }
      running += length
      node = walker.nextNode()
    }
    const lastNode = this.getLastTextNode()
    if (lastNode) {
      return { node: lastNode, offset: lastNode.textContent?.length ?? 0 }
    }
    return null
  }

  private getLastTextNode(): Node | null {
    const walker = document.createTreeWalker(
      this.element,
      NodeFilter.SHOW_TEXT,
      null,
    )
    let last: Node | null = null
    let node = walker.nextNode()
    while (node) {
      last = node
      node = walker.nextNode()
    }
    return last
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
