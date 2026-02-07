import { cn } from "@/lib/utils";

export function ReadOnlyField({
  label,
  value,
  icon,
  mono,
}: {
  label: string;
  value?: React.ReactNode;
  icon?: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="rounded-xl border bg-background p-4">
      <div className="flex items-start gap-3">
        {icon ? (
          <div className="mt-0.5 text-muted-foreground">{icon}</div>
        ) : null}
        <div className="min-w-0 flex-1">
          <div className="text-xs text-muted-foreground">{label}</div>
          <div
            className={cn(
              "mt-1 text-sm font-medium break-words",
              mono && "font-mono"
            )}
          >
            {value ?? <span className="text-muted-foreground">—</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
