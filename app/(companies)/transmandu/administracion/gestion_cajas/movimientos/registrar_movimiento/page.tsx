"use client";

import { useCashMovementForAircraft } from "@/actions/administracion/aeronaves/actions";
import { useCreateCashMovement } from "@/actions/administracion/movimientos/actions";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { description } from "@/components/misc/TestChart";
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
import { Label } from "@/components/ui/label";
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
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useGetCash } from "@/hooks/administracion/cajas/useGetCash";
import { useGetAccountant } from "@/hooks/administracion/useGetAccountant";
import { useGetCategory } from "@/hooks/administracion/useGetCategory";
import { useGetEmployeesByCompany } from "@/hooks/administracion/useGetEmployees";
import { useGetBankAccounts } from "@/hooks/ajustes/cuentas/useGetBankAccounts";
import { useGetVendors } from "@/hooks/ajustes/globales/proveedores/useGetVendors";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { es } from "date-fns/locale/es";
import { CalendarIcon, Loader2, MinusCircle, PlusCircle } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

// Esquemas Zod (igual que antes)
const cash_movement_detailsSchema = z.object({
  accountant_id: z.string({ required_error: "La cuenta es requerida" }),
  category_id: z.string({ required_error: "La categoría es requerida" }),
  details: z
    .string()
    .min(2, { message: "El detalle debe tener al menos 2 caracteres." }),
  amount: z.string().refine(
    (val) => {
      const number = Number.parseFloat(val);
      return !isNaN(number) && number > 0;
    },
    { message: "El monto debe ser mayor a cero." }
  ),
});

const movementSchema = z.object({
  type: z.string({ message: "Debe elegir un tipo" }),
  cash_id: z.string({ required_error: "La caja es requerida" }),
  details: z
    .string({ message: "La descripción es requerida" })
    .min(2, { message: "La descripción debe tener al menos 2 caracteres." }),
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
    { message: "El monto total debe ser mayor a cero." }
  ),
  reference_cod: z
    .string()
    .min(2, { message: "La referencia debe tener al menos 2 caracteres." })
    .max(15, { message: "La referencia tiene un máximo 10 caracteres." }),
  cash_movement_details: z
    .array(cash_movement_detailsSchema)
    .min(1, { message: "Debe agregar al menos un gasto." }),
  employee_responsible_id: z.string({ message: "Debe elegir un responsable." }),
  vendor_id: z
    .string({ required_error: "El beneficiario es requerido" })
    .optional(),
  client_id: z.string().optional(),
});

const formSchema = z.object({
  date: z.date({ required_error: "La fecha es requerida" }),
  movements: z
    .array(movementSchema)
    .min(1, { message: "Debe agregar al menos un movimiento." }),
});

export default function AircraftExpensesPage() {
  const { id } = useParams<{ id: string }>();
  const { selectedCompany } = useCompanyStore();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      movements: [{ cash_movement_details: [{}] }],
    },
  });

  const { createCashMovement } = useCreateCashMovement();
  const {
    data: employees,
    mutate,
    isPending: isEmployeesLoading,
  } = useGetEmployeesByCompany();
  const { data: cashes, isLoading: isCashesLoading } = useGetCash();
  const { data: bankaccounts, isLoading: isBankAccLoading } =
    useGetBankAccounts();
  const { data: accounts, isLoading: isAccountLoading } = useGetAccountant();
  const { data: vendors, isLoading: isVendorLoading } = useGetVendors();
  const { data: allCategories, isLoading: isAllCategoriesLoading } =
    useGetCategory();

  const {
    fields: movementFields,
    append: appendMovement,
    remove: removeMovement,
  } = useFieldArray({
    control: form.control,
    name: "movements",
  });

  useEffect(() => {
    if (selectedCompany) {
      mutate(selectedCompany.split(" ").join("").toLowerCase());
    }
  }, [mutate, selectedCompany]);

  async function onSubmit(formData: z.infer<typeof formSchema>) {
    const transformedData = {
      ...formData,
      movements: formData.movements.map((movement) => ({
        ...movement,
        total_amount: Number.parseFloat(movement.total_amount),
        cash_movement_details: movement.cash_movement_details.map((detail) => ({
          ...detail,
          amount: Number.parseFloat(detail.amount),
        })),
      })),
    };
    await createCashMovement.mutateAsync(transformedData);
  }

  const addMovement = () => {
    appendMovement({
      type: "",
      cash_id: "",
      bank_account_id: null,
      total_amount: "",
      reference_cod: "",
      details: "",
      employee_responsible_id: "",
      vendor_id: "",
      client_id: "",
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
    <ContentLayout title="Registro de Movimiento">
      <div className="space-y-6">
        <h1 className="text-5xl font-bold text-center">
          Registro de Movimiento
        </h1>
        <p className="text-muted-foreground text-center italic">
          Ingrese la información para registrar movimientos de caja.
        </p>

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
                  <FormItem className="flex flex-col mt-1.5 text-center">
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
                              format(field.value, "PPP", { locale: es })
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
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1999-07-21")
                          }
                          initialFocus
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
                <Label className="text-lg">Movimiento(s)</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={addMovement}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Agregar Movimiento
                </Button>
              </div>

              <ScrollArea className="h-[800px]" scrollHideDelay={0}>
                {movementFields.map((movement, movementIndex) => (
                  <div
                    key={movement.id}
                    className="border p-4 rounded-lg space-y-4 mb-4"
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold text-3xl text-gray-800 dark:text-white">
                        Movimiento {movementIndex + 1}{" "}
                        <FormField
                          control={form.control}
                          name={`movements.${movementIndex}.type`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tipo</FormLabel>
                              <Select value={field.value}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccione la caja" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="INCOME">
                                    Ingreso
                                  </SelectItem>
                                  <SelectItem value="OUTPUT">Egreso</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </h4>
                      {movementFields.length > 1 && (
                        <Button
                          variant="ghost"
                          type="button"
                          size="sm"
                          onClick={() => removeMovementField(movementIndex)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <MinusCircle className="size-4 mr-1" />
                          Eliminar Movimiento
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Caja y Cuenta Bancaria */}
                      <div className="space-y-2">
                        <FormField
                          control={form.control}
                          name={`movements.${movementIndex}.cash_id`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Caja</FormLabel>
                              <Select
                                disabled={isCashesLoading}
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccione la caja" />
                                </SelectTrigger>
                                <SelectContent>
                                  {cashes?.map((cash) => (
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
                          if (selectedCash?.type === "EFECTIVO") return null;

                          return (
                            <FormField
                              control={form.control}
                              name={`movements.${movementIndex}.bank_account_id`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Cuenta Bancaria</FormLabel>
                                  <Select
                                    disabled={isBankAccLoading}
                                    onValueChange={field.onChange}
                                    value={field.value || ""}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Seleccione cuenta bancaria" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {bankaccounts?.map((acc) => (
                                        <SelectItem
                                          key={acc.id}
                                          value={acc.id.toString()}
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

                      {/* Monto Total y Referencia */}
                      <div className="space-y-2">
                        <FormField
                          control={form.control}
                          name={`movements.${movementIndex}.total_amount`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Monto Total</FormLabel>
                              <Input
                                placeholder="0.00"
                                {...field}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  if (
                                    value === "" ||
                                    /^(\d+)?([.]?\d{0,2})?$/.test(value)
                                  ) {
                                    field.onChange(value);
                                  }
                                }}
                              />
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`movements.${movementIndex}.reference_cod`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Referencia</FormLabel>
                              <Input
                                placeholder="Ingrese referencia"
                                {...field}
                              />
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Responsable y Beneficiario */}
                      <div className="space-y-2">
                        <FormField
                          control={form.control}
                          name={`movements.${movementIndex}.employee_responsible_id`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Responsable</FormLabel>
                              <Select
                                disabled={isEmployeesLoading}
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccione responsable" />
                                </SelectTrigger>
                                <SelectContent>
                                  {employees?.map((employee) => (
                                    <SelectItem
                                      key={employee.id}
                                      value={employee.id.toString()}
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
                        {
                          <p>
                            asdsa:{" "}
                            {form.watch(`movements.${movementIndex}.type`)}
                          </p>
                        }
                      </div>
                      {form.watch(`movements.${movementIndex}.type`)}
                      {form.watch(`movements.${movementIndex}.type`) ===
                      "OUTPUT" ? (
                        <div className="space-y-2">
                          <FormField
                            control={form.control}
                            name={`movements.${movementIndex}.vendor_id`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Beneficiario</FormLabel>
                                <Select
                                  disabled={isVendorLoading}
                                  onValueChange={field.onChange}
                                  value={field.value}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Seleccione beneficiario" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {vendors?.map((vendor) => (
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
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <FormField
                            control={form.control}
                            name={`movements.${movementIndex}.client_id`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Cliente</FormLabel>
                                <Select
                                  disabled={isVendorLoading}
                                  onValueChange={field.onChange}
                                  value={field.value}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Seleccione el cliente" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {vendors?.map((vendor) => (
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
                        </div>
                      )}
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
                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="font-semibold text-lg">Gastos</h5>
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
                        >
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Agregar Gasto
                        </Button>
                      </div>

                      <ScrollArea className="h-[300px]">
                        {form
                          .watch(
                            `movements.${movementIndex}.cash_movement_details`
                          )
                          ?.map((_, expenseIndex) => {
                            const currentAccountantId = form.watch(
                              `movements.${movementIndex}.cash_movement_details.${expenseIndex}.accountant_id`
                            );

                            return (
                              <div
                                key={expenseIndex}
                                className="border p-4 rounded-lg mb-4 bg-white"
                              >
                                <div className="flex justify-between items-center mb-3">
                                  <h6 className="font-medium">
                                    Gasto {expenseIndex + 1}
                                  </h6>
                                  {form.watch(
                                    `movements.${movementIndex}.cash_movement_details`
                                  )?.length > 1 && (
                                    <Button
                                      variant="ghost"
                                      type="button"
                                      size="sm"
                                      onClick={() => {
                                        const currentExpenses = form.getValues(
                                          `movements.${movementIndex}.cash_movement_details`
                                        );
                                        const newExpenses =
                                          currentExpenses.filter(
                                            (_, i) => i !== expenseIndex
                                          );
                                        form.setValue(
                                          `movements.${movementIndex}.cash_movement_details`,
                                          newExpenses
                                        );
                                      }}
                                      className="text-red-500 hover:text-red-600"
                                    >
                                      <MinusCircle className="size-4 mr-1" />
                                      Eliminar
                                    </Button>
                                  )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {/* Cuenta y Categoría */}
                                  <div className="space-y-2">
                                    <FormField
                                      control={form.control}
                                      name={`movements.${movementIndex}.cash_movement_details.${expenseIndex}.accountant_id`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Cuenta Contable</FormLabel>
                                          <Select
                                            onValueChange={(value) => {
                                              field.onChange(value);
                                              form.setValue(
                                                `movements.${movementIndex}.cash_movement_details.${expenseIndex}.category_id`,
                                                ""
                                              );
                                            }}
                                            disabled={isAccountLoading}
                                            value={field.value}
                                          >
                                            <SelectTrigger>
                                              <SelectValue
                                                placeholder={
                                                  isAccountLoading ? (
                                                    <Loader2 className="animate-spin" />
                                                  ) : (
                                                    "Seleccione una cuenta..."
                                                  )
                                                }
                                              />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {accounts &&
                                                accounts.map((account) => (
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
                                  </div>

                                  <div className="space-y-2">
                                    <FormField
                                      control={form.control}
                                      name={`movements.${movementIndex}.cash_movement_details.${expenseIndex}.category_id`}
                                      render={({ field }) => {
                                        // Obtener el accountant_id seleccionado para ESTE gasto específico
                                        const currentAccountantId = form.watch(
                                          `movements.${movementIndex}.cash_movement_details.${expenseIndex}.accountant_id`
                                        );

                                        // Filtrar categorías para este accountant
                                        const filteredCategories =
                                          allCategories?.filter(
                                            (category) =>
                                              category.accountant.id.toString() ===
                                              currentAccountantId
                                          ) || [];

                                        return (
                                          <FormItem>
                                            <FormLabel>Categoría</FormLabel>
                                            <Select
                                              onValueChange={field.onChange}
                                              value={field.value}
                                              disabled={
                                                !currentAccountantId ||
                                                isAllCategoriesLoading
                                              }
                                            >
                                              <SelectTrigger>
                                                <SelectValue
                                                  placeholder={
                                                    !currentAccountantId
                                                      ? "Seleccione cuenta primero"
                                                      : isAllCategoriesLoading
                                                        ? "Cargando..."
                                                        : filteredCategories.length ===
                                                            0
                                                          ? "No hay categorías"
                                                          : "Seleccione categoría"
                                                  }
                                                />
                                              </SelectTrigger>
                                              <SelectContent>
                                                {isAllCategoriesLoading && (
                                                  <Loader2 className="size-4 animate-spin" />
                                                )}
                                                {filteredCategories.map(
                                                  (category) => (
                                                    <SelectItem
                                                      key={category.id}
                                                      value={category.id.toString()}
                                                    >
                                                      {category.name}
                                                    </SelectItem>
                                                  )
                                                )}
                                                {filteredCategories.length ===
                                                  0 &&
                                                  !isAllCategoriesLoading && (
                                                    <p className="text-muted-foreground text-sm italic p-2">
                                                      No hay categorías
                                                      disponibles...
                                                    </p>
                                                  )}
                                              </SelectContent>
                                            </Select>
                                            <FormMessage />
                                          </FormItem>
                                        );
                                      }}
                                    />
                                  </div>

                                  {/* Detalle y Monto */}
                                  <div className="space-y-2">
                                    <FormField
                                      control={form.control}
                                      name={`movements.${movementIndex}.cash_movement_details.${expenseIndex}.details`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Detalle</FormLabel>
                                          <Input
                                            placeholder="Descripción del gasto"
                                            {...field}
                                          />
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <FormField
                                      control={form.control}
                                      name={`movements.${movementIndex}.cash_movement_details.${expenseIndex}.amount`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Monto</FormLabel>
                                          <Input
                                            placeholder="0.00"
                                            {...field}
                                            onChange={(e) => {
                                              const value = e.target.value;
                                              if (
                                                value === "" ||
                                                /^(\d+)?([.]?\d{0,2})?$/.test(
                                                  value
                                                )
                                              ) {
                                                field.onChange(value);
                                              }
                                            }}
                                          />
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </ScrollArea>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </div>

            <div className="flex justify-between items-center gap-x-4">
              <Separator className="flex-1" />
              <p className="text-muted-foreground">SIGEAC</p>
              <Separator className="flex-1" />
            </div>

            <Button
              type="submit"
              disabled={createCashMovement.isPending}
              className="self-end"
            >
              {createCashMovement.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Registrar Gastos
            </Button>
          </form>
        </Form>
      </div>
    </ContentLayout>
  );
}
