import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useGetLowStockGeneralArticles, useGetLowStockConsumableArticles } from "./useGetLowStockArticles";
import { useCreateRequisitionFromLowStockAlert } from "@/actions/mantenimiento/compras/requisiciones/actions";
import { useLowStockAlertsRealtime } from "./useLowStockAlertsRealtime";
import { CriticalAlert } from "./types";
import { InTransitDetail } from "@/types";

const ROLES_WITH_LOW_STOCK_ALERT_ACCESS = ["ANALISTA_ALMACEN", "JEFE_ALMACEN", "SUPERUSER"];

/**
 * Ocultas temporalmente para el lanzamiento a produccion: solo se probaran
 * alertas de articulos generales por ahora. La logica de consumibles queda
 * intacta (fetch, mapeo, onConfirm) para reactivarla luego con solo poner
 * esto en true.
 */
const SHOW_CONSUMABLE_ALERTS = false;

/**
 * Redactadas desde almacén: describen en qué punto está la solicitud y qué
 * falta para que el stock entre, sin exponer el número de orden de compra
 * (documento de compras, que almacén no maneja).
 */
const IN_TRANSIT_STAGE_LABELS: Record<InTransitDetail["stage"], string> = {
    REQUISITION_OPEN: "solicitud en trámite",
    APPROVED_WITHOUT_PURCHASE_ORDER: "aprobada, compra aún no gestionada",
    PURCHASE_ORDER_PLACED: "aprobada y en compra",
    INTAKE_PENDING: "pendiente de recibir en almacén",
    INTAKE_REJECTED: "entrega rechazada, a la espera de reposición",
};

/**
 * Resume qué hay en camino para que quien ve la alerta entienda por qué el
 * stock sigue bajo y decida con datos si vuelve a pedir.
 */
const describeInTransit = (details: InTransitDetail[]) =>
    details
        .map((detail) => {
            // La referencia visible es la solicitud, no la orden de compra:
            // almacén origina y sigue la SC, la OC pertenece a compras y nunca
            // llega a sus manos.
            const quantity = [detail.quantity, detail.unit_label].filter(Boolean).join(" ");
            const waiting = typeof detail.days_waiting === "number"
                ? ` · ${detail.days_waiting} día${detail.days_waiting === 1 ? "" : "s"} en espera`
                : "";

            return `En camino: ${quantity} (${detail.requisition_number}) — ${IN_TRANSIT_STAGE_LABELS[detail.stage]}${waiting}`;
        })
        .join("\n");

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
            const unitValue = article.general_primary_unit?.value ?? "";

            // Espejo de createFromLowStockAlert(): solo para anticipar la
            // cantidad en el texto, la cifra real la calcula el backend.
            const target = Number(article.maximum_quantity ?? 0) > 0
                ? Number(article.maximum_quantity)
                : Number(article.minimum_quantity ?? 0);
            const restockQuantity = Math.ceil(Math.max(target - Number(article.quantity ?? 0), 1));

            // Misma identidad visible que en el resto de compras: dos artículos
            // pueden compartir descripción y variante y diferir solo por marca,
            // así que la alerta debe decir cuál de los dos está bajo.
            const articleLabel = [article.description, article.variant_type, article.brand_model]
                .filter(Boolean)
                .join(" - ");

            const inTransit = article.in_transit ?? [];
            const stockLine = `Mínimo: ${article.minimum_quantity} ${unitValue} · Cantidad restante: ${article.quantity} ${unitValue}`;

            return {
            id: `low-stock-general-article-${article.id}`,
            source: "low-stock-general-article",
            sourceId: article.id,
            title: inTransit.length > 0
                ? "Artículo bajo mínimo, con una compra ya en camino"
                : "Un artículo del inventario está por debajo de su stock mínimo",
            label: articleLabel,
            description: inTransit.length > 0
                ? `${stockLine}\n${describeInTransit(inTransit)}`
                : `${stockLine}\n¿Deseas crear una solicitud de compra por ${restockQuantity} ${unitValue} para este artículo?`,
            // El tránsito manda sobre el nivel de stock: sigue bajo, pero la
            // reposición ya está pedida y no requiere la misma acción.
            severity: inTransit.length > 0
                ? "in-transit"
                : Number(article.quantity ?? 0) <= 0 ? "critical" : "warning",
            // Lleva a la solicitud que ya pidió el artículo, para revisar en
            // qué va sin salir a buscarla. Con varias en curso apuntar a una
            // sola sería arbitrario, así que se enlaza el listado: la
            // descripción ya enumera cuáles son.
            href: companySlug && inTransit.length > 0
                ? (inTransit.length === 1 && inTransit[0].requisition_number
                    ? `/${companySlug}/general/requisiciones/${inTransit[0].requisition_number}`
                    : `/${companySlug}/general/requisiciones`)
                : undefined,
            hrefLabel: inTransit.length === 1
                ? `Ver solicitud ${inTransit[0].requisition_number ?? ""}`.trim()
                : "Ver solicitudes de compra",
            inTransit,
            // La tarjeta ya detalla qué viene en camino, así que confirmar ahí
            // es una decisión informada: se acusa recibo y el backend deja
            // crear la solicitud en vez de responder 409.
            onConfirm: companySlug
                ? () => createRequisitionFromLowStockAlert.mutate({
                    source: "general",
                    generalArticleId: article.id,
                    company: companySlug,
                    acknowledgeInTransit: inTransit.length > 0,
                })
                : undefined,
            isConfirming: createRequisitionFromLowStockAlert.isPending
                && createRequisitionFromLowStockAlert.variables?.source === "general"
                && createRequisitionFromLowStockAlert.variables.generalArticleId === article.id,
            };
        });

        const consumableAlerts: CriticalAlert[] = consumableArticles.map((article) => {
            const unitValue = article.batch.unit?.value ?? "";
            return {
            id: `low-stock-consumable-article-${article.id}`,
            source: "low-stock-consumable-article",
            sourceId: article.id,
            title: "Un artículo del inventario está por debajo de su stock mínimo",
            label: [article.batch.name, article.part_number].filter(Boolean).join(" - "),
            description: `Mínimo: ${article.batch.min_quantity} ${unitValue} · Cantidad restante: ${article.consumable.quantity} ${unitValue}\n¿Deseas crear una solicitud de compra para este artículo?`,
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
