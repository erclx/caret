import { Download, Upload } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { Button } from '@/shared/components/ui/button'
import { usePrompts } from '@/shared/hooks/use-prompts'
import { cn } from '@/shared/utils/cn'
import { exportPrompts, parseImport } from '@/shared/utils/io'

type ImportFeedback = { type: 'success' | 'error'; message: string }

export function DataSection() {
  const { prompts, importPrompts } = usePrompts()
  const [importFeedback, setImportFeedback] = useState<ImportFeedback | null>(
    null,
  )
  const importTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    return () => {
      if (importTimerRef.current) clearTimeout(importTimerRef.current)
    }
  }, [])

  function showImportFeedback(type: ImportFeedback['type'], message: string) {
    setImportFeedback({ type, message })
    if (importTimerRef.current) clearTimeout(importTimerRef.current)
    importTimerRef.current = setTimeout(() => setImportFeedback(null), 2500)
  }

  function handleExport() {
    exportPrompts(prompts)
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    const text = await file.text()
    const result = parseImport(text)

    if (!result.ok) {
      showImportFeedback('error', result.error)
      return
    }

    if (result.prompts.length === 0) {
      showImportFeedback('error', 'No prompts found in file.')
      return
    }

    const { added, updated } = await importPrompts(result.prompts)
    const total = added + updated
    showImportFeedback(
      'success',
      `Imported ${total} prompt${total !== 1 ? 's' : ''} (${added} added, ${updated} updated).`,
    )
  }

  return (
    <div className='border-border bg-card text-card-foreground mb-6 rounded-lg border shadow-xs'>
      <div className='border-border border-b p-6'>
        <h2 className='text-foreground text-sm font-semibold'>Data</h2>
        <p className='text-muted-foreground text-sm'>
          Export your prompts as a backup or restore from a previous export.
        </p>
      </div>
      <div className='flex flex-col gap-3 p-6'>
        <Button
          variant='outline'
          className='w-full justify-start dark:hover:bg-zinc-700 dark:hover:text-white'
          onClick={handleExport}
        >
          <Download className='mr-2 size-4' />
          Export prompts as JSON
        </Button>
        <Button
          variant='outline'
          className='w-full justify-start dark:hover:bg-zinc-700 dark:hover:text-white'
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className='mr-2 size-4' />
          Import prompts from JSON
        </Button>
        <input
          ref={fileInputRef}
          type='file'
          accept='.json'
          className='hidden'
          onChange={handleFileChange}
        />
        {importFeedback && (
          <p
            className={cn(
              'text-sm',
              importFeedback.type === 'success'
                ? 'text-muted-foreground'
                : 'text-destructive',
            )}
          >
            {importFeedback.message}
          </p>
        )}
      </div>
    </div>
  )
}
