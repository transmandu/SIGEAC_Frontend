"use client";

import { type AppColumnDef } from "@/lib/table";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import { Unit } from "@/types";
import UnitDropdownActions from "@/components/dropdowns/ajustes/UnitDropdownActions";
import { TagBadge } from "@/components/misc/TagBadge";
import type { TagTone } from "@/components/misc/TagBadge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Ruler, Split, type LucideIcon } from "lucide-react";

const FEATURES: {
  key: string;
  label: string;
  hint: string;
  tone: TagTone;
  icon: LucideIcon;
  isOn: (unit: Unit) => boolean;
}[] = [
  {
    key: "dimensional",
    label: "Medidas",
    hint: "Declara medidas: se despacha por cortes de una pieza.",
    tone: "blue",
    icon: Ruler,
    isOn: (unit) => !!unit.is_dimensional,
  },
  {
    key: "fractions",
    label: "Fracciones",
    hint: "Se despacha por fracciones: 1/2, 1/4, 1/8, 1/16 y 1/32.",
    tone: "violet",
    icon: Split,
    isOn: (unit) => !!unit.allows_fractions,
  },
];

export const columns: AppColumnDef<Unit>[] = [
  {
    accessorKey: "label",
    size: 320,
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader filter column={column} title="Unidad" />
      </div>
    ),
    meta: { title: "Unidad" },
    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 text-center">
          {row.original.label}
        </span>
        <span className="ml-1 text-sm text-muted-foreground">
          ({row.original.value})
        </span>
      </div>
    ),
  },
  {
    id: "features",
    size: 220,
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Características" />
      </div>
    ),
    meta: { title: "Características" },
    // Una sola columna para todas las banderas: cada una nueva es una entrada
    // en FEATURES, no otra columna. Solo se dibujan las activas.
    cell: ({ row }) => {
      const active = FEATURES.filter((feature) => feature.isOn(row.original));

      return (
        <TooltipProvider delayDuration={150}>
          <div className="flex justify-center items-center gap-1.5 w-full">
            {active.length === 0 ? (
              <span className="text-sm text-muted-foreground">—</span>
            ) : (
              active.map(({ key, tone, icon, label, hint }) => (
                <Tooltip key={key}>
                  <TooltipTrigger asChild>
                    <TagBadge
                      tone={tone}
                      icon={icon}
                      className="w-auto gap-1.5 px-2"
                    >
                      {label}
                    </TagBadge>
                  </TooltipTrigger>
                  <TooltipContent>{hint}</TooltipContent>
                </Tooltip>
              ))
            )}
          </div>
        </TooltipProvider>
      );
    },
  },
  {
    id: "actions",
    size: 100,
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Acciones" />
      </div>
    ),
    meta: { title: "Acciones" },
    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <UnitDropdownActions unit={row.original} />
      </div>
    ),
  },
];
