"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Copy, Link2, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import { fieldClass } from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import { EmptyState } from "@/components/misc/EmptyState";
import { TagBadge, type TagTone } from "@/components/misc/TagBadge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useCompanyTimezone } from "@/hooks/general/useCompanyTimezone";
import { formatInstant } from "@/lib/date";
import libraryService, { FolderShare } from "@/lib/libraryService";
import { notifyError } from "@/lib/notify-error";

interface FolderSharesDialogProps {
  open: boolean;
  onClose: () => void;
  company: string;
  /** Director DIP o administrador: aprueban y rechazan. */
  canReview: boolean;
}

/** Enlaces externos de carpetas: los propios, o todos si quien mira es DIP/administrador. */
export default function FolderSharesDialog({
  open,
  onClose,
  company,
  canReview,
}: FolderSharesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <FormDialogContent
        icon={Link2}
        title="Enlaces de carpetas"
        description={
          canReview
            ? "Solicitudes y enlaces externos de toda la biblioteca."
            : "Los enlaces externos que usted ha solicitado."
        }
        lockOutside={false}
        className="sm:max-w-3xl"
        footer={
          <Button type="button" variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        }
      >
        {/* Dentro del diálogo: la consulta solo corre abierto y el estado se reinicia al cerrar. */}
        <FolderSharesList company={company} canReview={canReview} />
      </FormDialogContent>
    </Dialog>
  );
}

function statusOf(share: FolderShare): { label: string; tone: TagTone } {
  if (share.is_expired) return { label: "Vencido", tone: "slate" };
  if (share.status === "pending") return { label: "Pendiente", tone: "amber" };
  if (share.status === "rejected") return { label: "Rechazado", tone: "rose" };
  return share.is_active
    ? { label: "Activo", tone: "emerald" }
    : { label: "Revocado", tone: "slate" };
}

function FolderSharesList({
  company,
  canReview,
}: Pick<FolderSharesDialogProps, "company" | "canReview">) {
  const queryClient = useQueryClient();
  const timeZone = useCompanyTimezone();
  const queryKey = ["library-folder-shares", company];
  const [rejecting, setRejecting] = useState<number | null>(null);
  const [reason, setReason] = useState("");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey,
    queryFn: () => libraryService.getFolderShares(company),
    staleTime: 0,
  });

  const review = useMutation({
    mutationFn: (v: {
      id: number;
      action: "approve" | "reject" | "revoke";
      rejection_reason?: string;
    }) =>
      libraryService.reviewFolderShare(
        company,
        v.id,
        v.action,
        v.rejection_reason
          ? { rejection_reason: v.rejection_reason }
          : undefined,
      ),
    onSuccess: () => {
      setRejecting(null);
      setReason("");
      return queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => notifyError(error, { action: "actualizar el enlace" }),
  });

  const copy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Enlace copiado");
    } catch (error) {
      notifyError(error, { action: "copiar el enlace" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Cargando...
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        tone="error"
        icon={Link2}
        title="No se pudieron cargar los enlaces"
        className="py-10"
        action={
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => refetch()}
          >
            Reintentar
          </Button>
        }
      />
    );
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={Link2}
        title="No hay enlaces de carpetas"
        className="py-10"
      />
    );
  }

  return (
    <div className="divide-y divide-border/60 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700/60">
      {data.map((share) => {
        const status = statusOf(share);

        return (
          <div key={share.id} className="space-y-2 px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-700 wrap-anywhere dark:text-slate-200">
                  {share.folder_name}
                  {share.department_name && (
                    <span className="ml-2 text-xs font-normal text-slate-600 dark:text-slate-400">
                      {share.department_name}
                    </span>
                  )}
                </p>
                <p className="text-xs text-slate-600 wrap-anywhere dark:text-slate-400">
                  {share.requested_by_name}
                  {share.shared_with_name
                    ? ` → ${share.shared_with_name}`
                    : ""}{" "}
                  · {formatInstant(share.created_at, timeZone, "date")} ·{" "}
                  {share.read_only ? "solo lectura" : "con descarga"}
                </p>
              </div>
              <TagBadge tone={status.tone}>{status.label}</TagBadge>
            </div>

            <p className="text-[13px] text-slate-700 wrap-anywhere dark:text-slate-300">
              {share.reason}
            </p>

            {share.status === "rejected" && share.rejection_reason && (
              <p className="text-[13px] text-red-600 dark:text-red-400">
                Motivo del rechazo: {share.rejection_reason}
              </p>
            )}

            {share.is_active && share.share_url && (
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => copy(share.share_url!)}
                  className="max-sm:h-10"
                >
                  <Copy className="size-3.5" /> Copiar enlace
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={review.isPending}
                  onClick={() =>
                    review.mutate({ id: share.id, action: "revoke" })
                  }
                  className="text-red-600 hover:text-red-600 max-sm:h-10 dark:text-red-400"
                >
                  Revocar
                </Button>
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  Vence{" "}
                  {share.expires_at
                    ? formatInstant(share.expires_at, timeZone, "date")
                    : ""}{" "}
                  · {share.access_count} accesos
                </span>
              </div>
            )}

            {canReview && share.status === "pending" && (
              <div className="pt-1">
                {rejecting === share.id ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <Input
                      value={reason}
                      onChange={(event) => setReason(event.target.value)}
                      placeholder="Motivo del rechazo (mínimo 5 caracteres)"
                      aria-label="Motivo del rechazo"
                      className={`${fieldClass} min-w-48 flex-1`}
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      disabled={reason.trim().length < 5 || review.isPending}
                      onClick={() =>
                        review.mutate({
                          id: share.id,
                          action: "reject",
                          rejection_reason: reason.trim(),
                        })
                      }
                      className="max-sm:h-10"
                    >
                      Rechazar
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setRejecting(null)}
                      aria-label="Cancelar"
                      className="size-8 max-sm:size-10"
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      disabled={review.isPending}
                      onClick={() =>
                        review.mutate({ id: share.id, action: "approve" })
                      }
                      className="max-sm:h-10"
                    >
                      <Check className="size-3.5" /> Aprobar
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setRejecting(share.id)}
                      className="text-red-600 hover:text-red-600 max-sm:h-10 dark:text-red-400"
                    >
                      Rechazar
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
