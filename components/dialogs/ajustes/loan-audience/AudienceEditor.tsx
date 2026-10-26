"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import { Building2, Users } from "lucide-react";

import { useSetLoanAudience } from "@/actions/ajustes/convenios/actions";
import { hintClass } from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import { ArticleFormShell } from "@/components/forms/mantenimiento/almacen/articulos/ArticleFormShell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetDepartments } from "@/hooks/ajustes/departamento/useGetDepartment";
import { useGetEmployeesByCompany } from "@/hooks/ajustes/empleados/useGetEmployees";
import type {
  CompanyLoanAgreement,
  CompanyLoanScope,
  LoanAudience,
} from "@/hooks/ajustes/convenios/types";
import { flattenDepartments } from "@/lib/departments";
import { cn } from "@/lib/utils";
import { DateCell } from "./DateCell";
import { PickTable, type PickRow } from "./PickTable";
import { useAudienceDraft } from "./useAudienceDraft";

const tabTriggerClass = cn(
  "flex items-center justify-center gap-2 rounded-lg text-sm transition-all duration-200",
  "data-[state=active]:bg-background data-[state=active]:text-primary",
  "data-[state=active]:shadow-md data-[state=active]:shadow-primary/10",
  "data-[state=active]:ring-1 data-[state=active]:ring-primary/20",
);

const dash = <span className="text-muted-foreground">—</span>;

/** Pestañas Personas y Departamentos con las que el receptor elige su audiencia. */
export function AudienceEditor({
  agreement,
  scope,
  companySlug,
  initial,
  onDone,
}: {
  agreement: CompanyLoanAgreement;
  scope: CompanyLoanScope;
  companySlug?: string;
  initial: LoanAudience;
  onDone: () => void;
}) {
  const save = useSetLoanAudience(companySlug);
  const { data: employees = [], isLoading: loadingEmployees } =
    useGetEmployeesByCompany(companySlug);
  const { data: departmentTree, isLoading: loadingDepartments } =
    useGetDepartments(companySlug);

  const today = useMemo(() => format(new Date(), "yyyy-MM-dd"), []);
  const departments = useMemo(
    () => flattenDepartments(departmentTree ?? []),
    [departmentTree],
  );

  const draft = useAudienceDraft({ initial, employees, departments, today });

  const employeeRows: PickRow[] = employees
    .filter((e) => e.isActive !== false)
    .map((e) => {
      const name = `${e.first_name} ${e.last_name}`;
      const dni = `${e.dni_type ? `${e.dni_type}-` : ""}${e.dni}`;
      const department = e.department?.name ?? "";
      const jobTitle = e.job_title?.name ?? "";
      const caption = draft.personCaption(e.dni);
      const byDepartment = draft.coveredDnis.has(e.dni);

      return {
        value: e.dni,
        searchable: `${name} ${dni} ${department} ${jobTitle}`,
        note: byDepartment
          ? draft.excludedDnis.has(e.dni)
            ? "Excluido de su departamento"
            : "Incluido por su departamento"
          : undefined,
        cells: [
          <span key="name" className="font-medium">
            {name}
          </span>,
          <span key="dni" className="tabular-nums">
            {dni}
          </span>,
          department || dash,
          jobTitle || dash,
          caption ? (
            <DateCell
              key="date"
              caption={caption}
              value={draft.personDates[e.dni] ?? today}
              max={today}
              onChange={(date) => draft.setPersonDate(e.dni, date)}
            />
          ) : byDepartment ? (
            <span key="date" className="text-xs text-muted-foreground">
              Por departamento
            </span>
          ) : (
            dash
          ),
        ],
      };
    })
    .sort((a, b) => a.searchable.localeCompare(b.searchable));

  // Cuántos departamentos cuelgan de cada uno, para avisar qué arrastra elegirlo.
  const subdepartments = useMemo(() => {
    const childrenOf = new Map<number, number[]>();
    for (const d of departments) {
      if (d.department_parent_id != null) {
        childrenOf.set(d.department_parent_id, [
          ...(childrenOf.get(d.department_parent_id) ?? []),
          d.id,
        ]);
      }
    }
    const countBelow = (id: number): number =>
      (childrenOf.get(id) ?? []).reduce(
        (n, child) => n + 1 + countBelow(child),
        0,
      );

    return new Map(departments.map((d) => [d.id, countBelow(d.id)]));
  }, [departments]);

  const departmentRows: PickRow[] = departments
    .map((d) => {
      const key = String(d.id);
      const below = subdepartments.get(d.id) ?? 0;
      const caption = draft.departmentCaption(key);

      return {
        value: key,
        searchable: `${d.name} ${d.acronym ?? ""}`,
        cells: [
          <span key="name" className="font-medium">
            {d.name}
          </span>,
          d.acronym || dash,
          below > 0 ? (
            <span key="below" className="tabular-nums">
              {below}
            </span>
          ) : (
            dash
          ),
          caption ? (
            <DateCell
              key="date"
              caption={caption}
              value={draft.departmentDates[key] ?? today}
              max={today}
              onChange={(date) => draft.setDepartmentDate(key, date)}
            />
          ) : (
            dash
          ),
        ],
      };
    })
    .sort((a, b) => a.searchable.localeCompare(b.searchable));

  // Con los datos a medio cargar no se sabe a quién cubre cada departamento, y
  // guardar así descartaría exclusiones válidas.
  const ready = !loadingEmployees && !loadingDepartments;

  const submit = async () => {
    if (!draft.changed) {
      onDone();
      return;
    }

    try {
      await save.mutateAsync({
        id: agreement.id,
        scope: scope.scope,
        ...draft.payload(),
      });
      onDone();
    } catch {
      // El aviso lo muestra la mutación; el diálogo queda abierto.
    }
  };

  return (
    <ArticleFormShell
      className="min-h-0 flex-1"
      busy={save.isPending}
      canSave={draft.changed && ready}
      isEditing
      onCancel={onDone}
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void submit();
      }}
    >
      <Tabs defaultValue="employees" className="flex min-h-0 flex-1 flex-col">
        <TabsList className="mb-4 grid h-auto w-full shrink-0 grid-cols-2">
          <TabsTrigger value="employees" className={tabTriggerClass}>
            <Users className="size-4" />
            Personas
            <span className="text-xs tabular-nums text-muted-foreground">
              {draft.chosenDnis.size}
            </span>
          </TabsTrigger>
          <TabsTrigger value="departments" className={tabTriggerClass}>
            <Building2 className="size-4" />
            Departamentos
            <span className="text-xs tabular-nums text-muted-foreground">
              {draft.departmentIds.size}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="employees"
          className="mt-0 flex min-h-0 flex-1 flex-col"
        >
          <PickTable
            columns={[
              { header: "Nombre y apellido", className: "min-w-44" },
              { header: "DNI", className: "whitespace-nowrap" },
              { header: "Departamento" },
              { header: "Cargo" },
              { header: "Fecha", className: "whitespace-nowrap" },
            ]}
            rows={employeeRows}
            selected={draft.chosenDnis}
            onToggle={(dni, on) => draft.toggleEmployees([dni], on)}
            onToggleMany={draft.toggleEmployees}
            placeholder="Buscar por nombre, DNI, departamento o cargo..."
            emptyMessage="No hay personas que coincidan."
            loading={loadingEmployees}
          />
        </TabsContent>

        <TabsContent
          value="departments"
          className="mt-0 flex min-h-0 flex-1 flex-col gap-2"
        >
          <PickTable
            columns={[
              { header: "Departamento" },
              { header: "Sigla", className: "whitespace-nowrap" },
              { header: "Subdepartamentos", className: "whitespace-nowrap" },
              { header: "Fecha", className: "whitespace-nowrap" },
            ]}
            rows={departmentRows}
            selected={draft.departmentIds}
            onToggle={(id, on) => draft.toggleDepartments([id], on)}
            onToggleMany={draft.toggleDepartments}
            placeholder="Buscar por nombre o sigla..."
            emptyMessage="No hay departamentos que coincidan."
            loading={loadingDepartments}
          />
          <p className={hintClass}>
            Un departamento incluye a sus subdepartamentos y a todos sus
            miembros activos.
          </p>
        </TabsContent>
      </Tabs>
    </ArticleFormShell>
  );
}
