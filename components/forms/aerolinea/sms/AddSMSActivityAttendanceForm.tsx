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
import { Check, ChevronsUpDown } from "lucide-react";
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
    return <div className="p-4 text-center">Cargando empleados...</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormLabel className="text-lg font-semibold">
          Gestionar asistentes al curso
        </FormLabel>

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
                  <PopoverContent className="w-[400px] p-0">
                    <Command>
                      <CommandInput
                        placeholder="Buscar empleados..."
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                      />
                      <CommandList>
                        <CommandEmpty>No se encontraron empleados</CommandEmpty>

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
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    employee.isSelected
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                <div className="flex flex-col">
                                  <div className="flex items-center gap-2">
                                    {employee.first_name}{" "}
                                    {employee.last_name} - {employee.dni}
                                    {employee.employee_type === "authorized" && (
                                      <Badge
                                        variant="outline"
                                        className="text-[10px] px-1 py-0"
                                      >
                                        Externo
                                        {employee.from_company_db
                                          ? ` (${employee.from_company_db})`
                                          : ""}
                                      </Badge>
                                    )}
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    {employee.job_title} - {employee.department}
                                  </span>
                                </div>
                                {employee.wasEnrolled && (
                                  <span className="ml-auto text-xs text-muted-foreground">
                                    (Asistió)
                                  </span>
                                )}
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

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">Guardar cambios</Button>
        </div>
      </form>
    </Form>
  );
}
