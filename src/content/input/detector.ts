import { createAdapter, type InputAdapter } from './adapters'

export interface TriggerState {
  isActive: boolean
  rect: DOMRect | null
  triggerSymbol: string
  query: string
}

export class InputDetector {
  private adapter: InputAdapter | null = null
  private triggerSymbol: string = '>'
  private resizeObserver: ResizeObserver
  private onTriggerChange: (state: TriggerState) => void

  private isActive = false
  private query = ''

  constructor(onTriggerChange: (state: TriggerState) => void) {
    this.onTriggerChange = onTriggerChange
    this.resizeObserver = new ResizeObserver(() => this.updateRect())
  }

  public setTriggerSymbol(symbol: string): void {
    this.triggerSymbol = symbol
  }

  public attach(element: HTMLElement): void {
    if (this.adapter?.element === element) return

    this.detach()

    const adapter = createAdapter(element)
    if (!adapter) return

    this.adapter = adapter
    this.adapter.element.addEventListener('keydown', this.handleKeydown)
    this.adapter.element.addEventListener('input', this.handleInput)
    this.resizeObserver.observe(this.adapter.element)
  }

  public detach(): void {
    if (this.adapter) {
      this.adapter.element.removeEventListener('keydown', this.handleKeydown)
      this.adapter.element.removeEventListener('input', this.handleInput)
      this.resizeObserver.unobserve(this.adapter.element)
      this.adapter = null
    }

    if (this.isActive) {
      this.deactivate()
    }
  }

  public destroy(): void {
    this.detach()
    this.resizeObserver.disconnect()
  }

  public deactivate(): void {
    this.isActive = false
    this.query = ''
    this.emitState()
  }

  private handleKeydown = (e: KeyboardEvent): void => {
    if (!this.adapter) return

    if (e.key === this.triggerSymbol) {
      const textBefore = this.adapter.getTextBeforeCursor()
      const isValid = textBefore.length === 0 || /\s$/.test(textBefore)

      if (isValid) {
        this.isActive = true
        this.query = ''
        setTimeout(() => this.emitState(), 0)
      }
    } else if (this.isActive && e.key === 'Escape') {
      this.deactivate()
    }
  }

  private handleInput = (): void => {
    if (!this.isActive || !this.adapter) return

    const textBefore = this.adapter.getTextBeforeCursor()
    const words = textBefore.split(/\s/)
    const lastWord = words[words.length - 1]

    if (!lastWord || !lastWord.startsWith(this.triggerSymbol)) {
      this.deactivate()
    } else {
      this.query = lastWord.slice(this.triggerSymbol.length)
      this.emitState()
    }
  }

  private updateRect(): void {
    if (this.isActive) {
      this.emitState()
    }
  }

  private emitState(): void {
    this.onTriggerChange({
      isActive: this.isActive,
      rect: this.isActive && this.adapter ? this.adapter.getRect() : null,
      triggerSymbol: this.triggerSymbol,
      query: this.query,
    })
  }
}
