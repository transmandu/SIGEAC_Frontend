'use client';

import { useState, useEffect } from "react";
import { Trash2, FileText, Layers, ChevronDown } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";

interface Version {
  id: number;
  version_number: number;
  change_log: string;
}

interface DeleteProps {
  isOpen: boolean;
  onClose: () => void;
  doc: any;
  company: string;
  onSuccess: () => Promise<void>;
}

export const DeleteDocumentDialog = ({ isOpen, onClose, doc, company, onSuccess }: DeleteProps) => {
  const [deleteMode, setDeleteMode] = useState<'document' | 'version'>('document');
  // ✅ Inicializamos siempre como array vacío
  const [versionList, setVersionList] = useState<Version[]>([]);
  const [selectedVersionToDelete, setSelectedVersionToDelete] = useState<string>("");
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isOpen && doc?.id) {
      handleFetchVersions();
    } else {
      setDeleteMode('document');
      setSelectedVersionToDelete("");
    }
  }, [isOpen, doc]);

  const handleFetchVersions = async () => {
    setLoadingVersions(true);
    try {
      const response = await axiosInstance.get(`/${company}/library/documents/${doc.id}/versions`);
      // ✅ Validamos la estructura (data.data o data directamente)
      const fetchedData = response.data?.data || response.data || [];
      setVersionList(Array.isArray(fetchedData) ? fetchedData : []);
    } catch (error) {
      console.error("Error al cargar versiones:", error);
      setVersionList([]); // ✅ Reset ante error para evitar crasheos
    } finally {
      setLoadingVersions(false);
    }
  };

  const handleFinalDelete = async () => {
    setIsProcessing(true);
    try {
      if (deleteMode === 'document') {
        await axiosInstance.delete(`/${company}/library/documents/${doc.id}`);
        toast.success("Documento eliminado correctamente");
      } else {
        if (!selectedVersionToDelete) return;
        await axiosInstance.delete(`/${company}/library/documents/${doc.id}/versions/${selectedVersionToDelete}`);
        toast.success("Versión eliminada correctamente");
      }
      
      await onSuccess();
      onClose();
    } catch (error) {
      toast.error("Error en la operación");
    } finally {
      setIsProcessing(false);
    }
  };

  // ✅ Helper para filtrar de forma segura (previene el error .filter is not a function)
  const filteredVersions = Array.isArray(versionList) 
    ? versionList.filter(v => v.version_number !== 1) 
    : [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white dark:bg-[#1a1c1e] border-none text-slate-900 dark:text-white sm:max-w-[480px] rounded-2xl overflow-hidden p-0 outline-none shadow-2xl">
        
        <div className="bg-gray-50 dark:bg-gray-800/40 px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <DialogTitle className="text-lg font-bold text-gray-800 dark:text-white tracking-tight uppercase">
              Gestión de Eliminación
            </DialogTitle>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <p className="text-sm text-slate-500 dark:text-gray-400">
            Selecciona qué nivel de información deseas remover para: <br/>
            <span className="text-slate-900 dark:text-white font-bold">{doc?.title}</span>
          </p>

          <div className="space-y-3">
            <div 
              onClick={() => setDeleteMode('version')}
              className={`group p-4 border rounded-xl cursor-pointer transition-all ${deleteMode === 'version' ? 'border-orange-500 bg-orange-50/10' : 'border-slate-200 dark:border-gray-800 hover:border-orange-300'}`}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-1 w-4 h-4 rounded-full border-2 flex items-center justify-center ${deleteMode === 'version' ? 'border-orange-500' : 'border-slate-400'}`}>
                  {deleteMode === 'version' && <div className="w-2 h-2 bg-orange-500 rounded-full" />}
                </div>
                <div className="flex-1">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 flex items-center gap-2 mb-1">
                    <Layers className="h-3.5 w-3.5 text-orange-500" /> Eliminar versión específica
                  </label>
                  <p className="text-[11px] text-slate-500 mb-3">El registro principal se mantendrá activo.</p>
                  
                  {deleteMode === 'version' && (
                    <div className="relative animate-in fade-in zoom-in-95 duration-200">
                      <select 
                        value={selectedVersionToDelete}
                        onChange={(e) => setSelectedVersionToDelete(e.target.value)}
                        disabled={isProcessing || loadingVersions} 
                        className="w-full h-10 pl-3 pr-10 border border-orange-200 dark:border-orange-900/40 rounded-lg bg-white dark:bg-gray-900 text-xs text-gray-800 dark:text-white outline-none appearance-none"
                      >
                        {loadingVersions ? (
                          <option value="">Cargando historial...</option>
                        ) : filteredVersions.length === 0 ? (
                          <option value="">No hay versiones adicionales</option>
                        ) : (
                          <>
                            <option value="">Selecciona la versión...</option>
                            {filteredVersions.map((v) => (
                              <option key={v.id} value={v.id}>
                                V.{v.version_number} — {v.change_log || 'Sin descripción'}
                              </option>
                            ))}
                          </>
                        )}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-400 pointer-events-none" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div 
              onClick={() => setDeleteMode('document')}
              className={`group p-4 border rounded-xl cursor-pointer transition-all ${deleteMode === 'document' ? 'border-red-500 bg-red-50/10' : 'border-slate-200 dark:border-gray-800 hover:border-red-300'}`}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-1 w-4 h-4 rounded-full border-2 flex items-center justify-center ${deleteMode === 'document' ? 'border-red-500' : 'border-slate-400'}`}>
                  {deleteMode === 'document' && <div className="w-2 h-2 bg-red-500 rounded-full" />}
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-widest text-red-500 flex items-center gap-2 mb-1">
                    <FileText className="h-3.5 w-3.5" /> Eliminar documento completo
                  </label>
                  <p className="text-[11px] text-slate-500">Borrado permanente de todo el historial.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 px-4 py-3 text-[11px] font-black text-gray-400 hover:text-gray-600 uppercase"
            >
              CANCELAR
            </button>
            <button 
              onClick={handleFinalDelete}
              disabled={isProcessing || (deleteMode === 'version' && !selectedVersionToDelete)}
              className={`flex-1 px-4 py-3 text-[11px] font-black text-white rounded-xl transition-all ${deleteMode === 'document' ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-600 hover:bg-orange-700'} disabled:opacity-50 uppercase`}
            >
              {isProcessing ? 'PROCESANDO...' : 'CONFIRMAR'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};