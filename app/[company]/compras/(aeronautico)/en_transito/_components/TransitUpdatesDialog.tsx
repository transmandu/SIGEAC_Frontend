"use client";

import { useState } from "react";
import {
  ChevronDown,
  History,
  Info,
  Loader2,
  MessageSquarePlus,
  NotebookPen,
  Truck,
} from "lucide-react";

import { useCreateTransitUpdate } from "@/actions/mantenimiento/compras/transit-updates/actions";
import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import { PanelSection } from "@/components/forms/PanelSection";
import CopyPartNumberButton from "@/components/misc/CopyPartNumberButton";
import { EmptyState } from "@/components/misc/EmptyState";
import { TagBadge } from "@/components/misc/TagBadge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useCompanyTimezone } from "@/hooks/general/useCompanyTimezone";
import { useGetTransitUpdates } from "@/hooks/mantenimiento/compras/useGetTransitUpdates";
import { formatInstant } from "@/lib/date";
import { cn } from "@/lib/utils";
import { TransitNoteField } from "./TransitNoteField";
import { TransitTimeline } from "./TransitTimeline";

interface Props {
  articleId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Solo consulta: sin formulario de nueva novedad ni corrección o borrado. */
  readOnly?: boolean;
}

/**
 * Bitácora de un artículo en tránsito: compras va anotando lo que sabe del
 * envío. Mientras el artículo sigue en `TRANSIT` se puede registrar, corregir y
 * borrar (cada cambio queda en el registro); después, solo se consulta.
 *
 * De arriba abajo: los datos del envío, la caja para anotar, el historial
 * (lo que se consulta) y, plegado, el registro de cambios.
 */
export function TransitUpdatesDialog({
  articleId,
  open,
  onOpenChange,
  readOnly = false,
}: Props) {
  const timeZone = useCompanyTimezone();
  const { data, isLoading, isError, refetch } = useGetTransitUpdates(
    articleId,
    open,
  );
  const create = useCreateTransitUpdate();

  const [note, setNote] = useState("");
  const [applyToOrder, setApplyToOrder] = useState(false);
  const [showLog, setShowLog] = useState(false);

  const trimmed = note.trim();
  const canSubmit = trimmed !== "" && !create.isPending;

  const submit = async () => {
    try {
      await create.mutateAsync({
        articleId,
        data: { note: trimmed },
        applyToOrder,
      });
      setNote("");
      setApplyToOrder(false);
    } catch {
      // El aviso lo muestra la mutación; lo escrito se conserva.
    }
  };

  const info = data?.article;
  const siblings = info?.order_siblings_count ?? 0;
  const canWrite = !readOnly && !!info?.can_write;

  const facts = [
    { label: "Artículo", value: info?.part_number, copy: "part number" },
    { label: "Orden de compra", value: info?.purchase_order_number },
    {
      label: "Tracking nacional",
      value: info?.shipping_tracking,
      copy: "tracking",
    },
    {
      label: "Tracking internacional",
      value: info?.international_shipping_tracking,
      copy: "tracking",
    },
  ].filter((fact) => !!fact.value);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <FormDialogContent
        className="sm:max-w-2xl"
        // Quien solo consulta no pierde nada al cerrar con un clic fuera.
        lockOutside={!readOnly}
        icon={NotebookPen}
        title="Bitácora de tránsito"
        description="Lo que se sabe del envío, anotado por compras mientras el artículo sigue en camino."
      >
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        ) : isError || !data ? (
          <EmptyState
            tone="error"
            icon={History}
            title="No se pudo cargar la bitácora"
            action={
              <Button variant="outline" onClick={() => refetch()}>
                Reintentar
              </Button>
            }
          />
        ) : (
          <div className="space-y-4">
            {facts.length > 0 && (
              <PanelSection icon={Truck} title="Envío" compact>
                <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                  {facts.map((fact) => (
                    <div key={fact.label} className="min-w-0">
                      <dt className="text-[13px] text-muted-foreground">
                        {fact.label}
                      </dt>
                      <dd className="flex items-center gap-1 text-sm font-medium wrap-anywhere">
                        <span
                          className={cn(
                            fact.copy && "font-mono",
                            "min-w-0 wrap-anywhere",
                          )}
                        >
                          {fact.value}
                        </span>
                        {fact.copy && (
                          <CopyPartNumberButton
                            value={fact.value}
                            label={fact.copy}
                          />
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
              </PanelSection>
            )}

            {canWrite ? (
              <PanelSection
                icon={MessageSquarePlus}
                title="Nueva novedad"
                hint="Escriba lo que sabe del envío o toque una sugerencia."
                compact
              >
                <TransitNoteField
                  id="transit-note"
                  value={note}
                  onChange={setNote}
                  disabled={create.isPending}
                  placeholder="Ej: El proveedor confirmó la salida en el vuelo del jueves."
                />

                {/* Pie de la sección: lo que afecta a dónde se registra y la
                    acción, juntos. */}
                <div className="-mx-3 -mb-3 mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-3 rounded-b-xl border-t bg-muted/20 px-3 py-3">
                  {siblings > 0 ? (
                    <label
                      htmlFor="transit-apply-order"
                      className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 basis-56"
                    >
                      <Switch
                        id="transit-apply-order"
                        checked={applyToOrder}
                        onCheckedChange={setApplyToOrder}
                        disabled={create.isPending}
                      />
                      <span className="min-w-0">
                        <span className="block text-sm font-medium leading-tight">
                          Aplicar también a {siblings}{" "}
                          {siblings === 1 ? "artículo" : "artículos"} de la
                          orden
                        </span>
                        <span className="block text-[13px] leading-snug text-muted-foreground">
                          Los que siguen en tránsito recibirán la misma novedad.
                        </span>
                      </span>
                    </label>
                  ) : (
                    <span />
                  )}

                  <Button
                    type="button"
                    onClick={submit}
                    disabled={!canSubmit}
                    className="min-w-35 gap-2 max-sm:w-full"
                  >
                    {create.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <MessageSquarePlus className="size-4" />
                    )}
                    Registrar novedad
                  </Button>
                </div>
              </PanelSection>
            ) : (
              !readOnly && (
                <p className="flex items-start gap-2 rounded-xl border border-slate-200 bg-muted/30 px-3.5 py-3 text-[13px] leading-snug text-muted-foreground dark:border-slate-700/60">
                  <Info className="mt-0.5 size-4 shrink-0" />
                  El artículo ya no está en tránsito: la bitácora se conserva
                  para consulta, pero ya no admite cambios.
                </p>
              )
            )}

            <PanelSection
              icon={History}
              title="Historial"
              hint={
                data.data.length === 0
                  ? "Sin novedades"
                  : `${data.data.length} ${
                      data.data.length === 1 ? "novedad" : "novedades"
                    }, de la más reciente a la más antigua`
              }
            >
              {data.data.length === 0 ? (
                <EmptyState
                  icon={History}
                  title="Aún no hay novedades"
                  description={
                    canWrite
                      ? "Registre la primera para que quede constancia del recorrido del envío."
                      : "No se registraron novedades mientras estuvo en tránsito."
                  }
                  className="py-6"
                />
              ) : (
                <TransitTimeline
                  updates={data.data}
                  articleId={articleId}
                  timeZone={timeZone}
                  readOnly={readOnly}
                />
              )}
            </PanelSection>

            {data.log.length > 0 && (
              <PanelSection
                icon={NotebookPen}
                title="Registro de cambios"
                hint="Correcciones y eliminaciones, con lo que decía antes."
                compact
                action={
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    aria-expanded={showLog}
                    onClick={() => setShowLog((current) => !current)}
                    className="h-8 gap-1.5 px-2 text-[13px] max-sm:h-10"
                  >
                    {showLog ? "Ocultar" : `Ver (${data.log.length})`}
                    <ChevronDown
                      className={cn(
                        "size-4 transition-transform",
                        showLog && "rotate-180",
                      )}
                    />
                  </Button>
                }
              >
                {showLog && (
                  <ul className="-m-3 divide-y divide-border/60 motion-safe:animate-reveal">
                    {data.log.map((entry) => (
                      <li key={entry.id} className="space-y-2 px-3 py-3.5">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <TagBadge
                            tone={entry.action === "EDITED" ? "amber" : "rose"}
                            className="h-5 px-2"
                          >
                            {entry.action === "EDITED"
                              ? "Corregida"
                              : "Eliminada"}
                          </TagBadge>
                          <p className="text-[13px] text-muted-foreground">
                            por{" "}
                            <span className="font-medium text-foreground">
                              {entry.performed_by}
                            </span>{" "}
                            ·{" "}
                            {formatInstant(
                              entry.performed_at,
                              timeZone,
                              "dateTime",
                            )}
                          </p>
                        </div>

                        <p className="text-sm wrap-anywhere">
                          <span className="text-muted-foreground">
                            {entry.action === "EDITED" ? "Antes: " : "Decía: "}
                          </span>
                          {entry.old_values.note || "Sin texto"}
                        </p>

                        {entry.new_values && (
                          <p className="text-sm wrap-anywhere">
                            <span className="text-muted-foreground">
                              Ahora:{" "}
                            </span>
                            {entry.new_values.note || "Sin texto"}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </PanelSection>
            )}
          </div>
        )}
      </FormDialogContent>
    </Dialog>
  );
}
