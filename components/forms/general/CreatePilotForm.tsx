"use client";

import { useMemo } from "react";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SearchableCombobox } from "@/components/misc/SearchableCombobox";
import { zodResolver } from "@/lib/zod-resolver";
import { Pilot } from "@/types";
import {
  useCreatePilot,
  useUpdatePilot,
} from "@/actions/ajustes/piloto/actions";
import { useGetEmployeesByCompany } from "@/hooks/ajustes/empleados/useGetEmployees";
import { useGetPilots } from "@/hooks/sms/useGetPilots";
import { useCompanyStore } from "@/stores/CompanyStore";

const FormSchema = z.object({
  employee_dni: z.string().min(1, "Debe seleccionar un empleado."),
  license_number: z.string().min(1, "Debe ingresar el número de licencia."),
});

type FormSchemaType = z.infer<typeof FormSchema>;

interface FormProps {
  onClose: () => void;
  initialData?: Pilot;
  isEditing?: boolean;
}

export function CreatePilotForm({ onClose, initialData, isEditing }: FormProps) {
  const { selectedCompany } = useCompanyStore();
  const { createPilot } = useCreatePilot();
  const { updatePilot } = useUpdatePilot();
  const { data: employees, isLoading: loadingEmployees } =
    useGetEmployeesByCompany(selectedCompany?.slug);
  const { data: pilots } = useGetPilots(selectedCompany?.slug);
  const mutation = isEditing ? updatePilot : createPilot;

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      employee_dni: initialData?.employee_dni || "",
      license_number: initialData?.license_number || "",
    },
  });

  // Quien ya es piloto no se ofrece de nuevo; al editar, el empleado es fijo.
  const options = useMemo(() => {
    const taken = new Set((pilots ?? []).map((pilot) => pilot.employee_dni));

    return (employees ?? [])
      .filter((employee) => isEditing || !taken.has(employee.dni))
      .map((employee) => ({
        id: employee.dni,
        name: `${employee.first_name} ${employee.last_name} (${employee.dni_type}-${employee.dni})`,
      }));
  }, [employees, pilots, isEditing]);

  const onSubmit = async (data: FormSchemaType) => {
    try {
      if (isEditing && initialData) {
        await updatePilot.mutateAsync({
          company: selectedCompany!.slug,
          id: initialData.id.toString(),
          data: { license_number: data.license_number },
        });
      } else {
        await createPilot.mutateAsync({
          company: selectedCompany!.slug,
          data,
        });
      }
      onClose();
    } catch {
      // El aviso lo muestra la mutación; el formulario queda abierto.
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          e.stopPropagation();
          form.handleSubmit(onSubmit)(e);
        }}
        className="flex flex-col space-y-3"
      >
        <FormField
          control={form.control}
          name="employee_dni"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Empleado</FormLabel>
              <SearchableCombobox
                options={options}
                value={field.value}
                onSelect={(option) => field.onChange(`${option.id}`)}
                placeholder="Seleccione un empleado..."
                searchPlaceholder="Buscar por nombre o cédula..."
                emptyLabel="No hay empleados disponibles."
                loading={loadingEmployees}
                disabled={isEditing}
              />
              <FormDescription>
                El piloto debe estar registrado como empleado.
              </FormDescription>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="license_number"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Nº de Licencia de Piloto</FormLabel>
              <FormControl>
                <Input placeholder="EJ: PCA-12345" {...field} />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <Button
          className="bg-primary mt-2 text-white hover:bg-blue-900 disabled:bg-primary/70"
          disabled={mutation.isPending}
          type="submit"
        >
          {mutation.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : isEditing ? (
            "Actualizar"
          ) : (
            "Registrar piloto"
          )}
        </Button>
      </form>
    </Form>
  );
}
