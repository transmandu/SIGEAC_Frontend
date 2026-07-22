import { UseFormReturn } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ComboboxField } from "@/components/ui/ComboboxField";
import { Loader2 } from "lucide-react";
import { StoreChangeRequestPayload, Department, Employee } from "@/types";

interface StepGeneralProps {
  form: UseFormReturn<StoreChangeRequestPayload>;
  departments: Department[];
  employees: Employee[];
  isLoadingDepartments: boolean;
  isLoadingEmployees: boolean;
}

export function StepGeneral({
  form,
  departments,
  employees,
  isLoadingDepartments,
  isLoadingEmployees,
}: StepGeneralProps) {
  const departmentOptions = departments.map((d) => ({
    value: d.id,
    label: `${d.name} (${d.acronym})`,
  }));

  const employeeOptions = employees.map((e) => ({
    value: e.id,
    label: `${e.first_name} ${e.last_name}`,
    badge: e.dni,
  }));

  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="request_date"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Fecha de Solicitud
            </FormLabel>
            <FormControl>
              <Input type="date" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {isLoadingDepartments ? (
        <FormItem>
          <FormLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Departamento
          </FormLabel>
          <div className="flex items-center gap-2 h-9 px-3 border border-border/60 rounded-md">
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Cargando...</span>
          </div>
        </FormItem>
      ) : (
        <ComboboxField
          form={form}
          name="department_id"
          label="Departamento"
          placeholder="Seleccionar departamento"
          searchPlaceholder="Buscar departamento..."
          emptyText="No se encontraron departamentos"
          options={departmentOptions}
        />
      )}

      {isLoadingEmployees ? (
        <FormItem>
          <FormLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Solicitante
          </FormLabel>
          <div className="flex items-center gap-2 h-9 px-3 border border-border/60 rounded-md">
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Cargando...</span>
          </div>
        </FormItem>
      ) : (
        <ComboboxField
          form={form}
          name="requested_by"
          label="Solicitante"
          placeholder="Seleccionar solicitante"
          searchPlaceholder="Buscar por nombre o DNI..."
          emptyText="No se encontraron empleados"
          options={employeeOptions}
        />
      )}

      <FormField
        control={form.control}
        name="is_temporary"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              ¿Es Temporal?
            </FormLabel>
            <Select
              onValueChange={(val) => field.onChange(val === "true")}
              value={field.value?.toString()}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="true">Sí</SelectItem>
                <SelectItem value="false">No</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {form.watch("is_temporary") && (
        <FormField
          control={form.control}
          name="temporary_duration"
          render={({ field }) => (
            <FormItem className="col-span-2">
              <FormLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Duración Temporal
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej: 30 días, 2 semanas..."
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
}
