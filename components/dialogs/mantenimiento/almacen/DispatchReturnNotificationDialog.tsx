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
import { Notification } from "@/types/notifications/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { PackageCheck, ShieldAlert, Undo2 } from "lucide-react";

interface DispatchReturnNotificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notification: Notification;
}

function formatQty(value: number): string {
  return Number(value.toFixed(4)).toLocaleString("es-VE", {
    maximumFractionDigits: 4,
  });
}

// El backend ya manda "dd/mm/yyyy HH:mm" formateado; solo se re-envuelve si
// llega algo que Date sepa parsear, para no reventar con el string tal cual.
function safeDate(raw?: string) {
  if (!raw) return "Fecha no disponible";
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime())
    ? raw
    : format(parsed, "dd MMM yyyy 'a las' HH:mm", { locale: es });
}

/**
 * Detalle de una devolución de salida, abierto desde la campana.
 *
 * Reemplaza la navegación que tenía antes: administración y mantenimiento no
 * pueden abrir /almacen/solicitudes/salida, así que el backend manda el
 * detalle completo en el payload y este diálogo lo muestra en el sitio.
 */
const DispatchReturnNotificationDialog = ({
  open,
  onOpenChange,
  notification,
}: DispatchReturnNotificationDialogProps) => {
  const { data } = notification;
  const items = data.items ?? [];
  const damagedCount = items.filter((item) => item.damaged).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg flex flex-col max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="flex items-center gap-2">
            <Undo2 className="h-5 w-5" />
            Devolución registrada
          </DialogTitle>
          <DialogDescription>
            Salida {data.request_number ?? "N/A"} · {safeDate(data.returned_at)}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {items.map((item, index) => (
            <div
              key={`${item.part_number}-${index}`}
              className={`rounded-lg border p-3 ${
                item.damaged ? "border-amber-500/40 bg-amber-500/5" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {item.part_number}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {item.batch_name ?? "Sin lote"}
                    {item.category ? ` · ${item.category}` : ""}
                  </p>
                </div>
                <Badge className="shrink-0 tabular-nums">
                  {formatQty(item.quantity)} {item.unit}
                </Badge>
              </div>

              <div className="mt-2 flex items-center gap-1.5">
                {item.damaged ? (
                  <>
                    <ShieldAlert className="h-3.5 w-3.5 text-amber-600 dark:text-amber-500" />
                    <span className="text-xs font-medium text-amber-600 dark:text-amber-500">
                      Con daño físico: pasó a inspección de incoming
                    </span>
                  </>
                ) : (
                  <>
                    <PackageCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-500" />
                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-500">
                      Reingresó al almacén
                    </span>
                  </>
                )}
              </div>
            </div>
          ))}

          {data.justification && (
            <p className="text-sm italic text-muted-foreground">
              &ldquo;{data.justification}&rdquo;
            </p>
          )}

          {damagedCount > 0 && (
            <p className="text-xs text-muted-foreground">
              Los reportes de costos ya descargados que incluyan esta fecha
              quedaron desactualizados: vuelva a generarlos.
            </p>
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

export default DispatchReturnNotificationDialog;
