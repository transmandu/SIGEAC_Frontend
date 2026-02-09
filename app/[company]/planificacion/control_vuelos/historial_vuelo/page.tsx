"use client";

import { useState, useMemo } from "react";
import { Loader2, Plane, X, History, Calendar } from "lucide-react";

import { ContentLayout } from "@/components/layout/ContentLayout";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

import { useCompanyStore } from "@/stores/CompanyStore";
import { useGetAircraftAcronyms } from "@/hooks/aerolinea/aeronaves/useGetAircraftAcronyms";
import { useGetFlightsByDateRange } from "@/hooks/aerolinea/vuelos/useGetFlightsByDateRange";

import { DataTable } from "./data-table";
import { columns } from "./columns";
import { FlightControl } from "@/types";

/* ======================================================
   TYPES
====================================================== */
type PeriodType = "current_month" | "month" | "year" | "custom";

/* ======================================================
   COMPONENT
====================================================== */
const HistorialVueloPage = () => {
  const { selectedCompany } = useCompanyStore();

  const [selectedAcronym, setSelectedAcronym] = useState<string>("");
  const [periodType, setPeriodType] = useState<PeriodType>("current_month");

  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7), // yyyy-MM
  );
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString(),
  );
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  /* ======================================================
     DATA
  ====================================================== */
  const { data: aircrafts, isLoading: loadingAircrafts } =
    useGetAircraftAcronyms(selectedCompany?.slug);

  /* ======================================================
     DATE RANGE CALCULATION
  ====================================================== */
  const dateRange = useMemo(() => {
    const now = new Date();

    switch (periodType) {
      case "current_month": {
        const first = new Date(now.getFullYear(), now.getMonth(), 1);
        const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return {
          first_date: first.toISOString().slice(0, 10),
          second_date: last.toISOString().slice(0, 10),
        };
      }

      case "month": {
        const [year, month] = selectedMonth.split("-");
        const first = new Date(Number(year), Number(month) - 1, 1);
        const last = new Date(Number(year), Number(month), 0);
        return {
          first_date: first.toISOString().slice(0, 10),
          second_date: last.toISOString().slice(0, 10),
        };
      }

      case "year": {
        const first = new Date(Number(selectedYear), 0, 1);
        const last = new Date(Number(selectedYear), 11, 31);
        return {
          first_date: first.toISOString().slice(0, 10),
          second_date: last.toISOString().slice(0, 10),
        };
      }

      case "custom": {
        if (!customFrom || !customTo) return undefined;
        return {
          first_date: customFrom,
          second_date: customTo,
        };
      }

      default:
        return undefined;
    }
  }, [periodType, selectedMonth, selectedYear, customFrom, customTo]);

  /* ======================================================
     FLIGHTS QUERY (✔ CORRECTO)
  ====================================================== */
  const { data: flights = [], isLoading } = useGetFlightsByDateRange(
    selectedCompany?.slug,
    selectedAcronym || undefined,
    dateRange ?? null,
  );

  /* ======================================================
     RENDER
  ====================================================== */
  return (
    <ContentLayout title="Historial de Vuelo">
      <div className="flex flex-col gap-6 w-full max-w-[calc(100vw-280px)]">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href={`/${selectedCompany?.slug}/dashboard`}>
                Inicio
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Historial de Vuelo</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <History className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Historial de Vuelo</h1>
            <p className="text-sm text-muted-foreground">
              Registro de vuelos por aeronave y período
            </p>
          </div>
        </div>

        {/* Aeronave */}
        <Card>
          <CardHeader>
            <CardTitle>Filtrar por Aeronave</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 items-end">
              <Select
                value={selectedAcronym}
                onValueChange={setSelectedAcronym}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Selecciona una aeronave..." />
                </SelectTrigger>
                <SelectContent>
                  {loadingAircrafts ? (
                    <SelectItem value="loading" disabled>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Cargando...
                    </SelectItem>
                  ) : (
                    aircrafts?.map((a) => (
                      <SelectItem key={a.id} value={a.acronym}>
                        <Plane className="h-4 w-4 mr-2 inline" />
                        {a.acronym}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>

              {selectedAcronym && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedAcronym("")}
                >
                  <X className="h-4 w-4 mr-1" />
                  Limpiar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Filtro de período */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Filtro por Período
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
              value={periodType}
              onValueChange={(v) => setPeriodType(v as PeriodType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current_month">Mes actual</SelectItem>
                <SelectItem value="month">Mes específico</SelectItem>
                <SelectItem value="year">Año completo</SelectItem>
                <SelectItem value="custom">Rango personalizado</SelectItem>
              </SelectContent>
            </Select>

            {periodType === "month" && (
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="h-10 w-full rounded-md border px-3"
              />
            )}

            {periodType === "year" && (
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }).map((_, i) => {
                    const year = new Date().getFullYear() - i;
                    return (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            )}

            {periodType === "custom" && (
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="h-10 rounded-md border px-3"
                />
                <input
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="h-10 rounded-md border px-3"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabla */}
        <Card>
          <CardHeader>
            <CardTitle>Registros de Vuelo</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              </div>
            ) : flights.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                No hay vuelos para el período seleccionado
              </div>
            ) : (
              <DataTable<FlightControl, []>
                columns={columns}
                data={flights}
                totalRecords={flights.length}
                currentPage={1}
                onPageChange={() => {}}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </ContentLayout>
  );
};

export default HistorialVueloPage;