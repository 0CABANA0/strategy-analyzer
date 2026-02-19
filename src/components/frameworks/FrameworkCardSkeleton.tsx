import Skeleton from '../common/Skeleton'

export default function FrameworkCardSkeleton() {
  return (
    <div className="space-y-3 py-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-2/3" />
      <div className="pt-2 space-y-2">
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-4/5" />
      </div>
    </div>
  )
}
