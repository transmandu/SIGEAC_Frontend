"use client";

import { type AppColumnDef } from "@/lib/table";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { PurchaseOrder } from "@/types/purchase";
import FormattedInstant from "@/components/misc/FormattedInstant";
import Link from "next/link";
import PurchaseOrderDropdownActions from "@/components/dropdowns/mantenimiento/compras/PurchaseOrderDropdownActions";
import PreviewPanelIcon from "@/components/misc/PreviewPanelIcon";

const PO_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  PAID: "Pagada",
  COMPLETED: "Completada",
};

export const getColumns = (
  selectedCompany?: { slug: string },
  onPreview?: (po: PurchaseOrder) => void,
  selectedPreviewId?: number | null,
): AppColumnDef<PurchaseOrder>[] => [
  {
    accessorKey: "order_number",
    size: 210,

    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader filter column={column} title="Nro. Orden" />
      </div>
    ),

    meta: {
      title: "Nro. Orden",
    },

    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <Link
          href={`/${selectedCompany?.slug}/compras/ordenes_compra/${row.original.order_number}`}
          onClick={(e) => e.stopPropagation()}
          className="
            text-sm font-semibold
            text-slate-700 dark:text-slate-200

            hover:text-primary

            transition-colors
          "
        >
          {row.original.order_number}
        </Link>
      </div>
    ),
  },

  {
    id: "preview",
    size: 40,
    header: () => null,
    cell: ({ row }) => {
      const isActive = selectedPreviewId === row.original.id;

      return (
        <div
          className="flex justify-center px-0"
          onClick={(e) => e.stopPropagation()}
        >
          <TooltipProvider delayDuration={120}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => onPreview?.(row.original)}
                  className={cn(
                    "flex items-center justify-center rounded-md p-1 transition-all duration-200",
                    isActive
                      ? "text-blue-600 dark:text-blue-400 drop-shadow-[0_0_3px_rgba(37,99,235,0.35)] dark:drop-shadow-[0_0_3px_rgba(96,165,250,0.4)]"
                      : "text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 hover:drop-shadow-[0_0_3px_rgba(37,99,235,0.3)] dark:hover:drop-shadow-[0_0_3px_rgba(96,165,250,0.35)]",
                  )}
                >
                  <PreviewPanelIcon active={isActive} className="size-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                {isActive
                  ? "Cerrar vista previa"
                  : "Vista previa de la orden de compra"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },

  {
    accessorKey: "quote_order",
    size: 210,

    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Cotización" />
      </div>
    ),

    meta: {
      title: "Cotización",
      mobileOrder: 5,
      mobile: "wide",
    },

    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <Link
          href={`/${selectedCompany?.slug}/compras/cotizaciones/${row.original.quote_order?.quote_number}`}
          onClick={(e) => e.stopPropagation()}
          className="text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-400 hover:underline underline-offset-4 decoration-1"
        >
          {row.original.quote_order?.quote_number ?? "—"}
        </Link>
      </div>
    ),
  },

  {
    accessorKey: "vendor",
    size: 180,

    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Proveedor" />
      </div>
    ),

    meta: {
      title: "Proveedor",
      mobileOrder: 3,
    },

    cell: ({ row }) => {
      const name = row.original.vendor?.name;

      return (
        <div className="flex justify-center w-full">
          <span
            className={cn(
              "text-sm text-center",
              name
                ? "font-medium text-slate-700 dark:text-slate-200"
                : "text-muted-foreground",
            )}
          >
            {name ?? "N/A"}
          </span>
        </div>
      );
    },
  },

  {
    accessorKey: "purchase_date",
    size: 180,

    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Fecha de Creación" />
      </div>
    ),

    meta: {
      title: "Fecha de Creación",
      mobileOrder: 2,
    },

    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <span className="text-s text-slate-600 dark:text-slate-300 text-center font-medium">
          <FormattedInstant
            value={row.original.purchase_date}
            format="dd MMM yyyy"
          />
        </span>
      </div>
    ),
  },

  {
    accessorKey: "status",
    size: 150,

    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Estado" />
      </div>
    ),

    meta: {
      title: "Estado",
      mobileOrder: 1,
    },

    cell: ({ row }) => {
      const status = row.original.status;

      const completed = status === "COMPLETED";
      const paid = status === "PAID";

      return (
        <div className="flex justify-center w-full">
          <Badge
            className={cn(
              `
                rounded-md
                border
                h-6 px-2.5 text-xs font-medium
                transition-colors duration-150
                cursor-default
              `,

              paid &&
                `border-yellow-500/30 bg-yellow-500/10 text-yellow-700 dark:text-yellow-300`,

              completed &&
                `border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300`,

              !paid &&
                !completed &&
                `border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300`,
            )}
          >
            {PO_STATUS_LABELS[status] ?? status}
          </Badge>
        </div>
      );
    },
  },

  {
    accessorKey: "articles",
    size: 150,

    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Artículos" />
      </div>
    ),

    meta: {
      title: "Artículos",
      mobileOrder: 4,
    },

    cell: ({ row }) => {
      const count =
        (row.original.article_purchase_order?.length ?? 0) +
        (row.original.general_article_purchase_order?.length ?? 0);

      const isEmpty = count === 0;

      return (
        <div className="flex justify-center w-full">
          <div
            className="
              flex items-center justify-center
              min-w-26 px-2 py-0.5
              rounded-md
              text-xs tabular-nums
              border
              transition-colors
              bg-white/60 dark:bg-slate-900/30
              border-slate-200/60 dark:border-slate-700/50
              text-slate-600 dark:text-slate-300
            "
          >
            <span className="font-medium">{count}</span>

            <span className="ml-1 text-muted-foreground">
              {count === 1 ? "artículo" : "artículos"}
            </span>

            {isEmpty && (
              <span className="ml-1 text-xs text-muted-foreground">vacío</span>
            )}
          </div>
        </div>
      );
    },
  },

  {
    id: "actions",
    size: 80,
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Acciones" />
      </div>
    ),
    meta: {
      title: "Acciones",
    },
    cell: ({ row }) => (
      <div
        className="flex justify-center w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <PurchaseOrderDropdownActions po={row.original} />
      </div>
    ),
  },
];
