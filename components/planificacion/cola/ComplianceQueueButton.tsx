"use client";

import {
  useClearControlQueue,
  useRemoveFromControlQueue,
} from "@/actions/mantenimiento/planificacion/cola_cumplimientos/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useGetControlQueue } from "@/hooks/mantenimiento/planificacion/useGetControlQueue";
import { AVIONICS_ACTION_LABELS } from "@/lib/avionicsControlLabels";
import {
  computeMaintenanceItem,
  STATUS_META,
} from "@/lib/maintenanceControlCalc";
import { partTypeLabel, partTypeRank } from "@/lib/maintenancePartTypes";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import { AvionicsAction, ControlQueueEntry, ControlQueueType } from "@/types";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  ClipboardList,
  Cog,
  FileBadge,
  Loader2,
  Plane,
  Trash2,
  Wrench,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { QueueFormatsMenu } from "./QueueFormatsMenu";

/** Ancho del panel (w-96) y duración del deslizamiento, compartidos con la lengüeta. */
const PANEL_WIDTH = 384;
const PANEL_DURATION_S = 0.35;

/** De qué control vino cada fila, para orientarse en una lista mezclada. */
const TYPE_META: Record<
  ControlQueueType,
  { short: string; route: string; order: number }
> = {
  maintenance_control_item: {
    short: "Mantenimiento",
    route: "control_mantenimiento",
    order: 0,
  },
  component_control_item: {
    short: "Componentes",
    route: "control_componentes",
    order: 1,
  },
  avionics_control_task: {
    short: "Aviónica",
    route: "control_avionica",
    order: 2,
  },
  directive_control_item: {
    short: "Directivas",
    route: "control_directivas",
    order: 3,
  },
};

/** Certificados primero, luego la aeronave, luego sus partes. */
const GROUP_ORDER = { CERTIFICATE: 0, AIRCRAFT: 1, PART: 2 } as const;

type Group = {
  key: string;
  label: string;
  kind: string;
  partType?: string | null;
  entries: ControlQueueEntry[];
};

type ControlBlock = {
  key: string;
  type: ControlQueueType;
  title: string;
  controlId?: number | null;
  groups: Group[];
  entries: ControlQueueEntry[];
};

type AircraftBlock = {
  aircraftId: number;
  acronym: string;
  controls: ControlBlock[];
  entries: ControlQueueEntry[];
};

/**
 * Agrupa la bandeja en aeronave → control → conjunto.
 *
 * Los tres niveles son los que mandan al emitir: una orden de trabajo es de una
 * aeronave, y una hoja del formato INAC es de una aeronave y un conjunto (la
 * aeronave, un motor, una hélice), con tablas que difieren entre sí. Verlo
 * agrupado es lo que permite seleccionar algo válido de un vistazo.
 */
function groupEntries(entries: ControlQueueEntry[]): AircraftBlock[] {
  const byAircraft = new Map<number, AircraftBlock>();

  for (const entry of entries) {
    const aircraftId = entry.aircraft_id;

    if (!byAircraft.has(aircraftId)) {
      byAircraft.set(aircraftId, {
        aircraftId,
        acronym: entry.aircraft_acronym ?? `Aeronave ${aircraftId}`,
        controls: [],
        entries: [],
      });
    }

    const aircraft = byAircraft.get(aircraftId)!;
    aircraft.entries.push(entry);

    // Por control concreto, no por tipo: dos controles de la misma clase en la
    // misma aeronave no deberían existir, pero agrupar por id es lo correcto.
    const controlKey = `${entry.type}-${entry.control_id ?? "none"}`;
    let control = aircraft.controls.find((c) => c.key === controlKey);

    if (!control) {
      control = {
        key: controlKey,
        type: entry.type,
        title: entry.control_title ?? TYPE_META[entry.type].short,
        controlId: entry.control_id,
        groups: [],
        entries: [],
      };
      aircraft.controls.push(control);
    }

    control.entries.push(entry);

    const groupKey = entry.group_key ?? "aircraft";
    let group = control.groups.find((g) => g.key === groupKey);

    if (!group) {
      // "Motor · S/N 71234": el tipo se traduce con el mapa del frontend
      // (partTypeLabel) y el serial llega suelto, así que la etiqueta se arma
      // acá en vez de parsear la que manda el backend.
      const label =
        entry.group_kind === "PART"
          ? [
              partTypeLabel(entry.part_type ?? undefined),
              entry.part_serial ? `S/N ${entry.part_serial}` : null,
            ]
              .filter(Boolean)
              .join(" · ")
          : (entry.group_label ?? "Aeronave");

      group = {
        key: groupKey,
        label,
        kind: entry.group_kind ?? "AIRCRAFT",
        partType: entry.part_type,
        entries: [],
      };
      control.groups.push(group);
    }

    group.entries.push(entry);
  }

  const blocks = [...byAircraft.values()];

  for (const aircraft of blocks) {
    aircraft.controls.sort(
      (a, b) => TYPE_META[a.type].order - TYPE_META[b.type].order,
    );

    for (const control of aircraft.controls) {
      control.groups.sort((a, b) => {
        const kindDiff =
          (GROUP_ORDER[a.kind as keyof typeof GROUP_ORDER] ?? 9) -
          (GROUP_ORDER[b.kind as keyof typeof GROUP_ORDER] ?? 9);
        if (kindDiff !== 0) return kindDiff;

        const rankDiff =
          partTypeRank(a.partType ?? undefined) -
          partTypeRank(b.partType ?? undefined);
        if (rankDiff !== 0) return rankDiff;

        return a.label.localeCompare(b.label);
      });
    }
  }

  return blocks.sort((a, b) => a.acronym.localeCompare(b.acronym));
}

function GroupIcon({ kind }: { kind: string }) {
  if (kind === "CERTIFICATE") return <FileBadge className="size-3 shrink-0" />;
  if (kind === "PART") return <Cog className="size-3 shrink-0" />;
  return <Plane className="size-3 shrink-0" />;
}

function EntryRow({
  entry,
  company,
  selected,
  onToggle,
  onRemove,
  removing,
}: {
  entry: ControlQueueEntry;
  company: string;
  selected: boolean;
  onToggle: () => void;
  onRemove: () => void;
  removing: boolean;
}) {
  const meta = TYPE_META[entry.type];

  if (entry.missing) {
    return (
      <li className="flex items-start gap-2 rounded-md border border-dashed border-destructive/50 p-2">
        <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-destructive" />
        <span className="flex-1 text-xs text-muted-foreground">
          Este ítem ya no existe: fue eliminado después de agregarlo.
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-6 shrink-0"
          disabled={removing}
          onClick={onRemove}
        >
          <X className="size-3.5" />
          <span className="sr-only">Quitar</span>
        </Button>
      </li>
    );
  }

  const computed = entry.computed
    ? computeMaintenanceItem({ computed: entry.computed })
    : null;
  const status = computed ? STATUS_META[computed.status] : null;

  const actionLabel =
    entry.type === "avionics_control_task" && entry.action
      ? AVIONICS_ACTION_LABELS[entry.action as AvionicsAction]
      : null;

  return (
    <li
      className={cn(
        "flex items-start gap-2 rounded-md border p-2 transition-colors",
        selected ? "border-primary/40 bg-primary/5" : "hover:bg-muted/40",
        entry.retired_at && "opacity-60",
      )}
    >
      <Checkbox
        checked={selected}
        onCheckedChange={onToggle}
        className="mt-0.5 shrink-0"
        aria-label={`Seleccionar ${entry.label}`}
      />

      <div className="min-w-0 flex-1 space-y-1">
        <p className="text-xs font-medium leading-snug wrap-break-word">
          {entry.control_id ? (
            <Link
              href={`/${company}/planificacion/${meta.route}/${entry.control_id}`}
              className="hover:underline"
            >
              {entry.label}
            </Link>
          ) : (
            entry.label
          )}
        </p>

        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
          {actionLabel && (
            <Badge variant="outline" className="text-[9px]">
              {actionLabel}
            </Badge>
          )}
          {entry.retired_at && (
            <Badge variant="destructive" className="text-[9px]">
              Dado de baja
            </Badge>
          )}
          {computed && status && (
            <span className="flex items-center gap-1">
              <span
                className={cn("size-1.5 shrink-0 rounded-full", status.dot)}
              />
              <span className={cn("font-medium", status.text)}>
                {status.label}
              </span>
              <span className="text-muted-foreground">
                · {computed.remaining}
              </span>
            </span>
          )}
          {entry.pending_work_order && (
            <Link
              href={`/${company}/planificacion/ordenes_trabajo/${entry.pending_work_order.order_number}`}
              className="text-primary hover:underline"
            >
              OT {entry.pending_work_order.order_number}
            </Link>
          )}
        </div>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-6 shrink-0 text-muted-foreground hover:text-destructive"
        disabled={removing}
        onClick={onRemove}
      >
        <X className="size-3.5" />
        <span className="sr-only">Quitar de la bandeja</span>
      </Button>
    </li>
  );
}

/**
 * La bandeja de trabajo, como lengüeta lateral persistente.
 *
 * Junta lo que el usuario fue marcando en los controles de Mantenimiento,
 * Componentes, Aviónica y Directivas —de cualquier aeronave— para resolverlo
 * después: una OT que atienda varios ítems, o la emisión de un formato.
 *
 * Es una bandeja, no una cola: acumula libremente y el usuario SELECCIONA al
 * emitir, porque las reglas son del documento, no de la bandeja. Una orden de
 * trabajo es de una aeronave; una hoja del INAC, de una aeronave y un conjunto.
 * Por eso se muestra agrupada en aeronave → control → conjunto, con el estado
 * de la selección siempre visible.
 *
 * Se monta en DashboardLayout, no en cada control: se arma navegando entre
 * pantallas distintas, así que tiene que seguir visible al cambiar de página.
 */
export function ComplianceQueueButton() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);
  const [collapsed, setCollapsed] = useState<string[]>([]);
  const { selectedCompany } = useCompanyStore();
  const company = selectedCompany?.slug;

  const { data: queue, isLoading } = useGetControlQueue(company);
  const { removeFromControlQueue } = useRemoveFromControlQueue();
  const { clearControlQueue } = useClearControlQueue();

  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [panelWidth, setPanelWidth] = useState(PANEL_WIDTH);

  const entries = queue?.entries ?? [];
  const blocks = useMemo(() => groupEntries(entries), [entries]);

  // Lo que se quitó de la bandeja (o se ató a una OT) ya no existe: dejarlo en
  // la selección mandaría ids fantasma al emitir.
  useEffect(() => {
    const ids = new Set(entries.map((entry) => entry.id));
    setSelected((prev) => {
      const next = prev.filter((id) => ids.has(id));
      return next.length === prev.length ? prev : next;
    });
  }, [entries]);

  useEffect(() => {
    if (!open) return;

    const measure = () => {
      const width = panelRef.current?.offsetWidth;
      if (width) setPanelWidth(width);
    };

    measure();
    window.addEventListener("resize", measure);

    return () => window.removeEventListener("resize", measure);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target)) return;
      if (buttonRef.current?.contains(target)) return;

      // El diálogo de crear OT y los desplegables de Radix viven en un portal
      // colgado de <body>, fuera de este panel: sin esta guarda, abrir el menú
      // de formatos o el diálogo cerraba la bandeja que está debajo.
      if (
        target instanceof Element &&
        target.closest(
          '[data-radix-popper-content-wrapper],[role="dialog"],[data-dialog-overlay]',
        )
      ) {
        return;
      }

      setOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      // Escape cierra primero la capa de encima (diálogo, desplegable); si hay
      // una abierta, ella lo consume y la bandeja se queda.
      if (
        event.key === "Escape" &&
        !document.querySelector(
          "[data-radix-popper-content-wrapper],[data-dialog-overlay]",
        )
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (isLoading || !company || !entries.length) return null;

  const toggle = (id: number) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const toggleMany = (ids: number[]) =>
    setSelected((prev) => {
      const allIn = ids.every((id) => prev.includes(id));
      return allIn
        ? prev.filter((id) => !ids.includes(id))
        : [...new Set([...prev, ...ids])];
    });

  const toggleCollapsed = (key: string) =>
    setCollapsed((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );

  const selectedEntries = entries.filter((entry) =>
    selected.includes(entry.id),
  );

  // El estado de la selección, que es lo que habilita cada acción. Se calcula
  // acá y no en el backend porque tiene que responder a cada clic.
  const selectedAircraftIds = [
    ...new Set(selectedEntries.map((entry) => entry.aircraft_id)),
  ];
  const singleAircraft = selectedAircraftIds.length === 1;
  const selectedAcronym = singleAircraft
    ? (selectedEntries[0]?.aircraft_acronym ?? null)
    : null;

  // Lo que ya tiene una OT abierta no vuelve a necesitar otra.
  const attachable = selectedEntries.filter(
    (entry) => !entry.missing && !entry.retired_at && !entry.pending_work_order,
  );
  const canCreateWorkOrder = singleAircraft && attachable.length > 0;

  const newWorkOrderParams = new URLSearchParams({
    aircraft_id: String(selectedAircraftIds[0] ?? ""),
    from_control_queue: "1",
    queue_entry_ids: attachable.map((entry) => entry.id).join(","),
  });

  return (
    <>
      <TooltipProvider disableHoverableContent>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <motion.button
              ref={buttonRef}
              type="button"
              onClick={() => setOpen((prev) => !prev)}
              aria-haspopup="dialog"
              aria-expanded={open}
              aria-label={`Bandeja de trabajo: ${entries.length}`}
              animate={{ x: open ? -panelWidth : 0 }}
              transition={{
                duration: PANEL_DURATION_S,
                ease: [0.22, 1, 0.36, 1],
              }}
              whileHover={open ? undefined : { x: -3 }}
              className={cn(
                "flex flex-col items-center gap-2",
                "fixed right-0 top-1/2 z-1003 -translate-y-1/2",
                "rounded-l-xl px-2 py-4",
                "bg-linear-to-b from-primary to-blue-600 text-white",
                "shadow-[-4px_0_16px_rgba(0,0,0,0.15)]",
                "transition-colors duration-300 hover:from-primary hover:to-blue-500",
              )}
            >
              <ClipboardList className="size-4 shrink-0 drop-shadow-xs" />

              <span className="text-xs font-semibold tracking-wide [writing-mode:vertical-rl]">
                Bandeja de trabajo
              </span>

              <motion.span
                key={entries.length}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-full",
                  "bg-white text-primary ring-2 ring-primary/30",
                  "text-[11px] font-bold shadow-xs",
                )}
              >
                {entries.length > 99 ? "99+" : entries.length}
              </motion.span>
            </motion.button>
          </TooltipTrigger>

          <TooltipContent side="left" className="z-1002">
            {entries.length} ítem{entries.length === 1 ? "" : "s"} en la bandeja
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <aside
        ref={panelRef}
        role="dialog"
        aria-label="Bandeja de trabajo"
        aria-hidden={!open}
        className={cn(
          "fixed inset-y-0 right-0 z-1002",
          "flex w-96 max-w-[calc(100vw-2.5rem)] flex-col",
          "border-l bg-background shadow-[-8px_0_30px_rgba(0,0,0,0.12)]",
          !open && "pointer-events-none",
        )}
        style={{
          transform: `translateX(${open ? "0" : "100%"})`,
          transition: `transform ${PANEL_DURATION_S}s cubic-bezier(0.22,1,0.36,1)`,
        }}
      >
        <header className="flex shrink-0 items-start justify-between gap-2 border-b bg-muted/30 px-4 py-3">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <ClipboardList className="size-4 shrink-0 text-primary" />
              Bandeja de trabajo
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {entries.length} ítem{entries.length === 1 ? "" : "s"} ·{" "}
              {selected.length} seleccionado{selected.length === 1 ? "" : "s"}
            </p>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="-mr-1 h-7 w-7 shrink-0 text-muted-foreground"
            onClick={() => setOpen(false)}
          >
            <X className="size-4" />
            <span className="sr-only">Cerrar</span>
          </Button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="flex flex-col gap-3 p-3">
            {blocks.map((aircraft) => {
              const aircraftIds = aircraft.entries.map((e) => e.id);
              const allSelected = aircraftIds.every((id) =>
                selected.includes(id),
              );

              return (
                <section
                  key={aircraft.aircraftId}
                  className="rounded-lg border bg-card"
                >
                  {/* Nivel 1: la aeronave. Es el límite duro de una OT y de un
                      formato, así que encabeza el bloque. */}
                  <div className="flex items-center gap-2 border-b bg-muted/40 px-2.5 py-2">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={() => toggleMany(aircraftIds)}
                      aria-label={`Seleccionar todo de ${aircraft.acronym}`}
                    />
                    <Plane className="size-3.5 shrink-0 text-muted-foreground" />
                    <p className="flex-1 truncate text-xs font-semibold">
                      {aircraft.acronym}
                    </p>
                    <Badge variant="secondary" className="text-[9px]">
                      {aircraft.entries.length}
                    </Badge>
                  </div>

                  <div className="flex flex-col gap-2 p-2">
                    {aircraft.controls.map((control) => {
                      const controlIds = control.entries.map((e) => e.id);
                      const controlAllSelected = controlIds.every((id) =>
                        selected.includes(id),
                      );
                      const isCollapsed = collapsed.includes(control.key);

                      return (
                        <div key={control.key}>
                          {/* Nivel 2: el control del que vienen. */}
                          <div className="flex items-center gap-2 px-0.5 py-1">
                            <Checkbox
                              checked={controlAllSelected}
                              onCheckedChange={() => toggleMany(controlIds)}
                              aria-label={`Seleccionar todo de ${control.title}`}
                            />
                            <button
                              type="button"
                              onClick={() => toggleCollapsed(control.key)}
                              className="flex min-w-0 flex-1 items-center gap-1 text-left"
                            >
                              <ChevronDown
                                className={cn(
                                  "size-3 shrink-0 text-muted-foreground transition-transform",
                                  isCollapsed && "-rotate-90",
                                )}
                              />
                              <span className="truncate text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                {TYPE_META[control.type].short}
                              </span>
                            </button>
                          </div>

                          {!isCollapsed &&
                            control.groups.map((group) => {
                              const groupIds = group.entries.map((e) => e.id);
                              const groupAllSelected = groupIds.every((id) =>
                                selected.includes(id),
                              );

                              return (
                                <div key={group.key} className="mb-1.5 ml-4">
                                  {/* Nivel 3: el conjunto. Dos conjuntos no
                                      caben en la misma hoja del formato, así
                                      que se seleccionan por separado. */}
                                  <div className="flex items-center gap-1.5 py-1">
                                    <Checkbox
                                      checked={groupAllSelected}
                                      onCheckedChange={() =>
                                        toggleMany(groupIds)
                                      }
                                      className="size-3.5"
                                      aria-label={`Seleccionar ${group.label}`}
                                    />
                                    <GroupIcon kind={group.kind} />
                                    <span className="truncate text-[11px] text-muted-foreground">
                                      {group.label}
                                    </span>
                                  </div>

                                  <ul className="ml-1 flex flex-col gap-1.5">
                                    {group.entries.map((entry) => (
                                      <EntryRow
                                        key={entry.id}
                                        entry={entry}
                                        company={company}
                                        selected={selected.includes(entry.id)}
                                        onToggle={() => toggle(entry.id)}
                                        removing={
                                          removeFromControlQueue.isPending
                                        }
                                        onRemove={() =>
                                          removeFromControlQueue.mutate({
                                            company,
                                            entryId: entry.id,
                                          })
                                        }
                                      />
                                    ))}
                                  </ul>
                                </div>
                              );
                            })}
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        </div>

        <div className="shrink-0 space-y-2 border-t bg-muted/20 p-3">
          {/* Por qué no se puede emitir, en vez de un botón muerto. */}
          {selected.length === 0 ? (
            <p className="rounded-md bg-background p-2 text-center text-xs text-muted-foreground">
              Seleccione ítems para crear una orden de trabajo o emitir un
              formato.
            </p>
          ) : !singleAircraft ? (
            <p className="flex items-start gap-1.5 rounded-md bg-amber-500/10 p-2 text-xs text-amber-700 dark:text-amber-400">
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
              Seleccionó ítems de {selectedAircraftIds.length} aeronaves. Una
              orden de trabajo y un formato son de una sola matrícula.
            </p>
          ) : (
            <p className="flex items-center gap-1.5 rounded-md bg-background p-2 text-xs text-muted-foreground">
              <Check className="size-3.5 shrink-0 text-emerald-600" />
              {selected.length} ítem{selected.length === 1 ? "" : "s"} de{" "}
              {selectedAcronym}
            </p>
          )}

          <Button asChild className="w-full" disabled={!canCreateWorkOrder}>
            {canCreateWorkOrder ? (
              <Link
                href={`/${company}/planificacion/ordenes_trabajo/nueva_orden_trabajo?${newWorkOrderParams.toString()}`}
                onClick={() => setOpen(false)}
              >
                <Wrench className="mr-2 size-4" />
                Crear Orden de Trabajo ({attachable.length})
              </Link>
            ) : (
              <span>
                <Wrench className="mr-2 size-4" />
                Crear Orden de Trabajo
              </span>
            )}
          </Button>

          <QueueFormatsMenu company={company} entryIds={selected} />

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full text-muted-foreground hover:text-destructive"
            disabled={clearControlQueue.isPending}
            onClick={() => clearControlQueue.mutate({ company })}
          >
            {clearControlQueue.isPending ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Trash2 className="mr-2 size-4" />
            )}
            Vaciar la bandeja
          </Button>
        </div>
      </aside>
    </>
  );
}
