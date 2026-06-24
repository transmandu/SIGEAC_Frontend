"use client";

import { ColumnDef } from "@tanstack/react-table";
import type { MouseEvent } from "react";
import {
  CheckCircle2,
  Loader2,
  Droplets,
  Cpu,
  Wrench,
  Puzzle,
  HelpCircle,
  Hash,
  Package,
} from "lucide-react";

import { useUpdateArticleStatus } from "@/actions/mantenimiento/almacen/inventario/articulos/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";

import type { DestinationArticle } from "@/types/purchase";

const ARTICLE_TYPES: Record<
  string,
  { label: string; icon: typeof Droplets }
> = {
  CONSUMABLE: { label: "Consumible", icon: Droplets },
  CONSUMIBLE: { label: "Consumible", icon: Droplets },
  COMPONENT: { label: "Componente", icon: Cpu },
  COMPONENTE: { label: "Componente", icon: Cpu },
  TOOL: { label: "Herramienta", icon: Wrench },
  HERRAMIENTA: { label: "Herramienta", icon: Wrench },
  PART: { label: "Parte", icon: Puzzle },
  PARTE: { label: "Parte", icon: Puzzle },
};

function getArticleType(type?: string | null) {
  const normalized = type?.toUpperCase() ?? "";
  return ARTICLE_TYPES[normalized] ?? { label: type || "Sin tipo", icon: HelpCircle };
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
      Confirmar
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
      <div className="space-y-1.5">
        <p className="font-mono text-sm font-semibold tracking-wide">
          {row.original.part_number || "Sin P/N"}
        </p>
        {row.original.alternative_part_number && (
          <div className="flex items-center gap-1.5">
            <span className="shrink-0 select-none rounded border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-mono font-semibold tracking-widest text-amber-600 dark:border-amber-800/60 dark:bg-amber-950/60 dark:text-amber-500">
              ALT
            </span>
            <span className="font-mono text-xs text-muted-foreground">
              {row.original.alternative_part_number}
            </span>
          </div>
        )}
      </div>
    ),
  },
  {
    accessorKey: "article_type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tipo" />
    ),
    cell: ({ row }) => {
      const { label, icon: Icon } = getArticleType(row.original.article_type);
      return (
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted/60">
            <Icon className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <span className="text-sm">{label}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "batch",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Descripción" />
    ),
    cell: ({ row }) => (
      <div className="max-w-[260px] space-y-0.5">
        <p className="truncate text-sm font-medium">
          {row.original.batch?.name || "Sin descripción"}
        </p>
        <p className="truncate text-xs text-muted-foreground">
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
      <div className="space-y-1">
        <div className="flex items-center gap-1.5">
          <Hash className="h-3 w-3 text-muted-foreground/60" />
          <span className="font-mono text-sm tracking-wide">
            {row.original.serial || "—"}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Package className="h-3 w-3 text-muted-foreground/60" />
          <span className="font-mono text-xs tabular-nums text-muted-foreground">
            {row.original.quantity ?? "N/A"}
            {row.original.unit ? ` ${row.original.unit}` : ""}
          </span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Estado" />
    ),
    cell: () => (
      <Badge className="rounded-md border border-amber-200 bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-400">
        Pendiente
      </Badge>
    ),
  },
  {
    id: "actions",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="" />
    ),
    cell: ({ row }) => (
      <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
        <ConfirmCompanyButton article={row.original} />
      </div>
    ),
  },
];
