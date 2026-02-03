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
import { Check, ChevronsUpDown, Loader2, MinusCircle, PlusCircle } from "lucide-react"
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
  alt_part_number?: string;
  quantity: number;
  unit?: string;
}

interface Batch {
  batch: string;
  category: string;
  batch_name: string;
  batch_articles: Article[];
}

export function CreateGeneralRequisitionForm({
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


  const [selectedBatches, setSelectedBatches] = useState<Batch[]>([])

  const { data: aircrafts, isLoading: isAircraftsLoading, isError: isAircraftsError } = useGetMaintenanceAircrafts(selectedCompany?.slug)


  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      articles: [],
    },
  });

  useEffect(() => {
    if (user && selectedCompany && selectedStation) {
      form.setValue("created_by", user.id.toString())
      form.setValue("company", selectedCompany.slug)
      form.setValue("location_id", selectedStation)
    }
    if (initialData && selectedCompany) {
      form.reset(initialData); // Set initial form values
      form.setValue("company", selectedCompany.slug)
    }
  }, [user, initialData, form, selectedCompany, selectedStation]);

  useEffect(() => {
    if (selectedStation) {
      mutate({location_id: Number(selectedStation), company: selectedCompany?.slug});
    }
  }, [selectedStation, mutate, selectedCompany])

  useEffect(() => {
    setSelectedBatches([
      {
        batch: "1511",
        batch_name: "TEMP",
        category: "COMPONENT",
        batch_articles: [
          { part_number: "", quantity: 0 }
        ],
      },
    ]);
  }, []);

  useEffect(() => {
    form.setValue("articles", selectedBatches as any);
  }, [selectedBatches, form]);

  // Maneja el cambio en un artículo.
  const handleArticleChange = (
    batchName: string,
    index: number,
    field: string,
    value: string | number | File | undefined
  ) => {
    setSelectedBatches((prev) =>
      prev.map((batch) =>
        batch.batch === batchName
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

  const findArticleByPartNumber = (partNumber: string) => {
    for (const batch of selectedBatches) {
      for (const article of batch.batch_articles) {
        if (
          article.part_number &&
          article.part_number.trim().toUpperCase() === partNumber.trim().toUpperCase()
        ) {
          return article;
        }
      }
    }
    return null;
  };

const handlePartNumberBlur = (
  batchName: string,
  index: number,
  value: string
) => {
  if (!value) return;

  const existing = findArticleByPartNumber(value);

  if (!existing) return;

  // Autocompleta SOLO si están vacíos
  if (existing.alt_part_number) {
    handleArticleChange(batchName, index, "alt_part_number", existing.alt_part_number);
  }

  if (existing.unit) {
    handleArticleChange(batchName, index, "unit", existing.unit);
  }
};

  // Agrega un nuevo artículo a un lote.
  const addArticle = (batchName: string) => {
    setSelectedBatches((prev) =>
      prev.map((batch) => {
        if (batch.batch !== batchName) return batch;
        
        // Encontrar la unidad "UNIDAD" para componentes y herramientas
        const unidadUnit = units?.find(
          (u) => u.label.toUpperCase() === "UNIDAD" || u.value.toUpperCase() === "UNIDAD"
        );
        const defaultUnit = 
          (batch.category === "componente" || batch.category === "herramienta") && unidadUnit
            ? unidadUnit.id.toString()
            : undefined;

        return {
          ...batch,
          batch_articles: [
            ...batch.batch_articles,
            { part_number: "", quantity: 0, unit: defaultUnit },
          ],
        };
      })
    );
  };

  const removeArticleFromBatch = (batchName: string, articleIndex: number) => {
    setSelectedBatches((prevBatches) =>
      prevBatches.map((batch) =>
        batch.batch === batchName
          ? {
              ...batch,
              batch_articles: batch.batch_articles.filter(
                (_, index) => index !== articleIndex
              ),
            }
          : batch
      )
    );
  };

  const removeBatch = (batchName: string) => {
    setSelectedBatches((prevBatches) =>
      prevBatches.filter((batch) => batch.batch !== batchName)
    );
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
        className="flex flex-col space-y-3"
      >
        <div className="flex gap-2 items-center">
          <FormField
            control={form.control}
            name="requested_by"
            render={({ field }) => (
              <FormItem className="w-full flex flex-col space-y-3 mt-1.5">
                <FormLabel>Solicitante</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        disabled={employeesLoading}
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "justify-between",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {employeesLoading && (
                          <Loader2 className="size-4 animate-spin mr-2" />
                        )}
                        {field.value ? (
                          <p>
                            {
                              employees?.find(
                                (employee) =>
                                  `${employee.dni}` ===
                                  field.value
                              )?.first_name
                            }{" "}
                            -{" "}
                            {
                              employees?.find(
                                (employee) =>
                                  `${employee.dni}` ===
                                  field.value
                              )?.last_name
                            }
                          </p>
                        ) : (
                          "Elige al solicitante..."
                        )}
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
                              onSelect={() => {
                                form.setValue(
                                  "requested_by",
                                  `${employee.dni}`
                                );
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  `${employee.dni}` ===
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
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Tipo de Req.</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione.." />
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
          render={({ field }: { field: any }) => (
            <FormItem className="flex flex-col">
              <div className="flex gap-4 items-end">
                {form.watch("type") === "AERONAUTICO" && (
                  <FormField
                    control={form.control}
                    name="aircraft_id"
                    render={({ field }) => (
                      <FormItem className="flex flex-col w-[200px]">
                        <FormLabel>Aeronave</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                disabled={isAircraftsLoading}
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "justify-between",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {isAircraftsLoading && (
                                  <Loader2 className="size-4 animate-spin mr-2" />
                                )}
                                {field.value
                                  ? (() => {
                                      const a = aircrafts?.find(
                                        (aircraft) => aircraft.id.toString() === field.value
                                      );
                                      return `${a?.acronym ?? "—"} - ${a?.manufacturer?.name ?? "Sin fabricante"}`;
                                    })()
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
                                      onSelect={() => {
                                        form.setValue("aircraft_id", aircraft.id.toString());
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          aircraft.id.toString() === field.value
                                            ? "opacity-100"
                                            : "opacity-0"
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
                    )}
                  />
                )}
              </div>
              <div className="mt-4 space-y-4">
                <ScrollArea
                  className={cn(
                    "pr-2",
                    selectedBatches.length > 2 ? "h-[300px]" : ""
                  )}
                >
                  {selectedBatches.map((batch) => (
                    <div key={batch.batch}>
                      <div className="flex items-center">
                        <h4 className="font-semibold">{batch.batch_name}</h4>
                      </div>
                      <ScrollArea
                        className={cn(
                          "pr-2",
                          batch.batch_articles.length > 2 ? "h-[150px]" : ""
                        )}
                      >
                        {batch.batch_articles.map((article, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-4 mt-2 py-2 px-1"
                          >
                            <Input
                              placeholder="Número de parte"
                              value={article.part_number}
                              onChange={(e) =>
                                handleArticleChange(
                                  batch.batch,
                                  index,
                                  "part_number",
                                  e.target.value
                                )
                              }
                              onBlur={(e) =>
                                handlePartNumberBlur(batch.batch, index, e.target.value)
                              }
                            />

                            <Input
                              placeholder="N/P Alterno"
                              onChange={(e) =>
                                handleArticleChange(
                                  batch.batch,
                                  index,
                                  "alt_part_number",
                                  e.target.value
                                )
                              }
                            />
                            <Select
                              disabled={isUnitsLoading || batch.category === "componente" || batch.category === "herramienta"}
                              value={article.unit}
                              onValueChange={(value) =>
                                handleArticleChange(
                                  batch.batch,
                                  index,
                                  "unit",
                                  value
                                )
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Unidad" />
                              </SelectTrigger>
                              <SelectContent>
                                {units &&
                                  units.map((secU) => (
                                    <SelectItem
                                      key={secU.id}
                                      value={secU.id.toString()}
                                    >
                                      {secU.label}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                            {form.formState.errors.articles?.[index]
                              ?.batch_articles?.[index]?.unit && (
                              <p className="text-red-500 text-xs">
                                La unidad es obligatoria para consumibles.
                              </p>
                            )}
                            <Input
                              placeholder="Cantidad"
                              min="0"
                              step="0.1"
                              inputMode="decimal"
                              onChange={(e) =>
                                handleArticleChange(
                                  batch.batch,
                                  index,
                                  "quantity",
                                  Number(e.target.value)
                                )
                              }
                            />
                            {/* <Input
                              type="file"
                              accept="image/*"
                              className="cursor-pointer"
                              onChange={(e) =>
                                handleArticleChange(batch.batch, index, "image", e.target.files?.[0])
                              }
                            /> */}
                            <Button
                              variant="ghost"
                              type="button"
                              size="icon"
                              disabled={batch.batch_articles.length === 1 && index === 0}
                              onClick={() =>
                                removeArticleFromBatch(batch.batch, index)
                              }
                              className={cn(
                                "hover:text-red-500",
                                batch.batch_articles.length === 1 && index === 0 &&
                                  "opacity-40 cursor-not-allowed hover:text-inherit"
                              )}
                            >
                              <MinusCircle className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              type="button"
                              size="icon"
                              onClick={() => addArticle(batch.batch)}
                            >
                              <PlusCircle className="size-4" />
                            </Button>
                          </div>
                        ))}
                      </ScrollArea>
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
              <FormLabel>Justificación</FormLabel>
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
              <FormLabel>Imagen General</FormLabel>
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
          <p className="text-muted-foreground">SIGEAC</p>
          <Separator className="flex-1" />
        </div>
        <Button
          disabled={createRequisition.isPending || updateRequisition.isPending}
        >
          {isEditing ? "Editar Requisición" : "Generar Requisición"}
          {(createRequisition.isPending || updateRequisition.isPending) && (
            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
          )}
        </Button>
      </form>
    </Form>
  );
}
