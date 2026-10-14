import {
  collectSubtreeIds,
  findDepartmentNode,
  findDepartmentPath,
} from "@/lib/departments";
import { Department } from "@/types";

/** Mismo tope que aplica el servidor al anidar departamentos. */
export const MAX_DEPTH = 20;

export type DropZone = "before" | "after" | "inside" | "root";

export interface DropPreview {
  targetId: number | null;
  zone: DropZone;
}

export type DropResolution =
  | { status: "invalid"; reason: string }
  | { status: "noop" }
  | {
      status: "ok";
      parentId: number | null;
      /** Índice entre los hermanos de destino, sin contar al nodo movido. */
      position: number;
      sameParent: boolean;
      /** Orden completo de los hermanos; solo se usa al reordenar bajo el mismo padre. */
      orderedIds: number[];
      label: string;
    };

const EDGE = 0.28;

/** El borde superior/inferior de la fila reordena; el centro anida. */
export const zoneFromPointer = (pointerY: number, top: number, height: number): DropZone => {
  const ratio = (pointerY - top) / Math.max(height, 1);
  if (ratio < EDGE) return "before";
  if (ratio > 1 - EDGE) return "after";
  return "inside";
};

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();

const subtreeHeight = (node: Department): number =>
  1 + Math.max(0, ...(node.children ?? []).map(subtreeHeight));

const invalid = (reason: string): DropResolution => ({ status: "invalid", reason });

export const resolveDrop = (
  roots: Department[],
  movedId: number,
  preview: DropPreview,
): DropResolution => {
  const moved = findDepartmentNode(roots, movedId);
  if (!moved) return invalid("El departamento ya no existe.");

  let parentId: number | null = null;
  let target: Department | null = null;

  if (preview.zone !== "root") {
    target = preview.targetId === null ? null : findDepartmentNode(roots, preview.targetId);
    if (!target) return { status: "noop" };

    if (target.id === moved.id) {
      return preview.zone === "inside"
        ? invalid("Un departamento no puede depender de sí mismo.")
        : { status: "noop" };
    }

    if (collectSubtreeIds(moved).includes(target.id)) {
      return invalid("No puede colocarse dentro de uno de sus propios dependientes.");
    }

    parentId = preview.zone === "inside" ? target.id : (target.department_parent_id ?? null);
  }

  const parent = parentId === null ? null : findDepartmentNode(roots, parentId);
  const siblings = (parent ? (parent.children ?? []) : roots).filter(
    (sibling) => sibling.id !== moved.id,
  );

  const position =
    preview.zone === "inside" || preview.zone === "root"
      ? siblings.length
      : siblings.findIndex((sibling) => sibling.id === target!.id) +
        (preview.zone === "after" ? 1 : 0);

  const currentParentId = moved.department_parent_id ?? null;
  const sameParent = parentId === currentParentId;

  const orderedIds = siblings.map((sibling) => sibling.id);
  orderedIds.splice(position, 0, moved.id);

  if (sameParent) {
    const currentOrder = (parent ? (parent.children ?? []) : roots).map((sibling) => sibling.id);
    if (currentOrder.join() === orderedIds.join()) return { status: "noop" };
  } else {
    const parentDepth = parentId === null ? 0 : findDepartmentPath(roots, parentId).length;
    if (parentDepth + subtreeHeight(moved) > MAX_DEPTH) {
      return invalid(`El organigrama no admite más de ${MAX_DEPTH} niveles.`);
    }

    const duplicated = siblings.some(
      (sibling) =>
        normalize(sibling.name) === normalize(moved.name) &&
        (sibling.department_type_id ?? null) === (moved.department_type_id ?? null),
    );
    if (duplicated) {
      return invalid(
        `${parent ? parent.full_name : "La raíz"} ya tiene un departamento igual a «${moved.full_name}».`,
      );
    }
  }

  const label =
    preview.zone === "root"
      ? "Dejar en la raíz del organigrama"
      : preview.zone === "inside"
        ? `Colgar de ${target!.full_name}`
        : `${preview.zone === "before" ? "Antes" : "Después"} de ${target!.full_name}`;

  return { status: "ok", parentId, position, sameParent, orderedIds, label };
};

/** Aplica el movimiento al árbol local para que la pantalla responda sin esperar al servidor. */
export const applyMove = (
  roots: Department[],
  movedId: number,
  parentId: number | null,
  position: number,
): Department[] => {
  const moved = findDepartmentNode(roots, movedId);
  if (!moved) return roots;

  const relocated: Department = { ...moved, department_parent_id: parentId };

  const detach = (nodes: Department[]): Department[] =>
    nodes
      .filter((node) => node.id !== movedId)
      .map((node) => (node.children ? { ...node, children: detach(node.children) } : node));

  const insert = (nodes: Department[]): Department[] => {
    const next = [...nodes];
    next.splice(position, 0, relocated);
    return next;
  };

  const detached = detach(roots);
  if (parentId === null) return insert(detached);

  const graft = (nodes: Department[]): Department[] =>
    nodes.map((node) => {
      if (node.id === parentId) return { ...node, children: insert(node.children ?? []) };
      return node.children ? { ...node, children: graft(node.children) } : node;
    });

  return graft(detached);
};

export interface DropState {
  preview: DropPreview | null;
  blocked: boolean;
}

/**
 * El destino cambia con cada movimiento del puntero. Guardarlo fuera de React
 * evita re-renderizar el árbol completo: cada fila se suscribe solo a si es
 * el destino actual.
 */
export const createDropStore = () => {
  let state: DropState = { preview: null, blocked: false };
  const listeners = new Set<() => void>();

  return {
    get: () => state,
    set: (next: DropState) => {
      state = next;
      listeners.forEach((listener) => listener());
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
};

export type DropStore = ReturnType<typeof createDropStore>;
