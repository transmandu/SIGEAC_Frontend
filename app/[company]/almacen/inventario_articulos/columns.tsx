"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, Clock } from "lucide-react"

export interface IArticleSimple {
  id: number;
  part_number: string;
  description: string;
  quantity: number;
  zone: string;
  article_type: string;
  serial: string | null;
  status: string;
  batch_name: string;
  batch_id: number;
}

const getStatusBadge = (status: string | null | undefined) => {
  // Manejar status null o undefined
  if (!status) {
    return (
      <Badge variant="outline" className="flex items-center gap-1 w-fit">
        <XCircle className="h-3 w-3" />
        Sin estado
      </Badge>
    )
  }

  const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: any }> = {
    stored: { label: "En Stock", variant: "default", icon: CheckCircle2 },
    dispatch: { label: "Despachado", variant: "secondary", icon: Clock },
    transit: { label: "En Tránsito", variant: "outline", icon: Clock },
    maintenance: { label: "Mantenimiento", variant: "outline", icon: Clock },
  }
  
  const config = statusConfig[status.toLowerCase()] || { label: status, variant: "outline" as const, icon: XCircle }
  const Icon = config.icon
  
  return (
    <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  )
}

export const columns: ColumnDef<IArticleSimple>[] = [
  {
    accessorKey: "part_number",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Part Number" />
    ),
    cell: ({ row }) => {
      return (
        <div className="font-bold text-center text-base">
          {row.original.part_number}
        </div>
      )
    }
  },
  {
    accessorKey: "serial",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Serial" />
    ),
    cell: ({ row }) => (
      <div className="text-center font-mono text-sm">
        {row.original.serial || <span className="text-muted-foreground italic">N/A</span>}
      </div>
    )
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Descripción" />
    ),
    cell: ({ row }) => (
      <div className="text-muted-foreground text-left max-w-md line-clamp-2">
        {row.original.description || "Sin descripción"}
      </div>
    )
  },
  {
    accessorKey: "quantity",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cantidad" />
    ),
    cell: ({ row }) => {
      const quantity = row.original.quantity
      return (
        <div className="flex justify-center">
          <Badge 
            variant={quantity > 5 ? "default" : quantity > 0 ? "secondary" : "destructive"}
            className="text-base font-bold px-3 py-1"
          >
            {quantity}
          </Badge>
        </div>
      )
    }
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Estado" />
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">
        {getStatusBadge(row.original.status)}
      </div>
    )
  },
  {
    accessorKey: "zone",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Ubicación" />
    ),
    cell: ({ row }) => (
      <div className="text-center font-medium">
        {row.original.zone || <span className="text-muted-foreground">Sin asignar</span>}
      </div>
    )
  },
  // {
  //   accessorKey: "batch_name",
  //   header: ({ column }) => (
  //     <DataTableColumnHeader filter column={column} title="Lote" />
  //   ),
  //   cell: ({ row }) => (
  //     <div className="text-center text-sm text-muted-foreground">
  //       {row.original.batch_name}
  //     </div>
  //   )
  // },
]

