import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChecklistGroup, ChecklistValue } from "../../IncomingTypes";

export function ChecklistGroupUI({
  group,
  values,
  onChange,
}: {
  group: ChecklistGroup;
  values: Record<string, ChecklistValue>;
  onChange: (key: string, value: ChecklistValue) => void;
}) {
  return (
    <div className="rounded-2xl border bg-background p-4">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">{group.icon}</span>
        <p className="text-sm font-semibold">{group.title}</p>
      </div>

      <div className="mt-3 space-y-3">
        {group.items.map((it: any) => {
          const v = values[it.key];
          const ok = v === true;
          const na = v === "NA";
          const bad = v === false;

          return (
            <div key={it.key} className="rounded-xl border p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium leading-5">
                    {it.label}
                    {it.requiredForAccept ? (
                      <span className="ml-2 text-[10px] font-semibold text-amber-700 border border-amber-300/50 bg-amber-500/10 px-2 py-0.5 rounded-full">
                        requerido
                      </span>
                    ) : null}
                  </p>
                  {it.hint ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {it.hint}
                    </p>
                  ) : null}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={ok ? "default" : "outline"}
                    onClick={() => onChange(it.key, true)}
                    className={cn(ok && "shadow-sm")}
                  >
                    OK
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={bad ? "destructive" : "outline"}
                    onClick={() => onChange(it.key, false)}
                  >
                    NO
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={na ? "secondary" : "outline"}
                    onClick={() => onChange(it.key, "NA")}
                  >
                    N/A
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
