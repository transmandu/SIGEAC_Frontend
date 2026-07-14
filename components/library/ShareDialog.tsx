"use client";

import { useState, useEffect } from "react";
import {
  QrCode,
  Clock,
  ChevronDown,
  Copy,
  Download,
  List,
  Plus,
  History,
  Eye,
  ArrowLeft,
  Send,
  CheckCircle2,
  Share2,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useTourContext } from "@/components/tour/TourProvider";
import { bibliotecaShareSteps } from "@/components/tour/steps/biblioteca/biblioteca-share";

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  doc: any;
  company: string;
  isDipDirector: boolean;
}

type Tab = "form" | "active";

export default function ShareDialog({
  isOpen,
  onClose,
  doc,
  company,
  isDipDirector,
}: ShareDialogProps) {
  const [activeTab, setActiveTab] = useState<Tab>("form");

  const [versionId, setVersionId] = useState("");
  const [sharedWithName, setSharedWithName] = useState("");
  const [reason, setReason] = useState("");
  const [duration, setDuration] = useState("24");
  const [customHours, setCustomHours] = useState("");
  const [showCustomDuration, setShowCustomDuration] = useState(false);
  const [readOnly, setReadOnly] = useState(true);
  const [versions, setVersions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [generatedUrl, setGeneratedUrl] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const [activeShares, setActiveShares] = useState<any[]>([]);
  const [loadingShares, setLoadingShares] = useState(false);
  const [selectedShareUrl, setSelectedShareUrl] = useState<string | null>(null);

  const isReasonValid = reason.trim().length >= 10;

  const { registerTour, unregisterTour } = useTourContext();

  useEffect(() => {
    if (isOpen) {
      registerTour(
        "biblioteca-share",
        "Compartir Documento",
        bibliotecaShareSteps,
      );
    }
    return () => unregisterTour("biblioteca-share");
  }, [isOpen, registerTour, unregisterTour]);

  useEffect(() => {
    if (isOpen && doc?.id) {
      loadVersions();
      loadActiveShares();
      setGeneratedUrl("");
      setConfirmed(false);
      setSelectedShareUrl(null);
      setActiveTab("form");
      setReason("");
      setSharedWithName("");
      setDuration("24");
      setCustomHours("");
      setShowCustomDuration(false);
      setVersionId("");
      setReadOnly(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, doc]);

  const loadVersions = async () => {
    try {
      const res = await axiosInstance.get(
        `/${company}/library/documents/${doc.id}/versions`,
      );
      const data = res.data?.data?.versions || res.data?.data || [];
      const list = Array.isArray(data) ? data : [];
      setVersions(list);
      if (list.length > 0) {
        const sorted = [...list].sort((a: any, b: any) => b.id - a.id);
        setVersionId(sorted[0].id.toString());
      }
    } catch {
      setVersions([]);
    }
  };

  const loadActiveShares = async () => {
    setLoadingShares(true);
    try {
      const response = await axiosInstance.get(
        `/${company}/library/documents/${doc.id}/active-share`,
      );
      const data = response.data;
      if (Array.isArray(data)) {
        setActiveShares(data);
      } else if (data?.share_url) {
        setActiveShares([data]);
      } else {
        setActiveShares([]);
      }
    } catch {
      setActiveShares([]);
    } finally {
      setLoadingShares(false);
    }
  };

  const getDurationValue = () => {
    if (showCustomDuration && customHours) {
      return parseInt(customHours, 10);
    }
    return parseInt(duration, 10);
  };

  const handleSubmit = async () => {
    if (!isReasonValid) {
      return toast.error("El motivo debe tener al menos 10 caracteres.");
    }

    const durationValue = getDurationValue();
    if (
      showCustomDuration &&
      (!customHours || durationValue < 24 || durationValue > 168)
    ) {
      return toast.error("La duración debe estar entre 24 y 168 horas.");
    }

    setLoading(true);
    try {
      if (isDipDirector) {
        const response = await axiosInstance.post(
          `/${company}/library/documents/${doc.id}/share`,
          {
            document_id: doc.id,
            version_id: versionId || undefined,
            shared_with_name: sharedWithName.trim() || undefined,
            reason: reason.trim(),
            expires_at: durationValue,
            read_only: readOnly,
          },
        );
        setGeneratedUrl(response.data.share_url);
        toast.success("Acceso generado exitosamente");
      } else {
        await axiosInstance.post(`/${company}/library/share-requests`, {
          document_id: doc.id,
          version_id: versionId || undefined,
          shared_with_name: sharedWithName.trim() || undefined,
          reason: reason.trim(),
          expires_at: durationValue,
          read_only: readOnly,
        });
        setConfirmed(true);
        toast.success(
          "Solicitud enviada correctamente. Pendiente de aprobación.",
        );
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Error al procesar la solicitud",
      );
    } finally {
      setLoading(false);
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
        link.download = `QR_${doc.title || "documento"}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      }
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const handleClose = () => {
    setGeneratedUrl("");
    setConfirmed(false);
    setSelectedShareUrl(null);
    onClose();
  };

  const hasActiveShares = activeShares.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-[#141618] border-slate-300 dark:border-gray-800 shadow-2xl p-0 overflow-hidden outline-none rounded-[2rem]">
        <div className="bg-white dark:bg-gray-800/30 border-b border-slate-200 dark:border-gray-800">
          <div
            className="px-6 py-5 flex items-center gap-2"
            data-tour="biblioteca-share-title"
          >
            <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Share2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <DialogTitle className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-widest">
              Compartir Documento
            </DialogTitle>
          </div>

          <div className="flex px-6 gap-8">
            <button
              data-tour="biblioteca-share-tab-generar"
              onClick={() => {
                setActiveTab("form");
                setGeneratedUrl("");
                setConfirmed(false);
                setSelectedShareUrl(null);
              }}
              className={`pb-3 text-[10px] font-bold tracking-widest uppercase transition-all relative ${activeTab === "form" ? "text-blue-600" : "text-slate-500 hover:text-slate-700 dark:text-gray-400"}`}
            >
              <div className="flex items-center gap-2">
                {isDipDirector ? (
                  <Plus className="h-3.5 w-3.5" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
                {isDipDirector ? "Generar Acceso" : "Solicitar Acceso"}
              </div>
              {activeTab === "form" && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600" />
              )}
            </button>
            {hasActiveShares && (
              <button
                data-tour="biblioteca-share-tab-activos"
                onClick={() => {
                  setActiveTab("active");
                  setSelectedShareUrl(null);
                }}
                className={`pb-3 text-[10px] font-bold tracking-widest uppercase transition-all relative ${activeTab === "active" ? "text-blue-600" : "text-slate-500 hover:text-slate-700 dark:text-gray-400"}`}
              >
                <div className="flex items-center gap-2">
                  <List className="h-3.5 w-3.5" />
                  Accesos Activos
                </div>
                {activeTab === "active" && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600" />
                )}
              </button>
            )}
          </div>
        </div>

        <div className="p-6 bg-slate-50 dark:bg-[#141618] max-h-[65vh] overflow-y-auto custom-scrollbar">
          {activeTab === "active" ? (
            <div className="space-y-4 animate-in fade-in duration-300">
              {selectedShareUrl ? (
                <div className="flex flex-col items-center animate-in slide-in-from-right-4 duration-300 py-2">
                  <button
                    onClick={() => setSelectedShareUrl(null)}
                    className="self-start text-[10px] font-bold text-blue-600 mb-5 flex items-center gap-1 hover:underline uppercase tracking-widest"
                  >
                    <ArrowLeft className="h-3 w-3" /> Volver al listado
                  </button>
                  <div className="p-4 bg-white rounded-[2rem] shadow-xl border border-slate-200 mb-6">
                    <QRCodeSVG
                      id="qr-gen"
                      value={selectedShareUrl}
                      size={180}
                    />
                  </div>
                  <div className="flex gap-3 w-full">
                    <Button
                      onClick={() => copyToClipboard(selectedShareUrl)}
                      variant="outline"
                      className="flex-1 h-12 text-[10px] font-bold tracking-widest border-slate-300 dark:border-gray-800 rounded-2xl dark:text-white"
                    >
                      <Copy className="h-3.5 w-3.5 mr-2 text-blue-600" /> COPIAR
                      LINK
                    </Button>
                    <Button
                      onClick={downloadQRCode}
                      className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white border border-transparent text-[10px] font-bold tracking-widest rounded-2xl shadow-lg shadow-blue-500/20"
                    >
                      <Download className="h-3.5 w-3.5 mr-2 text-white" />{" "}
                      DESCARGAR
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {loadingShares ? (
                    <div className="py-16 text-center text-[10px] animate-pulse font-bold text-slate-500 uppercase tracking-widest">
                      Consultando accesos...
                    </div>
                  ) : activeShares.length === 0 ? (
                    <div className="py-16 text-center space-y-3 border-2 border-dashed border-slate-300 dark:border-gray-800 rounded-[2rem] bg-white/50 dark:bg-white/[0.01]">
                      <QrCode className="h-10 w-10 text-slate-300 dark:text-gray-700 mx-auto" />
                      <p className="text-[10px] font-bold text-slate-500 dark:text-gray-500 uppercase tracking-widest">
                        Sin accesos vigentes
                      </p>
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
                            <span className="text-[9px] font-bold text-slate-500 dark:text-gray-500 uppercase tracking-widest mb-1">
                              Entregado a:
                            </span>
                            <span className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-tight">
                              {share.shared_with_name}
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1.5 text-[9px] font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-full uppercase border border-blue-100 dark:border-blue-800/50">
                              <History className="h-3 w-3" />
                              {share.version?.version_label ||
                                share.version?.version_number ||
                                "ACTUAL"}
                            </span>
                            <span className="flex items-center gap-1.5 text-[9px] text-slate-600 dark:text-gray-400 font-bold uppercase tracking-tight">
                              <Clock className="h-3.5 w-3.5 text-blue-500" />
                              {share.expires_at
                                ? format(
                                    new Date(share.expires_at),
                                    "dd/MM HH:mm",
                                    { locale: es },
                                  )
                                : "--/--"}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          <div className="p-2 bg-slate-50 dark:bg-gray-800 rounded-xl group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-colors">
                            <Eye className="h-4 w-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                          </div>
                          <span className="text-[8px] font-bold text-slate-400 group-hover:text-blue-600 uppercase tracking-widest">
                            Ver
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ) : generatedUrl ? (
            <div className="flex flex-col items-center animate-in zoom-in-95 duration-300 py-2">
              <div className="p-4 bg-white rounded-[2rem] shadow-xl border border-slate-200 mb-6">
                <QRCodeSVG id="qr-gen" value={generatedUrl} size={180} />
              </div>
              <div className="w-full space-y-2 mb-6">
                <div className="flex items-center gap-2 bg-white dark:bg-white/[0.02] p-1.5 rounded-2xl border border-slate-300 dark:border-gray-800 shadow-sm">
                  <div className="flex-1 px-3 text-[10px] font-mono text-blue-600 dark:text-blue-400 truncate">
                    {generatedUrl}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 px-4 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl"
                    onClick={() => copyToClipboard(generatedUrl)}
                  >
                    <Copy className="h-3.5 w-3.5 mr-2" />{" "}
                    <span className="text-[10px] font-bold tracking-widest">
                      COPIAR
                    </span>
                  </Button>
                </div>
              </div>
              <div className="flex gap-3 w-full">
                <Button
                  onClick={downloadQRCode}
                  className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white border border-transparent text-[11px] font-bold tracking-widest rounded-2xl shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                >
                  <Download className="h-4 w-4 mr-2 text-white" /> DESCARGAR QR
                </Button>
                <Button
                  onClick={() => {
                    setGeneratedUrl("");
                    setReason("");
                    setSharedWithName("");
                  }}
                  variant="outline"
                  className="flex-1 h-12 text-[10px] font-bold tracking-widest border-slate-300 dark:border-gray-800 rounded-2xl dark:text-white"
                >
                  <Plus className="h-3.5 w-3.5 mr-2" /> GENERAR OTRO
                </Button>
              </div>
            </div>
          ) : confirmed ? (
            <div className="flex flex-col items-center py-12 animate-in zoom-in-95 duration-300">
              <div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-full mb-6">
                <Send className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight mb-2">
                Solicitud Enviada
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center mb-8 max-w-[280px]">
                Tu solicitud ha sido enviada al Director DIP para aprobación.
                Recibirás una notificación cuando sea revisada.
              </p>
              <Button
                onClick={handleClose}
                className="h-11 px-8 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold tracking-widest rounded-2xl shadow-lg shadow-blue-500/20"
              >
                CERRAR
              </Button>
            </div>
          ) : (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="flex items-end gap-4">
                <div
                  className="flex-1 space-y-2"
                  data-tour="biblioteca-share-version"
                >
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400 ml-1">
                    Versión
                  </label>
                  {versions.length <= 1 ? (
                    <div className="w-full h-11 px-4 border border-slate-300 dark:border-gray-800 rounded-2xl bg-white dark:bg-white/[0.02] text-sm font-medium flex items-center text-slate-700 dark:text-slate-300 shadow-sm">
                      {versions[0]?.version_label ||
                        versions[0]?.version_number ||
                        "Última versión"}
                    </div>
                  ) : (
                    <div className="relative">
                      <select
                        value={versionId}
                        onChange={(e) => setVersionId(e.target.value)}
                        className="w-full h-11 px-4 border border-slate-300 dark:border-gray-800 rounded-2xl bg-white dark:bg-white/[0.02] text-slate-800 dark:text-white text-sm font-medium appearance-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all pr-10 cursor-pointer outline-none shadow-sm"
                      >
                        {versions
                          .sort((a: any, b: any) => b.id - a.id)
                          .map((v: any) => (
                            <option
                              key={v.id}
                              value={v.id}
                              className="bg-white dark:bg-[#1a1c1e]"
                            >
                              {v.version_label || v.version_number}
                            </option>
                          ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    </div>
                  )}
                </div>

                <div
                  className="flex-1 space-y-2"
                  data-tour="biblioteca-share-duracion"
                >
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400 ml-1 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Duración
                  </label>
                  <div className="relative">
                    <select
                      value={showCustomDuration ? "custom" : duration}
                      onChange={(e) => {
                        if (e.target.value === "custom") {
                          setShowCustomDuration(true);
                          setCustomHours("");
                        } else {
                          setShowCustomDuration(false);
                          setDuration(e.target.value);
                        }
                      }}
                      className="w-full h-11 px-4 border border-slate-300 dark:border-gray-800 rounded-2xl bg-white dark:bg-white/[0.02] text-slate-800 dark:text-white text-sm font-medium appearance-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all pr-10 cursor-pointer outline-none shadow-sm"
                    >
                      <option value="24" className="bg-white dark:bg-[#1a1c1e]">
                        24 horas
                      </option>
                      <option value="48" className="bg-white dark:bg-[#1a1c1e]">
                        48 horas
                      </option>
                      <option value="72" className="bg-white dark:bg-[#1a1c1e]">
                        72 horas
                      </option>
                      <option
                        value="168"
                        className="bg-white dark:bg-[#1a1c1e]"
                      >
                        1 semana
                      </option>
                      <option
                        value="custom"
                        className="bg-white dark:bg-[#1a1c1e]"
                      >
                        Personalizado
                      </option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  </div>
                  {showCustomDuration && (
                    <div className="mt-2">
                      <input
                        type="number"
                        min={24}
                        max={168}
                        placeholder="Horas (24-168)"
                        value={customHours}
                        onChange={(e) => setCustomHours(e.target.value)}
                        className="w-full h-11 px-4 border border-slate-300 dark:border-gray-800 rounded-2xl bg-white dark:bg-white/[0.02] text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm transition-all dark:text-white placeholder:text-slate-400"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div
                className="space-y-2"
                data-tour="biblioteca-share-destinatario"
              >
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400 ml-1">
                  Destinatario{" "}
                  <span className="text-[9px] font-normal normal-case tracking-normal text-slate-400">
                    (opcional)
                  </span>
                </label>
                <input
                  type="text"
                  value={sharedWithName}
                  onChange={(e) => setSharedWithName(e.target.value)}
                  placeholder="Nombre de la persona o área que recibirá el enlace"
                  className="w-full h-11 px-4 border border-slate-300 dark:border-gray-800 rounded-2xl bg-white dark:bg-white/[0.02] text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm transition-all dark:text-white placeholder:text-slate-400"
                  maxLength={255}
                />
              </div>

              <div className="space-y-2" data-tour="biblioteca-share-motivo">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400 ml-1">
                  Motivo *
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="¿Por qué necesitas compartir este documento? (mín. 10 caracteres)"
                  className="w-full h-24 px-4 py-3 border border-slate-300 dark:border-gray-800 rounded-2xl bg-white dark:bg-white/[0.02] text-sm font-medium resize-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-white outline-none transition-all shadow-sm placeholder:text-slate-400"
                  maxLength={500}
                />
              </div>

              <label
                className="flex items-center gap-3 p-3 bg-white dark:bg-white/[0.02] rounded-2xl border border-slate-300 dark:border-gray-800 cursor-pointer select-none shadow-sm"
                data-tour="biblioteca-share-readonly"
              >
                <input
                  type="checkbox"
                  checked={readOnly}
                  onChange={(e) => setReadOnly(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="text-[12px] font-bold text-slate-700 dark:text-slate-200">
                    Compartir en Solo Lectura
                  </span>
                  <p className="text-[10px] text-slate-400">
                    Si se desmarca, el visor público mostrará un botón de
                    descarga
                  </p>
                </div>
              </label>

              <Button
                data-tour="biblioteca-share-submit"
                disabled={!isReasonValid || loading}
                onClick={handleSubmit}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-[11px] font-bold tracking-widest rounded-2xl shadow-lg shadow-blue-500/20 transition-all active:scale-95"
              >
                {loading
                  ? "PROCESANDO..."
                  : isDipDirector
                    ? "GENERAR ACCESO"
                    : "SOLICITAR COMPARTICIÓN"}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
