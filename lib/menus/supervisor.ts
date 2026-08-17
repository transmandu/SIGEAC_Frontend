import type { Group, MenuContext } from "@/lib/menus/types";
import { ShieldCheck } from "lucide-react";

/**
 * Módulo SUPERVISOR — exclusivo de SUPERUSER.
 *
 * Herramientas de saneamiento de datos que operan por encima de los módulos
 * normales: corrigen inconsistencias que el flujo operativo no puede arreglar
 * por sí solo (hoy, artículos generales duplicados por el flujo de compras).
 *
 * El rol aquí solo oculta el menú; el gating real vive en el backend
 * (routes/api/supervisor/routes.php) más el ProtectedRoute del layout.
 */
export function buildSupervisorGroup({ pathname, currentCompany }: MenuContext): Group {
    const base = `/${currentCompany?.slug}/supervisor`;

    return {
        groupLabel: "Supervisor",
        menus: [
            {
                href: `${base}/articulos_generales`,
                label: "Artículos Generales",
                active: pathname.includes(`${base}/articulos_generales`),
                icon: ShieldCheck,
                roles: ["SUPERUSER"],
                requiresOmac: true,
                submenus: [
                    {
                        href: `${base}/articulos_generales`,
                        label: "Supervisar Artículos",
                        active: pathname === `${base}/articulos_generales`,
                    },
                    {
                        href: `${base}/articulos_generales/fusiones`,
                        label: "Historial de Fusiones",
                        active: pathname === `${base}/articulos_generales/fusiones`,
                    },
                ],
            },
        ],
    };
}
