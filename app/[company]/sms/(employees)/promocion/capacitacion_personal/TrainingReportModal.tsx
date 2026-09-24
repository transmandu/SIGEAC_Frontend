"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FileDown, Loader2, CalendarDays } from "lucide-react";
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
        <Button
          variant="outline"
          size="sm"
          type="button"
          className="h-8 flex gap-2"
        >
          <FileDown className="size-4" />
          Generar Reporte
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader className="pb-2 border-b border-border/60">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-500 shrink-0">
              <FileDown className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold leading-tight">
                Reporte de Capacitación SMS
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {company ? `Empresa: ${company}` : "Empresa: —"} · Rango de
                fechas para generar el PDF de capacitación de empleados.
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-5 py-4">
          <section className="flex flex-col gap-3">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Rango por fechas
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Desde
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !reportFrom && "text-muted-foreground",
                      )}
                    >
                      <CalendarDays className="mr-2 h-4 w-4" />
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

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Hasta
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !reportTo && "text-muted-foreground",
                      )}
                    >
                      <CalendarDays className="mr-2 h-4 w-4" />
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
                      disabled={(date) =>
                        reportFrom ? date < reportFrom : false
                      }
                      autoFocus
                      locale={es}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </section>

          <div className="border-t border-border/60 pt-4">
            <Button
              onClick={handleGenerate}
              disabled={!canGenerate}
              className="w-full h-10"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <FileDown className="size-4 mr-2" />
                  Generar PDF
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
