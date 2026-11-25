"use client";

import Link from "next/link";
import { ArrowUpRight, SlidersHorizontal } from "lucide-react";

import { useUpdateCriticalAlertSetting } from "@/actions/ajustes/alertas/actions";
import { selectTriggerClass } from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import {
  PanelSection,
  PanelStaticLabel,
} from "@/components/forms/PanelSection";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCompanyStore } from "@/stores/CompanyStore";
import type { CriticalAlertRow } from "@/types/critical-alerts";

import { AudienceRulesPanel } from "@/components/forms/recipients/AudienceRulesPanel";

import {
  ALERT_AUDIENCE_API,
  ALERT_AUDIENCE_COPY,
} from "@/app/[company]/ajustes/empresa/alertas/audience-api";

/**
 * Panel de una alerta crítica: cómo se comporta y quién la ve en su panel.
 * Los destinatarios de los correos que una alerta puede disparar NO se
 * configuran aquí: son otra configuración (Destinatarios de correos).
 */
export function AlertDetail({ alert }: { alert: CriticalAlertRow }) {
  const { selectedCompany } = useCompanyStore();
  const { updateAlert } = useUpdateCriticalAlertSetting();

  return (
    <div className="space-y-4">
      {alert.options.length > 0 && (
        <PanelSection
          icon={SlidersHorizontal}
          title="Comportamiento"
          hint="Cómo se genera esta alerta."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {alert.options.map((option) => (
              // El valor se guarda al elegir: no hay formulario ni botón de enviar.
              <div key={option.key}>
                <PanelStaticLabel>{option.label}</PanelStaticLabel>
                <Select
                  value={option.value}
                  disabled={updateAlert.isPending}
                  onValueChange={(value) => {
                    if (!selectedCompany || value === option.value) return;
                    updateAlert.mutate({
                      company: selectedCompany.slug,
                      key: alert.key,
                      data: { settings: { [option.key]: value } },
                    });
                  }}
                >
                  <SelectTrigger className={selectTriggerClass}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(option.options).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {option.help && (
                  <p className="mt-1.5 text-[13px] text-muted-foreground">
                    {option.help}
                  </p>
                )}
              </div>
            ))}
          </div>
        </PanelSection>
      )}

      <AudienceRulesPanel
        subject={{ key: alert.key, label: alert.label }}
        rules={alert.rules}
        api={ALERT_AUDIENCE_API}
        copy={ALERT_AUDIENCE_COPY}
      />

      {alert.mail_notice && selectedCompany && (
        <p className="text-[13px] text-muted-foreground">
          Esta alerta puede enviar un correo cuando quien la ve lo decide. A
          quién le llega se configura aparte, en{" "}
          <Link
            href={`/${selectedCompany.slug}/ajustes/empresa/correos`}
            className="inline-flex items-center gap-0.5 font-medium text-primary hover:underline"
          >
            Destinatarios de correos
            <ArrowUpRight className="size-3" />
          </Link>
          .
        </p>
      )}
    </div>
  );
}
