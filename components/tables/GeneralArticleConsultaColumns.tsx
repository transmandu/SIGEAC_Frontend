"use client";

import { type AppColumnDef } from "@/lib/table";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import { Badge } from "@/components/ui/badge";
import { formatQuantity } from "@/lib/utils";
import type { CompanyInventoryGeneralArticle } from "@/types/inventory";

/**
 * Artículos generales vistos desde fuera del almacén.
 *
 * Tabla aparte de la del almacén: aquí se consulta qué hay y cuánto hay
 * disponible, sin niveles de stock, imagen ni acciones. Sin existencia se
 * muestra "No disponible"; con existencia, la cantidad con su unidad.
 */
export const generalConsultaColumns: AppColumnDef<CompanyInventoryGeneralArticle>[] =
  [
    {
      accessorKey: "description",
      enableSorting: false,
      header: ({ column }) => (
        <div className="flex justify-center">
          <DataTableColumnHeader column={column} title="Descripción" />
        </div>
      ),
      cell: ({ row }) => {
        const value = row.original.description?.trim() || "N/A";

        return (
          <div className="flex justify-center">
            <div className="max-w-130">
              <p className="text-center font-bold text-sm" title={value}>
                {value}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "brand_model",
      enableSorting: false,
      header: ({ column }) => (
        <div className="flex justify-center">
          <DataTableColumnHeader column={column} title="Marca / Modelo" />
        </div>
      ),
      cell: ({ row }) => {
        const value = row.original.brand_model?.trim() || "N/A";

        return (
          <div className="flex justify-center">
            <div className="max-w-70">
              <p
                className="text-center text-sm text-muted-foreground font-medium italic"
                title={value}
              >
                {value}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "variant_type",
      enableSorting: false,
      header: ({ column }) => (
        <div className="flex justify-center">
          <DataTableColumnHeader column={column} title="Present. / Especif." />
        </div>
      ),
      cell: ({ row }) => {
        const value = row.original.variant_type?.trim() || "N/A";

        return (
          <div className="flex justify-center">
            <div className="max-w-60">
              <p className="text-center text-sm font-medium" title={value}>
                {value}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      id: "availability",
      enableSorting: false,
      header: ({ column }) => (
        <div className="flex justify-center">
          <DataTableColumnHeader column={column} title="Disponibilidad" />
        </div>
      ),
      cell: ({ row }) => (
        <AvailabilityBadge
          quantity={row.original.available_quantity}
          unit={row.original.unit?.value ?? row.original.unit?.label}
        />
      ),
    },
  ];

/**
 * Disponibilidad de la vista de consulta: la cantidad disponible con su
 * unidad, o "No disponible" cuando no hay existencia.
 */
export function AvailabilityBadge({
  quantity,
  unit,
}: {
  quantity: number;
  unit?: string | null;
}) {
  const available = Number(quantity ?? 0);

  return (
    <div className="flex justify-center">
      <Badge
        variant={available > 0 ? "default" : "destructive"}
        className="px-3 py-1 text-xs font-bold whitespace-nowrap tabular-nums"
      >
        {available > 0
          ? `${formatQuantity(available)} ${unit ?? "u"}`
          : "No disponible"}
      </Badge>
    </div>
  );
}
