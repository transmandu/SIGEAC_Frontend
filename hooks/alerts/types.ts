import { InTransitDetail } from "@/types";
import type { QuarantineHazardTier } from "@/lib/warehouse/quarantine";

/**
 * `in-transit` no es un nivel de gravedad más: es un artículo bajo mínimo cuya
 * reposición ya está comprada y solo falta que llegue. Se distingue para que
 * la alerta informe en vez de desaparecer — ocultarla era justo lo que dejaba
 * a almacén re-pedir algo ya comprado.
 */
export type CriticalAlertSeverity = "warning" | "critical" | "in-transit";

/**
 * Diseño con el que se dibuja la alerta. Cada valor tiene su propia tarjeta;
 * quien agrega las alertas no sabe qué significa ninguno, solo despacha.
 * Agregar una fuente con diseño propio es agregar un valor y su tarjeta.
 */
export type CriticalAlertVariant = "stock" | "quarantine-hazard";

/**
 * Vocabulario con el que el botón y el encabezado describen esta alerta. Los
 * roles de almacén y los de compras casi no se solapan —solo el SUPERUSER ve
 * ambas fuentes—, así que el tono no puede fijarse por jerarquía: lo declara
 * cada fuente y el panel resuelve según lo que este usuario realmente tiene.
 * Agregar un tono es agregarlo aquí y en TONE_COPY; nada más lo enumera.
 */
export type CriticalAlertTone = "restock" | "hazard" | "maintenance";


/** Estado del plazo legal, lo único que gradúa la intensidad de un hazard. */
export type QuarantineHazardMeta = {
    tier: QuarantineHazardTier;
    progress: number;
    isExpired: boolean;
    daysElapsed: number;
    legalDays: number;
    remaining: number | null;
};

export type CriticalAlert = {
    id: string;
    source: string;
    sourceId: number;
    /** Tarjeta a usar. Por omisión `stock`: es el diseño original. */
    variant?: CriticalAlertVariant;
    /** Por omisión `restock`, el vocabulario con el que nació el panel. */
    tone?: CriticalAlertTone;
    /**
     * Peso para ordenar entre alertas visibles: mayor primero. Lo fija la
     * fuente porque solo ella sabe qué tan grave es lo suyo (un plazo legal
     * casi vencido pesa más que uno recién abierto). Empates conservan el
     * orden de llegada.
     */
    weight?: number;
    /**
     * Si el usuario puede quitarla de la vista. Las de riesgo no se descartan:
     * el plazo legal corre igual y ocultarla solo borra el aviso, no el
     * problema. Por omisión `true`, como las de stock.
     */
    isDismissable?: boolean;
    /**
     * Si cuenta como pendiente en el botón. Lo que ya está comprado y solo
     * falta que llegue no infla el contador. Por omisión `true`.
     */
    countsAsPending?: boolean;
    /** Presente solo en la variante de cuarentena; gobierna color y barra. */
    hazard?: QuarantineHazardMeta;
    title: string;
    /**
     * Sujeto concreto de la alerta (ej. la identidad del artículo), separado
     * de description para que la tarjeta pueda resaltarlo: es el dato que se
     * busca de un vistazo cuando hay varias alertas apiladas.
     */
    label?: string;
    description?: string;
    severity: CriticalAlertSeverity;
    href?: string;
    /** Texto del enlace; sin él la tarjeta no muestra ninguno. */
    hrefLabel?: string;
    /**
     * Accion de "Sí" para esta alerta puntual, provista por el hook de la
     * fuente que la genero (ej. useLowStockAlerts sabe que confirmar un
     * low-stock significa crear una requisicion). El botón/popover genérico
     * no conoce el significado de la acción, solo la invoca.
     */
    onConfirm?: () => void;
    isConfirming?: boolean;
    /**
     * Compras ya en curso para este artículo. Cuando trae algo, la tarjeta
     * muestra qué viene en camino y pide confirmación extra antes de volver a
     * solicitar, en vez de bloquear el pedido: re-pedir puede ser legítimo si
     * lo comprado no alcanza o la entrega se demora.
     */
    inTransit?: InTransitDetail[];
};

/** Lecturas por omisión, para que las fuentes solo declaren lo que las distingue. */
export const alertVariant = (alert: CriticalAlert) => alert.variant ?? "stock";
export const alertTone = (alert: CriticalAlert) => alert.tone ?? "restock";
export const isAlertDismissable = (alert: CriticalAlert) => alert.isDismissable !== false;
export const alertCountsAsPending = (alert: CriticalAlert) => alert.countsAsPending !== false;
