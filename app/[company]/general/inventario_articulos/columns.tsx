"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, Clock } from "lucide-react"
import { WarehouseResponse } from "@/hooks/mantenimiento/almacen/articulos/useGetWarehouseArticlesByCategory"


// ============================================
// TIPOS E INTERFACES
// ============================================
export interface IArticleSimple {
  id: number;
  part_number: string;
  alternative_part_number: string[] | null;
  description: string;
  quantity: number;
  zone: string;
  article_type: string;
  serial: string | null;
  status: string;
  batch_name: string;
  batch_id: number;
}

export interface IWarehouseArticle {
  batch_id: number;
  name: string;
  medition_unit: string;
  article_count: number;
  articles: Array<{
    id: number;
    part_number: string;
    alternative_part_number: string[] | null;
    serial: string | null;
    description: string;
    zone: string;
    quantity: number;
    status: string;
    article_type: string;
  }>;
}


// ============================================
// HELPER FUNCTIONS
// ============================================
export const getStatusBadge = (status: string | null | undefined) => {
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

/**
 * Convierte los batches con artículos en una lista plana de artículos
 * Aplica normalización de cantidad (0 o null -> 1)
 */
export const flattenArticles = (data: WarehouseResponse | undefined): IArticleSimple[] => {
  if (!data?.batches) return [];
  
  return data.batches.flatMap(batch => 
    batch.articles.map(article => ({
      id: article.id,
      part_number: article.part_number,
      alternative_part_number: article.alternative_part_number,
      serial: article.serial,
      description: article.description,
      zone: article.zone,
      // Normalizar cantidad: 0, null o undefined -> 1
      quantity: (article.quantity === 0 || article.quantity === null || article.quantity === undefined) ? 1 : article.quantity,
      status: article.status,
      article_type: article.article_type,
      batch_name: batch.name,
      batch_id: batch.batch_id,
    }))
  );
};

// ============================================
// DEFINICIÓN DE COLUMNAS
// ============================================

// Columnas base (sin serial)
const baseColumns: ColumnDef<IArticleSimple>[] = [
  {
    accessorKey: "part_number",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Part Number" />
    ),
    cell: ({ row }) => (
      <div className="font-bold text-center text-base">
        {row.original.part_number}
      </div>
    )
  },
  {
    accessorKey: "alternative_part_number",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Part Number Alterno" />
    ),
    cell: ({ row }) => (
      <div className="text-center font-medium">
        {row.original.alternative_part_number && row.original.alternative_part_number.length > 0 
          ? row.original.alternative_part_number.join(", ") 
          : <span className="text-muted-foreground italic">N/A</span>}
      </div>
    )
  },
];

// Columna de serial (solo para componentes)
const serialColumn: ColumnDef<IArticleSimple> = {
  accessorKey: "serial",
  header: ({ column }) => (
    <DataTableColumnHeader filter column={column} title="Serial" />
  ),
  cell: ({ row }) => (
    <div className="text-center font-mono text-sm">
      {row.original.serial || <span className="text-muted-foreground italic">N/A</span>}
    </div>
  )
};

// Columnas comunes a todos los tipos
const commonColumns: ColumnDef<IArticleSimple>[] = [
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
];

/**
 * Genera las columnas apropiadas según el tipo de artículo
 * @param articleType - Tipo de artículo ('COMPONENTE', 'CONSUMIBLE', 'HERRAMIENTA')
 * @returns Array de columnas
 */
export const getColumnsForArticleType = (articleType: 'COMPONENTE' | 'CONSUMIBLE' | 'HERRAMIENTA'): ColumnDef<IArticleSimple>[] => {
  // Solo los componentes tienen serial
  if (articleType === 'COMPONENTE') {
    return [...baseColumns, serialColumn, ...commonColumns];
  }
  
  // Consumibles y herramientas no tienen serial
  return [...baseColumns, ...commonColumns];
};

// Columnas por defecto (con serial)
export const columns: ColumnDef<IArticleSimple>[] = getColumnsForArticleType('COMPONENTE');
