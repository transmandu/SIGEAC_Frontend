"use client";

import { useDeferredValue, useMemo, useState } from "react";

import { CreateEmployeeDialog } from "@/components/dialogs/general/CreateEmployeeDialog";
import { SettingsListPage } from "@/components/layout/SettingsListPage";
import {
  SegmentedTabs,
  SegmentedTabsList,
  SegmentedTabsTrigger,
} from "@/components/misc/SegmentedTabs";
import { SettingsDataTable } from "@/components/tables/SettingsDataTable";
import { useGetEmployeesByCompany } from "@/hooks/ajustes/empleados/useGetEmployees";
import { useGetInactiveEmployeesByCompany } from "@/hooks/ajustes/empleados/useGetInactiveEmployees";
import { phoneMatches } from "@/lib/phone";
import { useCompanyStore } from "@/stores/CompanyStore";
import type { Employee } from "@/types";
import { EmployeeExpandedRow } from "./_components/EmployeeExpandedRow";
import { getEmployeeColumns } from "./columns";

const activeColumns = getEmployeeColumns("active");
const inactiveColumns = getEmployeeColumns("inactive");

type Tab = "active" | "inactive";

const matches = (employee: Employee, q: string) =>
  [
    employee.first_name,
    employee.middle_name,
    employee.last_name,
    employee.second_last_name,
    employee.dni,
    employee.email,
    employee.job_title?.name,
    employee.department?.name,
    employee.location?.cod_iata,
    employee.location?.name,
    employee.location?.address,
  ].some((value) => value?.toLowerCase().includes(q)) ||
  phoneMatches(employee.phone, q);

const EmployeePage = () => {
  const { selectedCompany } = useCompanyStore();
  const companySlug = selectedCompany?.slug;

  const [tab, setTab] = useState<Tab>("active");
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
      description="Administre los empleados de la empresa: sus datos, su cargo, departamento y sede, y si tienen acceso al sistema. Quien deja la empresa se da de baja (inactivo) y su historial se conserva."
      tabs={
        <SegmentedTabs
          value={tab}
          onValueChange={(value) => setTab(value as Tab)}
        >
          <SegmentedTabsList>
            <SegmentedTabsTrigger value="active">
              Activos ({activeEmployees?.length ?? "…"})
            </SegmentedTabsTrigger>
            <SegmentedTabsTrigger value="inactive">
              Inactivos ({inactiveEmployees?.length ?? "…"})
            </SegmentedTabsTrigger>
          </SegmentedTabsList>
        </SegmentedTabs>
      }
      search={{
        value: search,
        onChange: setSearch,
        placeholder: "Buscar por nombre, cédula, cargo o sede...",
      }}
      count={{
        value: source ? filtered.length : undefined,
        singular: "empleado",
        plural: "empleados",
      }}
    >
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
        actions={tab === "active" ? <CreateEmployeeDialog /> : undefined}
        pageSize={10}
        renderSubRow={(employee) => <EmployeeExpandedRow employee={employee} />}
      />
    </SettingsListPage>
  );
};

export default EmployeePage;
