import { UseFormReturn } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ComboboxField } from "@/components/ui/ComboboxField";
import { Loader2 } from "lucide-react";
import { Department, Employee, ChangeType } from "@/types";
import { ChangeRequestFormValues } from "./CreateChangeRequestForm";

interface StepGeneralAndClassificationProps {
  form: UseFormReturn<ChangeRequestFormValues>;
  departments: Department[];
  employees: Employee[];
  isLoadingDepartments: boolean;
  isLoadingEmployees: boolean;
}

const CHANGE_TYPES: { value: ChangeType; label: string }[] = [
  { value: "facilities", label: "Instalaciones" },
  { value: "documentary", label: "Documental" },
  { value: "staff", label: "Personal" },
  { value: "equipment", label: "Equipamiento" },
  { value: "procedures", label: "Procedimientos" },
  { value: "technology", label: "Tecnología" },
  { value: "other", label: "Otro" },
];

export function StepGeneralAndClassification({
  form,
  departments,
  employees,
  isLoadingDepartments,
  isLoadingEmployees,
}: StepGeneralAndClassificationProps) {
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
    <div className="flex flex-col gap-6">
      {/* General */}
      <div className="flex flex-col gap-2">
        <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Datos Generales
        </h3>
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
            <FormItem className="col-span-2">
              <FormLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Duración Temporal
              </FormLabel>
              <div className="flex gap-2">
                <FormField
                  control={form.control}
                  name="temporary_duration_value"
                  render={({ field }) => (
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        placeholder="Valor"
                        className="font-mono text-sm"
                        onWheel={(e) => (e.target as HTMLInputElement).blur()}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                  )}
                />
                <FormField
                  control={form.control}
                  name="temporary_duration_unit"
                  render={({ field }) => (
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Unidad" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="days">Días</SelectItem>
                          <SelectItem value="weeks">Semanas</SelectItem>
                          <SelectItem value="months">Meses</SelectItem>
                          <SelectItem value="years">Años</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                  )}
                />
              </div>
              <FormMessage />
            </FormItem>
          )}
        </div>
      </div>

      {/* Clasificación */}
      <div className="flex flex-col gap-2">
        <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Clasificación del Cambio
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="change_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Tipo de Cambio
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CHANGE_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {form.watch("change_type") === "other" && (
            <FormField
              control={form.control}
              name="other_type_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Descripción del Tipo
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Describir el tipo de cambio"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Descripción del Cambio
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describa el cambio solicitado..."
                    className="min-h-[80px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="scope"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Alcance
                </FormLabel>
                <FormControl>
                  <Input placeholder="Alcance del cambio" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="justification"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Justificación
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Justificación del cambio..."
                    className="min-h-[80px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}
