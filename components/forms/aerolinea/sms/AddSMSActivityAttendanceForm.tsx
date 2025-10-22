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
}

const FormSchema = z.object({
  addedEmployees: z.array(
    z.object({
      dni: z.string(),
      first_name: z.string(),
      last_name: z.string(),
    })
  ),
  removedEmployees: z.array(
    z.object({
      dni: z.string(),
      first_name: z.string(),
      last_name: z.string(),
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
    activity_id: initialData.id.toString(),
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

  // Ahora 'form' completo es la dependencia de useCallback
  const updateFormValues = useCallback(
    (selections: EmployeeSelection[]) => {
      const added = selections.filter((e) => e.isSelected && !e.wasEnrolled);
      const removed = selections.filter((e) => !e.isSelected && e.wasEnrolled);

      form.setValue(
        "addedEmployees",
        added.map((e) => ({
          dni: e.dni,
          first_name: e.first_name,
          last_name: e.last_name,
        }))
      );

      form.setValue(
        "removedEmployees",
        removed.map((e) => ({
          dni: e.dni,
          first_name: e.first_name,
          last_name: e.last_name,
        }))
      );
    },
    [form] // La dependencia ahora es el objeto 'form'
  );

  useEffect(() => {
    if (employeesData) {
      const selections: EmployeeSelection[] = [
        ...(employeesData.attended?.map((e) => ({
          dni: e.dni,
          first_name: e.first_name,
          last_name: e.last_name,
          job_title: e.job_title.name,
          department: e.department.name,
          isSelected: true,
          wasEnrolled: true,
        })) || []),
        ...(employeesData.not_attended?.map((e) => ({
          dni: e.dni,
          first_name: e.first_name,
          last_name: e.last_name,
          job_title: e.job_title.name,
          department: e.department.name,
          isSelected: false,
          wasEnrolled: false,
        })) || []),
      ];

      setEmployeeSelections(selections);
      updateFormValues(selections);
    }
  }, [employeesData, updateFormValues]);

  const toggleEmployeeSelection = (dni: string) => {
    const newSelections = employeeSelections.map((emp) =>
      emp.dni === dni ? { ...emp, isSelected: !emp.isSelected } : emp
    );

    setEmployeeSelections(newSelections);
    updateFormValues(newSelections);
  };

  // Filtrar empleados basado en la búsqueda
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
      activity_id: initialData?.id.toString(),
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
                                    : "opacity-0"
                                )}
                              />
                              {employee.first_name} {employee.last_name} -{" "}
                              {employee.dni} <br />({employee.job_title}
                              {employee.department})
                              {employee.wasEnrolled && (
                                <span className="ml-2 text-xs text-muted-foreground">
                                  (Asistió)
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
          <Button type="submit">Guardar cambios</Button>
        </div>
      </form>
    </Form>
  );
}
