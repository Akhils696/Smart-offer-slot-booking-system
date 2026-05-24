export function PageSkeleton() {
  return (
    <div className="w-full space-y-6 p-6 animate-pulse">
      <div className="space-y-3">
        <div className="h-4 w-28 rounded bg-border/60" />
        <div className="h-8 w-64 rounded bg-border/60" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="h-28 rounded-lg bg-border/40" />
        <div className="h-28 rounded-lg bg-border/40" />
        <div className="h-28 rounded-lg bg-border/40" />
      </div>
      <div className="h-64 rounded-lg bg-border/40" />
    </div>
  )
}
