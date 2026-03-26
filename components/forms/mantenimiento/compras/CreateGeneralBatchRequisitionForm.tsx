"use client"
import { useCreateRequisition, useUpdateRequisition } from "@/actions/mantenimiento/compras/requisiciones/actions"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/AuthContext"
import { useGetBatchesByLocationId } from "@/hooks/mantenimiento/almacen/renglones/useGetBatchesByLocationId"
import { useGetMaintenanceAircrafts } from '@/hooks/mantenimiento/planificacion/useGetMaintenanceAircrafts'
import { useGetUserDepartamentEmployees } from "@/hooks/sistema/empleados/useGetUserDepartamentEmployees"
import { cn } from "@/lib/utils"
import { useCompanyStore } from "@/stores/CompanyStore"
import { zodResolver } from "@hookform/resolvers/zod"
import { Check, ChevronsUpDown, FileText, ImageIcon, Layers, Loader2, MinusCircle, Pencil, Plane, Plus, Send, Tag, User } from "lucide-react"
import Image from "next/image"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { CreateBatchDialog } from "@/components/dialogs/mantenimiento/almacen/CreateBatchDialog"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../../../ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "../../../ui/popover"
import { ScrollArea } from "../../../ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../ui/select"
import { Separator } from "../../../ui/separator"
import { Textarea } from "../../../ui/textarea"
import { useGetUnits } from "@/hooks/general/unidades/useGetPrimaryUnits"
import { Badge } from "@/components/ui/badge"
import { ArticleImageAttachment } from "./_components/ArticleImageAttachment"

const FormSchema = z.object({
  justification: z
    .string({ message: "La justificación debe ser válida." })
    .min(2, { message: "La justificación debe ser válida." }),
  company: z.string(),
  location_id: z.string(),
  type: z.string({ message: "Debe seleccionar un tipo de requisición." }),
  aircraft_id: z.string().optional(),
  created_by: z.string(),
  requested_by: z.string({ message: "Debe ingresar quien lo solicita." }),
  image: z
    .instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, "Max 5MB")
    .refine(
      (file) => ["image/jpeg", "image/png"].includes(file.type),
      "Solo JPEG/PNG"
    )
    .optional(),
  articles: z
    .array(
      z.object({
        batch: z.string(),
        batch_name: z.string(),
        category: z.string(),
        batch_articles: z.array(
          z.object({
            part_number: z.string().min(1, "El número de parte es obligatorio"),
            alt_part_number: z
              .string()
              .min(1, "El número de parte es obligatorio")
              .optional(),
            quantity: z.number().min(1, "Debe ingresar una cantidad válida"),
            image: z.any().optional(),
            unit: z.string().optional(), // Inicialmente opcional
          })
        ),
      })
    )
    .refine(
      (articles) =>
        articles.every((batch) =>
          batch.batch_articles.every(
            (article) => batch.category !== "consumible" || article.unit
          )
        ),
      {
        message: "La unidad secundaria es obligatoria para consumibles",
        path: ["articles"],
      }
    ),
}).refine(
  (data) => {
    // Si el tipo es AERONAUTICO, aircraft_id es obligatorio
    if (data.type === "AERONAUTICO" && !data.aircraft_id) {
      return false;
    }
    return true;
  },
  {
    message: "Debe seleccionar una aeronave.",
    path: ["aircraft_id"],
  }
);

type FormSchemaType = z.infer<typeof FormSchema>;

interface FormProps {
  onClose: () => void;
  initialData?: FormSchemaType;
  id?: number | string;
  isEditing?: boolean;
}

// Tipos para batches y artículos
interface Article {
  part_number: string;
  quantity: number;
  unit?: string;
  image?: File;
}

interface Batch {
  batch: string;
  category: string;
  batch_name: string;
  batch_articles: Article[];
}

const CATEGORY_LABELS: Record<string, string> = {
  componente: "Componente",
  herramienta: "Herramienta",
  consumible: "Consumible",
};

export function CreateGeneralBatchRequisitionForm({
  onClose,
  initialData,
  isEditing,
  id,
}: FormProps) {
  const { user } = useAuth();

  const { mutate, data, isPending: isBatchesLoading } = useGetBatchesByLocationId();

  const { selectedCompany, selectedStation } = useCompanyStore();

  const { data: employees, isPending: employeesLoading } = useGetUserDepartamentEmployees(selectedCompany?.slug);

  const { data: units, isLoading: isUnitsLoading } = useGetUnits(selectedCompany?.slug);

  const { createRequisition } = useCreateRequisition();
  const { updateRequisition } = useUpdateRequisition();

  const [selectedBatches, setSelectedBatches] = useState<Batch[]>([]);

  const { data: aircrafts, isLoading: isAircraftsLoading } = useGetMaintenanceAircrafts(selectedCompany?.slug);

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      articles: [],
    },
  });

  // Returns the default unit id for a given batch category
  const getDefaultUnit = (category: string) => {
    const unidadUnit = units?.find(
      (u) => u.label.toUpperCase() === "UNIDAD" || u.value.toUpperCase() === "UNIDAD"
    );
    return (category === "componente" || category === "herramienta") && unidadUnit
      ? unidadUnit.id.toString()
      : undefined;
  };

  useEffect(() => {
    if (user && selectedCompany && selectedStation) {
      form.setValue("created_by", user.id.toString());
      form.setValue("company", selectedCompany.slug);
      form.setValue("location_id", selectedStation);
    }
    if (initialData && selectedCompany) {
      form.reset(initialData);
      form.setValue("company", selectedCompany.slug);
      // Sync the article UI state when editing
      if (initialData.articles?.length) {
        setSelectedBatches(initialData.articles as Batch[]);
      }
    }
  }, [user, initialData, form, selectedCompany, selectedStation]);

  useEffect(() => {
    if (selectedStation) {
      mutate({ location_id: Number(selectedStation), company: selectedCompany?.slug });
    }
  }, [selectedStation, mutate, selectedCompany]);

  useEffect(() => {
    form.setValue("articles", selectedBatches);
  }, [selectedBatches, form]);

  const handleBatchSelect = (batchName: string, batchId: string, batch_category: string) => {
    setSelectedBatches((prev) => {
      if (prev.some((b) => b.batch === batchId)) {
        return prev.filter((b) => b.batch !== batchId);
      }
      return [
        ...prev,
        {
          batch: batchId,
          batch_name: batchName,
          category: batch_category,
          batch_articles: [{ part_number: "", quantity: 0, unit: getDefaultUnit(batch_category) }],
        },
      ];
    });
  };

  const handleArticleChange = (
    batchId: string,
    index: number,
    field: string,
    value: string | number | File | undefined
  ) => {
    setSelectedBatches((prev) =>
      prev.map((batch) =>
        batch.batch === batchId
          ? {
              ...batch,
              batch_articles: batch.batch_articles.map((article, i) =>
                i === index ? { ...article, [field]: value } : article
              ),
            }
          : batch
      )
    );
  };

  const addArticle = (batchId: string) => {
    setSelectedBatches((prev) =>
      prev.map((batch) => {
        if (batch.batch !== batchId) return batch;
        return {
          ...batch,
          batch_articles: [
            ...batch.batch_articles,
            { part_number: "", quantity: 0, unit: getDefaultUnit(batch.category) },
          ],
        };
      })
    );
  };

  const removeArticleFromBatch = (batchId: string, articleIndex: number) => {
    setSelectedBatches((prev) =>
      prev.map((batch) =>
        batch.batch === batchId
          ? { ...batch, batch_articles: batch.batch_articles.filter((_, i) => i !== articleIndex) }
          : batch
      )
    );
  };

  const removeBatch = (batchId: string) => {
    setSelectedBatches((prev) => prev.filter((batch) => batch.batch !== batchId));
  };

  const onSubmit = async (data: FormSchemaType) => {
    const formattedData = {
      ...data,
      articles: data.articles.map(batch => ({
        ...batch,
        batch_articles: batch.batch_articles.map(article => ({
          ...article,
          aircraft_id: data.type === "AERONAUTICO" ? data.aircraft_id : undefined
        }))
      }))
    };

    if (isEditing) {
      await updateRequisition.mutateAsync({id: id!, data: formattedData, company: selectedCompany!.slug})
    } else {
      await createRequisition.mutateAsync({data: formattedData, company: selectedCompany!.slug})
    }
    onClose();
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col space-y-3 max-h-[90vh]"
      >
        <div className="flex gap-2 items-center">
          <FormField
            control={form.control}
            name="requested_by"
            render={({ field }) => {
              const selectedEmployee = employees?.find((e) => `${e.dni}` === field.value);
              return (
                <FormItem className="w-full flex flex-col space-y-3 mt-1.5">
                  <FormLabel className="flex items-center gap-1.5">
                    <User className="size-3.5 text-muted-foreground" />
                    Solicitante
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          disabled={employeesLoading}
                          variant="outline"
                          role="combobox"
                          className={cn("justify-between", !field.value && "text-muted-foreground")}
                        >
                          {employeesLoading
                            ? <Loader2 className="size-4 animate-spin mr-2" />
                            : selectedEmployee
                              ? <span>{selectedEmployee.first_name} {selectedEmployee.last_name}</span>
                              : "Elige al solicitante..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="p-0">
                      <Command>
                        <CommandInput placeholder="Busque un empleado..." />
                        <CommandList>
                          <CommandEmpty className="text-sm p-2 text-center">
                            No se ha encontrado ningún empleado.
                          </CommandEmpty>
                          <CommandGroup>
                            {employees?.map((employee) => (
                              <CommandItem
                                value={`${employee.dni}`}
                                key={employee.id}
                                onSelect={() => form.setValue("requested_by", `${employee.dni}`)}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    `${employee.dni}` === field.value ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {employee.first_name} {employee.last_name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem className="w-full mt-2.5">
                <FormLabel className="flex items-center gap-1.5">
                  <Tag className="size-3.5 text-muted-foreground" />
                  Tipo de Req.
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="AERONAUTICO">Aeronáutico</SelectItem>
                    <SelectItem value="GENERAL">General</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="articles"
          render={({ field: _ }: { field: any }) => (
            <FormItem className="flex flex-col">
              <div className="flex gap-4 items-end">
                <FormItem className="flex flex-col w-[200px]">
                  <FormLabel className="flex items-center gap-1.5">
                    <Layers className="size-3.5 text-muted-foreground" />
                    Lote/Renglón
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          disabled={isBatchesLoading}
                          role="combobox"
                          className={cn(
                            "justify-between",
                            selectedBatches.length === 0 && "text-muted-foreground"
                          )}
                        >
                          {selectedBatches.length > 0
                            ? `${selectedBatches.length} reng. seleccionados`
                            : "Selec. un renglón..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command>
                        <CommandInput placeholder="Buscar..." />
                        <CommandList>
                          <CommandEmpty>No existen renglones...</CommandEmpty>
                          <CommandGroup>
                            <div className="flex justify-center m-2">
                              <CreateBatchDialog />
                            </div>
                            {data?.map((batch) => (
                              <CommandItem
                                key={batch.name}
                                value={batch.name}
                                onSelect={() => handleBatchSelect(batch.name, batch.id.toString(), batch.category)}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedBatches.some((b) => b.batch === batch.id.toString())
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {batch.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </FormItem>

                {form.watch("type") === "AERONAUTICO" && (
                  <FormField
                    control={form.control}
                    name="aircraft_id"
                    render={({ field }) => {
                      const selectedAircraft = aircrafts?.find((a) => a.id.toString() === field.value);
                      return (
                        <FormItem className="flex flex-col w-[200px]">
                          <FormLabel className="flex items-center gap-1.5">
                            <Plane className="size-3.5 text-muted-foreground" />
                            Aeronave
                          </FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  disabled={isAircraftsLoading}
                                  variant="outline"
                                  role="combobox"
                                  className={cn("justify-between", !field.value && "text-muted-foreground")}
                                >
                                  {isAircraftsLoading
                                    ? <Loader2 className="size-4 animate-spin mr-2" />
                                    : selectedAircraft
                                      ? <span className="truncate max-w-[140px]">{selectedAircraft.acronym} - {selectedAircraft.manufacturer?.name ?? "Sin fabricante"}</span>
                                      : "Selec. la aeronave..."}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-[200px] p-0">
                              <Command>
                                <CommandInput placeholder="Busque una aeronave..." />
                                <CommandList>
                                  <CommandEmpty className="text-sm p-2 text-center">
                                    No se ha encontrado ninguna aeronave.
                                  </CommandEmpty>
                                  <CommandGroup>
                                    {aircrafts?.map((aircraft) => (
                                      <CommandItem
                                        value={aircraft.id.toString()}
                                        key={aircraft.id}
                                        onSelect={() => form.setValue("aircraft_id", aircraft.id.toString())}
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            aircraft.id.toString() === field.value ? "opacity-100" : "opacity-0"
                                          )}
                                        />
                                        {aircraft.acronym} - {aircraft.manufacturer?.name ?? "Sin fabricante"}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                )}
              </div>

              <div className="mt-4 space-y-4">
                <ScrollArea className={cn(selectedBatches.length > 1 ? "h-[280px]" : "")}>
                  {selectedBatches.map((batch, batchIndex) => (
                    <div
                      key={batch.batch}
                      className="rounded-md border bg-muted/30 p-3 mb-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm">{batch.batch_name}</h4>
                          <Badge variant="secondary" className="text-xs capitalize">
                            {CATEGORY_LABELS[batch.category] ?? batch.category}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          type="button"
                          size="icon"
                          onClick={() => removeBatch(batch.batch)}
                          className="h-6 w-6 hover:text-destructive"
                        >
                          <MinusCircle className="size-3.5" />
                        </Button>
                      </div>

                      <ScrollArea className={cn(batch.batch_articles.length > 2 ? "h-[125px]" : "")}>
                        {batch.batch_articles.map((article, index) => (
                          <div key={index} className="flex items-center gap-2 mt-1.5">
                            <Input
                              placeholder="N/P"
                              className="text-xs h-8"
                              onChange={(e) => handleArticleChange(batch.batch, index, "part_number", e.target.value)}
                            />
                            <Input
                              placeholder="N/P Alterno"
                              className="text-xs h-8"
                              onChange={(e) => handleArticleChange(batch.batch, index, "alt_part_number", e.target.value)}
                            />
                            <Select
                              disabled={isUnitsLoading || batch.category === "componente" || batch.category === "herramienta"}
                              value={article.unit}
                              onValueChange={(value) => handleArticleChange(batch.batch, index, "unit", value)}
                            >
                              <SelectTrigger className="text-xs h-8">
                                <SelectValue placeholder="Unidad" />
                              </SelectTrigger>
                              <SelectContent>
                                {units?.map((secU) => (
                                  <SelectItem key={secU.id} value={secU.id.toString()}>
                                    {secU.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            <Input
                              type="number"
                              placeholder="Cant."
                              min="0"
                              step="0.1"
                              inputMode="decimal"
                              className="text-xs h-8 w-20 shrink-0"
                              onChange={(e) => handleArticleChange(batch.batch, index, "quantity", Number(e.target.value))}
                            />

                            <ArticleImageAttachment
                              article={article}
                              onChangeImage={(file) => handleArticleChange(batch.batch, index, "image", file)}
                            />

                            <Button
                              variant="ghost"
                              type="button"
                              size="icon"
                              onClick={() => removeArticleFromBatch(batch.batch, index)}
                              className="h-6 w-6 hover:text-destructive shrink-0"
                            >
                              <MinusCircle className="size-3.5" />
                            </Button>
                          </div>
                        ))}
                      </ScrollArea>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => addArticle(batch.batch)}
                        className="mt-2 h-7 text-xs text-muted-foreground hover:text-foreground gap-1"
                      >
                        <Plus className="size-3" />
                        Agregar artículo
                      </Button>
                    </div>
                  ))}
                </ScrollArea>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="justification"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1.5">
                <FileText className="size-3.5 text-muted-foreground" />
                Justificación
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Ej: Necesidad de la pieza X para instalación..."
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1.5">
                <ImageIcon className="size-3.5 text-muted-foreground" />
                Imagen General
              </FormLabel>
              <div className="flex items-center gap-4">
                {field.value && (
                  <Image
                    src={URL.createObjectURL(field.value)}
                    alt="Preview"
                    className="h-16 w-16 rounded-md object-cover"
                    width={64}
                    height={64}
                  />
                )}
                <FormControl>
                  <Input
                    type="file"
                    accept="image/jpeg, image/png"
                    onChange={(e) => field.onChange(e.target.files?.[0])}
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between items-center gap-x-4">
          <Separator className="flex-1" />
          <p className="text-muted-foreground text-xs">SIGEAC</p>
          <Separator className="flex-1" />
        </div>

        <Button disabled={createRequisition.isPending || updateRequisition.isPending} className="gap-2">
          {isEditing
            ? <><Pencil className="size-4" /> Editar Requisición</>
            : <><Send className="size-4" /> Generar Requisición</>}
          {(createRequisition.isPending || updateRequisition.isPending) && (
            <Loader2 className="size-4 animate-spin" />
          )}
        </Button>
      </form>
    </Form>
  );
}
