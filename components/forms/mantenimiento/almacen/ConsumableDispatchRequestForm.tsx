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
import {
  CalendarIcon,
  Check,
  ChevronsUpDown,
  Loader2,
  Calculator,
  AlertCircle,
} from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useGetMaintenanceAircrafts } from "@/hooks/mantenimiento/planificacion/useGetMaintenanceAircrafts";
import { Separator } from "@/components/ui/separator";
import { Building2, Plane } from "lucide-react";
import { useGetConversionByConsmable } from "@/hooks/mantenimiento/almacen/articulos/useGetConvertionsByConsumableId";

const FormSchema = z.object({
  requested_by: z.string(),
  delivered_by: z.string(),
  submission_date: z.date({
    message: "Debe ingresar la fecha.",
  }),
  articles: z.object({
    article_id: z.coerce.number(),
    serial: z.string().nullable(),
    quantity: z.number(),
    batch_id: z.number(),
  }),
  justification: z.string({
    message: "Debe ingresar una justificación de la salida.",
  }),
  destination_place: z.string(),
  status: z.string(),
  unit: z
    .enum(["litros", "mililitros"], {
      message: "Debe seleccionar una unidad.",
    })
    .optional(),
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
  const [articleSelected, setArticleSelected] = useState<Article>();
  const [isDepartment, setIsDepartment] = useState(false);
  const [quantityError, setQuantityError] = useState<string>("");
  const [showAutoAdjustMessage, setShowAutoAdjustMessage] = useState(false);

  // Nuevos estados para conversiones
  const [selectedConversion, setSelectedConversion] = useState<any>(null);
  const [convertedQuantity, setConvertedQuantity] = useState<number>(0);
  const [showConversion, setShowConversion] = useState(false);
  const [conversionInput, setConversionInput] = useState("");

  const { createDispatchRequest } = useCreateDispatchRequest();

  const { data: departments, isLoading: isDepartmentsLo } = useGetDepartments(
    selectedCompany?.slug
  );

  const { data: aircrafts, isLoading: isAircraftsLoading } =
    useGetMaintenanceAircrafts(selectedCompany?.slug);

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
  } = useGetWarehousesEmployees(selectedCompany?.slug, selectedStation);

  const {
    data: consumableConversion,
    isLoading: isConversionLoading,
    isError: conversionError,
  } = useGetConversionByConsmable(
    articleSelected?.id ?? null,
    selectedCompany?.slug
  );

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      justification: "",
      requested_by: `${user?.employee[0].dni}`,
      destination_place: "",
      status: "proceso",
    },
  });

  // Función para obtener la cantidad máxima disponible
  const getMaxQuantity = (): number => {
    return articleSelected?.quantity || 0;
  };

  // Función para validar y ajustar automáticamente la cantidad
  const validateAndAdjustQuantity = (value: string): string => {
    if (!articleSelected) return value;

    const numericValue = parseFloat(value) || 0;
    const maxQuantity = getMaxQuantity();

    if (numericValue <= 0) {
      setQuantityError("La cantidad debe ser mayor a 0");
      return value;
    }

    if (numericValue > maxQuantity) {
      // Ajustar automáticamente al máximo disponible
      setQuantityError(
        `Se ajustó a la cantidad máxima disponible: ${maxQuantity} ${articleSelected.unit}`
      );
      setShowAutoAdjustMessage(true);
      // Ocultar el mensaje después de 3 segundos
      setTimeout(() => setShowAutoAdjustMessage(false), 3000);
      return maxQuantity.toString();
    }

    setQuantityError("");
    setShowAutoAdjustMessage(false);
    return value;
  };

  // Función para aplicar la conversión al input de cantidad
  // Función para aplicar la conversión al input de cantidad
  const applyConversion = () => {
    if (
      selectedConversion &&
      conversionInput &&
      consumableConversion &&
      consumableConversion.length > 0
    ) {
      const inputValue = parseFloat(conversionInput) || 0;
      const result = inputValue / selectedConversion.equivalence;
      const maxQuantity = getMaxQuantity();

      let finalQuantity = result;
      let shouldShowAdjustMessage = false;

      // Si el resultado excede la cantidad máxima, ajustar automáticamente
      if (result > maxQuantity) {
        finalQuantity = maxQuantity;
        shouldShowAdjustMessage = true;
        setQuantityError(
          `Se ajustó a la cantidad máxima disponible: ${maxQuantity} ${articleSelected?.unit}`
        );
        setShowAutoAdjustMessage(true);
        setTimeout(() => setShowAutoAdjustMessage(false), 3000);
      } else {
        setQuantityError("");
        setShowAutoAdjustMessage(false);
      }

      setConvertedQuantity(result);
      setQuantity(finalQuantity.toString());
      form.setValue("articles.quantity", finalQuantity);

      // Si se ajustó automáticamente, mostrar el resultado de la conversión original
      if (shouldShowAdjustMessage) {
        const unitSecondaryLabel =
          consumableConversion[0]?.unit_secondary?.label || "unidades";
        setQuantityError(
          `Conversión: ${conversionInput} ${selectedConversion.unit_primary.label} = ${result.toFixed(6)} ${unitSecondaryLabel}. Se ajustó al máximo disponible.`
        );
      }

      setShowConversion(false);
      setConversionInput("");
    } else {
      // Manejar el caso donde no hay conversiones disponibles
      setQuantityError("No hay conversiones disponibles para aplicar");
    }
  };

  // Efecto para manejar cantidad cuando no hay conversiones
  useEffect(() => {
    if (quantity) {
      const quantityValue = parseFloat(quantity) || 0;
      form.setValue("articles.quantity", quantityValue);
    }
  }, [quantity, form, articleSelected]);

  // Efecto para resetear la conversión cuando cambia el artículo
  useEffect(() => {
    setSelectedConversion(null);
    setConvertedQuantity(0);
    setShowConversion(false);
    setConversionInput("");
    setQuantityError("");
    setQuantity("");
    setShowAutoAdjustMessage(false);
  }, [articleSelected]);

  // Limpiar destination_place cuando cambia el tipo de destino
  useEffect(() => {
    form.setValue("destination_place", "");
  }, [isDepartment, form]);

  const { setValue } = form;

  const onSubmit = async (data: FormSchemaType) => {
    // Validación final antes de enviar
    if (
      articleSelected &&
      data.articles.quantity > (articleSelected.quantity || 0)
    ) {
      setQuantityError(
        `No puede retirar más de ${articleSelected.quantity} ${articleSelected.unit} disponibles`
      );
      return;
    }

    if (quantityError && !showAutoAdjustMessage) {
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
      if (selectedArticle.unit === "u") {
        form.setValue("unit", undefined);
      } else {
        form.setValue("unit", "litros");
      }

      setValue("articles", {
        article_id: Number(id),
        serial: serial ? serial : null,
        quantity: 0,
        batch_id: Number(batch_id),
      });

      setArticleSelected(selectedArticle);
      setQuantityError("");
      setQuantity("");
      setShowAutoAdjustMessage(false);
    }
  };

  // Función para manejar cambio en el input de cantidad
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const adjustedValue = validateAndAdjustQuantity(value);
    setQuantity(adjustedValue);
  };

  // Función para establecer la cantidad máxima
  const setToMaxQuantity = () => {
    const maxQuantity = getMaxQuantity();
    setQuantity(maxQuantity.toString());
    setQuantityError("");
    setShowAutoAdjustMessage(false);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col space-y-6 w-full"
      >
        {/* Sección: Personal Responsable */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="h-px flex-1 bg-border/60"></div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2">
              Personal Responsable
            </span>
            <div className="h-px flex-1 bg-border/60"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="delivered_by"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Entregado por:
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    disabled={warehouseEmployeesLoading || !selectedStation}
                  >
                    <FormControl>
                      <SelectTrigger className="h-10">
                        <SelectValue
                          placeholder={
                            warehouseEmployeesLoading
                              ? "Cargando..."
                              : !selectedStation
                                ? "Seleccione una estación primero"
                                : "Seleccione el responsable..."
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {warehouseEmployeesLoading && (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="size-4 animate-spin text-muted-foreground" />
                        </div>
                      )}
                      {!warehouseEmployeesLoading && employeesError && (
                        <div className="py-4 text-center text-sm text-muted-foreground">
                          Error al cargar empleados
                        </div>
                      )}
                      {!warehouseEmployeesLoading &&
                        !employeesError &&
                        warehouseEmployees &&
                        warehouseEmployees.length === 0 && (
                          <div className="py-4 text-center text-sm text-muted-foreground">
                            No hay empleados de almacén disponibles
                          </div>
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
                  <FormLabel className="text-sm font-medium">
                    Recibe / MTTO
                  </FormLabel>
                  <Select onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Seleccione el responsable..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {employeesLoading && (
                        <Loader2 className="size-4 animate-spin" />
                      )}
                      {employees &&
                        employees.map((employee) => (
                          <SelectItem
                            key={employee.id}
                            value={`${employee.dni}`}
                          >
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
          </div>
        </div>

        {/* Sección: Información de la Solicitud */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="h-px flex-1 bg-border/60"></div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2">
              Información de la Solicitud
            </span>
            <div className="h-px flex-1 bg-border/60"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="submission_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-sm font-medium">
                    Fecha de Solicitud
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "h-10 w-full pl-3 text-left font-normal",
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
            <div className="flex flex-col gap-3">
              <FormField
                control={form.control}
                name="destination_place"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between mb-2">
                      <FormLabel className="text-sm font-medium flex items-center gap-2">
                        {isDepartment ? (
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Plane className="h-4 w-4 text-muted-foreground" />
                        )}
                        Destino
                      </FormLabel>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="is-department"
                          checked={isDepartment}
                          onCheckedChange={(checked) =>
                            setIsDepartment(checked as boolean)
                          }
                          className="h-4 w-4"
                        />
                        <label
                          htmlFor="is-department"
                          className="text-xs font-medium leading-none cursor-pointer text-muted-foreground"
                        >
                          ¿Es para un departamento?
                        </label>
                      </div>
                    </div>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={
                        isDepartment ? isDepartmentsLo : isAircraftsLoading
                      }
                    >
                      <FormControl>
                        <SelectTrigger className="h-10">
                          <SelectValue
                            placeholder={
                              isDepartment
                                ? "Seleccione un departamento..."
                                : "Seleccione una aeronave..."
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isDepartment ? (
                          <>
                            {isDepartmentsLo && (
                              <div className="flex items-center justify-center py-4">
                                <Loader2 className="size-4 animate-spin text-muted-foreground" />
                              </div>
                            )}
                            {!isDepartmentsLo &&
                              departments &&
                              departments.length === 0 && (
                                <div className="py-4 text-center text-sm text-muted-foreground">
                                  No hay departamentos disponibles
                                </div>
                              )}
                            {departments &&
                              departments.map((department) => (
                                <SelectItem
                                  key={department.id}
                                  value={department.id.toString()}
                                >
                                  {department.name}
                                </SelectItem>
                              ))}
                          </>
                        ) : (
                          <>
                            {isAircraftsLoading && (
                              <div className="flex items-center justify-center py-4">
                                <Loader2 className="size-4 animate-spin text-muted-foreground" />
                              </div>
                            )}
                            {!isAircraftsLoading &&
                              aircrafts &&
                              aircrafts.length === 0 && (
                                <div className="py-4 text-center text-sm text-muted-foreground">
                                  No hay aeronaves disponibles
                                </div>
                              )}
                            {aircrafts &&
                              aircrafts.map((aircraft) => (
                                <SelectItem
                                  key={aircraft.id}
                                  value={aircraft.id.toString()}
                                >
                                  {aircraft.acronym} -{" "}
                                  {aircraft.manufacturer.name}
                                </SelectItem>
                              ))}
                          </>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        {/* Sección: Artículo a Retirar */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="h-px flex-1 bg-border/60"></div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2">
              Artículo a Retirar
            </span>
            <div className="h-px flex-1 bg-border/60"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-end">
            {/* Selector de Artículo */}
            <div className="lg:col-span-2">
              <FormField
                control={form.control}
                name="articles"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-sm font-medium">
                      Consumible a Retirar
                    </FormLabel>
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={open}
                          className="w-full justify-between h-10"
                          disabled={isBatchesLoading}
                        >
                          {isBatchesLoading ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              <span className="text-muted-foreground">
                                Cargando...
                              </span>
                            </>
                          ) : articleSelected ? (
                            <span className="truncate">
                              {articleSelected.part_number}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">
                              Seleccione el consumible...
                            </span>
                          )}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Buscar por número de parte o descripción..." />
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
                                            article.serial
                                              ? article.serial
                                              : null,
                                            batch.batch_id
                                          );
                                          setArticleSelected(article);
                                        }}
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4 shrink-0",
                                            articleSelected?.id === article.id
                                              ? "opacity-100"
                                              : "opacity-0"
                                          )}
                                        />
                                        <div className="flex flex-col flex-1 min-w-0">
                                          <span className="font-medium truncate">
                                            {article.part_number}
                                          </span>
                                          <span className="text-xs text-muted-foreground">
                                            Disponible: {article.quantity}{" "}
                                            {article.unit}
                                          </span>
                                        </div>
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
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Botón de Conversión */}
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex items-center gap-2 h-10"
                onClick={() => setShowConversion(!showConversion)}
                disabled={
                  !articleSelected ||
                  articleSelected.unit === "u" ||
                  !consumableConversion ||
                  consumableConversion.length === 0
                }
              >
                <Calculator className="h-4 w-4" />
                {showConversion ? "Ocultar Conversión" : "Mostrar Conversión"}
              </Button>
            </div>
          </div>

          {/* Input de Cantidad */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  Cantidad a Retirar
                </Label>
                {articleSelected && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={setToMaxQuantity}
                    className="h-7 text-xs text-primary hover:text-primary"
                  >
                    Usar máximo disponible
                  </Button>
                )}
              </div>
              <div className="space-y-1">
                <Input
                  type="text"
                  min="0"
                  step="0.001"
                  max={articleSelected?.quantity || undefined}
                  disabled={!articleSelected}
                  value={quantity}
                  onChange={handleQuantityChange}
                  placeholder={
                    articleSelected
                      ? `Máx: ${articleSelected.quantity} ${articleSelected.unit}`
                      : "Ingrese la cantidad..."
                  }
                  className={cn(
                    "h-10",
                    quantityError &&
                      !showAutoAdjustMessage &&
                      "border-destructive focus-visible:ring-destructive",
                    showAutoAdjustMessage &&
                      "border-amber-500 focus-visible:ring-amber-500"
                  )}
                />
                {articleSelected && !quantityError && (
                  <p className="text-xs text-muted-foreground">
                    Disponible: {articleSelected.quantity}{" "}
                    {articleSelected.unit}
                  </p>
                )}
                {quantityError && (
                  <div
                    className={cn(
                      "flex items-center gap-1 text-xs",
                      showAutoAdjustMessage
                        ? "text-amber-600"
                        : "text-destructive"
                    )}
                  >
                    <AlertCircle className="h-3 w-3" />
                    {quantityError}
                  </div>
                )}
              </div>
            </div>

            {/* Sección de Conversión - Solo mostrar si está activa */}
            {showConversion &&
              articleSelected &&
              articleSelected.unit !== "u" &&
              consumableConversion &&
              consumableConversion.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Conversión de Unidades
                  </Label>
                  <div className="flex gap-2">
                    <Select
                      value={selectedConversion?.id?.toString() || ""}
                      onValueChange={(value) => {
                        const conversion = consumableConversion.find(
                          (conv: any) => conv.id.toString() === value
                        );
                        setSelectedConversion(conversion || null);
                        setConversionInput("");
                      }}
                      disabled={isConversionLoading}
                    >
                      <SelectTrigger className="h-10 flex-1">
                        <SelectValue
                          placeholder={
                            isConversionLoading
                              ? "Cargando..."
                              : "Seleccione unidad"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {consumableConversion.map((conversion: any) => (
                          <SelectItem
                            key={conversion.id}
                            value={conversion.id.toString()}
                          >
                            {conversion.unit_primary.label} (
                            {conversion.unit_primary.value})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Cantidad"
                      value={conversionInput}
                      onChange={(e) => setConversionInput(e.target.value)}
                      className="h-10 w-24"
                      disabled={!selectedConversion}
                    />
                    <Button
                      type="button"
                      size="sm"
                      className="h-10"
                      onClick={applyConversion}
                      disabled={!selectedConversion || !conversionInput}
                    >
                      Aplicar
                    </Button>
                  </div>
                  {selectedConversion && conversionInput && (
                    <p className="text-xs text-muted-foreground">
                      {conversionInput} {selectedConversion.unit_primary.label}{" "}
                      =
                      {(
                        parseFloat(conversionInput) /
                        selectedConversion.equivalence
                      ).toFixed(6)}{" "}
                      {consumableConversion?.[0]?.unit_secondary?.label ||
                        "unidades"}
                    </p>
                  )}
                </div>
              )}
          </div>
        </div>

        {/* Sección: Justificación */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="h-px flex-1 bg-border/60"></div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2">
              Justificación
            </span>
            <div className="h-px flex-1 bg-border/60"></div>
          </div>
          <FormField
            control={form.control}
            name="justification"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    rows={4}
                    className="w-full resize-none"
                    placeholder="Ej: Se necesita para la limpieza de equipos de mantenimiento..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator className="my-2" />

        {/* Botones de acción */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={createDispatchRequest?.isPending}
            className="min-w-[100px] h-10"
          >
            Cancelar
          </Button>
          <Button
            className="bg-primary text-white hover:bg-primary/90 disabled:bg-primary/70 min-w-[120px] h-10"
            disabled={
              createDispatchRequest?.isPending ||
              (!showAutoAdjustMessage && !!quantityError) ||
              !quantity ||
              parseFloat(quantity) <= 0
            }
            type="submit"
          >
            {createDispatchRequest?.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2" />
                Creando...
              </>
            ) : (
              "Crear Salida"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
