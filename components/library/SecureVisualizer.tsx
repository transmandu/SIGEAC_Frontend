"use client";

import { X, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[98vw] w-[98vw] h-[96vh] p-0 gap-0 overflow-hidden border-none bg-slate-950">
        <DialogHeader className="p-4 bg-slate-900 border-b border-slate-800 flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-1 rounded-md">
              <ShieldCheck className="size-4 text-white" />
            </div>
            <DialogTitle className="text-sm font-medium italic text-white uppercase tracking-tight">
              {title}
            </DialogTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="size-5" />
          </Button>
        </DialogHeader>
        
        <div className="relative w-full h-full bg-[#020617] flex items-center justify-center">
          <div className="absolute inset-0 z-10 pointer-events-none select-none flex items-center justify-center opacity-[0.03]">
            <p className="text-[10vw] font-black rotate-[-35deg] text-white uppercase text-center leading-none tracking-tighter">
              SIGEAC CONFIDENCIAL
            </p>
          </div>
          
          {fileUrl && (
            <iframe 
              src={`${fileUrl}#toolbar=0&navpanes=0`} 
              className="w-full h-full border-none z-0 relative"
              title="Visor de Documentos"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}