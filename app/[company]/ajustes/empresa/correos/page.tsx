"use client";

import { useDeferredValue, useMemo, useState } from "react";

import ProtectedLayout from "@/components/layout/ProtectedLayout";
import { SettingsListPage } from "@/components/layout/SettingsListPage";
import {
  SettingsMasterDetail,
  type MasterDetailItem,
} from "@/components/layout/SettingsMasterDetail";
import { useGetMailRecipientRules } from "@/hooks/ajustes/correos/useMailRecipientRules";
import { useCompanyStore } from "@/stores/CompanyStore";
import type { MailNoticeRow } from "@/types/mail-recipients";

import { NoticeRules } from "./_components/NoticeRules";

type NoticeItem = MailNoticeRow & MasterDetailItem;

const MailRecipientsPage = () => {
  const { selectedCompany } = useCompanyStore();
  const { data, isPending, isError, refetch } = useGetMailRecipientRules(
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
              ? "No se envía a nadie"
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
        title="Destinatarios de correos"
        heading="Destinatarios de correos"
        description="Defina quién recibe cada aviso por correo: roles, usuarios, empleados, departamentos o direcciones externas. Un aviso sin destinatarios no se envía."
        search={{
          value: search,
          onChange: setSearch,
          placeholder: "Buscar avisos...",
        }}
        count={{
          value: data ? filtered.length : undefined,
          singular: "aviso",
          plural: "avisos",
        }}
      >
        <SettingsMasterDetail
          items={filtered}
          loading={isPending}
          error={isError}
          errorMessage="No se pudieron cargar los avisos"
          onRetry={() => refetch()}
          emptyMessage="No hay avisos configurables."
          filtered={!!deferredSearch.trim()}
        >
          {(notice) => <NoticeRules notice={notice} />}
        </SettingsMasterDetail>
      </SettingsListPage>
    </ProtectedLayout>
  );
};

export default MailRecipientsPage;
