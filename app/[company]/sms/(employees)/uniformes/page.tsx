"use client";

import { useMemo, useState } from "react";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Plus,
  PackagePlus,
  Download,
  AlertTriangle,
  Shirt,
  Package,
  ArrowLeftRight,
} from "lucide-react";
import { toast } from "sonner";

import { useCompanyStore } from "@/stores/CompanyStore";
import axiosInstance from "@/lib/axios";
import {
  useGetUniformItems,
  useGetUniformMovements,
  UniformItem,
} from "@/hooks/sms/useGetUniforms";

import { UniformDataTable } from "./uniform-data-table";
import { getInventoryColumns } from "./inventory-columns";
import { movementsColumns } from "./movements-columns";
import { CreateUniformItemForm } from "@/components/forms/sms/CreateUniformItemForm";
import { EditUniformItemForm } from "@/components/forms/sms/EditUniformItemForm";
import { RegisterUniformMovementForm } from "@/components/forms/sms/RegisterUniformMovementForm";

const UniformesPage = () => {
  const { selectedCompany } = useCompanyStore();
  const company = selectedCompany?.slug;

  const { data: items, isLoading: loadingItems } = useGetUniformItems(company);
  const { data: movements, isLoading: loadingMovements } =
    useGetUniformMovements(company);

  const [createOpen, setCreateOpen] = useState(false);
  const [movementOpen, setMovementOpen] = useState(false);
  const [movementItemId, setMovementItemId] = useState<number | undefined>();
  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<UniformItem | undefined>();
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [exporting, setExporting] = useState(false);

  const openMovementFor = (item?: UniformItem) => {
    setMovementItemId(item?.id);
    setMovementOpen(true);
  };

  const openEdit = (item: UniformItem) => {
    setEditItem(item);
    setEditOpen(true);
  };

  const inventoryColumns = useMemo(
    () =>
      getInventoryColumns({
        onEdit: openEdit,
        onRegisterMovement: openMovementFor,
      }),
    []
  );

  const filteredItems = useMemo(() => {
    if (!items) return [];
    return lowStockOnly ? items.filter((i) => i.is_low_stock) : items;
  }, [items, lowStockOnly]);

  const lowStockCount = useMemo(
    () => items?.filter((i) => i.is_low_stock).length ?? 0,
    [items]
  );

  const handleExport = async () => {
    if (!company) return;
    try {
      setExporting(true);
      const response = await axiosInstance.get(
        `/${company}/sms/uniforms/export`,
        { responseType: "blob" }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `inventario_uniformes_${new Date().toISOString().slice(0, 10)}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error("Error al exportar el inventario");
    } finally {
      setExporting(false);
    }
  };

  const inventoryToolbar = (
    <>
      <Button
        onClick={() => setCreateOpen(true)}
        variant="outline"
        size="sm"
        className="flex h-8 items-center gap-2"
      >
        <Plus className="h-4 w-4" />
        Nuevo artículo
      </Button>
      <Button
        onClick={() => openMovementFor(undefined)}
        variant="outline"
        size="sm"
        className="flex h-8 items-center gap-2"
      >
        <PackagePlus className="h-4 w-4" />
        Registrar movimiento
      </Button>
      <Button
        onClick={() => setLowStockOnly((v) => !v)}
        variant={lowStockOnly ? "default" : "outline"}
        size="sm"
        className={`flex h-8 items-center gap-2 ${
          lowStockOnly ? "bg-red-600 hover:bg-red-700 text-white" : ""
        }`}
      >
        <AlertTriangle className="h-4 w-4" />
        Bajo stock{lowStockCount > 0 ? ` (${lowStockCount})` : ""}
      </Button>
      <Button
        onClick={handleExport}
        variant="outline"
        size="sm"
        disabled={exporting}
        className="flex h-8 items-center gap-2"
      >
        {exporting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        Exportar
      </Button>
    </>
  );

  return (
    <ContentLayout title="Uniformes">
      <div className="mb-4 flex flex-col items-center gap-2">
        <div className="flex items-center gap-2.5">
          <Shirt className="size-7 text-primary" />
          <h1 className="text-4xl font-bold text-center">
            Dotación de Uniformes
          </h1>
        </div>
        <p className="text-sm italic text-muted-foreground text-center">
          Inventario y entregas de camisas, pantalones, botas y chalecos.
        </p>
        {lowStockCount > 0 && (
          <Badge variant="destructive" className="gap-1.5">
            <AlertTriangle className="size-3.5" />
            {lowStockCount} artículo{lowStockCount > 1 ? "s" : ""} en bajo stock
          </Badge>
        )}
      </div>

      <Tabs defaultValue="inventory" className="w-full">
        <TabsList className="mx-auto grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="inventory" className="gap-2">
            <Package className="size-4" />
            Inventario
            {items?.length ? (
              <Badge
                variant="secondary"
                className="ml-0.5 px-1.5 py-0 text-[10px] tabular-nums"
              >
                {items.length}
              </Badge>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="movements" className="gap-2">
            <ArrowLeftRight className="size-4" />
            Movimientos
            {movements?.length ? (
              <Badge
                variant="secondary"
                className="ml-0.5 px-1.5 py-0 text-[10px] tabular-nums"
              >
                {movements.length}
              </Badge>
            ) : null}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventory">
          {loadingItems ? (
            <div className="flex w-full justify-center py-20">
              <Loader2 className="size-20 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <UniformDataTable
              columns={inventoryColumns}
              data={filteredItems}
              toolbar={inventoryToolbar}
              searchPlaceholder="Buscar artículos..."
              emptyMessage="No hay artículos en el inventario..."
            />
          )}
        </TabsContent>

        <TabsContent value="movements">
          {loadingMovements ? (
            <div className="flex w-full justify-center py-20">
              <Loader2 className="size-20 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <UniformDataTable
              columns={movementsColumns}
              data={movements ?? []}
              searchPlaceholder="Buscar movimientos..."
              emptyMessage="No hay movimientos registrados..."
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Crear artículo */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold">
              Nuevo artículo de uniforme
            </DialogTitle>
          </DialogHeader>
          <CreateUniformItemForm onClose={() => setCreateOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Registrar movimiento */}
      <Dialog open={movementOpen} onOpenChange={setMovementOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold">
              Registrar movimiento
            </DialogTitle>
          </DialogHeader>
          <RegisterUniformMovementForm
            key={movementItemId ?? "global"}
            itemId={movementItemId}
            onClose={() => setMovementOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Editar artículo */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold">
              Editar artículo
            </DialogTitle>
          </DialogHeader>
          {editItem && (
            <EditUniformItemForm
              item={editItem}
              onClose={() => setEditOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </ContentLayout>
  );
};

export default UniformesPage;
