"use client";

import { useDeferredValue, useMemo, useState } from "react";

import ProtectedLayout from "@/components/layout/ProtectedLayout";
import { SettingsListPage } from "@/components/layout/SettingsListPage";
import {
  SettingsMasterDetail,
  type MasterDetailItem,
} from "@/components/layout/SettingsMasterDetail";
import { useGetCriticalAlertSettings } from "@/hooks/ajustes/alertas/useCriticalAlertSettings";
import { useGetCriticalAlertAudience } from "@/hooks/ajustes/alertas/useCriticalAlertAudience";
import { useCompanyStore } from "@/stores/CompanyStore";
import type { CriticalAlertRow } from "@/types/critical-alerts";

import { AlertDetail } from "./_components/AlertDetail";
import { EnabledSwitch } from "./_components/EnabledSwitch";

type AlertItem = CriticalAlertRow & MasterDetailItem;

const CriticalAlertsSettingsPage = () => {
  const { selectedCompany } = useCompanyStore();
  const slug = selectedCompany?.slug;

  const alerts = useGetCriticalAlertSettings(slug);
  const audience = useGetCriticalAlertAudience(slug);

  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);

  const items = useMemo<AlertItem[]>(
    () =>
      (alerts.data ?? []).map((alert) => {
        const rules = (audience.data ?? []).filter(
          (rule) => rule.alert_key === alert.key,
        );
        const active = rules.filter((rule) => rule.is_active).length;

        return {
          ...alert,
          rules,
          status: !alert.is_enabled ? "off" : active === 0 ? "idle" : "ready",
          summary: !alert.is_enabled
            ? "Desactivada"
            : active === 0
              ? "Nadie la ve"
              : `${active} ${active === 1 ? "regla activa" : "reglas activas"}`,
        };
      }),
    [alerts.data, audience.data],
  );

  const filtered = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();
    if (!query) return items;

    return items.filter(
      (alert) =>
        alert.label.toLowerCase().includes(query) ||
        alert.group.toLowerCase().includes(query) ||
        alert.description.toLowerCase().includes(query),
    );
  }, [items, deferredSearch]);

  const isPending = alerts.isPending || audience.isPending;
  const isError = alerts.isError || audience.isError;

  return (
    <ProtectedLayout roles={["SUPERUSER"]}>
      <SettingsListPage
        fill
        title="Alertas críticas"
        heading="Alertas críticas"
        description="Defina qué alertas están activas, cómo se generan y quién las ve en su panel. Una alerta que nadie tiene asignada solo la ve el superusuario."
        search={{
          value: search,
          onChange: setSearch,
          placeholder: "Buscar alertas...",
        }}
        count={{
          value: isPending || isError ? undefined : filtered.length,
          singular: "alerta",
          plural: "alertas",
        }}
      >
        <SettingsMasterDetail
          items={filtered}
          loading={isPending}
          error={isError}
          errorMessage="No se pudieron cargar las alertas"
          onRetry={() => {
            alerts.refetch();
            audience.refetch();
          }}
          emptyMessage="No hay alertas configurables."
          filtered={!!deferredSearch.trim()}
          headerAction={(alert) => <EnabledSwitch alert={alert} />}
        >
          {(alert) => <AlertDetail alert={alert} />}
        </SettingsMasterDetail>
      </SettingsListPage>
    </ProtectedLayout>
  );
};

export default CriticalAlertsSettingsPage;
