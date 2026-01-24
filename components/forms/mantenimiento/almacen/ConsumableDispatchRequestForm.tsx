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
import { useAuth } from "@/contexts/AuthContext";
import { useGetConversionByConsmable } from "@/hooks/mantenimiento/almacen/articulos/useGetConvertionsByConsumableId";
import { useGetWarehousesEmployees } from "@/hooks/mantenimiento/almacen/empleados/useGetWarehousesEmployees";
import { useGetBatchesWithInWarehouseArticles } from "@/hooks/mantenimiento/almacen/renglones/useGetBatchesWithInWarehouseArticles";
import { useGetMaintenanceAircrafts } from "@/hooks/mantenimiento/planificacion/useGetMaintenanceAircrafts";
import { useGetWorkOrderEmployees } from "@/hooks/mantenimiento/planificacion/useGetWorkOrderEmployees";
import { useGetDepartments } from "@/hooks/sistema/departamento/useGetDepartment";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
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
  Calculator,
  Loader2,
  Plane,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
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

const ArticleSchema = z.object({
  article_id: z.coerce.number(),
  serial: z.string().nullable(),
  quantity: z.number(),
  batch_id: z.number(),
});

const FormSchema = z.object({
  work_order: z.string(),
  requested_by: z.string(),
  submission_date: z.date({ message: "Debe ingresar la fecha." }),
  articles: z.array(ArticleSchema).min(1, {
    message: "Debe seleccionar al menos un consumible.",
  }),
  justification: z.string({
    message: "Debe ingresar una justificación de la salida.",
  }),
  destination_place: z.string(),
  status: z.string(),
  unit: z
    .enum(["litros", "mililitros"], { message: "Debe seleccionar una unidad." })
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

  const [openAdd, setOpenAdd] = useState(false);
  const [isDepartment, setIsDepartment] = useState(false);

  // Estados por renglón (key = field.id) para no romper al reordenar/remover
  const [qtyByKey, setQtyByKey] = useState<Record<string, string>>({});
  const [qtyErrorByKey, setQtyErrorByKey] = useState<Record<string, string>>({});
  const [autoAdjustByKey, setAutoAdjustByKey] = useState<Record<string, boolean>>(
    {}
  );

  // Conversión: una sola fila activa para mantener UI/queries minimalistas
  const [conversionRowKey, setConversionRowKey] = useState<string | null>(null);
  const [conversionRowIndex, setConversionRowIndex] = useState<number | null>(null);
  const [conversionArticleId, setConversionArticleId] = useState<number | null>(null);
  const [selectedConversion, setSelectedConversion] = useState<any>(null);
  const [conversionInput, setConversionInput] = useState("");

  const { createDispatchRequest } = useCreateDispatchRequest();

  const { data: departments, isLoading: isDepartmentsLoading } = useGetDepartments(
    selectedCompany?.slug
  );

  const { data: aircrafts, isLoading: isAircraftsLoading } =
    useGetMaintenanceAircrafts(selectedCompany?.slug);

  const { data: batches, isPending: isBatchesLoading } =
    useGetBatchesWithInWarehouseArticles({
      location_id: Number(selectedStation!),
      company: selectedCompany!.slug,
      category: "consumable",
    });

  const { data: employees, isLoading: employeesLoading } = useGetWorkOrderEmployees({
    company: selectedCompany?.slug,
    location_id: selectedStation?.toString(),
    acronym: "MANP",
  });

  const {
    data: warehouseEmployees,
    isPending: warehouseEmployeesLoading,
    isError: employeesError,
  } = useGetWarehousesEmployees(selectedCompany?.slug, selectedStation);

  // Conversión solo para la fila activa (no por cada item)
  const {
    data: consumableConversion,
    isLoading: isConversionLoading,
  } = useGetConversionByConsmable(conversionArticleId ?? null, selectedCompany?.slug);

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      work_order: "",
      justification: "",
      requested_by: `${user?.employee?.[0]?.dni ?? ""}`,
      destination_place: "",
      status: "proceso",
      articles: [],
    },
  });

  const { control, setValue, getValues } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "articles",
  });

  const articleById = useMemo(() => {
    const map = new Map<number, Article>();
    batches?.forEach((b: BatchesWithCountProp) => {
      b.articles?.forEach((a) => {
        if (a?.id != null) map.set(a.id, a);
      });
    });
    return map;
  }, [batches]);

  // Limpia destino cuando cambie el tipo
  useEffect(() => {
    setValue("destination_place", "");
  }, [isDepartment, setValue]);

  // Helper: máximo disponible para un article_id
  const getMaxQuantity = (articleId: number): number => {
    return articleById.get(articleId)?.quantity || 0;
  };

  const setAutoAdjust = (key: string, value: boolean) => {
    setAutoAdjustByKey((prev) => ({ ...prev, [key]: value }));
    if (value) {
      setTimeout(() => {
        setAutoAdjustByKey((prev) => ({ ...prev, [key]: false }));
      }, 3000);
    }
  };

  const validateAndAdjustQuantity = (
    key: string,
    articleId: number,
    rawValue: string
  ): string => {
    const numericValue = parseFloat(rawValue) || 0;
    const maxQuantity = getMaxQuantity(articleId);

    if (numericValue <= 0) {
      setQtyErrorByKey((prev) => ({ ...prev, [key]: "La cantidad debe ser mayor a 0" }));
      setAutoAdjustByKey((prev) => ({ ...prev, [key]: false }));
      return rawValue;
    }

    if (maxQuantity > 0 && numericValue > maxQuantity) {
      setQtyErrorByKey((prev) => ({
        ...prev,
        [key]: `Se ajustó a la cantidad máxima disponible: ${maxQuantity}`,
      }));
      setAutoAdjust(key, true);
      return maxQuantity.toString();
    }

    setQtyErrorByKey((prev) => ({ ...prev, [key]: "" }));
    setAutoAdjustByKey((prev) => ({ ...prev, [key]: false }));
    return rawValue;
  };

  const syncQuantityToForm = (index: number, value: string) => {
    const q = parseFloat(value) || 0;
    setValue(`articles.${index}.quantity`, q);
  };

  const handleAddConsumable = (article: Article, batch_id: number) => {
    const current = getValues("articles");

    // Evitar duplicados exactos (mismo article + batch) para mantener UI simple
    const exists = current.some(
      (x) => x.article_id === Number(article.id) && x.batch_id === Number(batch_id)
    );
    if (exists) {
      setOpenAdd(false);
      return;
    }

    append({
      article_id: Number(article.id),
      serial: article.serial ? article.serial : null,
      quantity: 0,
      batch_id: Number(batch_id),
    });

    // unidad global (mantiene tu comportamiento: si no es "u", default litros)
    if (article.unit !== "u") setValue("unit", "litros");
    setOpenAdd(false);
  };

  const handleRemoveRow = (index: number, key: string) => {
    remove(index);

    setQtyByKey((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setQtyErrorByKey((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setAutoAdjustByKey((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });

    // si removiste la fila con conversión activa, cerrar panel
    if (conversionRowKey === key) {
      setConversionRowKey(null);
      setConversionRowIndex(null);
      setConversionArticleId(null);
      setSelectedConversion(null);
      setConversionInput("");
    }
  };

  const setToMaxQuantity = (index: number, key: string, articleId: number) => {
    const max = getMaxQuantity(articleId);
    const next = max > 0 ? max.toString() : "0";
    setQtyByKey((prev) => ({ ...prev, [key]: next }));
    setQtyErrorByKey((prev) => ({ ...prev, [key]: "" }));
    setAutoAdjustByKey((prev) => ({ ...prev, [key]: false }));
    syncQuantityToForm(index, next);
  };

  const openConversionForRow = (index: number, key: string, articleId: number) => {
    setConversionRowKey(key);
    setConversionRowIndex(index);
    setConversionArticleId(articleId);
    setSelectedConversion(null);
    setConversionInput("");
  };

  const applyConversion = () => {
    if (
      conversionRowIndex == null ||
      conversionRowKey == null ||
      conversionArticleId == null
    )
      return;

    if (!selectedConversion || !conversionInput) return;

    const inputValue = parseFloat(conversionInput) || 0;
    const result = inputValue / selectedConversion.equivalence;

    const max = getMaxQuantity(conversionArticleId);
    let finalQuantity = result;

    if (max > 0 && result > max) {
      finalQuantity = max;
      setQtyErrorByKey((prev) => ({
        ...prev,
        [conversionRowKey]:
          `Conversión: ${conversionInput} ${selectedConversion.unit_primary.label} ` +
          `= ${result.toFixed(6)} ` +
          `${consumableConversion?.[0]?.unit_secondary?.label || "unidades"}. ` +
          `Se ajustó al máximo disponible.`,
      }));
      setAutoAdjust(conversionRowKey, true);
    } else {
      setQtyErrorByKey((prev) => ({ ...prev, [conversionRowKey]: "" }));
      setAutoAdjustByKey((prev) => ({ ...prev, [conversionRowKey]: false }));
    }

    const nextStr = finalQuantity.toString();
    setQtyByKey((prev) => ({ ...prev, [conversionRowKey]: nextStr }));
    syncQuantityToForm(conversionRowIndex, nextStr);

    // cerrar panel
    setConversionRowKey(null);
    setConversionRowIndex(null);
    setConversionArticleId(null);
    setSelectedConversion(null);
    setConversionInput("");
  };

  const hasBlockingQtyError = useMemo(() => {
    return Object.entries(qtyErrorByKey).some(([key, msg]) => {
      if (!msg) return false;
      return !autoAdjustByKey[key];
    });
  }, [qtyErrorByKey, autoAdjustByKey]);

  const hasInvalidQty = useMemo(() => {
    return fields.some((f, idx) => {
      const key = f.id;
      const v = parseFloat(qtyByKey[key] ?? "") || 0;
      return v <= 0;
    });
  }, [fields, qtyByKey]);

  const onSubmit = async (data: FormSchemaType) => {
    // Validación final por stock (por si cambió stock o hubo edge case)
    for (const item of data.articles) {
      const max = getMaxQuantity(item.article_id);
      if (max > 0 && item.quantity > max) {
        // setea error en la fila correspondiente si la encontramos
        const idx = data.articles.findIndex(
          (x) => x.article_id === item.article_id && x.batch_id === item.batch_id
        );
        const fieldKey = fields[idx]?.id;
        if (fieldKey) {
          setQtyErrorByKey((prev) => ({
            ...prev,
            [fieldKey]: `No puede retirar más de ${max} disponibles`,
          }));
        }
        return;
      }
    }

    if (hasBlockingQtyError) return;

    const formattedData = {
      ...data,
      created_by: user!.username,
      submission_date: format(data.submission_date, "yyyy-MM-dd"),
      category: "consumible",
      status: "APROBADO",
      approved_by: user?.employee?.[0]?.dni,
      delivered_by: user?.employee?.[0]?.dni,
      user_id: Number(user!.id),
      isDepartment: isDepartment,
      aircraft_id: isDepartment ? null : data.destination_place,
    };

    await createDispatchRequest.mutateAsync({
      data: formattedData,
      company: selectedCompany!.slug,
    });

    onClose();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col space-y-6 w-full">
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
            <div className="flex flex-col gap-2 mt-2">
              <Label className="text-sm font-medium">Entregado por:</Label>
              <Input disabled value={`${user?.first_name} ${user?.last_name}`} />
            </div>
            <FormField
              control={form.control}
              name="requested_by"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Recibe / MTTO</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                      {employees &&
                        employees.map((employee) => (
                          <SelectItem key={employee.id} value={`${employee.dni}`}>
                            {employee.first_name} {employee.last_name} - {employee.job_title.name}
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="work_order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Ord. de Trabajo</FormLabel>
                  <FormControl>
                    <Input className="h-10 w-full" placeholder="Ej: OT-000123" {...field} />
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
                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
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
                  <div className="flex items-center justify-between mb-2 gap-2">
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
                        onCheckedChange={(checked) => setIsDepartment(checked as boolean)}
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
                          placeholder={isDepartment ? "Seleccione un departamento..." : "Seleccione una aeronave..."}
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
                          {departments?.map((d) => (
                            <SelectItem key={d.id} value={d.id.toString()}>
                              {d.name}
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
                          {aircrafts?.map((a) => (
                            <SelectItem key={a.id} value={a.id.toString()}>
                              {a.acronym} - {a.manufacturer.name}
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

        {/* Sección: Artículos a Retirar */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="h-px flex-1 bg-border/60"></div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2">
              Artículos a Retirar
            </span>
            <div className="h-px flex-1 bg-border/60"></div>
          </div>

          {/* Selector para agregar (minimal) */}
          <FormField
            control={form.control}
            name="articles"
            render={() => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-sm font-medium">Agregar consumible</FormLabel>

                <Popover open={openAdd} onOpenChange={setOpenAdd}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openAdd}
                      className="w-full justify-between h-10"
                      disabled={isBatchesLoading}
                    >
                      {isBatchesLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          <span className="text-muted-foreground">Cargando...</span>
                        </>
                      ) : (
                        <span className="text-muted-foreground">Seleccione un consumible...</span>
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
                            <CommandEmpty>No se han encontrado consumibles...</CommandEmpty>
                            {batches?.map((batch: BatchesWithCountProp) => (
                              <CommandGroup key={batch.batch_id} heading={batch.name}>
                                {batch.articles.map((article) => (
                                  <CommandItem
                                    key={article.id}
                                    onSelect={() => handleAddConsumable(article, batch.batch_id)}
                                  >
                                    <Check className="mr-2 h-4 w-4 opacity-0" />
                                    <div className="flex flex-col flex-1 min-w-0">
                                      <span className="font-medium truncate">{article.part_number}</span>
                                      <span className="text-xs text-muted-foreground">
                                        Disponible: {article.quantity} {article.unit}
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

          {/* Lista minimalista */}
          {fields.length > 0 && (
            <div className="space-y-2">
              {fields.map((f, index) => {
                const key = f.id;
                const row = getValues(`articles.${index}`);
                const article = articleById.get(row.article_id);
                const max = row.article_id ? getMaxQuantity(row.article_id) : 0;

                const qty = qtyByKey[key] ?? "";
                const err = qtyErrorByKey[key] ?? "";
                const isAuto = !!autoAdjustByKey[key];

                return (
                  <div key={key} className="border rounded-md p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">
                          {article?.part_number ?? `ID: ${row.article_id}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Disponible: {article?.quantity ?? 0} {article?.unit ?? ""}
                        </p>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleRemoveRow(index, key)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="mt-3 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium">Cantidad</Label>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setToMaxQuantity(index, key, row.article_id)}
                              className="h-7 text-xs text-primary hover:text-primary"
                              disabled={!article}
                            >
                              Usar máximo
                            </Button>

                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-7 px-2"
                              onClick={() => openConversionForRow(index, key, row.article_id)}
                              disabled={!article || article.unit === "u"}
                            >
                              <Calculator className="h-3.5 w-3.5 mr-2" />
                              Conversión
                            </Button>
                          </div>
                        </div>

                        <Input
                          type="text"
                          min="0"
                          step="0.001"
                          max={max || undefined}
                          disabled={!article}
                          value={qty}
                          onChange={(e) => {
                            const adjusted = validateAndAdjustQuantity(
                              key,
                              row.article_id,
                              e.target.value
                            );
                            setQtyByKey((prev) => ({ ...prev, [key]: adjusted }));
                            syncQuantityToForm(index, adjusted);
                          }}
                          placeholder={article ? `Máx: ${article.quantity}` : "Ingrese la cantidad..."}
                          className={cn(
                            "h-10",
                            err && !isAuto && "border-destructive focus-visible:ring-destructive",
                            isAuto && "border-amber-500 focus-visible:ring-amber-500"
                          )}
                        />

                        {err && (
                          <div
                            className={cn(
                              "flex items-center gap-1 text-xs",
                              isAuto ? "text-amber-600" : "text-destructive"
                            )}
                          >
                            <AlertCircle className="h-3 w-3" />
                            {err}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Panel de conversión (solo para 1 fila activa) */}
                    {conversionRowKey === key && article && article.unit !== "u" && (
                      <div className="mt-3 rounded-md bg-muted/30 p-3 space-y-2">
                        <Label className="text-sm font-medium">Conversión de Unidades</Label>

                        <div className="flex flex-col md:flex-row gap-2">
                          <Select
                            value={selectedConversion?.id?.toString() || ""}
                            onValueChange={(value) => {
                              const conversion = consumableConversion?.find(
                                (conv: any) => conv.id.toString() === value
                              );
                              setSelectedConversion(conversion || null);
                              setConversionInput("");
                            }}
                            disabled={isConversionLoading}
                          >
                            <SelectTrigger className="h-10 flex-1">
                              <SelectValue
                                placeholder={isConversionLoading ? "Cargando..." : "Seleccione unidad"}
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {consumableConversion?.map((conversion: any) => (
                                <SelectItem key={conversion.id} value={conversion.id.toString()}>
                                  {conversion.unit_primary.label} ({conversion.unit_primary.value})
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
                            className="h-10 w-full md:w-28"
                            disabled={!selectedConversion}
                          />

                          <div className="flex gap-2">
                            <Button
                              type="button"
                              className="h-10"
                              onClick={applyConversion}
                              disabled={!selectedConversion || !conversionInput}
                            >
                              Aplicar
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              className="h-10"
                              onClick={() => {
                                setConversionRowKey(null);
                                setConversionRowIndex(null);
                                setConversionArticleId(null);
                                setSelectedConversion(null);
                                setConversionInput("");
                              }}
                            >
                              Cerrar
                            </Button>
                          </div>
                        </div>

                        {selectedConversion && conversionInput && (
                          <p className="text-xs text-muted-foreground">
                            {conversionInput} {selectedConversion.unit_primary.label} ={" "}
                            {(
                              (parseFloat(conversionInput) || 0) /
                              selectedConversion.equivalence
                            ).toFixed(6)}{" "}
                            {consumableConversion?.[0]?.unit_secondary?.label || "unidades"}
                          </p>
                        )}

                        {!isConversionLoading &&
                          (!consumableConversion || consumableConversion.length === 0) && (
                            <p className="text-xs text-muted-foreground">
                              No hay conversiones disponibles para este consumible.
                            </p>
                          )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
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

        {/* Acciones */}
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
              fields.length === 0 ||
              hasBlockingQtyError ||
              hasInvalidQty
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
