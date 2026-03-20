export function Logo({
  className,
  strokeWidth = 16,
}: {
  className?: string
  strokeWidth?: number
}) {
  return (
    <svg
      className={className}
      viewBox='0 0 128 128'
      fill='none'
      aria-hidden='true'
    >
      <polyline
        points='38,22 90,64 38,106'
        stroke='currentColor'
        strokeWidth={strokeWidth}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}
