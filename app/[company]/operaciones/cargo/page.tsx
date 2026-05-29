"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useGetCargoStatsByAircraft } from "@/hooks/operaciones/cargo/useGetCargoStatsByAircraft";
import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { MonthYearPicker } from "@/components/selects/MonthYearPicker";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Loader2,
  Plane,
  Package,
  ChevronRight,
  Plus,
  Download,
} from "lucide-react";
import { AircraftCargoStats } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useExportCargoByAircraft } from "@/hooks/operaciones/cargo/useExportCargoByAircraft";

const AircraftCard = ({
  aircraft,
  company,
  month,
  year,
}: {
  aircraft: AircraftCargoStats;
  company: string;
  month: number;
  year: number;
}) => {
  return (
    <Card className="flex flex-col justify-between hover:shadow-lg hover:border-primary/50 transition-all duration-200 group relative overflow-visible">
      <CardContent className="pt-6 pb-2 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <Plane className="h-5 w-5" />
            </div>
            <div className="pr-4">
              <p className="text-xl font-bold tracking-tight break-all">
                {aircraft.acronym}
              </p>
              <p className="text-sm text-muted-foreground">{aircraft.model}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 border rounded-lg p-3 bg-muted/30">
          <Package className="h-5 w-5 text-muted-foreground shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
              Guías registradas
            </p>
            <p className="text-xl font-bold text-primary">
              {aircraft.cargo_count}
              <span className="text-sm font-normal text-muted-foreground ml-1">
                este mes
              </span>
            </p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-2 pb-5">
        <Button asChild className="w-full gap-2" variant="outline">
          <Link
            href={
              aircraft.id
                ? `/${company}/operaciones/cargo/${aircraft.id}?month=${month}&year=${year}`
                : `/${company}/operaciones/cargo/externa/${encodeURIComponent(aircraft.acronym)}?month=${month}&year=${year}`
            }
          >
            Ver Registros de Carga
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

const CargoPage = () => {
  const { selectedCompany } = useCompanyStore();
  const searchParams = useSearchParams();

  // Leer mes/año desde la URL si existen, si no, usar el mes actual
  const [month, setMonth] = useState(
    Number(searchParams.get("month")) || new Date().getMonth() + 1,
  );
  const [year, setYear] = useState(
    Number(searchParams.get("year")) || new Date().getFullYear(),
  );
  const [activeTab, setActiveTab] = useState("registered");

  const {
    data: statsData,
    isLoading,
    isError,
  } = useGetCargoStatsByAircraft(selectedCompany?.slug, month, year);

  const registeredAircrafts = statsData?.registered || [];
  const externalAircrafts = statsData?.external || [];

  const { user } = useAuth();
  const userRoles = user?.roles?.map((r) => r.name) || [];
  const canWrite = userRoles.some((r) =>
    ["OPERADOR_CARGA", "SUPERUSER"].includes(r),
  );
  const { exportAll, isExporting } = useExportCargoByAircraft(
    selectedCompany?.slug,
  );
  return (
    <ContentLayout title="Carga">
      <div className="flex flex-col gap-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href={`/${selectedCompany?.slug}/dashboard`}>
                Inicio
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>Operaciones</BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Carga</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col gap-2 text-center md:text-left">
          <h1 className="text-4xl font-bold text-center">Módulo de Carga</h1>
          <p className="text-sm text-muted-foreground text-center italic">
            Selecciona una aeronave para ver o registrar sus guías de carga.
          </p>
        </div>

        {/* Filtro de Mes y Año */}
        <div className="flex justify-between bg-muted/30 p-3 rounded-lg border mt-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground">
              Período:
            </span>
            <MonthYearPicker
              month={month}
              year={year}
              onMonthChange={setMonth}
              onYearChange={setYear}
            />
          </div>

          <div className="flex justify-end gap-2">
            {canWrite && (
              <Button asChild>
                <Link
                  href={
                    activeTab === "registered"
                      ? `/${selectedCompany?.slug}/operaciones/cargo/nuevo`
                      : `/${selectedCompany?.slug}/operaciones/cargo/nuevo?external=true`
                  }
                >
                  <Plus className="size-4 mr-2" />
                  Nuevo Registro de Carga
                </Link>
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => exportAll(month, year)}
              disabled={isExporting || isLoading}
            >
              <Download className="size-4 mr-2" />
              {isExporting ? "Exportando..." : "Exportar Todo"}
            </Button>
          </div>
        </div>

        {/* Tabs de Aeronaves */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="registered">
              Aeronaves de la Empresa ({registeredAircrafts.length})
            </TabsTrigger>
            <TabsTrigger value="external">
              Aeronaves Externas ({externalAircrafts.length})
            </TabsTrigger>
          </TabsList>

          {isLoading ? (
            <div className="flex justify-center items-center py-24">
              <Loader2 className="animate-spin h-8 w-8 text-primary" />
            </div>
          ) : isError ? (
            <p className="text-muted-foreground text-sm italic text-center py-10">
              Ha ocurrida un error al cargar las eronaves...
            </p>
          ) : (
            <>
              <TabsContent value="registered">
                {registeredAircrafts.length === 0 ? (
                  <div className="text-center py-20 text-muted-foreground">
                    <Plane className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p className="font-medium">No hay aeronaves registradas.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {registeredAircrafts.map((aircraft) => (
                      <AircraftCard
                        key={`reg-${aircraft.id}`}
                        aircraft={aircraft}
                        company={selectedCompany?.slug || ""}
                        month={month}
                        year={year}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="external">
                {externalAircrafts.length === 0 ? (
                  <div className="text-center py-20 text-muted-foreground">
                    <Plane className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p className="font-medium">
                      No hay aeronaves externas registradas este mes.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {externalAircrafts.map((aircraft) => (
                      <AircraftCard
                        key={`ext-${aircraft.acronym}`}
                        aircraft={aircraft}
                        company={selectedCompany?.slug || ""}
                        month={month}
                        year={year}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </ContentLayout>
  );
};

export default CargoPage;
