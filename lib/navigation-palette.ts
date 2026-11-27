import type { LucideIcon } from "lucide-react";
import type { Group } from "@/lib/menus/types";

export type PaletteEntry = {
  id: string;
  label: string;
  /** Destino de navegación. Una entrada con `run` ejecuta una acción en su lugar. */
  href?: string;
  run?: () => void;
  icon: LucideIcon;
  /** Menú al que pertenece un submenú, o pantalla de la que cuelga una acción. */
  context?: string;
  /** Primero la etiqueta, el contexto después y al final los sinónimos. */
  keywords: string[];
  /** Cuelga de otra entrada (acción rápida o vista): se muestra sangrada. */
  action?: boolean;
  /** Pantalla (o vista) de la que cuelga. Una acción dentro de una pestaña cuelga de su vista. */
  parentHref?: string;
  /** Colocada bajo su padre (y no suelta al final de la sección). */
  attached?: boolean;
  /** Nivel del árbol: 0 pantalla, 1 vista o acción de la pantalla, 2 acción de una vista. */
  depth?: number;
  /** Una vista de la pantalla (pestaña, pantalla sin menú), no una acción. */
  view?: boolean;
};

export type PaletteSection = {
  id: string;
  heading: string;
  entries: PaletteEntry[];
};

const FALLBACK_GROUP_LABEL = "Inicio";

const withoutTrailingSlash = (href?: string) =>
  (href ?? "").replace(/\/+$/, "");

function flatten(groups: Group[], prefix: string) {
  const entries: PaletteEntry[] = [];

  for (const group of groups) {
    const groupLabel = group.groupLabel || FALLBACK_GROUP_LABEL;

    for (const menu of group.menus) {
      const own = menu.keywords ?? [];

      if (menu.submenus.length === 0) {
        entries.push({
          id: `${prefix}|${groupLabel}|${menu.label}|${menu.href}`,
          label: menu.label,
          href: menu.href,
          icon: menu.icon,
          parentHref: menu.parentHref,
          view: menu.entryType === "view",
          keywords: [menu.label, groupLabel, ...own],
        });
        continue;
      }

      for (const submenu of menu.submenus) {
        entries.push({
          id: `${prefix}|${groupLabel}|${menu.label}|${submenu.label}|${submenu.href}`,
          label: submenu.label,
          href: submenu.href,
          icon: menu.icon,
          context: menu.label,
          keywords: [
            submenu.label,
            menu.label,
            groupLabel,
            ...(submenu.keywords ?? []),
            ...own,
          ],
        });
      }
    }
  }

  return entries;
}

/**
 * Cuelga las vistas y acciones rápidas de la pantalla a la que pertenecen,
 * dentro de la sección de su módulo. Bajo cada padre van primero las vistas y
 * después las acciones; una acción que vive dentro de una pestaña cuelga de la
 * vista de esa pestaña, a un nivel más. Lo que no encuentra a su padre queda al
 * final de la sección, sin conector.
 */
function attachActions(
  sections: PaletteSection[],
  quickActionGroups: Group[],
): void {
  const keyOf = withoutTrailingSlash;

  // Dos grupos con el mismo encabezado (p. ej. "Perfil" de empresa y de master)
  // se cuelgan juntos: procesados por separado, el segundo soltaría del árbol lo
  // que el primero ya había colgado.
  const byHeading = new Map<string, Group>();
  for (const group of quickActionGroups) {
    const key = group.groupLabel || FALLBACK_GROUP_LABEL;
    const previous = byHeading.get(key);

    byHeading.set(
      key,
      previous
        ? { ...previous, menus: [...previous.menus, ...group.menus] }
        : group,
    );
  }

  for (const group of byHeading.values()) {
    const heading = group.groupLabel || FALLBACK_GROUP_LABEL;

    let section = sections.find(
      (candidate) =>
        candidate.id.startsWith("nav-") && candidate.heading === heading,
    );

    if (!section) {
      section = { id: `nav-actions-${heading}`, heading, entries: [] };
      sections.push(section);
    }

    const roots = section.entries.filter((entry) => !entry.action);
    const earlierLoose = section.entries.filter((entry) => entry.action);

    // Una acción puede declararse una vez por grupo de roles; quien califica
    // por varios no debe verla repetida.
    const raws: PaletteEntry[] = [];
    for (const raw of flatten([group], "action")) {
      if (section.entries.some((entry) => entry.id === raw.id)) continue;
      if (raws.some((other) => other.id === raw.id)) continue;
      raws.push(raw);
    }

    const known = new Set([
      ...roots.map((entry) => keyOf(entry.href)),
      ...raws.map((raw) => keyOf(raw.href)),
    ]);

    const childrenOf = new Map<string, PaletteEntry[]>();
    for (const raw of raws) {
      const parentKey = keyOf(raw.parentHref);
      if (
        !parentKey ||
        parentKey === keyOf(raw.href) ||
        !known.has(parentKey)
      ) {
        continue;
      }
      childrenOf.set(parentKey, [...(childrenOf.get(parentKey) ?? []), raw]);
    }

    const placed = new Set<string>();
    const result: PaletteEntry[] = [];

    const emit = (parent: PaletteEntry, depth: number, ancestors: string[]) => {
      const children = (childrenOf.get(keyOf(parent.href)) ?? []).filter(
        (child) => !placed.has(child.id),
      );
      const ordered = [
        ...children.filter((child) => child.view),
        ...children.filter((child) => !child.view),
      ];

      for (const raw of ordered) {
        if (placed.has(raw.id)) continue;
        placed.add(raw.id);

        const child: PaletteEntry = {
          ...raw,
          action: true,
          attached: true,
          depth: depth + 1,
          context: parent.label,
          keywords: [
            raw.keywords[0],
            parent.label,
            ...ancestors,
            ...raw.keywords.slice(1),
          ],
        };

        result.push(child);
        emit(child, depth + 1, [parent.label, ...ancestors]);
      }
    };

    for (const root of roots) {
      result.push(root);
      emit(root, 0, []);
    }

    const loose = raws
      .filter((raw) => !placed.has(raw.id))
      .map<PaletteEntry>((raw) => ({
        ...raw,
        action: true,
        attached: false,
        depth: 1,
        context: heading,
      }));

    section.entries = [...result, ...earlierLoose, ...loose];
  }
}

/**
 * Grupos del menú ya filtrados por permisos: lo que el buscador ofrece es
 * exactamente lo que el sidebar le muestra a esa persona. Primero van los
 * accesos del sistema (empresa, estación, tema, sesión) y después el menú, con
 * sus vistas y acciones colgando de cada pantalla.
 */
export function buildPaletteSections(
  menuGroups: Group[],
  quickActionGroups: Group[],
  systemSections: PaletteSection[] = [],
): PaletteSection[] {
  const sections: PaletteSection[] = [];

  menuGroups.forEach((group, index) => {
    const entries = flatten([group], "nav");
    if (entries.length === 0) return;

    sections.push({
      id: `nav-${index}`,
      heading: group.groupLabel || FALLBACK_GROUP_LABEL,
      entries,
    });
  });

  attachActions(sections, quickActionGroups);

  return [...systemSections.filter((s) => s.entries.length > 0), ...sections];
}

/**
 * Forma del árbol en la fila `index`: si es la primera o la última de su padre y
 * qué niveles superiores siguen pasando por ella (su línea debe continuar). Las
 * entradas sueltas no cuentan como hermanas de nadie.
 */
export function treeShape(entries: PaletteEntry[], index: number) {
  const level = (entry?: PaletteEntry) =>
    entry?.attached ? (entry.depth ?? 0) : 0;

  const depth = level(entries[index]);
  const isFirst = level(entries[index - 1]) < depth;

  const nextAtOrAbove = (max: number) => {
    for (let next = index + 1; next < entries.length; next += 1) {
      const nextLevel = level(entries[next]);
      if (nextLevel <= max) return nextLevel;
    }
    return undefined;
  };

  const isLast = nextAtOrAbove(depth) !== depth;

  const continuing: number[] = [];
  for (let above = 1; above < depth; above += 1) {
    if (nextAtOrAbove(above) === above) continuing.push(above);
  }

  return { depth, isFirst, isLast, continuing };
}

export function normalizeSearch(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

/**
 * Sin tildes ni mayúsculas, y cada palabra escrita debe aparecer en la entrada.
 * Pesa más lo que está en la etiqueta que en el contexto o los sinónimos, y más
 * el comienzo de palabra que una coincidencia a mitad.
 */
export function scoreEntry(search: string, keywords: string[]): number {
  const tokens = normalizeSearch(search).split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return 1;

  const [rawLabel = "", ...rest] = keywords;
  const label = normalizeSearch(rawLabel);
  const others = rest.map(normalizeSearch);
  const othersText = others.join(" ");

  let total = 0;

  for (const token of tokens) {
    if (label.startsWith(token)) total += 3;
    else if (label.includes(` ${token}`) || others.includes(token))
      total += 2.5;
    else if (label.includes(token)) total += 1.5;
    else if (othersText.includes(token)) total += 1;
    else return 0;
  }

  const exact = label === tokens.join(" ") ? 2 : 0;

  return total / tokens.length + exact;
}
