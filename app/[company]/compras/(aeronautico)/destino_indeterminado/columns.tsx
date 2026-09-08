"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useState, type MouseEvent } from "react";
import {
  Droplets,
  Cpu,
  Wrench,
  Puzzle,
  HelpCircle,
  Hash,
  MapPin,
  Package,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import { DetermineDestinationDialog } from "./_components/DetermineDestinationDialog";

import type { DestinationArticle } from "@/types/purchase";

const ARTICLE_TYPES: Record<
  string,
  { label: string; icon: typeof Droplets }
> = {
  CONSUMABLE: { label: "Consumible", icon: Droplets },
  COMPONENT: { label: "Componente", icon: Cpu },
  TOOL: { label: "Herramienta", icon: Wrench },
  PART: { label: "Parte", icon: Puzzle },
};

function getArticleType(type?: string | null) {
  const normalized = type?.toUpperCase() ?? "";
  return ARTICLE_TYPES[normalized] ?? { label: type || "Sin tipo", icon: HelpCircle };
}

/**
 * Determinar el destino no es "confirmar y almacenar".
 *
 * Antes este botón mandaba el artículo directo a STORED, saltándose la
 * recepción y sin decir a qué sede pertenecía. Lo que compras resuelve aquí es
 * precisamente eso: de quién es el material. Si es de esta sede entra a
 * recepción; si es de otra hay que trasladarlo.
 */
function DetermineDestinationButton({ article }: { article: DestinationArticle }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={(e: MouseEvent<HTMLButtonElement>) => {
          e.stopPropagation();
          setOpen(true);
        }}
        className="h-7 gap-1.5 rounded-full border border-slate-200/60 bg-white/50 px-3 text-[11px] hover:bg-slate-100 dark:border-slate-700/60 dark:bg-slate-800/40 dark:hover:bg-slate-800"
      >
        <MapPin className="size-3.5" />
        Determinar destino
      </Button>

      {open && (
        <DetermineDestinationDialog
          article={article}
          open={open}
          onOpenChange={setOpen}
        />
      )}
    </>
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
    id: "category",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tipo" />
    ),
    cell: ({ row }) => {
      // El tipo vive en la categoría del lote, no en un campo del artículo:
      // `article_type` no viaja en este listado y dejaba todas las filas en
      // "Sin tipo".
      const { label, icon: Icon } = getArticleType(row.original.batch?.category);

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
      <p className="max-w-[260px] truncate text-sm font-medium">
        {row.original.batch?.name || "Sin descripción"}
      </p>
    ),
  },
  {
    accessorKey: "serial",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Serial" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5">
        <Hash className="h-3 w-3 text-muted-foreground/60" />
        <span className="font-mono text-sm tracking-wide">
          {row.original.serial || "—"}
        </span>
      </div>
    ),
  },
  {
    id: "quantity",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cantidad" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5">
        <Package className="h-3 w-3 text-muted-foreground/60" />
        <span className="font-mono text-sm tabular-nums">
          {row.original.quantity ?? "N/A"}
          {row.original.unit ? ` ${row.original.unit}` : ""}
        </span>
      </div>
    ),
  },
  {
    // Todas las filas están en el mismo estado, así que un badge de estado no
    // aportaba nada. Dónde está el artículo sí: es lo que decide si resolverlo
    // es un pase a recepción o un traslado.
    id: "location",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ubicación actual" />
    ),
    cell: ({ row }) => {
      const location = row.original.batch?.warehouse?.location;

      return (
        <div className="flex justify-center">
          <Badge className="select-none rounded-md border border-amber-200 bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-400">
            {location?.cod_iata ?? "SIN SEDE"}
          </Badge>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="" />
    ),
    cell: ({ row }) => (
      <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
        <DetermineDestinationButton article={row.original} />
      </div>
    ),
  },
];
