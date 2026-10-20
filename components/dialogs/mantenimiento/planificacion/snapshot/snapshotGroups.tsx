import { ReactNode } from "react";
import { Cog, type LucideIcon } from "lucide-react";

import { comparePartsByOrder, partTypeLabel } from "@/lib/maintenancePartTypes";
import { MaintenanceControlSnapshotPart } from "@/types";

/** Una sección del diálogo: su título, su índice y las filas ya pintadas. */
export interface SnapshotGroup {
  key: string;
  title: string;
  serial?: string | null;
  icon: LucideIcon;
  /** Cantidad de ítems, para el índice. */
  count: number;
  rows: ReactNode;
}

/**
 * Una sección por parte con ítems, igual que el control en vivo: "Motor 1",
 * "Motor 2"... numerado por orden dentro de su tipo (el orden lo fija
 * `part_order`, comparePartsByOrder), con el S/N aparte.
 *
 * Se agrupa por id de parte, no por su rótulo: dos partes del mismo tipo
 * pueden compartir nombre y sus ítems terminarían mezclados. Los ítems de una
 * parte que el snapshot no identificó no se pierden: van a una sección propia.
 */
export function buildPartGroups<T extends { aircraft_part_id: number | null }>(
  items: T[],
  parts: MaintenanceControlSnapshotPart[],
  renderRows: (partItems: T[]) => ReactNode,
  fallbackTitle: (partItems: T[]) => string = () => "Parte",
): SnapshotGroup[] {
  const groups: SnapshotGroup[] = [];

  const orderedParts = [...parts].sort((a, b) =>
    comparePartsByOrder(
      {
        id: a.id,
        type: a.type ?? undefined,
        current_assignment: { part_order: a.part_order },
      },
      {
        id: b.id,
        type: b.type ?? undefined,
        current_assignment: { part_order: b.part_order },
      },
    ),
  );

  const counters: Record<string, number> = {};
  orderedParts.forEach((part) => {
    const partItems = items.filter((i) => i.aircraft_part_id === part.id);
    if (!partItems.length) return;
    const type = (part.type ?? "").toUpperCase();
    counters[type] = (counters[type] ?? 0) + 1;
    groups.push({
      key: `part-${part.id}`,
      title: `${partTypeLabel(part.type ?? undefined)} ${counters[type]}`,
      serial: part.serial,
      icon: Cog,
      count: partItems.length,
      rows: renderRows(partItems),
    });
  });

  const knownPartIds = new Set(parts.map((p) => p.id));
  const unknownPartIds = Array.from(
    new Set(
      items
        .filter(
          (i) => i.aircraft_part_id && !knownPartIds.has(i.aircraft_part_id),
        )
        .map((i) => i.aircraft_part_id as number),
    ),
  );
  unknownPartIds.forEach((partId) => {
    const partItems = items.filter((i) => i.aircraft_part_id === partId);
    groups.push({
      key: `part-${partId}`,
      title: fallbackTitle(partItems),
      icon: Cog,
      count: partItems.length,
      rows: renderRows(partItems),
    });
  });

  return groups;
}
