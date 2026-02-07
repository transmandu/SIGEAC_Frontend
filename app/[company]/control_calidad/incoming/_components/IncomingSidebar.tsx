import { useMemo, useState } from "react";
import { BadgeCheck, BadgeX, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type {
  ChecklistDecision,
  ChecklistGroup,
  ChecklistValue,
  IncomingConfirmPayload,
} from "@/app/[company]/control_calidad/incoming/IncomingTypes";
import { ChecklistGroupUI } from "./CheckListGroup";
import { cn } from "@/lib/utils";

export function IncomingSidebar({
  groups,
  checklist,
  setChecklist,
  requiredPassed,
  progress,
  onConfirm,
}: {
  groups: ChecklistGroup[];
  checklist: Record<string, ChecklistValue>;
  setChecklist: React.Dispatch<
    React.SetStateAction<Record<string, ChecklistValue>>
  >;
  requiredPassed: boolean;
  progress: number;
  onConfirm: (payload: IncomingConfirmPayload) => void;
}) {
  const [decision, setDecision] = useState<ChecklistDecision>("HOLD");
  const [finalZone, setFinalZone] = useState("");
  const [notes, setNotes] = useState("");

  const canAccept = requiredPassed && (!!finalZone || decision !== "ACCEPTED");

  function setItem(key: string, value: ChecklistValue) {
    setChecklist((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <aside className="lg:sticky lg:top-6 h-fit space-y-4">
      <div className="rounded-3xl border bg-background shadow-sm">
        <div className="p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Inspección</p>
            <span
              className={cn(
                "text-xs px-2 py-1 rounded-full border",
                requiredPassed
                  ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-700"
                  : "border-amber-400/30 bg-amber-500/10 text-amber-700"
              )}
            >
              {requiredPassed ? "Listo para aceptar" : "Pendiente"}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3">
            <div className="rounded-2xl border p-4">
              <p className="text-xs text-muted-foreground mb-2">Decisión</p>
              <Select value={decision} onValueChange={(v: any) => setDecision(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACCEPTED">Aceptar</SelectItem>
                  <SelectItem value="HOLD">Hold</SelectItem>
                  <SelectItem value="REJECTED">Rechazar</SelectItem>
                </SelectContent>
              </Select>

              {decision === "ACCEPTED" && (
                <div className="mt-3">
                  <p className="text-xs text-muted-foreground mb-2">
                    Ubicación final
                  </p>
                  <Input
                    value={finalZone}
                    onChange={(e) => setFinalZone(e.target.value)}
                    placeholder="Ej: A1-B2"
                  />
                  <p className="mt-2 text-xs text-muted-foreground">
                    Requerido para aceptar.
                  </p>
                </div>
              )}
            </div>

            <div className="rounded-2xl border p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Checklist</p>
                <p className="text-xs text-muted-foreground">{progress}%</p>
              </div>
              <div className="mt-2">
                <Progress value={progress} />
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 pb-5 space-y-4">
          {groups.map((g) => (
            <ChecklistGroupUI
              key={g.title}
              group={g}
              values={checklist}
              onChange={setItem}
            />
          ))}

          <div className="rounded-2xl border bg-background p-4">
            <p className="text-sm font-semibold">Notas del inspector</p>
            <Textarea
              className="mt-3"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
              placeholder="Discrepancias, daños, observaciones..."
            />
          </div>

          <div className="rounded-2xl border bg-background p-4">
            <p className="text-sm font-semibold">Acciones</p>
            <div className="mt-3 grid grid-cols-1 gap-2">
              <Button
                type="button"
                className="w-full"
                disabled={decision !== "ACCEPTED" || !canAccept}
                onClick={() =>
                  onConfirm({
                    decision: "ACCEPTED",
                    checklist,
                    notes,
                    final_zone: finalZone,
                  })
                }
              >
                <BadgeCheck className="h-4 w-4 mr-2" />
                Aceptar
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={decision !== "HOLD"}
                onClick={() => onConfirm({ decision: "HOLD", checklist, notes })}
              >
                <ShieldAlert className="h-4 w-4 mr-2" />
                Hold
              </Button>

              <Button
                type="button"
                variant="destructive"
                className="w-full"
                disabled={decision !== "REJECTED"}
                onClick={() =>
                  onConfirm({ decision: "REJECTED", checklist, notes })
                }
              >
                <BadgeX className="h-4 w-4 mr-2" />
                Rechazar
              </Button>

              {!requiredPassed && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Para aceptar, completa los ítems marcados como requeridos.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
