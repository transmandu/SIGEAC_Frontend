"use client";

import { useCreateDispatchRequest } from "@/actions/mantenimiento/almacen/solicitudes/salida/action";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useGetBatchesWithInWarehouseArticles } from "@/hooks/mantenimiento/almacen/renglones/useGetBatchesWithInWarehouseArticles";
import { useGetWorkOrderEmployees } from "@/hooks/mantenimiento/planificacion/useGetWorkOrderEmployees";
import { useGetWorkOrders } from "@/hooks/mantenimiento/planificacion/useGetWorkOrders";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import { Article, Batch } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Calendar } from "../../../ui/calendar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../../../ui/command";
import { Label } from "../../../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../../../ui/popover";
import { Textarea } from "../../../ui/textarea";
import { useGetDepartments } from "@/hooks/sistema/departamento/useGetDepartment";
import { useGetWarehousesEmployees } from "@/hooks/mantenimiento/almacen/empleados/useGetWarehousesEmployees";
import { useGetArticleConvertionById } from "@/hooks/mantenimiento/almacen/articulos/useGetArticlesConvertionsById";

const FormSchema = z.object({
  requested_by: z.string(),
  delivered_by: z.string(),
  submission_date: z.date({
    message: "Debe ingresar la fecha.",
  }),
  articles: z.object({
    article_id: z.coerce.number().min(1, "Debe seleccionar un artículo"),
    serial: z.string().nullable(),
    quantity: z.number().min(0.01, "La cantidad debe ser mayor a 0"),
    batch_id: z.number().min(1, "Debe seleccionar un lote"),
  }),
  justification: z.string({
    message: "Debe ingresar una justificación de la salida.",
  }),
  destination_place: z.string(),
  status: z.string(),
  unit: z.string().optional(),
});

type FormSchemaType = z.infer<typeof FormSchema>;

interface FormProps {
  onClose: () => void;
}

interface BatchesWithCountProp extends Batch {
  articles: Article[];
  batch_id: number;
}

export function ConsumableDispatchForm({ onClose }: FormProps) {
  const { user } = useAuth();

  const { selectedStation, selectedCompany } = useCompanyStore();

  const [open, setOpen] = useState(false);

  const [quantity, setQuantity] = useState("");

  const [resultQuantity, setResultQuantity] = useState("");

  const [articleSelected, setArticleSelected] = useState<Article | null>(null);

  const [articleError, setArticleError] = useState<string>("");

  const [maxInputQuantity, setMaxInputQuantity] = useState<number>(0);

  const { createDispatchRequest } = useCreateDispatchRequest();

  const { data: departments, isLoading: isDepartmentsLoading } =
    useGetDepartments(selectedCompany?.slug);

  const { data: batches, isPending: isBatchesLoading } =
    useGetBatchesWithInWarehouseArticles({
      location_id: Number(selectedStation!),
      company: selectedCompany!.slug,
      category: "consumible",
    });

  const { data: employees, isLoading: employeesLoading } =
    useGetWorkOrderEmployees({
      company: selectedCompany?.slug,
      location_id: selectedStation?.toString(),
      acronym: "MANP",
    });

  const {
    data: warehouseEmployees,
    isPending: warehouseEmployeesLoading,
    isError: employeesError,
  } = useGetWarehousesEmployees(selectedStation!, selectedCompany?.slug);

  const { data: articleConversion, isLoading: isConversionLoading } =
    useGetArticleConvertionById(
      articleSelected?.id?.toString() || null,
      selectedCompany?.slug
    );

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      justification: "",
      requested_by: `${user?.employee[0].dni}`,
      destination_place: "",
      status: "proceso",
      articles: {
        article_id: 0,
        serial: null,
        quantity: 0,
        batch_id: 0,
      },
    },
  });

  // Función para calcular la cantidad máxima permitida en el input - CORREGIDA
  const calculateMaxInputQuantity = (
    selectedUnit: string | undefined, // Cambiado a string | undefined
    availableStock: number
  ): number => {
    if (!articleConversion || !selectedUnit) return availableStock;

    // Buscar si el usuario seleccionó una unidad secundaria
    const selectedSecondaryUnit = articleConversion.find(
      (conv) => conv.secondary_unit?.label === selectedUnit
    );

    if (selectedSecondaryUnit) {
      // Para unidades secundarias, calcular cuántas unidades secundarias equivalen al stock disponible
      const conversionFactor =
        parseFloat(selectedSecondaryUnit.equivalence.toString()) || 1;
      return availableStock / conversionFactor;
    }

    // Para unidades primarias, el máximo es el stock disponible
    return availableStock;
  };

  // Efecto para calcular cantidad resultante, validar y establecer máximo permitido
  useEffect(() => {
    if (!articleSelected || !articleConversion) {
      setResultQuantity("");
      setMaxInputQuantity(0);
      return;
    }

    const selectedUnit = form.watch("unit");
    const currentQuantity = parseFloat(quantity) || 0;
    const availableStock = articleSelected.quantity || 0;

    // Calcular la cantidad máxima permitida en el input
    const calculatedMaxInput = calculateMaxInputQuantity(
      selectedUnit,
      availableStock
    );
    setMaxInputQuantity(calculatedMaxInput);

    let calculatedQuantity = currentQuantity;

    // Determinar qué tipo de unidad seleccionó
    if (selectedUnit) {
      const selectedSecondaryUnit = articleConversion.find(
        (conv) => conv.secondary_unit?.label === selectedUnit
      );

      const selectedPrimaryUnit = articleConversion.find(
        (conv) => conv.primary_unit.label === selectedUnit
      );

      if (selectedSecondaryUnit) {
        // El usuario seleccionó una unidad secundaria - APLICAR CONVERSIÓN
        const conversionFactor =
          parseFloat(selectedSecondaryUnit.equivalence.toString()) || 1;
        calculatedQuantity = currentQuantity * conversionFactor;
      } else if (selectedPrimaryUnit) {
        // El usuario seleccionó una unidad primaria - 1:1
        calculatedQuantity = currentQuantity;
      }
    }

    setResultQuantity(calculatedQuantity.toString());
    form.setValue("articles.quantity", calculatedQuantity);

    // VALIDACIÓN: La cantidad resultante NO puede ser mayor al stock disponible
    if (calculatedQuantity > availableStock) {
      form.setError("articles.quantity", {
        type: "manual",
        message: `No puede retirar más de ${availableStock} ${articleSelected.unit} disponibles. Cantidad resultante: ${calculatedQuantity.toFixed(2)}`,
      });
    } else {
      form.clearErrors("articles.quantity");
    }

    // Si la cantidad actual excede el máximo permitido, ajustarla automáticamente
    if (currentQuantity > calculatedMaxInput) {
      setQuantity(calculatedMaxInput.toString());
    }
  }, [quantity, form.watch("unit"), articleSelected, articleConversion, form]);

  // Modificar el handler del input de cantidad para validar y limitar
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = parseFloat(value) || 0;

    // Si no hay artículo seleccionado, no permitir entrada
    if (!articleSelected) {
      setQuantity("");
      return;
    }

    // Si no hay unidad seleccionada, limitar al stock disponible
    if (!form.watch("unit")) {
      const availableStock = articleSelected.quantity || 0;
      if (numericValue > availableStock) {
        setQuantity(availableStock.toString());
        return;
      }
    }

    // Aplicar límite basado en el máximo calculado
    if (maxInputQuantity > 0 && numericValue > maxInputQuantity) {
      setQuantity(maxInputQuantity.toString());
      return;
    }

    // Validación básica - no puede ser menor a 0
    if (numericValue < 0) {
      setQuantity("0");
      form.setError("articles.quantity", {
        type: "manual",
        message: `La cantidad no puede ser menor a 0`,
      });
      return;
    }

    setQuantity(value);
    form.clearErrors("articles.quantity");
  };

  // Handler para cuando se selecciona una unidad
  const handleUnitChange = (value: string) => {
    form.setValue("unit", value);

    // Cuando se cambia la unidad, recalcular y ajustar la cantidad si es necesario
    if (quantity && articleSelected) {
      const currentQuantity = parseFloat(quantity) || 0;
      const availableStock = articleSelected.quantity || 0;
      const calculatedMaxInput = calculateMaxInputQuantity(
        value,
        availableStock
      );

      if (currentQuantity > calculatedMaxInput) {
        setQuantity(calculatedMaxInput.toString());
      }
    }
  };

  const { setValue } = form;

  const onSubmit = async (data: FormSchemaType) => {
    // Validación final antes de enviar
    if (!articleSelected) {
      setArticleError("Debe seleccionar un artículo");
      return;
    }

    if (
      articleSelected &&
      data.articles.quantity > (articleSelected.quantity || 0)
    ) {
      form.setError("articles.quantity", {
        type: "manual",
        message: `No puede retirar más de ${articleSelected.quantity} ${articleSelected.unit} disponibles.`,
      });
      return;
    }

    const formattedData = {
      ...data,
      articles: [{ ...data.articles }],
      created_by: user!.username,
      submission_date: format(data.submission_date, "yyyy-MM-dd"),
      category: "consumible",
      status: "APROBADO",
      approved_by: user?.employee[0].dni,
      delivered_by: data.delivered_by,
      user_id: Number(user!.id),
    };

    await createDispatchRequest.mutateAsync({
      data: formattedData,
      company: selectedCompany!.slug,
    });
    onClose();
  };

  const handleArticleSelect = (
    id: number,
    serial: string | null,
    batch_id: number
  ) => {
    const selectedArticle = batches
      ?.flatMap((batch) => batch.articles)
      .find((article) => article.id === id);

    if (selectedArticle) {
      // Resetear estados
      setQuantity("");
      setResultQuantity("");
      setArticleError("");
      setMaxInputQuantity(0);
      form.setValue("unit", "");

      // Actualizar el estado del artículo seleccionado
      setValue("articles", {
        article_id: Number(id),
        serial: serial ? serial : null,
        quantity: 0,
        batch_id: Number(batch_id),
      });

      setArticleSelected(selectedArticle);
      form.clearErrors("articles.article_id");
    } else {
      setArticleSelected(null);
      setQuantity("");
      setResultQuantity("");
      setMaxInputQuantity(0);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col space-y-3 w-full"
      >
        <div className="grid grid-cols-2 gap-2">
          <FormField
            control={form.control}
            name="delivered_by"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Entregado por:</FormLabel>
                <Select onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione el responsable..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {warehouseEmployeesLoading && (
                      <Loader2 className="size-4 animate-spin" />
                    )}
                    {warehouseEmployees &&
                      warehouseEmployees.map((employee) => (
                        <SelectItem
                          key={employee.dni}
                          value={`${employee.dni}`}
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
            name="requested_by"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Recibe / MTTO</FormLabel>
                <Select onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione el responsable..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {employeesLoading && (
                      <Loader2 className="size-4 animate-spin" />
                    )}
                    {employees &&
                      employees.map((employee) => (
                        <SelectItem key={employee.id} value={`${employee.dni}`}>
                          {employee.first_name} {employee.last_name} -{" "}
                          {employee.job_title.name}
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
            name="submission_date"
            render={({ field }) => (
              <FormItem className="flex flex-col mt-2.5 w-full">
                <FormLabel>Fecha de Solicitud</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP", {
                            locale: es,
                          })
                        ) : (
                          <span>Seleccione una fecha...</span>
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
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                      locale={es}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="destination_place"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Destino</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {isDepartmentsLoading ? (
                      <div className="flex justify-center items-center p-4">
                        <Loader2 className="size-6 animate-spin" />
                      </div>
                    ) : (
                      departments &&
                      departments.map((department) => (
                        <SelectItem
                          key={department.id}
                          value={department.id.toString()}
                        >
                          {department.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="space-y-3">
          <div className="flex gap-2">
            <FormItem className="flex flex-col w-full">
              <FormLabel>Consumible a Retirar</FormLabel>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                  >
                    {articleSelected
                      ? `${articleSelected.part_number} (${articleSelected.quantity} ${articleSelected.unit} disponibles)`
                      : "Seleccionar el consumible"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0">
                  <Command>
                    <CommandInput placeholder="Buscar un consu..." />
                    <CommandList>
                      {isBatchesLoading ? (
                        <div className="flex items-center justify-center py-6">
                          <Loader2 className="size-4 animate-spin" />
                        </div>
                      ) : (
                        <>
                          <CommandEmpty>
                            No se han encontrado consumibles...
                          </CommandEmpty>
                          {batches?.map((batch) => (
                            <CommandGroup
                              key={batch.batch_id}
                              heading={batch.name}
                            >
                              {batch.articles.map((article) => (
                                <CommandItem
                                  key={article.id}
                                  onSelect={() => {
                                    handleArticleSelect(
                                      article.id!,
                                      article.serial ? article.serial : null,
                                      batch.batch_id
                                    );
                                    setArticleSelected(article);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      articleSelected?.id === article.id
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {article.part_number} - ({article.quantity}){" "}
                                  {article.unit}
                                  <p className="hidden">{article.id}</p>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          ))}
                        </>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {/* Mensaje de error personalizado */}
              {(articleError || form.formState.errors.articles?.article_id) && (
                <p className="text-sm font-medium text-destructive">
                  {articleError ||
                    form.formState.errors.articles?.article_id?.message}
                </p>
              )}
            </FormItem>
          </div>

          {/* SECCIÓN DE CANTIDAD Y CONVERSIÓN - MEJORADA PARA ALINEACIÓN VERTICAL */}
          <div className="grid grid-cols-3 gap-3 items-end">
            {/* CANTIDAD A RETIRAR */}
            <div className="flex flex-col space-y-2">
              <Label>
                Cantidad a Retirar
                {maxInputQuantity > 0 && (
                  <span className="text-xs text-muted-foreground ml-1">
                    (Máx: {maxInputQuantity.toFixed(2)})
                  </span>
                )}
              </Label>
              <Input
                disabled={!articleSelected}
                value={quantity}
                onChange={handleQuantityChange}
                placeholder="Ej: 1, 4, 6, etc..."
                type="number"
                min="0"
                max={maxInputQuantity}
                step="0.01"
              />
              {form.formState.errors.articles?.quantity && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.articles.quantity.message}
                </p>
              )}
            </div>

            {/* SELECT DE UNIDADES */}
            {articleSelected &&
              articleConversion &&
              articleConversion.length > 0 && (
                <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Unidad</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleUnitChange(value);
                        }}
                        value={field.value}
                        disabled={isConversionLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione unidad" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isConversionLoading && (
                            <div className="flex items-center justify-center p-2">
                              <Loader2 className="size-4 animate-spin" />
                            </div>
                          )}
                          {articleConversion.map((conversion) => (
                            <SelectItem
                              key={conversion.id}
                              value={
                                conversion.secondary_unit?.label ||
                                conversion.primary_unit.label
                              }
                            >
                              {conversion.secondary_unit?.label ||
                                conversion.primary_unit.label}
                              {conversion.secondary_unit && (
                                <span className="text-muted-foreground text-xs ml-1">
                                  (1 {conversion.secondary_unit.label} ={" "}
                                  {conversion.equivalence}{" "}
                                  {conversion.primary_unit.label})
                                </span>
                              )}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

            {/* CANTIDAD RESULTANTE */}
            {articleSelected &&
              articleConversion &&
              form.watch("unit") &&
              (() => {
                const selectedUnit = form.watch("unit");
                const isSecondaryUnit = articleConversion.some(
                  (conv) => conv.secondary_unit?.label === selectedUnit
                );
                return isSecondaryUnit;
              })() && (
                <div className="flex flex-col space-y-2">
                  <Label>Cantidad Resultante</Label>
                  <Input
                    disabled
                    value={resultQuantity}
                    placeholder="0"
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-muted-foreground">
                    Equivalente en {articleSelected.unit}
                  </p>
                </div>
              )}
          </div>

          {/* INFORMACIÓN DE STOCK DISPONIBLE */}
          {articleSelected && (
            <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Stock disponible:</strong> {articleSelected.quantity}{" "}
                {articleSelected.unit}
                {resultQuantity && (
                  <span className="ml-2">
                    | <strong>Cantidad a retirar:</strong>{" "}
                    {parseFloat(resultQuantity).toFixed(2)}{" "}
                    {articleSelected.unit}
                  </span>
                )}
                {maxInputQuantity > 0 && form.watch("unit") && (
                  <span className="ml-2">
                    | <strong>Máximo permitido:</strong>{" "}
                    {maxInputQuantity.toFixed(2)} {form.watch("unit")}
                  </span>
                )}
              </p>
            </div>
          )}

          <FormField
            control={form.control}
            name="justification"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Justificacion</FormLabel>
                <FormControl>
                  <Textarea
                    rows={5}
                    className="w-full"
                    placeholder="EJ: Se necesita para la limpieza de..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button
          className="bg-primary mt-2 text-white hover:bg-blue-900 disabled:bg-primary/70"
          disabled={
            createDispatchRequest?.isPending ||
            !!form.formState.errors.articles?.quantity ||
            !articleSelected
          }
          type="submit"
        >
          {createDispatchRequest?.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <p>Crear</p>
          )}
        </Button>
      </form>
    </Form>
  );
}
