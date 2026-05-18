"use client";

import { useDeferredValue, useMemo, useState } from "react";

import BackButton from "@/components/misc/BackButton";
import { ContentLayout } from "@/components/layout/ContentLayout";
import LoadingPage from "@/components/misc/LoadingPage";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Input } from "@/components/ui/input";
import { useGetArticlesByStatus } from "@/hooks/mantenimiento/almacen/articulos/useGetArticlesByStatus";
import { useCompanyStore } from "@/stores/CompanyStore";

import { DataTable } from "../en_transito/data-table";
import { columns } from "./columns";
import type { DestinationArticle } from "./types";

export default function UnknownDestinationPage() {
  const { selectedCompany } = useCompanyStore();
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);

  const {
    data = [],
    isLoading,
    isError,
  } = useGetArticlesByStatus("TO_DETERMINATE");

  const articles = data as DestinationArticle[];

  const filteredArticles = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    if (!q) return articles;

    return articles.filter((article) =>
      [
        article.part_number,
        article.alternative_part_number,
        article.serial,
        article.article_type,
        article.description,
        article.batch?.name,
        article.manufacturer?.name,
      ].some((value) => value?.toLowerCase().includes(q)),
    );
  }, [articles, deferredSearch]);

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <LoadingPage />
      </div>
    );
  }

  if (isError) {
    return (
      <ContentLayout title="Destino indeterminado">
        <div className="flex min-h-[300px] items-center justify-center text-sm text-red-500">
          Error cargando artículos con destino indeterminado
        </div>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout title="Destino indeterminado">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <BackButton iconOnly tooltip="Volver" variant="secondary" />

          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href={`/${selectedCompany?.slug}/dashboard`}>
                  Inicio
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>Compras</BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Destino indeterminado</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="flex flex-col gap-2 border-b pb-4">
          <h1 className="text-3xl font-semibold tracking-tight">
            Destino indeterminado
          </h1>
          <p className="text-sm text-muted-foreground">
            Confirma los artículos pendientes de destino que pertenecen a la empresa.
          </p>
        </div>

        <div className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-3 md:flex-row md:items-center md:justify-between">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por P/N, serial, tipo o descripción..."
            className="md:max-w-md"
          />
          <span className="text-xs tabular-nums text-muted-foreground">
            {filteredArticles.length}{" "}
            {filteredArticles.length === 1 ? "artículo" : "artículos"}
          </span>
        </div>

        <DataTable columns={columns} data={filteredArticles} />
      </div>
    </ContentLayout>
  );
}
