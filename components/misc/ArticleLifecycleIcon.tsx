"use client";

import { CheckCircle2, CreditCard, PackageCheck, PackageOpen, Truck } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { ArticleLifecycleStage } from "@/types/purchase";

/**
 * El estado de compra del articulo se congela al aprobar la cotizacion, pero el
 * articulo sigue moviendose: se paga la orden, nace fisicamente, almacen lo
 * recibe. Quien creo la solicitud no ve nada de eso porque ocurre dentro del
 * modulo de compras, asi que este icono le resume donde va.
 */
const STAGE_CONFIG: Record<
  ArticleLifecycleStage,
  { Icon: typeof Truck; cls: string; text: string }
> = {
  APPROVED: {
    Icon: CreditCard,
    cls: "text-amber-600 dark:text-amber-400",
    text: "La orden de compra ya fue aprobada, a la espera de que Compras realice el pago. El artículo todavía no existe en el sistema.",
  },
  PAID: {
    Icon: PackageCheck,
    cls: "text-sky-600 dark:text-sky-400",
    text: "La compra ya fue pagada. El artículo está pendiente de registrarse en la recepción de almacén.",
  },
  TRANSIT: {
    Icon: Truck,
    cls: "text-blue-600 dark:text-blue-400",
    text: "El artículo ya fue comprado y viene en camino. Puede seguirlo en Recepción de Artículos.",
  },
  RECEPTION: {
    Icon: PackageOpen,
    cls: "text-indigo-600 dark:text-indigo-400",
    text: "El artículo ya llegó a almacén y está en proceso de recepción. Aún no es stock disponible.",
  },
  RECEIVED: {
    Icon: CheckCircle2,
    cls: "text-emerald-600 dark:text-emerald-400",
    text: "El artículo ya fue recibido e ingresado al inventario.",
  },
};

const ArticleLifecycleIcon = ({
  stage,
  className,
}: {
  stage?: ArticleLifecycleStage | null;
  className?: string;
}) => {
  if (!stage) return null;

  const config = STAGE_CONFIG[stage];

  if (!config) return null;

  const { Icon, cls, text } = config;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={cn("flex shrink-0 items-center", className)}>
          <Icon className={cn("h-4 w-4", cls)} aria-label={text} />
        </span>
      </TooltipTrigger>

      <TooltipContent side="top" className="max-w-[280px] text-xs">
        {text}
      </TooltipContent>
    </Tooltip>
  );
};

export default ArticleLifecycleIcon;
