"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGetArticleStatusHistory } from "@/hooks/mantenimiento/almacen/articulos/useGetArticleStatusHistory";
import {
  isMovementMilestone,
  timelineEntryLabel,
} from "@/lib/warehouse/statuses";
import { useCompanyStore } from "@/stores/CompanyStore";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Loader2 } from "lucide-react";

/**
 * "3 d 4 h", "45 min": la unidad mayor y la que le sigue bastan para leer la
 * permanencia. Se toman contiguas —no las dos mayores con valor— para no
 * producir saltos como "296 d 57 min", que se lee como si faltara algo.
 */
const formatDuration = (seconds: number) => {
  if (seconds < 60) return "menos de 1 min";

  const units = [
    { label: "d", value: Math.floor(seconds / 86400) },
    { label: "h", value: Math.floor((seconds % 86400) / 3600) },
    { label: "min", value: Math.floor((seconds % 3600) / 60) },
  ];

  const first = units.findIndex((unit) => unit.value > 0);

  return units
    .slice(first, first + 2)
    .filter((unit) => unit.value > 0)
    .map((unit) => `${unit.value} ${unit.label}`)
    .join(" ");
};

const formatMoment = (value: string) => {
  const date = parseISO(value);
  return isNaN(date.getTime())
    ? "Fecha inválida"
    : format(date, "dd/MM/yyyy HH:mm", { locale: es });
};

export default function ArticleStatusHistoryDialog({
  articleId,
  open,
  onOpenChange,
}: {
  articleId: string | number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { selectedCompany } = useCompanyStore();

  // Solo se consulta con el diálogo abierto: la tabla monta una acción por fila.
  const { data, isLoading, isError } = useGetArticleStatusHistory(
    articleId,
    selectedCompany?.slug,
    open,
  );

  const timeline = data?.timeline ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-center">
            Historial de movimiento de estados
          </DialogTitle>
          <DialogDescription className="text-center">
            Estados por los que ha pasado el artículo, del más reciente al más
            antiguo.
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="flex justify-center py-8">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {isError && (
          <p className="text-center text-sm text-muted-foreground py-6">
            No se pudo cargar el historial de estados.
          </p>
        )}

        {!isLoading && !isError && timeline.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-6">
            Este artículo no tiene movimientos de estado registrados.
          </p>
        )}

        {!isLoading && !isError && timeline.length > 0 && (
          <ScrollArea className="max-h-[60vh] pr-4">
            <ol className="relative border-l border-border ml-3 space-y-6 py-2">
              {[...timeline].reverse().map((entry) => {
                const isCurrent = entry.until === null;
                const isMilestone = isMovementMilestone(entry.status);

                return (
                  <li key={`${entry.from}-${entry.status}`} className="ml-6">
                    <span
                      className={`absolute -left-[7px] flex size-3.5 rounded-full border-2 border-background ${
                        isCurrent ? "bg-primary" : "bg-muted-foreground"
                      }`}
                    />

                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant={
                          isCurrent
                            ? "default"
                            : isMilestone
                              ? "outline"
                              : "secondary"
                        }
                      >
                        {timelineEntryLabel(entry.status)}
                      </Badge>
                      {isCurrent && (
                        <span className="text-xs text-muted-foreground italic">
                          estado actual
                        </span>
                      )}
                    </div>

                    <p className="text-sm mt-1">
                      {formatMoment(entry.from)}
                      {entry.until ? ` → ${formatMoment(entry.until)}` : ""}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {isCurrent ? "Lleva " : "Permaneció "}
                      <span className="font-semibold">
                        {formatDuration(entry.seconds)}
                      </span>
                      {entry.registered_by ? ` · ${entry.registered_by}` : ""}
                    </p>
                  </li>
                );
              })}
            </ol>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
