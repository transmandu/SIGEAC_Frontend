"use client";

import { useDeferredValue, useMemo, useState } from "react";
import {
  MapPinOff,
  Search,
  PackageOpen,
  AlertTriangle,
} from "lucide-react";

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
        <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-950/60">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <p className="text-sm text-muted-foreground">
            Error cargando artículos con destino indeterminado
          </p>
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

        <div className="flex flex-col gap-2 border-b border-border/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950/60">
              <MapPinOff className="h-4 w-4 text-amber-600 dark:text-amber-500" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Destino indeterminado
              </h1>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Artículos pendientes de confirmación de destino para la empresa.
              </p>
            </div>
          </div>
        </div>

        {articles.length > 0 && (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            <div className="flex items-center gap-3 rounded-lg border border-border/60 px-4 py-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-amber-100 dark:bg-amber-950/60">
                <PackageOpen className="h-4 w-4 text-amber-600 dark:text-amber-500" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Pendientes
                </p>
                <p className="font-mono text-xl font-bold tabular-nums">
                  {articles.length}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-border/60 px-4 py-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted/60">
                <MapPinOff className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Tipos distintos
                </p>
                <p className="font-mono text-xl font-bold tabular-nums">
                  {new Set(articles.map((a) => a.article_type?.toUpperCase()).filter(Boolean)).size}
                </p>
              </div>
            </div>

            <div className="hidden items-center gap-3 rounded-lg border border-border/60 px-4 py-3 md:flex">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted/60">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Filtrados
                </p>
                <p className="font-mono text-xl font-bold tabular-nums">
                  {filteredArticles.length}
                </p>
              </div>
            </div>
          </div>
        )}

        <div
          className="
            flex items-center justify-between gap-4
            rounded-xl border
            border-slate-200/40 bg-slate-200/40
            px-3 py-2
            backdrop-blur-md
            dark:border-slate-700/60 dark:bg-slate-800/70
          "
        >
          <div className="relative flex-1 md:max-w-md">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por P/N, serial, tipo o descripción..."
              className="pl-9"
            />
          </div>
          <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
            {filteredArticles.length}{" "}
            {filteredArticles.length === 1 ? "artículo" : "artículos"}
          </span>
        </div>

        <DataTable columns={columns} data={filteredArticles} />
      </div>
    </ContentLayout>
  );
}
