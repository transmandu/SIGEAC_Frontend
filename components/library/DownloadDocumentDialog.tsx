'use client';

import { useState, useEffect, useMemo } from "react";
import { Download, FileText, ChevronDown, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import axiosInstance from "@/lib/axios";
import { downloadDocumentFile } from "@/lib/Library/download-helper";
import { toast } from "sonner";

interface Version {
  id: number;
  version_number: string;
  change_log: string;
  created_at: string;
}

interface DownloadProps {
  isOpen: boolean;
  onClose: () => void;
  doc: any;
  company: string;
}

export const DownloadDocumentDialog = ({ isOpen, onClose, doc, company }: DownloadProps) => {
  const [downloadMode, setDownloadMode] = useState<'document' | 'version'>('document');
  const [versionList, setVersionList] = useState<Version[]>([]);
  const [selectedVersionToDownload, setSelectedVersionToDownload] = useState<string>("");
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isOpen && doc?.id) {
      handleFetchVersions();
    } else {
      setDownloadMode('document');
      setSelectedVersionToDownload("");
      setVersionList([]);
    }
  }, [isOpen, doc]);

  const handleFetchVersions = async () => {
    setLoadingVersions(true);
    try {
      const response = await axiosInstance.get(`/${company}/library/documents/${doc.id}/versions`);
      const fetchedVersions = response.data?.data?.versions || [];
      setVersionList(Array.isArray(fetchedVersions) ? fetchedVersions : []);
    } catch (error) {
      console.error("Error al cargar versiones:", error);
      toast.error("No se pudo obtener el historial para la descarga");
    } finally {
      setLoadingVersions(false);
    }
  };

  const handleFinalDownload = async () => {
    setIsProcessing(true);
    try {
      const isBase = downloadMode === 'document';
      const url = isBase 
        ? `/${company}/library/documents/${doc.id}/download`
        : `/${company}/library/versions/${selectedVersionToDownload}/download`;

      const versionObj = versionList.find(v => String(v.id) === selectedVersionToDownload);
      const label = isBase ? 'VIGENTE' : versionObj?.version_number || 'VERSION';
      const fileName = `${doc.title.replace(/\s+/g, '_')}_${label}.pdf`;

      await downloadDocumentFile(url, fileName);
      toast.success("Descarga iniciada");
      onClose();
    } catch (error: any) {
      const msg = error.response?.data?.message || "No tienes permisos o el archivo no existe.";
      toast.error(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const availableVersions = useMemo(() => versionList, [versionList]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white dark:bg-[#1a1c1e] border-none text-slate-900 dark:text-white sm:max-w-[480px] rounded-2xl overflow-hidden p-0 outline-none shadow-2xl">
        
        <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 dark:bg-blue-500/20 rounded-lg">
              <Download className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <DialogTitle className="text-lg font-bold text-slate-800 dark:text-white tracking-tight uppercase">
              Gestión de Descarga
            </DialogTitle>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Selecciona qué versión del documento deseas descargar: <br/>
            <span className="text-slate-900 dark:text-white font-bold tracking-tight">{doc?.title}</span>
          </p>

          <div className="space-y-3">
            {/* Opción: Documento Vigente */}
            <div 
              onClick={() => setDownloadMode('document')}
              className={`group p-4 border rounded-2xl cursor-pointer transition-all ${
                downloadMode === 'document' 
                ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-500/10 shadow-sm' 
                : 'border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 bg-white dark:bg-transparent'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-1 w-4 h-4 rounded-full border-2 flex items-center justify-center ${downloadMode === 'document' ? 'border-blue-500' : 'border-slate-300 dark:border-slate-600'}`}>
                  {downloadMode === 'document' && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 flex items-center gap-2 mb-1">
                    <FileText className="h-3.5 w-3.5" /> Documento vigente
                  </label>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight">Descarga el archivo más reciente registrado en el sistema.</p>
                </div>
              </div>
            </div>

            {/* Opción: Versión Específica */}
            <div 
              onClick={() => setDownloadMode('version')}
              className={`group p-4 border rounded-2xl cursor-pointer transition-all ${
                downloadMode === 'version' 
                ? 'border-purple-500 bg-purple-50/40 dark:bg-purple-500/10 shadow-sm' 
                : 'border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 bg-white dark:bg-transparent'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-1 w-4 h-4 rounded-full border-2 flex items-center justify-center ${downloadMode === 'version' ? 'border-purple-500' : 'border-slate-300 dark:border-slate-600'}`}>
                  {downloadMode === 'version' && <div className="w-2 h-2 bg-purple-500 rounded-full" />}
                </div>
                <div className="flex-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400 flex items-center gap-2 mb-1">
                    <Clock className="h-3.5 w-3.5" /> Versión del historial
                  </label>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mb-3 leading-tight">Selecciona una versión anterior de la trazabilidad.</p>
                  
                  {downloadMode === 'version' && (
                    <div className="relative animate-in fade-in zoom-in-95 duration-200">
                      <select 
                        value={selectedVersionToDownload}
                        onChange={(e) => setSelectedVersionToDownload(e.target.value)}
                        disabled={isProcessing || loadingVersions} 
                        className="w-full h-10 pl-3 pr-10 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-[#111214] text-[11px] font-bold text-slate-700 dark:text-white outline-none appearance-none"
                      >
                        {loadingVersions ? (
                          <option value="">Cargando Versiones...</option>
                        ) : availableVersions.length === 0 ? (
                          <option value="">No hay versiones disponibles</option>
                        ) : (
                          <>
                            <option value="">Selecciona la versión...</option>
                            {availableVersions.map((v) => (
                              <option key={v.id} value={v.id}>
                                {v.version_number} — {v.change_log || 'Carga inicial'}
                              </option>
                            ))}
                          </>
                        )}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400 pointer-events-none" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 px-4 py-3 text-[10px] font-black text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 uppercase tracking-widest transition-colors"
            >
              CANCELAR
            </button>
            <button 
              onClick={handleFinalDownload}
              disabled={isProcessing || (downloadMode === 'version' && (!selectedVersionToDownload || availableVersions.length === 0))}
              className={`flex-1 px-4 py-3 text-[10px] font-black text-white rounded-xl transition-all tracking-widest shadow-md active:scale-[0.98] ${
                downloadMode === 'document' 
                ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-100 dark:shadow-none' 
                : 'bg-purple-600 hover:bg-purple-700 shadow-purple-100 dark:shadow-none'
              } disabled:opacity-50 disabled:cursor-not-allowed uppercase`}
            >
              {isProcessing ? 'DESCARGANDO...' : 'INICIAR DESCARGA'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};