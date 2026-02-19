interface SkeletonProps {
  className?: string
  variant?: 'text' | 'rectangular' | 'circular'
}

export default function Skeleton({ className = '', variant = 'text' }: SkeletonProps) {
  const base = 'animate-pulse bg-gray-200 dark:bg-gray-700'

  const variants: Record<string, string> = {
    text: `${base} h-4 rounded`,
    rectangular: `${base} rounded-lg`,
    circular: `${base} rounded-full`,
  }

  return <div className={`${variants[variant]} ${className}`} />
}
