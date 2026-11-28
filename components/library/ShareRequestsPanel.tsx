"use client";

import { useState, useEffect, useMemo } from "react";
import libraryService from "@/lib/libraryService";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanyTimezone } from "@/hooks/general/useCompanyTimezone";
import { formatInstant } from "@/lib/date";
import {
  X,
  Loader2,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  MessageSquare,
  Eye,
  Copy,
  Check,
  Info,
  CalendarDays,
  ShieldAlert,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import { textareaClass } from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import { PanelSection } from "@/components/forms/PanelSection";
import { EmptyState } from "@/components/misc/EmptyState";
import {
  SegmentedTabs,
  SegmentedTabsList,
  SegmentedTabsTrigger,
} from "@/components/misc/SegmentedTabs";
import { TagBadge } from "@/components/misc/TagBadge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { QRCodeSVG } from "qrcode.react";
import { useTourContext } from "@/components/tour/TourProvider";
import { bibliotecaSolicitudesSteps } from "@/components/tour/steps/general/biblioteca/biblioteca-solicitudes";
import { notifyError } from "@/lib/notify-error";
import { useQuery } from "@tanstack/react-query";
import FormattedInstant from "@/components/misc/FormattedInstant";

const NO_REQUESTS: any[] = [];

interface ShareRequestsPanelProps {
  company: string;
  onClose: () => void;
  onRefresh?: () => void;
}

type FilterTab = "all" | "pending" | "approved" | "rejected";

const EMPTY_LABEL: Record<Exclude<FilterTab, "all">, string> = {
  pending: "pendientes",
  approved: "aprobadas",
  rejected: "rechazadas",
};

/** El enlace aprobado ya venció (por tiempo o porque se deshabilitó). */
const isLinkExpired = (req: any) =>
  !!req.calculated_expires_at &&
  new Date(req.calculated_expires_at).getTime() <= Date.now();

const isReadOnlyAccess = (value: unknown) => {
  return value === true || value === 1 || value === "1";
};

export default function ShareRequestsPanel({
  company,
  onClose,
  onRefresh,
}: ShareRequestsPanelProps) {
  const { user } = useAuth();
  const timeZone = useCompanyTimezone();
  const {
    data: requests = NO_REQUESTS,
    isLoading: loading,
    error: requestsError,
    refetch: fetchRequests,
  } = useQuery<any[]>({
    queryKey: ["library-share-requests", company],
    queryFn: async () => {
      const res = await libraryService.getShareRequests(company);
      return Array.isArray(res) ? res : res.data || [];
    },
    staleTime: 0,
    meta: { silent: true },
  });

  useEffect(() => {
    if (requestsError) {
      console.error("Error al cargar solicitudes:", requestsError);
      notifyError(requestsError, { action: "cargar las solicitudes" });
    }
  }, [requestsError]);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [showQrForRequest, setShowQrForRequest] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<FilterTab>("pending");
  const [selectedDetails, setSelectedDetails] = useState<any>(null);
  const { registerTour, unregisterTour } = useTourContext();

  const filteredRequests = useMemo(() => {
    if (activeTab === "all") return requests;
    return requests.filter((r: any) => r.status === activeTab);
  }, [requests, activeTab]);

  const steps = useMemo(
    () =>
      filteredRequests.length > 0
        ? bibliotecaSolicitudesSteps
        : bibliotecaSolicitudesSteps.filter(
            (s) => s.selector !== '[data-tour="biblioteca-requests-card"]',
          ),
    [filteredRequests.length],
  );

  useEffect(() => {
    registerTour("biblioteca-solicitudes", "Solicitudes de Acceso", steps, {
      onlyVisible: true,
    });
    return () => unregisterTour("biblioteca-solicitudes");
  }, [registerTour, unregisterTour, steps]);

  // Solo el Director DIP aprueba o rechaza; con cualquier DIRECTOR se pintaban
  // botones que el backend rechazaba después con 403.
  const isDipDirector = useMemo(() => {
    if (!user) return false;

    const isSuperUser = user.roles?.some((role: any) =>
      ["SUPERUSER", "ADMIN", "ADMINISTRADOR"].includes(role.name.toUpperCase()),
    );

    if (isSuperUser) return true;

    return (
      user.employee?.some((emp: any) => {
        const isDIP = emp.department?.acronym?.toUpperCase() === "DIP";
        const isDir = emp.job_title?.name?.toUpperCase().includes("DIRECTOR");
        return isDIP && isDir;
      }) ?? false
    );
  }, [user]);

  const counts = useMemo(
    () => ({
      all: requests.length,
      pending: requests.filter((r: any) => r.status === "pending").length,
      approved: requests.filter((r: any) => r.status === "approved").length,
      rejected: requests.filter((r: any) => r.status === "rejected").length,
    }),
    [requests],
  );

  const handleApprove = async (id: number) => {
    setActionLoading(id);
    try {
      const res = await libraryService.approveShareRequest(company, id);
      toast.success("Solicitud aprobada");
      if (res.share_url) {
        setShowQrForRequest(id);
      }
      await fetchRequests();
      onRefresh?.();
    } catch (error: any) {
      notifyError(error, { action: "aprobar" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: number) => {
    if (!rejectReason.trim())
      return toast.error("¡Ops! Debes indicar un motivo de rechazo");
    setActionLoading(id);
    try {
      await libraryService.rejectShareRequest(company, id, rejectReason.trim());
      toast.success("Solicitud rechazada");
      setRejectingId(null);
      setRejectReason("");
      await fetchRequests();
      onRefresh?.();
    } catch (error: any) {
      notifyError(error, { action: "rechazar" });
    } finally {
      setActionLoading(null);
    }
  };

  const downloadQRCode = (url: string, title: string) => {
    const svg = document.querySelector(
      `[data-qr-value="${url}"]`,
    ) as SVGElement;
    // Sin el SVG en pantalla no hay QR que exportar: antes se descargaba un
    // PNG en blanco de 1x1 y el usuario se quedaba con un archivo inservible.
    if (!svg) {
      toast.error(
        "¡Ops! No se pudo generar la imagen del QR. Abre el detalle e inténtalo de nuevo.",
      );
      return;
    }
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
        link.download = `QR_${title.replace(/[^a-zA-Z0-9]/g, "_")}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      }
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: "pending", label: "Pendientes", count: counts.pending },
    { key: "approved", label: "Aprobadas", count: counts.approved },
    { key: "rejected", label: "Rechazadas", count: counts.rejected },
    { key: "all", label: "Todas", count: counts.all },
  ];

  const statusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <TagBadge tone="emerald" icon={CheckCircle2}>
            Aprobada
          </TagBadge>
        );
      case "rejected":
        return (
          <TagBadge tone="rose" icon={XCircle}>
            Rechazada
          </TagBadge>
        );
      default:
        return (
          <TagBadge tone="amber" icon={Clock}>
            Pendiente
          </TagBadge>
        );
    }
  };

  return (
    <>
      <div className="flex h-full w-[min(30rem,100vw)] flex-col border-l border-border/50 bg-background shadow-2xl motion-safe:animate-item-in">
        <div className="flex shrink-0 items-center justify-between border-b bg-muted/30 px-4 py-3 sm:px-6">
          <div
            className="flex items-center gap-2.5"
            data-tour="biblioteca-requests-title"
          >
            <Send className="size-4 text-muted-foreground" />
            <div>
              <h2 className="text-[15px] font-semibold leading-tight text-slate-700 dark:text-slate-200">
                Solicitudes
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Compartición de documentos
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar solicitudes"
            className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-muted max-md:size-10"
            data-tour="biblioteca-requests-close"
          >
            <X className="size-4" />
          </button>
        </div>

        <div
          className="shrink-0 border-b px-4 py-3"
          data-tour="biblioteca-requests-tab-pendientes"
        >
          <SegmentedTabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as FilterTab)}
          >
            <SegmentedTabsList size="sm">
              {tabs.map((tab) => (
                <SegmentedTabsTrigger
                  key={tab.key}
                  value={tab.key}
                  data-tour={`biblioteca-requests-tab-${tab.key}`}
                >
                  {tab.label}
                  <span className="tabular-nums text-muted-foreground">
                    {tab.count}
                  </span>
                </SegmentedTabsTrigger>
              ))}
            </SegmentedTabsList>
          </SegmentedTabs>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="size-8 animate-spin text-primary" />
            </div>
          ) : filteredRequests.length === 0 ? (
            <EmptyState
              icon={Send}
              title={
                activeTab === "all"
                  ? "No hay solicitudes"
                  : `No hay solicitudes ${EMPTY_LABEL[activeTab]}`
              }
              description={
                activeTab === "pending"
                  ? "Los directores pueden solicitar compartir documentos desde el menú de acciones."
                  : undefined
              }
              className="px-6 py-20"
            />
          ) : (
            <div className="space-y-3 p-4">
              {filteredRequests.map((req: any) => (
                <div
                  key={req.id}
                  className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700/60 dark:bg-slate-900/60"
                  data-tour="biblioteca-requests-card"
                >
                  <div className="mb-3 flex items-center justify-between border-b border-border/60 pb-3">
                    {statusBadge(req.status)}
                    <span className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                      <CalendarDays className="size-3.5" />
                      {formatInstant(req.created_at, timeZone, "date")}
                    </span>
                  </div>

                  <div className="mb-3 flex items-start justify-between gap-3">
                    <h3 className="min-w-0 flex-1 text-sm font-semibold text-slate-700 wrap-anywhere dark:text-slate-200">
                      {req.document?.title || req.document_title || "Documento"}
                    </h3>
                    <TagBadge tone="blue" className="shrink-0">
                      {req.version?.version_label ||
                        req.version?.version_number ||
                        "Última"}
                    </TagBadge>
                  </div>

                  <div className="mb-3 grid grid-cols-2 gap-3">
                    <div>
                      <p className="mb-0.5 text-xs text-slate-600 dark:text-slate-400">
                        Solicitado por
                      </p>
                      <p className="text-[13px] font-medium text-slate-700 wrap-anywhere dark:text-slate-300">
                        {req.requested_by_name || "N/A"}
                      </p>
                    </div>
                    <div className="border-l border-border/60 pl-3">
                      <p className="mb-0.5 text-xs text-slate-600 dark:text-slate-400">
                        Destinatario
                      </p>
                      <p className="text-[13px] font-medium text-slate-700 wrap-anywhere dark:text-slate-300">
                        {req.shared_with_name || "Externo"}
                      </p>
                    </div>
                  </div>

                  {req.reason && (
                    <div className="mb-3 flex items-start gap-2 rounded-lg bg-muted/40 p-3">
                      <MessageSquare className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                      <p className="text-[13px] text-slate-700 wrap-anywhere dark:text-slate-300">
                        &ldquo;{req.reason}&rdquo;
                      </p>
                    </div>
                  )}

                  {req.status === "rejected" && req.rejection_reason && (
                    <div className="mb-3 flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/5 p-3">
                      <XCircle className="mt-0.5 size-3.5 shrink-0 text-red-500" />
                      <div>
                        <p className="mb-0.5 text-xs font-semibold text-red-700 dark:text-red-400">
                          Motivo del rechazo
                        </p>
                        <p className="text-[13px] text-red-700 wrap-anywhere dark:text-red-400">
                          &ldquo;{req.rejection_reason}&rdquo;
                        </p>
                      </div>
                    </div>
                  )}

                  {req.shared_link_id &&
                    req.status === "approved" &&
                    isLinkExpired(req) && (
                      <div className="mb-3 flex items-center gap-2 rounded-lg bg-muted/40 p-3 text-[13px] text-slate-600 dark:text-slate-400">
                        <Clock className="size-4 shrink-0" /> El enlace ya no
                        está vigente.
                      </div>
                    )}

                  {req.shared_link_id &&
                    req.status === "approved" &&
                    !isLinkExpired(req) &&
                    req.share_url && (
                      <div className="mb-3 flex items-start gap-4 rounded-lg border border-primary/20 bg-primary/5 p-3">
                        <div
                          className="shrink-0 rounded-lg bg-white p-1.5"
                          data-qr-value={req.share_url}
                        >
                          <QRCodeSVG value={req.share_url} size={72} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="mb-2 text-[13px] font-semibold text-primary">
                            Enlace generado
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                try {
                                  await navigator.clipboard.writeText(
                                    req.share_url,
                                  );
                                  setCopiedUrl(req.share_url);
                                  setTimeout(() => setCopiedUrl(null), 3000);
                                } catch {
                                  toast.error("No se pudo copiar el enlace");
                                }
                              }}
                              className="max-sm:h-10"
                            >
                              {copiedUrl === req.share_url ? (
                                <Check className="size-3.5" />
                              ) : (
                                <Copy className="size-3.5" />
                              )}
                              {copiedUrl === req.share_url
                                ? "Copiado"
                                : "Copiar enlace"}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                downloadQRCode(
                                  req.share_url,
                                  req.document?.title || "documento",
                                )
                              }
                              className="max-sm:h-10"
                            >
                              <Download className="size-3.5" /> Descargar QR
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                  <div className="flex flex-col gap-3">
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedDetails(req)}
                        className="gap-1.5 max-sm:h-10"
                      >
                        <Info className="size-3.5" /> Detalles
                      </Button>
                    </div>

                    {req.status === "pending" && isDipDirector && (
                      <div className="border-t border-border/60 pt-3">
                        {rejectingId === req.id ? (
                          <div className="space-y-2">
                            <Textarea
                              placeholder="Motivo del rechazo..."
                              aria-label="Motivo del rechazo"
                              rows={2}
                              className={textareaClass}
                              value={rejectReason}
                              onChange={(e) => setRejectReason(e.target.value)}
                            />
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  setRejectingId(null);
                                  setRejectReason("");
                                }}
                                className="flex-1"
                              >
                                Cancelar
                              </Button>
                              <Button
                                type="button"
                                variant="destructive"
                                onClick={() => handleReject(req.id)}
                                disabled={actionLoading === req.id}
                                className="flex-1"
                              >
                                {actionLoading === req.id
                                  ? "Rechazando..."
                                  : "Confirmar rechazo"}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              data-tour="biblioteca-requests-aprobar"
                              onClick={() => handleApprove(req.id)}
                              disabled={actionLoading === req.id}
                              className="flex-1 gap-1.5"
                            >
                              {actionLoading === req.id ? (
                                <Loader2 className="size-4 animate-spin" />
                              ) : (
                                <CheckCircle2 className="size-4" />
                              )}
                              Aprobar
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              data-tour="biblioteca-requests-rechazar"
                              onClick={() => setRejectingId(req.id)}
                              className="flex-1 gap-1.5 text-red-600 hover:text-red-600 dark:text-red-400"
                            >
                              <XCircle className="size-4" />
                              Rechazar
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog
        open={!!selectedDetails}
        onOpenChange={() => setSelectedDetails(null)}
      >
        <FormDialogContent
          icon={Info}
          title="Detalles de la solicitud"
          lockOutside={false}
          className="z-100! sm:max-w-xl"
          footer={
            <Button
              type="button"
              variant="outline"
              onClick={() => setSelectedDetails(null)}
            >
              Cerrar
            </Button>
          }
        >
          {selectedDetails && (
            <div className="flex flex-col gap-4">
              <PanelSection icon={FileText} title="Documento" compact>
                <DetailList
                  rows={[
                    [
                      "Título",
                      selectedDetails.document?.title ||
                        selectedDetails.document_title ||
                        "N/A",
                    ],
                    [
                      "Versión",
                      selectedDetails.version?.version_label ||
                        selectedDetails.version?.version_number ||
                        "Última",
                    ],
                    [
                      "Departamento",
                      selectedDetails.document_department_name ||
                        selectedDetails.document?.department?.name ||
                        "N/A",
                    ],
                  ]}
                />
              </PanelSection>

              <PanelSection icon={Send} title="Solicitante" compact>
                <DetailList
                  rows={[
                    [
                      "Solicitado por",
                      selectedDetails.requested_by_name || "N/A",
                    ],
                    [
                      "Departamento solicitante",
                      selectedDetails.requester_department_name || "N/A",
                    ],
                    [
                      "Destinatario",
                      selectedDetails.shared_with_name || "Público / Externo",
                    ],
                  ]}
                />
              </PanelSection>

              <PanelSection
                icon={ShieldAlert}
                title="Seguridad y vigencia"
                compact
              >
                <DetailList
                  rows={[
                    [
                      "Fecha de solicitud",
                      <FormattedInstant
                        key="created"
                        value={selectedDetails.created_at}
                        format="dateTime"
                        fallback="N/A"
                      />,
                    ],
                    [
                      "Válido hasta",
                      <FormattedInstant
                        key="expires"
                        value={selectedDetails.calculated_expires_at}
                        format="dateTime"
                        fallback="Pendiente de aprobación"
                      />,
                    ],
                    [
                      "Nivel de acceso",
                      isReadOnlyAccess(selectedDetails.read_only) ? (
                        <TagBadge key="level" tone="amber" icon={Eye}>
                          Solo lectura
                        </TagBadge>
                      ) : (
                        <TagBadge
                          key="level"
                          tone="emerald"
                          icon={CheckCircle2}
                        >
                          Permite descarga
                        </TagBadge>
                      ),
                    ],
                  ]}
                />
              </PanelSection>

              {selectedDetails.reason && (
                <PanelSection
                  icon={MessageSquare}
                  title="Justificación"
                  compact
                >
                  <p className="text-sm text-slate-700 wrap-anywhere dark:text-slate-300">
                    &ldquo;{selectedDetails.reason}&rdquo;
                  </p>
                </PanelSection>
              )}

              {selectedDetails.rejection_reason && (
                <PanelSection icon={XCircle} title="Motivo del rechazo" compact>
                  <p className="text-sm text-red-700 wrap-anywhere dark:text-red-400">
                    &ldquo;{selectedDetails.rejection_reason}&rdquo;
                  </p>
                </PanelSection>
              )}
            </div>
          )}
        </FormDialogContent>
      </Dialog>
    </>
  );
}

/** Pares etiqueta / valor del detalle de solo lectura, con divisores. */
function DetailList({ rows }: { rows: [string, React.ReactNode][] }) {
  return (
    <dl className="divide-y divide-border/60">
      {rows.map(([label, value]) => (
        <div
          key={label}
          className="flex items-start justify-between gap-4 py-2 first:pt-0 last:pb-0 max-sm:flex-col max-sm:gap-0.5"
        >
          <dt className="shrink-0 text-[13px] text-slate-600 dark:text-slate-400">
            {label}
          </dt>
          <dd className="text-right text-sm font-medium text-slate-700 wrap-anywhere dark:text-slate-200 max-sm:text-left max-sm:text-base">
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
