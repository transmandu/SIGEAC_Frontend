'use client';

import { useState, useEffect } from "react";
import { 
  QrCode, Clock, ChevronDown, AlertCircle, Copy, 
  Download, Check, List, Plus, ExternalLink, Calendar
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface ShareProps {
  isOpen: boolean;
  onClose: () => void;
  doc: any;
  company: string;
}

export const ShareQRDialog = ({ isOpen, onClose, doc, company }: ShareProps) => {
  const [activeTab, setActiveTab] = useState<'generate' | 'active'>('generate');
  const [sharedWith, setSharedWith] = useState("");
  const [duration, setDuration] = useState("24");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState("");
  const [activeShares, setActiveShares] = useState<any[]>([]);
  const [loadingShares, setLoadingShares] = useState(false);

  const isReasonValid = reason.length >= 10;

  // Cargar accesos existentes al cambiar a la pestaña "Activos"
  useEffect(() => {
    if (activeTab === 'active' && isOpen) {
      fetchActiveShares();
    }
  }, [activeTab, isOpen]);

  const fetchActiveShares = async () => {
    setLoadingShares(true);
    try {
      const response = await axiosInstance.get(`/${company}/library/documents/${doc.id}/shares`);
      setActiveShares(response.data.data || []);
    } catch (error) {
      toast.error("Error al cargar accesos activos");
    } finally {
      setLoadingShares(false);
    }
  };

  const handleGenerateQR = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.post(`/${company}/library/documents/${doc.id}/share`, {
        shared_with: sharedWith || 'Público/Externo',
        duration_hours: duration,
        reason: reason
      });
      setGeneratedUrl(response.data.share_url);
      toast.success("Acceso QR generado");
      // Opcional: Podríamos saltar a una vista de "éxito" o simplemente mostrar el URL
    } catch (error) {
      toast.error("Error al generar el acceso");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("Enlace copiado");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-[#1a1c1e] border-slate-200 dark:border-gray-800 shadow-2xl p-0 overflow-hidden outline-none transition-all">
        
        {/* HEADER CON TABS */}
        <div className="bg-slate-50 dark:bg-gray-800/40 border-b border-slate-200 dark:border-gray-700">
          <div className="px-6 py-4 flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <QrCode className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <DialogTitle className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-tight">
              Gestión de Accesos QR
            </DialogTitle>
          </div>

          {/* SELECTOR DE PESTAÑAS */}
          <div className="flex px-6 gap-6">
            <button 
              onClick={() => { setActiveTab('generate'); setGeneratedUrl(""); }}
              className={`pb-3 text-[11px] font-black tracking-widest uppercase transition-all relative ${activeTab === 'generate' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <div className="flex items-center gap-2"><Plus className="h-3.5 w-3.5" /> Generar Nuevo</div>
              {activeTab === 'generate' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 animate-in slide-in-from-left-full duration-300" />}
            </button>
            <button 
              onClick={() => setActiveTab('active')}
              className={`pb-3 text-[11px] font-black tracking-widest uppercase transition-all relative ${activeTab === 'active' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <div className="flex items-center gap-2"><List className="h-3.5 w-3.5" /> Accesos Activos</div>
              {activeTab === 'active' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 animate-in slide-in-from-left-full duration-300" />}
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'generate' ? (
            /* CONTENIDO: FORMULARIO Y RESULTADO */
            <div className="space-y-5 animate-in fade-in duration-300">
              {!generatedUrl ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Entregado a</label>
                      <input type="text" value={sharedWith} onChange={(e) => setSharedWith(e.target.value)} placeholder="Ej: Auditoría" className="w-full h-10 px-3 border border-slate-200 dark:border-gray-700 rounded-xl bg-white dark:bg-[#1a1c1e] text-xs outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Duración</label>
                      <select value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full h-10 px-3 border border-slate-200 dark:border-gray-700 rounded-xl bg-white dark:bg-[#1a1c1e] text-xs outline-none appearance-none">
                        <option value="24">24 Horas</option>
                        <option value="48">48 Horas</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Razón *</label>
                    <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Mínimo 10 caracteres..." className="w-full h-20 p-3 border border-slate-200 dark:border-gray-700 rounded-xl bg-transparent text-xs resize-none outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <Button disabled={!isReasonValid || loading} onClick={handleGenerateQR} className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-[11px] font-black tracking-widest rounded-xl shadow-lg shadow-blue-500/20">
                    {loading ? 'GENERANDO...' : 'GENERAR ACCESO'}
                  </Button>
                </>
              ) : (
                <div className="flex flex-col items-center space-y-4 animate-in zoom-in-95">
                  <div className="p-4 bg-white rounded-2xl shadow-xl border border-slate-100">
                    <QRCodeSVG value={generatedUrl} size={150} />
                  </div>
                  <div className="w-full p-2 bg-slate-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-slate-300 dark:border-gray-700 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-500 truncate px-2">{generatedUrl}</span>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(generatedUrl)}><Copy className="h-3 w-3" /></Button>
                  </div>
                  <Button onClick={() => setGeneratedUrl("")} variant="outline" className="w-full text-[10px] font-black tracking-widest uppercase">Generar otro</Button>
                </div>
              )}
            </div>
          ) : (
            /* CONTENIDO: LISTA DE ACCESOS ACTIVOS */
            <div className="space-y-4 animate-in fade-in duration-300 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
              {loadingShares ? (
                <div className="py-10 text-center text-slate-400 text-xs animate-pulse font-bold tracking-widest uppercase">Cargando registros...</div>
              ) : activeShares.length === 0 ? (
                <div className="py-10 text-center space-y-2">
                  <QrCode className="h-8 w-8 text-slate-200 mx-auto" />
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">No hay accesos activos</p>
                </div>
              ) : (
                activeShares.map((share) => (
                  <div key={share.id} className="p-3 border border-slate-100 dark:border-gray-800 rounded-xl hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-all group">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-white">{share.shared_with}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded font-black tracking-tighter uppercase">
                            Expira: {format(new Date(share.expires_at), 'dd MMM HH:mm', { locale: es })}
                          </span>
                        </div>
                      </div>
                      <button 
                        onClick={() => copyToClipboard(share.share_url)}
                        className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                        title="Copiar Enlace"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500 italic line-clamp-1">"{share.reason}"</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-slate-50 dark:bg-gray-800/40 border-t border-slate-200 dark:border-gray-700 flex justify-end">
          <button onClick={onClose} className="text-[11px] font-black tracking-widest text-slate-500 hover:text-slate-800 uppercase transition-colors">
            Cerrar Ventana
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};