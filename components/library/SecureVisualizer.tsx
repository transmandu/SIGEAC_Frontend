"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, Loader2, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Nota: He eliminado 'X' y 'Button' de los imports porque ya no se usarán manualmente aquí.

interface SecureVisualizerProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string | null;
  title?: string;
}

export default function SecureVisualizer({
  isOpen,
  onClose,
  fileUrl,
  title = "Visualizador Seguro SIGEAC"
}: SecureVisualizerProps) {
  const [isLoading, setIsLoading] = useState(true);

  // Resetear el loading cada vez que cambie la URL o se abra
  useEffect(() => {
    if (isOpen) setIsLoading(true);
  }, [fileUrl, isOpen]);

  // Bloqueo de teclas básicas de guardado/impresión
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 's')) {
        e.preventDefault();
        // Opcional: mostrar una notificación discreta en lugar de un alert
        // console.warn("Acción no permitida por políticas de seguridad de SIGEAC.");
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[98vw] w-[98vw] h-[96vh] p-0 gap-0 overflow-hidden border-none bg-slate-950 flex flex-col">
        
        {/* Header Mejorado - Ahora sin el botón de cerrar manual */}
        <DialogHeader className="p-4 bg-slate-900 border-b border-slate-800 flex flex-row items-center justify-between space-y-0 shrink-0">
          <div className="flex items-center gap-4"> {/* Gap aumentado para más aire */}
            <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-900/20"> {/* Icono y contenedor ligeramente más grandes */}
              <ShieldCheck className="size-5 text-white" />
            </div>
            <div>
              {/* MEJORA 2: Título más grande, legible y profesional */}
              <DialogTitle className="text-xl font-bold text-slate-50 uppercase tracking-wide">
                {title}
              </DialogTitle>
              <p className="text-[11px] text-slate-400 font-medium tracking-wide">MODO DE SOLO LECTURA • CONTROLADO POR SEGURIDAD OPERACIONAL</p>
            </div>
          </div>
          {/* MEJORA 1: Se eliminó el Button y el icono X que estaban aquí.
              El Dialog de Shadcn UI se encargará de mostrar el botón de cerrar. */}
        </DialogHeader>
        
        {/* Contenedor Principal (sin cambios significativos) */}
        <div 
          className="relative flex-1 w-full bg-[#020617] flex items-center justify-center overflow-hidden"
          onContextMenu={(e) => e.preventDefault()} // Bloqueo clic derecho simple
        >
          {/* Marca de Agua en Patrón */}
          <div className="absolute inset-0 z-10 pointer-events-none select-none flex flex-wrap gap-20 items-center justify-center opacity-[0.04]">
            {Array.from({ length: 12 }).map((_, i) => (
              <p key={i} className="text-4xl font-black rotate-[-35deg] text-white uppercase tracking-tighter whitespace-nowrap">
                SIGEAC CONFIDENCIAL
              </p>
            ))}
          </div>

          {/* Loader */}
          {isLoading && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm">
              <Loader2 className="size-12 text-blue-500 animate-spin mb-4" />
              <p className="text-slate-400 text-sm animate-pulse font-medium">Cifrando y cargando documento...</p>
            </div>
          )}
          
          {fileUrl ? (
            <iframe 
              src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`} 
              className={`w-full h-full border-none z-0 transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
              title="Visor de Documentos"
              onLoad={() => setIsLoading(false)}
            />
          ) : (
            <div className="flex flex-col items-center text-slate-500 gap-4">
              <AlertCircle className="size-12" />
              <p className="font-medium text-lg">No se pudo cargar el recurso.</p>
              <p className="text-sm">Verifique la URL del documento o contacte a soporte.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}