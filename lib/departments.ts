import { Department } from "@/types";

// /departments ya devuelve todos los departamentos en lista plana y además
// cada uno con sus `descendants`; sin deduplicar, los hijos salen repetidos.
export const flattenDepartments = (departments: Department[]): Department[] => {
  const byId = new Map<Department["id"], Department>();
  const walk = (list: Department[]) => {
    for (const department of list) {
      if (!byId.has(department.id)) byId.set(department.id, department);
      walk(department.descendants ?? []);
    }
  };
  walk(departments);
  return [...byId.values()];
};
