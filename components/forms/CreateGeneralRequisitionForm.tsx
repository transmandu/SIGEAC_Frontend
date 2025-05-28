"use client"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useCreateRequisition, useUpdateRequisition } from "@/actions/compras/requisiciones/actions"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/AuthContext"
import { useGetDepartamentEmployees } from "@/hooks/administracion/useGetDepartamentEmployees"
import { useGetBatchesByLocationId } from "@/hooks/useGetBatchesByLocationId"
import { cn } from "@/lib/utils"
import { useCompanyStore } from "@/stores/CompanyStore"
import { zodResolver } from "@hookform/resolvers/zod"
import { Check, ChevronsUpDown, Loader2, MinusCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { ScrollArea } from "../ui/scroll-area"
import { Separator } from "../ui/separator"
import { Textarea } from "../ui/textarea"
import { CreateBatchDialog } from "../dialogs/CreateBatchDialog"
import { useGetSecondaryUnits } from "@/hooks/ajustes/globales/unidades/useGetSecondaryUnits"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"

const FormSchema = z.object({
  justification: z.string({ message: "La justificación debe ser válida." }).min(2, { message: "La justificación debe ser válida." }),
  company: z.string(),
  location_id: z.string(),
  type: z.string({ message: "Debe seleccionar un tipo de requisición." }),
  created_by: z.string(),
  requested_by: z.string({ message: "Debe ingresar quien lo solicita." }),
  image: z.instanceof(File)
    .refine(file => file.size <= 5 * 1024 * 1024, "Max 5MB")
    .refine(file => ['image/jpeg', 'image/png'].includes(file.type), "Solo JPEG/PNG")
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
            alt_part_number: z.string().min(1, "El número de parte es obligatorio").optional(),
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
          batch.batch_articles.every((article) =>
            batch.category !== "consumible" || article.unit
          )
        ),
      {
        message: "La unidad secundaria es obligatoria para consumibles",
        path: ["articles"],
      }
    ),
});

type FormSchemaType = z.infer<typeof FormSchema>

interface FormProps {
  onClose: () => void,
  initialData?: FormSchemaType,
  id?: number | string,
  isEditing?: boolean,
}

// Tipos para batches y artículos
interface Article {
  part_number: string;
  quantity: number;
  unit?: string,
}

interface Batch {
  batch: string;
  category: string
  batch_name: string,
  batch_articles: Article[];
}

export function CreateGeneralRequisitionForm({ onClose, initialData, isEditing, id }: FormProps) {

  const { user } = useAuth()

  const { mutate, data } = useGetBatchesByLocationId();

  const { selectedCompany, selectedStation } = useCompanyStore()

  const { mutate: employeesMutation, data: employees, isPending: employeesLoading } = useGetDepartamentEmployees();

  const { data: secondaryUnits, isLoading: secondaryUnitLoading } = useGetSecondaryUnits()


  const { createRequisition } = useCreateRequisition()

  const { updateRequisition } = useUpdateRequisition()

  const [selectedBatches, setSelectedBatches] = useState<Batch[]>([])

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      articles: [],
    },
  })

  useEffect(() => {
    if (user && selectedCompany && selectedStation) {
      form.setValue("created_by", user.id.toString())
      form.setValue("company", selectedCompany.split(" ").join(""))
      form.setValue("location_id", selectedStation)
    }
    if (initialData && selectedCompany) {
      form.reset(initialData); // Set initial form values
      form.setValue("company", selectedCompany.split(" ").join(""))
    }
  }, [user, initialData, form, selectedCompany])

  useEffect(() => {
    if (selectedStation) {
      mutate(Number(selectedStation))
      employeesMutation(Number(selectedStation))
    }
  }, [selectedStation, mutate, employeesMutation])

  useEffect(() => {
    form.setValue("articles", selectedBatches)
  }, [selectedBatches])


  // Maneja la selección de un lote.
  const handleBatchSelect = (batchName: string, batchId: string, batch_category: string) => {
    setSelectedBatches((prev) => {
      // Verificar si el batch ya está seleccionado
      const exists = prev.some((b) => b.batch === batchId);

      if (exists) {
        // Si ya existe, lo eliminamos
        return prev.filter((b) => b.batch !== batchId);
      }

      // Si no existe, lo agregamos
      return [
        ...prev,
        { batch: batchId, batch_name: batchName, category: batch_category, batch_articles: [{ part_number: "", quantity: 0 }] },
      ];
    });
  };


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

  // Agrega un nuevo artículo a un lote.
  const addArticle = (batchName: string) => {
    setSelectedBatches((prev) =>
      prev.map((batch) =>
        batch.batch === batchName
          ? { ...batch, batch_articles: [...batch.batch_articles, { part_number: "", quantity: 0 }] }
          : batch
      )
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
    if (isEditing && id) {
      await updateRequisition.mutateAsync({ data, id });
    } else {
      await createRequisition.mutateAsync(data);
    }
    onClose();
  };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col space-y-3">
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
                        {
                          employeesLoading && <Loader2 className="size-4 animate-spin mr-2" />
                        }
                        {field.value
                          ? <p>{employees?.find(
                            (employee) => `${employee.first_name} ${employee.last_name}` === field.value
                          )?.first_name} - {employees?.find(
                            (employee) => `${employee.first_name} ${employee.last_name}` === field.value
                          )?.last_name}</p>
                          : "Elige al solicitante..."
                        }
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="p-0">
                    <Command>
                      <CommandInput placeholder="Busque un empleado..." />
                      <CommandList>
                        <CommandEmpty className="text-sm p-2 text-center">No se ha encontrado ningún empleado.</CommandEmpty>
                        <CommandGroup>
                          {employees?.map((employee) => (
                            <CommandItem
                              value={`${employee.first_name} ${employee.last_name}`}
                              key={employee.id}
                              onSelect={() => {
                                form.setValue("requested_by", `${employee.first_name} ${employee.last_name}`)
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  `${employee.first_name} ${employee.last_name}` === field.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {
                                <p>{employee.first_name} {employee.last_name}</p>
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione.." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="AERONAUTICO">Aeronautico</SelectItem>
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
              <FormLabel>Artículos</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-[200px] justify-between",
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
                        <div className="flex justify-center m-2"><CreateBatchDialog /></div>
                        {data &&
                          data.map((batch) => (
                            <CommandItem
                              key={batch.name}
                              value={batch.name}
                              onSelect={() => handleBatchSelect(batch.name, batch.id.toString(), batch.category)}
                            >
                              <Check
                                className={cn(
                                  "",
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
              <div className="mt-4 space-y-4">
                <ScrollArea className={cn("", selectedBatches.length > 2 ? "h-[300px]" : "")}>
                  {selectedBatches.map((batch) => (
                    <div key={batch.batch}>
                      <div className="flex items-center">
                        <h4 className="font-semibold">{batch.batch_name}</h4>
                        <Button
                          variant="ghost"
                          type="button"
                          size="icon"
                          onClick={() => removeBatch(batch.batch)}
                        >
                          <MinusCircle className="size-4" />
                        </Button>
                      </div>
                      <ScrollArea className={cn("", batch.batch_articles.length > 2 ? "h-[150px]" : "")}>
                        {batch.batch_articles.map((article, index) => (
                          <div key={index} className="flex items-center space-x-4 mt-2">
                            <Input
                              placeholder="Número de parte"
                              onChange={(e) => handleArticleChange(batch.batch, index, "part_number", e.target.value)}
                            />

                            <Input
                              placeholder="N/P Alterno"
                              onChange={(e) => handleArticleChange(batch.batch, index, "alt_part_number", e.target.value)}
                            />
                            <Select disabled={secondaryUnitLoading} onValueChange={(value) => handleArticleChange(batch.batch, index, "unit", value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Unidad Sec." />
                              </SelectTrigger>
                              <SelectContent>
                                {
                                  secondaryUnits && secondaryUnits.map((secU) => (
                                    <SelectItem key={secU.id} value={secU.id.toString()}>{secU.secondary_unit}</SelectItem>
                                  )
                                  )
                                }
                              </SelectContent>
                            </Select>
                            {form.formState.errors.articles?.[index]?.batch_articles?.[index]?.unit && (
                              <p className="text-red-500 text-xs">
                                La unidad es obligatoria para consumibles.
                              </p>
                            )}
                            <Input
                              type="number"
                              placeholder="Cantidad"
                              onChange={(e) =>
                                handleArticleChange(batch.batch, index, "quantity", Number(e.target.value))
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
                              onClick={() => removeArticleFromBatch(batch.batch, index)}
                              className="hover:text-red-500"
                            >
                              <MinusCircle className="size-4" />
                            </Button>
                          </div>
                        ))}
                      </ScrollArea>
                      <Button
                        type="button"
                        variant="link"
                        onClick={() => addArticle(batch.batch)}
                        className="mt-2 text-sm"
                      >
                        Agregar artículo
                      </Button>
                    </div>
                  ))}
                </ScrollArea>
              </div>
              <FormMessage />
            </FormItem>
          )
          }
        />
        < FormField
          control={form.control}
          name="justification"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Justificación</FormLabel>
              <FormControl>
                <Textarea placeholder="Ej: Necesidad de la pieza X para instalación..." {...field} />
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
                  <img
                    src={URL.createObjectURL(field.value)}
                    alt="Preview"
                    className="h-16 w-16 rounded-md object-cover"
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
        < div className="flex justify-between items-center gap-x-4" >
          <Separator className="flex-1" />
          <p className="text-muted-foreground">SIGEAC</p>
          <Separator className="flex-1" />
        </div >
        <Button disabled={createRequisition.isPending || updateRequisition.isPending}>
          {isEditing ? "Editar Requisición" : "Generar Requisición"}
          {(createRequisition.isPending || updateRequisition.isPending) && (
            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
          )}
        </Button>
      </form >
    </Form >
  )
}
