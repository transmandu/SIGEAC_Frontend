"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConditionCombobox } from "@/components/forms/general/compras/_components/ConditionCombobox";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  useRegisterWorkshopDispatchEvent,
  useCloseWorkshopDispatch,
} from "@/actions/mantenimiento/almacen/salida_taller/action";
import { useGetWorkshopDispatch } from "@/hooks/mantenimiento/almacen/salida_taller/useGetWorkshopDispatches";
import { useGetConditions } from "@/hooks/general/condiciones/useGetConditions";
import { useCompanyStore } from "@/stores/CompanyStore";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import {
  CheckCircle2,
  ClipboardList,
  History,
  Loader2,
  PackageCheck,
  Plus,
  Truck,
} from "lucide-react";
import { useMemo, useState } from "react";

interface Props {
  dispatchId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EVENT_PRESETS = [
  "LLEGO_AL_TALLER",
  "SEGUIMIENTO",
  "DIAGNOSTICO",
  "APROBACION_PRESUPUESTO",
  "RETRASO",
];

const EVENT_LABEL: Record<string, string> = {
  DEPARTED: "Salió del almacén",
  LLEGO_AL_TALLER: "Llegó al taller",
  SEGUIMIENTO: "Seguimiento",
  DIAGNOSTICO: "Diagnóstico",
  APROBACION_PRESUPUESTO: "Aprobación de presupuesto",
  RETRASO: "Retraso",
  RETURNED: "Cerrado: reingresó a inventario",
};

function formatMoment(value: string) {
  const date = parseISO(value);
  return isNaN(date.getTime())
    ? value
    : format(date, "dd/MM/yyyy HH:mm", { locale: es });
}

export function WorkshopDispatchTimelineDialog({
  dispatchId,
  open,
  onOpenChange,
}: Props) {
  const { selectedCompany } = useCompanyStore();
  const { data: dispatch, isLoading } = useGetWorkshopDispatch(
    open ? dispatchId : undefined,
  );
  const { data: conditions, isLoading: isConditionsLoading } = useGetConditions(
    selectedCompany?.slug,
  );
  const { registerWorkshopDispatchEvent } = useRegisterWorkshopDispatchEvent();
  const { closeWorkshopDispatch } = useCloseWorkshopDispatch();

  const [eventType, setEventType] = useState("");
  const [description, setDescription] = useState("");

  const [closing, setClosing] = useState(false);
  const [conditionByLine, setConditionByLine] = useState<
    Record<number, string>
  >({});

  const workshopDispatch = dispatch?.workshop_dispatch;
  const events = workshopDispatch?.events ?? [];
  const isOpenCycle = workshopDispatch?.status === "IN_WORKSHOP";

  // El cierre reingresa TODO lo que sigue fuera, no solo lo serializado: el
  // backend rechaza el cierre si falta cualquier línea con saldo pendiente
  // (ver WorkshopDispatchService::close). Se usa `articles`, ya aplanado por
  // el backend con categoría, descripción y saldo por línea.
  const pendingLines = useMemo(
    () =>
      (dispatch?.articles ?? []).filter(
        (line) =>
          line.article_dispatch_order_id != null && line.status !== "RETURNED",
      ),
    [dispatch],
  );

  // Solo lo serializado lleva condición de aeronavegabilidad. Un consumible
  // (aunque sea aeronáutico) y un artículo general vuelven por cantidad y el
  // backend no les pide condición (ver WorkshopDispatchService::returnLine).
  const linesNeedingCondition = useMemo(
    () =>
      pendingLines.filter(
        (line) =>
          line.type === "aeronautical" && line.category !== "CONSUMABLE",
      ),
    [pendingLines],
  );

  const quantityOnlyLines = useMemo(
    () => pendingLines.filter((line) => !linesNeedingCondition.includes(line)),
    [pendingLines, linesNeedingCondition],
  );

  const resetEventForm = () => {
    setEventType("");
    setDescription("");
  };

  const handleAddEvent = () => {
    if (!eventType.trim()) return;
    registerWorkshopDispatchEvent.mutate(
      {
        id: dispatchId,
        company: selectedCompany!.slug,
        event: eventType.trim(),
        description: description.trim() || undefined,
      },
      { onSuccess: resetEventForm },
    );
  };

  const canClose =
    pendingLines.length > 0 &&
    linesNeedingCondition.every(
      (line) => !!conditionByLine[line.article_dispatch_order_id!],
    );

  const handleClose = () => {
    if (!canClose) return;
    closeWorkshopDispatch.mutate(
      {
        id: dispatchId,
        company: selectedCompany!.slug,
        data: {
          items: pendingLines.map((line) => {
            const lineId = line.article_dispatch_order_id!;
            const condition = conditionByLine[lineId];

            return {
              article_dispatch_order_id: lineId,
              condition_id: condition ? Number(condition) : undefined,
            };
          }),
        },
      },
      { onSuccess: () => setClosing(false) },
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) setClosing(false);
      }}
    >
      <DialogContent className="flex h-[85vh] w-[calc(100vw-2rem)] max-w-4xl flex-col gap-0 overflow-hidden p-0">
        {/* Header fijo */}
        {/* pr-8: la X de cierre del Dialog va absoluta sobre esta esquina y
            chocaría con el badge de estado. */}
        <DialogHeader className="shrink-0 gap-1 border-b px-6 py-4 pr-12">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <DialogTitle className="text-lg">
              Salida a Taller — {dispatch?.request_number ?? "..."}
            </DialogTitle>
            {workshopDispatch && (
              <Badge
                variant={isOpenCycle ? "secondary" : "default"}
                className="shrink-0"
              >
                {isOpenCycle ? "En taller" : "Reingresado"}
              </Badge>
            )}
          </div>
          <DialogDescription>
            {workshopDispatch?.workshop?.name ? (
              <span className="inline-flex items-center gap-1.5">
                <Truck className="size-3.5" />
                {workshopDispatch.workshop.name}
              </span>
            ) : (
              "Storyline de la salida hasta su reingreso a inventario."
            )}
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {!isLoading && dispatch && (
          <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[1fr_380px]">
            {/* Columna izquierda: el storyline, con su propio scroll. */}
            <div className="min-h-0 overflow-y-auto border-b px-6 py-5 md:border-b-0 md:border-r">
              <div className="mb-4 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <History className="size-4" />
                Storyline
              </div>

              {events.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Todavía no hay sucesos registrados.
                </p>
              ) : (
                <ol className="relative ml-3 space-y-6 border-l border-border">
                  {events.map((entry) => (
                    <li key={entry.id} className="ml-6">
                      <span className="absolute -left-1.75 mt-1 flex size-3.5 rounded-full border-2 border-background bg-primary" />
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant={
                            entry.event === "RETURNED" ? "default" : "outline"
                          }
                        >
                          {EVENT_LABEL[entry.event] ?? entry.event}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatMoment(entry.occurred_at)}
                        </span>
                      </div>
                      {entry.description && (
                        <p className="mt-1.5 text-sm">{entry.description}</p>
                      )}
                      <p className="mt-1 text-xs text-muted-foreground italic">
                        {entry.registered_by}
                      </p>
                    </li>
                  ))}
                </ol>
              )}
            </div>

            {/* Columna derecha: panel de acciones, con su propio scroll si
                hace falta (muchas líneas al cerrar el ciclo). Nunca comparte
                scroll con el storyline. */}
            {isOpenCycle ? (
              <div className="h-full min-h-0 overflow-y-auto bg-muted/30 px-6 py-5">
                {!closing ? (
                  <div className="flex min-h-full flex-col items-center justify-center text-center">
                    <div className="mb-4 flex items-center gap-2 text-sm font-medium">
                      <ClipboardList className="size-4" />
                      Agregar suceso
                    </div>

                    <div className="w-full space-y-4 text-left">
                      <div className="flex flex-wrap justify-center gap-1.5">
                        {EVENT_PRESETS.map((preset) => (
                          <Button
                            key={preset}
                            type="button"
                            size="sm"
                            variant={
                              eventType === preset ? "default" : "outline"
                            }
                            className="h-8 rounded-full text-xs"
                            onClick={() => setEventType(preset)}
                          >
                            {EVENT_LABEL[preset] ?? preset}
                          </Button>
                        ))}
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">
                          O escriba un suceso personalizado
                        </Label>
                        <Input
                          placeholder="Ej: Se recibió cotización"
                          value={
                            EVENT_PRESETS.includes(eventType) ? "" : eventType
                          }
                          onChange={(e) => setEventType(e.target.value)}
                          className="h-10 bg-background"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">
                          Descripción (opcional)
                        </Label>
                        <Textarea
                          rows={4}
                          placeholder="Detalle del suceso..."
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="resize-none bg-background"
                        />
                      </div>

                      <Button
                        type="button"
                        className="w-full"
                        onClick={handleAddEvent}
                        disabled={
                          !eventType.trim() ||
                          registerWorkshopDispatchEvent.isPending
                        }
                      >
                        {registerWorkshopDispatchEvent.isPending ? (
                          <Loader2 className="size-4 animate-spin mr-2" />
                        ) : (
                          <Plus className="size-4 mr-2" />
                        )}
                        Registrar suceso
                      </Button>
                    </div>

                    <div className="mt-auto w-full pt-6">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => setClosing(true)}
                      >
                        <PackageCheck className="size-4 mr-2" />
                        Cerrar ciclo y reingresar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex min-h-full flex-col items-center justify-center text-center">
                    <div className="mb-1 flex items-center gap-2 text-sm font-medium">
                      <PackageCheck className="size-4" />
                      Cerrar ciclo
                    </div>
                    <p className="mb-4 text-xs text-muted-foreground">
                      El cierre reingresa todo lo que sigue fuera. Indique con
                      qué condición de aeronavegabilidad vuelve cada serializado
                      (ej: OVERHAUL).
                    </p>

                    <div className="w-full space-y-4 text-left">
                      {pendingLines.length === 0 ? (
                        <p className="text-center text-sm text-muted-foreground italic">
                          Esta salida no tiene artículos pendientes de
                          reingreso.
                        </p>
                      ) : (
                        <>
                          {linesNeedingCondition.length > 0 && (
                            <div className="space-y-2">
                              {linesNeedingCondition.map((line) => {
                                const lineId = line.article_dispatch_order_id!;
                                return (
                                  <div
                                    key={lineId}
                                    className={cn(
                                      "space-y-2 rounded-md border bg-background p-3",
                                    )}
                                  >
                                    <div className="min-w-0">
                                      <p className="text-sm font-medium truncate">
                                        {line.description ??
                                          line.batch_name ??
                                          `Artículo #${line.id}`}
                                      </p>
                                      <p className="text-xs text-muted-foreground truncate">
                                        {[
                                          line.part_number &&
                                          line.part_number !== "N/A"
                                            ? `P/N: ${line.part_number}`
                                            : null,
                                          line.serial && line.serial !== "N/A"
                                            ? `S/N: ${line.serial}`
                                            : null,
                                        ]
                                          .filter(Boolean)
                                          .join(" · ") || "Sin datos"}
                                      </p>
                                    </div>
                                    <ConditionCombobox
                                      value={conditionByLine[lineId] ?? ""}
                                      onChange={(val) =>
                                        setConditionByLine((p) => ({
                                          ...p,
                                          [lineId]: val,
                                        }))
                                      }
                                      conditions={conditions}
                                      disabled={isConditionsLoading}
                                      triggerClassName="h-9 w-full"
                                      placeholder="Condición..."
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Consumibles y artículos generales: reingresan por
                              cantidad y el backend no les pide condición, pero
                              deben ir en el cierre o lo rechaza. */}
                          {quantityOnlyLines.length > 0 && (
                            <div className="space-y-1.5 rounded-md border border-dashed bg-muted/40 p-3">
                              <p className="text-xs font-medium text-muted-foreground">
                                Reingresan por cantidad
                              </p>
                              {quantityOnlyLines.map((line) => (
                                <div
                                  key={line.article_dispatch_order_id}
                                  className="flex items-center justify-between gap-2 text-xs"
                                >
                                  <span className="min-w-0 truncate">
                                    {line.description ?? `Artículo #${line.id}`}
                                  </span>
                                  <span className="shrink-0 tabular-nums text-muted-foreground">
                                    {line.pending_quantity ??
                                      line.dispatch_quantity}
                                    {line.unit ? ` ${line.unit}` : ""}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    <div className="mt-auto flex w-full flex-col gap-2 pt-6">
                      <Button
                        type="button"
                        onClick={handleClose}
                        disabled={!canClose || closeWorkshopDispatch.isPending}
                      >
                        {closeWorkshopDispatch.isPending ? (
                          <Loader2 className="size-4 animate-spin mr-2" />
                        ) : (
                          <CheckCircle2 className="size-4 mr-2" />
                        )}
                        Confirmar reingreso
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setClosing(false)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center bg-muted/30 px-6 py-5 text-center text-sm text-muted-foreground">
                Esta salida ya fue reingresada a inventario.
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
