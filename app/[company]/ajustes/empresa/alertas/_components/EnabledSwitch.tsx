"use client";

import { useUpdateCriticalAlertSetting } from "@/actions/ajustes/alertas/actions";
import { TagBadge } from "@/components/misc/TagBadge";
import { Switch } from "@/components/ui/switch";
import { useCompanyStore } from "@/stores/CompanyStore";
import type { CriticalAlertRow } from "@/types/critical-alerts";

/** Cómo se genera la alerta y el interruptor que la activa o apaga para toda la compañía. */
export function EnabledSwitch({ alert }: { alert: CriticalAlertRow }) {
  const { selectedCompany } = useCompanyStore();
  const { updateAlert } = useUpdateCriticalAlertSetting();

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <TagBadge tone={alert.generates ? "violet" : "slate"}>
        {alert.generates ? "Generada por día" : "En vivo"}
      </TagBadge>
      <label className="flex items-center gap-2 text-[13px] font-medium text-foreground/80">
        {alert.is_enabled ? "Activa" : "Desactivada"}
        <Switch
          aria-label={alert.is_enabled ? "Desactivar alerta" : "Activar alerta"}
          checked={alert.is_enabled}
          disabled={updateAlert.isPending}
          onCheckedChange={(checked) => {
            if (!selectedCompany) return;
            updateAlert.mutate({
              company: selectedCompany.slug,
              key: alert.key,
              data: { is_enabled: checked },
            });
          }}
        />
      </label>
    </div>
  );
}
