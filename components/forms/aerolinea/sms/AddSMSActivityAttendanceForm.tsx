"use client";

import { useMarkSMSActivityAttendance } from "@/actions/sms/sms_asistencia_actividades/actions";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useGetSMSActivityAttendanceStatus } from "@/hooks/sms/useGetSMSActivityAttendanceStatus";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import { SMSActivity } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Check,
  ChevronsUpDown,
  Users,
  Loader2,
  UserCheck,
  ListChecks,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";

interface FormProps {
  onClose: () => void;
  initialData: SMSActivity;
}

interface EmployeeSelection {
  dni: string;
  first_name: string;
  last_name: string;
  job_title: string;
  department: string;
  isSelected: boolean;
  wasEnrolled: boolean;
  employee_type: "local" | "authorized";
  authorized_employee_id?: number | null;
  from_company_db?: string;
}

const FormSchema = z.object({
  addedEmployees: z.array(
    z.object({
      dni: z.string().nullable(),
      first_name: z.string(),
      last_name: z.string(),
      authorized_employee_id: z.number().nullable(),
    })
  ),
  removedEmployees: z.array(
    z.object({
      dni: z.string().nullable(),
      first_name: z.string(),
      last_name: z.string(),
      authorized_employee_id: z.number().nullable(),
    })
  ),
});

type FormSchemaType = z.infer<typeof FormSchema>;

export function AddSMSActivityAttendanceForm({
  onClose,
  initialData,
}: FormProps) {
  const [open, setOpen] = useState(false);
  const { selectedCompany } = useCompanyStore();
  const { markSMSActivityAttendance } = useMarkSMSActivityAttendance();
  const [employeeSelections, setEmployeeSelections] = useState<
    EmployeeSelection[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");

  const value = {
    activity_number: initialData.activity_number,
    company: selectedCompany!.slug,
  };
  const { data: employeesData, isLoading: isLoadingEnrolledEmployee } =
    useGetSMSActivityAttendanceStatus(value);

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      addedEmployees: [],
      removedEmployees: [],
    },
  });

  const mapToSelection = useCallback(
    (
      employees: Array<{
        dni?: string;
        first_name: string;
        last_name: string;
        job_title?: { name: string };
        department?: { name: string };
        employee_type?: "local" | "authorized";
        authorized_employee_id?: number | null;
        from_company_db?: string;
      }>,
      wasEnrolled: boolean
    ) =>
      employees.map((e) => ({
        dni: e.dni ?? "",
        first_name: e.first_name,
        last_name: e.last_name,
        job_title: e.job_title?.name ?? "",
        department: e.department?.name ?? "",
        isSelected: wasEnrolled,
        wasEnrolled,
        employee_type: (e.employee_type as "local" | "authorized") ?? "local",
        authorized_employee_id: e.authorized_employee_id ?? null,
        from_company_db: e.from_company_db,
      })),
    []
  );

  const updateFormValues = useCallback(
    (selections: EmployeeSelection[]) => {
      const added = selections.filter((e) => e.isSelected && !e.wasEnrolled);
      const removed = selections.filter((e) => !e.isSelected && e.wasEnrolled);

      form.setValue(
        "addedEmployees",
        added.map((e) => ({
          dni: e.employee_type === "local" ? e.dni : null,
          first_name: e.first_name,
          last_name: e.last_name,
          authorized_employee_id:
            e.employee_type === "authorized"
              ? (e.authorized_employee_id ?? null)
              : null,
        }))
      );

      form.setValue(
        "removedEmployees",
        removed.map((e) => ({
          dni: e.employee_type === "local" ? e.dni : null,
          first_name: e.first_name,
          last_name: e.last_name,
          authorized_employee_id:
            e.employee_type === "authorized"
              ? (e.authorized_employee_id ?? null)
              : null,
        }))
      );
    },
    [form]
  );

  useEffect(() => {
    if (employeesData) {
      const selections: EmployeeSelection[] = [
        ...mapToSelection(employeesData.attended || [], true),
        ...mapToSelection(employeesData.not_attended || [], false),
      ];

      setEmployeeSelections(selections);
      updateFormValues(selections);
    }
  }, [employeesData, updateFormValues, mapToSelection]);

  const toggleEmployeeSelection = (key: string) => {
    const newSelections = employeeSelections.map((emp) => {
      const empKey =
        emp.employee_type === "authorized"
          ? `auth_${emp.authorized_employee_id}`
          : emp.dni;
      return empKey === key ? { ...emp, isSelected: !emp.isSelected } : emp;
    });

    setEmployeeSelections(newSelections);
    updateFormValues(newSelections);
  };

  const toggleAllEmployees = () => {
    const allSelected = employeeSelections.every((emp) => emp.isSelected);

    const newSelections = employeeSelections.map((emp) => ({
      ...emp,
      isSelected: !allSelected,
    }));

    setEmployeeSelections(newSelections);
    updateFormValues(newSelections);
  };

  const allSelected =
    employeeSelections.length > 0 &&
    employeeSelections.every((emp) => emp.isSelected);

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
  const previouslyAttendedCount = employeeSelections.filter(
    (e) => e.wasEnrolled
  ).length;
  const newlyAddedCount = employeeSelections.filter(
    (e) => e.isSelected && !e.wasEnrolled
  ).length;
  const removedCount = employeeSelections.filter(
    (e) => !e.isSelected && e.wasEnrolled
  ).length;

  const onSubmit = async (data: FormSchemaType) => {
    const value = {
      activity_number: initialData?.activity_number,
      employees_list: {
        addedEmployees: data.addedEmployees,
        removedEmployees: data.removedEmployees,
      },
    };
    try {
      await markSMSActivityAttendance.mutateAsync(value);
    } catch (error) {
      console.error("Error en asistencia", error);
    }
    onClose();
  };

  if (isLoadingEnrolledEmployee) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-10">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          Cargando empleados...
        </span>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-5"
      >
        <div className="flex items-center gap-3 pb-3 border-b border-border/60">
          <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-500 shrink-0">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold leading-tight">
              Gestionar asistentes
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Actividad N.° {initialData.activity_number}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col gap-1 rounded-md border border-border/40 px-3 py-2">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
              Seleccionados
            </span>
            <span className="font-mono text-lg font-bold tabular-nums">
              {selectedCount}
            </span>
          </div>
          <div className="flex flex-col gap-1 rounded-md border border-border/40 px-3 py-2">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
              Nuevos
            </span>
            <span className="font-mono text-lg font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
              +{newlyAddedCount}
            </span>
          </div>
          <div className="flex flex-col gap-1 rounded-md border border-border/40 px-3 py-2">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
              Removidos
            </span>
            <span className="font-mono text-lg font-bold tabular-nums text-red-600 dark:text-red-400">
              -{removedCount}
            </span>
          </div>
        </div>

        <FormField
          control={form.control}
          name="addedEmployees"
          render={() => (
            <FormItem>
              <FormLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Participantes
              </FormLabel>
              <FormControl>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-full justify-between h-10"
                    >
                      {selectedCount > 0 ? (
                        <span className="flex items-center gap-2">
                          <UserCheck className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                          {selectedCount} seleccionado
                          {selectedCount !== 1 ? "s" : ""}
                        </span>
                      ) : (
                        "Seleccionar participantes..."
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[calc(100vw-2rem)] max-w-[480px] p-0"
                    align="start"
                  >
                    <Command>
                      <CommandInput
                        placeholder="Buscar por nombre, DNI, puesto o departamento..."
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                      />
                      <div className="flex items-center gap-2 px-3 py-2 border-b border-border/60">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={toggleAllEmployees}
                        >
                          {allSelected ? (
                            <>
                              <ListChecks className="mr-1.5 h-3.5 w-3.5" />
                              Deseleccionar todos
                            </>
                          ) : (
                            <>
                              <Check className="mr-1.5 h-3.5 w-3.5" />
                              Seleccionar todos
                            </>
                          )}
                        </Button>
                      </div>
                      <CommandList>
                        <CommandEmpty>
                          No se encontraron empleados
                        </CommandEmpty>

                        <CommandGroup heading="Todos los empleados">
                          {filteredEmployees.map((employee) => {
                            const key =
                              employee.employee_type === "authorized"
                                ? `auth_${employee.authorized_employee_id}`
                                : employee.dni;

                            return (
                              <CommandItem
                                key={key}
                                value={`${employee.first_name} ${employee.last_name} ${employee.dni} ${employee.job_title} ${employee.department}`}
                                onSelect={() => toggleEmployeeSelection(key)}
                                className="py-2.5"
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4 shrink-0",
                                    employee.isSelected
                                      ? "opacity-100 text-emerald-600 dark:text-emerald-400"
                                      : "opacity-0"
                                  )}
                                />
                                <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm font-medium truncate">
                                      {employee.first_name}{" "}
                                      {employee.last_name}
                                    </span>
                                    <span className="font-mono text-xs text-muted-foreground">
                                      {employee.dni}
                                    </span>
                                    {employee.employee_type ===
                                      "authorized" && (
                                      <Badge
                                        variant="outline"
                                        className="text-[10px] px-1 py-0 shrink-0"
                                      >
                                        Externo
                                        {employee.from_company_db
                                          ? ` (${employee.from_company_db})`
                                          : ""}
                                      </Badge>
                                    )}
                                    {employee.wasEnrolled && (
                                      <Badge className="text-[10px] px-1 py-0 shrink-0 bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800">
                                        Asistió
                                      </Badge>
                                    )}
                                  </div>
                                  <span className="text-xs text-muted-foreground truncate">
                                    {employee.job_title} ·{" "}
                                    {employee.department}
                                  </span>
                                </div>
                              </CommandItem>
                            );
                          })}
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

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-1 border-t border-border/60">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={markSMSActivityAttendance.isPending}
            className="w-full sm:w-auto h-10"
          >
            {markSMSActivityAttendance.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <>
                <UserCheck className="size-4 mr-2" />
                Guardar cambios
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
