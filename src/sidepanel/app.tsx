import { PromptLibrary } from '@/shared/components/prompt-library'

export default function App() {
  return (
    <div className='bg-background text-foreground flex min-h-screen w-full flex-col p-3'>
      <div className='border-border bg-card text-card-foreground flex flex-1 flex-col overflow-hidden rounded-lg border p-4 shadow-xl'>
        <PromptLibrary />
      </div>
    </div>
  )
}
