"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { NotepadText, Plane, Calendar as CalendarIcon } from "lucide-react";
import { BlobProvider } from "@react-pdf/renderer";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import { useCompanyStore } from "@/stores/CompanyStore";
import { useGetAircrafts } from "@/hooks/aerolinea/aeronaves/useGetAircrafts";
import {
  useGetDispatchReport,
  DispatchReport,
} from "@/hooks/mantenimiento/almacen/reportes/useGetDispatchReport";
import DispatchReportPdf from "@/components/pdf/almacen/DispatchReport";

export function DispatchReportDialog() {
  const { selectedStation, selectedCompany } = useCompanyStore();
  const [open, setOpen] = useState(false);

  const [dispatchData, setDispatchData] = useState<DispatchReport[]>([]);
  const [loadingDownload, setLoadingDownload] = useState(false);

  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [aircraft, setAircraft] = useState<string | null>(null);

  const { mutateAsync } = useGetDispatchReport();
  const { data: aircrafts, isLoading: isLoadingAircrafts } = useGetAircrafts(
    selectedCompany?.slug,
  );

  // --- LÓGICA DE VALIDACIÓN ---
  const isDateRangeInvalid = startDate && endDate && endDate < startDate;
  // Nueva constante para verificar si faltan las fechas
  const areDatesMissing = !startDate || !endDate;

  useEffect(() => {
    if (!open) {
      setStartDate(undefined);
      setEndDate(undefined);
      setAircraft(null);
      setDispatchData([]);
    }
  }, [open]);

  const handleDownload = async (type: "general" | "aircraft") => {
    if (!selectedStation || !selectedCompany?.slug || areDatesMissing) return;

    try {
      setLoadingDownload(true);
      const currentAircraftId = type === "aircraft" ? aircraft : undefined;

      const data = await mutateAsync({
        location_id: selectedStation,
        company: selectedCompany.slug,
        aircraft_id: currentAircraftId,
        from: format(startDate, "yyyy-MM-dd"), // Ya sabemos que existen por areDatesMissing
        to: format(endDate, "yyyy-MM-dd"),
      });

      if (data) {
        setDispatchData(data);
      }
    } catch (error) {
      console.error("Error al obtener el reporte:", error);
    } finally {
      setLoadingDownload(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-dashed h-8">
          Generar Reporte
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Generar Reporte de Almacén</DialogTitle>
          <DialogDescription>
            Selecciona un rango de fechas de forma obligatoria para continuar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 flex flex-col items-center py-4">
          <div className="w-full space-y-2">
            <label className="text-sm font-medium flex items-center gap-2 justify-center">
              <CalendarIcon className="w-4 h-4" /> Rango de Fechas{" "}
              <span className="text-destructive">*</span>
            </label>
            <div className="flex gap-2 justify-center">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[180px] text-xs",
                      !startDate &&
                        "text-muted-foreground border-destructive/50",
                    )}
                  >
                    {startDate
                      ? format(startDate, "dd/MM/yyyy", { locale: es })
                      : "Desde"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[180px] text-xs",
                      !endDate && "text-muted-foreground border-destructive/50",
                    )}
                  >
                    {endDate
                      ? format(endDate, "dd/MM/yyyy", { locale: es })
                      : "Hasta"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                  />
                </PopoverContent>
              </Popover>
            </div>
            {isDateRangeInvalid && (
              <p className="text-[10px] text-destructive text-center">
                La fecha final debe ser posterior a la inicial.
              </p>
            )}
          </div>

          <hr className="w-full border-muted" />

          {/* OPCIÓN 1: GENERAL */}
          <div className="w-full space-y-4 text-center">
            <h3 className="text-sm font-bold flex gap-2 items-center justify-center">
              Reporte General <NotepadText className="w-4 h-4" />
            </h3>
            <Button
              className="w-full"
              onClick={() => handleDownload("general")}
              // DESHABILITADO SI FALTAN FECHAS O SON INVÁLIDAS
              disabled={
                loadingDownload || areDatesMissing || isDateRangeInvalid
              }
            >
              Descargar
            </Button>
          </div>

          {/* OPCIÓN 2: POR AERONAVE */}
          <div className="w-full space-y-4 text-center">
            <h3 className="text-sm font-bold flex gap-2 items-center justify-center">
              Filtrar por Aeronave <Plane className="w-4 h-4" />
            </h3>
            <div className="flex flex-col gap-3 items-center">
              <Select
                onValueChange={(value) =>
                  setAircraft(value === "all" ? null : value)
                }
                value={aircraft || "all"}
              >
                <SelectTrigger disabled={isLoadingAircrafts} className="w-full">
                  <SelectValue placeholder="Seleccione una aeronave" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las aeronaves</SelectItem>
                  {aircrafts?.map((item) => (
                    <SelectItem key={item.id} value={item.id.toString()}>
                      {item.acronym ?? `Aeronave #${item.id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="secondary"
                className="w-full"
                onClick={() => handleDownload("aircraft")}
                // DESHABILITADO SI FALTAN FECHAS, SON INVÁLIDAS O NO HAY AERONAVE
                disabled={
                  loadingDownload ||
                  areDatesMissing ||
                  isDateRangeInvalid ||
                  !aircraft
                }
              >
                Generar por Aeronave Seleccionada
              </Button>
            </div>
          </div>

          {/* GENERADOR PDF */}
          {dispatchData.length > 0 && (
            <BlobProvider
              document={
                <DispatchReportPdf
                  reports={dispatchData}
                  aircraftFilter={aircraft ? parseInt(aircraft) : null}
                  startDate={startDate!}
                  endDate={endDate!}
                />
              }
            >
              {({ blob, loading }) => {
                if (!loading && blob) {
                  const url = URL.createObjectURL(blob);
                  window.open(url, "_blank");
                  setTimeout(() => setDispatchData([]), 100);
                }
                return null;
              }}
            </BlobProvider>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
