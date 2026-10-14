"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { SettingsListPage } from "@/components/layout/SettingsListPage";
import { SettingsDataTable } from "@/components/tables/SettingsDataTable";
import { CreateJobTitleDialog } from "@/components/dialogs/general/CreateJobTitleDialog";
import { useGetJobTitles } from "@/hooks/ajustes/cargo/useGetJobTitles";
import { useCompanyStore } from "@/stores/CompanyStore";
import { columns } from "./columns";

const JobTitlePage = () => {
  const { selectedCompany } = useCompanyStore();
  const {
    data: jobTitles,
    isPending,
    isError,
    refetch,
  } = useGetJobTitles(selectedCompany?.slug);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);

  const filtered = useMemo(() => {
    if (!jobTitles) return [];
    const q = deferredSearch.trim().toLowerCase();
    if (!q) return jobTitles;

    return jobTitles.filter(
      (job) =>
        job.name?.toLowerCase().includes(q) ||
        job.description?.toLowerCase().includes(q),
    );
  }, [jobTitles, deferredSearch]);

  return (
    <SettingsListPage
      title="Cargos"
      heading="Gestión de Cargos"
      description="Administra los cargos que se asignan a los empleados."
      search={{
        value: search,
        onChange: setSearch,
        placeholder: "Buscar cargos...",
      }}
      count={{
        value: jobTitles ? filtered.length : undefined,
        singular: "cargo",
        plural: "cargos",
      }}
    >
      <SettingsDataTable
        columns={columns}
        data={filtered}
        error={isError}
        errorMessage="No se pudieron cargar los cargos"
        onRetry={() => refetch()}
        filtered={!!deferredSearch.trim()}
        loading={isPending}
        emptyMessage="No se han encontrado cargos."
        actions={<CreateJobTitleDialog />}
      />
    </SettingsListPage>
  );
};

export default JobTitlePage;
