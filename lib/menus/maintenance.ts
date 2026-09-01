import type { Group, MenuContext } from "@/lib/menus/types";

/**
 * El módulo "Mantenimiento" está contratado (hangar74/estelar lo tienen
 * asignado en `modules`) pero hoy no tiene ninguna pantalla propia — el único
 * contenido que tuvo (Servicios, el prototipo de catálogo) se eliminó; el
 * catálogo real vive en el menú de Ingeniería, que es quien lo administra.
 */
export function buildMaintenanceGroup({ pathname, currentCompany }: MenuContext): Group {
    return {
        groupLabel: "Mantenimiento",
        moduleValue: "maintenance",
        menus: [],
    };
}
