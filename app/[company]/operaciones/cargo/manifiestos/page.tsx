"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { useParams, useSearchParams } from "next/navigation";
import { useGetCargoManifests } from "@/hooks/operaciones/cargo/useGetCargoManifests";
import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DayMonthYearPicker } from "@/components/selects/DayMonthYearPicker";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Loader2, Plus } from "lucide-react";
import { DataTable } from "../data-table";
import { getManifestColumns } from "./columns";
import { useAuth } from "@/contexts/AuthContext";
import { useGetAircrafts } from "@/hooks/aerolinea/aeronaves/useGetAircrafts";
import { useGetExternalAircraftSuggestions } from "@/hooks/operaciones/cargo/useGetExternalAircraftSuggestions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
} from "@/components/ui/select";

const ManifestosPage = () => {
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

  const month = filterDate.getMonth() + 1;
  const year = filterDate.getFullYear();
  const day = filterDate.getDate();
  const { data: aircrafts } = useGetAircrafts(company);
  const { data: externalSuggestions } =
    useGetExternalAircraftSuggestions(company);

  const internalAircrafts = useMemo(() => aircrafts ?? [], [aircrafts]);

  const externalAircrafts = useMemo(
    () => externalSuggestions ?? [],
    [externalSuggestions],
  );

  const {
    data: manifests,
    isLoading,
    isError,
  } = useGetCargoManifests(company, month, year, filterAircraftId, day);

  const columns = getManifestColumns(company);

  const userRoles = user?.roles?.map((r) => r.name) || [];
  const canWrite = userRoles.some((r) =>
    ["OPERADOR_CARGA", "SUPERUSER"].includes(r),
  );

  return (
    <ContentLayout title="Manifiestos de Carga">
      <div className="flex flex-col gap-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href={`/${company}/dashboard`}>
                Inicio
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>Operaciones</BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/${company}/operaciones/cargo`}>
                Carga
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Manifiestos</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-4xl font-bold">Manifiestos de Carga</h1>
          <p className="text-sm text-muted-foreground italic">
            Gestiona los manifiestos de despacho de carga.
          </p>
        </div>

        <div className="flex justify-between bg-muted/30 p-3 rounded-lg border mt-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground">
              Fecha:
            </span>
            <DayMonthYearPicker
              date={filterDate}
              onDateChange={setFilterDate}
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="w-64">
              <Select
                value={filterAircraftId ? `reg:${filterAircraftId}` : "none"}
                onValueChange={(val) => {
                  if (val === "none") {
                    setFilterAircraftId(null);
                  } else if (val.startsWith("reg:")) {
                    setFilterAircraftId(Number(val.slice(4)));
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas las aeronaves" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Todas las aeronaves</SelectItem>
                  {internalAircrafts.length > 0 && (
                    <SelectGroup>
                      <SelectSeparator />
                      <SelectLabel>Registradas</SelectLabel>
                      {internalAircrafts.map((a: any) => (
                        <SelectItem key={`reg:${a.id}`} value={`reg:${a.id}`}>
                          {a.acronym} {a.model ? `- ${a.model}` : ""}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  )}
                  {externalAircrafts && externalAircrafts.length > 0 && (
                    <SelectGroup>
                      <SelectSeparator />
                      <SelectLabel>Externas</SelectLabel>
                      {externalAircrafts.map((a: any) => (
                        <SelectItem key={`reg:${a.id}`} value={`reg:${a.id}`}>
                          {a.acronym} {a.model ? `- ${a.model}` : ""} (Externa)
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {canWrite && (
            <Button asChild>
              <Link
                href={`/${company}/operaciones/cargo/manifiestos/nuevo?month=${month}&year=${year}&day=${day}${filterAircraftId ? `&aircraft_id=${filterAircraftId}` : ""}`}
              >
                <Plus className="size-4 mr-2" /> Nuevo Manifiesto
              </Link>
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="animate-spin h-8 w-8 text-primary" />
          </div>
        ) : isError ? (
          <p className="text-muted-foreground text-sm italic text-center py-10">
            Error al cargar los manifiestos.
          </p>
        ) : (
          <DataTable columns={columns} data={manifests || []} />
        )}
      </div>
    </ContentLayout>
  );
};

export default ManifestosPage;
