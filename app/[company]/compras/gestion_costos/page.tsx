"use client";

import { useMemo, useState, useCallback } from "react";

import { ContentLayout } from "@/components/layout/ContentLayout";

import { useAuth } from "@/contexts/AuthContext";
import { useCompanyStore } from "@/stores/CompanyStore";

import { DataTable } from "@/app/[company]/compras/data-table";
import { getColumns } from "./columns";

import GroupedCostTable from "./_components/GroupedCostTable";

import CostToolbar from "./_components/CostToolbar";
import CostTypeToggle from "./_components/CostTypeToggle";
import CostSaveBar from "./_components/CostSaveBar";
import GeneralCostHistorySheet from "./_components/GeneralCostHistorySheet";

import { useCostDrafts } from "./hooks/useCostDrafts";

import { useDebounce } from "@/hooks/helpers/useDebounce";
import {
  useArticleCosts,
  useGeneralArticleCostHistory,
  useGeneralArticleCosts,
} from "@/hooks/mantenimiento/compras/gestion_costos/useCostListings";

import {
  useBulkUpdateArticleCost,
  useBulkUpdateGeneralCost,
} from "@/actions/mantenimiento/compras/gestion_costos/actions";
import type { GeneralCostRow } from "@/types/purchase";
import { PageHeader } from "@/components/layout/PageHeader";

type CostType = "ARTICLE" | "GENERAL";

type Category = "all" | "COMPONENT" | "PART" | "CONSUMABLE" | "TOOL";

// Deben coincidir con los roles que la ruta exige en el servidor.
const ARTICLE_COST_ROLES = [
  "ANALISTA_COMPRAS",
  "JEFE_COMPRAS",
  "SUPERUSER",
  "JEFE_ADMINISTRACION",
  "ANALISTA_ADMINISTRACION",
];
const GENERAL_COST_ROLES = [
  "ASISTENTE_COMPRAS",
  "SUPERUSER",
  "JEFE_ADMINISTRACION",
  "ANALISTA_ADMINISTRACION",
];

const CostManagementPage = () => {
  const { user } = useAuth();
  const { selectedCompany } = useCompanyStore();

  const userRoles = useMemo(
    () => user?.roles?.map((role) => role.name) ?? [],
    [user],
  );

  const canViewArticleCosts =
    !!selectedCompany?.isOMAC &&
    ARTICLE_COST_ROLES.some((role) => userRoles.includes(role));

  const canViewGeneralCosts = GENERAL_COST_ROLES.some((role) =>
    userRoles.includes(role),
  );

  const showTypeToggle = canViewArticleCosts && canViewGeneralCosts;

  const [selectedType, setSelectedType] = useState<CostType>("ARTICLE");
  const [category, setCategory] = useState<Category>("all");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search.trim(), 350);

  const [groupBy, setGroupBy] = useState<string>("NONE");

  // Con acceso a un solo tipo, ese es el que se ve: no hay nada que elegir.
  const type: CostType =
    !canViewArticleCosts && canViewGeneralCosts
      ? "GENERAL"
      : !canViewGeneralCosts && canViewArticleCosts
        ? "ARTICLE"
        : selectedType;

  // La agrupación y la búsqueda de un tipo no aplican al otro.
  const handleTypeChange = (next: CostType) => {
    setSelectedType(next);
    setGroupBy("NONE");
    setSearch("");
  };

  // Búsqueda y agrupación las resuelve el servidor: con cursor el cliente
  // solo tiene la página actual. Al agrupar, cada página trae grupos
  // completos, así que "replicar costo" alcanza a todas las filas del grupo.
  const filters = {
    search: debouncedSearch || undefined,
    group_by: groupBy === "NONE" ? undefined : groupBy,
  };

  const articles = useArticleCosts(
    { ...filters, category },
    type === "ARTICLE" && canViewArticleCosts,
  );

  const generals = useGeneralArticleCosts(
    filters,
    type === "GENERAL" && canViewGeneralCosts,
  );

  const listing = type === "ARTICLE" ? articles : generals;
  const rows = listing.rows as Array<{
    id: number;
    cost?: number;
    group_key?: string;
  }>;

  const {
    drafts: costDrafts,
    hasChanges,
    onCostChange,
    setDrafts,
  } = useCostDrafts();

  const bulkArticleMutation = useBulkUpdateArticleCost();
  const bulkGeneralMutation = useBulkUpdateGeneralCost();

  const handleSave = useCallback(() => {
    const updates = Object.entries(costDrafts).map(([id, value]) => ({
      id: Number(id),
      cost: Number(value),
    }));

    if (!updates.length) return;

    const payload = {
      company: selectedCompany?.slug!,
      updates,
    };

    if (type === "ARTICLE") {
      bulkArticleMutation.mutate(payload, {
        onSuccess: () => setDrafts({}),
      });
    } else {
      bulkGeneralMutation.mutate(payload, {
        onSuccess: () => setDrafts({}),
      });
    }
  }, [
    costDrafts,
    type,
    selectedCompany,
    bulkArticleMutation,
    bulkGeneralMutation,
    setDrafts,
  ]);

  const handleReset = useCallback(() => {
    setDrafts({});
  }, [setDrafts]);

  const [historyRow, setHistoryRow] = useState<GeneralCostRow | null>(null);
  const history = useGeneralArticleCostHistory(historyRow?.id ?? null);

  const columns = useMemo(
    () =>
      getColumns({
        type,
        onCostChange,
        onViewHistory: (row) => setHistoryRow(row),
        category,
      }),
    [type, onCostChange, category],
  );

  const groupedUnit = groupBy === "NONE" ? "artículo(s)" : "grupo(s)";
  const summary =
    listing.total !== undefined
      ? `${listing.total.toLocaleString("es-VE")} ${groupedUnit}`
      : undefined;

  const cursorPagination = { ...listing.pagination, summary };

  return (
    <ContentLayout title="Gestión de Costos">
      <div className="flex flex-col gap-6">
        <PageHeader />

        <div className="flex flex-col gap-2 border-b pb-4">
          <div className="flex items-end justify-between">
            <div className="flex flex-col">
              <h1 className="text-3xl font-semibold tracking-tight">
                Gestión de Costos
              </h1>

              <p className="text-sm text-muted-foreground">
                Administra y actualiza los costos unitarios de artículos y otros
                elementos del inventario aeronáutico y general.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <CostTypeToggle
            type={type}
            setType={handleTypeChange}
            category={category}
            setCategory={setCategory}
            showTabs={showTypeToggle}
          />
        </div>

        <div
          className="
          flex items-center justify-between gap-4
          px-3 py-2
          rounded-xl border
          bg-slate-200/40 border-slate-200/40
          dark:bg-slate-800/70 dark:border-slate-700/60
          backdrop-blur-md
          dark:shadow-[0_4px_20px_rgba(0,0,0,0.35)]
        "
        >
          <CostToolbar
            search={search}
            setSearch={setSearch}
            groupBy={groupBy}
            setGroupBy={setGroupBy}
            type={type}
          />

          <span className="text-xs text-muted-foreground tabular-nums">
            {summary}
          </span>
        </div>

        {/* Los borradores se conservan al cambiar de página: se guardan todos
            juntos. */}
        <CostSaveBar
          hasChanges={hasChanges}
          modifiedCount={Object.keys(costDrafts).length}
          onSave={handleSave}
          onReset={handleReset}
        />

        {groupBy !== "NONE" ? (
          <GroupedCostTable
            data={rows}
            pagination={cursorPagination}
            isTransitioning={listing.isTransitioning}
            renderTable={(groupRows) => (
              <DataTable
                columns={columns}
                data={groupRows}
                meta={{ costDrafts }}
                overflowVisible
                persistKey="gestion_costos"
              />
            )}
          />
        ) : (
          <DataTable
            columns={columns}
            data={rows}
            loading={listing.isLoading}
            meta={{ costDrafts }}
            overflowVisible
            cursorPagination={cursorPagination}
          />
        )}
      </div>

      <GeneralCostHistorySheet
        open={!!historyRow}
        onOpenChange={(open) => !open && setHistoryRow(null)}
        description={historyRow?.description}
        brandModel={historyRow?.brand_model ?? undefined}
        variantType={historyRow?.variant_type ?? undefined}
        history={history.data?.history}
        isLoading={history.isLoading}
      />
    </ContentLayout>
  );
};

export default CostManagementPage;
