"use client";

import { ArticleDetailDialog } from "@/app/[company]/almacen/recepcion_articulos/_components/ArticleDetailDialog";
import { TransitUpdatesButton } from "@/app/[company]/almacen/recepcion_articulos/_components/TransitUpdatesButton";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import { Badge } from "@/components/ui/badge";
import { INCOMING_REASON_LABELS } from "@/lib/incoming-readiness";
import { type AppColumnDef } from "@/lib/table";
import { cn } from "@/lib/utils";
import type { TransitArticle } from "@/types/purchase/in-transit";
import { FileWarning } from "lucide-react";

export const columns: AppColumnDef<TransitArticle>[] = [
  {
    accessorKey: "order_number",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nro. Orden" />
    ),
    meta: { title: "Nro. Orden" },
    cell: ({ row }) => (
      <p className="text-center">{row.original.order_number ?? "-"}</p>
    ),
  },
  {
    accessorKey: "batch.name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Descripción" />
    ),
    meta: { title: "Descripción" },
    cell: ({ row }) => (
      <p className="text-center flex justify-center font-bold">
        {row.original.batch ? row.original.batch.name : "-"}
      </p>
    ),
  },
  {
    accessorKey: "part_number",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nro. Parte" />
    ),
    meta: { title: "Nro. Parte" },
    cell: ({ row }) => (
      <p className="text-center flex justify-center font-bold">
        {row.original.part_number}
      </p>
    ),
  },
  {
    id: "serial_lot",
    accessorFn: (row) => row.serial ?? row.lot_number ?? "",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Serial / Lote" />
    ),
    meta: { title: "Serial / Lote" },
    cell: ({ row }) => {
      const { serial, lot_number } = row.original;

      if (!serial && !lot_number) {
        return <p className="text-center text-muted-foreground/40">-</p>;
      }

      return (
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/60">
            {serial ? "Serial" : "Lote"}
          </span>
          <span className="font-mono text-[12px] font-semibold">
            {serial ?? lot_number}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "quantity",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cantidad" />
    ),
    meta: { title: "Cantidad" },
    cell: ({ row }) => (
      <p className="text-center font-medium">
        {row.original.quantity} {row.original.unit}
      </p>
    ),
  },
  {
    accessorKey: "reception_date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha de Recepción" />
    ),
    meta: { title: "Fecha de Recepción" },
    cell: ({ row }) => (
      <p className="text-center font-medium">
        {row.original.reception_date ?? "-"}
      </p>
    ),
  },
  {
    id: "retention",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Situación" />
    ),
    meta: { title: "Situación" },
    cell: ({ row }) => {
      const isReception = row.original.status?.toUpperCase() === "RECEPTION";
      const reasons = row.original.incoming_readiness?.reasons ?? [];

      if (!isReception) {
        return (
          <div className="flex justify-center">
            <Badge variant="outline">En camino</Badge>
          </div>
        );
      }

      // Cumplir los requisitos no lo manda a incoming: eso lo decide almacén
      // al pasarlo. Por eso no se llama "listo para incoming", que se leería
      // como que ya está en la gestión de incoming.
      if (reasons.length === 0) {
        return (
          <div className="flex flex-col items-center gap-1">
            <Badge variant="secondary">En espera de almacén</Badge>
            <p className="text-center text-xs text-muted-foreground">
              Cumple los requisitos; falta que almacén lo pase a incoming
            </p>
          </div>
        );
      }

      return (
        <div className="flex flex-col items-center gap-1">
          <Badge
            variant="outline"
            className={cn(
              "gap-1 border-red-200 bg-red-50 text-red-700",
              "dark:border-red-800/60 dark:bg-red-950/40 dark:text-red-400",
            )}
          >
            <FileWarning className="size-3" />
            Retenido
          </Badge>
          <ul className="text-center text-xs text-muted-foreground">
            {reasons.map((reason) => (
              <li key={reason}>{INCOMING_REASON_LABELS[reason] ?? reason}</li>
            ))}
          </ul>
        </div>
      );
    },
  },
  {
    accessorKey: "actions",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Detalle" />
    ),
    meta: { title: "Detalle" },
    cell: ({ row }) => {
      const article = row.original;

      // La bitácora de tránsito se ofrece mientras el artículo viaja y, ya en
      // recepción, solo si dejó novedades que consultar.
      const showTransitUpdates =
        article.status?.toUpperCase() === "TRANSIT" ||
        (article.transit_updates_count ?? 0) > 0;

      return (
        <div className="flex items-center justify-center gap-1">
          {showTransitUpdates && <TransitUpdatesButton article={article} />}
          <ArticleDetailDialog article={article} readOnly />
        </div>
      );
    },
  },
];
