"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { SettingsListPage } from "@/components/layout/SettingsListPage";
import { SettingsDataTable } from "@/components/tables/SettingsDataTable";
import { CreateAuthorizedEmployeeDialog } from "@/components/dialogs/ajustes/CreateAuthorizedEmployeeDialog";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useGetAuthorizedEmployeesFromCompany } from "@/hooks/ajustes/autorizados/useGetAuthorizedEmployeesFromCompany";
import { columns } from "./columns";

const AuthorizeEmployeesPage = () => {
  const { selectedCompany } = useCompanyStore();
  const {
    data: employees,
    isPending,
    isError,
    refetch,
  } = useGetAuthorizedEmployeesFromCompany(selectedCompany?.slug);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);

  const filtered = useMemo(() => {
    if (!employees) return [];
    const q = deferredSearch.trim().toLowerCase();
    if (!q) return employees;

    return employees.filter(
      (item) =>
        item.employee_name?.toLowerCase()?.includes(q) ||
        item.dni_employee?.toLowerCase()?.includes(q) ||
        item.to_company_db?.toLowerCase()?.includes(q),
    );
  }, [employees, deferredSearch]);

  return (
    <SettingsListPage
      title="Autorizar Empleados"
      heading="Gestión de Autorizaciones"
      description="Visualice los empleados que su empresa ha autorizado para operar en otras empresas y registre o revoque autorizaciones cuando sea necesario."
      search={{
        value: search,
        onChange: setSearch,
        placeholder: "Buscar autorizaciones...",
      }}
      count={{
        value: employees ? filtered.length : undefined,
        singular: "autorización",
        plural: "autorizaciones",
      }}
    >
      <SettingsDataTable
        columns={columns}
        data={filtered}
        loading={isPending}
        error={isError}
        errorMessage="No se pudieron cargar las autorizaciones"
        onRetry={() => refetch()}
        filtered={!!deferredSearch.trim()}
        emptyMessage="No se han encontrado empleados autorizados por esta empresa."
        actions={<CreateAuthorizedEmployeeDialog />}
      />
    </SettingsListPage>
  );
};

export default AuthorizeEmployeesPage;
