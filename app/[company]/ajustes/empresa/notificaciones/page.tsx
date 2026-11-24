"use client";

import { useDeferredValue, useMemo, useState } from "react";

import { AudienceRulesPanel } from "@/components/forms/recipients/AudienceRulesPanel";
import ProtectedLayout from "@/components/layout/ProtectedLayout";
import { SettingsListPage } from "@/components/layout/SettingsListPage";
import {
  SettingsMasterDetail,
  type MasterDetailItem,
} from "@/components/layout/SettingsMasterDetail";
import { useGetInAppAudience } from "@/hooks/ajustes/notificaciones/useInAppAudience";
import { useCompanyStore } from "@/stores/CompanyStore";
import type { InAppNoticeRow } from "@/types/in-app-notices";

import { IN_APP_AUDIENCE_API, IN_APP_AUDIENCE_COPY } from "./audience-api";

type NoticeItem = InAppNoticeRow & MasterDetailItem;

const InAppNotificationsPage = () => {
  const { selectedCompany } = useCompanyStore();
  const { data, isPending, isError, refetch } = useGetInAppAudience(
    selectedCompany?.slug,
  );
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);

  const items = useMemo<NoticeItem[]>(
    () =>
      (data?.notices ?? []).map((notice) => {
        const rules = (data?.rules ?? []).filter(
          (rule) => rule.notice_key === notice.key,
        );
        const active = rules.filter((rule) => rule.is_active).length;

        return {
          ...notice,
          rules,
          status: active === 0 ? "idle" : "ready",
          summary:
            active === 0
              ? "Nadie la recibe"
              : `${active} ${active === 1 ? "regla activa" : "reglas activas"}`,
        };
      }),
    [data],
  );

  const filtered = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();
    if (!query) return items;

    return items.filter(
      (notice) =>
        notice.label.toLowerCase().includes(query) ||
        notice.group?.toLowerCase().includes(query) ||
        notice.description?.toLowerCase().includes(query),
    );
  }, [items, deferredSearch]);

  return (
    <ProtectedLayout roles={["SUPERUSER"]}>
      <SettingsListPage
        fill
        title="Notificaciones in-app"
        heading="Notificaciones in-app"
        description="Defina quién recibe cada notificación dentro del sistema: roles, usuarios, empleados o departamentos. Es independiente de los correos y de las alertas críticas. Una notificación sin destinatarios solo la recibe el superusuario."
        search={{
          value: search,
          onChange: setSearch,
          placeholder: "Buscar notificaciones...",
        }}
        count={{
          value: data ? filtered.length : undefined,
          singular: "notificación",
          plural: "notificaciones",
        }}
      >
        <SettingsMasterDetail
          items={filtered}
          loading={isPending}
          error={isError}
          errorMessage="No se pudieron cargar las notificaciones"
          onRetry={() => refetch()}
          emptyMessage="No hay notificaciones configurables."
          filtered={!!deferredSearch.trim()}
        >
          {(notice) => (
            <AudienceRulesPanel
              subject={{ key: notice.key, label: notice.label }}
              rules={notice.rules}
              api={IN_APP_AUDIENCE_API}
              copy={IN_APP_AUDIENCE_COPY}
            />
          )}
        </SettingsMasterDetail>
      </SettingsListPage>
    </ProtectedLayout>
  );
};

export default InAppNotificationsPage;
