"use client";

import { useUpdateArticleStatus } from "@/actions/mantenimiento/almacen/inventario/articulos/actions";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { blockingPendingRequirements } from "@/lib/incoming-readiness";
import type { TransitArticle } from "@/types/purchase/in-transit";
import { FileWarning, Loader2, PackageCheck } from "lucide-react";

/**
 * Pase de un artículo en tránsito a recepción, hecho por quien lo recibe en el
 * almacén. Es el mismo cambio de estado que compras puede hacer desde su
 * pantalla; el servidor lo rechaza mientras haya documentación requerida sin
 * consignar (salvo en consumibles), así que aquí no se ofrece hasta que compras la consigne.
 */
export function MoveToReceptionButton({
  article,
}: {
  article: TransitArticle;
}) {
  const { updateArticleStatus } = useUpdateArticleStatus();

  const pendingDocuments = blockingPendingRequirements(article);
  const blocked = pendingDocuments.length > 0;

  const handleMove = async () => {
    try {
      await updateArticleStatus.mutateAsync({
        id: article.id,
        status: "RECEPTION",
      });
    } catch {
      // El toast de error lo emite la mutación; aquí solo se suelta el botón.
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {/* El span recibe el puntero cuando el botón está deshabilitado, para
              que el tooltip explique por qué. */}
          <span>
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-24 justify-center gap-1 px-2 text-xs"
              disabled={updateArticleStatus.isPending || blocked}
              onClick={handleMove}
            >
              {updateArticleStatus.isPending ? (
                <Loader2 className="size-3 animate-spin" />
              ) : blocked ? (
                <>
                  <FileWarning className="size-3" />
                  Recepción
                </>
              ) : (
                <>
                  <PackageCheck className="size-3" />
                  Recepción
                </>
              )}
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs text-xs">
          {blocked ? (
            <>
              <p className="font-semibold">Faltan documentos por consignar</p>
              <ul className="mt-1 space-y-0.5">
                {pendingDocuments.map((requirement) => (
                  <li key={requirement.id}>
                    • {requirement.document_type?.name ?? "Documento"}
                  </li>
                ))}
              </ul>
              <p className="mt-1.5 text-muted-foreground">
                Compras debe consignarlos antes de que el artículo pase a
                recepción.
              </p>
            </>
          ) : (
            "Registrar que el artículo ya llegó al almacén y pasarlo a recepción"
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
