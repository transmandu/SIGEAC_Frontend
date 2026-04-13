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
      {/* Overlay con blur sutil */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" 
        onClick={onClose} 
      />
      
      {/* Panel Lateral */}
      <div className="relative w-full max-w-[480px] h-full bg-white dark:bg-[#141618] border-l border-slate-300 dark:border-gray-800 flex flex-col shadow-2xl animate-in slide-in-from-right duration-500 ease-in-out">
        
        {/* Header: Fondo Blanco para resaltar sobre el cuerpo */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-800/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <History className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-800 dark:text-white">
              Historial de Versiones
            </span>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 text-slate-400 hover:text-red-500 rounded-full hover:bg-red-50 dark:hover:bg-gray-800 transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cuerpo del Panel: Usando bg-slate-50 para contraste */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 bg-slate-50 dark:bg-[#141618] custom-scrollbar">
          
          {/* Info del Documento Actual: Tarjeta blanca sobre fondo slate-50 */}
          <div className="p-4 bg-white dark:bg-white/[0.02] border border-slate-300 dark:border-gray-800 rounded-2xl shadow-sm">
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Documento Seleccionado</p>
            <p className="text-sm font-bold text-slate-800 dark:text-white mt-1 truncate">
              {docTitle || "Sin título definido"}
            </p>
          </div>

          {/* Timeline de Cambios */}
          <div className="flex flex-col gap-4">
            <span className="text-[11px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest">
              Línea de tiempo de cambios
            </span>
            
            {versions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-slate-300 dark:border-gray-800 rounded-2xl bg-white/50">
                <History className="h-10 w-10 text-slate-300 dark:text-gray-800 mb-3" />
                <p className="text-xs text-slate-500 dark:text-gray-600 font-bold uppercase tracking-tighter">No hay historial registrado</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {versions.map((v) => (
                  <div 
                    key={v.id} 
                    className="group p-4 flex flex-col gap-3 bg-white dark:bg-white/[0.01] border border-slate-300 dark:border-gray-800 rounded-2xl hover:border-blue-400 dark:hover:border-blue-500 transition-all shadow-sm hover:shadow-md"
                  >
                    
                    {/* Fila superior: Versión y Estado */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold uppercase text-blue-600 dark:text-blue-400 tracking-widest bg-blue-50 dark:bg-blue-900/30 px-2.5 py-0.5 rounded-full border border-blue-100 dark:border-blue-800">
                          {v.version_number}
                        </span>

                        {v.expiry_status === 'vencido' && (
                          <span className="text-[10px] font-bold bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full uppercase">
                            Vencido
                          </span>
                        )}
                        {v.expiry_status === 'vigente' && (
                          <span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full uppercase">
                            Vigente
                          </span>
                        )}
                        {v.expiry_status === 'no_aplica' && (
                          <span className="text-[10px] font-bold bg-slate-100 dark:bg-gray-800 text-slate-500 dark:text-gray-400 px-2 py-0.5 rounded-full uppercase">
                            Permanente
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-slate-500 dark:text-gray-500 text-[10px] font-bold uppercase tracking-tight">
                        <Clock className="h-3 w-3" />
                        {v.created_at ? new Date(v.created_at).toLocaleDateString() : '--/--/--'}
                      </div>
                    </div>

                    {/* Detalle del cambio */}
                    <div className="bg-slate-50 dark:bg-white/[0.03] p-3 rounded-xl border border-slate-200 dark:border-gray-800/50">
                      <p className="text-[10px] font-bold text-slate-500 dark:text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                         Justificación
                      </p>
                      <p className="text-xs text-slate-700 dark:text-gray-300 font-medium leading-relaxed">
                        {v.change_log || 'Sin descripción de cambios registrados.'}
                      </p>
                    </div>
                    
                    {/* Footer: Usuario y Botón Ver REPARADO */}
                    <div className="flex items-center justify-between mt-1 pt-2 border-t border-slate-100 dark:border-gray-800/50">
                      <div className="flex items-center gap-1.5">
                        <div className="p-1 bg-slate-100 dark:bg-gray-800 rounded-md">
                          <User className="h-3 w-3 text-slate-500" />
                        </div>
                        <span className="text-[10px] text-slate-600 dark:text-gray-500 font-bold uppercase tracking-tight">
                          {v.employee?.first_name ? `${v.employee.first_name} ${v.employee.last_name || ''}` : 'Admin Sistema'}
                        </span>
                      </div>

                      <button 
                        onClick={() => onViewVersion(v.id)} 
                        className="flex items-center gap-1.5 h-8 px-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-blue-700 text-slate-700 dark:text-white border border-slate-300 dark:border-transparent rounded-xl transition-all active:scale-95 shadow-sm"
                      >
                        <Eye className="h-3.5 w-3.5 text-blue-600 dark:text-white" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Ver</span>
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