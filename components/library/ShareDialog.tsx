"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";
import {
  ArrowLeft,
  Ban,
  Check,
  Clock,
  Copy,
  Download,
  Eye,
  Link2,
  List,
  Plus,
  QrCode,
  Send,
  Share2,
} from "lucide-react";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "@/components/dialogs/shared/ConfirmDeleteDialog";
import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import {
  fieldClass,
  onlyInteger,
  selectTriggerClass,
  textareaClass,
} from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import {
  PanelSection,
  PanelStaticLabel,
  SwitchRow,
} from "@/components/forms/PanelSection";
import { LibraryDialogActions } from "@/components/library/LibraryDialogActions";
import { EmptyState } from "@/components/misc/EmptyState";
import FormattedInstant from "@/components/misc/FormattedInstant";
import {
  SegmentedTabs,
  SegmentedTabsList,
  SegmentedTabsTrigger,
} from "@/components/misc/SegmentedTabs";
import { TagBadge } from "@/components/misc/TagBadge";
import { useTourContext } from "@/components/tour/TourProvider";
import { bibliotecaShareSteps } from "@/components/tour/steps/general/biblioteca/biblioteca-share";
import { DialogButton } from "@/components/misc/DialogButton";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useGetDocumentVersions } from "@/hooks/general/archivos/useGetDocumentVersions";
import axiosInstance from "@/lib/axios";
import libraryService from "@/lib/libraryService";
import { notifyError } from "@/lib/notify-error";

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  doc: any;
  company: string;
  isDipDirector: boolean;
}

type Tab = "form" | "active";

const NO_SHARES: any[] = [];

const DURATIONS = [
  { value: "24", label: "24 horas" },
  { value: "48", label: "48 horas" },
  { value: "72", label: "72 horas" },
  { value: "168", label: "1 semana" },
  { value: "custom", label: "Personalizado" },
];

export default function ShareDialog({
  isOpen,
  onClose,
  ...rest
}: ShareDialogProps) {
  const { registerTour, unregisterTour } = useTourContext();

  useEffect(() => {
    if (isOpen) {
      registerTour(
        "biblioteca-share",
        "Compartir Documento",
        bibliotecaShareSteps,
        { onlyVisible: true },
      );
    }
    return () => unregisterTour("biblioteca-share");
  }, [isOpen, registerTour, unregisterTour]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <FormDialogContent
        icon={Share2}
        title="Compartir documento"
        description={rest.doc?.title}
        tourId="biblioteca-share-title"
        lockOutside={false}
        className="sm:max-w-lg"
      >
        {/* Dentro del diálogo: al cerrarlo se desmonta y reabre en el formulario, sin lo anterior. */}
        <ShareBody onClose={onClose} {...rest} />
      </FormDialogContent>
    </Dialog>
  );
}

function QrBlock({
  url,
  title,
  onCopy,
}: {
  url: string;
  title: string;
  onCopy: (url: string) => void;
}) {
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
        link.download = `QR_${title || "documento"}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      }
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <QRCodeSVG id="qr-gen" value={url} size={180} />
      </div>

      <div className="flex w-full items-center gap-2">
        <Input
          readOnly
          value={url}
          aria-label="Enlace"
          className={fieldClass}
          onFocus={(event) => event.currentTarget.select()}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Copiar enlace"
          onClick={() => onCopy(url)}
          className="size-10 shrink-0"
        >
          <Copy className="size-4" />
        </Button>
      </div>

      <Button type="button" onClick={downloadQRCode} className="w-full">
        <Download className="size-4" /> Descargar QR
      </Button>
    </div>
  );
}

function ShareBody({
  onClose,
  doc,
  company,
  isDipDirector,
}: Omit<ShareDialogProps, "isOpen">) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>("form");

  // La versión elegida; si no eligió ninguna, la más reciente.
  const [versionChoice, setVersionId] = useState("");
  const [sharedWithName, setSharedWithName] = useState("");
  const [reason, setReason] = useState("");
  const [duration, setDuration] = useState("24");
  const [customHours, setCustomHours] = useState("");
  const [readOnly, setReadOnly] = useState(true);
  const [loading, setLoading] = useState(false);

  const [generatedUrl, setGeneratedUrl] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [copied, setCopied] = useState(false);

  const [selectedShareUrl, setSelectedShareUrl] = useState<string | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<any | null>(null);

  const showCustomDuration = duration === "custom";
  const durationValue = parseInt(
    showCustomDuration ? customHours : duration,
    10,
  );
  const durationValid =
    !showCustomDuration ||
    (!Number.isNaN(durationValue) &&
      durationValue >= 24 &&
      durationValue <= 168);
  const canSubmit = reason.trim().length >= 10 && durationValid;

  const { versions } = useGetDocumentVersions({
    company,
    documentId: doc?.id,
    action: "cargar las versiones del documento",
  });
  const versionId = versionChoice || versions[0]?.id.toString() || "";

  const { data: activeShares = NO_SHARES, isFetching: loadingShares } =
    useQuery<any[]>({
      queryKey: ["library-active-shares", company, doc?.id],
      queryFn: async () => {
        try {
          const response = await axiosInstance.get(
            `/${company}/library/documents/${doc.id}/active-share`,
          );
          const data = response.data;
          if (Array.isArray(data)) return data;
          return data?.share_url ? [data] : NO_SHARES;
        } catch {
          return NO_SHARES;
        }
      },
      enabled: !!doc?.id,
      staleTime: 0,
      meta: { silent: true },
    });

  const hasActiveShares = activeShares.length > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    const payload = {
      version_id: versionId || undefined,
      shared_with_name: sharedWithName.trim() || undefined,
      reason: reason.trim(),
      expires_at: durationValue,
      read_only: readOnly,
    };

    setLoading(true);
    try {
      if (isDipDirector) {
        const response = await axiosInstance.post(
          `/${company}/library/documents/${doc.id}/share`,
          { document_id: doc.id, ...payload },
        );
        setGeneratedUrl(response.data.share_url);
        toast.success("Acceso generado");
        // Con un acceso nuevo la pestaña «Accesos activos» debe aparecer ya.
        void queryClient.invalidateQueries({
          queryKey: ["library-active-shares", company, doc?.id],
        });
      } else {
        await axiosInstance.post(`/${company}/library/share-requests`, {
          document_id: doc.id,
          ...payload,
        });
        setConfirmed(true);
        toast.success("Solicitud enviada. Queda pendiente de aprobación.");
      }
    } catch (error) {
      notifyError(error, { action: "procesar la solicitud" });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Enlace copiado");
    } catch {
      toast.error("No se pudo copiar el enlace");
    }
  };

  const resetResult = () => {
    setGeneratedUrl("");
    setConfirmed(false);
    setSelectedShareUrl(null);
    setCopied(false);
  };

  const closeRow = (
    <div className="sticky bottom-0 z-10 -mx-4 flex justify-end border-t bg-linear-to-t from-slate-50 to-background px-4 py-3 sm:-mx-6 sm:px-6 sm:py-4 dark:from-slate-900/40 max-sm:[&>button]:w-full">
      <DialogButton tone="secondary" onClick={onClose}>
        Cerrar
      </DialogButton>
    </div>
  );

  return (
    <div className="flex flex-col gap-5">
      {hasActiveShares && (
        <SegmentedTabs
          value={activeTab}
          onValueChange={(value) => {
            setActiveTab(value as Tab);
            resetResult();
          }}
        >
          <SegmentedTabsList size="sm">
            <SegmentedTabsTrigger
              value="form"
              data-tour="biblioteca-share-tab-generar"
            >
              {isDipDirector ? (
                <Plus className="size-3.5" />
              ) : (
                <Send className="size-3.5" />
              )}
              {isDipDirector ? "Generar acceso" : "Solicitar acceso"}
            </SegmentedTabsTrigger>
            <SegmentedTabsTrigger
              value="active"
              data-tour="biblioteca-share-tab-activos"
            >
              <List className="size-3.5" />
              Accesos activos
            </SegmentedTabsTrigger>
          </SegmentedTabsList>
        </SegmentedTabs>
      )}

      {activeTab === "active" ? (
        selectedShareUrl ? (
          <div className="space-y-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setSelectedShareUrl(null)}
              className="-ml-2 gap-1.5"
            >
              <ArrowLeft className="size-4" /> Volver al listado
            </Button>
            <QrBlock
              url={selectedShareUrl}
              title={doc.title}
              onCopy={copyToClipboard}
            />
          </div>
        ) : loadingShares ? (
          <p className="py-12 text-center text-sm text-muted-foreground motion-safe:animate-pulse">
            Consultando accesos...
          </p>
        ) : activeShares.length === 0 ? (
          <EmptyState
            icon={QrCode}
            title="Sin accesos vigentes"
            className="py-10"
          />
        ) : (
          <div className="divide-y divide-border/60 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700/60">
            {activeShares.map((share) => (
              <div
                key={share.id}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <div className="min-w-0 space-y-1.5">
                  <p className="text-sm font-semibold text-slate-700 wrap-anywhere dark:text-slate-200">
                    {share.shared_with_name || "Sin destinatario"}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <TagBadge tone="blue">
                      {share.version?.version_label ||
                        share.version?.version_number ||
                        "Actual"}
                    </TagBadge>
                    <span className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                      <Clock className="size-3.5" />
                      Vence{" "}
                      <FormattedInstant
                        value={share.expires_at}
                        format="dd/MM HH:mm"
                        fallback="--/--"
                      />
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedShareUrl(share.share_url)}
                    className="gap-1.5 max-sm:h-10"
                  >
                    <Eye className="size-4" /> Ver
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setRevokeTarget(share)}
                    className="gap-1.5 text-red-600 hover:text-red-600 max-sm:h-10 dark:text-red-400"
                  >
                    <Ban className="size-4" /> Deshabilitar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : generatedUrl ? (
        <>
          <QrBlock
            url={generatedUrl}
            title={doc.title}
            onCopy={copyToClipboard}
          />
          {copied && (
            <p className="flex items-center justify-center gap-1.5 text-[13px] text-emerald-700 dark:text-emerald-400">
              <Check className="size-4" /> Enlace copiado
            </p>
          )}
          <div className="sticky bottom-0 z-10 -mx-4 flex justify-end gap-3 border-t bg-linear-to-t from-slate-50 to-background px-4 py-3 sm:-mx-6 sm:px-6 sm:py-4 dark:from-slate-900/40 max-sm:flex-col-reverse max-sm:[&>button]:w-full">
            <DialogButton tone="secondary" onClick={onClose}>
              Cerrar
            </DialogButton>
            <DialogButton
              icon={<Plus />}
              onClick={() => {
                resetResult();
                setReason("");
                setSharedWithName("");
              }}
            >
              Generar otro
            </DialogButton>
          </div>
        </>
      ) : confirmed ? (
        <>
          <EmptyState
            icon={Send}
            title="Solicitud enviada"
            description="Se envió al Director DIP para su aprobación. Recibirá una notificación cuando la revise."
            className="py-10"
          />
          {closeRow}
        </>
      ) : (
        <>
          <PanelSection icon={Link2} title="Enlace" compact>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div data-tour="biblioteca-share-version">
                  <PanelStaticLabel>Versión</PanelStaticLabel>
                  {versions.length <= 1 ? (
                    <div className="flex h-10 items-center rounded-lg border border-slate-400/60 px-3 text-sm dark:border-slate-600/60">
                      {versions[0]?.version_label ||
                        versions[0]?.version_number ||
                        "Última versión"}
                    </div>
                  ) : (
                    <Select value={versionId} onValueChange={setVersionId}>
                      <SelectTrigger
                        className={selectTriggerClass}
                        aria-label="Versión"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {versions.map((v) => (
                          <SelectItem key={v.id} value={String(v.id)}>
                            {v.version_label || v.version_number}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div data-tour="biblioteca-share-duracion">
                  <PanelStaticLabel>Duración</PanelStaticLabel>
                  <Select
                    value={duration}
                    onValueChange={(value) => {
                      setDuration(value);
                      if (value === "custom") setCustomHours("");
                    }}
                  >
                    <SelectTrigger
                      className={selectTriggerClass}
                      aria-label="Duración"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DURATIONS.map((d) => (
                        <SelectItem key={d.value} value={d.value}>
                          {d.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {showCustomDuration && (
                    <Input
                      inputMode="numeric"
                      placeholder="Horas (24 a 168)"
                      aria-label="Horas de duración"
                      value={customHours}
                      onChange={(event) =>
                        setCustomHours(onlyInteger(event.target.value))
                      }
                      className={`${fieldClass} mt-2`}
                    />
                  )}
                </div>
              </div>

              <div data-tour="biblioteca-share-destinatario">
                <PanelStaticLabel>Destinatario</PanelStaticLabel>
                <Input
                  value={sharedWithName}
                  onChange={(event) => setSharedWithName(event.target.value)}
                  placeholder="Persona o área que recibirá el enlace (opcional)"
                  maxLength={255}
                  className={fieldClass}
                />
              </div>

              <div data-tour="biblioteca-share-motivo">
                <PanelStaticLabel>Motivo *</PanelStaticLabel>
                <Textarea
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="¿Por qué necesita compartir este documento? (mínimo 10 caracteres)"
                  rows={3}
                  maxLength={500}
                  className={textareaClass}
                />
              </div>

              <div data-tour="biblioteca-share-readonly">
                <SwitchRow
                  id="library-share-readonly"
                  checked={readOnly}
                  onCheckedChange={setReadOnly}
                  label="Compartir en solo lectura"
                  description="Si está apagado, el visor público mostrará un botón de descarga."
                />
              </div>
            </div>
          </PanelSection>

          <LibraryDialogActions
            onCancel={onClose}
            onSubmit={handleSubmit}
            busy={loading}
            busyLabel="Procesando..."
            disabled={!canSubmit}
            submitLabel={isDipDirector ? "Generar acceso" : "Solicitar acceso"}
            submitTourId="biblioteca-share-submit"
          />
        </>
      )}

      <ConfirmDeleteDialog
        open={!!revokeTarget}
        onOpenChange={(open) => !open && setRevokeTarget(null)}
        title="Deshabilitar enlace"
        entityName={
          revokeTarget?.shared_with_name
            ? `el enlace entregado a ${revokeTarget.shared_with_name}`
            : "el enlace"
        }
        confirmLabel="Deshabilitar"
        warning="Quien lo tenga dejará de poder abrirlo de inmediato. No se puede reactivar: habría que generar uno nuevo."
        onConfirm={async () => {
          try {
            await libraryService.revokeSharedLink(company, revokeTarget.id);
            toast.success("Enlace deshabilitado");
            setSelectedShareUrl(null);
            // Sin accesos vigentes la pestaña desaparece: se vuelve al formulario.
            if (activeShares.length <= 1) setActiveTab("form");
            await queryClient.invalidateQueries({
              queryKey: ["library-active-shares", company, doc?.id],
            });
          } catch (error) {
            notifyError(error, { action: "deshabilitar el enlace" });
            throw error;
          }
        }}
      />
    </div>
  );
}
