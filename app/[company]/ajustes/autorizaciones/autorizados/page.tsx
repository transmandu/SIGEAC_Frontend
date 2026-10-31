"use client";

import { SlidersHorizontal } from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";
import { SettingsListPage } from "@/components/layout/SettingsListPage";
import { SettingsDataTable } from "@/components/tables/SettingsDataTable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCompanyStore } from "@/stores/CompanyStore";
import type { CompanyScope } from "@/hooks/ajustes/convenios/types";
import { useGetExternalEmployees } from "@/hooks/ajustes/convenios/useGetExternalEmployees";
import { useGetCompanyLoans } from "@/hooks/ajustes/convenios/useGetCompanyLoans";
import { columns } from "./columns";

type ScopeFilter = CompanyScope | "all";

const ExternalStaffPage = () => {
  const { selectedCompany } = useCompanyStore();
  const slug = selectedCompany?.slug;
  const [scope, setScope] = useState<ScopeFilter>("all");
  const { data: loans } = useGetCompanyLoans(slug);

  // Solo los alcances que esta empresa tiene abiertos en algún convenio: son los
  // únicos con personal posible. Ofrecer el catálogo entero daría opciones que
  // siempre salen vacías.
  const openScopes = useMemo(() => {
    const byKey = new Map<CompanyScope, string>();
    for (const agreement of loans?.granted ?? []) {
      for (const s of agreement.scopes) {
        if (s.is_active) byKey.set(s.scope, s.label);
      }
    }
    return [...byKey].map(([value, label]) => ({ value, label }));
  }, [loans]);

  const {
    data: employees,
    isPending,
    isError,
    refetch,
  } = useGetExternalEmployees(slug, scope);
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
        item.from_company_name?.toLowerCase()?.includes(q),
    );
  }, [employees, deferredSearch]);

  return (
    <SettingsListPage
      title="Personal Externo"
      heading="Personal Externo de Otras Empresas"
      description="Personas de otras empresas que pueden actuar en esta empresa, en todos los alcances que usted abrió o en el elegido. Cada empresa decide quiénes desde sus convenios recibidos; esta sección es únicamente informativa."
      search={{
        value: search,
        onChange: setSearch,
        placeholder: "Buscar personal externo...",
      }}
      filters={
        <div className="relative">
          <SlidersHorizontal className="pointer-events-none absolute left-2.5 top-1/2 z-10 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Select
            value={scope}
            onValueChange={(value) => setScope(value as ScopeFilter)}
          >
            <SelectTrigger className="h-8 w-56 border-slate-200/60 bg-white/80 pl-8 text-left text-xs transition-colors focus:ring-1 focus:ring-primary/40 dark:border-slate-700/60 dark:bg-slate-900/60">
              <SelectValue placeholder="Alcance" />
            </SelectTrigger>
            <SelectContent className="border-slate-200/60 dark:border-slate-700/60">
              <SelectItem value="all">Todos los alcances</SelectItem>
              {openScopes.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      }
      count={{
        value: employees ? filtered.length : undefined,
        singular: "persona",
        plural: "personas",
      }}
    >
      <SettingsDataTable
        columns={columns}
        data={filtered}
        loading={isPending}
        error={isError}
        errorMessage="No se pudo cargar el personal externo"
        onRetry={() => refetch()}
        filtered={!!deferredSearch.trim()}
        emptyMessage="Ninguna persona externa tiene acceso todavía."
      />
    </SettingsListPage>
  );
};

export default ExternalStaffPage;
