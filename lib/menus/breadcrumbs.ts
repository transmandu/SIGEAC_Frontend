import { buildMenuGroups } from "@/lib/menu-list";
import type { Company } from "@/types";

export type Crumb = {
    label: string;
    href?: string;
};

const normalize = (path: string) => path.replace(/\/+$/, "") || "/";

/** Los grupos de rutas de Next — (aeronautico) — no existen en la URL real. */
const isRouteGroup = (segment: string) =>
    segment.startsWith("(") && segment.endsWith(")");

function findTrail(pathname: string, currentCompany: Company | null): Crumb[] | null {
    const target = normalize(pathname);
    // Sin filtrar por roles ni módulos: el menú aquí es un diccionario
    // ruta → etiqueta, y una página que el usuario ya está viendo no puede
    // quedarse sin migaja porque su rol no la tenga en el sidebar.
    const groups = buildMenuGroups(pathname, currentCompany);

    type Match = { length: number; trail: Crumb[] };
    let best: Match | null = null;

    const consider = (href: string, trail: Crumb[]) => {
        if (!href) return;

        const candidate = normalize(href);
        const matches = target === candidate || target.startsWith(`${candidate}/`);

        // Varias entradas coinciden por prefijo; gana la más específica.
        if (!matches) return;
        if (best && candidate.length <= best.length) return;

        best = { length: candidate.length, trail };
    };

    for (const group of groups) {
        for (const menu of group.menus) {
            const groupCrumb: Crumb[] = group.groupLabel
                ? [{ label: group.groupLabel }]
                : [];

            consider(menu.href, [...groupCrumb, { label: menu.label, href: menu.href }]);

            for (const submenu of menu.submenus) {
                consider(submenu.href, [
                    ...groupCrumb,
                    // Los menús que solo agrupan submenús (href: "") no son enlazables.
                    menu.href
                        ? { label: menu.label, href: menu.href }
                        : { label: menu.label },
                    { label: submenu.label, href: submenu.href },
                ]);
            }
        }
    }

    return (best as Match | null)?.trail ?? null;
}

function humanizeSegment(segment: string): string {
    const decoded = decodeURIComponent(segment);

    // Identificadores (COT-00123, 0102-1234, YV1234) se muestran tal cual; solo
    // los slugs en minúscula son etiquetas de ruta que valga la pena embellecer.
    if (/\d/.test(decoded) || /[A-Z]/.test(decoded)) {
        return decoded;
    }

    return decoded
        .split(/[_-]/)
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

/**
 * Inicio → ruta del menú → página actual. Los segmentos más profundos que la
 * entrada de menú que los cubre se agregan humanizados, para que el detalle de
 * una cotización quede como Inicio → Compras → Cotizaciones → COT-00123.
 */
export function buildBreadcrumbTrail(
    pathname: string,
    currentCompany: Company | null,
): Crumb[] {
    const home: Crumb = currentCompany
        ? { label: "Inicio", href: `/${currentCompany.slug}/dashboard` }
        : { label: "Inicio", href: "/inicio" };

    const trail = findTrail(pathname, currentCompany);

    if (!trail) {
        const segments = normalize(pathname)
            .split("/")
            .filter(Boolean)
            .filter((segment) => !isRouteGroup(segment));

        // El slug de la compañía ya está representado por "Inicio".
        const relevant =
            currentCompany && segments[0] === currentCompany.slug
                ? segments.slice(1)
                : segments;

        return [home, ...relevant.map((segment) => ({ label: humanizeSegment(segment) }))];
    }

    const matched = trail[trail.length - 1];
    const matchedHref = matched.href ? normalize(matched.href) : "";
    const rest = normalize(pathname)
        .slice(matchedHref.length)
        .split("/")
        .filter(Boolean)
        .filter((segment) => !isRouteGroup(segment));

    return [home, ...trail, ...rest.map((segment) => ({ label: humanizeSegment(segment) }))];
}
