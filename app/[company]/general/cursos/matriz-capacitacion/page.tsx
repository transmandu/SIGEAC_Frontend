"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { SettingsListPage } from "@/components/layout/SettingsListPage";
import { SettingsDataTable } from "@/components/tables/SettingsDataTable";
import { CreateSmsTrainingGroupDialog } from "@/components/dialogs/general/CreateSmsTrainingGroupDialog";
import { useGetSmsTrainingGroups } from "@/hooks/curso/useGetSmsTrainingGroups";
import { useCompanyStore } from "@/stores/CompanyStore";
import { SmsTrainingGroupEmployees } from "./_components/SmsTrainingGroupEmployees";
import { columns } from "./columns";

const SmsTrainingMatrixPage = () => {
  const { selectedCompany } = useCompanyStore();
  const {
    data: groups,
    isPending,
    isError,
    refetch,
  } = useGetSmsTrainingGroups(selectedCompany?.slug);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);

  const filtered = useMemo(() => {
    if (!groups) return [];
    const q = deferredSearch.trim().toLowerCase();
    if (!q) return groups;

    return groups.filter(
      (group) =>
        group.name?.toLowerCase().includes(q) ||
        group.description?.toLowerCase().includes(q) ||
        group.job_titles.some((jobTitle) =>
          jobTitle.name.toLowerCase().includes(q),
        ),
    );
  }, [groups, deferredSearch]);

  return (
    <SettingsListPage
      title="Matriz de capacitación"
      heading="Matriz de capacitación SMS"
      description="Agrupa cargos para inscribir participantes en bloque en los cursos."
      search={{
        value: search,
        onChange: setSearch,
        placeholder: "Buscar grupos o cargos...",
      }}
      count={{
        value: groups ? filtered.length : undefined,
        singular: "grupo",
        plural: "grupos",
      }}
    >
      <SettingsDataTable
        columns={columns}
        data={filtered}
        error={isError}
        errorMessage="No se pudieron cargar los grupos de capacitación"
        onRetry={() => refetch()}
        filtered={!!deferredSearch.trim()}
        loading={isPending}
        emptyMessage="No se han encontrado grupos de capacitación."
        actions={<CreateSmsTrainingGroupDialog />}
        renderSubRow={(group) => <SmsTrainingGroupEmployees group={group} />}
      />
    </SettingsListPage>
  );
};

export default SmsTrainingMatrixPage;
