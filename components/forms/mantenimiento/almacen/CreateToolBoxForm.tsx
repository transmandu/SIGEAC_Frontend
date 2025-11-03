"use client"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

import { useCreateToolBox } from "@/actions/mantenimiento/almacen/inventario/caja_herramientas/actions"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/AuthContext"
import { useGetBatchesWithInWarehouseArticles } from "@/hooks/mantenimiento/almacen/renglones/useGetBatchesWithInWarehouseArticles"
import { useGetEmployeesForBox } from "@/hooks/mantenimiento/almacen/caja_herramientas/useGetEmployeeForBox"
import { useGetEditToolBoxTools } from "@/hooks/mantenimiento/almacen/caja_herramientas/useGetToolBoxTools"
import { cn } from "@/lib/utils"
import { useCompanyStore } from "@/stores/CompanyStore"
import { Article, Batch, ToolBox } from "@/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Badge } from "../../../ui/badge"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../../../ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "../../../ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../ui/select"
import { Separator } from "../../../ui/separator"

const FormSchema = z.object({
  name: z.string().min(3, {
    message: "El usuario debe tener al menos 3 caracteres.",
  }),
  created_by: z.string(),
  delivered_by: z.string(),
  employee_dni: z.string(),
  tool_id: z.array(z.string()),
})

type FormSchemaType = z.infer<typeof FormSchema>

interface FormProps {
  onClose: () => void,
  initialData?: ToolBox,
}

interface BatchesWithCountProp extends Batch {
  articles: Article[],
  batch_id: number,
}

export function CreateToolBoxForm({ onClose, initialData }: FormProps) {


  const { user } = useAuth()

  const [selectedTools, setSelectedTools] = useState<string[]>([])

  const [openArticles, setOpenArticles] = useState(false);

  const [filteredBatches, setFilteredBatches] = useState<BatchesWithCountProp[]>([]);

  const { selectedStation, selectedCompany } = useCompanyStore()

  const { createToolBox } = useCreateToolBox()

  const { data: employees, isLoading: employeesLoading, isError: employeesError } = useGetEmployeesForBox(selectedStation ?? null, selectedCompany!.slug);

  const { data: batches, isPending: isBatchesLoading, isError } = useGetBatchesWithInWarehouseArticles({location_id: Number(selectedStation!), company: selectedCompany!.slug, category: "herramienta"});

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: initialData?.name || "",
      created_by: initialData?.created_by || "",
      delivered_by: initialData?.delivered_by || "",
      employee_dni: initialData?.employee.dni || "",
    },
  })

  const handleToolSelect = (currentValue: string) => {
    setSelectedTools((prevSelected) =>
      prevSelected.includes(currentValue)
        ? prevSelected.filter((value) => value !== currentValue)
        : [...prevSelected, currentValue]
    );
  };

  const isToolSelected = (value: string) => selectedTools.includes(value);

  // useEffect(() => {
  //   if (selectedStation && selectedCompany) {
  //     mutate({location_id: Number(selectedStation), company: selectedCompany!.slug})
  //   }
  // }, [selectedStation, mutate, selectedCompany])

  // useEffect(() => {
  //   if (batches) {
  //     // Filtrar los batches por categoría
  //     const filtered = batches.filter((batch) => batch.category === "herramienta");
  //     setFilteredBatches(filtered);
  //   }
  // }, [batches]);

  useEffect(() => {
    form.setValue('tool_id', selectedTools);
  }, [selectedTools, form]);

  const onSubmit = async (data: FormSchemaType) => {
    const formattedData = {
      ...data,
      created_by: `${user?.first_name} ${user?.last_name}`,
      delivered_by: `${user?.first_name} ${user?.last_name}`,
    }
    await createToolBox.mutateAsync({data: formattedData, company: selectedCompany!.slug})
    onClose();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col space-y-3">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre de la Caja</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Caja de John Doe..." {...field} />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="employee_dni"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Responsable</FormLabel>
              <Select onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue defaultValue={initialData?.employee.id.toString() || ""} placeholder="Seleccione al responsable..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {
                    employeesLoading && <Loader2 className="size-4 animate-spin" />
                  }
                  {
                    employees && employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.dni}>{employee.first_name} {employee.last_name} - {employee.job_title.name}</SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tool_id"
          render={({ field }) => (
            <FormItem className="flex flex-col mt-2.5">
              <FormLabel>Herramientas a Ingresar</FormLabel>
              <Popover open={openArticles} onOpenChange={setOpenArticles}>
                <PopoverTrigger asChild>
                  <Button
                    disabled={isBatchesLoading}
                    variant="outline"
                    role="combobox"
                    className="w-[200px] justify-between"
                  >
                    {selectedTools?.length > 0 && (
                      <>
                        <Separator orientation="vertical" className="mx-2 h-4" />
                        <Badge
                          variant="secondary"
                          className="rounded-sm px-1 font-normal lg:hidden"
                        >
                          {selectedTools.length}
                        </Badge>
                        <div className="hidden space-x-1 lg:flex">
                          {selectedTools.length && (
                            <Badge
                              variant="secondary"
                              className="rounded-sm px-1 font-normal"
                            >
                              {selectedTools.length} seleccionados
                            </Badge>
                          )
                          }
                        </div>
                      </>
                    )}
                    {
                      selectedTools.length <= 0 && "Seleccione..."
                    }
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput placeholder="Buscar herramienta..." />
                    <CommandList>
                      <CommandEmpty className="text-muted-foreground text-xs p-2 text-center">No se han encontrado herramientas disponibles...</CommandEmpty>
                      {
                        filteredBatches?.map((batch) => (
                          <CommandGroup key={batch.batch_id} heading={batch.name}>
                            {
                              batch.articles.map((article) => (
                                <CommandItem key={article.id} onSelect={() => {
                                  handleToolSelect(article.id?.toString()!)
                                }}><Check className={cn("mr-2 h-4 w-4", isToolSelected(article.id!.toString()) ? "opacity-100" : "opacity-0")} />
                                  SN - {article.serial}
                                  <span className="hidden">
                                    {article.serial} {batch.name}
                                  </span></CommandItem>
                              ))
                            }
                          </CommandGroup>
                        ))
                      }
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-between items-center gap-x-4">
          <Separator className="flex-1" />
          <p className="text-muted-foreground">SIGEAC</p>
          <Separator className="flex-1" />
        </div>
        <Button disabled={createToolBox.isPending}>{createToolBox.isPending ? <Loader2 className="animate-spin size-4" /> : "Crear Caja "}</Button>
      </form>
    </Form >
  )
}
