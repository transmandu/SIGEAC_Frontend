export type CriticalAlertSeverity = "warning" | "critical";

export type CriticalAlert = {
    id: string;
    source: string;
    sourceId: number;
    title: string;
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
