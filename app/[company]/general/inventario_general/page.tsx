"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useGetGeneralArticles } from "@/hooks/mantenimiento/almacen/almacen_general/useGetGeneralArticles";
import { Loader2, X } from "lucide-react";
import { useState, useMemo } from "react";
import { DataTable } from "./data-table";
import { columns as generalColumns } from "../../almacen/inventario_articulos/_tables/general-columns";

const InventarioGeneralPage = () => {
  const { selectedCompany } = useCompanyStore();

  const [search, setSearch] = useState("");

  const { data: articlesGeneral, isLoading } = useGetGeneralArticles();

  const columnsWithoutActions = useMemo(() => {
    return generalColumns.filter(
      (col) =>
        col.id !== "actions" &&
        col.id !== "acciones" &&
        (typeof col.header === "string"
          ? col.header.toLowerCase() !== "acciones"
          : true),
    );
  }, []);

  const data = useMemo(() => {
    if (!articlesGeneral) return [];
    const q = search.trim().toLowerCase();
    return q
      ? articlesGeneral.filter(
          (a: any) =>
            a.part_number?.toLowerCase().includes(q) ||
            a.description?.toLowerCase().includes(q),
        )
      : articlesGeneral;
  }, [articlesGeneral, search]);

  const handleClearSearch = () => setSearch("");

  return (
    <ContentLayout title="Inventario General">
      <div className="flex flex-col gap-y-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href={`/${selectedCompany?.slug}/dashboard`}>
                Inicio
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Inventario General</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Inventario General</h1>
          <p className="text-sm text-muted-foreground italic">
            Consulta de artículos generales / ferretería
          </p>
        </div>

        <div className="relative max-w-xl mx-auto w-full">
          <Input
            placeholder="Búsqueda General - Buscar por Descripción"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-8 h-11"
          />
          {search && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
              onClick={handleClearSearch}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="size-12 animate-spin text-primary" />
          </div>
        ) : (
          <DataTable columns={columnsWithoutActions} data={data} />
        )}
      </div>
    </ContentLayout>
  );
};

export default InventarioGeneralPage;
