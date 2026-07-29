export type CriticalAlertSeverity = "warning" | "critical";

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
    /**
     * Accion de "Sí" para esta alerta puntual, provista por el hook de la
     * fuente que la genero (ej. useLowStockAlerts sabe que confirmar un
     * low-stock significa crear una requisicion). El botón/popover genérico
     * no conoce el significado de la acción, solo la invoca.
     */
    onConfirm?: () => void;
    isConfirming?: boolean;
};
