"use client";

import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import { TagBadge } from "@/components/misc/TagBadge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Notification } from "@/types/notifications/types";
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
      <FormDialogContent
        icon={Undo2}
        title="Devolución registrada"
        // `returned_at` ya llega como "dd/mm/yyyy HH:mm" en la zona de la
        // empresa: reinterpretarlo con `new Date` lo leería como mm/dd.
        description={`Salida ${data.request_number ?? "N/A"} · ${data.returned_at ?? "Fecha no disponible"}`}
        lockOutside={false}
        className="z-1100 sm:max-w-lg"
        footer={
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        }
      >
        <div className="space-y-3">
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
                <TagBadge tone="slate" className="tabular-nums">
                  {formatQty(item.quantity)} {item.unit}
                </TagBadge>
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
      </FormDialogContent>
    </Dialog>
  );
};

export default DispatchReturnNotificationDialog;
