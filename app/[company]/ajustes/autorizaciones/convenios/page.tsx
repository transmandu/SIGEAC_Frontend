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
import { CreateCompanyLoanDialog } from "@/components/dialogs/ajustes/CreateCompanyLoanDialog";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useGetCompanyLoans } from "@/hooks/ajustes/convenios/useGetCompanyLoans";
import { getColumns, type LoanRow } from "./columns";

type DirectionFilter = "ALL" | LoanRow["direction"];

// Rótulos del filtro, en plural: la columna "Sentido" habla de cada empresa.
const DIRECTION_LABELS: Record<LoanRow["direction"], string> = {
  granted: "Pueden usar nuestros módulos",
  received: "Podemos usar sus módulos",
};

const CompanyLoansPage = () => {
  const { selectedCompany } = useCompanyStore();
  const slug = selectedCompany?.slug;
  const { data, isPending, isError, refetch } = useGetCompanyLoans(slug);
  const [search, setSearch] = useState("");
  const [direction, setDirection] = useState<DirectionFilter>("ALL");
  const deferredSearch = useDeferredValue(search);

  const columns = useMemo(() => getColumns(slug), [slug]);

  const rows = useMemo<LoanRow[]>(() => {
    if (!data) return [];
    return [
      ...data.granted.map((l) => ({
        ...l,
        direction: "granted" as const,
        otherName: l.borrower_company_name,
      })),
      ...data.received.map((l) => ({
        ...l,
        direction: "received" as const,
        otherName: l.lender_company_name,
      })),
    ];
  }, [data]);

  const filtered = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (direction === "ALL" || r.direction === direction) &&
        (!q || r.otherName.toLowerCase().includes(q)),
    );
  }, [rows, deferredSearch, direction]);

  return (
    <SettingsListPage
      title="Convenios entre Empresas"
      heading="Convenios entre Empresas"
      description="Defina qué módulos de esta empresa puede usar cada empresa del convenio (salidas de almacén, compras, minutas, SMS…). Es en un solo sentido: habilitar a una empresa no le da acceso a la suya. En los convenios recibidos, elija qué personas y departamentos suyos usan cada alcance."
      search={{
        value: search,
        onChange: setSearch,
        placeholder: "Buscar empresa...",
      }}
      filters={
        <div className="relative">
          <SlidersHorizontal className="pointer-events-none absolute left-2.5 top-1/2 z-10 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Select
            value={direction}
            onValueChange={(value) => setDirection(value as DirectionFilter)}
          >
            <SelectTrigger className="h-8 w-64 border-slate-200/60 bg-white/80 pl-8 text-left text-xs transition-colors focus:ring-1 focus:ring-primary/40 dark:border-slate-700/60 dark:bg-slate-900/60">
              <SelectValue placeholder="Sentido" />
            </SelectTrigger>
            <SelectContent className="border-slate-200/60 dark:border-slate-700/60">
              <SelectItem value="ALL">Todos los convenios</SelectItem>
              {Object.entries(DIRECTION_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      }
      count={{
        value: data ? filtered.length : undefined,
        singular: "convenio",
        plural: "convenios",
      }}
    >
      <SettingsDataTable
        columns={columns}
        data={filtered}
        loading={isPending}
        error={isError}
        errorMessage="No se pudieron cargar los convenios"
        onRetry={() => refetch()}
        filtered={!!deferredSearch.trim() || direction !== "ALL"}
        emptyMessage="No hay convenios con otras empresas."
        actions={<CreateCompanyLoanDialog />}
      />
    </SettingsListPage>
  );
};

export default CompanyLoansPage;
