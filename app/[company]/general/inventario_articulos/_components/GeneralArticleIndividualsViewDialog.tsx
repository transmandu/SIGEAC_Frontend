"use client";

import { Boxes, Loader2, ScanBarcode, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetGeneralArticleIndividuals } from "@/hooks/mantenimiento/almacen/almacen_general/useGeneralArticleIndividuals";
import {
  INDIVIDUAL_STATUS_LABEL,
  type IndividualStatus,
} from "@/types/general-article-individual";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  articleId: number | null;
  description: string;
  unit?: string | null;
}

const STATUS_VARIANT: Record<
  IndividualStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  STORED: "default",
  INTOOLBOX: "secondary",
  DISPATCHED: "secondary",
  MAINTENANCE: "outline",
  IN_TRANSFER: "outline",
  DISPOSED: "destructive",
};

/**
 * Artículos individuales de un artículo general, solo para consultar: los
 * identificados y, al final, lo que no tiene identificador. Identificar, corregir
 * o dar de baja se hace desde el almacén.
 */
export function GeneralArticleIndividualsViewDialog({
  open,
  onOpenChange,
  articleId,
  description,
  unit,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        {articleId !== null && (
          <Body
            articleId={articleId}
            description={description}
            unit={unit}
            open={open}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

// Vive dentro del contenido del diálogo: al cerrarse se desmonta y la búsqueda
// se olvida sola.
function Body({
  articleId,
  description,
  unit,
  open,
}: {
  articleId: number;
  description: string;
  unit?: string | null;
  open: boolean;
}) {
  const { data, isLoading } = useGetGeneralArticleIndividuals(articleId, open);
  const [query, setQuery] = useState("");

  // Los dados de baja ya no forman parte de lo que hay.
  const individuals = useMemo(
    () => (data?.individuals ?? []).filter((i) => i.status !== "DISPOSED"),
    [data],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return individuals;
    return individuals.filter((i) => i.identifier.toLowerCase().includes(q));
  }, [individuals, query]);

  const unidentified = data?.summary.anonymous ?? 0;

  return (
    <>
      <DialogHeader>
        <DialogTitle>{description}</DialogTitle>
        <DialogDescription>
          {isLoading
            ? "Cargando..."
            : `${individuals.length} identificado${individuals.length === 1 ? "" : "s"} · ${unidentified} sin identificar`}
        </DialogDescription>
      </DialogHeader>

      {individuals.length > 8 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por identificador"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="max-h-[60vh] overflow-y-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Identificador</TableHead>
                <TableHead className="text-center">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    <span className="flex items-center gap-2">
                      <ScanBarcode className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      <span className="break-all">{item.identifier}</span>
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={STATUS_VARIANT[item.status]}
                      className="uppercase"
                    >
                      {INDIVIDUAL_STATUS_LABEL[item.status]}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}

              {individuals.length > 0 && filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} className="h-16 text-center">
                    No hay resultados.
                  </TableCell>
                </TableRow>
              )}

              {unidentified > 0 && (
                <TableRow className="bg-amber-50/70 dark:bg-amber-950/20">
                  <TableCell className="font-medium">
                    <span className="flex items-center gap-2">
                      <Boxes className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                      <span>
                        Sin identificar
                        <span className="block text-xs font-normal text-muted-foreground">
                          Sin identificador único
                        </span>
                      </span>
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant="secondary"
                      className="px-3 py-1 text-xs font-bold tabular-nums"
                    >
                      {unidentified}
                      {unit ? ` ${unit}` : ""}
                    </Badge>
                  </TableCell>
                </TableRow>
              )}

              {individuals.length === 0 && unidentified === 0 && (
                <TableRow>
                  <TableCell colSpan={2} className="h-16 text-center">
                    No hay existencia.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}
