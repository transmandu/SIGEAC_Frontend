"use client";

import { useCreateDispatchRequest } from "@/actions/mantenimiento/almacen/solicitudes/salida/action";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";

import { useAuth } from "@/contexts/AuthContext";
import { useCompanyStore } from "@/stores/CompanyStore";
import { cn } from "@/lib/utils";

import { useGetBatchesWithInWarehouseArticles } from "@/hooks/mantenimiento/almacen/renglones/useGetBatchesWithInWarehouseArticles";
import { useGetWarehousesEmployees } from "@/hooks/mantenimiento/almacen/empleados/useGetWarehousesEmployees";
import { useGetWorkOrderEmployees } from "@/hooks/mantenimiento/planificacion/useGetWorkOrderEmployees";
import { useGetMaintenanceAircrafts } from "@/hooks/mantenimiento/planificacion/useGetMaintenanceAircrafts";
import { useGetDepartments } from "@/hooks/sistema/departamento/useGetDepartment";

import type { Article, Batch } from "@/types";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  AlertCircle,
  Building2,
  CalendarIcon,
  Check,
  ChevronsUpDown,
  Loader2,
  Plane,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const FormSchema = z.object({
  requested_by: z.string({
    message: "Debe seleccionar quién recibe.",
  }),
  work_order: z.string(),
  submission_date: z.date({
    message: "Debe ingresar la fecha.",
  }),
  articles: z.array(
    z.object({
      article_id: z.coerce.number(),
      serial: z.string().nullable(),
      quantity: z.number(),
      batch_id: z.number(),
    }),
    {
      message: "Debe seleccionar el (los) artículos que se van a despachar.",
    }
  ),
  justification: z.string({
    message: "Debe ingresar una justificación de la salida.",
  }),
  destination_place: z.string({
    message: "Debe seleccionar un destino.",
  }),
  status: z.string(),
});

type FormSchemaType = z.infer<typeof FormSchema>;

interface FormProps {
  onClose: () => void;
}

interface BatchesWithCountProp extends Batch {
  articles: Article[];
  batch_id: number;
}

export function ComponentDispatchForm({ onClose }: FormProps) {
  const { user } = useAuth();
  const { selectedStation, selectedCompany } = useCompanyStore();

  const [open, setOpen] = useState(false);
  const [isDepartment, setIsDepartment] = useState(false);

  const [articleSelected, setArticleSelected] = useState<Article>();
  const [quantity, setQuantity] = useState("1");
  const [quantityError, setQuantityError] = useState<string>("");
  const [showAutoAdjustMessage, setShowAutoAdjustMessage] = useState(false);

  const { createDispatchRequest } = useCreateDispatchRequest();

  const { data: departments, isLoading: isDepartmentsLoading } = useGetDepartments(
    selectedCompany?.slug
  );

  const { data: aircrafts, isLoading: isAircraftsLoading } =
    useGetMaintenanceAircrafts(selectedCompany?.slug);

  const {
    data: batches,
    isPending: isBatchesLoading,
    isError: isBatchesError,
  } = useGetBatchesWithInWarehouseArticles({
    location_id: Number(selectedStation!),
    company: selectedCompany!.slug,
    category: "component",
  });

  const {
    data: employees,
    isLoading: employeesLoading,
    isError: employeesError,
  } = useGetWorkOrderEmployees({
    company: selectedCompany?.slug,
    location_id: selectedStation?.toString(),
    acronym: "MANP",
  });

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      articles: [],
      justification: "",
      requested_by: `${user?.employee?.[0]?.dni ?? ""}`,
      destination_place: "",
      status: "proceso",
    },
  });

  const { setValue } = form;

  // Cantidad máxima disponible (si el artículo maneja stock > 1)
  const getMaxQuantity = (): number => {
    return articleSelected?.quantity || 0;
  };

  const validateAndAdjustQuantity = (value: string): string => {
    if (!articleSelected) return value;

    const numericValue = parseFloat(value) || 0;
    const maxQuantity = getMaxQuantity();

    if (numericValue <= 0) {
      setQuantityError("La cantidad debe ser mayor a 0");
      return value;
    }

    if (maxQuantity > 0 && numericValue > maxQuantity) {
      setQuantityError(
        `Se ajustó a la cantidad máxima disponible: ${maxQuantity} ${articleSelected.unit}`
      );
      setShowAutoAdjustMessage(true);
      setTimeout(() => setShowAutoAdjustMessage(false), 3000);
      return maxQuantity.toString();
    }

    setQuantityError("");
    setShowAutoAdjustMessage(false);
    return value;
  };

  const setToMaxQuantity = () => {
    const maxQuantity = getMaxQuantity();
    if (!articleSelected) return;

    const next = (maxQuantity || 1).toString();
    setQuantity(next);
    setQuantityError("");
    setShowAutoAdjustMessage(false);

    // Mantener el array (1 solo elemento)
    if (form.getValues("articles")?.length) {
      setValue("articles.0.quantity", parseFloat(next) || 0);
    }
  };

  // Limpiar destino cuando cambia el tipo
  useEffect(() => {
    setValue("destination_place", "");
  }, [isDepartment, setValue]);

  // Reset al cambiar artículo
  useEffect(() => {
    setQuantity("1");
    setQuantityError("");
    setShowAutoAdjustMessage(false);
  }, [articleSelected]);

  // Sincroniza cantidad con RHF
  useEffect(() => {
    if (!articleSelected) return;
    if (!form.getValues("articles")?.length) return;

    const q = parseFloat(quantity) || 0;
    setValue("articles.0.quantity", q);
  }, [quantity, articleSelected, form, setValue]);

  const handleArticleSelect = (id: number, serial: string | null, batch_id: number) => {
    const selected = batches
      ?.flatMap((batch: BatchesWithCountProp) => batch.articles)
      .find((article) => article.id === id);

    if (!selected) return;

    setValue("articles", [
      {
        article_id: Number(id),
        serial: serial ? serial : null,
        quantity: 1,
        batch_id: Number(batch_id),
      },
    ]);

    setArticleSelected(selected);
    setQuantity("1");
    setQuantityError("");
    setShowAutoAdjustMessage(false);
    setOpen(false);
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const adjusted = validateAndAdjustQuantity(value);
    setQuantity(adjusted);
  };

  const onSubmit = async (data: FormSchemaType) => {
    // Validación final (si aplica stock numérico)
    if (articleSelected) {
      const maxQuantity = getMaxQuantity();
      const q = data.articles?.[0]?.quantity ?? 0;

      if (maxQuantity > 0 && q > maxQuantity) {
        setQuantityError(
          `No puede retirar más de ${maxQuantity} ${articleSelected.unit} disponibles`
        );
        return;
      }
    }

    if (quantityError && !showAutoAdjustMessage) return;

    const formattedData = {
      ...data,
      created_by: `${user?.employee?.[0]?.dni ?? ""}`,
      delivered_by: `${user?.employee?.[0]?.dni ?? ""}`,
      submission_date: format(data.submission_date, "yyyy-MM-dd"),
      category: "componente",
      isDepartment: isDepartment,
      aircraft_id: isDepartment ? null : data.destination_place,
    };

    await createDispatchRequest.mutateAsync({
      data: {
        ...formattedData,
        user_id: Number(user!.id),
      },
      company: selectedCompany!.slug,
    });

    onClose();
  };

  const hasSelectedArticle = !!form.watch("articles")?.length;

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
            <div className="flex flex-col gap-2 mt-1">
              <Label className="text-sm font-medium">Entregado por:</Label>
              <Input disabled value={`${user?.first_name} ${user?.last_name}`}/>
            </div>
            <FormField
              control={form.control}
              name="requested_by"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Recibe / MTTO</FormLabel>
                  <Select onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Seleccione el responsable..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {employeesLoading && (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="size-4 animate-spin text-muted-foreground" />
                        </div>
                      )}
                      {!employeesLoading && employeesError && (
                        <div className="py-4 text-center text-sm text-muted-foreground">
                          Error al cargar empleados
                        </div>
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
              name="work_order"
              render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                        Ord. de Trabajo
                      </FormLabel>
                    <FormControl>
                      <Input
                        className="w-full resize-none"
                        placeholder="Ej: Se necesita para la limpieza de equipos de mantenimiento..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
            />
            <FormField
              control={form.control}
              name="submission_date"
              render={({ field }) => (
                <FormItem className="flex flex-col mt-1">
                  <FormLabel className="text-sm font-medium">Fecha de Solicitud</FormLabel>
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
                            format(field.value, "PPP", { locale: es })
                          ) : (
                            <span>Seleccione...</span>
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

            <div className="flex flex-col gap-3 lg:col-span-2">
              <FormField
                control={form.control}
                name="destination_place"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <div className="flex items-center justify-between mb-2 gap-2 col-span-2 w-full">
                      <FormLabel className="text-sm font-medium flex items-center gap-2">
                        {isDepartment ? (
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Plane className="h-4 w-4 text-muted-foreground" />
                        )}
                        Destino
                      </FormLabel>

                      <div className="flex items-center gap-1">
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
                          className="text-xs text-center font-medium leading-none cursor-pointer text-muted-foreground"
                        >
                          ¿Es para un departamento?
                        </label>
                      </div>
                    </div>

                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isDepartment ? isDepartmentsLoading : isAircraftsLoading}
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
                            {isDepartmentsLoading && (
                              <div className="flex items-center justify-center py-4">
                                <Loader2 className="size-4 animate-spin text-muted-foreground" />
                              </div>
                            )}
                            {!isDepartmentsLoading &&
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
                                  {aircraft.acronym} - {aircraft.manufacturer.name}
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
            <div className="lg:col-span-2">
              <FormField
                control={form.control}
                name="articles"
                render={() => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-sm font-medium">Componente a Retirar</FormLabel>

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
                              <span className="text-muted-foreground">Cargando...</span>
                            </>
                          ) : articleSelected ? (
                            <span className="truncate">
                              {articleSelected.serial ?? articleSelected.part_number}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">
                              Seleccione el componente...
                            </span>
                          )}

                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>

                      <PopoverContent className="w-full p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Buscar por serial o número de parte..." />
                          <CommandList>
                            {isBatchesLoading ? (
                              <div className="flex items-center justify-center py-6">
                                <Loader2 className="size-4 animate-spin" />
                              </div>
                            ) : isBatchesError ? (
                              <div className="py-4 text-center text-sm text-muted-foreground">
                                Error al cargar componentes
                              </div>
                            ) : (
                              <>
                                <CommandEmpty>No se han encontrado componentes...</CommandEmpty>

                                {batches?.map((batch: BatchesWithCountProp) => (
                                  <CommandGroup
                                    key={batch.batch_id}
                                    heading={batch.name}
                                  >
                                    {batch.articles.map((article) => (
                                      <CommandItem
                                        key={article.id}
                                        onSelect={() =>
                                          handleArticleSelect(
                                            article.id!,
                                            article?.serial ?? null,
                                            batch.batch_id
                                          )
                                        }
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
                                            {article.serial ?? "Sin serial"}
                                          </span>
                                          <span className="text-xs text-muted-foreground">
                                            {article.part_number}
                                            {typeof article.quantity === "number"
                                              ? ` • Disponible: ${article.quantity} ${article.unit}`
                                              : ""}
                                          </span>
                                        </div>
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

            {/* Cantidad (para componentes con stock > 1; si siempre es serial único, igual queda coherente) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Cantidad a Retirar</Label>
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
                  step="1"
                  max={articleSelected?.quantity || undefined}
                  disabled={!articleSelected || !hasSelectedArticle}
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
                    Disponible: {articleSelected.quantity} {articleSelected.unit}
                  </p>
                )}

                {quantityError && (
                  <div
                    className={cn(
                      "flex items-center gap-1 text-xs",
                      showAutoAdjustMessage ? "text-amber-600" : "text-destructive"
                    )}
                  >
                    <AlertCircle className="h-3 w-3" />
                    {quantityError}
                  </div>
                )}
              </div>
            </div>
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
                    placeholder="Ej: Se requiere para mantenimiento preventivo..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator className="my-2" />

        {/* Botones */}
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
            className="bg-primary text-white hover:bg-primary/90 disabled:bg-primary/70 min-w-[140px] h-10"
            disabled={
              createDispatchRequest?.isPending ||
              !hasSelectedArticle ||
              (!showAutoAdjustMessage && !!quantityError) ||
              !quantity ||
              parseFloat(quantity) <= 0 ||
              !form.getValues("requested_by") ||
              !form.getValues("destination_place") ||
              !form.getValues("submission_date")
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
