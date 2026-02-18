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
import { CalendarDays, FileDown, Loader2 } from "lucide-react";

interface ReportModalProps {
  activities: any[];
}

export function ReportModal({ activities }: ReportModalProps) {
  const [reportFrom, setReportFrom] = useState("");
  const [reportTo, setReportTo] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    // 1. Filtrar las actividades
    const filtered = activities.filter((act) => {
      if (!act.start_date) return !reportFrom && !reportTo;
      const activityDate = new Date(act.start_date);
      activityDate.setHours(0, 0, 0, 0);

      if (reportFrom) {
        const fromDate = new Date(reportFrom);
        fromDate.setHours(0, 0, 0, 0);
        if (activityDate < fromDate) return false;
      }
      if (reportTo) {
        const toDate = new Date(reportTo);
        toDate.setHours(0, 0, 0, 0);
        if (activityDate > toDate) return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      alert("No se encontraron actividades en el rango de fechas seleccionado.");
      return;
    }

    try {
      setIsGenerating(true);

      // Obtenemos el token para evitar el 401
      const token = typeof window !== 'undefined' 
        ? (localStorage.getItem('token') || document.cookie.split('; ').find(row => row.trim().startsWith('token='))?.split('=')[1])
        : null;

      const response = await fetch("http://127.0.0.1:8000/api/generate-sms-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          activities: filtered,
          company: "transmandu" 
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error de Laravel:", errorText);
        throw new Error(`Error ${response.status}: El servidor rechazó la solicitud.`);
      }

      const blob = await response.blob();
      
      if (blob.type !== "application/pdf") {
         throw new Error("El servidor no devolvió un PDF válido.");
      }

      // --- AQUÍ ESTÁ EL FIX DE LA URL ---
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl; // Aquí se usa el valor
      link.download = `Reporte_SMS_Consolidado_${new Date().toISOString().split('T')[0]}.pdf`;
      
      document.body.appendChild(link);
      link.click();
      
      // Limpieza
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

    } catch (error: any) {
      console.error("Error al descargar el reporte:", error);
      alert(error.message || "No se pudo generar el reporte.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 flex gap-2">
          <FileDown className="size-4" />
          Generar Reporte
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader className="flex flex-col items-center">
          <DialogTitle className="text-4xl font-bold text-center">Generar Reporte</DialogTitle>
          <DialogDescription className="text-sm italic text-center">
            Aquí se pueden generar los reportes de actividades de SMS.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-8 py-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-center gap-2 font-bold text-2xl">
              <span>Rango por fechas</span>
              <CalendarDays className="size-6" />
            </div>
            
            <p className="text-[12px] italic text-muted-foreground text-center px-4 leading-tight">
              Genere un reporte con todas las actividades registradas. <br />
              Opcionalmente puede filtrar un rango específico.
            </p>
            
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold ml-1 text-foreground">Desde (Opcional)</label>
                <input 
                  type="date" 
                  value={reportFrom}
                  onChange={(e) => setReportFrom(e.target.value)}
                  className="w-full bg-background border rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary shadow-sm text-black"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold ml-1 text-foreground">Hasta (Opcional)</label>
                <input 
                  type="date" 
                  value={reportTo}
                  onChange={(e) => setReportTo(e.target.value)}
                  className="w-full bg-background border rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary shadow-sm text-black"
                />
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
                  Generando...
                </>
              ) : (
                "Generar Reporte"
              )}
            </Button>
            <p className="text-[10px] text-center text-muted-foreground italic">
              * Si no selecciona fechas, se incluirán todos los registros que se visualizan en la tabla.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}