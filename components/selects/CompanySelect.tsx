"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useAuth } from "@/contexts/AuthContext";
import { useGetUserLocations } from "@/hooks/sistema/usuario/useGetUserLocations";
import { useStoreHydrated } from "@/hooks/helpers/use-store";
import { Skeleton } from "@/components/ui/skeleton";
import { useCompanyStore } from "@/stores/CompanyStore";
import { Company } from "@/types";

import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

const BASE_TRIGGER =
  "h-9 w-[180px] rounded-lg border border-border/85 text-sm text-foreground/90 transition-colors duration-200";

const LoadingValue = () => (
  <div className="flex items-center gap-2">
    <Loader2 className="w-3.5 h-3.5 animate-spin" />
    <span className="text-xs text-muted-foreground">Cargando</span>
  </div>
);

// Antes de leer la selección guardada el valor no se conoce: el HTML del
// servidor y el primer render del cliente muestran esto, de modo que el
// selector está desde el primer pintado en vez de aparecer al hidratar.
const PendingValue = () => (
  <Skeleton className="h-3.5 w-24 motion-reduce:animate-none" />
);

const CompanySelect = () => {
  const hydrated = useStoreHydrated(useCompanyStore);
  const { user, loading: userLoading } = useAuth();

  const {
    selectedCompany,
    selectedStation,
    setSelectedCompany,
    setSelectedStation,
  } = useCompanyStore();

  const {
    data: locations,
    isLoading: locationsLoading,
    isError,
  } = useGetUserLocations(selectedCompany?.slug);

  // El valor se escribe aquí y no se deja a Radix: Radix lo toma de la opción
  // montada, que no existe hasta que llegan la sesión y las estaciones, y el
  // selector se vería vacío o en "Cargando" aunque la selección ya se conozca.
  const stationLabel = locations?.find(
    (location) => location.id.toString() === selectedStation,
  )?.cod_iata;

  const handleCompanySelect = (companyId: string) => {
    const company = user?.companies?.find((c) => c.id.toString() === companyId);

    if (!company) return;

    setSelectedCompany(company);
    setSelectedStation("");
  };

  const handleStationSelect = (stationId: string) => {
    setSelectedStation(stationId);
  };

  return (
    <div className="flex items-center justify-center gap-2 w-full">
      {/* COMPANY */}
      <Select
        value={selectedCompany?.id.toString() || ""}
        onValueChange={handleCompanySelect}
      >
        <SelectTrigger
          className={cn(
            BASE_TRIGGER,
            "bg-linear-to-br from-background/70 to-background/40",
            "backdrop-blur-md",
            "border border-slate-400/60 dark:border-slate-600/60",
            "shadow-xs",
            "text-slate-700 dark:text-slate-200",
            "hover:border-blue-400/30",
            "hover:shadow-md hover:shadow-blue-500/10",
            "data-[state=open]:border-blue-400/40",
            "data-[state=open]:ring-2 data-[state=open]:ring-blue-500/15",
            "data-[state=open]:shadow-md data-[state=open]:shadow-blue-500/15",
            "transition-all duration-200",
            "active:scale-[0.99]",
          )}
        >
          {!hydrated ? (
            <PendingValue />
          ) : userLoading && !selectedCompany ? (
            <LoadingValue />
          ) : (
            <SelectValue placeholder="Empresa">
              {selectedCompany?.name}
            </SelectValue>
          )}
        </SelectTrigger>

        <SelectContent>
          {user?.companies?.map((company: Company) => (
            <SelectItem key={company.id} value={company.id.toString()}>
              {company.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* STATION */}
      <Select
        disabled={!selectedCompany}
        value={selectedStation || ""}
        onValueChange={handleStationSelect}
      >
        <SelectTrigger
          className={cn(
            BASE_TRIGGER,
            "bg-linear-to-br from-background/70 to-background/40",
            "backdrop-blur-md",
            "border border-slate-400/60 dark:border-slate-600/60",
            "shadow-xs",
            "text-slate-700 dark:text-slate-200",
            "hover:border-blue-400/30",
            "hover:shadow-md hover:shadow-blue-500/10",
            "data-[state=open]:border-blue-400/40",
            "data-[state=open]:ring-2 data-[state=open]:ring-blue-500/15",
            "data-[state=open]:shadow-md data-[state=open]:shadow-blue-500/15",
            "transition-all duration-200",
            "active:scale-[0.99]",
          )}
        >
          {!hydrated ? (
            <PendingValue />
          ) : locationsLoading ? (
            <LoadingValue />
          ) : (
            <SelectValue placeholder="Estación">{stationLabel}</SelectValue>
          )}
        </SelectTrigger>

        <SelectContent>
          {isError ? (
            <div className="p-2 text-xs text-muted-foreground">
              Error cargando estaciones
            </div>
          ) : (
            locations?.map((location) => (
              <SelectItem key={location.id} value={location.id.toString()}>
                {location.cod_iata}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CompanySelect;
