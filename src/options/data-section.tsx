import { Download, Upload } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { Button } from '@/shared/components/ui/button'
import { usePrompts } from '@/shared/hooks/use-prompts'
import {
  exportPrompts,
  formatImportFeedback,
  parseImport,
} from '@/shared/utils/io'

type ImportFeedback =
  | { type: 'success'; updatedNames: string[]; addedNames: string[] }
  | { type: 'error'; message: string }

export function DataSection() {
  const { prompts, importPrompts } = usePrompts()
  const [importFeedback, setImportFeedback] = useState<ImportFeedback | null>(
    null,
  )
  const [exportFeedback, setExportFeedback] = useState<string | null>(null)
  const importTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const exportTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    return () => {
      if (importTimerRef.current) clearTimeout(importTimerRef.current)
      if (exportTimerRef.current) clearTimeout(exportTimerRef.current)
    }
  }, [])

  function showImportFeedback(feedback: ImportFeedback, duration: number) {
    setImportFeedback(feedback)
    if (importTimerRef.current) clearTimeout(importTimerRef.current)
    importTimerRef.current = setTimeout(() => setImportFeedback(null), duration)
  }

  function showExportFeedback(message: string) {
    setExportFeedback(message)
    if (exportTimerRef.current) clearTimeout(exportTimerRef.current)
    exportTimerRef.current = setTimeout(() => setExportFeedback(null), 2500)
  }

  function handleExport() {
    if (prompts.length === 0) {
      showExportFeedback('Nothing to export.')
      return
    }
    exportPrompts(prompts)
    showExportFeedback('Exported ✓')
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    const text = await file.text()
    const result = parseImport(text)

    if (!result.ok) {
      showImportFeedback({ type: 'error', message: result.error }, 2500)
      return
    }

    if (result.prompts.length === 0) {
      showImportFeedback(
        { type: 'error', message: 'Select a file with at least one prompt.' },
        2500,
      )
      return
    }

    const { addedNames, updatedNames } = await importPrompts(result.prompts)
    const total = addedNames.length + updatedNames.length
    showImportFeedback(
      { type: 'success', updatedNames, addedNames },
      Math.max(3000, total * 800),
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
        {exportFeedback && (
          <p
            className={
              exportFeedback === 'Exported ✓'
                ? 'text-muted-foreground text-sm'
                : 'text-destructive text-sm'
            }
          >
            {exportFeedback}
          </p>
        )}
        {importFeedback && (
          <div className='text-sm'>
            {importFeedback.type === 'error' ? (
              <p className='text-destructive'>{importFeedback.message}</p>
            ) : (
              <p className='text-muted-foreground'>
                {formatImportFeedback(
                  importFeedback.addedNames,
                  importFeedback.updatedNames,
                )}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
