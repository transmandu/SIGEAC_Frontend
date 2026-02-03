"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarDays, NotepadText, Plane } from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer";

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
import { useGetDispatchReport } from "@/hooks/mantenimiento/almacen/reportes/useGetDispatchReport";
import DispatchReportPdf from "@/components/pdf/almacen/DispatchReport";

export function DispatchReportDialog() {
  const { selectedStation, selectedCompany } = useCompanyStore();
  const [open, setOpen] = useState(false);

  // Filtros para reporte general con rango de fechas opcional
  const [generalStartDate, setGeneralStartDate] = useState<Date | undefined>();
  const [generalEndDate, setGeneralEndDate] = useState<Date | undefined>();

  // Filtros para reporte por aeronave con rango de fechas opcional
  const [aircraft, setAircraft] = useState<string | null>(null);
  const [aircraftStartDate, setAircraftStartDate] = useState<Date | undefined>();
  const [aircraftEndDate, setAircraftEndDate] = useState<Date | undefined>();

  const { data: dispatchReport, isLoading: isLoadingDispatchReport } =
    useGetDispatchReport(selectedStation ?? null, selectedCompany?.slug);

  const { data: aircrafts, isLoading: isLoadingAircrafts } = useGetAircrafts(
    selectedCompany?.slug
  );

  const isGeneralDateRangeInvalid = generalStartDate && generalEndDate && generalEndDate < generalStartDate;
  const isAircraftDateRangeInvalid = aircraftStartDate && aircraftEndDate && aircraftEndDate < aircraftStartDate;

  // Resetear filtros cuando se cierra el diálogo
  useEffect(() => {
    if (!open) {
      setGeneralStartDate(undefined);
      setGeneralEndDate(undefined);
      setAircraft(null);
      setAircraftStartDate(undefined);
      setAircraftEndDate(undefined);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          onClick={() => setOpen(true)}
          variant="outline"
          className="flex items-center justify-center gap-2 h-8 border-dashed"
        >
          Generar Reporte
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Generar Reporte</DialogTitle>
          <DialogDescription>
            Aquí se pueden generar los reportes del almacén.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 flex flex-col justify-center text-center">
          {/* Reporte General */}
          <div className="space-y-4">
            <div className="space-y-2">
              <h1 className="text-xl font-bold flex gap-2 items-center justify-center">
                General <NotepadText />
              </h1>
              <p className="text-muted-foreground text-sm italic">
                Genere un reporte con todas las salidas registradas. Opcionalmente puede filtrar por rango de fechas.
              </p>
            </div>

            {/* Rango de fechas opcional para reporte general */}
            <div className="flex flex-col md:flex-row justify-center gap-4 items-center">
              {/* Desde */}
              <div className="flex flex-col items-start">
                <label className="text-xs font-medium">Desde (Opcional)</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[200px] justify-start text-left",
                        !generalStartDate && "text-muted-foreground"
                      )}
                    >
                      {generalStartDate
                        ? format(generalStartDate, "PPP", { locale: es })
                        : "Seleccionar fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={generalStartDate}
                      onSelect={setGeneralStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Hasta */}
              <div className="flex flex-col items-start">
                <label className="text-xs font-medium">Hasta (Opcional)</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[200px] justify-start text-left",
                        !generalEndDate && "text-muted-foreground"
                      )}
                    >
                      {generalEndDate
                        ? format(generalEndDate, "PPP", { locale: es })
                        : "Seleccionar fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={generalEndDate}
                      onSelect={setGeneralEndDate}
                      initialFocus
                      disabled={(date) =>
                        generalStartDate ? date < generalStartDate : false
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Botones de descarga para reporte general */}
            {dispatchReport && (
              <>
                {/* Botón sin filtros de fecha */}
                {(!generalStartDate || !generalEndDate || isGeneralDateRangeInvalid) && (
                  <PDFDownloadLink
                    fileName={`salidas_${format(new Date(), "dd-MM-yyyy", { locale: es })}.pdf`}
                    document={
                      <DispatchReportPdf
                        reports={dispatchReport}
                        aircraftFilter={null}
                        startDate={undefined}
                        endDate={undefined}
                      />
                    }
                  >
                    <Button disabled={isLoadingDispatchReport} className="mt-2">
                      Descargar Reporte General
                    </Button>
                  </PDFDownloadLink>
                )}

                {/* Botón con filtros de fecha */}
                {generalStartDate && generalEndDate && !isGeneralDateRangeInvalid && (
                  <PDFDownloadLink
                    fileName={`salidas_rango_${format(generalStartDate, "dd-MM-yyyy", { locale: es })}_a_${format(generalEndDate, "dd-MM-yyyy", { locale: es })}.pdf`}
                    document={
                      <DispatchReportPdf
                        reports={dispatchReport}
                        aircraftFilter={null}
                        startDate={generalStartDate}
                        endDate={generalEndDate}
                      />
                    }
                  >
                    <Button disabled={isLoadingDispatchReport} className="mt-2">
                      Descargar Reporte General por Rango de Fechas
                    </Button>
                  </PDFDownloadLink>
                )}
              </>
            )}
          </div>

          {/* Reporte por Aeronave */}
          <div className="space-y-4">
            <div className="space-y-2">
              <h1 className="text-xl font-bold flex gap-2 items-center justify-center">
                Filtrar por Aeronave <Plane />
              </h1>
              <p className="text-muted-foreground text-sm italic">
                Seleccione un avión para filtrar las salidas. Opcionalmente puede agregar un rango de fechas.
              </p>
            </div>

            {/* Selector de Aeronave */}
            <div className="flex gap-2 items-center justify-center">
              <Select
                onValueChange={(value) =>
                  setAircraft(value === "all" ? null : value)
                }
                value={aircraft || "all"}
              >
                <SelectTrigger
                  disabled={isLoadingAircrafts}
                  className="w-[200px]"
                >
                  <SelectValue placeholder="Seleccione una aeronave" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las aeronaves</SelectItem>
                  {aircrafts?.map((aircraftItem) => (
                    <SelectItem
                      key={aircraftItem.id}
                      value={aircraftItem.id.toString()}
                    >
                      {aircraftItem.acronym ?? `Aeronave #${aircraftItem.id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Rango de fechas opcional para reporte por aeronave */}
            {aircraft && aircraft !== "all" && (
              <div className="flex flex-col md:flex-row justify-center gap-4 items-center">
                {/* Desde */}
                <div className="flex flex-col items-start">
                  <label className="text-xs font-medium">Desde (Opcional)</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-[200px] justify-start text-left",
                          !aircraftStartDate && "text-muted-foreground"
                        )}
                      >
                        {aircraftStartDate
                          ? format(aircraftStartDate, "PPP", { locale: es })
                          : "Seleccionar fecha"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={aircraftStartDate}
                        onSelect={setAircraftStartDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Hasta */}
                <div className="flex flex-col items-start">
                  <label className="text-xs font-medium">Hasta (Opcional)</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-[200px] justify-start text-left",
                          !aircraftEndDate && "text-muted-foreground"
                        )}
                      >
                        {aircraftEndDate
                          ? format(aircraftEndDate, "PPP", { locale: es })
                          : "Seleccionar fecha"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={aircraftEndDate}
                        onSelect={setAircraftEndDate}
                        initialFocus
                        disabled={(date) =>
                          aircraftStartDate ? date < aircraftStartDate : false
                        }
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}

            {/* Botones de descarga para reporte por aeronave */}
            {aircraft && aircraft !== "all" && dispatchReport && (
              <>
                {/* Botón sin filtros de fecha */}
                {(!aircraftStartDate || !aircraftEndDate || isAircraftDateRangeInvalid) && (
                  <PDFDownloadLink
                    fileName={`salidas_avion_${aircraft}_${format(new Date(), "dd-MM-yyyy", { locale: es })}.pdf`}
                    document={
                      <DispatchReportPdf
                        reports={dispatchReport}
                        aircraftFilter={parseInt(aircraft)}
                        startDate={undefined}
                        endDate={undefined}
                      />
                    }
                  >
                    <Button disabled={isLoadingDispatchReport} className="mt-2">
                      Descargar Reporte por Avión
                    </Button>
                  </PDFDownloadLink>
                )}

                {/* Botón con filtros de fecha */}
                {aircraftStartDate && aircraftEndDate && !isAircraftDateRangeInvalid && (
                  <PDFDownloadLink
                    fileName={`salidas_avion_${aircraft}_${format(aircraftStartDate, "dd-MM-yyyy", { locale: es })}_a_${format(aircraftEndDate, "dd-MM-yyyy", { locale: es })}.pdf`}
                    document={
                      <DispatchReportPdf
                        reports={dispatchReport}
                        aircraftFilter={parseInt(aircraft)}
                        startDate={aircraftStartDate}
                        endDate={aircraftEndDate}
                      />
                    }
                  >
                    <Button disabled={isLoadingDispatchReport} className="mt-2">
                      Descargar Reporte por Avión y Rango de Fechas
                    </Button>
                  </PDFDownloadLink>
                )}
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
