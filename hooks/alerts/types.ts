import { InTransitDetail } from "@/types";

/**
 * `in-transit` no es un nivel de gravedad más: es un artículo bajo mínimo cuya
 * reposición ya está comprada y solo falta que llegue. Se distingue para que
 * la alerta informe en vez de desaparecer — ocultarla era justo lo que dejaba
 * a almacén re-pedir algo ya comprado.
 */
export type CriticalAlertSeverity = "warning" | "critical" | "in-transit";

export type CriticalAlert = {
    id: string;
    source: string;
    sourceId: number;
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
