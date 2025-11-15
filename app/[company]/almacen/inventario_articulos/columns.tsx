"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock, Wrench } from "lucide-react";
import { addDays, format } from "date-fns";
import { cn } from "@/lib/utils";
import ArticleDropdownActions from "@/components/dropdowns/mantenimiento/almacen/ArticleDropdownActions";
import { WarehouseResponse } from "@/hooks/mantenimiento/almacen/articulos/useGetWarehouseArticlesByCategory";
import CertificatesPopover from "@/components/popovers/CertificatesPopover";

export interface IArticleSimple {
  id: number;
  part_number: string;
  alternative_part_number?: string[];
  description?: string;
  quantity: number
  zone: string;
  article_type: string;
  serial?: string;
  lot_number?: string;
  status: string;
  condition: string;
  is_hazardous?: boolean;
  batch_name: string;
  batch_id: number;
  min_quantity?: number | string; // Directamente en el artículo
  has_documentation?: boolean;
  certificates?: string[];
  tool?: {
    status?: string | null;
    calibration_date?: string | null; // ISO string o "dd/MM/yyyy"
    next_calibration_date?: string | null; // si guardas fecha
    next_calibration?: number | string | null; // o días
  };
  component?: {
    caducate_date?: string | null;
    fabrication_date?: string | null;
  };
  consumable?: {
    caducate_date?: string | Date | null;
    fabrication_date?: string | Date | null;
  };
}

export const getStatusBadge = (status: string | null | undefined) => {
  if (!status) {
    return (
      <Badge variant="outline" className="flex items-center gap-1 w-fit">
        <XCircle className="h-3 w-3" /> 
      </Badge>
    );
  }

  const statusConfig: Record<
    string,
    {
      label: string;
      variant: "default" | "secondary" | "destructive" | "outline" | "warning";
      icon: any;
    }
  > = {
    stored: { label: "En Stock", variant: "default", icon: CheckCircle2 },
    checking: { label: "En Revision", variant: "warning", icon: Clock },
    dispatched: { label: "Despachado", variant: "secondary", icon: Clock },
    inuse: { label: "En uso", variant: "warning", icon: Clock },
    transit: { label: "En Tránsito", variant: "outline", icon: Clock },
    maintenance: { label: "Mantenimiento", variant: "outline", icon: Clock },
  };

  const config = statusConfig[status.toLowerCase()] || {
    label: status,
    variant: "outline" as const,
    icon: XCircle,
  };
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
};

export const flattenArticles = (
  data: WarehouseResponse | undefined
): IArticleSimple[] => {
  if (!data?.batches) return [];
  return data.batches.flatMap((batch) =>
    batch.articles.map((article) => {
      const articleWithDoc = article as typeof article & { has_documentation?: boolean; certificates?: string[] };
      return {
      id: article.id,
      part_number: article.part_number,
      alternative_part_number: article.alternative_part_number,
      serial: article.serial,
      lot_number: article.lot_number,
      description: article.description,
      zone: article.zone,
      // Normalizar cantidad: 0, null o undefined -> 1
      quantity:
        article.quantity === 0 ||
        article.quantity === null ||
        article.quantity === undefined
          ? 1
          : article.quantity,  
      status: article.status,
      condition: article.condition ? article.condition.name : "N/A",
      article_type: article.article_type ?? "N/A",
      batch_name: batch.name,
      is_hazardous: batch.is_hazardous ?? undefined,
      batch_id: batch.batch_id,
      min_quantity: article.min_quantity, // Directamente desde el artículo
      has_documentation: articleWithDoc.has_documentation ?? false,
      certificates: articleWithDoc.certificates ?? [],
      tool: article.tool
        ? {
            status: article.tool.status,
            calibration_date: article.tool.calibration_date,
            next_calibration_date: article.tool.next_calibration_date,
            next_calibration: article.tool.next_calibration,
          }
        : undefined,
      component: batch.category === "COMPONENTE" && ((article as any).caducate_date != null || article.component?.shell_time)
        ? {
            caducate_date: (article as any).caducate_date ?? article.component?.shell_time?.caducate_date ?? null,
            fabrication_date: article.component?.shell_time?.fabrication_date ?? null,
          }
        : undefined,
      consumable: batch.category === "CONSUMIBLE" && ((article as any).caducate_date != null || article.consumable?.shell_time)
        ? {
            caducate_date: (article as any).caducate_date ?? article.consumable?.shell_time?.caducate_date ?? null,
            fabrication_date: article.consumable?.shell_time?.fabrication_date ?? null,
          }
        : undefined,
      };
    })
  );
};

const baseCols: ColumnDef<IArticleSimple>[] = [
  {
    accessorKey: "part_number",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Part Number" />
    ),
    cell: ({ row }) => (
      <div className="font-bold text-center text-base">
        {row.original.part_number}
      </div>
    ),
  },
  // {
  //   accessorKey: 'alternative_part_number',
  //   header: ({ column }) => <DataTableColumnHeader filter column={column} title="Alt. Part Number" />,
  //   cell: ({ row }) => (
  //     <div className="font-bold text-center text-base">
  //       {row.original.alternative_part_number && row.original.alternative_part_number.length > 0
  //         ? row.original.alternative_part_number.join('/ ')
  //         : 'N/A'}
  //     </div>
  //   ),
  // },
  {
    accessorKey: "serial",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Serial / Lote" />
    ),
    cell: ({ row }) => (
      <div className="text-center text-sm font-medium">
        {row.original.serial ? (
          row.original.serial
        ) : row.original.lot_number ? (
          row.original.lot_number
        ) : (
          <span className="text-muted-foreground italic">N/A</span>
        )}
      </div>
    ),
  },
  {
    accessorKey: "batch_name",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Descripción" />
    ),
    cell: ({ row }) => (
      <div className="text-muted-foreground font-bold text-center max-w-xs line-clamp-2">
        {row.original.batch_name || "Sin descripción"}
      </div>
    ),
  },
  {
    accessorKey: "quantity",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cantidad" />
    ),
    cell: ({ row }) => {
      let q = row.original.quantity ?? 0;
      // Para componentes, si la cantidad es 0, se muestra como 1
      const articleType = row.original.article_type?.toLowerCase();
      if (articleType === "componente" && q === 0) {
        q = 1;
      }
      return (
        <div className="flex justify-center">
          <Badge
            variant={q > 5 ? "default" : q > 0 ? "secondary" : "destructive"}
            className="text-base font-bold px-3 py-1"
          >
            {q}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Estado" />
    ),
    cell: ({ row }) => {
      const calibrated = row.original.tool?.status === "CALIBRADO";
      const calibrating = row.original.tool?.status === "EN CALIBRACION";
      const descalibrated = row.original.tool?.status === "VENCIDO";
      return (
        <div className="flex flex-col justify-center items-center space-y-2">
          {!calibrating && getStatusBadge(row.original.status?.toUpperCase())}
          {row.original.tool && (
            <Badge
              className={cn(
                "text-xs text-center",
                calibrated
                  ? "bg-green-500"
                  : calibrating
                    ? "bg-yellow-500"
                    : descalibrated
                      ? "bg-red-500"
                      : ""
              )}
            >
              {row.original.tool.status
                ? row.original.tool.status
                : "Sin estado"}
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "zone",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ubicación" />
    ),
    cell: ({ row }) => (
      <div className="text-center font-medium text-sm">
        {row.original.zone || (
          <span className="text-muted-foreground">Sin asignar</span>
        )}
      </div>
    ),
  },
  {
    accessorKey: "has_documentation",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Documentación" />
    ),
    cell: ({ row }) => {
      const hasDoc = row.original.has_documentation ?? false;
      const certificates = row.original.certificates ?? [];
      return (
        <CertificatesPopover 
          hasDocumentation={hasDoc} 
          certificates={certificates} 
        />
      );
    },
  },
];

// Columnas para COMPONENTE
export const componenteCols: ColumnDef<IArticleSimple>[] = [
  ...baseCols,
  {
    id: "shelf_life",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Shelf Life" />
    ),
    cell: ({ row }) => {
      // Para componentes, caducate_date viene directamente en el artículo y se mapea a component.caducate_date
      const caducateDate = row.original.component?.caducate_date;
      if (!caducateDate) {
        return (
          <div className="text-center">
            <span className="text-muted-foreground italic">N/A</span>
          </div>
        );
      }
      
      // Para componentes, caducate_date es siempre string | null
      const date = new Date(caducateDate);
      
      // Validar que la fecha sea válida
      if (isNaN(date.getTime())) {
        return (
          <div className="text-center">
            <span className="text-muted-foreground italic">N/A</span>
          </div>
        );
      }
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);
      const daysUntilExpiry = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      let variant: "default" | "secondary" | "destructive" | "outline" = "default";
      if (daysUntilExpiry < 0) {
        variant = "destructive"; // Vencido
      } else if (daysUntilExpiry <= 30) {
        variant = "secondary"; // Próximo a vencer (30 días o menos)
      }

      return (
        <div className="text-center">
          <Badge variant={variant} className="text-sm font-medium">
            {format(date, "dd/MM/yyyy")}
          </Badge>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const item = row.original;  
      if (item.status === "stored" || item.status === "checking") {
        return <ArticleDropdownActions id={item.id} />;
      }
      return null;
    },
  },
];

// Columnas extra para CONSUMIBLE
export const consumibleCols: ColumnDef<IArticleSimple>[] = [
  ...baseCols,
  {
    accessorKey: "min_quantity",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cant. Mínima" />
    ),
    cell: ({ row }) => (
      <div className="text-center font-medium text-sm">
        {row.original.min_quantity || (
          <span className="text-muted-foreground">0</span>
        )}
      </div>
    ),
  },
  {
    id: "shelf_life",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Shelf Life" />
    ),
    cell: ({ row }) => {
      // Para consumibles, caducate_date viene directamente en el artículo y se mapea a consumable.caducate_date
      const caducateDate = row.original.consumable?.caducate_date;
      if (!caducateDate) {
        return (
          <div className="text-center">
            <span className="text-muted-foreground italic">N/A</span>
          </div>
        );
      }
      
      // Para consumibles, caducate_date puede ser string | Date | null
      const date = caducateDate instanceof Date 
        ? caducateDate 
        : typeof caducateDate === 'string' 
          ? new Date(caducateDate)
          : null;
      
      // Validar que la fecha sea válida
      if (!date || isNaN(date.getTime())) {
        return (
          <div className="text-center">
            <span className="text-muted-foreground italic">N/A</span>
          </div>
        );
      }
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);
      const daysUntilExpiry = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      let variant: "default" | "secondary" | "destructive" | "outline" = "default";
      if (daysUntilExpiry < 0) {
        variant = "destructive"; // Vencido
      } else if (daysUntilExpiry <= 30) {
        variant = "secondary"; // Próximo a vencer (30 días o menos)
      }

      return (
        <div className="text-center">
          <Badge variant={variant} className="text-sm font-medium">
            {format(date, "dd/MM/yyyy")}
          </Badge>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const item = row.original;  
      if (item.status === "stored" || item.status === "checking") {
        return <ArticleDropdownActions id={item.id} />;
      }
      return null;
    },
  },
];


// Columnas extra para HERRAMIENTA
export const herramientaCols: ColumnDef<IArticleSimple>[] = [
  ...baseCols,
  {
    accessorKey: "calibration_date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fech. Calibración" />
    ),
    cell: ({ row }) => (
      <div className="text-center text-sm font-bold text-muted-foreground">
        {row.original.tool?.calibration_date
          ? format(row.original.tool.calibration_date, "dd/MM/yyyy")
          : "N/A"}
      </div>
    ),
  },
  {
    id: "next_calibration",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Prox. Cal." />
    ),
    cell: ({ row }) => {
      return (
        <div className="text-center text-sm font-bold text-muted-foreground">
          {row.original.tool?.next_calibration &&
          row.original.tool.calibration_date
            ? format(
                addDays(
                  row.original.tool.calibration_date,
                  Number(row.original.tool.next_calibration)
                ),
                "dd/MM/yyyy"
              )
            : "N/A"}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const item = row.original;  
      if (item.status === "stored" || item.status === "checking") {
        return <ArticleDropdownActions id={item.id} />;
      }
      return null;
    },
  },
];

// Columnas por categoría
export const getColumnsByCategory = (
  cat: "COMPONENTE" | "CONSUMIBLE" | "HERRAMIENTA"
): ColumnDef<IArticleSimple>[] => {
  if (cat === "HERRAMIENTA") return herramientaCols;
  if (cat === "CONSUMIBLE") return consumibleCols;
  if (cat === "COMPONENTE") return componenteCols;
  return baseCols; // fallback
};
