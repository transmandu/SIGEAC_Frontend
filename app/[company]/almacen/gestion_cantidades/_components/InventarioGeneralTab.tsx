"use client";

import { useUpdateGeneralArticleQuantity } from "@/actions/mantenimiento/almacen/inventario/articulos_generales/actions";
import LoadingPage from "@/components/misc/LoadingPage";
import { useDebounce } from "@/hooks/helpers/useDebounce";
import { useWarehouseInventoryGeneralArticles } from "@/hooks/mantenimiento/almacen/inventario/useWarehouseInventoryGeneralArticles";
import { Package } from "lucide-react";
import { useState } from "react";
import { GeneralInventoryTable } from "./GeneralInventoryTable";
import { useGeneralInventoryEdits } from "./hooks/useGeneralInventoryEdits";

export const InventarioGeneralTab = () => {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search.trim(), 400);

  // Mismo listado que el inventario de generales del almacén: esta pantalla
  // necesita exactamente esa información.
  const {
    rows: articles,
    total,
    isLoading,
    isError,
    isFetching,
    pagination,
  } = useWarehouseInventoryGeneralArticles({
    search: debouncedSearch || undefined,
  });

  const {
    state: { editedQuantities, baseQuantities, hasChanges },
    actions: { setQuantity, commit },
    utils: { modified, modifiedCount },
  } = useGeneralInventoryEdits(articles);

  const { updateGeneralArticleQuantity } = useUpdateGeneralArticleQuantity();

  const handleSave = async () => {
    await updateGeneralArticleQuantity.mutateAsync({ updates: modified });
    commit();
  };

  if (isLoading) return <LoadingPage />;

  if (isError) {
    return (
      <div className="py-10 text-center">
        <p className="text-sm text-muted-foreground">
          No se pudieron cargar los artículos.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 text-center md:text-left">
        <h2 className="text-2xl font-semibold flex items-center justify-center md:justify-start gap-2">
          <Package className="h-6 w-6" />
          Cantidades de artículos generales
        </h2>
        <p className="text-sm text-muted-foreground">
          Inventario general sin batches. Edita y guarda cambios en lote; lo
          editado se conserva al cambiar de página.
        </p>
      </div>

      <GeneralInventoryTable
        articles={articles}
        search={search}
        onSearchChange={setSearch}
        total={total}
        isFetching={isFetching}
        pagination={pagination}
        baseQuantities={baseQuantities}
        editedQuantities={editedQuantities}
        onQuantityChange={setQuantity}
        onSave={handleSave}
        isSaving={updateGeneralArticleQuantity.isPending}
        hasChanges={hasChanges}
        modifiedCount={modifiedCount}
      />
    </div>
  );
};
