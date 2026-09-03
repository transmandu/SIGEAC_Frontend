"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import EvidenceGallery from "@/components/misc/EvidenceGallery";
import { useGetDispatchReturns } from "@/hooks/mantenimiento/almacen/solicitudes/useGetDispatchReturns";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  History,
  Loader2,
  PackageCheck,
  ShieldAlert,
  User,
} from "lucide-react";

interface DispatchReturnHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dispatchId: number | string;
  requestNumber: string;
}

function formatQty(value: number): string {
  return Number(value.toFixed(4)).toLocaleString("es-VE", {
    maximumFractionDigits: 4,
  });
}

function safeDate(raw: string) {
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return "Fecha no disponible";
  return format(parsed, "dd MMM yyyy 'a las' HH:mm", { locale: es });
}

const DispatchReturnHistoryDialog = ({
  open,
  onOpenChange,
  dispatchId,
  requestNumber,
}: DispatchReturnHistoryDialogProps) => {
  const { data: returns, isLoading, isError } = useGetDispatchReturns(
    dispatchId,
    open
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl flex flex-col max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Historial de devoluciones
          </DialogTitle>
          <DialogDescription>
            Reingresos registrados sobre la salida {requestNumber}.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isLoading && (
            <div className="flex justify-center py-10">
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {isError && (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No se pudo cargar el historial de devoluciones.
            </p>
          )}

          {returns && returns.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
              <div className="rounded-full border bg-muted/40 p-3">
                <PackageCheck className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium">Sin devoluciones</p>
              <p className="text-sm text-muted-foreground">
                Nada de esta salida ha regresado al almacén.
              </p>
            </div>
          )}

          {returns && returns.length > 0 && (
            <div className="space-y-4">
              {returns.map((entry) => {
                const alteredItems = entry.items.filter(
                  (item) => item.condition === "ALTERED"
                ).length;
                const altered = alteredItems > 0;
                // Devolución mixta: parte fue a inspección y parte al almacén,
                // así que la insignia de la cabecera no puede hablar por todos.
                const mixed = altered && alteredItems < entry.items.length;

                return (
                  <div
                    key={entry.id}
                    className={`rounded-lg border p-4 ${
                      altered ? "border-amber-500/40 bg-amber-500/5" : ""
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {altered ? (
                          <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-500" />
                        ) : (
                          <PackageCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
                        )}
                        <Badge variant={altered ? "destructive" : "secondary"}>
                          {!altered
                            ? "Reingresó a almacén"
                            : mixed
                              ? `${alteredItems} de ${entry.items.length} a incoming`
                              : "Enviado a incoming"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground tabular-nums">
                        {safeDate(entry.returned_at)}
                      </p>
                    </div>

                    <div className="mt-3 space-y-1.5">
                      {entry.items.map((item) => (
                        <div
                          // La línea no basta como clave: una misma puede
                          // figurar dos veces en la devolución, una intacta y
                          // otra alterada, y las claves repetidas hacen que
                          // React funda o descarte filas.
                          key={`${item.article_dispatch_order_id}-${item.condition}`}
                          className="flex items-start justify-between gap-3 rounded-md bg-background/60 px-3 py-2"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                              {item.description}
                            </p>
                            {/* Solo en las mixtas: si toda la devolución tuvo
                                el mismo destino, la insignia de arriba ya lo
                                dijo y repetirlo por línea es ruido. */}
                            {mixed && (
                              <p
                                className={`mt-0.5 text-xs ${
                                  item.condition === "ALTERED"
                                    ? "text-amber-600 dark:text-amber-500"
                                    : "text-muted-foreground"
                                }`}
                              >
                                {item.condition === "ALTERED"
                                  ? "A inspección de incoming"
                                  : "Reingresó a almacén"}
                              </p>
                            )}
                            {item.part_number && item.part_number !== "N/A" && (
                              <p className="truncate text-xs text-muted-foreground">
                                P/N {item.part_number}
                                {item.serial && item.serial !== "N/A"
                                  ? ` · S/N ${item.serial}`
                                  : ""}
                              </p>
                            )}
                          </div>
                          <div className="flex shrink-0 flex-col items-end gap-1">
                            <Badge className="tabular-nums">
                              {formatQty(item.quantity)} {item.unit}
                            </Badge>
                            {/* La cifra en base es la que movió el inventario:
                                se muestra al lado cuando la salida se capturó
                                en otra unidad. */}
                            {item.uses_alternate_unit && (
                              <span className="text-[11px] text-muted-foreground tabular-nums">
                                ≈ {formatQty(item.base_quantity)} {item.base_unit}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {!!entry.evidences?.length && (
                      <div className="mt-3">
                        <p className="mb-1.5 text-xs text-muted-foreground">
                          Cómo fue devuelto
                        </p>
                        <EvidenceGallery
                          images={entry.evidences}
                          title="Evidencia de devolución"
                        />
                      </div>
                    )}

                    <p className="mt-3 text-sm italic text-muted-foreground">
                      &ldquo;{entry.justification}&rdquo;
                    </p>

                    <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <User className="h-3.5 w-3.5" />
                      Registrado por {entry.returned_by}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter className="border-t px-6 py-4">
          <DialogClose asChild>
            <Button variant="outline">Cerrar</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DispatchReturnHistoryDialog;
