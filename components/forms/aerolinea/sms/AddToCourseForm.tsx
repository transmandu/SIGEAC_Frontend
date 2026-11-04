"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Check, Loader2, Search, UserRound, Users } from "lucide-react";
import { useCreateCourseAttendance } from "@/actions/general/asistencia_curso/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetCourseEnrollementStatus } from "@/hooks/curso/useGetCourseEnrollementStatus";
import { useGetSmsTrainingGroups } from "@/hooks/curso/useGetSmsTrainingGroups";
import { useResettingState } from "@/hooks/useResettingState";
import { cn } from "@/lib/utils";
import { zodResolver } from "@/lib/zod-resolver";
import { useCompanyStore } from "@/stores/CompanyStore";
import { Course, SmsTrainingGroup } from "@/types";

interface FormProps {
  onClose: () => void;
  initialData: Course;
}

interface EmployeeSelection {
  dni: string;
  first_name: string;
  last_name: string;
  job_title: string;
  job_title_id?: number;
  department: string;
  isSelected: boolean;
  wasEnrolled: boolean;
}

const FormSchema = z.object({
  addedEmployees: z.array(
    z.object({
      dni: z.string(),
      first_name: z.string(),
      last_name: z.string(),
    }),
  ),
  removedEmployees: z.array(
    z.object({
      dni: z.string(),
      first_name: z.string(),
      last_name: z.string(),
    }),
  ),
});

type FormSchemaType = z.infer<typeof FormSchema>;

type TabValue = "groups" | "people";

export function AddToCourseForm({ onClose, initialData }: FormProps) {
  const [tab, setTab] = useState<TabValue>("groups");
  const [searchQuery, setSearchQuery] = useState("");
  const { selectedCompany } = useCompanyStore();
  const { createCourseAttendance } = useCreateCourseAttendance();

  const value = {
    course_id: initialData.id.toString(),
    company: selectedCompany!.slug,
  };
  const { data: employeesData, isLoading: isLoadingEnrolledEmployee } =
    useGetCourseEnrollementStatus(value);
  const { data: trainingGroups, isLoading: isLoadingTrainingGroups } =
    useGetSmsTrainingGroups(selectedCompany?.slug);

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      addedEmployees: [],
      removedEmployees: [],
    },
  });

  // Quién se agrega y quién se quita respecto de lo que ya estaba guardado.
  const toAttendanceLists = (selections: EmployeeSelection[]) => {
    const added = selections.filter((e) => e.isSelected && !e.wasEnrolled);
    const removed = selections.filter((e) => !e.isSelected && e.wasEnrolled);

    return {
      addedEmployees: added.map((e) => ({
        dni: e.dni,
        first_name: e.first_name,
        last_name: e.last_name,
      })),
      removedEmployees: removed.map((e) => ({
        dni: e.dni,
        first_name: e.first_name,
        last_name: e.last_name,
      })),
    };
  };

  const [employeeSelections, setEmployeeSelections] = useResettingState<
    EmployeeSelection[]
  >(() => {
    if (!employeesData) return [];

    const enrolled = employeesData.enrolled ?? [];
    const notEnrolled = employeesData.not_enrolled ?? [];
    const enrolledDni = new Set(enrolled.map((e) => e.dni));

    const toSelection = (employee: {
      dni: string;
      first_name: string;
      last_name: string;
      job_title?: { id?: string | number; name: string } | null;
      job_title_id?: number | null;
      department?: { name: string } | null;
    }): EmployeeSelection => {
      const wasEnrolled = enrolledDni.has(employee.dni);
      const jobTitleId =
        employee.job_title_id ??
        (employee.job_title?.id !== undefined
          ? Number(employee.job_title.id)
          : undefined);

      return {
        dni: employee.dni,
        first_name: employee.first_name,
        last_name: employee.last_name,
        job_title: employee.job_title?.name ?? "",
        job_title_id: jobTitleId,
        department: employee.department?.name ?? "",
        isSelected: wasEnrolled,
        wasEnrolled,
      };
    };

    const selections: EmployeeSelection[] = [...enrolled, ...notEnrolled].map(
      toSelection,
    );

    return selections;
  }, [employeesData]);

  const toggleEmployeeSelection = (dni: string) => {
    const newSelections = employeeSelections.map((emp) =>
      emp.dni === dni ? { ...emp, isSelected: !emp.isSelected } : emp,
    );

    setEmployeeSelections(newSelections);
  };

  const toggleAllEmployees = () => {
    const allSelected = employeeSelections.every((emp) => emp.isSelected);

    const newSelections = employeeSelections.map((emp) => ({
      ...emp,
      isSelected: !allSelected,
    }));

    setEmployeeSelections(newSelections);
  };

  const employeesInGroup = (group: SmsTrainingGroup) => {
    const jobTitleIds = new Set(
      group.job_titles.map((jobTitle) => jobTitle.id),
    );
    return employeeSelections.filter(
      (employee) =>
        employee.job_title_id !== undefined &&
        jobTitleIds.has(employee.job_title_id),
    );
  };

  const applyTrainingGroup = (group: SmsTrainingGroup) => {
    const jobTitleIds = new Set(
      group.job_titles.map((jobTitle) => jobTitle.id),
    );

    setEmployeeSelections((current) =>
      current.map((employee) =>
        employee.job_title_id !== undefined &&
        jobTitleIds.has(employee.job_title_id)
          ? { ...employee, isSelected: true }
          : employee,
      ),
    );
  };

  const filteredEmployees = employeeSelections.filter((employee) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      employee.first_name.toLowerCase().includes(searchLower) ||
      employee.last_name.toLowerCase().includes(searchLower) ||
      employee.dni.includes(searchQuery) ||
      employee.job_title.toLowerCase().includes(searchLower) ||
      employee.department.toLowerCase().includes(searchLower)
    );
  });

  const selectedCount = employeeSelections.filter((e) => e.isSelected).length;
  const allSelected =
    employeeSelections.length > 0 &&
    employeeSelections.every((e) => e.isSelected);

  const onSubmit = async () => {
    const { addedEmployees, removedEmployees } =
      toAttendanceLists(employeeSelections);
    const value = {
      company: selectedCompany!.slug,
      course_id: initialData?.id.toString(),
      employees_list: {
        addedEmployees,
        removedEmployees,
      },
    };
    try {
      await createCourseAttendance.mutateAsync(value);
    } catch (error) {
      console.error("Error al inscribir", error);
    }
    onClose();
  };

  if (isLoadingEnrolledEmployee) {
    return <div className="p-4 text-center">Cargando empleados...</div>;
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <p className="text-lg font-light">Gestionar participantes del curso</p>
        <p className="text-sm text-muted-foreground">
          Agrega personas por grupo o selecciónalas individualmente.
        </p>
      </div>

      <Tabs
        value={tab}
        onValueChange={(value) => setTab(value as TabValue)}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="groups" className="gap-2">
            <Users className="h-4 w-4" />
            Grupos
          </TabsTrigger>
          <TabsTrigger value="people" className="gap-2">
            <UserRound className="h-4 w-4" />
            Personas
            {selectedCount > 0 && (
              <span className="rounded-full bg-primary/15 px-1.5 text-xs text-primary">
                {selectedCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="groups" className="space-y-3">
          {isLoadingTrainingGroups ? (
            <p className="text-sm text-muted-foreground">Cargando grupos...</p>
          ) : (trainingGroups?.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay grupos de capacitación disponibles.
            </p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {trainingGroups?.map((group) => {
                const groupEmployees = employeesInGroup(group);
                const selectedInGroup = groupEmployees.filter(
                  (employee) => employee.isSelected,
                ).length;
                const isComplete =
                  groupEmployees.length > 0 &&
                  selectedInGroup === groupEmployees.length;

                return (
                  <div
                    key={group.id}
                    className={cn(
                      "rounded-lg border p-3 transition-colors",
                      isComplete && "border-primary/40 bg-primary/5",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium">{group.name}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {group.job_titles
                            .map((jobTitle) => jobTitle.name)
                            .join(", ")}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        {groupEmployees.length} empleado(s)
                      </span>
                    </div>

                    <Button
                      type="button"
                      variant={isComplete ? "secondary" : "outline"}
                      size="sm"
                      disabled={groupEmployees.length === 0}
                      onClick={() => applyTrainingGroup(group)}
                      className="mt-3 w-full"
                    >
                      {groupEmployees.length === 0 ? (
                        "Sin empleados activos"
                      ) : isComplete ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Grupo agregado
                        </>
                      ) : (
                        `Agregar ${groupEmployees.length} empleado(s)`
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Los grupos agregan a todos los empleados activos de sus cargos.
            Luego puedes ajustar personas en la pestaña Personas.
          </p>
        </TabsContent>

        <TabsContent value="people" className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre, cédula, cargo o departamento..."
                className="pl-8"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={toggleAllEmployees}
              className="sm:w-auto"
            >
              {allSelected ? "Deseleccionar todos" : "Seleccionar todos"}
            </Button>
          </div>

          <div className="max-h-72 overflow-y-auto rounded-md border">
            {filteredEmployees.length === 0 ? (
              <p className="p-4 text-center text-sm text-muted-foreground">
                No se encontraron empleados.
              </p>
            ) : (
              filteredEmployees.map((employee) => (
                <button
                  type="button"
                  key={employee.dni}
                  onClick={() => toggleEmployeeSelection(employee.dni)}
                  className="flex w-full items-start gap-3 border-b px-3 py-2 text-left transition-colors last:border-b-0 hover:bg-muted/50"
                >
                  <span
                    className={cn(
                      "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                      employee.isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/30",
                    )}
                  >
                    {employee.isSelected && <Check className="h-3 w-3" />}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="font-medium">
                        {employee.first_name} {employee.last_name}
                      </span>
                      {employee.wasEnrolled && (
                        <span className="text-xs text-muted-foreground">
                          (inscrito)
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {employee.dni} · {employee.job_title || "Sin cargo"}
                      {employee.department ? ` · ${employee.department}` : ""}
                    </span>
                  </span>
                </button>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex flex-col gap-3 border-t pt-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {selectedCount} persona(s) seleccionada(s)
        </p>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={createCourseAttendance.isPending}>
            {createCourseAttendance.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Guardar cambios
          </Button>
        </div>
      </div>
    </form>
  );
}
