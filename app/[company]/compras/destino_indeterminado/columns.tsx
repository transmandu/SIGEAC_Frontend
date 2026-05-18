"use client";

import { ColumnDef } from "@tanstack/react-table";
import type { MouseEvent } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

import { useUpdateArticleStatus } from "@/actions/mantenimiento/almacen/inventario/articulos/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";

import type { DestinationArticle } from "./types";

function articleTypeLabel(type?: string | null) {
  const normalized = type?.toUpperCase();

  if (normalized === "CONSUMABLE" || normalized === "CONSUMIBLE") {
    return "Consumible";
  }

  if (normalized === "COMPONENT" || normalized === "COMPONENTE") {
    return "Componente";
  }

  if (normalized === "TOOL" || normalized === "HERRAMIENTA") {
    return "Herramienta";
  }

  if (normalized === "PART" || normalized === "PARTE") {
    return "Parte";
  }

  return type || "Sin tipo";
}

function ConfirmCompanyButton({ article }: { article: DestinationArticle }) {
  const { updateArticleStatus } = useUpdateArticleStatus();
  const pending = updateArticleStatus.isPending;

  const handleConfirm = async (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (pending) return;

    await updateArticleStatus.mutateAsync({
      id: article.id,
      status: "STORED",
    });
  };

  return (
    <Button
      type="button"
      size="sm"
      disabled={pending}
      onClick={handleConfirm}
      className="h-8 gap-2"
    >
      {pending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <CheckCircle2 className="size-4" />
      )}
      Confirmar para empresa
    </Button>
  );
}

export const columns: ColumnDef<DestinationArticle>[] = [
  {
    accessorKey: "part_number",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Número de Parte" />
    ),
    cell: ({ row }) => (
      <div className="space-y-1">
        <p className="font-semibold">{row.original.part_number || "Sin P/N"}</p>
        <p className="text-xs text-muted-foreground">
          ALT: {row.original.alternative_part_number || "Sin alternativo"}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "article_type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tipo" />
    ),
    cell: ({ row }) => (
      <Badge variant="outline">{articleTypeLabel(row.original.article_type)}</Badge>
    ),
  },
  {
    accessorKey: "batch",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Descripción" />
    ),
    cell: ({ row }) => (
      <div className="space-y-1">
        <p className="font-medium">{row.original.batch?.name || "Sin descripción"}</p>
        <p className="text-xs text-muted-foreground">
          {row.original.description || "Sin observaciones"}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "serial",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Serial / Cantidad" />
    ),
    cell: ({ row }) => (
      <div className="space-y-1 text-sm">
        <p>{row.original.serial || "Sin serial"}</p>
        <p className="text-xs text-muted-foreground">
          Cantidad: {row.original.quantity ?? "N/A"}
          {row.original.unit ? ` ${row.original.unit}` : ""}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Estado" />
    ),
    cell: ({ row }) => (
      <Badge
        className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-700 hover:bg-amber-500/15 dark:text-amber-300"
      >
        {row.original.status || "TO_DETERMINATE"}
      </Badge>
    ),
  },
  {
    id: "actions",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Acciones" />
    ),
    cell: ({ row }) => (
      <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
        <ConfirmCompanyButton article={row.original} />
      </div>
    ),
  },
];
