"use client";

import type { ControlRecordType } from "@/actions/mantenimiento/planificacion/control_bajas/actions";
import { FormSection } from "@/components/forms/mantenimiento/planificacion/_theme";
import { useCompanyTimezone } from "@/hooks/general/useCompanyTimezone";
import { formatInstant } from "@/lib/date";
import { Archive } from "lucide-react";
import { RestoreRecordButton } from "./RetireRecordButton";

export interface RetiredRow {
  id: number;
  recordType: ControlRecordType;
  label: string;
  detail?: string;
  /** Texto para el diálogo: "servicio «…»". */
  subject: string;
  retired_at: string;
  retired_by?: string | null;
}

/** Lo dado de baja se muestra aparte: no tiene estado que calcular, pero su historial sigue ahí. */
export function RetiredItemsSection({
  rows,
  canRestore,
}: {
  rows: RetiredRow[];
  canRestore: boolean;
}) {
  const timeZone = useCompanyTimezone();

  if (!rows.length) return null;

  return (
    <FormSection
      icon={Archive}
      title="Dados de baja"
      hint="Fuera del cálculo y de las alertas; su historial se conserva."
    >
      <ul className="flex flex-col divide-y divide-border/50 rounded-lg border border-slate-400/40 dark:border-slate-600/40">
        {rows.map((row) => (
          <li
            key={`${row.recordType}-${row.id}`}
            className="flex flex-wrap items-center gap-3 px-3 py-2.5"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{row.label}</p>
              {row.detail && (
                <p className="truncate text-xs text-muted-foreground">
                  {row.detail}
                </p>
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {formatInstant(row.retired_at, timeZone)}
              {row.retired_by ? ` · ${row.retired_by}` : ""}
            </span>
            {canRestore && (
              <RestoreRecordButton
                recordType={row.recordType}
                recordId={row.id}
                subject={row.subject}
              />
            )}
          </li>
        ))}
      </ul>
    </FormSection>
  );
}
