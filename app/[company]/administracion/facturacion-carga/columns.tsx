"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { type AppColumnDef } from "@/lib/table";
import { CargoBillingClientSummary } from "@/types";
import { Eye } from "lucide-react";

const ActionsCell = ({ clientId }: { clientId: number }) => {
  const params = useParams();
  const company = params.company as string;

  return (
    <div className="flex justify-center">
      <Button size="sm" className="bg-secondary" asChild>
        <Link href={`/${company}/administracion/facturacion-carga/${clientId}`}>
          <Eye className="h-4 w-4 mr-2" />
          Ver cobros
        </Link>
      </Button>
    </div>
  );
};

export const columns: AppColumnDef<CargoBillingClientSummary>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Cliente" />
    ),
    meta: { title: "Cliente" },
    cell: ({ row }) => (
      <div className="flex justify-center font-bold">{row.original.name}</div>
    ),
  },
  {
    accessorKey: "total_services",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Monto Total de Servicios" />
    ),
    meta: { title: "Monto Total de Servicios" },
    cell: ({ row }) => (
      <div className="flex justify-center">
        {formatCurrency(row.original.total_services)}
      </div>
    ),
  },
  {
    accessorKey: "total_pending",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Pendiente por Pagar" />
    ),
    meta: { title: "Pendiente por Pagar" },
    cell: ({ row }) => (
      <div className="flex justify-center">
        <span
          className={
            row.original.total_pending > 0
              ? "text-amber-600 font-semibold"
              : "text-muted-foreground"
          }
        >
          {formatCurrency(row.original.total_pending)}
        </span>
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionsCell clientId={row.original.id} />,
  },
];
