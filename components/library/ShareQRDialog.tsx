'use client';

import { useState, useEffect } from "react";
import { 
  QrCode, Clock, ChevronDown, Copy, 
  Download, List, Plus, History, Eye, ArrowLeft
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
  const [selectedVersionId, setSelectedVersionId] = useState<string>("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [generatedUrl, setGeneratedUrl] = useState("");
  const [selectedShareUrl, setSelectedShareUrl] = useState<string | null>(null);
  const [activeShares, setActiveShares] = useState<any[]>([]);
  const [loadingShares, setLoadingShares] = useState(false);

  const handleDialogChange = (open: boolean) => {
    if (!open) {
      setGeneratedUrl("");
      setSelectedShareUrl(null);
      setSharedWith("");
      setReason("");
      setActiveTab('generate');
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen && doc?.versions?.length > 0) {
      const versionsCopy = [...doc.versions].sort((a, b) => b.id - a.id);
      setSelectedVersionId(versionsCopy[0].id.toString());
    }
  }, [doc, isOpen]);

  useEffect(() => {
    if (activeTab === 'active' && isOpen) {
      fetchActiveShares();
    }
  }, [activeTab, isOpen]);

  const isReasonValid = reason.length >= 10;

  const fetchActiveShares = async () => {
    setLoadingShares(true);
    try {
      const response = await axiosInstance.get(`/${company}/library/documents/${doc.id}/active-share`);
      const data = response.data;
      
      if (Array.isArray(data)) {
        setActiveShares(data);
      } else if (data && data.share_url) {
        setActiveShares([data]);
      } else {
        setActiveShares([]);
      }
    } catch (error) {
      setActiveShares([]);
    } finally {
      setLoadingShares(false);
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("Enlace copiado al portapapeles");
  };

  const downloadQRCode = () => {
    const svg = document.getElementById("qr-gen");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width + 40; 
      canvas.height = img.height + 40;
      if (ctx) {
        ctx.fillStyle = "white"; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 20, 20);
        const link = document.createElement("a");
        link.download = `QR_${doc.title || 'documento'}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      }
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const handleGenerateQR = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.post(`/${company}/library/documents/${doc.id}/share`, {
        document_id: doc.id,
        version_id: selectedVersionId, 
        shared_with_name: sharedWith || 'Público/Externo', 
        expires_at: duration, 
        reason: reason
      });

      setGeneratedUrl(response.data.share_url);
      setSharedWith("");
      setReason("");
      toast.success("Acceso QR generado exitosamente");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al generar el acceso");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogChange}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-[#141618] border-slate-300 dark:border-gray-800 shadow-2xl p-0 overflow-hidden outline-none rounded-[2rem]">
        
        {/* Header con estilo unificado */}
        <div className="bg-white dark:bg-gray-800/30 border-b border-slate-200 dark:border-gray-800">
          <div className="px-6 py-5 flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <QrCode className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <DialogTitle className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-widest">
              Gestión de Accesos QR
            </DialogTitle>
          </div>

          <div className="flex px-6 gap-8">
            {['generate', 'active'].map((tab) => (
              <button 
                key={tab}
                onClick={() => { setActiveTab(tab as any); setGeneratedUrl(""); setSelectedShareUrl(null); }}
                className={`pb-3 text-[10px] font-bold tracking-widest uppercase transition-all relative ${activeTab === tab ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700 dark:text-gray-400'}`}
              >
                <div className="flex items-center gap-2">
                  {tab === 'generate' ? <Plus className="h-3.5 w-3.5" /> : <List className="h-3.5 w-3.5" />}
                  {tab === 'generate' ? 'Generar Nuevo' : 'Accesos Activos'}
                </div>
                {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600" />}
              </button>
            ))}
          </div>
        </div>

        {/* Cuerpo con fondo slate-50 para resaltar tarjetas blancas */}
        <div className="p-6 bg-slate-50 dark:bg-[#141618] max-h-[65vh] overflow-y-auto custom-scrollbar">
          {activeTab === 'generate' ? (
            <div className="space-y-5 animate-in fade-in duration-300">
              {!generatedUrl ? (
                <>
                  <div className="flex items-end gap-4">
                    <div className="flex-1 space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400 ml-1">Entregado a</label>
                      <input 
                        type="text" 
                        value={sharedWith} 
                        onChange={(e) => setSharedWith(e.target.value)} 
                        placeholder="Ej: Auditoría" 
                        className="w-full h-11 px-4 border border-slate-300 dark:border-gray-800 rounded-2xl bg-white dark:bg-white/[0.02] text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm transition-all dark:text-white" 
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400 ml-1 flex items-center gap-1">
                        <History className="h-3 w-3" /> Versión
                      </label>
                      <div className="relative">
                        <select 
                          value={selectedVersionId} 
                          onChange={(e) => setSelectedVersionId(e.target.value)} 
                          className="w-full h-11 px-4 border border-slate-300 dark:border-gray-800 rounded-2xl bg-white dark:bg-white/[0.02] text-slate-800 dark:text-white text-sm font-medium appearance-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all pr-10 cursor-pointer outline-none shadow-sm"
                        >
                          {doc?.versions?.map((v: any) => (
                            <option key={v.id} value={v.id} className="bg-white dark:bg-[#1a1c1e]">
                              Versión {v.version_number}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400 ml-1">Duración del acceso</label>
                    <div className="grid grid-cols-3 gap-3">
                      {['24', '48', '72'].map((h) => (
                        <button key={h} onClick={() => setDuration(h)} className={`h-10 rounded-2xl border text-[10px] font-bold transition-all shadow-sm ${duration === h ? 'bg-blue-600 border-blue-600 text-white shadow-blue-500/20' : 'bg-white dark:bg-white/[0.02] border-slate-300 dark:border-gray-800 text-slate-500 dark:text-gray-400 hover:bg-slate-50'}`}>
                          {h} HORAS
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400 ml-1">Razón / Motivo *</label>
                    <textarea 
                        value={reason} 
                        onChange={(e) => setReason(e.target.value)} 
                        placeholder="Describa el motivo del acceso compartido..." 
                        className="w-full h-24 p-4 border border-slate-300 dark:border-gray-800 rounded-2xl bg-white dark:bg-white/[0.02] text-sm font-medium resize-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-white outline-none transition-all shadow-sm" 
                    />
                  </div>

                  <Button disabled={!isReasonValid || loading} onClick={handleGenerateQR} className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-[11px] font-bold tracking-widest rounded-2xl shadow-lg shadow-blue-500/20 transition-all active:scale-95">
                    {loading ? 'GENERANDO...' : 'GENERAR ACCESO SEGURO'}
                  </Button>
                </>
              ) : (
                <div className="flex flex-col items-center animate-in zoom-in-95 duration-300 py-2">
                  <div className="p-4 bg-white rounded-[2rem] shadow-xl border border-slate-200 mb-6">
                    <QRCodeSVG id="qr-gen" value={generatedUrl} size={180} />
                  </div>
                  <div className="w-full space-y-2 mb-6">
                    <div className="flex items-center gap-2 bg-white dark:bg-white/[0.02] p-1.5 rounded-2xl border border-slate-300 dark:border-gray-800 shadow-sm">
                      <div className="flex-1 px-3 text-[10px] font-mono text-blue-600 dark:text-blue-400 truncate">{generatedUrl}</div>
                      <Button variant="ghost" size="sm" className="h-9 px-4 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl" onClick={() => copyToClipboard(generatedUrl)}>
                        <Copy className="h-3.5 w-3.5 mr-2" /> <span className="text-[10px] font-bold tracking-widest">COPIAR</span>
                      </Button>
                    </div>
                  </div>
                  
                  {/* BOTÓN INVERTIDO: Azul sólido con texto blanco para resaltar */}
                  <Button 
                    onClick={downloadQRCode} 
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white border border-transparent text-[11px] font-bold tracking-widest rounded-2xl shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                  >
                    <Download className="h-4 w-4 mr-2 text-white" /> DESCARGAR CÓDIGO QR
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in duration-300">
              {selectedShareUrl ? (
                <div className="flex flex-col items-center animate-in slide-in-from-right-4 duration-300 py-2">
                  <button onClick={() => setSelectedShareUrl(null)} className="self-start text-[10px] font-bold text-blue-600 mb-5 flex items-center gap-1 hover:underline uppercase tracking-widest">
                    <ArrowLeft className="h-3 w-3" /> Volver al listado
                  </button>
                  <div className="p-4 bg-white rounded-[2rem] shadow-xl border border-slate-200 mb-6">
                    <QRCodeSVG id="qr-gen" value={selectedShareUrl} size={180} />
                  </div>
                  <div className="flex gap-3 w-full">
                    <Button onClick={() => copyToClipboard(selectedShareUrl)} variant="outline" className="flex-1 h-12 text-[10px] font-bold tracking-widest border-slate-300 dark:border-gray-800 rounded-2xl dark:text-white">
                      <Copy className="h-3.5 w-3.5 mr-2 text-blue-600" /> COPIAR LINK
                    </Button>
                    
                    {/* BOTÓN INVERTIDO: Azul sólido con texto blanco para resaltar */}
                    <Button 
                      onClick={downloadQRCode} 
                      className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white border border-transparent text-[10px] font-bold tracking-widest rounded-2xl shadow-lg shadow-blue-500/20"
                    >
                      <Download className="h-3.5 w-3.5 mr-2 text-white" /> DESCARGAR
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {loadingShares ? (
                    <div className="py-16 text-center text-[10px] animate-pulse font-bold text-slate-500 uppercase tracking-widest">Consultando accesos...</div>
                  ) : activeShares.length === 0 ? (
                    <div className="py-16 text-center space-y-3 border-2 border-dashed border-slate-300 dark:border-gray-800 rounded-[2rem] bg-white/50 dark:bg-white/[0.01]">
                      <QrCode className="h-10 w-10 text-slate-300 dark:text-gray-700 mx-auto" />
                      <p className="text-[10px] font-bold text-slate-500 dark:text-gray-500 uppercase tracking-widest">Sin accesos vigentes</p>
                    </div>
                  ) : (
                    activeShares.map((share, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => setSelectedShareUrl(share.share_url)}
                        className="group p-5 bg-white dark:bg-white/[0.01] border border-slate-300 dark:border-gray-800 rounded-2xl hover:border-blue-400 dark:hover:border-blue-500 transition-all cursor-pointer flex items-center justify-between shadow-sm hover:shadow-md"
                      >
                        <div className="space-y-2">
                          <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-slate-500 dark:text-gray-500 uppercase tracking-widest mb-1">Entregado a:</span>
                            <span className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-tight">
                              {share.shared_with_name}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1.5 text-[9px] font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-full uppercase border border-blue-100 dark:border-blue-800/50">
                              <History className="h-3 w-3" />
                              V.{share.version?.version_number || 'ACTUAL'}
                            </span>
                            <span className="flex items-center gap-1.5 text-[9px] text-slate-600 dark:text-gray-400 font-bold uppercase tracking-tight">
                              <Clock className="h-3.5 w-3.5 text-blue-500" /> 
                              {share.expires_at ? format(new Date(share.expires_at), 'dd/MM HH:mm', { locale: es }) : '--/--'}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          <div className="p-2 bg-slate-50 dark:bg-gray-800 rounded-xl group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-colors">
                            <Eye className="h-4 w-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                          </div>
                          <span className="text-[8px] font-bold text-slate-400 group-hover:text-blue-600 uppercase tracking-widest">Ver</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};