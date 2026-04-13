'use client';

import { History, X, Clock, User, Eye } from "lucide-react";

interface Version {
  id: number;
  version_number: number;
  expiry_status: string;
  created_at: string;
  change_log: string;
  employee?: {
    first_name: string;
    last_name?: string;
  };
}

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  versions: Version[];
  docTitle: string;
  onViewVersion: (id: number) => void;
}

export const HistoryPanel = ({ 
  isOpen, 
  onClose, 
  versions, 
  docTitle, 
  onViewVersion 
}: HistoryPanelProps) => {
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end overflow-hidden animate-in fade-in duration-300">
      {/* Overlay: Fondo oscuro con blur */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" 
        onClick={onClose} 
      />
      
      {/* Panel Lateral */}
      <div className="relative w-full max-w-[480px] h-full bg-white dark:bg-[#141618] border-l border-slate-200 dark:border-gray-800 flex flex-col shadow-2xl animate-in slide-in-from-right duration-500 ease-in-out">
        
        {/* Header del Panel */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-800/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-purple-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-white">
              Historial de Versiones
            </span>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Cuerpo del Panel (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar">
          
          {/* Info del Documento Actual */}
          <div className="p-4 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-gray-800 rounded-xl shadow-sm">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Documento Seleccionado</p>
            <p className="text-xs font-semibold text-slate-800 dark:text-white mt-1 truncate">
              {docTitle || "Sin título definido"}
            </p>
          </div>

          {/* Timeline de Cambios */}
          <div className="flex flex-col gap-4">
            <span className="text-[11px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
              Línea de tiempo de cambios
            </span>
            
            {versions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-100 dark:border-gray-800 rounded-2xl">
                <History className="h-8 w-8 text-slate-200 dark:text-gray-800 mb-2" />
                <p className="text-xs text-slate-400 dark:text-gray-600 font-medium">No hay historial registrado.</p>
              </div>
            ) : (
              <div className="flex flex-col border border-slate-200 dark:border-gray-800 rounded-xl divide-y divide-slate-200 dark:divide-gray-800 overflow-hidden shadow-sm bg-white dark:bg-transparent">
                {versions.map((v) => (
                  <div key={v.id} className="p-4 flex flex-col gap-3 hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-all">
                    
                    {/* Fila superior: Versión y Estado */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold uppercase text-slate-800 dark:text-white tracking-widest bg-slate-100 dark:bg-white/[0.04] px-2 py-0.5 rounded-full border border-slate-200 dark:border-gray-800">
                          {v.version_number}
                        </span>

                        {v.expiry_status === 'vencido' && (
                          <span className="text-[10px] font-bold bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full">
                            Vencido
                          </span>
                        )}
                        {v.expiry_status === 'vigente' && (
                          <span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                            Vigente
                          </span>
                        )}
                        {v.expiry_status === 'no_aplica' && (
                          <span className="text-[10px] font-bold bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-400 px-2 py-0.5 rounded-full">
                            Permanente
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-slate-400 dark:text-gray-500 text-[10px] font-medium">
                        <Clock className="h-3 w-3" />
                        {v.created_at ? new Date(v.created_at).toLocaleDateString() : '--/--/--'}
                      </div>
                    </div>

                    {/* Detalle del cambio */}
                    <div className="bg-slate-50 dark:bg-white/[0.01] p-3 rounded-lg border border-slate-100 dark:border-gray-800/50">
                      <p className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider mb-1">Log de Cambios:</p>
                      <p className="text-xs text-slate-700 dark:text-gray-300 font-normal leading-relaxed">
                        {v.change_log || 'Sin descripción de cambios registrados.'}
                      </p>
                    </div>
                    
                    {/* Footer de la tarjeta: Usuario y Botón Ver */}
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-1.5">
                        <User className="h-3 w-3 text-slate-400" />
                        <span className="text-[10px] text-slate-500 dark:text-gray-500 font-medium">
                          {v.employee?.first_name ? `${v.employee.first_name} ${v.employee.last_name || ''}` : 'Admin Sistema'}
                        </span>
                      </div>

                      <button 
                        onClick={() => onViewVersion(v.id)} 
                        className="flex items-center gap-1 h-7 px-3 border border-slate-200 dark:border-gray-800 hover:bg-slate-100 dark:hover:bg-gray-800/80 rounded-lg text-slate-600 dark:text-gray-400 transition-all active:scale-95 shadow-sm"
                      >
                        <Eye className="h-3 w-3" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Ver</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};