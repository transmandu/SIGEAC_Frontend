import { useState } from "react";
import { UseFormReturn, useFieldArray } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronsUpDown, Loader2, Plus, Trash2 } from "lucide-react";
import { Employee } from "@/types";
import { AuthorizedEmployeeResponse } from "@/hooks/ajustes/autorizados/useGetAuthorizedEmployees";
import { ChangeRequestFormValues } from "./CreateChangeRequestForm";
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
import { cn } from "@/lib/utils";

interface StepPlanAndResourcesProps {
  form: UseFormReturn<ChangeRequestFormValues>;
  employees: Employee[];
  isLoadingEmployees: boolean;
  authorizedEmployees?: AuthorizedEmployeeResponse[];
  isLoadingAuthorizedEmployees?: boolean;
}

const CURRENCY_OPTIONS = [
  { value: "USD", label: "USD — Dólar" },
  { value: "VES", label: "VES — Bolívar" },
  { value: "EUR", label: "EUR — Euro" },
];

const preventWheel = (e: React.WheelEvent<HTMLInputElement>) =>
  (e.target as HTMLInputElement).blur();

function ResponsibleSelect({
  form,
  index,
  localEmployees,
  authorizedEmployees,
  isLoading,
}: {
  form: UseFormReturn<ChangeRequestFormValues>;
  index: number;
  localEmployees: Employee[];
  authorizedEmployees: AuthorizedEmployeeResponse[];
  isLoading: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const assignedId = form.watch(
    `activities.${index}.assigned_employee_id` as any,
  );
  const authorizedId = form.watch(
    `activities.${index}.authorized_employee_id` as any,
  );

  const selectedLocal = localEmployees.find((e) => e.id === assignedId);
  const selectedAuthorized = authorizedEmployees.find(
    (a) => a.id === authorizedId,
  );

  const searchLower = search.toLowerCase();
  const filteredLocal = localEmployees.filter((e) =>
    `${e.first_name} ${e.last_name} ${e.dni} ${e.department?.name ?? ""}`
      .toLowerCase()
      .includes(searchLower),
  );
  const filteredAuthorized = authorizedEmployees.filter((a) =>
    `${a.employee_name ?? ""} ${a.dni_employee} ${a.job_title ?? ""}`
      .toLowerCase()
      .includes(searchLower),
  );

  const chooseLocal = (empId: number) => {
    form.setValue(
      `activities.${index}.assigned_employee_id` as any,
      empId as any,
      { shouldValidate: true, shouldDirty: true },
    );
    form.setValue(
      `activities.${index}.authorized_employee_id` as any,
      null as any,
      { shouldValidate: true, shouldDirty: true },
    );
    setOpen(false);
  };

  const chooseAuthorized = (authId: number) => {
    form.setValue(
      `activities.${index}.assigned_employee_id` as any,
      null as any,
      { shouldValidate: true, shouldDirty: true },
    );
    form.setValue(
      `activities.${index}.authorized_employee_id` as any,
      authId as any,
      { shouldValidate: true, shouldDirty: true },
    );
    setOpen(false);
  };

  return (
    <FormItem className="flex flex-col">
      <FormLabel className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
        Responsable
      </FormLabel>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <FormControl>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between font-normal h-8"
            >
              {selectedLocal ? (
                <span className="flex items-center gap-2 overflow-hidden flex-1">
                  <span className="truncate">
                    {selectedLocal.first_name} {selectedLocal.last_name}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground shrink-0">
                    {selectedLocal.dni}
                  </span>
                </span>
              ) : selectedAuthorized ? (
                <span className="flex items-center gap-2 overflow-hidden flex-1">
                  <span className="truncate">
                    {selectedAuthorized.employee_name}
                  </span>
                  <Badge
                    variant="outline"
                    className="text-[10px] px-1 py-0 shrink-0"
                  >
                    Externo ({selectedAuthorized.from_company_db})
                  </Badge>
                </span>
              ) : isLoading ? (
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="size-3 animate-spin" />
                  Cargando...
                </span>
              ) : (
                <span className="text-muted-foreground">Asignar</span>
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent className="w-[320px] p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Buscar responsable..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty>No se encontraron responsables</CommandEmpty>

              <CommandGroup heading="Empleados">
                {filteredLocal.map((e) => (
                  <CommandItem
                    key={e.id}
                    value={`${e.first_name} ${e.last_name} ${e.dni}`}
                    onSelect={() => chooseLocal(e.id)}
                    className="py-2"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4 shrink-0",
                        String(e.id) === String(assignedId) &&
                          !selectedAuthorized
                          ? "opacity-100 text-emerald-600 dark:text-emerald-400"
                          : "opacity-0",
                      )}
                    />
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-sm font-medium truncate">
                        {e.first_name} {e.last_name}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        {e.job_title?.name} · {e.department?.name}
                      </span>
                    </div>
                    <span className="font-mono text-xs text-muted-foreground">
                      {e.dni}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>

              <CommandGroup heading="Empleados externos">
                {filteredAuthorized.map((a) => (
                  <CommandItem
                    key={a.id}
                    value={`${a.employee_name ?? ""} ${a.dni_employee} ${a.job_title ?? ""}`}
                    onSelect={() => chooseAuthorized(a.id)}
                    className="py-2"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4 shrink-0",
                        String(a.id) === String(authorizedId)
                          ? "opacity-100 text-emerald-600 dark:text-emerald-400"
                          : "opacity-0",
                      )}
                    />
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-sm font-medium truncate">
                        {a.employee_name}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        {a.job_title} · {a.department}
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1 py-0 shrink-0"
                    >
                      Externo ({a.from_company_db})
                    </Badge>
                  </CommandItem>
                ))}
                {filteredAuthorized.length === 0 && (
                  <CommandItem
                    disabled
                    className="text-xs text-muted-foreground"
                  >
                    No hay empleados externos autorizados
                  </CommandItem>
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <FormMessage />
    </FormItem>
  );
}

export function StepPlanAndResources({
  form,
  employees,
  isLoadingEmployees,
  authorizedEmployees = [],
  isLoadingAuthorizedEmployees = false,
}: StepPlanAndResourcesProps) {
  const {
    fields: requiredItemFields,
    append: appendItem,
    remove: removeItem,
  } = useFieldArray({
    control: form.control,
    name: "required_items",
  });

  const {
    fields: financialFields,
    append: appendFinancial,
    remove: removeFinancial,
  } = useFieldArray({
    control: form.control,
    name: "financial_resources",
  });

  const {
    fields: activityFields,
    append: appendActivity,
    remove: removeActivity,
  } = useFieldArray({
    control: form.control,
    name: "activities",
  });

  const responsibleIsLoading =
    isLoadingEmployees || isLoadingAuthorizedEmployees;

  return (
    <div className="flex flex-col gap-6">
      {/* Cambios Planificados */}
      <div className="flex flex-col gap-2">
        <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Cambios Planificados
        </h3>
        <FormField
          control={form.control}
          name="planned_changes"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  placeholder="Describa los cambios planificados..."
                  className="min-h-[80px]"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Items Requeridos */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Items Requeridos
          </h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendItem({ item_description: "" })}
          >
            <Plus className="size-3 mr-1" />
            Agregar
          </Button>
        </div>
        {requiredItemFields.map((field, index) => (
          <div key={field.id} className="flex items-center gap-2">
            <FormField
              control={form.control}
              name={`required_items.${index}.item_description`}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input placeholder="Descripción del item" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeItem(index)}
            >
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>

      {/* Recursos Financieros */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Recursos Financieros
          </h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              appendFinancial({
                description: "",
                estimated_value: 0,
                currency_unit: "USD",
              })
            }
          >
            <Plus className="size-3 mr-1" />
            Agregar
          </Button>
        </div>
        {financialFields.map((field, index) => (
          <div
            key={field.id}
            className="grid grid-cols-[1fr_120px_140px_auto] gap-3 items-start"
          >
            <FormField
              control={form.control}
              name={`financial_resources.${index}.description`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
                    Descripción
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Descripción del recurso" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`financial_resources.${index}.estimated_value`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
                    Monto
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      className="font-mono text-sm h-8"
                      onWheel={preventWheel}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`financial_resources.${index}.currency_unit`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
                    Moneda
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-8 font-mono text-sm">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CURRENCY_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="mt-5"
              onClick={() => removeFinancial(index)}
            >
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>

      {/* Actividades de Implementación */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Actividades de Implementación
          </h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              appendActivity({
                activity_description: "",
                assigned_employee_id: 0,
                authorized_employee_id: null,
              })
            }
          >
            <Plus className="size-3 mr-1" />
            Agregar
          </Button>
        </div>
        {activityFields.map((field, index) => (
          <div
            key={field.id}
            className="grid grid-cols-[1fr_240px_auto] gap-3 items-start"
          >
            <FormField
              control={form.control}
              name={`activities.${index}.activity_description`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
                    Descripción
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descripción de la actividad"
                      className="min-h-[60px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`activities.${index}.assigned_employee_id` as any}
              render={() => (
                <ResponsibleSelect
                  form={form}
                  index={index}
                  localEmployees={employees}
                  authorizedEmployees={authorizedEmployees}
                  isLoading={responsibleIsLoading}
                />
              )}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="mt-5"
              onClick={() => removeActivity(index)}
            >
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
