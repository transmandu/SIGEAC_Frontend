"use client";

import { useMemo, useState } from "react";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  Package,
  ArrowLeftRight,
  Tags,
  Tag,
} from "lucide-react";
import { toast } from "sonner";

import { useCompanyStore } from "@/stores/CompanyStore";
import axiosInstance from "@/lib/axios";
import {
  useGetUniformItems,
  useGetUniformMovements,
  useGetUniformArticleTypes,
  useGetUniformBrands,
  UniformItem,
  UniformArticleType,
  UniformBrand,
} from "@/hooks/sms/useGetUniforms";

import { UniformDataTable } from "./uniform-data-table";
import { UniformInventoryGrid } from "./uniform-inventory-grid";
import { movementsColumns } from "./movements-columns";
import { getArticleTypesColumns } from "./article-types-columns";
import { getBrandsColumns } from "./brands-columns";
import { CreateUniformItemForm } from "@/components/forms/sms/CreateUniformItemForm";
import { EditUniformItemForm } from "@/components/forms/sms/EditUniformItemForm";
import { RegisterUniformMovementForm } from "@/components/forms/sms/RegisterUniformMovementForm";
import { UniformArticleTypeForm } from "@/components/forms/sms/UniformArticleTypeForm";
import { UniformBrandForm } from "@/components/forms/sms/UniformBrandForm";

const UniformesPage = () => {
  const { selectedCompany } = useCompanyStore();
  const company = selectedCompany?.slug;

  const { data: items, isLoading: loadingItems } = useGetUniformItems(company);
  const { data: movements, isLoading: loadingMovements } =
    useGetUniformMovements(company);
  const { data: articleTypes, isLoading: loadingTypes } =
    useGetUniformArticleTypes(company);
  const { data: brands, isLoading: loadingBrands } =
    useGetUniformBrands(company);

  const [createOpen, setCreateOpen] = useState(false);
  const [movementOpen, setMovementOpen] = useState(false);
  const [movementItemId, setMovementItemId] = useState<number | undefined>();
  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<UniformItem | undefined>();
  const [exporting, setExporting] = useState(false);

  const [typeFormOpen, setTypeFormOpen] = useState(false);
  const [editType, setEditType] = useState<UniformArticleType | undefined>();

  const [brandFormOpen, setBrandFormOpen] = useState(false);
  const [editBrand, setEditBrand] = useState<UniformBrand | undefined>();

  const openMovementFor = (item?: UniformItem) => {
    setMovementItemId(item?.id);
    setMovementOpen(true);
  };

  const openEdit = (item: UniformItem) => {
    setEditItem(item);
    setEditOpen(true);
  };

  const openCreateType = () => {
    setEditType(undefined);
    setTypeFormOpen(true);
  };

  const openEditType = (type: UniformArticleType) => {
    setEditType(type);
    setTypeFormOpen(true);
  };

  const openCreateBrand = () => {
    setEditBrand(undefined);
    setBrandFormOpen(true);
  };

  const openEditBrand = (brand: UniformBrand) => {
    setEditBrand(brand);
    setBrandFormOpen(true);
  };

  const articleTypesColumns = useMemo(
    () => getArticleTypesColumns({ onEdit: openEditType }),
    []
  );

  const brandsColumns = useMemo(
    () => getBrandsColumns({ onEdit: openEditBrand }),
    []
  );

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

  return (
    <ContentLayout title="Uniformes">
      {/* Page header */}
      <div className="mb-6 flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Dotación de Uniformes
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Inventario y entregas de camisas, pantalones, botas y chalecos.
          </p>
          {lowStockCount > 0 && (
            <Badge variant="destructive" className="mt-2 gap-1.5">
              <AlertTriangle className="size-3.5" />
              {lowStockCount} artículo{lowStockCount > 1 ? "s" : ""} en bajo
              stock
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => openMovementFor(undefined)}
            variant="outline"
            size="sm"
            className="flex h-9 items-center gap-2"
          >
            <PackagePlus className="h-4 w-4" />
            Registrar movimiento
          </Button>
          <Button
            onClick={handleExport}
            variant="outline"
            size="sm"
            disabled={exporting}
            className="flex h-9 items-center gap-2"
          >
            {exporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Exportar
          </Button>
          <Button
            onClick={() => setCreateOpen(true)}
            size="sm"
            className="flex h-9 items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nuevo artículo
          </Button>
        </div>
      </div>

      <Tabs defaultValue="inventory" className="w-full">
        <TabsList className="mx-auto grid w-full max-w-2xl grid-cols-4">
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
          <TabsTrigger value="types" className="gap-2">
            <Tags className="size-4" />
            Tipos
            {articleTypes?.length ? (
              <Badge
                variant="secondary"
                className="ml-0.5 px-1.5 py-0 text-[10px] tabular-nums"
              >
                {articleTypes.length}
              </Badge>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="brands" className="gap-2">
            <Tag className="size-4" />
            Marcas
            {brands?.length ? (
              <Badge
                variant="secondary"
                className="ml-0.5 px-1.5 py-0 text-[10px] tabular-nums"
              >
                {brands.length}
              </Badge>
            ) : null}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="mt-4">
          {loadingItems ? (
            <div className="flex w-full justify-center py-20">
              <Loader2 className="size-20 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <UniformInventoryGrid
              items={items ?? []}
              onEdit={openEdit}
              onRegisterMovement={openMovementFor}
            />
          )}
        </TabsContent>

        <TabsContent value="movements" className="mt-4">
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

        <TabsContent value="types" className="mt-4">
          {loadingTypes ? (
            <div className="flex w-full justify-center py-20">
              <Loader2 className="size-20 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <UniformDataTable
              columns={articleTypesColumns}
              data={articleTypes ?? []}
              searchPlaceholder="Buscar tipos..."
              emptyMessage="No hay tipos de artículo. Cree el primero..."
              toolbar={
                <Button
                  onClick={openCreateType}
                  variant="outline"
                  size="sm"
                  className="flex h-8 items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Nuevo tipo
                </Button>
              }
            />
          )}
        </TabsContent>

        <TabsContent value="brands" className="mt-4">
          {loadingBrands ? (
            <div className="flex w-full justify-center py-20">
              <Loader2 className="size-20 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <UniformDataTable
              columns={brandsColumns}
              data={brands ?? []}
              searchPlaceholder="Buscar marcas..."
              emptyMessage="No hay marcas. Cree la primera..."
              toolbar={
                <Button
                  onClick={openCreateBrand}
                  variant="outline"
                  size="sm"
                  className="flex h-8 items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Nueva marca
                </Button>
              }
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
            <DialogDescription className="text-center text-sm text-muted-foreground">
              Registre un artículo con su tipo, marca, talla y stock inicial.
            </DialogDescription>
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
            <DialogDescription className="text-center text-sm text-muted-foreground">
              Registre una entrada o entrega de uniformes y actualice el stock.
            </DialogDescription>
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
            <DialogDescription className="text-center text-sm text-muted-foreground">
              Modifique los datos del artículo de uniforme seleccionado.
            </DialogDescription>
          </DialogHeader>
          {editItem && (
            <EditUniformItemForm
              item={editItem}
              onClose={() => setEditOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Crear / editar tipo de artículo */}
      <Dialog open={typeFormOpen} onOpenChange={setTypeFormOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold">
              {editType ? "Editar tipo de artículo" : "Nuevo tipo de artículo"}
            </DialogTitle>
            <DialogDescription className="text-center text-sm text-muted-foreground">
              Los tipos agrupan los artículos del inventario (camisas,
              pantalones, botas, chalecos).
            </DialogDescription>
          </DialogHeader>
          <UniformArticleTypeForm
            key={editType?.id ?? "new"}
            articleType={editType}
            onClose={() => setTypeFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Crear / editar marca */}
      <Dialog open={brandFormOpen} onOpenChange={setBrandFormOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold">
              {editBrand ? "Editar marca" : "Nueva marca"}
            </DialogTitle>
            <DialogDescription className="text-center text-sm text-muted-foreground">
              Las marcas identifican al fabricante de cada artículo de uniforme.
            </DialogDescription>
          </DialogHeader>
          <UniformBrandForm
            key={editBrand?.id ?? "new"}
            brand={editBrand}
            onClose={() => setBrandFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </ContentLayout>
  );
};

export default UniformesPage;
