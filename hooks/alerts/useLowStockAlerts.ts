import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useGetLowStockGeneralArticles, useGetLowStockConsumableArticles } from "./useGetLowStockArticles";
import { useCreateRequisitionFromLowStockAlert } from "@/actions/mantenimiento/compras/requisiciones/actions";
import { useLowStockAlertsRealtime } from "./useLowStockAlertsRealtime";
import { CriticalAlert } from "./types";

const ROLES_WITH_LOW_STOCK_ALERT_ACCESS = ["ANALISTA_ALMACEN", "JEFE_ALMACEN", "SUPERUSER"];

/**
 * Ocultas temporalmente para el lanzamiento a produccion: solo se probaran
 * alertas de articulos generales por ahora. La logica de consumibles queda
 * intacta (fetch, mapeo, onConfirm) para reactivarla luego con solo poner
 * esto en true.
 */
const SHOW_CONSUMABLE_ALERTS = false;

/**
 * Única fuente que sabe que "confirmar" una alerta de bajo stock significa
 * crear una requisicion. El botón/popover genérico solo invoca
 * alert.onConfirm(); agregar una fuente de alerta nueva el día de mañana no
 * requiere tocar el botón, solo un hook como este.
 */
export const useLowStockAlerts = () => {
    const { user } = useAuth();
    const { selectedStation, selectedCompany } = useCompanyStore();
    const { createRequisitionFromLowStockAlert } = useCreateRequisitionFromLowStockAlert();

    const canSeeLowStockAlerts = useMemo(
        () => (user?.roles ?? []).some((r) => ROLES_WITH_LOW_STOCK_ALERT_ACCESS.includes(r.name)),
        [user?.roles],
    );

    const { data: lowStockGeneralArticles, isLoading: isLoadingGeneral } = useGetLowStockGeneralArticles(canSeeLowStockAlerts);
    const { data: lowStockConsumableArticles, isLoading: isLoadingConsumables } = useGetLowStockConsumableArticles(canSeeLowStockAlerts && SHOW_CONSUMABLE_ALERTS);

    useLowStockAlertsRealtime(selectedStation, canSeeLowStockAlerts);

    const generalArticles = useMemo(
        () => (canSeeLowStockAlerts ? (lowStockGeneralArticles ?? []) : []),
        [canSeeLowStockAlerts, lowStockGeneralArticles],
    );
    const consumableArticles = useMemo(
        () => (canSeeLowStockAlerts ? (lowStockConsumableArticles ?? []) : []),
        [canSeeLowStockAlerts, lowStockConsumableArticles],
    );

    const alerts = useMemo<CriticalAlert[]>(() => {
        const companySlug = selectedCompany?.slug;

        const generalAlerts: CriticalAlert[] = generalArticles.map((article) => {
            const unitLabel = article.general_primary_unit?.label ?? "";
            return {
            id: `low-stock-general-article-${article.id}`,
            source: "low-stock-general-article",
            sourceId: article.id,
            title: "Un artículo del inventario está por debajo de su stock mínimo",
            description: `${article.variant_type ? `${article.description} - ${article.variant_type}` : article.description}\nMínimo: ${article.minimum_quantity} ${unitLabel} · Cantidad restante: ${article.quantity} ${unitLabel}\n¿Deseas crear una solicitud de compra para este artículo?`,
            severity: Number(article.quantity ?? 0) <= 0 ? "critical" : "warning",
            onConfirm: companySlug
                ? () => createRequisitionFromLowStockAlert.mutate({
                    source: "general",
                    generalArticleId: article.id,
                    company: companySlug,
                })
                : undefined,
            isConfirming: createRequisitionFromLowStockAlert.isPending
                && createRequisitionFromLowStockAlert.variables?.source === "general"
                && createRequisitionFromLowStockAlert.variables.generalArticleId === article.id,
            };
        });

        const consumableAlerts: CriticalAlert[] = consumableArticles.map((article) => {
            const unitLabel = article.batch.unit?.label ?? "";
            return {
            id: `low-stock-consumable-article-${article.id}`,
            source: "low-stock-consumable-article",
            sourceId: article.id,
            title: "Un artículo del inventario está por debajo de su stock mínimo",
            description: `${article.batch.name} - ${article.part_number}\nMínimo: ${article.batch.min_quantity} ${unitLabel} · Cantidad restante: ${article.consumable.quantity} ${unitLabel}\n¿Deseas crear una solicitud de compra para este artículo?`,
            severity: Number(article.consumable.quantity ?? 0) <= 0 ? "critical" : "warning",
            onConfirm: companySlug
                ? () => createRequisitionFromLowStockAlert.mutate({
                    source: "consumable",
                    articleId: article.id,
                    company: companySlug,
                })
                : undefined,
            isConfirming: createRequisitionFromLowStockAlert.isPending
                && createRequisitionFromLowStockAlert.variables?.source === "consumable"
                && createRequisitionFromLowStockAlert.variables.articleId === article.id,
            };
        });

        return SHOW_CONSUMABLE_ALERTS ? [...generalAlerts, ...consumableAlerts] : generalAlerts;
    }, [generalArticles, consumableArticles, selectedCompany?.slug, createRequisitionFromLowStockAlert]);

    return {
        alerts,
        isLoading: isLoadingGeneral || (SHOW_CONSUMABLE_ALERTS && isLoadingConsumables),
    };
};
