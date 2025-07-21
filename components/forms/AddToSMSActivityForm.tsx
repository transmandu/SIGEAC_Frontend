"use client";

import { useCreateSMSActivityAttendance } from "@/actions/sms/sms_asistencia_actividades/actions";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useGetEnrolledStatus } from "@/hooks/sms/useGetEnrolledStatus";
import { cn } from "@/lib/utils";
import { SMSActivity } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown } from "lucide-react";
import { useCallback, useEffect, useState } from "react"; // Importa useCallback
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useCompanyStore } from "@/stores/CompanyStore";

interface FormProps {
  onClose: () => void;
  initialData: SMSActivity;
}

interface EmployeeSelection {
  dni: string;
  first_name: string;
  last_name: string;
  isSelected: boolean;
  wasEnrolled: boolean;
}

// Esquema del formulario modificado
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

export function AddToSMSActivity({ onClose, initialData }: FormProps) {
  const { selectedCompany } = useCompanyStore();
  const [open, setOpen] = useState(false);
  const { createSMSActivityAttendance } = useCreateSMSActivityAttendance();
  const [employeeSelections, setEmployeeSelections] = useState<
    EmployeeSelection[]
  >([]);

  const { data: employeesData, isLoading: isLoadingEnrolledEmployee } =
    useGetEnrolledStatus({
      company: selectedCompany,
      activity_id: initialData.id.toString(),
    });

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      addedEmployees: [],
      removedEmployees: [],
    },
  });

  // Envuelve updateFormValues en useCallback
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

  // Inicializar la lista de empleados
  useEffect(() => {
    if (employeesData) {
      const selections: EmployeeSelection[] = [
        ...(employeesData.enrolled?.map((e) => ({
          dni: e.dni,
          first_name: e.first_name,
          last_name: e.last_name,
          isSelected: true,
          wasEnrolled: true,
        })) || []),
        ...(employeesData.not_enrolled?.map((e) => ({
          dni: e.dni,
          first_name: e.first_name,
          last_name: e.last_name,
          isSelected: false,
          wasEnrolled: false,
        })) || []),
      ];

      setEmployeeSelections(selections);
      updateFormValues(selections);
    }
  }, [employeesData, updateFormValues]); // Agrega updateFormValues a las dependencias

  const toggleEmployeeSelection = (dni: string) => {
    const newSelections = employeeSelections.map((emp) =>
      emp.dni === dni ? { ...emp, isSelected: !emp.isSelected } : emp
    );

    setEmployeeSelections(newSelections);
    updateFormValues(newSelections);
  };

  const onSubmit = async (data: FormSchemaType) => {
    const value = {
      company: selectedCompany,
      activity_id: initialData?.id.toString(),
      data: {
        addedEmployees: data.addedEmployees,
        removedEmployees: data.removedEmployees,
      },
    };
    try {
      createSMSActivityAttendance.mutateAsync(value);
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
        <FormLabel className="text-lg font-semibold">
          Gestionar participantes de la actividad
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
                      <CommandInput placeholder="Buscar empleados..." />
                      <CommandList>
                        <CommandEmpty>No se encontraron empleados</CommandEmpty>

                        <CommandGroup heading="Todos los empleados">
                          {employeeSelections.map((employee) => (
                            <CommandItem
                              key={employee.dni}
                              value={employee.dni}
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
                              {employee.dni}
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
          <Button type="submit">Guardar cambios</Button>
        </div>
      </form>
    </Form>
  );
}
