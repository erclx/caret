import { useInputDetection } from '../hooks/use-input-detection'

export function App() {
  const { isActive, rect, triggerSymbol } = useInputDetection()

  if (!isActive || !rect) return null

  return (
    <div
      className='border-border bg-card text-card-foreground fixed z-50 rounded-lg border p-4 shadow-xl'
      style={{
        top: `${rect.top - 8}px`,
        left: `${rect.left}px`,
        transform: 'translateY(-100%)',
      }}
    >
      <h1 className='text-sm font-bold'>Trigger Detected: {triggerSymbol}</h1>
      <p className='text-muted-foreground text-xs'>Ready to search prompts</p>
    </div>
  )
}
