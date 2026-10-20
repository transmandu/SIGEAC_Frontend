"use client";

import { useEffect, useRef, useState } from "react";
import { format, startOfDay } from "date-fns";
import { Download, History, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { ActionTriggerButton } from "@/components/misc/ActionTriggerButton";
import { SearchableCombobox } from "@/components/misc/SearchableCombobox";
import { Button } from "@/components/ui/button";
import { DatePickerField } from "@/components/ui/DatePickerField";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  fieldClass,
  labelClass,
} from "@/components/forms/mantenimiento/planificacion/_theme";
import {
  ControlSnapshotResource,
  useGetControlSnapshot,
} from "@/hooks/mantenimiento/planificacion/useGetControlSnapshot";
import axiosInstance from "@/lib/axios";
import { fmtNumber } from "@/lib/maintenanceControlCalc";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import { ControlSnapshotBase } from "@/types";

import type { SnapshotGroup } from "./snapshotGroups";

/** Lo mínimo que el diálogo necesita de cada control para ofrecerlo en la lista. */
export interface SnapshotControlOption {
  id: number;
  title: string;
  aircraft?: { acronym?: string | null } | null;
}

/**
 * Lo que cambia entre los cuatro controles: de dónde salen, qué secciones
 * arman y qué columnas llevan. El resto (elegir control y fecha, índice de
 * secciones, PDF) es el mismo diálogo.
 */
export interface ControlSnapshotConfig<
  TSnapshot extends ControlSnapshotBase & { items: unknown[] },
> {
  resource: ControlSnapshotResource;
  /** Rótulo del selector: "Control de Mantenimiento". */
  controlLabel: string;
  description: string;
  /** Texto cuando todavía no se eligió control. */
  selectPrompt: string;
  /** Texto cuando el control no tiene nada que mostrar. */
  emptyLabel: string;
  /** Prefijo del archivo PDF descargado. */
  fileBase: string;
  useControls: (company: string | undefined) => {
    data?: SnapshotControlOption[];
    isLoading: boolean;
  };
  columns: string[];
  buildGroups: (snapshot: TSnapshot) => SnapshotGroup[];
}

/**
 * "Consultar Estado" — botón general de la lista de controles (no por fila,
 * es su propio flujo): elegir QUÉ control, elegir la fecha, ver el estado
 * reconstruido a esa fecha en pantalla, y de ahí sí descargar el PDF. Nada
 * se guarda por día — se recalcula al vuelo (los *ControlSnapshotService).
 */
export function ControlSnapshotDialog<
  TSnapshot extends ControlSnapshotBase & { items: unknown[] },
>({ config }: { config: ControlSnapshotConfig<TSnapshot> }) {
  const { selectedCompany } = useCompanyStore();
  const [open, setOpen] = useState(false);
  const [controlId, setControlId] = useState<string | undefined>(undefined);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isDownloading, setIsDownloading] = useState(false);

  const { data: controls, isLoading: isLoadingControls } = config.useControls(
    selectedCompany?.slug,
  );
  const controlOptions = (controls ?? []).map((control) => ({
    id: control.id,
    name: `${control.aircraft?.acronym ?? "?"} — ${control.title}`,
  }));

  // Después de hoy no hay nada que consultar todavía — el backend valida
  // contra la FECHA (before_or_equal:today), así que el límite va al inicio
  // del día para no recortar la selección de hoy por unos milisegundos. El
  // propio DatePickerField impide elegir más allá de maxDate, así que no
  // hace falta un efecto para corregir `date` después del hecho.
  //
  // No hay límite inferior por created_at del control: el snapshot se
  // reconstruye de vuelos y cumplimientos (que pueden tener fecha anterior a
  // la creación del control vía importación de histórico), no de cuándo se
  // creó el registro. Si a la fecha elegida no hay datos, el snapshot
  // simplemente sale vacío.
  const maxDate = startOfDay(new Date());

  const dateParam = date ? format(date, "yyyy-MM-dd") : undefined;
  const {
    data: snapshot,
    isLoading,
    isError,
  } = useGetControlSnapshot<TSnapshot>(
    config.resource,
    selectedCompany?.slug,
    controlId,
    dateParam,
    open && !!controlId,
  );

  const groups = snapshot ? config.buildGroups(snapshot) : [];

  const scrollRef = useRef<HTMLDivElement>(null);
  // Sección elegida con un clic: mientras esté puesta el scroll no la
  // recalcula, porque la última sección (o varias cortas al final) nunca
  // llega al borde superior y el cálculo la pisaría con la anterior.
  const manualKey = useRef<string | null>(null);
  // La sección marcada solo vale para el control y la fecha en que se marcó:
  // al cambiar cualquiera de los dos se vuelve a la primera sin reiniciar nada.
  const scope = `${controlId}|${dateParam}`;
  const [scrolled, setScrolled] = useState<{
    scope: string;
    key: string;
  } | null>(null);
  const scrolledKey = scrolled?.scope === scope ? scrolled.key : null;
  const activeKey =
    groups.find((g) => g.key === scrolledKey)?.key ?? groups[0]?.key;
  const markSection = (key: string) =>
    setScrolled((prev) =>
      prev?.scope === scope && prev.key === key ? prev : { scope, key },
    );

  const sectionEl = (key: string) =>
    scrollRef.current?.querySelector<HTMLElement>(
      `[data-section-key="${key}"]`,
    ) ?? null;

  const jumpTo = (key: string) => {
    const container = scrollRef.current;
    const el = sectionEl(key);
    if (!container || !el) return;
    manualKey.current = key;
    markSection(key);
    const offset =
      key === groups[0]?.key
        ? 0
        : el.getBoundingClientRect().top -
          container.getBoundingClientRect().top +
          container.scrollTop;
    container.scrollTo({ top: offset, behavior: "smooth" });
  };

  const releaseManualKey = () => {
    manualKey.current = null;
  };

  // La sección activa es la última cuya cabecera ya pasó el borde superior
  // del área desplazable; al llegar al fondo, la última.
  const handleScroll = () => {
    const container = scrollRef.current;
    if (!container || manualKey.current || !groups.length) return;
    const top = container.getBoundingClientRect().top + 1;
    let current = groups[0].key;
    for (const group of groups) {
      const el = sectionEl(group.key);
      if (el && el.getBoundingClientRect().top <= top) current = group.key;
    }
    if (
      container.scrollTop > 0 &&
      container.scrollTop + container.clientHeight >= container.scrollHeight - 2
    ) {
      current = groups[groups.length - 1].key;
    }
    markSection(current);
  };

  useEffect(() => {
    manualKey.current = null;
    scrollRef.current?.scrollTo({ top: 0 });
  }, [controlId, dateParam]);

  const resetAndClose = () => {
    setOpen(false);
    setControlId(undefined);
    setDate(new Date());
  };

  const handleDownload = async () => {
    if (!dateParam || !controlId) return;
    setIsDownloading(true);
    try {
      const response = await axiosInstance.get(
        `/${selectedCompany!.slug}/${config.resource}/${controlId}/snapshot/pdf`,
        { params: { date: dateParam }, responseType: "blob" },
      );
      const blob = new Blob([response.data], { type: "application/pdf" });
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `${config.fileBase}_${dateParam}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(objectUrl);
    } catch {
      toast.error("Oops!", {
        description: "No se pudo generar el PDF del estado a esa fecha.",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <ActionTriggerButton onClick={() => setOpen(true)}>
        <History className="mr-2 h-4 w-4" />
        Consultar Estado
      </ActionTriggerButton>

      <Dialog
        open={open}
        onOpenChange={(next) => (next ? setOpen(true) : resetAndClose())}
      >
        <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="size-4" />
              Consultar Estado a una Fecha
            </DialogTitle>
            <DialogDescription>{config.description}</DialogDescription>
          </DialogHeader>

          {/* Mismo markup de rótulo, exactamente el que usa
              DatePickerField::renderLabel (div h-4 + label leading-none +
              space-y-2 en el contenedor), repetido sobre el combo y el
              botón — construcción idéntica en vez de medida a ojo, así los
              tres calzan solos aunque el rótulo cambie de tamaño. El de PDF
              va oculto con `invisible` (no `hidden`: sigue ocupando su
              espacio). */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_200px_auto]">
            <div className="min-w-0 space-y-2">
              <div className="flex h-4 items-center gap-3">
                <label className={cn(labelClass, "leading-none")}>
                  {config.controlLabel}
                </label>
              </div>
              <SearchableCombobox
                options={controlOptions}
                value={controlId}
                loading={isLoadingControls}
                placeholder="Elija un control..."
                searchPlaceholder="Buscar por aeronave o título..."
                emptyLabel={`No se encontró ningún ${config.controlLabel.toLowerCase()}.`}
                onSelect={(control) => setControlId(String(control.id))}
              />
            </div>

            <div className="min-w-0">
              <DatePickerField
                label="Fecha"
                value={date}
                setValue={(d) => setDate(d ?? undefined)}
                maxYear={new Date().getFullYear()}
                maxDate={maxDate}
              />
            </div>

            <div className="space-y-2">
              <div className="flex h-4 items-center gap-3" aria-hidden>
                <label className={cn(labelClass, "invisible leading-none")}>
                  PDF
                </label>
              </div>
              <Button
                type="button"
                variant="outline"
                className={cn(fieldClass, "w-full gap-1.5 font-normal")}
                onClick={handleDownload}
                disabled={!snapshot || isDownloading}
              >
                {isDownloading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Download className="size-4" />
                )}
                PDF
              </Button>
            </div>
          </div>

          {groups.length > 1 && (
            <nav
              aria-label="Índice de secciones"
              className="flex flex-wrap items-center gap-1 rounded-lg border border-slate-400/40 bg-muted/30 p-1 dark:border-slate-600/40"
            >
              {groups.map((group) => {
                const active = group.key === activeKey;
                return (
                  <button
                    key={group.key}
                    type="button"
                    onClick={() => jumpTo(group.key)}
                    aria-current={active ? "true" : undefined}
                    className={cn(
                      "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs transition-colors",
                      active
                        ? "bg-background font-semibold text-foreground shadow-sm ring-1 ring-slate-400/30 dark:ring-slate-600/40"
                        : "text-muted-foreground hover:bg-background/60 hover:text-foreground",
                    )}
                  >
                    <group.icon
                      className={cn("size-3.5", active && "text-primary")}
                    />
                    {group.title}
                    {group.serial && (
                      <span className="max-w-40 truncate font-normal">
                        <span className="text-muted-foreground">S/N</span>{" "}
                        {group.serial}
                      </span>
                    )}
                    <span className="tabular-nums text-[10px] font-normal text-muted-foreground">
                      {group.count}
                    </span>
                  </button>
                );
              })}
            </nav>
          )}

          <div
            ref={scrollRef}
            onScroll={handleScroll}
            onWheel={releaseManualKey}
            onTouchMove={releaseManualKey}
            onPointerDown={releaseManualKey}
            onKeyDown={releaseManualKey}
            className="min-h-50 flex-1 overflow-y-auto rounded-lg border border-slate-400/40 dark:border-slate-600/40"
          >
            {!controlId ? (
              <p className="p-6 text-center text-sm italic text-muted-foreground">
                {config.selectPrompt}
              </p>
            ) : isLoading ? (
              <p className="p-6 text-center text-sm text-muted-foreground">
                Calculando estado a esa fecha...
              </p>
            ) : isError ? (
              <p className="p-6 text-center text-sm text-destructive">
                No se pudo calcular el estado a esa fecha.
              </p>
            ) : !groups.length ? (
              <p className="p-6 text-center text-sm italic text-muted-foreground">
                {config.emptyLabel}
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    {config.columns.map((column) => (
                      <TableHead
                        key={column}
                        className="bg-muted/40 font-semibold"
                      >
                        {column}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                {groups.map((group) => (
                  <TableBody key={group.key}>
                    <TableRow
                      data-section-key={group.key}
                      className="border-y border-slate-400/40 hover:bg-transparent dark:border-slate-600/40"
                    >
                      <TableCell
                        colSpan={config.columns.length}
                        className="border-l-2 border-l-primary/60 bg-muted/60 py-2 text-sm font-semibold"
                      >
                        <span className="flex items-center gap-2">
                          <group.icon className="size-4 text-muted-foreground" />
                          {group.title}
                          {group.serial && (
                            <span className="font-semibold">
                              <span className="font-normal text-muted-foreground">
                                S/N:
                              </span>{" "}
                              {group.serial}
                            </span>
                          )}
                        </span>
                      </TableCell>
                    </TableRow>
                    {group.rows}
                  </TableBody>
                ))}
              </Table>
            )}
          </div>

          {snapshot && (
            <p className="text-xs text-muted-foreground">
              Aeronave {snapshot.aircraft.acronym}:{" "}
              {fmtNumber(snapshot.aircraft.flight_hours)} hrs ·{" "}
              {fmtNumber(snapshot.aircraft.flight_cycles)} ciclos a esa fecha.
            </p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
