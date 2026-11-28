"use client";

import { useState, useEffect } from "react";
import libraryService from "@/lib/libraryService";
import { toast } from "sonner";
import { notifyError } from "@/lib/notify-error";
import { ConfirmDeleteDialog } from "@/components/dialogs/shared/ConfirmDeleteDialog";
import {
  X,
  Loader2,
  FileText,
  CalendarDays,
  History,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Ban,
  QrCode,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import { fieldClass } from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import { EmptyState } from "@/components/misc/EmptyState";
import { TagBadge } from "@/components/misc/TagBadge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useCompanyTimezone } from "@/hooks/general/useCompanyTimezone";
import { formatInstant } from "@/lib/date";

export default function TraceabilityPanel({
  documentId,
  company,
  onClose,
}: any) {
  const timeZone = useCompanyTimezone();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQR, setSelectedQR] = useState<string | null>(null);
  const [isCopying, setIsCopying] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<any | null>(null);

  const formatEmployeeName = (fullName: string) => {
    if (!fullName) return "N/A";
    const index = fullName.indexOf("(");
    if (index !== -1) {
      const name = fullName.substring(0, index).trim();
      const id = fullName.substring(index).trim();
      return (
        <>
          <span className="block truncate">{name}</span>
          <span className="mt-1 block text-xs font-normal text-slate-600 dark:text-slate-400">
            {id}
          </span>
        </>
      );
    }
    return <span className="block truncate">{fullName}</span>;
  };

  const isLinkActive = (expiresAt: string) => {
    return new Date(expiresAt) > new Date();
  };

  const copyToClipboard = async () => {
    if (!selectedQR) return;
    try {
      await navigator.clipboard.writeText(selectedQR);
      setIsCopying(true);
      setTimeout(() => setIsCopying(false), 2000);
    } catch {
      toast.error("No se pudo copiar el enlace");
    }
  };

  const getPublicViewerUrl = (token: string) => {
    const configuredOrigin = process.env.NEXT_PUBLIC_FRONTEND_URL?.replace(
      /\/+$/,
      "",
    );
    const browserOrigin =
      typeof window !== "undefined" ? window.location.origin : "";
    const isConfiguredLocal =
      !!configuredOrigin &&
      (configuredOrigin.includes("localhost") ||
        configuredOrigin.includes("127.0.0.1"));
    const isBrowserLocal =
      !browserOrigin ||
      browserOrigin.includes("localhost") ||
      browserOrigin.includes("127.0.0.1");
    const origin =
      configuredOrigin && (!isConfiguredLocal || isBrowserLocal)
        ? configuredOrigin
        : browserOrigin;

    return `${origin}/acceso_publico/shared-viewer/${company}/${encodeURIComponent(token)}`;
  };

  const openQr = (log: any) => {
    const token = log.full_share_url || log.share_url || log.share_token;
    if (!token) return;
    setSelectedQR(token.startsWith("http") ? token : getPublicViewerUrl(token));
  };

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      setError(null);
      try {
        // El alcance por departamento lo aplica el backend en /trazabilidad; el
        // filtro que había aquí leía campos que el usuario no trae y no filtraba.
        const data = await libraryService.getTrazabilidad(company);

        setLogs(
          documentId
            ? data.filter(
                (l: any) => String(l.document_id) === String(documentId),
              )
            : data,
        );
      } catch (err) {
        console.error("Error cargando el historial:", err);
        setError("No se pudo cargar el historial de compartidos.");
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [documentId, company]);

  const getVersionLabel = (log: any) => {
    if (log.document && log.document.versions) {
      const version = log.document.versions.find(
        (v: any) => String(v.id) === String(log.version_id),
      );
      return version
        ? version.version_label || version.version_number
        : log.current_version;
    }
    return log.current_version || "N/A";
  };

  return (
    <div className="flex h-full w-[min(25rem,100vw)] flex-col border-l border-border/50 bg-background shadow-2xl motion-safe:animate-item-in">
      <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-3 sm:px-6">
        <div
          className="flex items-center gap-2.5"
          data-tour="biblioteca-trace-title"
        >
          <History className="size-4 text-muted-foreground" />
          <div>
            <h3 className="text-[15px] font-semibold leading-tight text-slate-700 dark:text-slate-200">
              Historial
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Documentos compartidos
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar historial"
          className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-muted max-md:size-10"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              Cargando registros...
            </p>
          </div>
        ) : error ? (
          <EmptyState
            tone="error"
            icon={AlertCircle}
            title={error}
            className="py-16"
          />
        ) : logs.length === 0 ? (
          <EmptyState
            icon={History}
            title="Sin registros disponibles"
            className="py-16"
          />
        ) : (
          <div
            className="relative ml-4 space-y-6 border-l border-border pb-6"
            data-tour="biblioteca-trace-timeline"
          >
            {logs.map((log) => {
              const active = isLinkActive(log.expires_at);
              const versionLabel = getVersionLabel(log);

              return (
                <div key={log.id} className="relative pl-7">
                  <div
                    className={`absolute -left-4 top-1 z-10 grid size-8 place-items-center rounded-lg border-2 bg-background ${active ? "border-emerald-500" : "border-slate-300 dark:border-slate-600"}`}
                  >
                    <FileText
                      className={`size-4 ${active ? "text-emerald-500" : "text-slate-400"}`}
                    />
                  </div>

                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => openQr(log)}
                    onKeyDown={(event) => {
                      if (event.target !== event.currentTarget) return;
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        openQr(log);
                      }
                    }}
                    className="cursor-pointer rounded-xl border border-slate-200 bg-white p-4 outline-hidden motion-safe:transition-colors hover:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/40 dark:border-slate-700/60 dark:bg-slate-900/60"
                    data-tour="biblioteca-trace-qr-btn"
                  >
                    <div className="mb-3 flex items-center justify-between gap-2 border-b border-border/60 pb-3">
                      {active ? (
                        <TagBadge tone="emerald" icon={CheckCircle2}>
                          Activo
                        </TagBadge>
                      ) : log.is_revoked ? (
                        <TagBadge tone="slate" icon={Ban}>
                          Deshabilitado
                        </TagBadge>
                      ) : (
                        <TagBadge tone="slate" icon={AlertCircle}>
                          Expirado
                        </TagBadge>
                      )}

                      <span className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                        <CalendarDays className="size-3.5" />
                        {formatInstant(log.created_at, timeZone, "date")}
                      </span>
                    </div>

                    {log.document_title && (
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <p className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-700 dark:text-slate-200">
                          {log.document_title}
                        </p>
                        {versionLabel !== "N/A" && (
                          <TagBadge tone="blue" className="shrink-0">
                            {versionLabel}
                          </TagBadge>
                        )}
                      </div>
                    )}

                    <div className="mb-3 grid grid-cols-2 gap-3">
                      <div>
                        <p className="mb-1 text-xs text-slate-600 dark:text-slate-400">
                          Generado por
                        </p>
                        <div className="text-[13px] font-medium text-slate-700 dark:text-slate-300">
                          {formatEmployeeName(log.created_by_name)}
                        </div>
                      </div>
                      <div className="border-l border-border/60 pl-3">
                        <p className="mb-1 text-xs text-slate-600 dark:text-slate-400">
                          Asignado a
                        </p>
                        <div className="text-[13px] font-medium text-slate-700 dark:text-slate-300">
                          {formatEmployeeName(
                            log.shared_with_name || "Personal Externo",
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 rounded-lg bg-muted/40 p-3">
                      <MessageSquare className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                      <p className="line-clamp-2 text-[13px] text-slate-700 dark:text-slate-300">
                        &quot;{log.reason || "Sin descripción."}&quot;
                      </p>
                    </div>

                    {active && (
                      <div className="mt-3 flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(event) => {
                            event.stopPropagation();
                            setRevokeTarget(log);
                          }}
                          className="gap-1.5 text-red-600 hover:text-red-600 max-sm:h-10 dark:text-red-400"
                        >
                          <Ban className="size-3.5" /> Deshabilitar
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmDeleteDialog
        open={!!revokeTarget}
        onOpenChange={(open) => !open && setRevokeTarget(null)}
        title="Deshabilitar enlace"
        entityName={
          revokeTarget?.document_title
            ? `el enlace de «${revokeTarget.document_title}»`
            : "el enlace"
        }
        confirmLabel="Deshabilitar"
        warning="Quien lo tenga dejará de poder abrirlo de inmediato. No se puede reactivar: habría que generar uno nuevo."
        onConfirm={async () => {
          try {
            await libraryService.revokeSharedLink(company, revokeTarget.id);
            toast.success("Enlace deshabilitado");
            const now = new Date().toISOString();
            setLogs((prev) =>
              prev.map((l) =>
                l.id === revokeTarget.id ? { ...l, expires_at: now } : l,
              ),
            );
          } catch (error) {
            notifyError(error, { action: "deshabilitar el enlace" });
            throw error;
          }
        }}
      />

      <Dialog open={!!selectedQR} onOpenChange={() => setSelectedQR(null)}>
        <FormDialogContent
          icon={QrCode}
          title="Código QR"
          description="Escanéelo o copie el enlace para abrir el documento."
          lockOutside={false}
          className="z-110! sm:max-w-sm"
        >
          <div className="flex flex-col items-center gap-5">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              {selectedQR && (
                <QRCodeSVG
                  value={selectedQR}
                  size={200}
                  level="H"
                  marginSize={3}
                />
              )}
            </div>

            <div className="flex w-full items-center gap-2">
              <Input
                readOnly
                value={selectedQR || ""}
                aria-label="Enlace"
                className={fieldClass}
                onFocus={(event) => event.currentTarget.select()}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={copyToClipboard}
                aria-label="Copiar enlace"
                className="size-10 shrink-0"
              >
                {isCopying ? (
                  <Check className="size-4 text-emerald-600" />
                ) : (
                  <Copy className="size-4" />
                )}
              </Button>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => setSelectedQR(null)}
              className="w-full"
            >
              Cerrar
            </Button>
          </div>
        </FormDialogContent>
      </Dialog>
    </div>
  );
}
