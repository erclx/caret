import { DataSection } from '@/options/data-section'
import { GithubSection } from '@/options/github-section'
import { SiteConfigSection } from '@/options/site-config-section'
import { useSettings } from '@/shared/hooks/use-settings'

export function App() {
  const { isLoading } = useSettings()

  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center p-8'>
        <p className='text-muted-foreground'>Loading settings...</p>
      </div>
    )
  }

  return (
    <div className='bg-background text-foreground min-h-screen p-8'>
      <div className='mx-auto max-w-3xl'>
        <div className='mb-8 flex items-center gap-3'>
          <img src='/logo.png' alt='' className='size-8' aria-hidden='true' />
          <h1 className='text-3xl font-bold tracking-tight'>Caret settings</h1>
        </div>
        <DataSection />
        <SiteConfigSection />
        <GithubSection />
      </div>
    </div>
  )
}
