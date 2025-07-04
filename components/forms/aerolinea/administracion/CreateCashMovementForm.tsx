"use client";

import { useCreateCashMovement } from "@/actions/aerolinea/movimientos/actions";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { useGetEmployeesByCompany } from "@/hooks/administracion/useGetEmployees";
import { useGetCash } from "@/hooks/aerolinea/cajas/useGetCash";
import { useGetCategoriesByAccountant } from "@/hooks/aerolinea/categorias_cuentas/useGetCategoriesByAcountant";
import { useGetAccountant } from "@/hooks/aerolinea/cuentas_contables/useGetAccountant";
import { useGetClients } from "@/hooks/general/clientes/useGetClients";
import { useGetBankAccounts } from "@/hooks/general/cuentas_bancarias/useGetBankAccounts";
import { useGetVendors } from "@/hooks/general/proveedores/useGetVendors";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { es } from "date-fns/locale/es";
import { CalendarIcon, Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, } from "../../../ui/command";
import { useGetEmployeesByDepartment } from "@/hooks/sistema/useGetEmployeesByDepartament";

const formSchema = z.object({
  employee_responsible: z.string({
    message: "Debe elegir un responsable.",
  }),
  cash_id: z.string({
    message: "Debe elegir una caja.",
  }),
  vendor_id: z
    .string({
      message: "Debe elegir un beneficiario.",
    })
    .optional(),
  client_id: z
    .string({
      message: "Debe elegir un cliente.",
    })
    .optional(),
  date: z.date({
    required_error: "La fecha es requerida",
  }),
  type: z.enum(["INCOME", "OUTPUT"]),
  accountant_id: z.string({
    message: "Debe elegir una cuenta.",
  }),
  category_id: z.string({
    message: "Debe elegir una categoría.",
  }),
  details: z
    .string()
    .min(2, {
      message: "El detalle debe tener al menos 2 caracteres.",
    })
    .max(100, {
      message: "El detalle tiene un máximo 100 caracteres.",
    }),
  total_amount: z.string(),
  bank_account_id: z
    .union([
      z.string().min(1, { message: "Debe seleccionar una cuenta válida" }),
      z.null(),
    ])
    .refine((val) => val !== undefined, {
      message: "Debe seleccionar una opción",
    })
    .transform((val) => (val === "" ? null : val)),
});

interface FormProps {
  onClose: () => void;
}

export function CreateCashMovementForm({ onClose }: FormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  // Obtener accountant_id para usar en el hook de categorías
  const accountantId = form.watch("accountant_id");

  const { createCashMovement } = useCreateCashMovement();
  const {selectedCompany} = useCompanyStore();
  const {data: employees, isLoading: isEmployeesLoading } = useGetEmployeesByDepartment("DAR", selectedCompany?.split(" ").join(""));
  const { data: cashes, isLoading: isCashesLoading } = useGetCash();
  const { data: bankaccounts, isLoading: isBankAccLoading } =
    useGetBankAccounts();
  const { data: vendors, isLoading: isVendorLoading } = useGetVendors(selectedCompany?.split(" ").join(""));
  const { data: clients, isLoading: isClientLoading } = useGetClients(selectedCompany?.split(" ").join(""));
  const { data: accounts, isLoading: isAccountLoading } = useGetAccountant();
  const { data: categories, isLoading: isCategoryLoading } =
    useGetCategoriesByAccountant(accountantId || "");

  useEffect(() => {
    // Observar cambios en la caja seleccionada
    const subscription = form.watch((value, { name }) => {
      if (name === "cash_id") {
        // Encontrar la caja seleccionada
        const selectedCash = cashes?.find(
          (cash) => cash.id.toString() === value.cash_id
        );
        // Si es de tipo efectivo, resetear el campo de cuenta bancaria
        if (selectedCash?.type === "EFECTIVO") {
          form.setValue("bank_account_id", null);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form, cashes]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    createCashMovement.mutate(values, {
      onSuccess: () => {
        onClose();
      },
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col space-y-3"
      >
        <div className="flex gap-2 items-center justify-center">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col mt-2.5">
                <FormLabel>Fecha</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[240px] pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP", {
                            locale: es,
                          })
                        ) : (
                          <span>Seleccione una fecha</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1999-07-21")
                      }
                      initialFocus
                      fromYear={1980} // Año mínimo que se mostrará
                      toYear={new Date().getFullYear()} // Año máximo (actual)
                      captionLayout="dropdown-buttons" // Selectores de año/mes
                      components={{
                        Dropdown: (props) => (
                          <select
                            {...props}
                            className="bg-popover text-popover-foreground"
                          >
                            {props.children}
                          </select>
                        ),
                      }}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cash_id"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Caja</FormLabel>
                <Select
                  disabled={isCashesLoading}
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione la caja" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {cashes &&
                      cashes.map((cash) => (
                        <SelectItem key={cash.id} value={cash.id.toString()}>
                          {cash.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex gap-2 items-center justify-center">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Tipo de Transacción</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Ingreso/Egreso" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="INCOME">Ingreso</SelectItem>
                    <SelectItem value="OUTPUT">Egreso</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          {form.watch("type") === "OUTPUT" && (
            <FormField
              control={form.control}
              name="vendor_id"
              render={({ field }) => (
                <FormItem className="w-full flex flex-col space-y-3">
                  <FormLabel>Beneficiario</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          disabled={isVendorLoading}
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {isVendorLoading && (
                            <Loader2 className="size-4 animate-spin mr-2" />
                          )}
                          {field.value
                            ? vendors?.find(
                                (vendor) => vendor.id.toString() === field.value
                              )?.name
                            : "Seleccione un beneficiario"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]">
                      <Command>
                        <CommandInput placeholder="Busque un beneficiario..." />
                        <CommandList>
                          <CommandEmpty className="text-sm p-2 text-center">
                            No se ha encontrado ningún beneficiario.
                          </CommandEmpty>
                          <CommandGroup>
                            {vendors?.map((vendor) => (
                              <CommandItem
                                value={vendor.name}
                                key={vendor.id}
                                onSelect={() => {
                                  form.setValue(
                                    "vendor_id",
                                    vendor.id.toString()
                                  );
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    vendor.id.toString() === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {vendor.name}
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
          )}
          {form.watch("type") === "INCOME" && (
            <FormField
              control={form.control}
              name="client_id"
              render={({ field }) => (
                <FormItem className="w-full flex flex-col space-y-3">
                  <FormLabel>Cliente</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          disabled={isClientLoading}
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {isClientLoading && (
                            <Loader2 className="size-4 animate-spin mr-2" />
                          )}
                          {field.value
                            ? clients?.find(
                                (client) => client.id.toString() === field.value
                              )?.name
                            : "Seleccione un cliente"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]">
                      <Command>
                        <CommandInput placeholder="Busque un cliente..." />
                        <CommandList>
                          <CommandEmpty className="text-sm p-2 text-center">
                            No se ha encontrado ningún cliente.
                          </CommandEmpty>
                          <CommandGroup>
                            {clients?.map((client) => (
                              <CommandItem
                                value={client.name}
                                key={client.id}
                                onSelect={() => {
                                  form.setValue(
                                    "client_id",
                                    client.id.toString()
                                  );
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    client.id.toString() === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {client.name}
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
          )}
        </div>
        <div className="flex gap-2 items-center justify-center">
          <FormField
            control={form.control}
            name="accountant_id"
            render={({ field }) => (
              <FormItem className="w-full flex flex-col space-y-3">
                <FormLabel>Cuenta</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        disabled={isAccountLoading}
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "justify-between",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {isAccountLoading && (
                          <Loader2 className="size-4 animate-spin mr-2" />
                        )}
                        {field.value
                          ? accounts?.find(
                              (account) => account.id.toString() === field.value
                            )?.name
                          : "Seleccione una cuenta"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]">
                    <Command>
                      <CommandInput placeholder="Busque una cuenta..." />
                      <CommandList>
                        <CommandEmpty className="text-sm p-2 text-center">
                          No se ha encontrado ninguna cuenta.
                        </CommandEmpty>
                        <CommandGroup>
                          {accounts?.map((account) => (
                            <CommandItem
                              value={account.name}
                              key={account.id}
                              onSelect={() => {
                                form.setValue(
                                  "accountant_id",
                                  account.id.toString()
                                );
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  account.id.toString() === field.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {account.name}
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
          <FormField
            control={form.control}
            name="category_id"
            render={({ field }) => (
              <FormItem className="w-full flex flex-col space-y-3">
                <FormLabel>Categoría</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        disabled={isCategoryLoading}
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "justify-between",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {isCategoryLoading && (
                          <Loader2 className="size-4 animate-spin mr-2" />
                        )}
                        {field.value
                          ? categories?.find(
                              (category) =>
                                category.id.toString() === field.value
                            )?.name
                          : "Seleccione una cuenta"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]">
                    <Command>
                      <CommandInput placeholder="Busque una cuenta..." />
                      <CommandList>
                        <CommandEmpty className="text-sm p-2 text-center">
                          No se ha encontrado ninguna categoría.
                        </CommandEmpty>
                        <CommandGroup>
                          {categories?.map((category) => (
                            <CommandItem
                              value={category.name}
                              key={category.id}
                              onSelect={() => {
                                form.setValue(
                                  "category_id",
                                  category.id.toString()
                                );
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  category.id.toString() === field.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {category.name}
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
        </div>
        <div className="flex gap-2 items-center justify-center">
          <FormField
            control={form.control}
            name="details"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Detalle</FormLabel>
                <FormControl>
                  <Input placeholder="Ingrese los detalles" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex gap-4 items-center ">
          <div className="flex-1 min-w-[200px]">
            <FormField
              control={form.control}
              name="employee_responsible"
              render={({ field }) => (
                <FormItem className="w-full flex flex-col space-y-3 mt-1.5">
                  <FormLabel>Responsable</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          disabled={isEmployeesLoading}
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {isEmployeesLoading && (
                            <Loader2 className="size-4 animate-spin mr-2" />
                          )}
                          {field.value ? (
                            <p>
                              {
                                employees?.find(
                                  (employee) =>
                                    employee.dni === field.value
                                )?.first_name
                              }{" "}
                              {
                                employees?.find(
                                  (employee) =>
                                    employee.dni === field.value
                                )?.last_name
                              }
                            </p>
                          ) : (
                            "Elige al responsable..."
                          )}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="p-0">
                      <Command>
                        <CommandInput placeholder="Busque un responsable..." />
                        <CommandList>
                          <CommandEmpty className="text-sm p-2 text-center">
                            No se ha encontrado ningún empleado.
                          </CommandEmpty>
                          <CommandGroup>
                            {employees?.map((employee) => (
                              <CommandItem
                                value={`${employee.first_name} ${employee.last_name}`}
                                key={employee.id}
                                onSelect={() => {
                                  form.setValue(
                                    "employee_responsible",
                                    employee.dni
                                  );
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    `${employee.first_name} ${employee.last_name}` ===
                                      field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {
                                  <p>
                                    {employee.first_name} {employee.last_name}
                                  </p>
                                }
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
          </div>
        </div>
        <FormField
          control={form.control}
          name="total_amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Monto Final</FormLabel>
              <FormControl>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground">
                    $
                  </span>
                  <Input
                    placeholder="0.00"
                    className="pl-8"
                    {...field}
                    onChange={(e) => {
                      // Validar que solo se ingresen números y un punto decimal
                      const value = e.target.value;
                      const regex = /^(\d+)?([.]?\d{0,2})?$/;

                      if (value === "" || regex.test(value)) {
                        field.onChange(value);
                      }
                    }}
                    onBlur={(e) => {
                      // Formatear el valor al salir del input
                      const value = e.target.value;
                      if (value) {
                        const number = parseFloat(value);
                        if (!isNaN(number)) {
                          field.onChange(number.toFixed(2));
                        }
                      }
                    }}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/*Validacion para cuando la caja sea efectivo retorna nulo y cuando la caja sea tipo transferencia mostrara la cuenta de banco*/}
        {(() => {
          const selectedCashId = form.watch("cash_id");
          const selectedCash = cashes?.find(
            (cash) => cash.id.toString() === selectedCashId
          );
          if (selectedCash?.type === "EFECTIVO") {
            return null;
          }
          return (
            <FormField
              control={form.control}
              name="bank_account_id"
              render={({ field }) => (
                <FormItem className="w-full flex flex-col space-y-3">
                  <FormLabel>Cuenta de Banco</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          disabled={isBankAccLoading}
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {isBankAccLoading ? (
                            <>
                              <Loader2 className="size-4 animate-spin mr-2" />
                              Cargando cuentas...
                            </>
                          ) : field.value ? (
                            bankaccounts?.find(
                              (acc) => acc.id.toString() === field.value
                            ) ? (
                              `${
                                bankaccounts.find(
                                  (acc) => acc.id.toString() === field.value
                                )?.name
                              } - ${
                                bankaccounts.find(
                                  (acc) => acc.id.toString() === field.value
                                )?.bank.name
                              }`
                            ) : (
                              "Cuenta no encontrada"
                            )
                          ) : (
                            "Seleccione una cuenta..."
                          )}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]">
                      <Command>
                        <CommandInput placeholder="Busque una cuenta bancaria..." />
                        <CommandList>
                          <CommandEmpty className="text-sm p-2 text-center">
                            No se encontraron cuentas bancarias.
                          </CommandEmpty>
                          <CommandGroup>
                            {bankaccounts?.map((acc) => (
                              <CommandItem
                                value={`${acc.name} ${acc.bank.name}`}
                                key={acc.id}
                                onSelect={() => {
                                  form.setValue(
                                    "bank_account_id",
                                    acc.id.toString()
                                  );
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    acc.id.toString() === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {acc.name} - {acc.bank.name}
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
          );
        })()}
        <Button type="submit" disabled={createCashMovement.isPending}>
          {createCashMovement.isPending ? "Enviando..." : "Enviar"}
        </Button>
      </form>
    </Form>
  );
}
