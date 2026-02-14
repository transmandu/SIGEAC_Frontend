"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { addDays, format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import ArticleDropdownActions from "@/components/dropdowns/mantenimiento/almacen/ArticleDropdownActions";
import { WarehouseResponse } from "@/hooks/mantenimiento/almacen/articulos/useGetWarehouseArticlesByCategory";
import { StatusColumnHeader } from "@/components/tables/StatusColumnHeader";
import { Unit } from "@/types";

export interface IArticleSimple {
  id: number;
  part_number: string;
  alternative_part_number?: string[];
  description?: string;
  unit?: Unit;
  quantity: number;
  zone: string;
  article_type: string;
  serial?: string;
  lot_number?: string;
  status: string;
  condition: string;
  is_hazardous?: boolean;
  batch_name: string;
  batch_id: number;
  min_quantity?: number | string;
  has_documentation?: boolean;
  certificates?: string[];
  tool?: {
    status?: string | null;
    calibration_date?: string | null;
    next_calibration_date?: string | null;
    next_calibration?: number | string | null;
  };
  component?: {
    expiration_date?: string | null;
    fabrication_date?: string | null;
  };
  consumable?: {
    expiration_date?: string | Date | null;
    fabrication_date?: string | Date | null;
    unit?: Unit;
  };

  // ✅ grouping helpers
  __isGroup?: boolean;
  __groupCount?: number;
  subRows?: IArticleSimple[];
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
    stored: { label: "Disponible", variant: "default", icon: CheckCircle2 },
    checking: { label: "Revision", variant: "warning", icon: Clock },
    dispatched: { label: "Despachado", variant: "secondary", icon: Clock },
    inuse: { label: "En Uso", variant: "warning", icon: Clock },
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

export const flattenArticles = (data: WarehouseResponse | undefined): IArticleSimple[] => {
  if (!data?.batches) return [];
  return data.batches.flatMap((batch) =>
    batch.articles.map((article) => {
      const articleWithDoc = article as typeof article & {
        has_documentation?: boolean;
        certificates?: string[];
      };

      return {
        id: article.id,
        part_number: article.part_number,
        alternative_part_number: article.alternative_part_number,
        serial: article.serial,
        lot_number: article.lot_number,
        description: article.description,
        zone: article.zone,

        // ✅ No normalizar 0 -> 1
        quantity: Number(article.quantity ?? 0),

        status: article.status,
        condition: article.condition ? article.condition.name : "N/A",
        article_type: article.article_type ?? "N/A",
        batch_name: batch.name,
        is_hazardous: batch.is_hazardous ?? undefined,
        batch_id: batch.batch_id,

        min_quantity: article.min_quantity,
        has_documentation: articleWithDoc.has_documentation ?? false,
        certificates: articleWithDoc.certificates ?? [],
        unit: article.unit ?? undefined,

        tool: article.tool
          ? {
              status: article.tool.status,
              calibration_date: article.tool.calibration_date,
              next_calibration_date: article.tool.next_calibration_date,
              next_calibration: article.tool.next_calibration,
            }
          : undefined,

        component:
          batch.category === "COMPONENTE" &&
          ((article as any).expiration_date != null || article.component?.shell_time)
            ? {
                expiration_date:
                  (article as any).expiration_date ??
                  article.component?.shell_time?.expiration_date ??
                  null,
                fabrication_date: article.component?.shell_time?.fabrication_date ?? null,
              }
            : undefined,

        consumable:
          batch.category === "CONSUMIBLE" &&
          ((article as any).expiration_date != null || article.consumable?.shell_time)
            ? {
                expiration_date:
                  (article as any).expiration_date ??
                  article.consumable?.shell_time?.expiration_date ??
                  null,
                fabrication_date: article.consumable?.shell_time?.fabrication_date ?? null,
              }
            : undefined,
      };
    })
  );
};

// Helper parse local date
const parseDateLocal = (dateString: string): Date => {
  if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day);
  }
  return parseISO(dateString);
};

// ✅ Columna cantidad (solo consumible y all)
// Ahora: si es grupo, muestra __groupCount aquí (sin badge en PN)
const quantityCol: ColumnDef<IArticleSimple> = {
  accessorKey: "quantity",
  header: ({ column }) => <DataTableColumnHeader column={column} title="Cantidad" />,
  cell: ({ row }) => {
    const isGroup = !!row.original.__isGroup;

    const q = isGroup
      ? Number(row.original.__groupCount ?? 0)
      : Number(row.original.quantity ?? 0);

    const unit = row.original.unit?.value ?? "u";

    return (
      <div className="flex justify-center items-center">
        <Badge
          variant={q > 5 ? "default" : q > 0 ? "secondary" : "destructive"}
          className="text-base font-bold px-3 py-1"
        >
          {q} {unit}
        </Badge>
      </div>
    );
  },
};

const baseCols: ColumnDef<IArticleSimple>[] = [
  {
    accessorKey: "part_number",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Part Number" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <span className="font-bold text-base">{row.original.part_number}</span>
      </div>
    ),
  },
  {
    accessorKey: "serial",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Serial / Lote" />
    ),
    cell: ({ row }) => (
      <div className="text-center text-sm font-medium">
        {row.original.__isGroup ? (
          <span className="text-muted-foreground italic">—</span>
        ) : row.original.serial ? (
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
        {row.original.__isGroup
          ? row.original.batch_name || "Grupo"
          : row.original.batch_name || "Sin descripción"}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => <StatusColumnHeader column={column} />,
    cell: ({ row }) => {
      if (row.original.__isGroup) {
        return (
          <div className="flex justify-center">
            <Badge variant="outline" className="text-xs">
              <p>Grupo <span className="text-xs text-muted-foreground">({row.original.__groupCount ?? 0})</span></p>
            </Badge>
          </div>
        );
      }

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
              {row.original.tool.status ? row.original.tool.status : "Sin estado"}
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
        {row.original.__isGroup ? (
          <span className="text-muted-foreground italic">—</span>
        ) : row.original.zone ? (
          row.original.zone
        ) : (
          <span className="text-muted-foreground">Sin asignar</span>
        )}
      </div>
    ),
  },
];

// COMPONENTE (sin cantidad)
export const componenteCols: ColumnDef<IArticleSimple>[] = [
  ...baseCols,
  {
    id: "shelf_life",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Shelf Life" />,
    cell: ({ row }) => {
      if (row.original.__isGroup) {
        return (
          <div className="text-center">
            <span className="text-muted-foreground italic">—</span>
          </div>
        );
      }

      const caducateDate = row.original.component?.expiration_date;
      if (!caducateDate) {
        return (
          <div className="text-center">
            <span className="text-muted-foreground italic">N/A</span>
          </div>
        );
      }

      const date = parseDateLocal(caducateDate);
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
      const daysUntilExpiry = Math.ceil(
        (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      let variant: "default" | "secondary" | "destructive" | "outline" = "default";
      if (daysUntilExpiry < 0) variant = "destructive";
      else if (daysUntilExpiry <= 30) variant = "secondary";

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
    header: () => <div className="sticky right-0 bg-background z-50 text-center">Acciones</div>,
    cell: ({ row }) => {
      const item = row.original;
      if (item.__isGroup) return null;

      if (item.status === "stored" || item.status === "checking") {
        return (
          <div className="sticky right-0 bg-background z-50 flex justify-center">
            <ArticleDropdownActions id={item.id} />
          </div>
        );
      }
      return null;
    },
    meta: { sticky: "right", className: "bg-background" } as any,
  },
];

// CONSUMIBLE (con cantidad)
export const consumibleCols: ColumnDef<IArticleSimple>[] = [
  ...baseCols,
  quantityCol,
  {
    id: "shelf_life",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Shelf Life" />,
    cell: ({ row }) => {
      if (row.original.__isGroup) {
        return (
          <div className="text-center">
            <span className="text-muted-foreground italic">—</span>
          </div>
        );
      }

      const caducateDate = row.original.consumable?.expiration_date;
      if (!caducateDate) {
        return (
          <div className="text-center">
            <span className="text-muted-foreground italic">N/A</span>
          </div>
        );
      }

      const date =
        caducateDate instanceof Date
          ? caducateDate
          : typeof caducateDate === "string"
            ? parseDateLocal(caducateDate)
            : null;

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
      const daysUntilExpiry = Math.ceil(
        (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      let variant: "default" | "secondary" | "destructive" | "outline" = "default";
      if (daysUntilExpiry < 0) variant = "destructive";
      else if (daysUntilExpiry <= 30) variant = "secondary";

      return (
        <div className="text-center">
          <Badge variant={variant} className="text-sm font-medium">
            {format(date, "dd/MM/yyyy") === "01/01/1900" ? "N/A" : format(date, "dd/MM/yyyy")}
          </Badge>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="sticky right-0 bg-background z-50 text-center">Acciones</div>,
    cell: ({ row }) => {
      const item = row.original;
      if (item.__isGroup) return null;

      if (item.status === "stored" || item.status === "checking") {
        return (
          <div className="sticky right-0 bg-background z-50 flex justify-center">
            <ArticleDropdownActions id={item.id} />
          </div>
        );
      }
      return null;
    },
    meta: { sticky: "right", className: "bg-background" } as any,
  },
];

// HERRAMIENTA (sin cantidad)
export const herramientaCols: ColumnDef<IArticleSimple>[] = [
  ...baseCols,
  {
    accessorKey: "calibration_date",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Fech. Calibración" />,
    cell: ({ row }) => (
      <div className="text-center text-sm font-bold text-muted-foreground">
        {row.original.__isGroup ? (
          "—"
        ) : row.original.tool?.calibration_date ? (
          format(parseDateLocal(row.original.tool.calibration_date), "dd/MM/yyyy")
        ) : (
          "N/A"
        )}
      </div>
    ),
  },
  {
    id: "next_calibration",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Prox. Cal." />,
    cell: ({ row }) => {
      if (row.original.__isGroup) {
        return <div className="text-center text-sm font-bold text-muted-foreground">—</div>;
      }

      return (
        <div className="text-center text-sm font-bold text-muted-foreground">
          {row.original.tool?.next_calibration && row.original.tool.calibration_date
            ? format(
                addDays(
                  parseDateLocal(row.original.tool.calibration_date),
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
    header: () => <div className="sticky right-0 bg-background z-50 text-center">Acciones</div>,
    cell: ({ row }) => {
      const item = row.original;
      if (item.__isGroup) return null;

      if (item.status === "stored" || item.status === "checking") {
        return (
          <div className="sticky right-0 bg-background z-50 flex justify-center">
            <ArticleDropdownActions id={item.id} />
          </div>
        );
      }
      return null;
    },
    meta: { sticky: "right", className: "bg-background" } as any,
  },
];

// ALL (con cantidad porque mezcla categorías)
export const allCategoriesCols: ColumnDef<IArticleSimple>[] = [
  ...baseCols,
  quantityCol,
  {
    id: "shelf_life",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Shelf Life" />,
    cell: ({ row }) => {
      if (row.original.__isGroup) {
        return (
          <div className="text-center">
            <span className="text-muted-foreground italic">—</span>
          </div>
        );
      }

      const caducateDate =
        row.original.component?.expiration_date || row.original.consumable?.expiration_date;

      if (!caducateDate) {
        return (
          <div className="text-center">
            <span className="text-muted-foreground italic">N/A</span>
          </div>
        );
      }

      const date =
        caducateDate instanceof Date
          ? caducateDate
          : typeof caducateDate === "string"
            ? parseDateLocal(caducateDate)
            : null;

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
      const daysUntilExpiry = Math.ceil(
        (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      let variant: "default" | "secondary" | "destructive" | "outline" = "default";
      if (daysUntilExpiry < 0) variant = "destructive";
      else if (daysUntilExpiry <= 30) variant = "secondary";

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
    header: () => <div className="sticky right-0 bg-background z-50 text-center">Acciones</div>,
    cell: ({ row }) => {
      const item = row.original;
      if (item.__isGroup) return null;

      if (item.status === "stored" || item.status === "checking") {
        return (
          <div className="sticky right-0 bg-background z-50 flex justify-center">
            <ArticleDropdownActions id={item.id} />
          </div>
        );
      }
      return null;
    },
    meta: { sticky: "right", className: "bg-background" } as any,
  },
];

export const getColumnsByCategory = (
  cat: "COMPONENT" | "PART" | "CONSUMABLE" | "TOOL"
): ColumnDef<IArticleSimple>[] => {
  if (cat === "TOOL") return herramientaCols;
  if (cat === "CONSUMABLE") return consumibleCols;
  if (cat === "COMPONENT") return componenteCols;
  if (cat === "PART") return componenteCols;
  return baseCols;
};

export function groupByPartNumber(list: IArticleSimple[]) {
  const byPn: Record<string, IArticleSimple[]> = {};

  for (const item of list) {
    const pn = (item.part_number || "").trim();
    if (!pn) continue;
    if (!byPn[pn]) byPn[pn] = [];
    byPn[pn].push(item);
  }

  const result: IArticleSimple[] = [];

  for (const pn of Object.keys(byPn)) {
    const items = byPn[pn];

    if (items.length <= 1) {
      result.push(items[0]);
      continue;
    }

    const first = items[0];
    result.push({
      ...first,
      __isGroup: true,
      __groupCount: items.length,
      subRows: items,
    });
  }

  return result;
}
