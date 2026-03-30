import { Checkbox as CheckboxPrimitive } from 'radix-ui'
import * as React from 'react'

import { cn } from '@/shared/utils/cn'

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot='checkbox'
      className={cn(
        'border-border focus-visible:ring-ring/50 data-[state=checked]:bg-foreground data-[state=checked]:border-foreground size-4 shrink-0 rounded border transition-colors outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className='flex items-center justify-center text-current'>
        <svg
          viewBox='0 0 10 10'
          className='stroke-background size-3 fill-none stroke-2'
        >
          <polyline
            points='1.5,5 4,7.5 8.5,2.5'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        </svg>
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
