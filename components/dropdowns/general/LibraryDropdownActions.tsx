'use client';

import { useState } from "react";
import { useParams } from "next/navigation";
import { 
  MoreVertical, 
  Trash2, 
  QrCode, 
  Copy, 
  Check, 
  Download, 
  Clock, 
  ChevronDown,
  AlertCircle,
  Eye
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import axiosInstance from "@/lib/axios"; 


interface Props {
  doc: any;
  canManage: boolean;
  onDelete: (id: number | string) => Promise<void>;
}

export const LibraryDropdownActions = ({ doc, canManage, onDelete }: Props) => {
  const params = useParams();
  const company = params.company as string;

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [shareStep, setShareStep] = useState<'form' | 'qr'>('form');
  const [reason, setReason] = useState('');
  const [sharedWith, setSharedWith] = useState('');
  const [duration, setDuration] = useState('24');
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [isCopying, setIsCopying] = useState(false);

  const executeDelete = async () => {
    setLoading(true);
    try {
      await onDelete(doc.id);
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error al eliminar:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQR = async () => {
    if (!company) return;
    setLoading(true);
    try {
      const response = await axiosInstance.post(`/${company}/library/documents/${doc.id}/share`, { 
          document_id: doc.id,
          reason: reason, 
          shared_with_name: sharedWith,
          expires_at: parseInt(duration)
      });

      if (response.data && response.data.share_url) {
        setGeneratedUrl(response.data.share_url); 
        setShareStep('qr'); 
      } else {
        alert("El servidor no devolvió la URL de acceso.");
      }
    } catch (error: any) {
      alert(error.response?.data?.message || "Error al generar el acceso.");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 NUEVA FUNCIÓN ARREGLADA: Busca el último QR activo en Laravel
  const handleViewQR = async () => {
    if (!company) return;
    setLoading(true);

    try {
      // 🛰️ Preguntamos a Laravel si este documento tiene un QR activo y vigente
      const response = await axiosInstance.get(`/${company}/library/documents/${doc.id}/active-share`);

      if (response.data && response.data.share_url) {
        setGeneratedUrl(response.data.share_url);
        setShareStep('qr');
        setShareDialogOpen(true);
      } else {
        alert("No hay ningún QR activo o vigente para este documento.");
      }
    } catch (error: any) {
      alert(error.response?.data?.message || "No se encontró un QR activo para este documento.");
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = () => {
    const svg = document.querySelector(".qr-container svg") as SVGElement;
    if (!svg) return;
    const canvas = document.createElement("canvas");
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvasContext = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = 1000; 
      canvas.height = 1000;
      canvasContext?.drawImage(img, 0, 0, 1000, 1000);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `QR-${doc.title || 'documento'}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedUrl);
    setIsCopying(true);
    setTimeout(() => setIsCopying(false), 2000);
  };

  const isReasonValid = reason.trim().length >= 10;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-gray-800 rounded-lg transition-all outline-none">
            <MoreVertical className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52 bg-[#1a1c1e] border-gray-700 text-white shadow-2xl">
          
          <DropdownMenuItem 
            onClick={() => {
                setShareStep('form'); setReason(''); setSharedWith(''); setDuration('24'); setShareDialogOpen(true);
            }} 
            className="gap-2 cursor-pointer focus:bg-gray-800 focus:text-white"
          >
            <QrCode className="h-4 w-4 text-blue-500" />
            <span className="text-xs font-medium">Generar acceso QR</span>
          </DropdownMenuItem>

          {/* OPCIÓN PARA VISUALIZAR EL QR YA EXISTENTE */}
          <DropdownMenuItem 
            onClick={handleViewQR} 
            className="gap-2 cursor-pointer focus:bg-gray-800 focus:text-white"
          >
            <Eye className="h-4 w-4 text-emerald-500" />
            <span className="text-xs font-medium">Visualizar QR</span>
          </DropdownMenuItem>

          {canManage && (
            <>
              <div className="h-px bg-gray-700 my-1" />
              <DropdownMenuItem 
                onClick={() => setDeleteDialogOpen(true)} 
                className="gap-2 cursor-pointer text-red-500 focus:bg-red-500/10 focus:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
                <span className="text-xs font-bold">Eliminar</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-md bg-[#1a1c1e] border-gray-800 shadow-2xl p-0 overflow-hidden outline-none animate-in zoom-in-95 duration-200">
          <div className="bg-gray-800/40 px-6 py-4 border-b border-gray-700 flex items-center">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-900/30 rounded-lg">
                <QrCode className="h-5 w-5 text-blue-400" />
              </div>
              <DialogTitle className="text-lg font-bold text-white tracking-tight">
                {shareStep === 'form' ? 'Generar Acceso QR' : 'Acceso QR'}
              </DialogTitle>
            </div>
          </div>

          <div className="p-6">
            {shareStep === 'form' ? (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                      Entregado a
                    </label>
                    <input 
                      type="text"
                      placeholder="Ej: Juan Pérez" 
                      value={sharedWith}
                      onChange={(e) => setSharedWith(e.target.value)}
                      className="w-full h-11 px-4 border border-gray-700 rounded-xl bg-[#1a1c1e] text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-600"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-blue-500" /> Duración
                    </label>
                    <div className="relative">
                      <select 
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="w-full h-11 pl-4 pr-10 border border-gray-700 rounded-xl bg-[#1a1c1e] text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer appearance-none relative z-10"
                      >
                        <option value="24">24 Horas</option>
                        <option value="48">48 Horas</option>
                        <option value="72">72 Horas</option>
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none z-20">
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-gray-500">Razón del compartido *</label>
                    <span className="text-[10px] text-gray-600 font-bold">{reason.length}/500</span>
                  </div>
                  <textarea 
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Justificación para auditoría..."
                    className={`w-full text-sm resize-none min-h-[100px] p-4 border border-gray-700 rounded-xl bg-[#1a1c1e] text-white focus:ring-2 outline-none placeholder:text-gray-600 transition-all ${
                      reason.length > 0 && !isReasonValid ? 'border-red-500/50 focus:ring-red-500/50' : 'focus:ring-blue-500'
                    }`}
                  />
                  {!isReasonValid && reason.length > 0 && (
                    <p className="text-[10px] text-red-500/80 flex items-center gap-1 italic font-medium">
                      <AlertCircle className="h-3 w-3" /> Faltan {10 - reason.length} caracteres
                    </p>
                  )}
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-800">
                  <button 
                    type="button"
                    onClick={() => setShareDialogOpen(false)} 
                    className="flex-1 px-4 py-3 text-[11px] font-black tracking-widest text-gray-400 hover:text-gray-200 uppercase transition-colors"
                  >
                    CANCELAR
                  </button>
                  <button 
                    disabled={!isReasonValid || loading}
                    onClick={handleGenerateQR}
                    className="flex-1 px-4 py-3 text-[11px] font-black tracking-widest text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-500/20 uppercase transition-all"
                  >
                    {loading ? 'GENERANDO...' : 'GENERAR ACCESO QR'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-6 text-center animate-in fade-in zoom-in-95 duration-300">
                <div className="p-5 bg-white rounded-2xl shadow-2xl qr-container">
                  <QRCodeSVG 
                    value={generatedUrl} 
                    size={180} 
                    level="H" 
                    marginSize={4} 
                  />
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-bold text-white tracking-tight">¡Código QR Activo!</p>
                  <p className="text-[11px] text-gray-500 px-8 leading-relaxed">
                    Usa este acceso para visualizar el documento de forma segura.
                  </p>
                </div>

                <div className="w-full space-y-3 pb-2">
                  <div className="flex items-center gap-2 p-1.5 bg-gray-800/50 rounded-xl border border-gray-700">
                    <input readOnly value={generatedUrl} className="flex-1 h-8 bg-transparent border-none text-[10px] text-gray-400 outline-none px-2" />
                    <Button onClick={copyToClipboard} variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-800">
                      {isCopying ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5 text-gray-500" />}
                    </Button>
                  </div>
                  
                  <button 
                    onClick={downloadQRCode} 
                    className="w-full py-3 bg-gray-800 hover:bg-gray-600 text-blue-400 font-black tracking-widest text-[11px] rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="h-4 w-4" /> DESCARGAR IMAGEN QR
                  </button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-[#1a1c1e] border-gray-800 text-white sm:max-w-[400px] rounded-2xl overflow-hidden p-0 outline-none shadow-2xl">
          <div className="p-6">
            <DialogHeader className="space-y-3">
              <DialogTitle className="text-lg font-bold tracking-tight">¿Eliminar documento?</DialogTitle>
              <DialogDescription className="text-gray-500 text-sm leading-relaxed">
                Estás a punto de eliminar <span className="text-white font-medium">{doc.title}</span>. Esta acción es definitiva.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="px-6 py-4 bg-gray-800/40 border-t border-gray-700 flex justify-end gap-3">
            <button 
                onClick={() => setDeleteDialogOpen(false)} 
                className="px-4 py-2 text-[10px] font-black tracking-widest text-gray-400 hover:text-white uppercase transition-colors"
            >
              CANCELAR
            </button>
            <button 
              disabled={loading} 
              onClick={executeDelete}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-red-500/10 transition-all"
            >
              {loading ? 'ELIMINANDO...' : 'CONFIRMAR'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};