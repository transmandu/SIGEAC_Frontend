"use client";

import { useRequestEngineeringCheck } from "@/actions/mantenimiento/almacen/inventario/articulos/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import type { EngineeringCheckStatus } from "@/types/inventory/queues";
import type { TransitArticle } from "@/types/purchase/in-transit";
import { BadgeCheck, ClipboardCheck, Loader2 } from "lucide-react";
import { useState } from "react";

// Los mismos roles que el backend deja pedir el chequeo.
const REQUEST_ROLES = [
  "SUPERUSER",
  "JEFE_ALMACEN",
  "ANALISTA_ALMACEN",
  "JEFE_MANTENIMIENTO",
];

const TOOLTIPS: Record<EngineeringCheckStatus, string> = {
  NOT_REQUESTED:
    "Solicitar que ingeniería verifique la información del artículo",
  REQUESTED: "Pendiente de ingeniería: el artículo está retenido",
  APPROVED: "Información aprobada por ingeniería",
};

/**
 * Estado del chequeo de ingeniería de un artículo en recepción.
 *
 * Sin solicitar es opcional y se puede pedir en cualquier momento antes del
 * incoming; solicitado retiene el artículo (la tabla bloquea Incoming y el pase
 * directo); aprobado queda como constancia de que ingeniería dio el visto bueno.
 */
export function EngineeringCheckButton({
  article,
}: {
  article: TransitArticle;
}) {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { requestEngineeringCheck } = useRequestEngineeringCheck();

  const status = article.engineering_check?.status ?? "NOT_REQUESTED";
  const canRequest = (user?.roles ?? []).some((role) =>
    REQUEST_ROLES.includes(role.name),
  );
  const interactive = status === "NOT_REQUESTED" && canRequest;

  const handleRequest = async () => {
    try {
      await requestEngineeringCheck.mutateAsync({ id: article.id });
      setOpen(false);
    } catch {
      // El toast de error lo emite la mutación; el diálogo queda abierto para
      // reintentar.
    }
  };

  const Icon = status === "APPROVED" ? BadgeCheck : ClipboardCheck;

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {/* Un span envuelve al botón: un botón deshabilitado no dispara el
                tooltip, y los estados aprobado y solicitado lo necesitan. */}
            <span>
              <Button
                variant="outline"
                size="sm"
                disabled={!interactive}
                onClick={() => setOpen(true)}
                className={cn(
                  "h-7 w-7 p-0 disabled:opacity-100",
                  status === "APPROVED" &&
                    "border-emerald-300 bg-emerald-50 text-emerald-600 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-500",
                  status === "REQUESTED" &&
                    "border-amber-300 bg-amber-50 text-amber-600 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-500",
                  status === "NOT_REQUESTED" && "text-muted-foreground",
                )}
              >
                <Icon className="size-3.5" />
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            {status === "NOT_REQUESTED" && !canRequest
              ? "Sin chequeo de ingeniería solicitado"
              : TOOLTIPS[status]}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <AlertDialog
        open={open}
        onOpenChange={(next) => {
          if (!next && requestEngineeringCheck.isPending) return;
          setOpen(next);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <ClipboardCheck className="size-5 text-amber-500" />
              Solicitar chequeo de ingeniería
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>
                  Ingeniería revisará la información del artículo{" "}
                  <span className="font-mono font-semibold text-foreground">
                    P/N: {article.part_number}
                  </span>{" "}
                  y le dará su visto bueno.
                </p>
                <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-400">
                  Una vez solicitado, el artículo queda{" "}
                  <strong>retenido</strong>: no podrá pasar a incoming, al
                  inventario ni editarse hasta que ingeniería lo apruebe.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={requestEngineeringCheck.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={requestEngineeringCheck.isPending}
              onClick={(e) => {
                e.preventDefault();
                handleRequest();
              }}
              className="gap-1.5"
            >
              {requestEngineeringCheck.isPending && (
                <Loader2 className="size-3.5 animate-spin" />
              )}
              Solicitar chequeo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
