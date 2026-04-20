export type OrderStatus = "CLOSED" | "IN_PROCESS" | "OPEN" | string;



// OBTENER  CLASES DE BADGE SEGUN EL ESTADO DEL REPORTE
export const getBadgeStatusClass = (status: OrderStatus): string => {
    const statusMap: Record<string, string> = {
        CERRADO: "bg-green-400",
        EN_PROCESO: "bg-yellow-400",
        OPEN: "bg-red-400",
    };

    const baseClasses = "justify-center items-center text-center font-bold font-sans pointer-events-none";
    const colorClass = statusMap[status] || "bg-red-400";

    return `${baseClasses} ${colorClass}`;
};


