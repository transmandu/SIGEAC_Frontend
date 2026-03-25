'use client';

import { useState, useEffect } from 'react';
import libraryService from '@/lib/libraryService';
import { 
  History, X, Loader2, FileText, CalendarDays, MessageSquare, 
  CheckCircle2, AlertCircle, Eye, Copy, Check 
} from 'lucide-react';
import { QRCodeSVG } from "qrcode.react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function TraceabilityPanel({ documentId, company, onClose }: any) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQR, setSelectedQR] = useState<string | null>(null);
  const [isCopying, setIsCopying] = useState(false);

  const formatEmployeeName = (fullName: string) => {
    if (!fullName) return 'N/A';
    const index = fullName.indexOf('(');
    if (index !== -1) {
      const name = fullName.substring(0, index).trim();
      const id = fullName.substring(index).trim();
      return (
        <>
          <span className="block truncate">{name}</span>
          <span className="block text-[9px] text-slate-500 font-bold leading-none mt-1">{id}</span>
        </>
      );
    }
    return <span className="block truncate">{fullName}</span>;
  };

  const isLinkActive = (expiresAt: string) => {
    return new Date(expiresAt) > new Date();
  };

  const copyToClipboard = () => {
    if (!selectedQR) return;
    navigator.clipboard.writeText(selectedQR);
    setIsCopying(true);
    setTimeout(() => setIsCopying(false), 2000);
  };

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const data = await libraryService.getTrazabilidad(company);
        const docLogs = documentId 
          ? data.filter((l: any) => String(l.document_id) === String(documentId))
          : data; 
        setLogs(docLogs);
      } catch (error) {
        console.error("Error cargando el historial:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [documentId, company]);

  const handleOpenQR = (log: any) => {
    const tokenOrUrl = log.share_url || log.share_token;

    if (!tokenOrUrl) return;

    if (tokenOrUrl.startsWith('http')) {
      setSelectedQR(tokenOrUrl);
    } else {
      const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';
      const fullUrl = `${frontendUrl}/acceso_publico/shared-viewer/${company}/${tokenOrUrl}`;
      setSelectedQR(fullUrl);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0f1112] border-l border-slate-300 dark:border-gray-800 shadow-2xl w-[400px] animate-in slide-in-from-right duration-300 ease-in-out">
      
      {/* HEADER */}
      <div className="p-6 border-b border-slate-200 dark:border-gray-800 flex justify-between items-center bg-slate-100/50 dark:bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-700 rounded-lg shadow-lg shadow-blue-500/30">
            <History className="h-5 w-5 text-white" />
          </div>
          <div>
            {/* Header se queda intacto como lo tenías */}
            <h3 className="text-sm font-black text-slate-950 dark:text-white uppercase tracking-widest leading-none mb-1">Historial</h3>
            <p className="text-[10px] text-slate-600 dark:text-gray-400 font-bold uppercase tracking-tight italic">Documentos compartidos</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-gray-800 rounded-full transition-colors text-slate-700 dark:text-slate-400">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-[#0a0c0d]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-700" />
            <p className="text-[10px] font-semibold text-slate-600 dark:text-gray-400 uppercase tracking-widest">Cargando registros...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-slate-300 dark:border-gray-800 rounded-3xl bg-white dark:bg-transparent">
            <p className="text-[10px] text-slate-600 font-semibold uppercase px-10">Sin registros de actividad</p>
          </div>
        ) : (
          <div className="relative border-l-2 border-slate-300 dark:border-gray-700 ml-4 space-y-8 pb-6">
            {logs.map((log, index) => {
              const active = isLinkActive(log.expires_at);
              return (
                <div key={index} className="relative pl-8 group">
                  <div className={`absolute -left-[18px] top-1 w-8 h-8 rounded-lg bg-white dark:bg-[#0f1112] border-2 ${active ? 'border-emerald-500' : 'border-slate-400'} z-10 shadow-md flex items-center justify-center p-1.5 ring-4 ring-slate-50 dark:ring-[#0a0c0d]`}>
                    <FileText className={`h-full w-full ${active ? 'text-emerald-500' : 'text-slate-400'}`} strokeWidth={2.5}/>
                  </div>
                  
                  <div 
                    onClick={() => handleOpenQR(log)}
                    className="bg-white dark:bg-white/[0.03] rounded-2xl p-4 border border-slate-300 dark:border-gray-800 shadow-sm transition-all hover:border-blue-400 hover:shadow-md cursor-pointer active:scale-[0.98]"
                  >
                    <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100 dark:border-gray-800/50">
                      <div className="flex items-center gap-2">
                        {active ? (
                          <span className="flex items-center gap-1 text-[9px] font-semibold text-emerald-600 uppercase bg-emerald-100 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="h-2.5 w-2.5" /> Activo
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[9px] font-semibold text-slate-500 uppercase bg-slate-100 dark:bg-slate-500/10 px-2 py-0.5 rounded-full">
                            <AlertCircle className="h-2.5 w-2.5" /> Expirado
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" /> 
                        {new Date(log.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    {log.document_title && (
                      <div className="mb-3">
                        <p className="text-[12px] font-semibold text-blue-800 dark:text-blue-400 uppercase tracking-tight truncate leading-tight">
                          {log.document_title}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div>
                        <p className="text-[8px] text-slate-500 dark:text-gray-500 font-semibold uppercase tracking-widest mb-1">Generado por</p>
                        <div className="text-[11px] font-semibold text-slate-950 dark:text-gray-100 uppercase tracking-tighter leading-tight">
                          {formatEmployeeName(log.created_by_name)}
                        </div>
                      </div>
                      <div className="border-l border-slate-300 dark:border-gray-800 pl-3 relative">
                        <p className="text-[8px] text-slate-500 dark:text-gray-500 font-semibold uppercase tracking-widest mb-1">Asignado a</p>
                        <div className="text-[11px] font-semibold text-slate-950 dark:text-gray-100 uppercase tracking-tighter leading-tight">
                          {formatEmployeeName(log.shared_with_name || 'Personal Externo')}
                        </div>
                        <div className="absolute right-0 bottom-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Eye className="h-4 w-4 text-blue-500" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-100 dark:bg-black/40 p-3 rounded-xl border border-slate-200 dark:border-gray-800 shadow-inner">
                      <div className="flex items-start gap-2">
                        <MessageSquare className="h-3 w-3 text-slate-400 mt-0.5 shrink-0" />
                        <p className="text-[11px] text-slate-800 dark:text-gray-300 font-bold leading-tight italic line-clamp-2">
                          "{log.reason || 'Sin descripción.'}"
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL QR DINÁMICO */}
      <Dialog open={!!selectedQR} onOpenChange={() => setSelectedQR(null)}>
        <DialogContent 
          className={`sm:max-w-[380px] p-0 flex flex-col items-center overflow-hidden shadow-2xl outline-none animate-in zoom-in-95 duration-200 
            sm:!ml-[-440px] sm:!translate-x-0
            !z-[100]
            bg-white dark:bg-[#1a1c1e] border-slate-200 dark:border-gray-800`
          }
        >
          <div className="w-full px-6 py-4 border-b flex items-center justify-center bg-slate-100/50 dark:bg-gray-800/40 border-slate-200 dark:border-gray-700">
            <DialogTitle className="text-slate-900 dark:text-white text-center text-xs font-semibold uppercase tracking-widest">
              Vista del Código QR
            </DialogTitle>
          </div>

          <div className="p-6 flex flex-col items-center w-full space-y-6">
            <div className="p-5 bg-white rounded-2xl shadow-xl border border-slate-200 dark:border-transparent">
              {selectedQR && (
                <QRCodeSVG 
                  value={selectedQR} 
                  size={200} 
                  level="H" 
                  marginSize={3} 
                />
              )}
            </div>

            <div className="space-y-1 text-center">
              <p className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">Acceso Escaneable Activo</p>
              <p className="text-[11px] text-slate-600 dark:text-gray-400 px-4 leading-relaxed font-medium">
                Usa el QR o copia el enlace seguro para compartir el visor externo.
              </p>
            </div>

            <div className="w-full space-y-4 pb-2">
              <div className="flex items-center gap-2 p-1.5 rounded-xl border bg-slate-50 dark:bg-gray-800/50 border-slate-200 dark:border-gray-700">
                <input 
                  readOnly 
                  value={selectedQR || ""} 
                  className="flex-1 h-8 bg-transparent border-none text-[10px] text-slate-700 dark:text-gray-400 outline-none px-2 font-mono truncate" 
                />
                <button 
                  onClick={copyToClipboard} 
                  className="h-8 w-8 p-0 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  {isCopying ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-slate-500 dark:text-gray-400" />
                  )}
                </button>
              </div>

              <button 
                onClick={() => setSelectedQR(null)}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-[11px] uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-blue-500/20"
              >
                CERRAR VISOR
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}