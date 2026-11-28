"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Loader2,
  RefreshCw,
  RotateCcw,
  Trash2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "@/components/dialogs/shared/ConfirmDeleteDialog";
import { EmptyState } from "@/components/misc/EmptyState";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { StripButton } from "@/components/library/StripButton";
import { Button } from "@/components/ui/button";
import { useCompanyTimezone } from "@/hooks/general/useCompanyTimezone";
import { formatInstant } from "@/lib/date";
import { fileKindOf } from "@/lib/Library/document-info";
import libraryService, { type TrashedDocument } from "@/lib/libraryService";
import { notifyError } from "@/lib/notify-error";
import { cn } from "@/lib/utils";

interface TrashViewProps {
  company: string;
  /** Vuelve a la carpeta que se estaba viendo. */
  onExit: () => void;
  /** Algo volvió a la biblioteca o se eliminó: refrescar documentos y carpetas. */
  onChanged: () => Promise<unknown> | void;
}

/**
 * Papelera de la biblioteca: lo eliminado se aparta aquí y se puede restaurar
 * o eliminar para siempre. Ocupa el lugar del contenido de las carpetas.
 */
export default function TrashView({
  company,
  onExit,
  onChanged,
}: TrashViewProps) {
  const queryClient = useQueryClient();
  const timeZone = useCompanyTimezone();
  const queryKey = ["library-trash", company];

  const [purgeTarget, setPurgeTarget] = useState<TrashedDocument | null>(null);
  const [emptying, setEmptying] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey,
    queryFn: () => libraryService.getTrash(company),
    staleTime: 0,
  });
  const items = data ?? [];

  const restore = useMutation({
    mutationFn: (id: number) => libraryService.restoreTrashed(company, id),
    onSuccess: async (result) => {
      if (result.moved_to_root) toast.warning(result.message);
      else toast.success(result.message);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey }),
        onChanged(),
      ]);
    },
    onError: (error) =>
      notifyError(error, { action: "restaurar el documento" }),
  });

  const refreshAfterPurge = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey }),
      onChanged(),
    ]);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col" data-tour="biblioteca-trash">
      <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 border-b bg-muted/30 px-4 py-2">
        <StripButton icon={ArrowLeft} onClick={onExit}>
          Volver
        </StripButton>

        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <Trash2 className="size-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0">
            <h2 className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">
              Papelera
            </h2>
            <p className="truncate text-xs text-slate-600 dark:text-slate-400">
              Los documentos se conservan 30 días y luego se eliminan
              definitivamente.
            </p>
          </div>
        </div>

        {items.length > 0 && (
          <StripButton icon={XCircle} danger onClick={() => setEmptying(true)}>
            Vaciar papelera
          </StripButton>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 max-sm:p-3">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Cargando...
          </div>
        ) : isError ? (
          <EmptyState
            tone="error"
            icon={Trash2}
            title="No se pudo cargar la papelera"
            className="py-16"
            action={
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-1 h-8 gap-2"
                onClick={() => refetch()}
              >
                <RefreshCw className="size-3.5" />
                Reintentar
              </Button>
            }
          />
        ) : items.length === 0 ? (
          <EmptyState
            icon={Trash2}
            title="La papelera está vacía"
            description="Lo que elimine de la biblioteca aparecerá aquí."
            className="py-16"
          />
        ) : (
          <TooltipProvider delayDuration={200}>
            <div className="divide-y divide-border/60 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700/60 dark:bg-slate-900/60">
              {items.map((doc) => {
                const kind = fileKindOf((doc.file_type ?? "").toLowerCase());
                const Icon = kind.icon;
                const busy = restore.isPending && restore.variables === doc.id;

                return (
                  <div
                    key={doc.id}
                    className="flex items-center gap-3 px-4 py-3 max-sm:flex-wrap max-sm:px-3"
                  >
                    <div
                      className={cn(
                        "grid size-10 shrink-0 place-items-center rounded-lg",
                        kind.iconClass,
                      )}
                    >
                      <Icon className="size-5" strokeWidth={1.75} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-700 dark:text-slate-200">
                        {doc.title}
                      </p>
                      <p className="text-xs text-slate-600 wrap-anywhere dark:text-slate-400">
                        {[
                          doc.department_name,
                          doc.folder_path === "/"
                            ? "Raíz"
                            : doc.folder_path
                                .replace(/^\//, "")
                                .split("/")
                                .join(" / "),
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Eliminado el{" "}
                        {formatInstant(doc.deleted_at, timeZone, "date")}
                        {doc.deleted_by ? ` por ${doc.deleted_by}` : ""}
                        {doc.purge_at && (
                          <>
                            {" · "}Se elimina definitivamente el{" "}
                            {formatInstant(doc.purge_at, timeZone, "date")}
                          </>
                        )}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      <StripButton
                        icon={busy ? Loader2 : RotateCcw}
                        disabled={restore.isPending}
                        onClick={() => restore.mutate(doc.id)}
                        className={busy ? "[&_svg]:animate-spin" : undefined}
                      >
                        Restaurar
                      </StripButton>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label="Eliminar definitivamente"
                            disabled={restore.isPending}
                            onClick={() => setPurgeTarget(doc)}
                            className="size-8 text-red-600 hover:text-red-600 max-sm:size-10 dark:text-red-400"
                          >
                            <XCircle className="size-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          Eliminar definitivamente
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                );
              })}
            </div>
          </TooltipProvider>
        )}
      </div>

      <ConfirmDeleteDialog
        open={!!purgeTarget}
        onOpenChange={(open) => !open && setPurgeTarget(null)}
        title="Eliminar definitivamente"
        entityName={purgeTarget?.title}
        confirmLabel="Eliminar definitivamente"
        warning="Se borran el documento, todas sus versiones y sus archivos. No se puede deshacer."
        onConfirm={async () => {
          if (!purgeTarget) return;
          try {
            await libraryService.purgeTrashed(company, purgeTarget.id);
            toast.success("Documento eliminado definitivamente");
            await refreshAfterPurge();
          } catch (error) {
            notifyError(error, { action: "eliminar el documento" });
            throw error;
          }
        }}
      />

      <ConfirmDeleteDialog
        open={emptying}
        onOpenChange={setEmptying}
        title="Vaciar la papelera"
        warning={`Se eliminan definitivamente los ${items.length} documentos de la papelera, con todas sus versiones y archivos. No se puede deshacer.`}
        confirmLabel="Vaciar papelera"
        onConfirm={async () => {
          try {
            const result = await libraryService.emptyTrash(company);
            if (result.failed > 0) {
              toast.warning(
                `${result.purged} eliminados; ${result.failed} no se pudieron eliminar.`,
              );
            } else {
              toast.success("Papelera vaciada");
            }
            await refreshAfterPurge();
          } catch (error) {
            notifyError(error, { action: "vaciar la papelera" });
            throw error;
          }
        }}
      />
    </div>
  );
}
