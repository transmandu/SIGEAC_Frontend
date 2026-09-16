"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import {
  UploadCloud,
  FileText,
  X,
  CalendarDays,
  CheckCircle2,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios";
import { useTourContext } from "@/components/tour/TourProvider";
import { bibliotecaUploadVersionSteps } from "@/components/tour/steps/general/biblioteca/biblioteca-upload-version";

export const UploadVersionDialog = ({
  isOpen,
  onClose,
  doc,
  company,
  onSuccess,
}: any) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [changeLog, setChangeLog] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [versionLabel, setVersionLabel] = useState("");
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const { registerTour, unregisterTour } = useTourContext();

  useEffect(() => {
    if (isOpen) {
      registerTour(
        "biblioteca-upload-version",
        "Subir Nueva Versión",
        bibliotecaUploadVersionSteps,
      );
    }
    return () => unregisterTour("biblioteca-upload-version");
  }, [isOpen, registerTour, unregisterTour]);

  const [manualRequiresExpiry, setManualRequiresExpiry] = useState<
    boolean | null
  >(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // CAMBIO CLAVE: Inicialización reactiva al abrir el diálogo
  useEffect(() => {
    if (isOpen) {
      setSelectedFile(null);
      setChangeLog("");
      setExpirationDate("");
      setVersionLabel("");

      // Calculamos la naturaleza del documento original para inicializar el estado
      if (doc) {
        const status = String(doc?.expiry_status || "")
          .toLowerCase()
          .trim();
        const dbFlag =
          doc?.requires_expiry === 1 ||
          doc?.latest_version?.requires_expiry === 1;
        const isExpiry = status === "vigente" || status === "vencido" || dbFlag;

        setManualRequiresExpiry(isExpiry);
      } else {
        setManualRequiresExpiry(null);
      }
    }
  }, [isOpen, doc]);

  const isOriginalExpiry = useMemo(() => {
    const status = String(doc?.expiry_status || "")
      .toLowerCase()
      .trim();
    const dbFlag =
      doc?.requires_expiry === 1 || doc?.latest_version?.requires_expiry === 1;
    return status === "vigente" || status === "vencido" || dbFlag;
  }, [doc]);

  const requiresExpiry = useMemo(() => {
    if (manualRequiresExpiry !== null) return manualRequiresExpiry;
    return isOriginalExpiry;
  }, [isOriginalExpiry, manualRequiresExpiry]);

  const handleUploadVersion = async () => {
    if (!selectedFile) return toast.error("Debes seleccionar un archivo");
    if (!changeLog.trim())
      return toast.error("La justificación es obligatoria");
    if (requiresExpiry && !expirationDate)
      return toast.error("La fecha de expiración es obligatoria");

    setUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("change_log", changeLog);
    if (versionLabel) formData.append("version_label", versionLabel);
    formData.append("requires_expiry", requiresExpiry ? "1" : "0");
    if (requiresExpiry && expirationDate) {
      formData.append("expiration_date", expirationDate);
    }

    try {
      await axiosInstance.post(
        `/${company}/library/documents/${doc.id}/versions`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      toast.success("Nueva versión cargada exitosamente");
      if (onSuccess) await onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al subir la versión");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-[#1a1c1e] border-slate-300 dark:border-gray-800 shadow-2xl p-0 overflow-hidden outline-hidden">
        <div
          className="bg-white dark:bg-gray-800/40 px-6 py-4 border-b border-slate-200 dark:border-gray-700"
          data-tour="biblioteca-version-title"
        >
          <DialogTitle className="text-base font-bold uppercase text-slate-800 dark:text-white tracking-tight">
            Subir nueva versión
          </DialogTitle>
        </div>

        <div className="p-6 space-y-5 bg-slate-50 dark:bg-[#1a1c1e]/50 max-h-[65vh] overflow-y-auto">
          {/* Info Documento Padre */}
          <div
            className="p-3 bg-white dark:bg-white/2 border border-slate-300 dark:border-gray-800 rounded-xl shadow-xs"
            data-tour="biblioteca-version-documento"
          >
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Documento actual
            </span>
            <p className="text-xs font-bold text-slate-700 dark:text-white mt-0.5 truncate">
              {doc?.title}
            </p>
          </div>

          {/* Selector de Archivo */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400">
              Archivo PDF *
            </label>
            <input
              type="file"
              accept=".pdf,.xlsx,.xls"
              ref={fileInputRef}
              className="hidden"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            />

            <div
              data-tour="biblioteca-version-dropzone"
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const file = e.dataTransfer.files[0];
                const ext = file?.name.split(".").pop()?.toLowerCase();
                if (["pdf", "xlsx", "xls"].includes(ext || "")) {
                  setSelectedFile(file);
                } else {
                  toast.error("Solo se permiten archivos PDF o Excel");
                }
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`relative w-full h-24 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-200
                ${
                  isDragging
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[1.01] shadow-inner"
                    : selectedFile
                      ? "border-green-500 bg-green-50/30 dark:bg-green-900/10 hover:border-blue-400"
                      : "border-slate-300 dark:border-gray-800 bg-white dark:bg-gray-800/40 hover:border-blue-400 hover:bg-slate-100 dark:hover:bg-gray-800 shadow-xs"
                }`}
            >
              <div className="flex flex-col items-center justify-center text-center px-4 pointer-events-none">
                {selectedFile && !isDragging ? (
                  <CheckCircle2 className="h-6 w-6 text-green-500 mb-1" />
                ) : (
                  <UploadCloud
                    className={`h-6 w-6 mb-1 transition-colors ${isDragging ? "text-blue-500" : "text-slate-400"}`}
                  />
                )}
                <p className="text-[11px] font-bold text-slate-600 dark:text-gray-300 uppercase tracking-tighter">
                  {isDragging
                    ? "¡Suéltalo aquí!"
                    : selectedFile
                      ? "Archivo seleccionado"
                      : "Agrega un Nuevo Archivo"}
                </p>
                {selectedFile && !isDragging && (
                  <p className="text-[10px] text-slate-400 truncate max-w-[250px] font-medium">
                    {selectedFile.name}
                  </p>
                )}
              </div>

              {selectedFile && !isDragging && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                  }}
                  className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Control de Vigencia y Fecha */}
          <div
            className="grid grid-cols-2 gap-4 items-end"
            data-tour="biblioteca-version-vigencia"
          >
            <div className="flex flex-col space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400">
                Vigencia
              </label>
              <div className="grid grid-cols-2 h-11 bg-slate-200 dark:bg-gray-800/50 rounded-xl p-1 border border-slate-300 dark:border-gray-800 shadow-xs">
                <button
                  type="button"
                  onClick={() => setManualRequiresExpiry(false)}
                  className={`text-[10px] font-bold rounded-lg transition-all hover:bg-white/50 dark:hover:bg-gray-700/50
                    ${!requiresExpiry ? "bg-white dark:bg-gray-700 text-blue-600 shadow-md" : "text-slate-500"}
                  `}
                >
                  PERM.
                </button>
                <button
                  type="button"
                  onClick={() => setManualRequiresExpiry(true)}
                  className={`text-[10px] font-bold rounded-lg transition-all hover:bg-white/50 dark:hover:bg-gray-700/50
                    ${requiresExpiry ? "bg-white dark:bg-gray-700 text-blue-600 shadow-md" : "text-slate-500"}
                  `}
                >
                  CON VENC.
                </button>
              </div>
            </div>

            {requiresExpiry && (
              <div
                className="flex flex-col space-y-1.5"
                data-tour="biblioteca-version-expiry"
              >
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400 flex items-center gap-2">
                  <CalendarDays className="h-3.5 w-3.5 text-blue-500" /> Nueva
                  Expiración
                </label>
                <input
                  type="date"
                  value={expirationDate}
                  onChange={(e) => setExpirationDate(e.target.value)}
                  className="w-full h-11 px-3 border border-slate-300 dark:border-gray-800 rounded-xl bg-white dark:bg-[#1a1c1e] text-xs text-slate-700 dark:text-white outline-hidden focus:ring-2 focus:ring-blue-500 transition-all shadow-xs"
                />
              </div>
            )}
          </div>

          {/* Justificación */}
          <div
            className="space-y-1.5"
            data-tour="biblioteca-version-justificacion"
          >
            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400">
              Justificación / Log de cambios
            </label>
            <textarea
              placeholder="Ej: Actualización de procedimientos por auditoría"
              value={changeLog}
              onChange={(e) => setChangeLog(e.target.value)}
              className="w-full h-20 p-3 text-xs border border-slate-300 dark:border-gray-800 rounded-xl bg-white dark:bg-transparent text-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden resize-none placeholder:text-slate-400 shadow-xs"
            />
          </div>

          {/* Versión Label */}
          <div className="space-y-1.5" data-tour="biblioteca-version-label">
            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400 flex items-center gap-2">
              <FileText className="h-3.5 w-3.5 text-blue-500" /> Etiqueta de
              Versión
            </label>
            <input
              type="text"
              className="w-full h-11 px-4 border border-slate-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-slate-700 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-hidden transition-all placeholder:text-slate-400 shadow-xs"
              placeholder="Ej. Rev A, Borrador, Final..."
              value={versionLabel}
              onChange={(e) => setVersionLabel(e.target.value)}
              maxLength={100}
            />
          </div>

          {/* Botones de Acción */}
          <div className="flex gap-3 pt-2 border-t border-slate-200 dark:border-gray-800">
            <button
              data-tour="biblioteca-version-cancel"
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-[11px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-white uppercase tracking-widest transition-colors"
            >
              {" "}
              CANCELAR{" "}
            </button>
            <button
              data-tour="biblioteca-version-submit"
              disabled={uploading}
              onClick={handleUploadVersion}
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20 uppercase tracking-widest"
            >
              {uploading ? "Subiendo..." : "SUBIR VERSIÓN"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
