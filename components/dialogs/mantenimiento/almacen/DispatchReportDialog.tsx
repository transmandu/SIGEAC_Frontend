"use client";

import { useState } from "react";
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
  const [aircraft, setAircraft] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  const { data: dispatchReport, isLoading: isLoadingDispatchReport } =
    useGetDispatchReport(selectedStation ?? null);
  const { data: aircrafts, isLoading: isLoadingAircrafts } = useGetAircrafts(
    selectedCompany?.slug
  );

  const isDateRangeInvalid = startDate && endDate && endDate < startDate;

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
          <div className="space-y-2">
            <h1 className="text-xl font-bold flex gap-2 items-center justify-center">
              General <NotepadText />
            </h1>
            <p className="text-muted-foreground text-sm italic">
              Genere un reporte con todas las salidas registradas.
            </p>
            {dispatchReport && (
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
          </div>

          {/* Filtro por Avión */}
          <div className="space-y-2">
            <h1 className="text-xl font-bold flex gap-2 items-center justify-center">
              Filtrar <Plane />
            </h1>
            <p className="text-muted-foreground text-sm italic">
              Seleccione un avión para filtrar.
            </p>
            <div className="flex gap-2 items-center justify-center">
              <Select
                onValueChange={(value) =>
                  setAircraft(value === "all" ? null : value)
                }
              >
                <SelectTrigger
                  disabled={isLoadingAircrafts}
                  className="w-[200px]"
                >
                  <SelectValue placeholder="Todos los aviones" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los aviones</SelectItem>
                  {aircrafts?.map((aircraft) => (
                    <SelectItem
                      key={aircraft.id}
                      value={aircraft.id.toString()}
                    >
                      {aircraft.acronym ?? `Aeronave #${aircraft.id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {aircraft && dispatchReport && (
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
          </div>

          {/* Rango de Fechas */}
          <div className="space-y-2">
            <h1 className="text-xl font-bold flex gap-2 items-center justify-center">
              Rango de Fecha <CalendarDays />
            </h1>
            <p className="text-muted-foreground text-sm italic">
              Seleccione un rango de fechas para filtrar.
            </p>
            <div className="flex flex-col md:flex-row justify-center gap-4 items-center">
              {/* Desde */}
              <div className="flex flex-col items-start">
                <label className="text-xs font-medium">Desde</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[200px] justify-start text-left",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      {startDate
                        ? format(startDate, "PPP", { locale: es })
                        : "Seleccionar fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Hasta */}
              <div className="flex flex-col items-start">
                <label className="text-xs font-medium">Hasta</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[200px] justify-start text-left",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      {endDate
                        ? format(endDate, "PPP", { locale: es })
                        : "Seleccionar fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                      disabled={(date) =>
                        startDate ? date < startDate : false
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {startDate && endDate && !isDateRangeInvalid && dispatchReport && (
              <PDFDownloadLink
                fileName={`salidas_rango_${format(startDate, "dd-MM-yyyy", { locale: es })}_a_${format(endDate, "dd-MM-yyyy", { locale: es })}.pdf`}
                document={
                  <DispatchReportPdf
                    reports={dispatchReport}
                    aircraftFilter={null}
                    startDate={startDate}
                    endDate={endDate}
                  />
                }
              >
                <Button disabled={isLoadingDispatchReport} className="mt-4">
                  Descargar Reporte por Rango de Fechas
                </Button>
              </PDFDownloadLink>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
