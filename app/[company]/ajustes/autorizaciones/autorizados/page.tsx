"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { SettingsListPage } from "@/components/layout/SettingsListPage";
import { SettingsDataTable } from "@/components/tables/SettingsDataTable";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useGetAuthorizedEmployees } from "@/hooks/ajustes/autorizados/useGetAuthorizedEmployees";
import { columns } from "./columns";

const AuthorizedEmployeesPage = () => {
  const { selectedCompany } = useCompanyStore();
  const {
    data: employees,
    isPending,
    isError,
    refetch,
  } = useGetAuthorizedEmployees(selectedCompany?.slug);
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
        item.from_company_db?.toLowerCase()?.includes(q),
    );
  }, [employees, deferredSearch]);

  return (
    <SettingsListPage
      title="Empleados Autorizados"
      heading="Empleados Autorizados en Esta Empresa"
      description="Empleados pertenecientes a otras empresas que han sido autorizados para operar en la empresa actual. Esta sección es únicamente informativa."
      search={{
        value: search,
        onChange: setSearch,
        placeholder: "Buscar empleados autorizados...",
      }}
      count={{
        value: employees ? filtered.length : undefined,
        singular: "empleado",
        plural: "empleados",
      }}
    >
      <SettingsDataTable
        columns={columns}
        data={filtered}
        loading={isPending}
        error={isError}
        errorMessage="No se pudieron cargar los empleados autorizados"
        onRetry={() => refetch()}
        filtered={!!deferredSearch.trim()}
        emptyMessage="No se han encontrado empleados autorizados."
      />
    </SettingsListPage>
  );
};

export default AuthorizedEmployeesPage;
