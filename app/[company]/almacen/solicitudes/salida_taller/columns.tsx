"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import { type AppColumnDef } from "@/lib/table";
import type { WorkshopDispatch } from "@/hooks/mantenimiento/almacen/salida_taller/useGetWorkshopDispatches";
import DispatchArticlesDialog from "@/components/dialogs/mantenimiento/almacen/DispatchArticlesDialog";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar, FileText, ListTree, Users, Wrench } from "lucide-react";

function safeDateLabel(raw?: string | null) {
  if (!raw) return null;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return null;
  return format(d, "dd MMM yyyy", { locale: es });
}

export function buildColumns(
  onOpenTimeline: (id: number) => void,
): AppColumnDef<WorkshopDispatch>[] {
  return [
    {
      accessorKey: "request_number",
      meta: { title: "Solicitud" },
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Solicitud"
          icon={FileText}
          filter
          align="center"
        />
      ),
      cell: ({ row }) => (
        <p className="text-center font-semibold tabular-nums">
          {row.original.request_number}
        </p>
      ),
      size: 130,
    },
    {
      id: "workshop",
      meta: { title: "Taller" },
      accessorFn: (row) => row.workshop_dispatch?.workshop?.name ?? "",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Taller"
          icon={Wrench}
          filter
          align="center"
        />
      ),
      cell: ({ row }) => (
        <p className="text-center font-medium">
          {row.original.workshop_dispatch?.workshop?.name ?? "—"}
        </p>
      ),
      size: 180,
    },
    {
      accessorKey: "requested_by",
      meta: { title: "Solicitante" },
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Solicitante"
          icon={Users}
          filter
          align="center"
        />
      ),
      cell: ({ row }) => (
        <p className="text-center font-medium">
          {row.original.requested_by ?? "—"}
        </p>
      ),
      size: 180,
    },
    {
      accessorKey: "submission_date",
      meta: { title: "Fecha" },
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Fecha"
          icon={Calendar}
          align="center"
        />
      ),
      cell: ({ row }) => {
        const label = safeDateLabel(row.original.submission_date);
        return (
          <p className="text-center text-muted-foreground tabular-nums">
            {label ?? "—"}
          </p>
        );
      },
      size: 130,
    },
    {
      id: "status",
      meta: { title: "Estado" },
      accessorFn: (row) => row.workshop_dispatch?.status ?? "",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Estado"
          filter
          align="center"
        />
      ),
      cell: ({ row }) => {
        const status = row.original.workshop_dispatch?.status;
        return (
          <div className="flex justify-center">
            <Badge variant={status === "IN_WORKSHOP" ? "secondary" : "default"}>
              {status === "IN_WORKSHOP" ? "En taller" : "Reingresado"}
            </Badge>
          </div>
        );
      },
      size: 120,
    },
    {
      id: "articles",
      meta: { title: "Artículos" },
      header: () => (
        <div className="flex items-center justify-center gap-2">
          <span>Artículos</span>
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-center">
          <DispatchArticlesDialog
            articles={row.original.articles}
            justification={row.original.justification}
          />
        </div>
      ),
      enableSorting: false,
      size: 110,
    },
    {
      id: "timeline",
      meta: { title: "Storyline" },
      header: () => (
        <div className="flex items-center justify-center gap-2">
          <ListTree className="h-4 w-4 opacity-80" />
          <span>Storyline</span>
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenTimeline(row.original.id)}
          >
            Ver / Registrar
          </Button>
        </div>
      ),
      enableSorting: false,
      size: 150,
    },
  ];
}
