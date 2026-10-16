"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { FilterX, SlidersHorizontal } from "lucide-react";
import { CreateAircraftDialog } from "@/components/dialogs/aerolinea/aeronaves/CreateAircraftDialog";
import { SettingsListPage } from "@/components/layout/SettingsListPage";
import { SettingsDataTable } from "@/components/tables/SettingsDataTable";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetAircrafts } from "@/hooks/aerolinea/aeronaves/useGetAircrafts";
import { AIRCRAFT_STATUS_LABELS } from "@/lib/airline-aircraft";
import { useCompanyStore } from "@/stores/CompanyStore";
import { columns } from "./columns";

const ALL = "ALL";

interface FilterSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  allLabel: string;
  options: { value: string; label: string }[];
  /** Ancho suficiente para la etiqueta más larga: si no cabe, el trigger la trunca. */
  className: string;
}

function FilterSelect({
  value,
  onChange,
  placeholder,
  allLabel,
  options,
  className,
}: FilterSelectProps) {
  return (
    <div className="relative">
      <SlidersHorizontal className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 z-10 size-3.5 text-muted-foreground" />
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          className={`h-8 pl-8 text-left text-xs bg-white/80 dark:bg-slate-900/60 border-slate-200/60 dark:border-slate-700/60 transition-colors focus:ring-1 focus:ring-primary/40 [&>span]:text-left ${className}`}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="border-slate-200/60 dark:border-slate-700/60">
          <SelectItem value={ALL}>{allLabel}</SelectItem>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

const AircraftsPage = () => {
  const { selectedCompany } = useCompanyStore();
  const {
    data: aircrafts,
    isPending,
    isError,
    refetch,
  } = useGetAircrafts(selectedCompany?.slug, { includeExternal: true });

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(ALL);
  const [kind, setKind] = useState(ALL);
  const [manufacturer, setManufacturer] = useState(ALL);
  const deferredSearch = useDeferredValue(search);

  // Las opciones salen de lo que hay en la flota: no se ofrece un filtro vacío.
  const manufacturerOptions = useMemo(() => {
    const byId = new Map<string, string>();
    for (const aircraft of aircrafts ?? []) {
      if (aircraft.manufacturer) {
        byId.set(String(aircraft.manufacturer_id), aircraft.manufacturer.name);
      }
    }
    return [...byId].map(([value, label]) => ({ value, label }));
  }, [aircrafts]);

  const hasActiveFilters =
    status !== ALL || kind !== ALL || manufacturer !== ALL;

  const clearFilters = () => {
    setStatus(ALL);
    setKind(ALL);
    setManufacturer(ALL);
  };

  const filtered = useMemo(() => {
    if (!aircrafts) return [];
    const q = deferredSearch.trim().toLowerCase();

    return aircrafts.filter((aircraft) => {
      if (status !== ALL && aircraft.status !== status) return false;
      if (kind === "OWN" && aircraft.is_external) return false;
      if (kind === "EXTERNAL" && !aircraft.is_external) return false;
      if (
        manufacturer !== ALL &&
        String(aircraft.manufacturer_id) !== manufacturer
      )
        return false;
      if (!q) return true;

      return [
        aircraft.acronym,
        aircraft.serial,
        aircraft.brand,
        aircraft.model,
        aircraft.owner,
        aircraft.manufacturer?.name,
        aircraft.manufacturer?.description,
      ].some((field) => field?.toLowerCase().includes(q));
    });
  }, [aircrafts, deferredSearch, status, kind, manufacturer]);

  return (
    <SettingsListPage
      title="Aeronaves"
      heading="Control de Aeronaves"
      description="Administra la flota de la empresa y las aeronaves externas usadas para registrar carga."
      tourPrefix="aeronaves"
      search={{
        value: search,
        onChange: setSearch,
        placeholder: "Buscar por matrícula, serial, modelo...",
      }}
      filters={
        <>
          <FilterSelect
            value={status}
            onChange={setStatus}
            placeholder="Estado"
            allLabel="Todos los estados"
            className="w-48"
            options={Object.entries(AIRCRAFT_STATUS_LABELS).map(
              ([value, label]) => ({ value, label }),
            )}
          />
          <FilterSelect
            value={kind}
            onChange={setKind}
            placeholder="Tipo"
            allLabel="Propias y externas"
            className="w-52"
            options={[
              { value: "OWN", label: "Flota propia" },
              { value: "EXTERNAL", label: "Externas" },
            ]}
          />
          <FilterSelect
            value={manufacturer}
            onChange={setManufacturer}
            placeholder="Fabricante"
            allLabel="Todos los fabricantes"
            className="w-56"
            options={manufacturerOptions}
          />
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-xs text-muted-foreground"
              onClick={clearFilters}
            >
              <FilterX className="size-3.5" />
              Limpiar
            </Button>
          )}
        </>
      }
      count={{
        value: aircrafts ? filtered.length : undefined,
        singular: "aeronave",
        plural: "aeronaves",
      }}
    >
      <SettingsDataTable
        columns={columns}
        data={filtered}
        error={isError}
        errorMessage="No se pudieron cargar las aeronaves"
        onRetry={() => refetch()}
        filtered={!!deferredSearch.trim() || hasActiveFilters}
        loading={isPending}
        emptyMessage="No se han registrado aeronaves."
        actions={<CreateAircraftDialog />}
        tourPrefix="aeronaves"
      />
    </SettingsListPage>
  );
};

export default AircraftsPage;
