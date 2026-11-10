"use client";

import { useState, useMemo } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { DayMonthYearPicker } from "@/components/selects/DayMonthYearPicker";
import { DataTable } from "@/app/[company]/operaciones/cargo/data-table";
import { getCounterColumns } from "./columns";
import { usePaxFlights } from "@/actions/counter/actions";
import { useAuth } from "@/contexts/AuthContext";
import { useGetAircrafts } from "@/hooks/aerolinea/aeronaves/useGetAircrafts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { Loader2, Plus, Plane, Users, MessageSquare } from "lucide-react";
import WhatsAppImportModal from "@/components/forms/operaciones/counter/WhatsAppImportModal";

const CounterPage = () => {
  const params = useParams();
  const company = params.company as string;
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [filterDate, setFilterDate] = useState<Date>(() => {
    const m = Number(searchParams.get("month")) || new Date().getMonth() + 1;
    const y = Number(searchParams.get("year")) || new Date().getFullYear();
    return new Date(y, m - 1, 1);
  });
  const [filterAircraftId, setFilterAircraftId] = useState<number | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [importModalOpen, setImportModalOpen] = useState<boolean>(false);

  const month = filterDate.getMonth() + 1;
  const year = filterDate.getFullYear();

  const { data: aircrafts } = useGetAircrafts(company);
  const internalAircrafts = useMemo(() => aircrafts ?? [], [aircrafts]);

  const {
    data: flights,
    isLoading,
    isError,
  } = usePaxFlights(
    company,
    month,
    year,
    filterAircraftId,
    filterType === "all" ? null : filterType,
  );

  const userRoles = user?.roles?.map((r) => r.name) || [];
  const canWrite = userRoles.some((r) =>
    ["OPERADOR_COUNTER", "OPERADOR_CARGA", "SUPERUSER"].includes(r),
  );

  const columns = useMemo(
    () => getCounterColumns(company, canWrite),
    [company, canWrite],
  );

  return (
    <ContentLayout title="Counter — Manifiestos de Pasajeros">
      <div className="flex flex-col gap-4">
        <PageHeader className="mb-2" />

        <div className="flex flex-col gap-2 text-center">
          <div className="flex justify-center items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Counter y Despacho</h1>
          </div>
          <p className="text-sm text-muted-foreground italic">
            Gestión y emisión de manifiestos diarios de pasajeros y vuelos de
            carga.
          </p>
        </div>

        {/* Filtros superiores */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 sm:gap-4 bg-muted/30 p-3 sm:p-4 rounded-lg border mt-2 sm:mt-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full xl:w-auto">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-xs sm:text-sm font-medium text-muted-foreground whitespace-nowrap">
                Periodo:
              </span>
              <DayMonthYearPicker
                date={filterDate}
                onDateChange={setFilterDate}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full xl:w-auto">
            {/* Filtro por Aeronave */}
            <div className="w-full sm:w-52">
              <Select
                value={filterAircraftId ? String(filterAircraftId) : "all"}
                onValueChange={(val) =>
                  setFilterAircraftId(val === "all" ? null : Number(val))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Todas las aeronaves" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las aeronaves</SelectItem>
                  {internalAircrafts.length > 0 && (
                    <SelectGroup>
                      <SelectLabel>Flota Propia</SelectLabel>
                      {internalAircrafts.map((a: any) => (
                        <SelectItem key={a.id} value={String(a.id)}>
                          {a.acronym} {a.model ? `- ${a.model}` : ""}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro por Modalidad */}
            <div className="w-full sm:w-48">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las modalidades</SelectItem>
                  <SelectItem value="PAX">Solo Pasajeros</SelectItem>
                  <SelectItem value="CARGO_ONLY">Solo Carga</SelectItem>
                  <SelectItem value="HYBRID">Híbridos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {canWrite && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full xl:w-auto pt-1 xl:pt-0 border-t xl:border-t-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setImportModalOpen(true)}
                className="gap-2 border-green-600/30 text-green-700 hover:bg-green-50 hover:text-green-800 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-950/40 w-full sm:w-auto"
              >
                <MessageSquare className="size-4 text-green-600" />
                Importar WhatsApp
              </Button>
              <Button asChild className="w-full sm:w-auto">
                <Link href={`/${company}/operaciones/counter/nuevo`}>
                  <Plus className="size-4 mr-2" /> Emitir Manifiesto
                </Link>
              </Button>
            </div>
          )}
        </div>

        {/* Tabla */}
        {isLoading ? (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="animate-spin h-8 w-8 text-primary" />
          </div>
        ) : isError ? (
          <p className="text-muted-foreground text-sm italic text-center py-10">
            Error al consultar los manifiestos de vuelo.
          </p>
        ) : (
          <DataTable columns={columns} data={flights || []} />
        )}

        <WhatsAppImportModal
          open={importModalOpen}
          onClose={() => setImportModalOpen(false)}
          company={company}
        />
      </div>
    </ContentLayout>
  );
};

export default CounterPage;
