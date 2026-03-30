'use client';

import { useState, useRef, useMemo, useEffect } from "react";
import { UploadCloud, FileText, X, CalendarDays } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios";

export const UploadVersionDialog = ({ isOpen, onClose, doc, company, onSuccess }: any) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [changeLog, setChangeLog] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  // Estado para forzar manualmente el modo si la lógica automática falla
  const [manualRequiresExpiry, setManualRequiresExpiry] = useState<boolean | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Limpiar estados al cerrar o abrir con un nuevo documento
  useEffect(() => {
    if (isOpen) {
      setSelectedFile(null);
      setChangeLog("");
      setExpirationDate("");
      setManualRequiresExpiry(null);
    }
  }, [isOpen, doc?.id]);

  // Lógica de Vigencia: Detecta automáticamente pero permite cambio manual
  const requiresExpiry = useMemo(() => {
    if (manualRequiresExpiry !== null) return manualRequiresExpiry;
    
    const status = String(doc?.expiry_status || '').toLowerCase().trim();
    const dbFlag = doc?.requires_expiry === 1 || doc?.latest_version?.requires_expiry === 1;
    
    return status === 'vigente' || status === 'vencido' || dbFlag;
  }, [doc, manualRequiresExpiry]);

  const handleUploadVersion = async () => {
    // Validaciones específicas para depurar qué falta
    if (!selectedFile) {
      toast.error("Debes seleccionar un archivo PDF");
      return;
    }
    if (!changeLog.trim()) {
      toast.error("La justificación es obligatoria");
      return;
    }
    if (requiresExpiry && !expirationDate) {
      toast.error("La fecha de expiración es obligatoria para este documento");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("change_log", changeLog);
    formData.append("expiration_date", requiresExpiry ? expirationDate : "");

    try {
      await axiosInstance.post(
        `/${company}/library/documents/${doc.id}/versions`, 
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      
      toast.success("Nueva versión cargada exitosamente");
      if (onSuccess) await onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error en subida:", error.response?.data);
      toast.error(error.response?.data?.message || "Error al subir la versión");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-[#1a1c1e] border-slate-200 dark:border-gray-800 shadow-2xl p-0 overflow-hidden outline-none">
        {/* Header */}
        <div className="bg-slate-50 dark:bg-gray-800/40 px-6 py-4 border-b border-slate-200 dark:border-gray-700 flex items-center gap-2">
          <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <UploadCloud className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <DialogTitle className="text-base font-bold uppercase text-slate-900 dark:text-white">
            Subir nueva versión
          </DialogTitle>
        </div>

        <div className="p-6 space-y-4">
          {/* Info Documento Padre */}
          <div className="p-3 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-gray-800 rounded-lg">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Documento padre</span>
            <p className="text-xs font-semibold text-slate-800 dark:text-white mt-1 truncate">{doc?.title}</p>
          </div>

          {/* Selector de Archivo */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Archivo PDF *</label>
            <input 
              type="file" 
              accept=".pdf" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} 
            />
            
            {!selectedFile ? (
              <div 
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const file = e.dataTransfer.files[0];
                  if (file?.type === "application/pdf") setSelectedFile(file);
                  else toast.error("Solo se permiten archivos PDF");
                }}
                onClick={() => fileInputRef.current?.click()} 
                className={`w-full h-24 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all ${
                  isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-200 dark:border-gray-800 hover:border-blue-500/50'
                }`}
              >
                <UploadCloud className="h-6 w-6 text-slate-400 mb-1" />
                <span className="text-xs font-medium text-slate-400">Arrastra o haz click para cargar PDF</span>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/50 rounded-xl">
                <div className="flex items-center gap-2 truncate">
                  <FileText className="h-4 w-4 text-blue-500 flex-shrink-0" />
                  <span className="text-xs text-slate-700 dark:text-gray-300 truncate font-medium">{selectedFile.name}</span>
                </div>
                <button type="button" onClick={() => setSelectedFile(null)} className="text-slate-400 hover:text-red-500 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Control de Vigencia y Fecha */}
          <div className="grid grid-cols-2 gap-4 items-end">
            <div className="flex flex-col space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Vigencia (Manual)</label>
              <div className="grid grid-cols-2 h-11 bg-slate-100 dark:bg-gray-800/50 rounded-xl p-1 border border-slate-200 dark:border-gray-800">
                <button 
                  type="button"
                  onClick={() => setManualRequiresExpiry(false)}
                  className={`text-[10px] font-bold rounded-lg transition-all ${!requiresExpiry ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm' : 'text-slate-400'}`}
                >
                  PERM.
                </button>
                <button 
                  type="button"
                  onClick={() => setManualRequiresExpiry(true)}
                  className={`text-[10px] font-bold rounded-lg transition-all ${requiresExpiry ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm' : 'text-slate-400'}`}
                >
                  CON VENC.
                </button>
              </div>
            </div>

            <div className="flex flex-col space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <CalendarDays className="h-3.5 w-3.5 text-blue-500" /> Nueva Expiración
              </label>
              <input 
                type="date" 
                disabled={!requiresExpiry} 
                value={expirationDate} 
                onChange={(e) => setExpirationDate(e.target.value)} 
                className={`w-full h-11 px-3 border border-slate-200 dark:border-gray-800 rounded-xl bg-white dark:bg-[#1a1c1e] text-xs text-slate-800 dark:text-white outline-none focus:ring-1 focus:ring-blue-500 transition-all ${!requiresExpiry ? 'opacity-50 cursor-not-allowed' : ''}`} 
              />
            </div>
          </div>

          {/* Justificación */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Justificación / Log de cambios</label>
            <textarea 
              placeholder="Ej: Actualización de procedimientos por auditoría" 
              value={changeLog} 
              onChange={(e) => setChangeLog(e.target.value)}
              className="w-full h-20 p-3 text-xs border border-slate-200 dark:border-gray-800 rounded-xl bg-transparent text-slate-800 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none resize-none placeholder:text-slate-400"
            />
          </div>

          {/* Botones de Acción */}
          <div className="flex gap-3 pt-2">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 px-4 py-3 text-[11px] font-black text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-white uppercase tracking-widest transition-colors"
            >
              CANCELAR
            </button>
            <button 
              disabled={uploading} 
              onClick={handleUploadVersion} 
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-[11px] rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-blue-500/10 uppercase tracking-widest"
            >
              {uploading ? 'Subiendo...' : 'SUBIR VERSIÓN'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};