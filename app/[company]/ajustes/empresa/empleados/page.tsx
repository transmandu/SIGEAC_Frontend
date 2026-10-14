"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { SettingsListPage } from "@/components/layout/SettingsListPage";
import { SettingsDataTable } from "@/components/tables/SettingsDataTable";
import { CreateEmployeeDialog } from "@/components/dialogs/general/CreateEmployeeDialog";
import { useGetEmployeesByCompany } from "@/hooks/ajustes/empleados/useGetEmployees";
import { useGetInactiveEmployeesByCompany } from "@/hooks/ajustes/empleados/useGetInactiveEmployees";
import { useCompanyStore } from "@/stores/CompanyStore";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Employee } from "@/types";
import { getEmployeeColumns } from "./columns";
import { EmployeeExpandedRow } from "./_components/EmployeeExpandedRow";

const activeColumns = getEmployeeColumns("active");
const inactiveColumns = getEmployeeColumns("inactive");

const matches = (employee: Employee, q: string) =>
  [
    employee.first_name,
    employee.middle_name,
    employee.last_name,
    employee.second_last_name,
    employee.dni,
    employee.email,
  ].some((value) => value?.toLowerCase().includes(q));

const EmployeePage = () => {
  const { selectedCompany } = useCompanyStore();
  const companySlug = selectedCompany?.slug;

  const [tab, setTab] = useState<"active" | "inactive">("active");
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);

  const {
    data: activeEmployees,
    isPending: loadingActive,
    isError: errorActive,
    refetch: refetchActive,
  } = useGetEmployeesByCompany(companySlug);

  const {
    data: inactiveEmployees,
    isPending: loadingInactive,
    isError: errorInactive,
    refetch: refetchInactive,
  } = useGetInactiveEmployeesByCompany(companySlug);

  const source = tab === "active" ? activeEmployees : inactiveEmployees;

  const filtered = useMemo(() => {
    if (!source) return [];
    const q = deferredSearch.trim().toLowerCase();
    if (!q) return source;

    return source.filter((employee) => matches(employee, q));
  }, [source, deferredSearch]);

  const loading = tab === "active" ? loadingActive : loadingInactive;
  const hasError = tab === "active" ? errorActive : errorInactive;
  const retry = tab === "active" ? refetchActive : refetchInactive;

  return (
    <SettingsListPage
      title="Empleados"
      heading="Gestión de Empleados"
      description="Administra los empleados registrados y su información."
      search={{
        value: search,
        onChange: setSearch,
        placeholder: "Buscar por nombre, cédula o correo...",
      }}
      count={{
        value: source ? filtered.length : undefined,
        singular: "empleado",
        plural: "empleados",
      }}
    >
      <Tabs
        value={tab}
        onValueChange={(value) => setTab(value as "active" | "inactive")}
      >
        <TabsList className="grid grid-cols-2 w-[320px]">
          <TabsTrigger value="active">
            Activos ({activeEmployees?.length ?? "…"})
          </TabsTrigger>
          <TabsTrigger value="inactive">
            Inactivos ({inactiveEmployees?.length ?? "…"})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <SettingsDataTable
        key={tab}
        columns={tab === "active" ? activeColumns : inactiveColumns}
        data={filtered}
        loading={loading}
        error={hasError}
        errorMessage="No se pudieron cargar los empleados"
        onRetry={() => retry()}
        filtered={!!deferredSearch.trim()}
        emptyMessage={
          tab === "active"
            ? "No se han encontrado empleados activos."
            : "No se han encontrado empleados inactivos."
        }
        actions={<CreateEmployeeDialog />}
        pageSize={10}
        renderSubRow={(employee) => <EmployeeExpandedRow employee={employee} />}
      />
    </SettingsListPage>
  );
};

export default EmployeePage;
