"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  NotepadText,
  Plane,
  Calendar as CalendarIcon,
  Loader2,
} from "lucide-react";

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

export function DispatchReportDialog() {
  const { selectedStation, selectedCompany } = useCompanyStore();
  const [open, setOpen] = useState(false);
  const [loadingDownload, setLoadingDownload] = useState(false);

  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [aircraft, setAircraft] = useState<string | null>(null);

  const { mutateAsync } = useGetDispatchReport();

  const { data: aircrafts, isLoading: isLoadingAircrafts } = useGetAircrafts(
    selectedCompany?.slug,
  );

  const isDateRangeInvalid = startDate && endDate && endDate < startDate;
  const areDatesMissing = !startDate || !endDate;

  useEffect(() => {
    if (!open) {
      setStartDate(undefined);
      setEndDate(undefined);
      setAircraft(null);
    }
  }, [open]);

  const handleDownload = async (type: "general" | "aircraft") => {
    if (!selectedStation || !selectedCompany?.slug || areDatesMissing) return;

    try {
      setLoadingDownload(true);

      const blobData = await mutateAsync({
        location_id: selectedStation,
        company: selectedCompany.slug,
        aircraft_id: type === "aircraft" ? aircraft : undefined,
        from: format(startDate!, "yyyy-MM-dd"),
        to: format(endDate!, "yyyy-MM-dd"),
      });

      // ✅ 1. Cambiamos el tipo a application/zip
      const url = window.URL.createObjectURL(
        new Blob([blobData], { type: "application/zip" }),
      );

      const link = document.createElement("a");
      link.href = url;

      // ✅ 2. Cambiamos la extensión a .zip
      const fileName = type === "aircraft" ? "reporte-aeronave" : "reporte-completo";
      link.download = `${fileName}-${format(
        new Date(),
        "yyyyMMdd-HHmmss",
      )}.zip`;

      document.body.appendChild(link);
      link.click();

      // ✅ 3. Limpieza
      link.remove();
      window.URL.revokeObjectURL(url);

      setOpen(false);
    } catch (error) {
      console.error("Error al generar el reporte:", error);
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
            Selecciona un rango de fechas obligatorio.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 flex flex-col items-center py-4">
          {/* FECHAS */}
          <div className="w-full space-y-2">
            <label className="text-sm font-medium flex items-center gap-2 justify-center">
              <CalendarIcon className="w-4 h-4" /> Rango de Fechas
            </label>

            <div className="flex gap-2 justify-center">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-[180px] text-xs")}>
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
                  <Button variant="outline" className={cn("w-[180px] text-xs")}>
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
          </div>

          <hr className="w-full border-muted" />

          {/* REPORTE GENERAL */}
          <Button
            className="w-full"
            onClick={() => handleDownload("general")}
            disabled={loadingDownload || areDatesMissing || isDateRangeInvalid}
          >
            {loadingDownload && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Descargar Reporte Completo
          </Button>

          {/* REPORTE POR AERONAVE */}
          <Select
            onValueChange={(value) =>
              setAircraft(value === "all" ? null : value)
            }
            value={aircraft || "all"}
          >
            <SelectTrigger disabled={isLoadingAircrafts}>
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
            disabled={
              loadingDownload ||
              areDatesMissing ||
              isDateRangeInvalid ||
              !aircraft
            }
          >
            {loadingDownload && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Generar por Aeronave
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
