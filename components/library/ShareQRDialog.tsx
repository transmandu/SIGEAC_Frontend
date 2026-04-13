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
      <DialogContent className="sm:max-w-md bg-white dark:bg-[#1a1c1e] border-slate-200 dark:border-gray-800 shadow-2xl p-0 overflow-hidden outline-none">
        
        <div className="bg-slate-50 dark:bg-gray-800/40 border-b border-slate-200 dark:border-gray-700">
          <div className="px-6 py-4 flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <QrCode className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <DialogTitle className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">
              Gestión de Accesos QR
            </DialogTitle>
          </div>

          <div className="flex px-6 gap-6">
            {['generate', 'active'].map((tab) => (
              <button 
                key={tab}
                onClick={() => { setActiveTab(tab as any); setGeneratedUrl(""); setSelectedShareUrl(null); }}
                className={`pb-3 text-[10px] font-black tracking-widest uppercase transition-all relative ${activeTab === tab ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
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

        <div className="p-6 max-h-[65vh] overflow-y-auto custom-scrollbar">
          {activeTab === 'generate' ? (
            <div className="space-y-4 animate-in fade-in duration-300">
              {!generatedUrl ? (
                <>
                  <div className="flex items-end gap-4">
                    <div className="flex-1 space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Entregado a</label>
                      {/* 🎨 CAMBIO: Ajuste de color de fondo para integrar con el modal */}
                      <input 
                        type="text" 
                        value={sharedWith} 
                        onChange={(e) => setSharedWith(e.target.value)} 
                        placeholder="Ej: Auditoría" 
                        className="w-full h-10 px-3 border border-slate-200 dark:border-gray-700 rounded-xl bg-slate-50 dark:bg-[#1a1c1e] text-[11px] outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white" 
                      />
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                        <History className="h-2.5 w-2.5" /> Versión
                      </label>
                      <div className="relative">
                        {/* 🎨 CAMBIO: Ajuste de color de fondo para integrar con el modal */}
                        <select 
                          value={selectedVersionId} 
                          onChange={(e) => setSelectedVersionId(e.target.value)} 
                          className="w-full h-10 px-3 border border-slate-200 dark:border-gray-700 rounded-xl bg-slate-50 dark:bg-[#1a1c1e] text-slate-900 dark:text-white text-[11px] appearance-none focus:ring-2 focus:ring-blue-500 transition-all pr-8 cursor-pointer outline-none"
                        >
                          {doc?.versions?.map((v: any) => (
                            <option key={v.id} value={v.id} className="bg-white dark:bg-[#1a1c1e] text-slate-900 dark:text-white">
                              {v.version_number}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Duración</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['24', '48', '72'].map((h) => (
                        <button key={h} onClick={() => setDuration(h)} className={`h-9 rounded-xl border text-[10px] font-bold transition-all ${duration === h ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'border-slate-200 dark:border-gray-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-gray-800'}`}>{h} HORAS</button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Razón / Motivo *</label>
                    {/* 🎨 CAMBIO: Ajuste de color de fondo para integrar con el modal */}
                    <textarea 
                        value={reason} 
                        onChange={(e) => setReason(e.target.value)} 
                        placeholder="Indique el motivo..." 
                        className="w-full h-16 p-3 border border-slate-200 dark:border-gray-700 rounded-xl bg-slate-50 dark:bg-[#1a1c1e] text-[11px] resize-none focus:ring-2 focus:ring-blue-500 dark:text-white outline-none transition-all" 
                    />
                  </div>

                  <Button disabled={!isReasonValid || loading} onClick={handleGenerateQR} className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-[10px] font-black tracking-widest rounded-xl">
                    {loading ? 'PROCESANDO...' : 'GENERAR ACCESO SEGURO'}
                  </Button>
                </>
              ) : (
                <div className="flex flex-col items-center animate-in zoom-in-95 duration-300 py-1">
                  <div className="p-3 bg-white rounded-xl shadow-lg border border-slate-100 mb-5">
                    <QRCodeSVG id="qr-gen" value={generatedUrl} size={160} />
                  </div>
                  <div className="w-full space-y-1.5 mb-5">
                    <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-gray-800/80 p-1 rounded-xl border border-slate-200">
                      <div className="flex-1 px-3 text-[9px] font-mono text-blue-600 truncate">{generatedUrl}</div>
                      <Button variant="ghost" size="sm" className="h-8 px-2 text-blue-600" onClick={() => copyToClipboard(generatedUrl)}>
                        <Copy className="h-3.5 w-3.5 mr-1" /> <span className="text-[8px] font-bold">COPIAR</span>
                      </Button>
                    </div>
                  </div>
                  <Button onClick={downloadQRCode} className="w-full h-11 bg-blue-600 text-[10px] font-black tracking-widest rounded-xl">
                    <Download className="h-4 w-4 mr-2" /> DESCARGAR CÓDIGO QR
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3 animate-in fade-in duration-300">
              {selectedShareUrl ? (
                <div className="flex flex-col items-center animate-in slide-in-from-right-4 duration-300">
                  <button onClick={() => setSelectedShareUrl(null)} className="self-start text-[9px] font-black text-blue-600 mb-4 flex items-center gap-1 hover:underline uppercase tracking-tighter">
                    <ArrowLeft className="h-3 w-3" /> Volver al listado
                  </button>
                  <div className="p-3 bg-white rounded-xl shadow-lg border border-slate-100 mb-5">
                    <QRCodeSVG id="qr-gen" value={selectedShareUrl} size={160} />
                  </div>
                  <div className="flex gap-2 w-full">
                    <Button onClick={() => copyToClipboard(selectedShareUrl)} variant="outline" className="flex-1 h-10 text-[10px] font-bold border-slate-200 dark:border-gray-700 dark:text-white">
                      <Copy className="h-3.5 w-3.5 mr-2" /> COPIAR LINK
                    </Button>
                    <Button onClick={downloadQRCode} className="flex-1 h-10 bg-blue-600 text-[10px] font-bold">
                      <Download className="h-3.5 w-3.5 mr-2" /> DESCARGAR
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {loadingShares ? (
                    <div className="py-10 text-center text-[10px] animate-pulse font-bold text-slate-400 uppercase">Consultando base de datos...</div>
                  ) : activeShares.length === 0 ? (
                    <div className="py-10 text-center space-y-2 border-2 border-dashed border-slate-100 dark:border-gray-800 rounded-2xl">
                      <QrCode className="h-8 w-8 text-slate-200 mx-auto" />
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sin accesos vigentes</p>
                    </div>
                  ) : (
                    activeShares.map((share, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => setSelectedShareUrl(share.share_url)}
                        className="group p-4 border border-slate-100 dark:border-gray-800 rounded-xl hover:border-blue-200 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all cursor-pointer flex items-center justify-between"
                      >
                        <div className="space-y-1.5">
                          <div className="flex flex-col">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Entregado a:</span>
                            <span className="text-[11px] font-bold text-slate-800 dark:text-white uppercase tracking-tight">
                              {share.shared_with_name}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1 text-[9px] font-black bg-blue-50 dark:bg-blue-900/20 text-blue-600 px-1.5 py-0.5 rounded uppercase border border-blue-100 dark:border-blue-800">
                              <History className="h-2.5 w-2.5" />
                              VERSIÓN {share.version?.version_number || 'ACTUAL'}
                            </span>
                            <span className="flex items-center gap-1 text-[9px] text-slate-500 font-bold uppercase">
                              <Clock className="h-3 w-3 text-blue-500" /> 
                              {share.expires_at ? format(new Date(share.expires_at), 'dd/MM HH:mm', { locale: es }) : '--/--'}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          <Eye className="h-4 w-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                          <span className="text-[7px] font-black text-slate-300 group-hover:text-blue-500 uppercase">Ver</span>
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