"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useState, useRef, useMemo, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DayMonthYearPicker } from "@/components/selects/DayMonthYearPicker";
import {
  Select,
  SelectContent,
  SelectItem,
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
import { ArrowLeft, X } from "lucide-react";
import CreateCargoManifestForm from "@/components/forms/operaciones/cargo/CreateCargoManifestForm";
import { useGetAircrafts } from "@/hooks/aerolinea/aeronaves/useGetAircrafts";
import { useGetNextManifestNumber } from "@/hooks/operaciones/cargo/useGetNextManifestNumber";
import { useGetExternalAircraftSeggestion } from "@/hooks/operaciones/cargo/useGetExternalAircraftSuggestions";

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
    null,
  );
  const [externalAircraft, setExternalAircraft] = useState<string>("");
  const [showExternalInput, setShowExternalInput] = useState(false);
  const [appliedExternal, setAppliedExternal] = useState<string>("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown de sugerencias al hacer clic fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        suggestionRef.current &&
        !suggestionRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const { data: aircrafts } = useGetAircrafts(company);
  const { data: externalSuggestions } =
    useGetExternalAircraftSeggestion(company);
  const { data: nextManifestNumber } = useGetNextManifestNumber(
    company,
    month,
    year,
    selectedAircraftId,
    appliedExternal || null,
  );

  const aircraftSelectOptions = [
    { value: "none", label: "Seleccionar aeronave..." },
    ...(aircrafts ?? []).map((a: any) => ({
      value: String(a.id),
      label: `${a.acronym} - ${a.model ?? ""}`,
    })),
    { value: "__external__", label: "Aeronave externa..." },
  ];

  const filteredSuggestions = useMemo(() => {
    if (!externalSuggestions || !externalAircraft) return [];
    const search = externalAircraft.toLowerCase();
    return externalSuggestions.filter((s) => s.toLowerCase().includes(search));
  }, [externalSuggestions, externalAircraft]);

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
          <div className="flex flex-col items-start gap-1">
            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
              Fecha
            </span>
            <DayMonthYearPicker
              date={selectedDate}
              onDateChange={setSelectedDate}
            />
          </div>

          {/* Aeronave */}
          <div className="flex flex-col min-w-[300px]">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5 block">
              Aeronave
            </label>
            {!showExternalInput ? (
              <Select
                value={selectedAircraftId ? String(selectedAircraftId) : "none"}
                onValueChange={(val) => {
                  if (val === "__external__") {
                    setShowExternalInput(true);
                    setSelectedAircraftId(null);
                  } else if (val === "none") {
                    setSelectedAircraftId(null);
                    setShowExternalInput(false);
                  } else {
                    setSelectedAircraftId(val ? Number(val) : null);
                    setShowExternalInput(false);
                  }
                }}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Seleccionar aeronave..." />
                </SelectTrigger>
                <SelectContent>
                  {aircraftSelectOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="relative flex gap-2">
                <Input
                  className="h-9 uppercase flex-1"
                  placeholder="Ej: YV-206 (Helicóptero)"
                  value={externalAircraft}
                  onChange={(e) => {
                    setExternalAircraft(e.target.value.toUpperCase());
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => {
                    setAppliedExternal(externalAircraft);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      setAppliedExternal(externalAircraft);
                      setShowSuggestions(false);
                    }
                  }}
                />
                {showSuggestions && filteredSuggestions.length > 0 && (
                  <div
                    ref={suggestionRef}
                    className="absolute top-full left-0 right-12 z-50 mt-1 max-h-48 overflow-y-auto rounded-md border bg-background shadow-lg"
                  >
                    {filteredSuggestions.map((s) => (
                      <div
                        key={s}
                        className="cursor-pointer px-3 py-2 text-sm hover:bg-accent uppercase"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setExternalAircraft(s);
                          setAppliedExternal(s);
                          setShowSuggestions(false);
                        }}
                      >
                        {s}
                      </div>
                    ))}
                  </div>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 shrink-0"
                  onClick={() => {
                    setShowExternalInput(false);
                    setExternalAircraft("");
                    setAppliedExternal("");
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
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
          externalAircraft={appliedExternal || null}
          onSuccess={handleSuccess}
        />
      </div>
    </ContentLayout>
  );
};

export default NuevoManifiestoPage;
