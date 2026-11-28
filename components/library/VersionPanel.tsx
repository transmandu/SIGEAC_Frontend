"use client";

import { Eye, History, Loader2, RotateCcw, X, Clock, User } from "lucide-react";
import { useTourContext } from "@/components/tour/TourProvider";
import { bibliotecaVersionesSteps } from "@/components/tour/steps/general/biblioteca/biblioteca-versiones";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { EmptyState } from "@/components/misc/EmptyState";
import { TagBadge } from "@/components/misc/TagBadge";
import { Button } from "@/components/ui/button";
import { useCompanyTimezone } from "@/hooks/general/useCompanyTimezone";
import { formatInstant } from "@/lib/date";
import { fullName } from "@/lib/person-name";

interface Version {
  id: number;
  version_number: number;
  version_label?: string;
  expiry_status: string;
  created_at: string;
  change_log: string;
  employee?: {
    first_name: string;
    last_name?: string;
  };
}

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  versions: Version[];
  docTitle: string;
  onViewVersion: (id: number) => void;
  /**
   * Vuelve vigente una versión anterior. Sin esto el panel no ofrece restaurar
   * (quien no puede modificar el documento). Debe lanzar si falla.
   */
  onRestoreVersion?: (id: number) => Promise<void>;
}

const STATUS = {
  vencido: { label: "Vencido", tone: "rose" },
  vigente: { label: "Vigente", tone: "emerald" },
  no_aplica: { label: "Permanente", tone: "blue" },
} as const;

export const HistoryPanel = ({
  isOpen,
  onClose,
  versions,
  docTitle,
  onViewVersion,
  onRestoreVersion,
}: HistoryPanelProps) => {
  const timeZone = useCompanyTimezone();
  // La confirmación va dentro de la tarjeta: este panel está por encima de
  // los diálogos (z-100), uno nuevo quedaría detrás.
  const [confirmingId, setConfirmingId] = useState<number | null>(null);
  const [restoringId, setRestoringId] = useState<number | null>(null);

  const handleRestore = async (id: number) => {
    if (!onRestoreVersion) return;
    setRestoringId(id);
    try {
      await onRestoreVersion(id);
      setConfirmingId(null);
    } catch {
      // El aviso lo muestra quien restaura; la confirmación queda abierta.
    } finally {
      setRestoringId(null);
    }
  };
  const { registerTour, unregisterTour } = useTourContext();
  useEffect(() => {
    if (isOpen) {
      registerTour(
        "biblioteca-versiones",
        "Historial de Versiones",
        bibliotecaVersionesSteps,
        { onlyVisible: true },
      );
    }
    return () => unregisterTour("biblioteca-versiones");
  }, [isOpen, registerTour, unregisterTour]);

  // Escape cierra el panel; si el visor de una versión está encima, ese
  // atiende Escape en captura y frena la propagación, así que cierra solo él.
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Al body: el layout crea su propio contexto de apilamiento y, por dentro,
  // el panel quedaba por debajo de la barra y del menú lateral.
  return createPortal(
    <div className="fixed inset-0 z-100 flex justify-end overflow-hidden">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />

      <div className="relative flex h-full w-full max-w-120 flex-col border-l border-border/50 bg-background shadow-2xl motion-safe:animate-item-in">
        <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-3 sm:px-6">
          <div
            className="flex items-center gap-2.5"
            data-tour="biblioteca-versions-title"
          >
            <History className="size-4 text-muted-foreground" />
            <h2 className="text-[15px] font-semibold text-slate-700 dark:text-slate-200">
              Historial de versiones
            </h2>
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

        <div className="flex flex-1 flex-col gap-5 overflow-y-auto overscroll-contain p-4 sm:p-6">
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700/60 dark:bg-slate-900/60">
            <p className="text-[13px] text-slate-600 dark:text-slate-400">
              Documento seleccionado
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-700 wrap-anywhere dark:text-slate-200">
              {docTitle || "Sin título definido"}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">
              Línea de tiempo de cambios
            </h3>

            {versions.length === 0 ? (
              <EmptyState
                icon={History}
                title="No hay historial registrado"
                className="py-12"
              />
            ) : (
              <div
                className="flex flex-col gap-3"
                data-tour="biblioteca-versions-timeline"
              >
                {versions.map((v, index) => {
                  const canRestore = !!onRestoreVersion && index > 0;
                  const confirming = confirmingId === v.id;
                  const restoring = restoringId === v.id;
                  const status =
                    STATUS[v.expiry_status as keyof typeof STATUS] ?? null;

                  return (
                    <div
                      key={v.id}
                      className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700/60 dark:bg-slate-900/60"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <TagBadge tone="blue">
                            {v.version_label || v.version_number}
                          </TagBadge>
                          {status && (
                            <TagBadge tone={status.tone}>
                              {status.label}
                            </TagBadge>
                          )}
                        </div>

                        <span className="flex shrink-0 items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                          <Clock className="size-3.5" />
                          {formatInstant(
                            v.created_at,
                            timeZone,
                            "date",
                            "--/--/--",
                          )}
                        </span>
                      </div>

                      <div className="rounded-lg bg-muted/40 p-3">
                        <p className="mb-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
                          Justificación
                        </p>
                        <p className="text-sm text-slate-700 wrap-anywhere dark:text-slate-300">
                          {v.change_log ||
                            "Sin descripción de cambios registrados."}
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-2 border-t border-border/60 pt-3">
                        <span className="flex min-w-0 items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                          <User className="size-3.5 shrink-0" />
                          <span className="truncate">
                            {v.employee?.first_name
                              ? fullName(v.employee)
                              : "Admin Sistema"}
                          </span>
                        </span>

                        <div className="flex shrink-0 items-center gap-2">
                          {canRestore && !confirming && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              data-tour="biblioteca-version-restore-btn"
                              onClick={() => setConfirmingId(v.id)}
                              className="max-sm:h-10"
                            >
                              <RotateCcw className="size-4" /> Restaurar
                            </Button>
                          )}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            data-tour="biblioteca-version-view-btn"
                            onClick={() => onViewVersion(v.id)}
                            className="max-sm:h-10"
                          >
                            <Eye className="size-4" /> Ver
                          </Button>
                        </div>
                      </div>

                      {canRestore && confirming && (
                        <div className="flex flex-col gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
                          <p className="text-sm text-foreground/80">
                            Se creará una versión nueva con el archivo de{" "}
                            <span className="font-medium text-foreground">
                              {v.version_label || v.version_number}
                            </span>{" "}
                            y pasará a ser la vigente. El historial no se
                            modifica.
                          </p>
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={restoring}
                              onClick={() => setConfirmingId(null)}
                              className="max-sm:h-10"
                            >
                              Cancelar
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              disabled={restoring}
                              onClick={() => handleRestore(v.id)}
                              className="max-sm:h-10"
                            >
                              {restoring ? (
                                <Loader2 className="size-4 animate-spin" />
                              ) : (
                                <RotateCcw className="size-4" />
                              )}
                              Restaurar versión
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};
