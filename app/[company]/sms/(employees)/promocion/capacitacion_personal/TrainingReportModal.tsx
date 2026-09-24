"use client";

import { useState } from "react";
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
import { useEmployeeTrainingReport } from "@/hooks/sms/useGetEmployeeTrainingReport";

export function TrainingReportModal({ company }: { company?: string }) {
  const [isOpen, setIsOpen] = useState(false);

  const {
    reportFrom,
    setReportFrom,
    reportTo,
    setReportTo,
    isGenerating,
    handleGenerate,
    canGenerate,
  } = useEmployeeTrainingReport(() => setIsOpen(false), company);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 flex gap-2">
          <FileDown className="size-4" />
          Generar Reporte
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader className="flex flex-col items-center">
          <DialogTitle className="text-3xl font-bold text-center">
            Reporte de Capacitación
          </DialogTitle>
          <DialogDescription className="text-sm italic text-center">
            Selecciona el rango de fechas para consultar la capacitación de los
            empleados en el servidor.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-8 py-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-center gap-2 font-bold text-xl">
              <span>Rango por fechas</span>
              <CalendarDays className="size-5 text-primary" />
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                      {reportFrom
                        ? format(reportFrom, "dd/MM/yyyy", { locale: es })
                        : "DD/MM/YYYY"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={reportFrom}
                      onSelect={setReportFrom}
                      autoFocus
                      locale={es}
                    />
                  </PopoverContent>
                </Popover>
              </div>

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
                      {reportTo
                        ? format(reportTo, "dd/MM/yyyy", { locale: es })
                        : "DD/MM/YYYY"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={reportTo}
                      onSelect={setReportTo}
                      disabled={(date) => (reportFrom ? date < reportFrom : false)}
                      autoFocus
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
              disabled={!canGenerate}
              className={cn(
                "w-full font-bold text-lg h-12 transition-all duration-200",
                !canGenerate &&
                  "bg-muted text-muted-foreground cursor-not-allowed opacity-50 shadow-none border-none hover:bg-muted"
              )}
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}