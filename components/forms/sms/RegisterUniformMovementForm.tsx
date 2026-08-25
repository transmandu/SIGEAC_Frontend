"use client";

import { useState } from "react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useCompanyStore } from "@/stores/CompanyStore";
import {
  useGetUniformItems,
  useGetUniformOptions,
} from "@/hooks/sms/useGetUniforms";
import { useGetEmployeesByCompany } from "@/hooks/ajustes/empleados/useGetEmployees";
import { useCreateUniformMovement } from "@/actions/sms/uniforms/actions";
import { MOVEMENT_TYPE_META } from "@/components/sms/uniform-meta";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, Loader2, PackagePlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  uniformCompanyLabel,
  uniformGenderLabel,
  uniformMovementTypeLabel,
} from "@/lib/sms/uniforms";

const ISSUANCE = "ISSUANCE";
const ADJUSTMENT = "ADJUSTMENT";

const formSchema = z
  .object({
    uniform_item_id: z.string().min(1, { message: "Seleccione un artículo." }),
    movement_type: z.string().min(1, { message: "Seleccione un tipo." }),
    quantity: z.coerce.number().int().min(1, { message: "Mínimo 1." }),
    date: z.string().min(1, { message: "Seleccione una fecha." }),
    is_employee: z.boolean().optional(),
    employee_id: z.string().optional(),
    recipient_name: z.string().optional(),
    recipient_dni: z.string().optional(),
    direction: z.enum(["increase", "decrease"]).optional(),
    notes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.movement_type === ISSUANCE) {
      if (data.is_employee) {
        if (!data.employee_id?.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["employee_id"],
            message: "Seleccione un empleado.",
          });
        }
      } else {
        if (!data.recipient_name?.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["recipient_name"],
            message: "El nombre del receptor es obligatorio.",
          });
        }
      }
    }
    if (data.movement_type === ADJUSTMENT) {
      if (!data.direction) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["direction"],
          message: "Indique si aumenta o disminuye.",
        });
      }
      if (!data.notes?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["notes"],
          message: "El motivo del ajuste es obligatorio.",
        });
      }
    }
  });

interface Props {
  onClose: () => void;
  itemId?: number;
}

export const RegisterUniformMovementForm = ({ onClose, itemId }: Props) => {
  const { selectedCompany } = useCompanyStore();
  const { data: items, isLoading: loadingItems } = useGetUniformItems(
    selectedCompany?.slug,
    true
  );
  const { data: options, isLoading: loadingOptions } = useGetUniformOptions(
    selectedCompany?.slug
  );
  const { data: employees } = useGetEmployeesByCompany(selectedCompany?.slug);
  const createMovement = useCreateUniformMovement();

  const [employeePopoverOpen, setEmployeePopoverOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      uniform_item_id: itemId ? String(itemId) : "",
      movement_type: "",
      quantity: 1,
      date: new Date().toISOString().slice(0, 10),
      is_employee: true,
      employee_id: "",
      recipient_name: "",
      recipient_dni: "",
      direction: undefined,
      notes: "",
    },
  });

  const movementType = form.watch("movement_type");
  const selectedItemId = form.watch("uniform_item_id");
  const isEmployee = form.watch("is_employee");
  const selectedEmployeeId = form.watch("employee_id");
  const selectedItem = items?.find((i) => String(i.id) === selectedItemId);
  const selectedEmployee = employees?.find(
    (e) => String(e.id) === selectedEmployeeId
  );

  const employeeFullName = (e: (typeof employees extends (infer U)[] ? U : never)) =>
    [e.first_name, e.middle_name, e.last_name, e.second_last_name]
      .filter(Boolean)
      .join(" ");

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    createMovement.mutate(
      {
        company: selectedCompany!.slug,
        data: {
          uniform_item_id: Number(data.uniform_item_id),
          movement_type: data.movement_type,
          quantity: data.quantity,
          date: data.date,
          employee_id:
            data.movement_type === ISSUANCE && data.is_employee && data.employee_id
              ? Number(data.employee_id)
              : undefined,
          recipient_name:
            data.movement_type === ISSUANCE && !data.is_employee
              ? data.recipient_name
              : undefined,
          recipient_dni:
            data.movement_type === ISSUANCE && !data.is_employee
              ? data.recipient_dni
              : undefined,
          direction:
            data.movement_type === ADJUSTMENT ? data.direction : undefined,
          notes: data.notes || undefined,
        },
      },
      { onSuccess: () => onClose() }
    );
  };

  if (loadingItems || loadingOptions) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-y-4"
      >
        <FormField
          control={form.control}
          name="uniform_item_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Artículo</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={!!itemId}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un artículo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {items?.map((i) => (
                    <SelectItem key={i.id} value={String(i.id)}>
                      {i.type_label}
                      {i.brand_label ? ` · ${i.brand_label}` : ""} · {i.size} ·{" "}
                      {uniformCompanyLabel(i.company)}
                      {uniformGenderLabel(i.gender)
                        ? ` · ${uniformGenderLabel(i.gender)}`
                        : ""}{" "}
                      (stock:{" "}
                      {i.current_stock})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedItem && (
                <div className="mt-1 flex items-center justify-between rounded-md border bg-muted/40 px-3 py-2">
                  <span className="text-sm text-muted-foreground">
                    Stock actual:{" "}
                    <span className="font-semibold tabular-nums text-foreground">
                      {selectedItem.current_stock}
                    </span>
                  </span>
                  {selectedItem.is_low_stock && (
                    <Badge variant="destructive" className="gap-1 text-[10px]">
                      <AlertTriangle className="size-3" />
                      Bajo stock
                    </Badge>
                  )}
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="movement_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de movimiento</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {options?.movement_types.map((m) => {
                    const Icon = MOVEMENT_TYPE_META[m]?.Icon;
                    return (
                      <SelectItem key={m} value={m}>
                        <span className="flex items-center gap-2">
                          {Icon && (
                            <Icon className="size-4 text-muted-foreground" />
                          )}
                          {uniformMovementTypeLabel(m)}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cantidad</FormLabel>
              <FormControl>
                <Input type="number" min={1} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fecha</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {movementType === ISSUANCE && (
          <>
            <FormField
              control={form.control}
              name="is_employee"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-3 rounded-md border p-3">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        form.setValue("employee_id", "");
                        form.setValue("recipient_name", "");
                        form.setValue("recipient_dni", "");
                      }}
                    />
                  </FormControl>
                  <div className="space-y-0.5">
                    <FormLabel className="text-sm">
                      Es empleado de la empresa
                    </FormLabel>
                    <FormDescription className="text-xs">
                      Desmarque si el receptor no es un empleado directo
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {isEmployee ? (
              <FormField
                control={form.control}
                name="employee_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Empleado</FormLabel>
                    <Popover
                      open={employeePopoverOpen}
                      onOpenChange={setEmployeePopoverOpen}
                    >
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            type="button"
                            variant="outline"
                            role="combobox"
                            aria-expanded={employeePopoverOpen}
                            className={cn(
                              "w-full justify-between bg-background/70 font-normal",
                              !selectedEmployee && "text-muted-foreground"
                            )}
                          >
                            <span className="min-w-0 truncate">
                              {selectedEmployee
                                ? employeeFullName(selectedEmployee)
                                : "Buscar empleado..."}
                            </span>
                            <ChevronsUpDown className="ml-1 size-3.5 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-[max(var(--radix-popover-trigger-width),280px)] p-0"
                        align="start"
                      >
                        <Command
                          filter={(itemValue, search) =>
                            itemValue
                              .toLowerCase()
                              .includes(search.toLowerCase())
                              ? 1
                              : 0
                          }
                        >
                          <CommandInput
                            placeholder="Buscar por nombre o DNI..."
                            className="h-9"
                          />
                          <CommandList>
                            <CommandEmpty>Sin resultados</CommandEmpty>
                            <CommandGroup>
                              {employees
                                ?.filter((e) => e.isActive)
                                .map((emp) => (
                                  <CommandItem
                                    key={emp.id}
                                    value={`${emp.first_name} ${emp.middle_name ?? ""} ${emp.last_name} ${emp.second_last_name ?? ""} ${emp.dni}`}
                                    onSelect={() => {
                                      field.onChange(String(emp.id));
                                      setEmployeePopoverOpen(false);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 size-4 shrink-0",
                                        String(emp.id) === field.value
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    <div className="flex flex-col">
                                      <span className="text-sm">
                                        {employeeFullName(emp)}
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        DNI: {emp.dni}
                                      </span>
                                    </div>
                                  </CommandItem>
                                ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <>
                <FormField
                  control={form.control}
                  name="recipient_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del receptor</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre completo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="recipient_dni"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>DNI del receptor</FormLabel>
                      <FormControl>
                        <Input placeholder="DNI / Cédula" {...field} />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Opcional
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </>
        )}

        {movementType === ADJUSTMENT && (
          <FormField
            control={form.control}
            name="direction"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dirección del ajuste</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Aumentar o disminuir" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="increase">Aumentar (+)</SelectItem>
                    <SelectItem value="decrease">Disminuir (−)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {(movementType === ADJUSTMENT || movementType === ISSUANCE) && (
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {movementType === ADJUSTMENT ? "Motivo" : "Notas"}
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={
                      movementType === ADJUSTMENT
                        ? "Motivo del ajuste"
                        : "Observaciones (opcional)"
                    }
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button
          type="submit"
          disabled={createMovement.isPending}
          className="bg-primary mt-2 gap-2 text-white hover:bg-blue-900 disabled:bg-primary/70"
        >
          {createMovement.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <>
              <PackagePlus className="size-4" />
              Registrar movimiento
            </>
          )}
        </Button>
      </form>
    </Form>
  );
};
