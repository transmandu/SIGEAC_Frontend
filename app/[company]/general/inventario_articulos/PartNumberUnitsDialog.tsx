"use client";

import { AvailabilityBadge } from "@/components/tables/GeneralArticleConsultaColumns";
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
import type { CompanyInventoryFilters } from "@/hooks/mantenimiento/almacen/inventario/useCompanyInventoryArticles";
import { useCompanyPartNumberArticles } from "@/hooks/mantenimiento/almacen/inventario/useCompanyPartNumberArticles";
import { formatCondition } from "@/lib/warehouse/conditions";
import { batchCategoryLabelEsUpper } from "@/lib/batches_categories";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search } from "lucide-react";
import { useMemo, useState } from "react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partNumber: string;
  /** Filtros de la tabla: el detalle muestra lo mismo que cuenta la fila. */
  filters: CompanyInventoryFilters;
}

export function PartNumberUnitsDialog({
  open,
  onOpenChange,
  partNumber,
  filters,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <UnitsBody partNumber={partNumber} filters={filters} open={open} />
      </DialogContent>
    </Dialog>
  );
}

// Vive dentro del contenido del diálogo: al cerrarse se desmonta y la búsqueda
// se olvida sola.
function UnitsBody({
  partNumber,
  filters,
  open,
}: {
  partNumber: string;
  filters: CompanyInventoryFilters;
  open: boolean;
}) {
  const { data, isLoading } = useCompanyPartNumberArticles(
    partNumber,
    filters,
    open,
  );
  const units = useMemo(() => data?.rows ?? [], [data]);
  const total = data?.total ?? 0;
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return units;
    return units.filter((a) =>
      `${a.serial ?? ""} ${a.lot_number ?? ""}`.toLowerCase().includes(q),
    );
  }, [units, query]);

  const first = units[0];

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex flex-wrap items-center gap-2">
          {partNumber}
          {first && (
            <Badge variant="outline">
              {batchCategoryLabelEsUpper(first.category)}
            </Badge>
          )}
        </DialogTitle>
        <DialogDescription>
          {first?.description || "Sin descripción"} ·{" "}
          {isLoading
            ? "Cargando..."
            : query.trim()
              ? `${filtered.length} de ${units.length} unidad(es)`
              : units.length < total
                ? `${units.length} de ${total} unidad(es)`
                : `${total} unidad(es)`}
        </DialogDescription>
      </DialogHeader>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por serial o lote"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="max-h-[60vh] overflow-y-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">Serial / Lote</TableHead>
                <TableHead className="text-center">Condición</TableHead>
                <TableHead className="text-center">Disponibilidad</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="h-20 text-center">
                    No hay resultados.
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((article) => {
                const condition = formatCondition(article.condition);
                const serialOrLot = article.serial || article.lot_number;

                return (
                  <TableRow key={article.id}>
                    <TableCell className="text-center font-medium">
                      {serialOrLot ?? (
                        <span className="text-muted-foreground italic">
                          N/A
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {condition ? (
                        <>
                          <span className="font-bold">{condition.es}</span>{" "}
                          <span className="text-xs text-muted-foreground italic">
                            ({condition.en})
                          </span>
                        </>
                      ) : (
                        <span className="text-muted-foreground font-bold">
                          SIN CONDICIÓN
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <AvailabilityBadge
                        quantity={article.available_quantity}
                        unit={article.unit?.value ?? article.unit?.label}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}
