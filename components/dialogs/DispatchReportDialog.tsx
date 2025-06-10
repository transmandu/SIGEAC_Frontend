'use client'

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useGetManufacturers } from "@/hooks/general/condiciones/useGetConditions";
import { useGetWarehouseReport } from "@/hooks/mantenimiento/almacen/reportes/useGetWarehouseReport";
import { useCompanyStore } from "@/stores/CompanyStore";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { format } from "date-fns";
import { Drill, NotepadText, Plane } from "lucide-react";
import { useState } from "react";
import WarehouseReportPdf from "../pdf/GeneralWarehouseReport";

import { useGetAircrafts } from "@/hooks/aerolinea/aeronaves/useGetAircrafts"; 
import { useGetDispatchReport } from "@/hooks/mantenimiento/almacen/reportes/useGetDispatchReport";
import DispatchReportPdf from "../pdf/DispatchReport";

export function DispatchReportDialog() {
  const { selectedStation, selectedCompany } = useCompanyStore();
  const [open, setOpen] = useState(false);
  const [manufacturer, setManufacturer] = useState<string | null>(null);
  const [aircraft, setAircraft] = useState<string | null>(null);

  const { data: dispatchReport, isLoading: isLoadingDispatchReport } = useGetDispatchReport(selectedStation ?? null);
  const { data: aircrafts, isLoading: isLoadingAircrafts } = useGetAircrafts(selectedCompany?.replace(/\s/g, ""));
//   const { data, isLoading: reportLoading } = useGetWarehouseReport(selectedStation ?? null);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setOpen(true)} variant="outline" className="flex items-center justify-center gap-2 h-8 border-dashed">
          Generar Reporte
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Generar Reporte</DialogTitle>
          <DialogDescription>
            Aquí se pueden generar los reportes del almacén.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 flex flex-col justify-center text-center">
          {/* Reporte General */}
          <div className="space-y-2">
            <h1 className="text-xl font-bold flex gap-2 items-center justify-center">General <NotepadText /></h1>
            <p className="text-muted-foreground text-sm italic">Genere un reporte de todos los artículos registrados con su respectivo estado.</p>
            {
              dispatchReport && (
                <PDFDownloadLink
                  fileName={`registro_de_salida_${format(new Date(), "dd-MM-yyyy")}.pdf`}
                  document={<DispatchReportPdf reports={dispatchReport ?? []} />}
                >
                  <Button disabled={isLoadingDispatchReport} className="mt-2">Descargar Reporte</Button>
                </PDFDownloadLink>
              )
            }
          </div>

          {/* Reporte por Avión */}
          <div className="space-y-2">
            <h1 className="text-xl font-bold flex gap-2 items-center justify-center">Avión <Plane /></h1>
            <p className="text-muted-foreground text-sm italic">Genere un reporte filtrado por aeronave.</p>
            <div className="flex gap-2 items-center justify-center">
              <Select onValueChange={(value) => setAircraft(value)}>
                <SelectTrigger disabled={isLoadingAircrafts} className="w-[180px]">
                  <SelectValue placeholder="Seleccione..." />
                </SelectTrigger>
                <SelectContent>
                  {/* {
                    aircrafts?.map((aircraft) => (
                      <SelectItem key={aircraft.id} value={aircraft.id.toString()}>
                        {aircraft.registration ?? `Aeronave #${aircraft.id}`}
                      </SelectItem>
                    ))
                  } */}
                </SelectContent>
              </Select>
              <Button disabled={!aircraft}>Descargar</Button>
            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}
