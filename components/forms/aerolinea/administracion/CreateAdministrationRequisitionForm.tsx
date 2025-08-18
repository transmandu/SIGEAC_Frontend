"use client"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/AuthContext"
import { cn } from "@/lib/utils"
import { useCompanyStore } from "@/stores/CompanyStore"
import { zodResolver } from "@hookform/resolvers/zod"
import { Check, ChevronsUpDown, Loader2, MinusCircle, PlusCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../../../ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "../../../ui/popover"
import { ScrollArea } from "../../../ui/scroll-area"
import { Separator } from "../../../ui/separator"
import { Textarea } from "../../../ui/textarea"
import { useCreateRequisition } from "@/actions/aerolinea/compras/requisiciones/actions"
import { useGetUserDepartamentEmployees } from "@/hooks/sistema/empleados/useGetUserDepartamentEmployees"

const FormSchema = z.object({
  justification: z.string().min(2, { message: "La justificación debe ser válida." }),
  company: z.string(),
  location_id: z.string(),
  created_by: z.string(),
  requested_by: z.string({ message: "Debe ingresar quien lo solicita." }),
  image: z.instanceof(File).optional(),
  articles: z.array(
    z.object({
      batch_articles: z.array(
        z.object({
          description: z.string().min(1, "La descripción es obligatoria"),
          quantity: z.number().min(1, "Debe ingresar una cantidad válida"),
        })
      ).min(1, "Debe agregar al menos un artículo")
    })
  ).min(1, "Debe agregar al menos un lote"),
});

type FormSchemaType = z.infer<typeof FormSchema>

interface FormProps {
  onClose: () => void,
  initialData?: FormSchemaType,
  id?: number | string,
  isEditing?: boolean,
}

interface BatchArticle {
  description: string;
  quantity: number;
}

export function CreateAdministrationRequisitionForm({ onClose, initialData, isEditing, id }: FormProps) {
  const { user } = useAuth()
  const { selectedCompany, selectedStation } = useCompanyStore()
  const { data: employees, isPending: employeesLoading } = useGetUserDepartamentEmployees(selectedCompany?.slug);
  const { createRequisition } = useCreateRequisition()
  const [batches, setBatches] = useState<{ batch_articles: BatchArticle[] }[]>([{ batch_articles: [] }])

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      articles: [{ batch_articles: [] }],
    },
  })

  useEffect(() => {
    if (user && selectedCompany && selectedStation) {
      form.setValue("created_by", user.id.toString())
      form.setValue("company", selectedCompany.slug)
      form.setValue("location_id", selectedStation)
    }
    if (initialData && selectedCompany) {
      form.reset(initialData);
      form.setValue("company", selectedCompany.slug)
    }
  }, [user, initialData, form, selectedCompany, selectedStation])


  useEffect(() => {
    form.setValue("articles", batches)
  }, [batches, form])

  const handleArticleChange = (batchIndex: number, articleIndex: number, field: string, value: string | number) => {
    setBatches(prev =>
      prev.map((batch, bIndex) =>
        bIndex === batchIndex
          ? {
            ...batch,
            batch_articles: batch.batch_articles.map((article, aIndex) =>
              aIndex === articleIndex ? { ...article, [field]: value } : article
            )
          }
          : batch
      )
    );
  };

  const addArticle = (batchIndex: number) => {
    setBatches(prev =>
      prev.map((batch, index) =>
        index === batchIndex
          ? { ...batch, batch_articles: [...batch.batch_articles, { description: "", quantity: 0 }] }
          : batch
      )
    );
  };

  const removeArticle = (batchIndex: number, articleIndex: number) => {
    setBatches(prev =>
      prev.map((batch, index) =>
        index === batchIndex
          ? {
            ...batch,
            batch_articles: batch.batch_articles.filter((_, aIndex) => aIndex !== articleIndex)
          }
          : batch
      )
    );
  };

  const addBatch = () => {
    setBatches(prev => [...prev, { batch_articles: [] }]);
  };

  const removeBatch = (batchIndex: number) => {
    setBatches(prev => prev.filter((_, index) => index !== batchIndex));
  };

  const onSubmit = async (data: FormSchemaType) => {

    await createRequisition.mutateAsync({
      ...data,
      type: "GENERAL",
    });

    onClose();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col space-y-3">
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
          name="articles"
          render={({ field }: { field: any }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Artículos</FormLabel>
              <div className="mt-4 space-y-6">
                <ScrollArea className={cn("", batches.length > 1 ? "h-[400px]" : "")}>
                  {batches.map((batch, batchIndex) => (
                    <div key={batchIndex} className="mb-6 p-4 border rounded-lg">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium">Articulo {batchIndex + 1}</h4>
                        <Button
                          variant="ghost"
                          type="button"
                          size="sm"
                          onClick={() => removeBatch(batchIndex)}
                          className="text-red-500 hover:text-red-600"
                        >
                          Eliminar articulo
                        </Button>
                      </div>

                      <div className="space-y-3">
                        {batch.batch_articles.map((article, articleIndex) => (
                          <div key={articleIndex} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                            <Input
                              placeholder="Descripción"
                              value={article.description}
                              onChange={(e) => handleArticleChange(batchIndex, articleIndex, "description", e.target.value)}
                              className="flex-1"
                            />
                            <Input
                              type="number"
                              placeholder="Cantidad"
                              value={article.quantity || ""}
                              onChange={(e) => handleArticleChange(batchIndex, articleIndex, "quantity", Number(e.target.value))}
                              className="w-24"
                            />
                            <Button
                              variant="ghost"
                              type="button"
                              size="icon"
                              onClick={() => removeArticle(batchIndex, articleIndex)}
                              className="hover:text-red-500"
                            >
                              <MinusCircle className="size-4" />
                            </Button>
                          </div>
                        ))}

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addArticle(batchIndex)}
                          className="mt-2 gap-2"
                        >
                          <PlusCircle className="size-4" />
                          Agregar artículo
                        </Button>
                      </div>
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
                  placeholder="Ej: Necesidad de materiales para mantenimiento..."
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
          render={({ field: { onChange, value, ...fieldProps } }) => (
            <FormItem>
              <FormLabel>Imagen General</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  className="cursor-pointer"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? undefined;
                    onChange(file);
                  }}
                  {...fieldProps}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between items-center gap-x-4">
          <Separator className="flex-1" />
          <p className="text-muted-foreground">SIGEAC</p>
          <Separator className="flex-1" />
        </div>

        <Button disabled={createRequisition.isPending}>
          {isEditing ? "Editar Requisición" : "Generar Requisición"}
        </Button>
      </form>
    </Form>
  )
}
