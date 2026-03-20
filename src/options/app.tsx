import { DataSection } from '@/options/data-section'
import { GithubSection } from '@/options/github-section'
import { SiteConfigSection } from '@/options/site-config-section'
import { useSettings } from '@/shared/hooks/use-settings'

export function App() {
  const { settings, isLoading, updateSettings, updateSiteSettings } =
    useSettings()

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
        <DataSection />
        <SiteConfigSection
          settings={settings}
          updateSiteSettings={updateSiteSettings}
        />
        <GithubSection settings={settings} updateSettings={updateSettings} />
      </div>
    </div>
  )
}
