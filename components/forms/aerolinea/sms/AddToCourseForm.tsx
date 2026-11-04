"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useGetCourseEnrollementStatus } from "@/hooks/curso/useGetCourseEnrollementStatus";
import { useGetSmsTrainingGroups } from "@/hooks/curso/useGetSmsTrainingGroups";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import { Course, SmsTrainingGroup } from "@/types";
import { zodResolver } from "@/lib/zod-resolver";
import { Check, ChevronsUpDown, Loader2, Users } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useCreateCourseAttendance } from "@/actions/general/asistencia_curso/actions";
import { useResettingState } from "@/hooks/useResettingState";

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

export function AddToCourseForm({ onClose, initialData }: FormProps) {
  const [open, setOpen] = useState(false);
  const { selectedCompany } = useCompanyStore();
  const { createCourseAttendance } = useCreateCourseAttendance();
  const [searchQuery, setSearchQuery] = useState("");

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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormLabel className="text-lg font-light">
          Gestionar participantes del curso
        </FormLabel>

        {(isLoadingTrainingGroups || (trainingGroups?.length ?? 0) > 0) && (
          <div className="space-y-2">
            <FormLabel>Agregar por grupo:</FormLabel>
            {isLoadingTrainingGroups ? (
              <p className="text-sm text-muted-foreground">
                Cargando grupos...
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {trainingGroups?.map((group) => {
                  const groupEmployees = employeesInGroup(group);

                  return (
                    <Button
                      key={group.id}
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={groupEmployees.length === 0}
                      onClick={() => applyTrainingGroup(group)}
                      title={
                        groupEmployees.length === 0
                          ? "No hay empleados activos con estos cargos"
                          : `Agregar ${groupEmployees.length} empleado(s)`
                      }
                    >
                      <Users className="mr-2 h-4 w-4" />
                      {group.name}
                      <span className="ml-2 rounded-full bg-muted px-1.5 text-xs text-muted-foreground">
                        {groupEmployees.length}
                      </span>
                    </Button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <FormField
          control={form.control}
          name="addedEmployees"
          render={() => (
            <FormItem>
              <FormLabel>Participantes:</FormLabel>
              <FormControl>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-full justify-between"
                    >
                      {employeeSelections.filter((e) => e.isSelected).length >
                      0 ? (
                        <span>
                          {
                            employeeSelections.filter((e) => e.isSelected)
                              .length
                          }{" "}
                          seleccionados
                        </span>
                      ) : (
                        "Seleccionar participantes..."
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-100 p-0">
                    <Command>
                      <CommandInput
                        placeholder="Buscar empleados..."
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                      />
                      <div className="p-2 border-b">
                        <Button
                          variant="ghost"
                          className="w-full justify-start h-8"
                          onClick={toggleAllEmployees}
                        >
                          <Check className="mr-2 h-4 w-4" />
                          {employeeSelections.every((emp) => emp.isSelected)
                            ? "Deseleccionar todos"
                            : "Seleccionar todos"}
                        </Button>
                      </div>
                      <CommandList>
                        <CommandEmpty>No se encontraron empleados</CommandEmpty>
                        <CommandGroup heading="Todos los empleados">
                          {filteredEmployees.map((employee) => (
                            <CommandItem
                              key={employee.dni}
                              value={`${employee.first_name} ${employee.last_name} ${employee.dni} ${employee.job_title} ${employee.department}`}
                              onSelect={() =>
                                toggleEmployeeSelection(employee.dni)
                              }
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  employee.isSelected
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              {employee.first_name} {employee.last_name} -{" "}
                              {employee.dni} <br />({employee.job_title}
                              {employee.department})
                              {employee.wasEnrolled && (
                                <span className="ml-2 text-xs text-muted-foreground">
                                  (inscrito)
                                </span>
                              )}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={createCourseAttendance.isPending}>
            {createCourseAttendance.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Guardar cambios
          </Button>
        </div>
      </form>
    </Form>
  );
}
