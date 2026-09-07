"use client";

import { useEffect, useState } from "react";
import { format, startOfDay } from "date-fns";
import { Download, History, Loader2 } from "lucide-react";

import { ActionTriggerButton } from "@/components/misc/ActionTriggerButton";
import { Button } from "@/components/ui/button";
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
import { DatePickerField } from "@/components/ui/DatePickerField";
import { useCompanyStore } from "@/stores/CompanyStore";
import axiosInstance from "@/lib/axios";
import { useGetMaintenanceControls } from "@/hooks/mantenimiento/planificacion/useGetMaintenanceControls";
import { useGetMaintenanceControlSnapshot } from "@/hooks/mantenimiento/planificacion/useGetMaintenanceControlSnapshot";
import { computeMaintenanceItem, fmtNumber, STATUS_META } from "@/lib/maintenanceControlCalc";
import { SearchableCombobox } from "@/components/misc/SearchableCombobox";
import { fieldClass, labelClass } from "@/components/forms/mantenimiento/planificacion/_theme";
import { MaintenanceControlSnapshotItem } from "@/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

/**
 * Agrupa los ítems del snapshot igual que el detalle del control en vivo:
 * Certificados, Servicios de Aeronave, y un grupo por cada parte
 * (part_label) presente — así se lee igual de organizado que la pantalla de
 * la que viene la reconstrucción histórica, no una lista plana.
 */
function groupSnapshotItems(items: MaintenanceControlSnapshotItem[]) {
  const certificates = items.filter((i) => i.category === "CERTIFICATE");
  // Un servicio es "de aeronave" cuando no cuelga de ninguna parte: se mira
  // maintenance_control_part_id, no part_label — una parte sin part_name ni
  // part_number deja part_label vacío y sus servicios caían acá.
  const aircraftServices = items.filter(
    (i) => i.category === "SERVICE" && !i.maintenance_control_part_id,
  );

  const groups: { key: string; title: string; items: MaintenanceControlSnapshotItem[] }[] = [];
  if (certificates.length) groups.push({ key: "certificates", title: "Certificados", items: certificates });
  if (aircraftServices.length) {
    groups.push({ key: "aircraft-services", title: "Servicios de Aeronave", items: aircraftServices });
  }

  // Se agrupa por id de parte, no por su rótulo: dos partes del mismo tipo
  // pueden compartir nombre (dos motores iguales sin serial cargado) y sus
  // servicios terminaban mezclados en un solo grupo.
  const partIds = Array.from(
    new Set(
      items
        .filter((i) => i.maintenance_control_part_id)
        .map((i) => i.maintenance_control_part_id as number),
    ),
  );
  partIds.forEach((partId) => {
    const partItems = items.filter((i) => i.maintenance_control_part_id === partId);
    groups.push({
      key: `part-${partId}`,
      title: partItems[0]?.part_label || "Parte",
      items: partItems,
    });
  });

  return groups;
}

/**
 * "Consultar Estado" — botón general de la lista de controles (no por fila,
 * es su propio flujo): elegir QUÉ control, elegir la fecha, ver el estado
 * reconstruido a esa fecha en pantalla, y de ahí sí descargar el PDF. Nada
 * se guarda por día — se recalcula al vuelo (MaintenanceControlSnapshotService).
 */
export function MaintenanceControlSnapshotDialog() {
  const { selectedCompany } = useCompanyStore();
  const [open, setOpen] = useState(false);
  const [controlId, setControlId] = useState<string | undefined>(undefined);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isDownloading, setIsDownloading] = useState(false);

  const { data: controls, isLoading: isLoadingControls } = useGetMaintenanceControls(selectedCompany?.slug);
  const controlOptions = (controls ?? []).map((control) => ({
    id: control.id,
    name: `${control.aircraft?.acronym ?? "?"} — ${control.title}`,
  }));

  // Antes de que existiera el control no hay cumplimientos ni historial que
  // reconstruir; después de hoy tampoco hay nada que consultar todavía. Ambos
  // límites al inicio del día: el backend valida contra la FECHA
  // (before_or_equal:today), así que comparar con la hora exacta recortaba la
  // selección de hoy por unos milisegundos.
  const selectedControl = controls?.find((c) => String(c.id) === controlId);
  const minDate = selectedControl?.created_at ? startOfDay(new Date(selectedControl.created_at)) : undefined;
  const maxDate = startOfDay(new Date());

  // Si el usuario ya tenía una fecha elegida y cambia de control (o el
  // control recién cargó su created_at), esa fecha puede quedar fuera del
  // rango del nuevo control — se reajusta al límite más cercano en vez de
  // dejar una selección que el backend rechazaría o daría un resultado vacío.
  useEffect(() => {
    if (!date) return;
    const current = startOfDay(date);
    if (minDate && current < minDate) {
      setDate(minDate);
    } else if (current > maxDate) {
      setDate(maxDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controlId, minDate?.getTime()]);

  const dateParam = date ? format(date, "yyyy-MM-dd") : undefined;
  const { data: snapshot, isLoading, isError } = useGetMaintenanceControlSnapshot(
    selectedCompany?.slug,
    controlId,
    dateParam,
    open && !!controlId,
  );

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
        `/${selectedCompany!.slug}/maintenance-controls/${controlId}/snapshot/pdf`,
        { params: { date: dateParam }, responseType: "blob" },
      );
      const blob = new Blob([response.data], { type: "application/pdf" });
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `estado_control_mantenimiento_${dateParam}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(objectUrl);
    } catch {
      toast.error("Oops!", { description: "No se pudo generar el PDF del estado a esa fecha." });
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

      <Dialog open={open} onOpenChange={(next) => (next ? setOpen(true) : resetAndClose())}>
        <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="size-4" />
              Consultar Estado a una Fecha
            </DialogTitle>
            <DialogDescription>
              Reconstruye cómo estaba un control de mantenimiento en una fecha pasada, a partir de su historial de cumplimientos y vuelos.
            </DialogDescription>
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
                <label className={cn(labelClass, "leading-none")}>Control de Mantenimiento</label>
              </div>
              <SearchableCombobox
                options={controlOptions}
                value={controlId}
                loading={isLoadingControls}
                placeholder="Elija un control..."
                searchPlaceholder="Buscar por aeronave o título..."
                emptyLabel="No se encontró ningún control de mantenimiento."
                onSelect={(control) => setControlId(String(control.id))}
              />
            </div>

            <div className="min-w-0">
              <DatePickerField
                label="Fecha"
                value={date}
                setValue={(d) => setDate(d ?? undefined)}
                maxYear={new Date().getFullYear()}
                minDate={minDate}
                maxDate={maxDate}
              />
            </div>

            <div className="space-y-2">
              <div className="flex h-4 items-center gap-3" aria-hidden>
                <label className={cn(labelClass, "invisible leading-none")}>PDF</label>
              </div>
              <Button
                type="button"
                variant="outline"
                className={cn(fieldClass, "w-full gap-1.5 font-normal")}
                onClick={handleDownload}
                disabled={!snapshot || isDownloading}
              >
                {isDownloading ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
                PDF
              </Button>
            </div>
          </div>

          <div className="min-h-[200px] flex-1 overflow-y-auto rounded-lg border border-slate-400/40 dark:border-slate-600/40">
            {!controlId ? (
              <p className="p-6 text-center text-sm italic text-muted-foreground">
                Elija un control de mantenimiento para ver su estado.
              </p>
            ) : isLoading ? (
              <p className="p-6 text-center text-sm text-muted-foreground">Calculando estado a esa fecha...</p>
            ) : isError ? (
              <p className="p-6 text-center text-sm text-destructive">No se pudo calcular el estado a esa fecha.</p>
            ) : !snapshot?.items.length ? (
              <p className="p-6 text-center text-sm italic text-muted-foreground">
                Este control no tiene certificados ni servicios registrados.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="bg-muted/40 font-semibold">Nombre</TableHead>
                    <TableHead className="bg-muted/40 font-semibold">Frecuencia</TableHead>
                    <TableHead className="bg-muted/40 font-semibold">Aplicada</TableHead>
                    <TableHead className="bg-muted/40 font-semibold">Próximo</TableHead>
                    <TableHead className="bg-muted/40 font-semibold">Remanente</TableHead>
                    <TableHead className="bg-muted/40 font-semibold">Estimación</TableHead>
                    <TableHead className="bg-muted/40 font-semibold">Realizado Por</TableHead>
                  </TableRow>
                </TableHeader>
                {groupSnapshotItems(snapshot.items).map((group) => (
                  <TableBody key={group.key}>
                    <TableRow className="hover:bg-transparent">
                      <TableCell
                        colSpan={7}
                        className="bg-muted/20 py-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground/80"
                      >
                        {group.title}
                      </TableCell>
                    </TableRow>
                    {group.items.map((item) => {
                      const computed = computeMaintenanceItem(item);
                      const meta = STATUS_META[computed.status];
                      return (
                        <TableRow key={item.id} className={meta.row}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>
                            {computed.frequency}
                            {computed.extras.map((extra, i) => (
                              <span key={i} className="block text-xs text-muted-foreground">Ó {extra.frequency}</span>
                            ))}
                          </TableCell>
                          <TableCell>{computed.applied}</TableCell>
                          <TableCell>
                            {computed.next}
                            {computed.extras.map((extra, i) => (
                              <span key={i} className="block text-xs text-muted-foreground">{extra.next}</span>
                            ))}
                          </TableCell>
                          <TableCell>
                            <span className={cn("inline-flex items-center gap-1.5 font-semibold", meta.text)}>
                              <span className={cn("size-1.5 shrink-0 rounded-full", meta.dot)} />
                              {computed.remaining}
                            </span>
                          </TableCell>
                          <TableCell>
                            {computed.estimate}
                            {computed.extras.map((extra, i) => (
                              <span key={i} className="block text-xs text-muted-foreground">{extra.estimate}</span>
                            ))}
                          </TableCell>
                          <TableCell>{computed.providerName}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                ))}
              </Table>
            )}
          </div>

          {snapshot && (
            <p className="text-xs text-muted-foreground">
              Aeronave {snapshot.aircraft.acronym}: {fmtNumber(snapshot.aircraft.flight_hours)} hrs · {fmtNumber(snapshot.aircraft.flight_cycles)} ciclos a esa fecha.
            </p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
