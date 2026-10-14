"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { SettingsListPage } from "@/components/layout/SettingsListPage";
import { SettingsDataTable } from "@/components/tables/SettingsDataTable";
import CreateInformationSourceDialog from "@/components/dialogs/ajustes/CreateInformationSourceDialog";
import { useGetInformationSources } from "@/hooks/sms/useGetInformationSource";
import { SlidersHorizontal } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { columns } from "./columns";

const SOURCE_TYPES = ["PROACTIVO", "REACTIVO", "PREDICTIVO"] as const;

const InformationSourcePage = () => {
  const { data, isPending, isError, refetch } = useGetInformationSources();
  const [search, setSearch] = useState("");
  const [type, setType] = useState("ALL");
  const deferredSearch = useDeferredValue(search);

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = deferredSearch.trim().toLowerCase();

    return data.filter((source) => {
      if (type !== "ALL" && source.type !== type) return false;
      if (!q) return true;

      return (
        source.name?.toLowerCase().includes(q) ||
        source.type?.toLowerCase().includes(q)
      );
    });
  }, [data, deferredSearch, type]);

  return (
    <SettingsListPage
      title="Fuentes de Información"
      heading="Fuentes de Información"
      description="Administra las fuentes desde las que se identifican los peligros del SMS."
      search={{
        value: search,
        onChange: setSearch,
        placeholder: "Buscar fuentes...",
      }}
      filters={
        <div className="relative">
          <SlidersHorizontal className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 z-10 size-3.5 text-muted-foreground" />
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="h-8 w-50 pl-8 text-xs bg-white/80 dark:bg-slate-900/60 border-slate-200/60 dark:border-slate-700/60 transition-colors focus:ring-1 focus:ring-primary/40">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent className="border-slate-200/60 dark:border-slate-700/60">
              <SelectItem value="ALL">Todos los tipos</SelectItem>
              {SOURCE_TYPES.map((value) => (
                <SelectItem key={value} value={value}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      }
      count={{
        value: data ? filtered.length : undefined,
        singular: "fuente",
        plural: "fuentes",
      }}
    >
      <SettingsDataTable
        columns={columns}
        data={filtered}
        error={isError}
        errorMessage="No se pudieron cargar las fuentes"
        onRetry={() => refetch()}
        filtered={!!deferredSearch.trim() || type !== "ALL"}
        loading={isPending}
        emptyMessage="No se han encontrado fuentes de información."
        actions={<CreateInformationSourceDialog />}
      />
    </SettingsListPage>
  );
};

export default InformationSourcePage;
