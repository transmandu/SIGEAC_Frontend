"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DayMonthYearPicker } from "@/components/selects/DayMonthYearPicker";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ArrowLeft } from "lucide-react";
import CreateCargoManifestForm from "@/components/forms/operaciones/cargo/CreateCargoManifestForm";
import { useGetAircrafts } from "@/hooks/aerolinea/aeronaves/useGetAircrafts";
import { useGetExternalAircraftSuggestions } from "@/hooks/operaciones/cargo/useGetExternalAircraftSuggestions";
import { useGetNextManifestNumber } from "@/hooks/operaciones/cargo/useGetNextManifestNumber";

const NuevoManifiestoPage = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const company = params.company as string;

  // ── Fecha ──────────────────────────────────────────────────────────────────
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const m = Number(searchParams.get("month")) || new Date().getMonth() + 1;
    const y = Number(searchParams.get("year")) || new Date().getFullYear();
    return new Date(y, m - 1, 1);
  });

  const month = selectedDate.getMonth() + 1;
  const year = selectedDate.getFullYear();
  const day = selectedDate.getDate();

  // ── Aeronave ───────────────────────────────────────────────────────────────
  const [selectedAircraftId, setSelectedAircraftId] = useState<number | null>(
    () => {
      const id = Number(searchParams.get("aircraft_id"));
      return id > 0 ? id : null;
    },
  );

  const { data: aircrafts } = useGetAircrafts(company);
  const { data: externalSuggestions } = useGetExternalAircraftSuggestions(company);

  const internalAircraft = useMemo(
    () => aircrafts ?? [],
    [aircrafts],
  );

  const externalAircraft = useMemo(
    () => externalSuggestions ?? [],
    [externalSuggestions],
  );

  const { data: nextManifestNumber } = useGetNextManifestNumber(
    company,
    month,
    year,
    selectedAircraftId,
  );

  // ── Éxito ──────────────────────────────────────────────────────────────────
  const handleSuccess = () => {
    router.push(
      `/${company}/operaciones/cargo/manifiestos?month=${month}&year=${year}`,
    );
  };

  return (
    <ContentLayout title="Nuevo Manifiesto de Carga">
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
              <BreadcrumbLink
                href={`/${company}/operaciones/cargo/manifiestos?month=${month}&year=${year}`}
              >
                Manifiestos
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Nuevo Manifiesto</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="icon" className="h-9 w-9">
            <Link
              href={`/${company}/operaciones/cargo/manifiestos?month=${month}&year=${year}`}
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>

          <div className="">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              Nuevo Manifiesto de Carga
            </h1>
            <p className="text-muted-foreground mt-1">
              Selecciona las guías disponibles e ingresa el peso y unidades a
              despachar.
            </p>
          </div>
        </div>

        {/* ─── Barra unificada: Fecha | Aeronave | Nº Manifiesto ────────── */}
        <div className="flex justify-between flex-wrap items-end gap-4 bg-muted/30 p-3 rounded-lg border mt-4">
          {/* Fecha */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
              Fecha
            </span>
            <DayMonthYearPicker
              date={selectedDate}
              onDateChange={setSelectedDate}
            />
          </div>

          {/* Aeronave */}
          <div className="flex flex-col items-center min-w-[300px]">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5 block">
              Aeronave
            </label>
            <Select
              value={selectedAircraftId ? `reg:${selectedAircraftId}` : "none"}
              onValueChange={(val) => {
                if (val === "none") {
                  setSelectedAircraftId(null);
                } else if (val.startsWith("reg:")) {
                  setSelectedAircraftId(Number(val.slice(4)));
                }
              }}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Seleccionar aeronave..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Seleccionar aeronave...</SelectItem>

                {internalAircraft.length > 0 && (
                  <SelectGroup>
                    <SelectSeparator />
                    <SelectLabel>Registradas</SelectLabel>
                    {internalAircraft.map((a: any) => (
                      <SelectItem key={`reg:${a.id}`} value={`reg:${a.id}`}>
                        {a.acronym} {a.model ? `- ${a.model}` : ""}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                )}

                {externalAircraft.length > 0 && (
                  <SelectGroup>
                    <SelectSeparator />
                    <SelectLabel>Externas</SelectLabel>
                    {externalAircraft.map((a: any) => (
                      <SelectItem key={`reg:${a.id}`} value={`reg:${a.id}`}>
                        {a.acronym} {a.model ? `- ${a.model}` : ""} (Externa)
                      </SelectItem>
                    ))}
                  </SelectGroup>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Nº Manifiesto */}
          <div className="text-center shrink-0">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1 block">
              Nº Manifiesto
            </label>
            <span className="text-lg font-bold tracking-widest text-primary">
              {nextManifestNumber || "—"}
            </span>
          </div>
        </div>

        <CreateCargoManifestForm
          company={company}
          month={month}
          year={year}
          day={day}
          selectedAircraftId={selectedAircraftId}
          onSuccess={handleSuccess}
        />
      </div>
    </ContentLayout>
  );
};

export default NuevoManifiestoPage;
