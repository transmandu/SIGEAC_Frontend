"use client";

import type { ControlRecordType } from "@/actions/mantenimiento/planificacion/control_bajas/actions";
import { useCompanyTimezone } from "@/hooks/general/useCompanyTimezone";
import { formatInstant } from "@/lib/date";
import type { Retirable } from "@/types";
import { Archive } from "lucide-react";
import { RestoreRecordButton } from "./RetireRecordButton";

interface RetiredControlBannerProps {
  control: Retirable & { id: number };
  recordType: ControlRecordType;
  /** "control de mantenimiento"... */
  noun: string;
}

export function RetiredControlBanner({
  control,
  recordType,
  noun,
}: RetiredControlBannerProps) {
  const timeZone = useCompanyTimezone();

  if (!control.retired_at) return null;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <Archive className="mt-0.5 size-4 shrink-0 text-amber-700 dark:text-amber-300" />
        <div className="text-sm">
          <p className="font-medium text-amber-900 dark:text-amber-200">
            Este {noun} está dado de baja
          </p>
          <p className="text-amber-900/80 dark:text-amber-200/80">
            Desde el {formatInstant(control.retired_at, timeZone)}
            {control.retired_by ? ` (${control.retired_by})` : ""}. No entra en
            el cálculo, las alertas ni el calendario, y no admite cambios ni
            cumplimientos hasta reactivarlo.
          </p>
        </div>
      </div>
      <RestoreRecordButton
        recordType={recordType}
        recordId={control.id}
        subject={noun}
      />
    </div>
  );
}
