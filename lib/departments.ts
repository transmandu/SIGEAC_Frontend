import { Department } from "@/types";

/**
 * El listado de departamentos llega plano, pero cada nodo trae además su
 * subárbol en `descendants`: recorrerlo sin deduplicar repite los nodos.
 */
export const flattenDepartments = (
  departments: Department[] = [],
): Department[] => {
  const byId = new Map<number, Department>();

  const walk = (nodes: Department[]) => {
    nodes.forEach((node) => {
      if (!byId.has(node.id)) byId.set(node.id, node);
      walk(node.descendants ?? node.children ?? []);
    });
  };

  walk(departments);

  return [...byId.values()];
};

/** Ids del nodo y de todo su subárbol, en un árbol anidado por `children`. */
export const collectSubtreeIds = (node: Department): number[] => [
  node.id,
  ...(node.children ?? []).flatMap(collectSubtreeIds),
];

/** Cadena de ancestros desde la raíz hasta el nodo (incluido), o [] si no existe. */
export const findDepartmentPath = (
  nodes: Department[],
  id: number,
  trail: Department[] = [],
): Department[] => {
  for (const node of nodes) {
    const path = [...trail, node];
    if (node.id === id) return path;
    const found = findDepartmentPath(node.children ?? [], id, path);
    if (found.length) return found;
  }
  return [];
};

export const findDepartmentNode = (
  nodes: Department[],
  id: number,
): Department | null => {
  for (const node of nodes) {
    if (node.id === id) return node;
    const found = findDepartmentNode(node.children ?? [], id);
    if (found) return found;
  }
  return null;
};

/** Árbol anidado por `children` aplanado en orden, con su profundidad. */
export const flattenTreeWithDepth = (
  nodes: Department[],
  depth = 0,
): { department: Department; depth: number }[] =>
  nodes.flatMap((node) => [
    { department: node, depth },
    ...flattenTreeWithDepth(node.children ?? [], depth + 1),
  ]);

/** Siglas sugeridas desde el nombre: iniciales de las palabras significativas. */
export const suggestAcronym = (name: string): string => {
  const stopWords = new Set(["DE", "DEL", "LA", "LAS", "LOS", "Y", "E", "EL", "EN"]);

  const words = name
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toUpperCase()
    .replace(/[^A-Z\s]/g, "")
    .split(/\s+/)
    .filter((word) => word && !stopWords.has(word));

  if (words.length === 0) return "";
  if (words.length === 1) return words[0].slice(0, 3);

  return words
    .map((word) => word[0])
    .join("")
    .slice(0, 6);
};

/** Nombre a mostrar: tipo + nombre ("Dirección de Mantenimiento"). */
export const departmentLabel = (
  department: Pick<Department, "name" | "full_name">,
): string => department.full_name || department.name;

/**
 * Para pantallas que cruzan departamentos por su nombre mostrado (Biblioteca):
 * deja el nombre completo en `name`, que es la clave con la que llegan los
 * documentos agrupados.
 */
export const withDisplayNames = (departments: Department[]): Department[] =>
  departments.map((department) => ({
    ...department,
    name: departmentLabel(department),
    descendants: department.descendants
      ? withDisplayNames(department.descendants)
      : department.descendants,
  }));
