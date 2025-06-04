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
import { Drill, NotepadText } from "lucide-react";
import { useState } from "react";
import WarehouseReportPdf from "../pdf/GeneralWarehouseReport";

export function WarehouseReportDialog() {
  const { selectedStation, selectedCompany } = useCompanyStore()
  const [open, setOpen] = useState(false);
  const [manufacturer, setManufacturer] = useState<string | null>(null)
  const { data: manufacturers, isLoading } = useGetManufacturers(selectedCompany?.split(" ").join(""));
  const { data, isLoading: reportLoading } = useGetWarehouseReport(selectedStation ?? null);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setOpen(true)} variant={'outline'} className="flex items-center justify-center gap-2 h-8 border-dashed">Generar Reporte</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Generar Reporte</DialogTitle>
          <DialogDescription>
            Aquí se pueden generar los reportes del almacén.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 flex flex-col justify-center text-center">
          <div className="space-y-2">
            <h1 className="text-xl font-bold flex gap-2 items-center justify-center">General <NotepadText /></h1>
            <p className="text-muted-foreground text-sm italic">Genere un reporte de todos los articulos registrados en con su respectivo estado.</p>
            {
              data && <PDFDownloadLink
                fileName={`reporte_diario_${format(new Date(), "dd-MM-yyyy")}.pdf`}
                document={
                  <WarehouseReportPdf
                    reports={data ?? []}
                  />
                }
              >
                <Button disabled={reportLoading} className="mt-2">Descargar Reporte</Button>
              </PDFDownloadLink>
            }
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold flex gap-2 items-center justify-center">Fabricante <Drill /></h1>
            <p className="text-muted-foreground text-sm italic">Genere un reporte de todos los articulos registrados en con su respectivo estado.</p>
            <div className="flex gap-2 items-center justify-center">
              <Select onValueChange={(value) => setManufacturer(value)}>
                <SelectTrigger disabled={isLoading} className="w-[180px]">
                  <SelectValue placeholder="Seleccione..." />
                </SelectTrigger>
                <SelectContent>
                  {
                    manufacturers && manufacturers.map((manufacturer) => (
                      <SelectItem key={manufacturer.id} value={manufacturer.id.toString()}>{manufacturer.name}</SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
              <Button disabled={!manufacturer}>Descargar</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog >
  )
}
