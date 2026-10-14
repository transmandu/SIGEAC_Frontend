"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { SettingsListPage } from "@/components/layout/SettingsListPage";
import { SettingsDataTable } from "@/components/tables/SettingsDataTable";
import CreateWarehouseDialog from "@/components/dialogs/ajustes/CreateWarehouseDialog";
import { useGetWarehouses } from "@/hooks/administracion/useGetWarehouses";
import { columns } from "./columns";

const WarehousesPage = () => {
  const { data: warehouses, isPending, isError, refetch } = useGetWarehouses();
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);

  const filtered = useMemo(() => {
    if (!warehouses) return [];
    const q = deferredSearch.trim().toLowerCase();
    if (!q) return warehouses;

    return warehouses.filter(
      (w) =>
        w.name?.toLowerCase().includes(q) ||
        w.type?.toLowerCase().includes(q) ||
        w.location?.address?.toLowerCase().includes(q),
    );
  }, [warehouses, deferredSearch]);

  return (
    <SettingsListPage
      title="Almacenes"
      heading="Control de Almacenes"
      description="Administra los almacenes registrados y la sede a la que pertenece cada uno."
      search={{
        value: search,
        onChange: setSearch,
        placeholder: "Buscar almacenes...",
      }}
      count={{
        value: warehouses ? filtered.length : undefined,
        singular: "almacén",
        plural: "almacenes",
      }}
    >
      <SettingsDataTable
        columns={columns}
        data={filtered}
        error={isError}
        errorMessage="No se pudieron cargar los almacenes"
        onRetry={() => refetch()}
        filtered={!!deferredSearch.trim()}
        loading={isPending}
        emptyMessage="No se han encontrado almacenes."
        actions={<CreateWarehouseDialog />}
      />
    </SettingsListPage>
  );
};

export default WarehousesPage;
