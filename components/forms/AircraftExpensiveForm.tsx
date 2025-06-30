"use client";

import { useCashMovementForAircraft } from "@/actions/aerolinea/aeronaves/actions";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetCash } from "@/hooks/aerolinea/cajas/useGetCash";
import { useGetAccountant } from "@/hooks/aerolinea/cuentas_contables/useGetAccountant";
import { useGetCategoriesByAccountant } from "@/hooks/aerolinea/categorias_cuentas/useGetCategoriesByAcountant";
import { useGetEmployeesByCompany } from "@/hooks/administracion/useGetEmployees";
import { useGetBankAccounts } from "@/hooks/general/cuentas_bancarias/useGetBankAccounts";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { es } from "date-fns/locale/es";
import { CalendarIcon, Loader2, MinusCircle, PlusCircle } from "lucide-react";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Textarea } from "../ui/textarea";
import { useGetVendors } from "@/hooks/general/proveedores/useGetVendors";
import { useCompanyStore } from "@/stores/CompanyStore";

// Esquema para los gastos
const cash_movement_detailsSchema = z.object({
  accountant_id: z.string({
    required_error: "La cuenta es requerida",
  }),
  category_id: z.string({
    required_error: "La categoría es requerida",
  }),
  details: z.string().min(2, {
    message: "El detalle debe tener al menos 2 caracteres.",
  }),
  amount: z.string().refine(
    (val) => {
      const number = Number.parseFloat(val);
      return !isNaN(number) && number > 0;
    },
    {
      message: "El monto debe ser mayor a cero.",
    }
  ),
});

// Esquema para los movimientos
const movementSchema = z.object({
  cash_id: z.string({
    required_error: "La caja es requerida",
  }),
  details: z.string(),
  bank_account_id: z
    .union([
      z.string().min(1, { message: "Debe seleccionar una cuenta válida" }),
      z.null(),
    ])
    .optional(),
  total_amount: z.string().refine(
    (val) => {
      const number = Number.parseFloat(val);
      return !isNaN(number) && number > 0;
    },
    {
      message: "El monto total debe ser mayor a cero.",
    }
  ),
  reference_cod: z
    .string()
    .min(2, {
      message: "La referencia debe tener al menos 2 caracteres.",
    })
    .max(10, {
      message: "La referencia tiene un máximo 10 caracteres.",
    }),
  cash_movement_details: z.array(cash_movement_detailsSchema).min(1, {
    message: "Debe agregar al menos un gasto.",
  }),
  employee_responsible: z.string({
    message: "Debe elegir un responsable.",
  }),
  vendor_id: z.string({
    required_error: "El beneficiario es requerido",
  }),
});

// Esquema principal del formulario
const formSchema = z.object({
  date: z.date({
    required_error: "La fecha es requerida",
  }),
  movements: z.array(movementSchema).min(1, {
    message: "Debe agregar al menos un movimiento.",
  }),
});

interface FormProps {
  onClose: () => void;
  acronym: string;
}

export function AircraftExpensiveForm({ acronym, onClose }: FormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      movements: [
        {
          cash_movement_details: [{}],
        },
      ],
    },
  });
  const {selectedCompany} = useCompanyStore();
  const { createCashMovementForAircraft } = useCashMovementForAircraft();
  const {
    data: employees,
 
    isPending: isEmployeesLoading,
  } = useGetEmployeesByCompany(selectedCompany?.split(" ").join(""));
  const { data: cashes, isLoading: isCashesLoading } = useGetCash();
  const { data: bankaccounts, isLoading: isBankAccLoading } =
    useGetBankAccounts();
  const { data: accounts, isLoading: isAccountLoading } = useGetAccountant();
  const { data: vendors, isLoading: isVendorLoading } = useGetVendors(selectedCompany?.split(" ").join(""));

  // Get accountant_id from form values to fetch categories
  const accountantId = form.watch(
    "movements.0.cash_movement_details.0.accountant_id"
  );
  const { data: categories, isLoading: isCategoryLoading } =
    useGetCategoriesByAccountant(accountantId || "");

  const {
    fields: movementFields,
    append: appendMovement,
    remove: removeMovement,
  } = useFieldArray({
    control: form.control,
    name: "movements",
  });

  // useEffect(() => {
  //   mutate(selectedCompany!.split(" ").join("")); // Refetch employees when company changes
  // }, [mutate, selectedCompany]);

  async function onSubmit(formData: z.infer<typeof formSchema>) {
    interface AircraftExpenseFormData {
      date: Date;
      movements: {
        cash_id: string;
        bank_account_id?: string | null;
        total_amount: number;
        reference_cod: string;
        employee_responsible: string;
        vendor_id: string;
        cash_movement_details: {
          accountant_id: string;
          category_id: string;
          details: string;
          amount: number;
        }[];
      }[];
    }

    const transformedData = {
      ...formData,
      movements: formData.movements.map((movement) => ({
        ...movement,
        total_amount: Number.parseFloat(movement.total_amount),
        cash_movement_details: movement.cash_movement_details.map(
          (cash_movement_details) => ({
            ...cash_movement_details,
            amount: Number.parseFloat(cash_movement_details.amount),
          })
        ),
      })),
    };

    createCashMovementForAircraft.mutate(
      { acronym, formData: transformedData },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  }

  const addMovement = () => {
    appendMovement({
      details: "",
      cash_id: "",
      bank_account_id: null,
      total_amount: "",
      reference_cod: "",
      employee_responsible: "",
      vendor_id: "",
      cash_movement_details: [
        {
          accountant_id: "",
          category_id: "",
          details: "",
          amount: "",
        },
      ],
    });
  };

  const removeMovementField = (index: number) => {
    removeMovement(index);
  };

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
                      fromYear={1980}
                      toYear={new Date().getFullYear()}
                      captionLayout="dropdown-buttons"
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
        </div>

        {/* Sección de Movimientos */}
        <div className="space-y-4">
          <div className="flex gap-2 items-center p-2">
            <Label>Movimiento(s)</Label>
            <PlusCircle
              className="size-4 cursor-pointer hover:scale-125 transition-all ease-in duration-100"
              onClick={addMovement}
            />
          </div>

          <ScrollArea className="h-[550px]" scrollHideDelay={0}>
            {movementFields.map((movement, movementIndex) => (
              <div
                key={movement.id}
                className="border p-4 rounded-lg space-y-4 mb-4"
              >
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">
                    Movimiento {movementIndex + 1}
                  </h4>
                  {movementFields.length > 1 && (
                    <MinusCircle
                      className="size-4 cursor-pointer hover:scale-125 transition-all ease-in duration-100 text-red-500"
                      onClick={() => removeMovementField(movementIndex)}
                    />
                  )}
                </div>
                <div className="flex gap-2 items-center justify-center">
                  <FormField
                    control={form.control}
                    name={`movements.${movementIndex}.cash_id`}
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
                                <SelectItem
                                  key={cash.id}
                                  value={cash.id.toString()}
                                >
                                  {cash.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {(() => {
                    const selectedCashId = form.watch(
                      `movements.${movementIndex}.cash_id`
                    );
                    const selectedCash = cashes?.find(
                      (cash) => cash.id.toString() === selectedCashId
                    );
                    if (selectedCash?.type === "EFECTIVO") {
                      return null;
                    }
                    return (
                      <FormField
                        control={form.control}
                        name={`movements.${movementIndex}.bank_account_id`}
                        render={({ field }) => (
                          <FormItem className="w-full">
                            <FormLabel>Cuenta de Banco</FormLabel>
                            <Select
                              disabled={isBankAccLoading}
                              onValueChange={field.onChange}
                              defaultValue={
                                field.value === null ? "" : field.value
                              }
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue
                                    placeholder={
                                      isBankAccLoading ? (
                                        <Loader2 className="animate-spin" />
                                      ) : (
                                        "Seleccione una cuenta..."
                                      )
                                    }
                                  />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {bankaccounts &&
                                  bankaccounts.map((acc) => (
                                    <SelectItem
                                      value={acc.id.toString()}
                                      key={acc.id}
                                    >
                                      {acc.name} - {acc.bank.name}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    );
                  })()}
                </div>
                <div className="flex gap-2 items-center justify-center">
                  <FormField
                    control={form.control}
                    name={`movements.${movementIndex}.total_amount`}
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>Monto Total</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="0.00"
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
                                const number = Number.parseFloat(value);
                                if (!isNaN(number)) {
                                  field.onChange(number.toFixed(2));
                                }
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`movements.${movementIndex}.reference_cod`}
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>Referencia</FormLabel>
                        <FormControl>
                          <Input placeholder="Ingrese referencia" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex gap-2 items-center justify-center">
                  <FormField
                    control={form.control}
                    name={`movements.${movementIndex}.employee_responsible`}
                    render={({ field }) => (
                      <FormItem className="w-full flex flex-col space-y-3 mt-1.5">
                        <FormLabel>Responsable</FormLabel>
                        <Select
                          disabled={isEmployeesLoading}
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione el responsable" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {employees &&
                              employees.map((employee) => (
                                <SelectItem
                                  key={employee.id}
                                  value={employee.dni}
                                >
                                  {employee.first_name} {employee.last_name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`movements.${movementIndex}.vendor_id`}
                    render={({ field }) => (
                      <FormItem className="w-full flex flex-col space-y-3">
                        <FormLabel>Beneficiario</FormLabel>
                        <Select
                          disabled={isVendorLoading}
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione el beneficiario" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {vendors &&
                              vendors.map((vendor) => (
                                <SelectItem
                                  key={vendor.id}
                                  value={vendor.id.toString()}
                                >
                                  {vendor.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`movements.${movementIndex}.details`}
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Descripción</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Agregue una descripción del movimiento..."
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Sección de Gastos */}
                <div className="mt-4 space-y-4">
                  <h5 className="font-medium">Gastos</h5>

                  <ScrollArea className="h-[200px]" scrollHideDelay={0}>
                    {form
                      .watch(`movements.${movementIndex}.cash_movement_details`)
                      ?.map((cash_movement_details, expenseIndex) => {
                        // Get the current accountant_id for this cash_movement_details to filter categories
                        const currentAccountantId = form.watch(
                          `movements.${movementIndex}.cash_movement_details.${expenseIndex}.accountant_id`
                        );

                        return (
                          <div
                            key={expenseIndex}
                            className="border p-4 rounded-lg space-y-2 mb-4"
                          >
                            <div className="flex justify-between items-center">
                              <h6 className="font-medium">
                                Gasto {expenseIndex + 1}
                              </h6>
                              {form.watch(
                                `movements.${movementIndex}.cash_movement_details`
                              )?.length > 1 && (
                                <MinusCircle
                                  className="size-4 cursor-pointer hover:scale-125 transition-all ease-in duration-100 text-red-500"
                                  onClick={() => {
                                    const currentExpenses = form.getValues(
                                      `movements.${movementIndex}.cash_movement_details`
                                    );
                                    const newExpenses = currentExpenses.filter(
                                      (_, i) => i !== expenseIndex
                                    );
                                    form.setValue(
                                      `movements.${movementIndex}.cash_movement_details`,
                                      newExpenses
                                    );
                                  }}
                                />
                              )}
                            </div>

                            <div className="flex gap-2 items-center justify-center">
                              <FormField
                                control={form.control}
                                name={`movements.${movementIndex}.cash_movement_details.${expenseIndex}.accountant_id`}
                                render={({ field }) => (
                                  <FormItem className="w-full">
                                    <FormLabel>Cuenta</FormLabel>
                                    <Select
                                      onValueChange={(value) => {
                                        field.onChange(value);
                                        // Reset category when accountant changes
                                        form.setValue(
                                          `movements.${movementIndex}.cash_movement_details.${expenseIndex}.category_id`,
                                          ""
                                        );
                                      }}
                                      value={field.value}
                                    >
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Seleccione una cuenta" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {accounts?.map((account) => (
                                          <SelectItem
                                            key={account.id}
                                            value={account.id.toString()}
                                          >
                                            {account.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`movements.${movementIndex}.cash_movement_details.${expenseIndex}.category_id`}
                                render={({ field }) => (
                                  <FormItem className="w-full">
                                    <FormLabel>Categoría</FormLabel>
                                    <Select
                                      onValueChange={field.onChange}
                                      value={field.value}
                                      disabled={!currentAccountantId}
                                    >
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue
                                            placeholder={
                                              !currentAccountantId
                                                ? "Seleccione cuenta primero"
                                                : "Seleccione categoría"
                                            }
                                          />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {categories
                                          ?.filter(
                                            (category) =>
                                              category.accountant.id.toString() ===
                                              currentAccountantId
                                          )
                                          ?.map((category) => (
                                            <SelectItem
                                              key={category.id}
                                              value={category.id.toString()}
                                            >
                                              {category.name}
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
                                name={`movements.${movementIndex}.cash_movement_details.${expenseIndex}.details`}
                                render={({ field }) => (
                                  <FormItem className="w-full">
                                    <FormLabel>Detalle</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="Ingrese detalle"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`movements.${movementIndex}.cash_movement_details.${expenseIndex}.amount`}
                                render={({ field }) => (
                                  <FormItem className="w-full">
                                    <FormLabel>Monto</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="0.00"
                                        {...field}
                                        onChange={(e) => {
                                          // Validar que solo se ingresen números y un punto decimal
                                          const value = e.target.value;
                                          const regex =
                                            /^(\d+)?([.]?\d{0,2})?$/;

                                          if (
                                            value === "" ||
                                            regex.test(value)
                                          ) {
                                            field.onChange(value);
                                          }
                                        }}
                                        onBlur={(e) => {
                                          // Formatear el valor al salir del input
                                          const value = e.target.value;
                                          if (value) {
                                            const number =
                                              Number.parseFloat(value);
                                            if (!isNaN(number)) {
                                              field.onChange(number.toFixed(2));
                                            }
                                          }
                                        }}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        );
                      })}
                  </ScrollArea>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const currentExpenses =
                        form.getValues(
                          `movements.${movementIndex}.cash_movement_details`
                        ) || [];
                      form.setValue(
                        `movements.${movementIndex}.cash_movement_details`,
                        [
                          ...currentExpenses,
                          {
                            accountant_id: "",
                            category_id: "",
                            details: "",
                            amount: "",
                          },
                        ]
                      );
                    }}
                    className="mt-2"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Agregar Gasto
                  </Button>
                </div>
              </div>
            ))}
            <Separator />
          </ScrollArea>
        </div>

        <Button
          type="submit"
          disabled={createCashMovementForAircraft.isPending}
        >
          {createCashMovementForAircraft.isPending ? "Enviando..." : "Enviar"}
        </Button>
      </form>
    </Form>
  );
}
