"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarDays, FileDown, Loader2, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useSmsReport } from "@/hooks/sms/useGetReportSmsByDate";

export function ReportModal() {
  const { 
    reportFrom, setReportFrom, 
    reportTo, setReportTo, 
    isGenerating, handleGenerate 
  } = useSmsReport();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 flex gap-2">
          <FileDown className="size-4" />
          Generar Reporte
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader className="flex flex-col items-center">
          <DialogTitle className="text-3xl font-bold text-center">Generar Reporte</DialogTitle>
          <DialogDescription className="text-sm italic text-center">
            Selecciona el rango de fechas para la consulta en el servidor.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-8 py-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-center gap-2 font-bold text-xl">
              <span>Rango por fechas</span>
              <CalendarDays className="size-5 text-primary" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Selector DESDE */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold ml-1">Desde</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal border-input bg-background text-foreground",
                        !reportFrom && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {reportFrom ? format(reportFrom, "dd/MM/yyyy", { locale: es }) : "DD/MM/YYYY"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={reportFrom}
                      onSelect={setReportFrom}
                      initialFocus
                      locale={es}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Selector HASTA */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold ml-1">Hasta</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal border-input bg-background text-foreground",
                        !reportTo && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {reportTo ? format(reportTo, "dd/MM/yyyy", { locale: es }) : "DD/MM/YYYY"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={reportTo}
                      onSelect={setReportTo}
                      disabled={(date) => (reportFrom ? date < reportFrom : false)} // No deja seleccionar fecha menor a 'Desde'
                      initialFocus
                      locale={es}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating} 
              className="w-full font-bold text-lg h-12"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Procesando...
                </>
              ) : (
                "Generar PDF"
              )}
            </Button>
            <p className="text-[10px] text-center text-muted-foreground italic">
              * El reporte se filtrará según la columna start_date de la base de datos.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}