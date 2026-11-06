"use client";

import { toAltPartNumbers } from "@/lib/utils";
import { type AppColumnDef } from "@/lib/table";
import { useState, type MouseEvent } from "react";
import {
  Droplets,
  Cpu,
  Wrench,
  Puzzle,
  HelpCircle,
  MapPin,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import CopyPartNumberButton from "@/components/misc/CopyPartNumberButton";
import { DetermineDestinationDialog } from "./_components/DetermineDestinationDialog";

import type { DestinationArticle } from "@/types/purchase";

const ARTICLE_TYPES: Record<string, { label: string; icon: typeof Droplets }> =
  {
    CONSUMABLE: { label: "Consumible", icon: Droplets },
    COMPONENT: { label: "Componente", icon: Cpu },
    TOOL: { label: "Herramienta", icon: Wrench },
    PART: { label: "Parte", icon: Puzzle },
  };

function getArticleType(type?: string | null) {
  const normalized = type?.toUpperCase() ?? "";
  return (
    ARTICLE_TYPES[normalized] ?? { label: type || "Sin tipo", icon: HelpCircle }
  );
}

/**
 * Determinar el destino no es "confirmar y almacenar".
 *
 * Antes este botón mandaba el artículo directo a STORED, saltándose la
 * recepción y sin decir a qué sede pertenecía. Lo que compras resuelve aquí es
 * precisamente eso: de quién es el material. Si es de esta sede entra a
 * recepción; si es de otra hay que trasladarlo.
 */
function DetermineDestinationButton({
  article,
}: {
  article: DestinationArticle;
}) {
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
        className="h-7 gap-1.5 rounded-md border border-slate-200/60 bg-white/50 px-3 text-xs hover:bg-slate-100 dark:border-slate-700/60 dark:bg-slate-800/40 dark:hover:bg-slate-800"
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

export const columns: AppColumnDef<DestinationArticle>[] = [
  {
    accessorKey: "part_number",
    size: 210,

    header: ({ column }) => (
      <div className="flex w-full justify-center">
        <DataTableColumnHeader filter column={column} title="Número de Parte" />
      </div>
    ),

    cell: ({ row }) => {
      const alternatives = toAltPartNumbers(
        row.original.alternative_part_number,
      );

      return (
        <div className="flex w-full justify-start">
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <span className="select-none rounded-md border border-emerald-200/50 bg-emerald-100/60 px-1.5 py-0.5 text-xs font-semibold text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-900/30 dark:text-emerald-300">
                P/N
              </span>

              <span className="rounded px-1 py-0.5 text-[13px] font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                {row.original.part_number || "Sin P/N"}
              </span>

              <CopyPartNumberButton value={row.original.part_number} />
            </div>

            {alternatives.length > 0 ? (
              <div className="flex items-center gap-2">
                <span className="select-none rounded-md border border-slate-300/40 bg-slate-200/60 px-1.5 py-0.5 text-xs font-semibold text-slate-600 dark:border-slate-600/40 dark:bg-slate-700/40 dark:text-slate-300">
                  ALT
                </span>

                <span className="font-mono text-xs text-muted-foreground">
                  {alternatives.join(" / ")}
                </span>

                <CopyPartNumberButton
                  value={alternatives.join(" / ")}
                  label="P/N alternos"
                />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="select-none rounded-md bg-slate-100 px-1.5 py-0.5 text-xs font-semibold text-slate-400 dark:bg-slate-800">
                  ALT
                </span>

                <span className="text-xs italic text-muted-foreground/60">
                  Sin alternativo
                </span>
              </div>
            )}
          </div>
        </div>
      );
    },
  },

  {
    id: "category",
    size: 140,

    header: ({ column }) => (
      <div className="flex w-full justify-center">
        <DataTableColumnHeader column={column} title="Tipo" />
      </div>
    ),

    cell: ({ row }) => {
      // El tipo vive en la categoría del lote, no en un campo del artículo:
      // `article_type` no viaja en este listado y dejaba todas las filas en
      // "Sin tipo".
      const { label, icon: Icon } = getArticleType(
        row.original.batch?.category,
      );

      return (
        <div className="flex w-full items-center justify-center gap-2">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted/60">
            <Icon className="size-3.5 text-muted-foreground" />
          </div>
          <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
            {label}
          </span>
        </div>
      );
    },
  },

  {
    accessorKey: "batch",
    size: 210,

    header: ({ column }) => (
      <div className="flex w-full items-center justify-center text-center">
        <DataTableColumnHeader column={column} title="Descripción" />
      </div>
    ),

    cell: ({ row }) => (
      <div className="flex w-full items-center justify-center px-2 text-center">
        <span className="block w-full wrap-break-word text-sm font-medium text-slate-800 dark:text-slate-200">
          {row.original.batch?.name || "Sin descripción"}
        </span>
      </div>
    ),
  },

  {
    accessorKey: "serial",
    size: 150,

    header: ({ column }) => (
      <div className="flex w-full justify-center">
        <DataTableColumnHeader column={column} title="Serial" />
      </div>
    ),

    cell: ({ row }) => (
      <div className="flex w-full justify-center">
        {row.original.serial ? (
          <span className="text-sm font-medium tabular-nums text-slate-800 dark:text-slate-200">
            {row.original.serial}
          </span>
        ) : (
          <span className="text-muted-foreground/60">—</span>
        )}
      </div>
    ),
  },

  {
    id: "quantity",
    size: 120,

    header: ({ column }) => (
      <div className="flex w-full justify-center">
        <DataTableColumnHeader column={column} title="Cantidad" />
      </div>
    ),

    cell: ({ row }) => (
      <div className="flex w-full items-baseline justify-center gap-1">
        <span className="text-sm font-semibold tabular-nums text-slate-800 dark:text-slate-200">
          {row.original.quantity ?? "N/A"}
        </span>
        {row.original.unit && (
          <span className="text-xs text-muted-foreground">
            {row.original.unit}
          </span>
        )}
      </div>
    ),
  },

  {
    // Todas las filas están en el mismo estado, así que un badge de estado no
    // aportaba nada. Dónde está el artículo sí: es lo que decide si resolverlo
    // es un pase a recepción o un traslado.
    id: "location",
    size: 140,

    header: ({ column }) => (
      <div className="flex w-full justify-center">
        <DataTableColumnHeader column={column} title="Ubicación actual" />
      </div>
    ),

    cell: ({ row }) => {
      const location = row.original.batch?.warehouse?.location;

      return (
        <div className="flex w-full justify-center">
          <Badge className="h-6 select-none rounded-md border border-amber-500/30 bg-amber-500/10 px-2.5 text-xs font-medium text-amber-700 dark:text-amber-300">
            {location?.cod_iata ?? "Sin sede"}
          </Badge>
        </div>
      );
    },
  },

  {
    id: "actions",
    size: 170,

    header: ({ column }) => (
      <div className="flex w-full justify-center">
        <DataTableColumnHeader column={column} title="Acciones" />
      </div>
    ),

    cell: ({ row }) => (
      <div
        className="flex w-full justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <DetermineDestinationButton article={row.original} />
      </div>
    ),
  },
];
