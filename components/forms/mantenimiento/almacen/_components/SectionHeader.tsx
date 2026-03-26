export function SectionHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-border/60" />
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2">
        {label}
      </span>
      <div className="h-px flex-1 bg-border/60" />
    </div>
  )
}
