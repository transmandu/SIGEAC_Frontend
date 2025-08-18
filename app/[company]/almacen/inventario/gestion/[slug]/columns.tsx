"use client"

import { ColumnDef } from "@tanstack/react-table"

import { DataTableColumnHeader } from "@/components/tables/DataTableHeader"

import CertificatesDialog from "@/components/dialogs/mantenimiento/almacen/CertificatesDialog"
import ArticleDropdownActions from "@/components/dropdowns/mantenimiento/almacen/ArticleDropdownActions"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { IArticleByBatch } from "@/hooks/mantenimiento/almacen/articulos/useGetArticlesByBatch"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { COMPILER_INDEXES } from "next/dist/shared/lib/constants"

interface ColumnI {
  id: number,
  article_type: string,
  status: string,
  serial: string,
  description: string,
  zone: string,
  brand: string,
  condition: string,
  manufacturer: string,
  weight: number,
  cost: number,
  batches_id: number,
  vendor_id: string,
  part_number: string,
  alternative_part_number: string[],
  certificates?: string[],
  unit_secondary: string,
  image: string,
  quantity: number,
  tool?: {
    id: number,
    serial: string,
    isSpecial: boolean,
    article_id: number,
  }
  component?: {
    serial: string,
    hard_time: {
      hour_date: string,
      cycle_date: string,
      calendary_date: string,
    },
    shell_time: {
      caducate_date: string,
      fabrication_date: string,
    }
  },
  consumable?: {
    article_id: number,
    is_managed: boolean,
    convertions: {
      id: number,
      secondary_unit: string,
      convertion_rate: number,
      quantity_unit: number,
      unit: {
        label: string,
        value: string,
      },
    }[],
    shell_time: {
      caducate_date: Date,
      fabrication_date: Date,
      consumable_id: string,
    }
  }
}

export const columns: ColumnDef<ColumnI>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Seleccionar todos"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Seleccionar fila"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "serial",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Serial" />
    ),
    cell: ({ row }) => {
      const imageUrl = row.original.image; // Asegúrate de tener imageUrl en tu objeto de datos
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="w-full flex justify-center">
              <p className="font-medium italic text-center">
                {row.original.serial ? row.original.serial : "N/A"}
              </p>
            </TooltipTrigger>
            <TooltipContent>
              {imageUrl ? (
                <Image src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${imageUrl}`} alt={`Imagen del artículo ${row.original.serial}`} className="max-w-xs max-h-48" width={75} height={75} />
              ) : (
                <p>No hay imagen disponible</p>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  {
    accessorKey: "part_number",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Nro. de Parte" />
    ),
    meta: { title: "Nro. Parte" },
    cell: ({ row }) => (
      <p className="flex justify-center text-muted-foreground">
        {row.original.part_number}
      </p>
    ),
    filterFn: (row, columnId, filterValue) => {
      const partNumber = row.original.part_number?.toLowerCase() ?? "";
      const filter = filterValue.toLowerCase();
      return partNumber.includes(filter)
    },
  },
  {
    accessorKey: "alternate_part_number",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nro. de Parte Alterno" />
    ),
    cell: ({ row }) => (
      <div className="flex gap-2 text-center justify-center">
        {row.original.alternative_part_number ? row.original.alternative_part_number.map((part_number, index) => (
          <div className="flex gap-2" key={index}>
            <p className="text-muted-foreground">{part_number}</p>
            <Separator orientation="vertical" className={index === row.original.alternative_part_number.length - 1 ? "hidden" : ""} />
          </div>
        )): "N/A"}
      </div>
    ),
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Descripción" />
    ),
    cell: ({ row }) => (
      <p className="flex justify-center text-muted-foreground">{row.original.description}</p>
    )
  },
  {
    accessorKey: "condition",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Condición" />
    ),
    cell: ({ row }) => (
      <p className="flex justify-center font-bold">{row.original.condition}</p>
    )
  },
  {
    accessorKey: "zone",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Zona de Ubicación" />
    ),
    cell: ({ row }) => (
      <p className="flex text-center justify-center">{row.original.zone}</p>
    )
  },
  {
    accessorKey: "brand",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Marca" />
    ),
    cell: ({ row }) => (
      <p className="flex justify-center text-muted-foreground italic">{row.original.manufacturer}</p>

    )
  },
  {
    accessorKey: "quantity",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cantidad" />
    ),
    cell: ({ row }) => {
      const { quantity, consumable } = row.original;

      return (
        <div className="flex justify-center">
          <Badge className={quantity <= 0 ? "bg-yellow-500" : "bg-green-500"}>
            {consumable ? quantity.toFixed(2) : quantity.toFixed(2)} {row.original.unit_secondary}
          </Badge>
        </div>
      );
    },
    enableHiding: true, // Permite ocultar esta columna si no aplica.
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Estado" />
    ),
    cell: ({ row }) => (
      <Badge className={(row.original.status === 'InUse' || row.original.status === 'InToolBox') ? "bg-yellow-500 text-center" : "bg-green-500 text-center"}>{row.original.status === 'InUse' ? "En Uso" : row.original.status === 'InToolBox' ? "En Toolbox" : "En Almc."}</Badge>
    )
  },
  {
    accessorKey: "certificates",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Certificado(s)" />
    ),
    cell: ({ row }) => (
      <>
        {
          row.original.certificates?.length ? <CertificatesDialog serial={row.original.serial} certificates={row.original.certificates} /> : <p className="font-bold text-center">N/A</p>
        }
      </>
    )
  },
  {
    id: "actions",
    cell: ({ row }) => {

      return (
        <ArticleDropdownActions id={row.original.id} serial={row.original.serial} part_number={row.original.part_number} />
      )
    },
  },
]
