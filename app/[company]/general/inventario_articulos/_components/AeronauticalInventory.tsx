"use client";

import { ALL_CONDITIONS, ConditionTabs } from "@/components/misc/ConditionTabs";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCompanyInventoryArticles } from "@/hooks/mantenimiento/almacen/inventario/useCompanyInventoryArticles";
import type { InventoryCategory } from "@/hooks/mantenimiento/almacen/inventario/useWarehouseInventoryArticles";
import type { CompanyInventoryArticle } from "@/types/inventory";
import { Drill, Loader2, Package2, PaintBucket, Puzzle } from "lucide-react";
import { useMemo, useState } from "react";
import { getColumnsByCategory } from "@/app/[company]/general/inventario_articulos/_tables/aeronautical-columns";
import { DataTable } from "@/app/[company]/general/inventario_articulos/_tables/data-table";
import { PartNumberUnitsDialog } from "@/app/[company]/general/inventario_articulos/_components/PartNumberUnitsDialog";

const formatCount = (value: number) => value.toLocaleString("es-VE");

interface Props {
  /** Búsqueda ya con debounce. */
  search?: string;
  /** Solo consulta mientras su tab está a la vista. */
  active: boolean;
}

/**
 * Inventario aeronáutico de la compañía: categorías, condición y mercancía
 * peligrosa se filtran en el servidor, porque en el navegador solo está la
 * página actual.
 */
export function AeronauticalInventory({ search, active }: Props) {
  const [category, setCategory] = useState<InventoryCategory>("all");
  const [condition, setCondition] = useState<string>(ALL_CONDITIONS);
  const [hazardousOnly, setHazardousOnly] = useState(false);
  // El número de parte se conserva al cerrar para que el diálogo no se vacíe
  // durante su animación de salida.
  const [units, setUnits] = useState({ open: false, partNumber: "" });

  const filters = {
    category,
    search,
    condition:
      (category === "COMPONENT" || category === "PART") &&
      condition !== ALL_CONDITIONS
        ? condition
        : undefined,
    is_hazardous: category === "CONSUMABLE" && hazardousOnly,
  };

  const { rows, total, isLoading, isFetching, pagination, groupedBy } =
    useCompanyInventoryArticles(filters, active);

  const columns = useMemo(() => getColumnsByCategory(category), [category]);

  const handleCategoryChange = (value: InventoryCategory) => {
    setCategory(value);
    setCondition(ALL_CONDITIONS);
    setHazardousOnly(false);
  };

  // Solo la fila que resume varias unidades tiene detalle que abrir: una de
  // una sola unidad ya lo muestra todo en la tabla.
  const isGroupedRow = (row: CompanyInventoryArticle) =>
    groupedBy === "part_number" && row.serial_count > 1;

  const onRowClick = (row: CompanyInventoryArticle) => {
    if (isGroupedRow(row))
      setUnits({ open: true, partNumber: row.part_number });
  };

  const unit =
    category === "CONSUMABLE" || category === "TOOL"
      ? "artículo(s)"
      : "nro. de parte";

  return (
    <div className="space-y-6">
      <Tabs
        value={category}
        onValueChange={(value) =>
          handleCategoryChange(value as InventoryCategory)
        }
      >
        <TabsList className="mb-4 flex justify-center space-x-3">
          <TabsTrigger className="flex gap-2" value="all">
            <Package2 className="size-5" /> Todos
          </TabsTrigger>
          <TabsTrigger className="flex gap-2" value="COMPONENT">
            <Package2 className="size-5" /> Componentes
          </TabsTrigger>
          <TabsTrigger className="flex gap-2" value="PART">
            <Puzzle className="size-5" /> Partes
          </TabsTrigger>
          <TabsTrigger className="flex gap-2" value="CONSUMABLE">
            <PaintBucket className="size-5" /> Consumibles
          </TabsTrigger>
          <TabsTrigger className="flex gap-2" value="TOOL">
            <Drill className="size-5" /> Herramientas
          </TabsTrigger>
        </TabsList>

        {(category === "COMPONENT" || category === "PART") && (
          <div className="mb-4 flex justify-center">
            <ConditionTabs value={condition} onValueChange={setCondition} />
          </div>
        )}

        {category === "CONSUMABLE" && (
          <div className="mb-4 flex justify-center">
            <Tabs
              value={hazardousOnly ? "hazardous" : "all"}
              onValueChange={(value) => setHazardousOnly(value === "hazardous")}
            >
              <TabsList>
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="hazardous">Mercancia Peligrosa</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        )}
      </Tabs>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="size-12 animate-spin text-primary" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={rows}
          isFetching={isFetching}
          onRowClick={onRowClick}
          rowClassName={(row) =>
            isGroupedRow(row) ? "cursor-pointer hover:bg-muted/30" : ""
          }
          pagination={{
            ...pagination,
            summary:
              total !== undefined ? `${formatCount(total)} ${unit}` : undefined,
          }}
        />
      )}

      <PartNumberUnitsDialog
        open={units.open}
        onOpenChange={(open) => setUnits((prev) => ({ ...prev, open }))}
        partNumber={units.partNumber}
        filters={filters}
      />
    </div>
  );
}
