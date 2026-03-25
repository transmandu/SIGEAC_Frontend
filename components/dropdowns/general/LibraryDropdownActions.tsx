'use client';

import { useState, useRef } from "react";
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
  Eye,
  History,
  UploadCloud,
  X,
  User,
  FileText,
  CalendarDays
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

  // 🔥 ESTADOS PARA VERSIONES
  const [historyOpen, setHistoryOpen] = useState(false);
  const [versionList, setVersionList] = useState<any[]>([]);
  const [uploadingVersion, setUploadingVersion] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [changeLog, setChangeLog] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 🔥 NUEVOS ESTADOS DE VIGENCIA PARA LA VERSIÓN
  const [emissionDate, setEmissionDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [requiresExpiry, setRequiresExpiry] = useState<boolean>(doc.requires_expiry || false);
  const [expirationDate, setExpirationDate] = useState<string>(doc.expiration_date ? doc.expiration_date.split(' ')[0] : "");

  // 📜 Obtener historial de versiones
  const handleFetchVersions = async () => {
    if (!company) return;
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/${company}/library/documents/${doc.id}/versions`);
      setVersionList(response.data.data.versions || []);
      setHistoryOpen(true);
    } catch (error) {
      console.error("Error al obtener historial:", error);
      alert("Error al cargar el historial de versiones.");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 NUEVO: Función para ver una versión antigua del PDF
  const handleViewOldVersion = async (versionId: number) => {
    try {
      const response = await axiosInstance.get(`/${company}/library/versions/${versionId}/view`, {
        responseType: 'blob', // 👈 Indispensable para que Axios procese el binario del PDF
      });
      
      const fileURL = URL.createObjectURL(response.data);
      window.open(fileURL, '_blank'); // Abre en nueva pestaña
    } catch (error) {
      console.error("Error al visualizar versión antigua:", error);
      alert("No se pudo obtener el archivo de esta versión.");
    }
  };

  // 🔄 Subir nueva versión
  const handleUploadVersion = async () => {
    if (!company || !selectedFile) return;
    setUploadingVersion(true);
    
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('change_log', changeLog || 'Actualización de documento.');
    formData.append('department_name', doc.department?.name || 'Biblioteca');
    
    formData.append('emission_date', emissionDate);
    formData.append('requires_expiry', requiresExpiry ? '1' : '0');
    if (requiresExpiry && expirationDate) {
      formData.append('expiration_date', expirationDate);
    }

    try {
      await axiosInstance.post(`/${company}/library/documents/${doc.id}/versions`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert("Nueva versión cargada con éxito.");
      setSelectedFile(null);
      setChangeLog('');
      
      // 🔥 Forzamos la recarga para que la tabla pida los datos nuevos a Laravel
      window.location.reload(); 

    } catch (error) {
      console.error("Error al subir versión:", error);
      alert("No se pudo subir la nueva versión.");
    } finally {
      setUploadingVersion(false);
    }
  };

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

  const handleViewQR = async () => {
    if (!company) return;
    setLoading(true);

    try {
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
        <DropdownMenuContent align="end" className="w-52 bg-white dark:bg-[#1a1c1e] border-slate-200 dark:border-gray-700 text-slate-800 dark:text-white shadow-2xl">
          <DropdownMenuItem onClick={() => { setShareStep('form'); setReason(''); setSharedWith(''); setDuration('24'); setShareDialogOpen(true); }} className="gap-2 cursor-pointer focus:bg-slate-100 dark:focus:bg-gray-800">
            <QrCode className="h-4 w-4 text-blue-500" />
            <span className="text-xs font-medium">Generar acceso QR</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleViewQR} className="gap-2 cursor-pointer focus:bg-slate-100 dark:focus:bg-gray-800">
            <Eye className="h-4 w-4 text-emerald-500" />
            <span className="text-xs font-medium">Visualizar QR</span>
          </DropdownMenuItem>
          <div className="h-px bg-slate-200 dark:bg-gray-700 my-1" />
          <DropdownMenuItem onClick={handleFetchVersions} className="gap-2 cursor-pointer focus:bg-slate-100 dark:focus:bg-gray-800">
            <History className="h-4 w-4 text-purple-500" />
            <span className="text-xs font-medium">Historial de versiones</span>
          </DropdownMenuItem>
          {canManage && (
            <>
              <div className="h-px bg-slate-200 dark:bg-gray-700 my-1" />
              <DropdownMenuItem onClick={() => setDeleteDialogOpen(true)} className="gap-2 cursor-pointer text-red-500 focus:bg-red-500/10 focus:text-red-500">
                <Trash2 className="h-4 w-4" />
                <span className="text-xs font-bold">Eliminar</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* DIÁLOGOS DE QR Y ELIMINACIÓN PERMANECEN EXACTAMENTE IGUAL */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-[#1a1c1e] border-slate-200 dark:border-gray-800 shadow-2xl p-0 overflow-hidden outline-none animate-in zoom-in-95 duration-200">
          <div className="bg-slate-50 dark:bg-gray-800/40 px-6 py-4 border-b border-slate-200 dark:border-gray-700 flex items-center">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <QrCode className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                {shareStep === 'form' ? 'Generar Acceso QR' : 'Acceso QR'}
              </DialogTitle>
            </div>
          </div>
          <div className="p-6">
            {shareStep === 'form' ? (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">Entregado a</label>
                    <input type="text" placeholder="Ej: Juan Pérez" value={sharedWith} onChange={(e) => setSharedWith(e.target.value)} className="w-full h-11 px-4 border border-slate-300 dark:border-gray-700 rounded-xl bg-white dark:bg-[#1a1c1e] text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-gray-600" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2"><Clock className="h-3.5 w-3.5 text-blue-500" /> Duración</label>
                    <div className="relative">
                      <select value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full h-11 pl-4 pr-10 border border-slate-300 dark:border-gray-700 rounded-xl bg-white dark:bg-[#1a1c1e] text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer appearance-none relative z-10">
                        <option value="24">24 Horas</option>
                        <option value="48">48 Horas</option>
                        <option value="72">72 Horas</option>
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none z-20">
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Razón del compartido *</label>
                    <span className="text-[10px] text-slate-400 dark:text-gray-600 font-bold">{reason.length}/500</span>
                  </div>
                  <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Justificación para auditoría..." className={`w-full text-sm resize-none min-h-[100px] p-4 border border-slate-300 dark:border-gray-700 rounded-xl bg-white dark:bg-[#1a1c1e] text-slate-900 dark:text-white focus:ring-2 outline-none placeholder:text-slate-400 dark:placeholder:text-gray-600 transition-all ${reason.length > 0 && !isReasonValid ? 'border-red-500/50 focus:ring-red-500/50' : 'focus:ring-blue-500'}`} />
                  {!isReasonValid && reason.length > 0 && (
                    <p className="text-[10px] text-red-500/80 flex items-center gap-1 italic font-medium"><AlertCircle className="h-3 w-3" /> Faltan {10 - reason.length} caracteres</p>
                  )}
                </div>
                <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-gray-800">
                  <button type="button" onClick={() => setShareDialogOpen(false)} className="flex-1 px-4 py-3 text-[11px] font-black tracking-widest text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200 uppercase transition-colors">CANCELAR</button>
                  <button disabled={!isReasonValid || loading} onClick={handleGenerateQR} className="flex-1 px-4 py-3 text-[11px] font-black tracking-widest text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-500/20 uppercase transition-all">{loading ? 'GENERANDO...' : 'GENERAR ACCESO QR'}</button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-6 text-center animate-in fade-in zoom-in-95 duration-300">
                <div className="p-5 bg-white rounded-2xl shadow-2xl qr-container border border-slate-200 dark:border-transparent">
                  <QRCodeSVG value={generatedUrl} size={180} level="H" marginSize={4} />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">¡Código QR Activo!</p>
                  <p className="text-[11px] text-slate-500 dark:text-gray-400 px-8 leading-relaxed">Usa este acceso para visualizar el documento de forma segura.</p>
                </div>
                <div className="w-full space-y-3 pb-2">
                  <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-gray-800/50 rounded-xl border border-slate-200 dark:border-gray-700">
                    <input readOnly value={generatedUrl} className="flex-1 h-8 bg-transparent border-none text-[10px] text-slate-700 dark:text-gray-400 outline-none px-2 font-mono truncate" />
                    <Button onClick={copyToClipboard} variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-200 dark:hover:bg-gray-800">
                      {isCopying ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5 text-slate-500 dark:text-gray-400" />}
                    </Button>
                  </div>
                  <button onClick={downloadQRCode} className="w-full py-3 bg-slate-100 dark:bg-gray-800 hover:bg-slate-200 dark:hover:bg-gray-600 text-blue-600 dark:text-blue-400 font-black tracking-widest text-[11px] rounded-xl transition-all flex items-center justify-center gap-2"><Download className="h-4 w-4" /> DESCARGAR IMAGEN QR</button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-white dark:bg-[#1a1c1e] border-slate-200 dark:border-gray-800 text-slate-900 dark:text-white sm:max-w-[400px] rounded-2xl overflow-hidden p-0 outline-none shadow-2xl">
          <div className="p-6">
            <DialogHeader className="space-y-3">
              <DialogTitle className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">¿Eliminar documento?</DialogTitle>
              <DialogDescription className="text-slate-500 dark:text-gray-400 text-sm leading-relaxed">Estás a punto de eliminar <span className="text-slate-900 dark:text-white font-medium">{doc.title}</span>. Esta acción es definitiva.</DialogDescription>
            </DialogHeader>
          </div>
          <div className="px-6 py-4 bg-slate-50 dark:bg-gray-800/40 border-t border-slate-200 dark:border-gray-700 flex justify-end gap-3">
            <button onClick={() => setDeleteDialogOpen(false)} className="px-4 py-2 text-[10px] font-black tracking-widest text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-white uppercase transition-colors">CANCELAR</button>
            <button disabled={loading} onClick={executeDelete} className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-red-500/10 transition-all">{loading ? 'ELIMINANDO...' : 'CONFIRMAR'}</button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 🔥 SIDEBAR / DRAWER CON INPUTS DE FECHA Y VISOR DE VERSIONES */}
      {historyOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30 animate-in fade-in-0 duration-200">
          <div className="w-[480px] h-full bg-white dark:bg-[#141618] border-l border-slate-200 dark:border-gray-800 flex flex-col shadow-2xl animate-in slide-in-from-right-full duration-300">
            
            <div className="px-6 py-4 border-b border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-800/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-purple-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-white">Historial de Versiones</span>
              </div>
              <button onClick={() => setHistoryOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              <div className="p-4 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-gray-800 rounded-xl">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Documento Actual</p>
                <p className="text-xs font-semibold text-slate-800 dark:text-white mt-1 truncate">{doc.title}</p>
              </div>

              {canManage && (
                <div className="p-4 border border-slate-200 dark:border-gray-800 rounded-xl flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <UploadCloud className="h-4 w-4 text-blue-500" />
                    <span className="text-[11px] font-bold text-slate-800 dark:text-white uppercase tracking-wider">Nueva Versión</span>
                  </div>

                  <input type="file" accept=".pdf" ref={fileInputRef} className="hidden" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />

                  {!selectedFile ? (
                    <button onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-slate-200 dark:border-gray-800 rounded-xl h-24 flex flex-col items-center justify-center text-slate-400 hover:text-blue-500 hover:border-blue-500/50 dark:hover:border-blue-400/50 transition-colors">
                      <UploadCloud className="h-6 w-6 mb-1" />
                      <span className="text-xs font-medium">Click para cargar un PDF</span>
                    </button>
                  ) : (
                    <div className="flex items-center justify-between p-3 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/50 rounded-xl">
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="h-4 w-4 text-blue-500 flex-shrink-0" />
                        <span className="text-xs text-slate-700 dark:text-gray-300 truncate">{selectedFile.name}</span>
                      </div>
                      <button onClick={() => setSelectedFile(null)} className="text-slate-400 hover:text-red-500">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5 text-blue-500" /> F. Emisión
                      </label>
                      <input 
                        type="date" 
                        value={emissionDate} 
                        onChange={(e) => setEmissionDate(e.target.value)} 
                        className="w-full h-10 px-3 border border-slate-200 dark:border-gray-800 rounded-xl bg-white dark:bg-[#1a1c1e] text-slate-800 dark:text-white text-xs outline-none focus:ring-1 focus:ring-blue-500 transition-all" 
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Vigencia</label>
                      <div className="grid grid-cols-2 h-10 bg-slate-100 dark:bg-gray-800/50 rounded-xl p-1 border border-slate-200 dark:border-gray-800">
                        <button 
                          onClick={() => setRequiresExpiry(false)} 
                          className={`text-[10px] font-bold rounded-lg transition-all tracking-wider ${!requiresExpiry ? 'bg-white dark:bg-[#1a1c1e] text-slate-800 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-gray-300'}`}
                        >
                          PERM.
                        </button>
                        <button 
                          onClick={() => setRequiresExpiry(true)} 
                          className={`text-[10px] font-bold rounded-lg transition-all tracking-wider ${requiresExpiry ? 'bg-white dark:bg-[#1a1c1e] text-slate-800 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-gray-300'}`}
                        >
                          CON VENC.
                        </button>
                      </div>
                    </div>
                  </div>

                  {requiresExpiry && (
                    <div className="space-y-1.5 animate-in slide-in-from-top-1 duration-200">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5 text-red-500" /> Fecha de Expiración
                      </label>
                      <input 
                        type="date" 
                        value={expirationDate} 
                        onChange={(e) => setExpirationDate(e.target.value)} 
                        className="w-full h-10 px-3 border border-slate-200 dark:border-gray-800 rounded-xl bg-white dark:bg-[#1a1c1e] text-slate-800 dark:text-white text-xs outline-none focus:ring-1 focus:ring-blue-500 transition-all" 
                      />
                    </div>
                  )}

                  <textarea 
                    placeholder="Log de cambios (Ej: Actualización de procedimientos)" 
                    value={changeLog} 
                    onChange={(e) => setChangeLog(e.target.value)} 
                    className="w-full h-16 p-3 text-xs border border-slate-200 dark:border-gray-800 rounded-xl bg-transparent text-slate-800 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none resize-none placeholder:text-slate-400 dark:placeholder:text-gray-600" 
                  />

                  <button 
                    disabled={!selectedFile || (requiresExpiry && !expirationDate) || uploadingVersion} 
                    onClick={handleUploadVersion} 
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black tracking-widest text-[10px] rounded-xl transition-all disabled:opacity-50 uppercase"
                  >
                    {uploadingVersion ? 'Subiendo...' : 'Subir Nueva Versión'}
                  </button>
                </div>
              )}

              <div className="flex flex-col gap-4">
                <span className="text-[11px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Historial</span>
                {versionList.length === 0 ? (
                  <p className="text-xs text-slate-400 dark:text-gray-600 text-center py-4">No hay historial registrado.</p>
                ) : (
                  <div className="flex flex-col border border-slate-200 dark:border-gray-800 rounded-xl divide-y divide-slate-200 dark:divide-gray-800">
                    {versionList.map((v) => (
                      <div key={v.id} className="p-4 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold uppercase text-slate-800 dark:text-white tracking-widest bg-slate-100 dark:bg-white/[0.04] px-2 py-0.5 rounded-full border border-slate-200 dark:border-gray-800">
                            {v.version_number}
                          </span>
                          <div className="flex items-center gap-1 text-slate-400 dark:text-gray-500 text-[10px] font-medium">
                            <Clock className="h-3 w-3" />
                            {new Date(v.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-gray-300 leading-relaxed font-normal">{v.change_log}</p>
                        
                        <div className="flex items-center justify-between mt-1">
                          <div className="flex items-center gap-1.5">
                            <User className="h-3 w-3 text-slate-400" />
                            <span className="text-[10px] text-slate-500 dark:text-gray-500 font-medium">
                              {v.employee?.first_name ? `${v.employee.first_name} ${v.employee.last_name || ''}` : 'Admin Sistema'}
                            </span>
                          </div>

                          {/* 🔥 BOTÓN PARA VISUALIZAR VERSIÓN ANTIGUA */}
                          <button 
                            onClick={() => handleViewOldVersion(v.id)}
                            className="flex items-center gap-1 h-7 px-2 border border-slate-200 dark:border-gray-800 hover:bg-slate-100 dark:hover:bg-gray-800/80 rounded-lg text-slate-600 dark:text-gray-400 transition-colors"
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
      )}
    </>
  );
};