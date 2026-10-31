import { useCallback, useMemo, useState } from "react";

import type { LoanAudience } from "@/hooks/ajustes/convenios/types";
import type { Department, Employee } from "@/types";
import { departmentSubtree, signature } from "./audienceDraft";

/**
 * Borrador de la audiencia de un alcance mientras se edita: qué personas y
 * departamentos están elegidos, a quién se excluyó de un departamento y desde
 * cuándo rige cada cosa. No guarda nada: `payload()` arma lo que se envía.
 *
 * Quien entra por un departamento no se "quita": se excluye, y volver a
 * marcarlo anula la exclusión. Cada cambio de estado reinicia la fecha de esa
 * fila a hoy; la fecha de una fila sin cambios es la que ya tenía guardada.
 */
export function useAudienceDraft({
  initial,
  employees,
  departments,
  today,
}: {
  initial: LoanAudience;
  /** Empleados de la empresa que elige. */
  employees: Employee[];
  /** Departamentos de la empresa que elige, en lista plana. */
  departments: Department[];
  /** `YYYY-MM-DD`: fecha por omisión y tope de las fechas editables. */
  today: string;
}) {
  const saved = useMemo(
    () => ({
      employees: new Set(initial.employees.map((e) => e.dni)),
      excluded: new Set(initial.excluded.map((e) => e.dni)),
      departments: new Set(initial.departments.map((d) => String(d.id))),
      personDates: Object.fromEntries([
        ...initial.employees.map((e) => [e.dni, e.valid_from]),
        ...initial.excluded.map((e) => [e.dni, e.valid_from]),
      ]) as Record<string, string>,
      departmentDates: Object.fromEntries(
        initial.departments.map((d) => [String(d.id), d.valid_from]),
      ) as Record<string, string>,
    }),
    [initial],
  );

  const [employeeDnis, setEmployeeDnis] = useState(
    () => new Set(saved.employees),
  );
  const [excludedDnis, setExcludedDnis] = useState(
    () => new Set(saved.excluded),
  );
  const [departmentIds, setDepartmentIds] = useState(
    () => new Set(saved.departments),
  );
  const [personDates, setPersonDates] = useState(saved.personDates);
  const [departmentDates, setDepartmentDates] = useState(saved.departmentDates);

  // Quienes cubren los departamentos elegidos y sus subdepartamentos, con el
  // mismo criterio del servidor: solo activos.
  const coveredDnis = useMemo(() => {
    if (departmentIds.size === 0) return new Set<string>();
    const inTree = departmentSubtree(
      departments,
      [...departmentIds].map(Number),
    );

    return new Set(
      employees
        .filter(
          (e) =>
            e.isActive !== false && e.department && inTree.has(e.department.id),
        )
        .map((e) => e.dni),
    );
  }, [departmentIds, departments, employees]);

  /** Lo que de verdad queda elegido: sueltas más departamentos, menos excluidas. */
  const chosenDnis = useMemo(
    () =>
      new Set(
        [...employeeDnis, ...coveredDnis].filter(
          (dni) => !excludedDnis.has(dni),
        ),
      ),
    [employeeDnis, coveredDnis, excludedDnis],
  );

  /**
   * Rótulo de la fecha de una persona según lo que le pasa en este guardado, o
   * null si no hay nada que fechar. Una sola fecha por fila: desde cuándo rige
   * el nuevo estado y hasta cuándo rigió el anterior.
   */
  const personCaption = useCallback(
    (dni: string): string | null => {
      if (excludedDnis.has(dni) && coveredDnis.has(dni))
        return "Excluido desde";
      if (employeeDnis.has(dni)) return "Desde";
      if (saved.employees.has(dni)) return "Baja desde";
      if (saved.excluded.has(dni) && !excludedDnis.has(dni))
        return "Reincorporado desde";
      return null;
    },
    [excludedDnis, coveredDnis, employeeDnis, saved],
  );

  const departmentCaption = useCallback(
    (id: string): string | null => {
      if (departmentIds.has(id)) return "Desde";
      return saved.departments.has(id) ? "Baja desde" : null;
    },
    [departmentIds, saved],
  );

  const toggleEmployees = (dnis: string[], on: boolean) => {
    setExcludedDnis((prev) => {
      const next = new Set(prev);
      for (const dni of dnis) {
        if (on) next.delete(dni);
        else if (coveredDnis.has(dni)) next.add(dni);
      }
      return next;
    });
    setEmployeeDnis((prev) => {
      const next = new Set(prev);
      for (const dni of dnis) {
        if (on && !coveredDnis.has(dni)) next.add(dni);
        if (!on) next.delete(dni);
      }
      return next;
    });
    setPersonDates((prev) => ({
      ...prev,
      ...Object.fromEntries(dnis.map((dni) => [dni, today])),
    }));
  };

  const toggleDepartments = (ids: string[], on: boolean) => {
    setDepartmentIds((prev) => {
      const next = new Set(prev);
      for (const id of ids) {
        if (on) next.add(id);
        else next.delete(id);
      }
      return next;
    });
    setDepartmentDates((prev) => ({
      ...prev,
      ...Object.fromEntries(ids.map((id) => [id, today])),
    }));
  };

  const setPersonDate = (dni: string, date: string) =>
    setPersonDates((prev) => ({ ...prev, [dni]: date }));

  const setDepartmentDate = (id: string, date: string) =>
    setDepartmentDates((prev) => ({ ...prev, [id]: date }));

  const changed =
    signature(employeeDnis, personDates, today) !==
      signature(saved.employees, saved.personDates, today) ||
    signature(excludedDnis, personDates, today) !==
      signature(saved.excluded, saved.personDates, today) ||
    signature(departmentIds, departmentDates, today) !==
      signature(saved.departments, saved.departmentDates, today);

  /** Lo que recibe el servidor: lo elegido, lo excluido y la fecha de baja de lo que se quita. */
  const payload = () => {
    const dateOf = (dni: string) => personDates[dni] ?? today;
    const departmentDateOf = (id: string) => departmentDates[id] ?? today;

    // Una exclusión solo tiene sentido mientras un departamento elegido cubra
    // a la persona; las demás se descartan al guardar.
    const keptExcluded = [...excludedDnis].filter((dni) =>
      coveredDnis.has(dni),
    );

    return {
      employees: [...employeeDnis].map((dni) => ({
        dni,
        valid_from: dateOf(dni),
      })),
      departments: [...departmentIds].map((id) => ({
        id: Number(id),
        valid_from: departmentDateOf(id),
      })),
      excluded: keptExcluded.map((dni) => ({ dni, valid_from: dateOf(dni) })),
      ends: {
        employees: Object.fromEntries(
          [...saved.employees]
            .filter((dni) => !employeeDnis.has(dni))
            .map((dni) => [dni, dateOf(dni)]),
        ),
        departments: Object.fromEntries(
          [...saved.departments]
            .filter((id) => !departmentIds.has(id))
            .map((id) => [id, departmentDateOf(id)]),
        ),
        excluded: Object.fromEntries(
          [...saved.excluded]
            .filter((dni) => !keptExcluded.includes(dni))
            .map((dni) => [dni, dateOf(dni)]),
        ),
      },
    };
  };

  return {
    employeeDnis,
    excludedDnis,
    departmentIds,
    coveredDnis,
    chosenDnis,
    personDates,
    departmentDates,
    personCaption,
    departmentCaption,
    toggleEmployees,
    toggleDepartments,
    setPersonDate,
    setDepartmentDate,
    changed,
    payload,
  };
}
