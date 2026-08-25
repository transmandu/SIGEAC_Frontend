"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Requisition } from "@/types/purchase";

// Los estados son de la SOLICITUD, no de la compra. Nombrarlos con el sujeto
// delante evita que se lean como el estado de la orden o de los articulos.
const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  CREATED: {
    label: "CREADA",
    cls: "bg-slate-500/20 text-slate-700 dark:text-slate-200",
  },
  RECEIVED: {
    label: "RECIBIDA",
    cls: "bg-sky-500/20 text-sky-700 dark:text-sky-200",
  },
  IN_PROGRESS: {
    label: "EN PROCESO",
    cls: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-200",
  },
  // Misma familia calida que EN PROCESO (en compras ambos son "en proceso"),
  // pero mas saturado: aqui conviven en la misma tabla y con el tono identico
  // no se distinguian de un vistazo.
  QUOTED: {
    label: "COTIZADA",
    cls: "bg-amber-600/25 text-amber-800 dark:text-amber-200",
  },
  APPROVED: {
    label: "APROBADA",
    cls: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-200",
  },
  REJECTED: {
    label: "NO APROBADA",
    cls: "bg-red-500/20 text-red-700 dark:text-red-200",
  },
};

const RequisitionStatusCell = ({
  requisition,
}: {
  requisition: Requisition;
}) => {
  const status = requisition.status?.toUpperCase();

  const config = STATUS_CONFIG[status ?? ""] ?? {
    label: status ?? "—",
    cls: "border-border bg-muted text-muted-foreground",
  };

  const summary = requisition.purchase_order_summary;

  // El icono habla de la ORDEN DE COMPRA. Se exigen dos cosas: que exista una
  // orden real, y que la solicitud este APROBADA. Cancelar una orden devuelve
  // la solicitud a COTIZADA, y una fila huerfana en purchase_orders bastaba
  // para pintar la alerta sobre una solicitud que aun no llega a compra.
  const hasPurchaseOrder =
    status === "APPROVED" && (summary?.orders?.length ?? 0) > 0;

  // Se prioriza lo que falta: con varias ordenes, una sin pagar sigue siendo
  // trabajo pendiente aunque otra ya se haya pagado.
  const purchaseHint = !summary || !hasPurchaseOrder
    ? null
    : summary.has_pending
      ? {
          Icon: AlertTriangle,
          cls: "text-amber-600 dark:text-amber-400",
          text: "Esta solicitud ha sido aprobada pero su compra aún no ha sido realizada.",
        }
      : summary.has_paid
        ? {
            Icon: CheckCircle2,
            cls: "text-emerald-600 dark:text-emerald-400",
            text: "Esta solicitud ha sido aprobada y la correspondiente compra realizada, verifique en la Recepción de Artículo el estatus.",
          }
        : null;

  return (
    <div className="flex items-center justify-center gap-1.5 text-center">
      {/* Ancho fijo y dos lineas siempre: el sujeto arriba y el estado abajo.
          Dejarlo fluir hacia una sola linea desalineaba unas filas con otras. */}
      <span
        className={cn(
          "flex w-[6.5rem] shrink-0 flex-col items-center rounded-xl px-2 py-1 text-[11px] font-medium leading-tight select-none cursor-default",
          config.cls,
        )}
      >
        <span>SOLICITUD</span>
        {/* whitespace-nowrap: "NO APROBADA" y "EN PROCESO" caerian a una tercera
            linea y romperian la altura uniforme de las filas. */}
        <span className="whitespace-nowrap">{config.label}</span>
      </span>

      {/* El hueco se reserva siempre para que el badge quede alineado en todas
          las filas, tenga icono o no. */}
      <span className="flex h-4 w-4 shrink-0 items-center justify-center">
        {purchaseHint && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="flex items-center">
                <purchaseHint.Icon
                  className={cn("h-4 w-4", purchaseHint.cls)}
                  aria-label={purchaseHint.text}
                />
              </span>
            </TooltipTrigger>

            <TooltipContent side="top" className="max-w-[260px] text-xs">
              {purchaseHint.text}
            </TooltipContent>
          </Tooltip>
        )}
      </span>
    </div>
  );
};

export default RequisitionStatusCell;
