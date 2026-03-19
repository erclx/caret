// Dormant — extension icon now opens the sidepanel. Popup kept for reference/rollback.
import { PromptLibrary } from '@/shared/components/prompt-library'

export function App() {
  return (
    <div className='bg-background text-foreground flex h-125 w-80 flex-col p-3'>
      <div className='border-border bg-card text-card-foreground flex flex-1 flex-col overflow-hidden rounded-lg border p-4 shadow-xl'>
        <PromptLibrary />
      </div>
    </div>
  )
}
