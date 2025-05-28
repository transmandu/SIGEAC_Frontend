"use client"

import { useCreateDispatchRequest } from "@/actions/almacen/solicitudes/salida/action"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/AuthContext"
import { useGetBatchesWithInWarehouseArticles } from "@/hooks/almacen/useGetBatchesWithInWarehouseArticles"
import { useGetWorkOrderEmployees } from "@/hooks/planificacion/useGetWorkOrderEmployees"
import { useGetWorkOrders } from "@/hooks/planificacion/useGetWorkOrders"
import { cn } from "@/lib/utils"
import { useCompanyStore } from "@/stores/CompanyStore"
import { Article, Batch } from "@/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, Check, ChevronsUpDown, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Calendar } from "../ui/calendar"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Textarea } from "../ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const FormSchema = z.object({
  requested_by: z.string(),
  submission_date: z.date({
    message: "Debe ingresar la fecha."
  }),
  articles: z.array(z.object({
    article_id: z.coerce.number(),
    serial: z.string().nullable(),
    quantity: z.number(),
    batch_id: z.number(),
  }), {
    message: "Debe seleccionar el (los) articulos que se van a despachar."
  }),
  justification: z.string({
    message: "Debe ingresar una justificación de la salida."
  }),
  destination_place: z.string(),
  status: z.string(),
})

type FormSchemaType = z.infer<typeof FormSchema>

interface FormProps {
  onClose: () => void
}

interface BatchesWithCountProp extends Batch {
  articles: Article[],
  batch_id: number,
}

export function ComponentDispatchForm({ onClose }: FormProps) {

  const { user } = useAuth();

  const [open, setOpen] = useState(false);

  const [filteredBatches, setFilteredBatches] = useState<BatchesWithCountProp[]>([]);

  const [articleSelected, setArticleSelected] = useState<Article>();

  const { createDispatchRequest } = useCreateDispatchRequest();

  const { selectedStation } = useCompanyStore();

  const { mutate, data: batches, isPending: isBatchesLoading, isError } = useGetBatchesWithInWarehouseArticles();

  const { data: employees, isLoading: employeesLoading, isError: employeesError } = useGetWorkOrderEmployees();

  const { data: workOrders, isLoading } = useGetWorkOrders(selectedStation ?? null);

  useEffect(() => {
    if (selectedStation) {
      mutate(Number(selectedStation))
    }
  }, [selectedStation, mutate])

  useEffect(() => {
    if (batches) {
      // Filtrar los batches por categoría
      const filtered = batches.filter((batch) => batch.category === "componente");
      setFilteredBatches(filtered);
    }
  }, [batches]);

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      articles: [],
      justification: "",
      requested_by: `${user?.first_name} ${user?.last_name}`,
      destination_place: "",
      status: "proceso",
    },
  });

  const { setValue } = form;

  const onSubmit = async (data: FormSchemaType) => {
    const formattedData = {
      ...data,
      created_by: user?.first_name + " " + user?.last_name,
      submission_date: format(data.submission_date, "yyyy-MM-dd"),
      category: "componente",
    }
    await createDispatchRequest.mutateAsync({
      ...formattedData,
      user_id: user!.id
    });
    onClose();
  }

  const handleArticleSelect = (id: number, serial: string | null, batch_id: number) => {
    setValue('articles', [{ article_id: Number(id), serial: serial ? serial : null, quantity: 1, batch_id: Number(batch_id) }])
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col space-y-3 w-full">
        <div className="flex gap-2">
          <FormField
            control={form.control}
            name="requested_by"
            render={({ field }) => (
              <FormItem className="w-1/2">
                <FormLabel>Recibe / MTTO</FormLabel>
                <Select onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione el responsable..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {
                      employeesLoading && <Loader2 className="size-4 animate-spin" />
                    }
                    {
                      employees && employees.map((employee) => (
                        <SelectItem key={employee.id} value={`${employee.first_name} ${employee.last_name}`}>{employee.first_name} {employee.last_name} - {employee.job_title.name}</SelectItem>
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
            name="articles"
            render={({ field }) => (
              <FormItem className="flex flex-col mt-2.5">
                <FormLabel>Componente a Retirar</FormLabel>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-[200px] justify-between"
                    >
                      {articleSelected
                        ? `${articleSelected.serial}`
                        : "Selec. el componente"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0">
                    <Command>
                      <CommandInput placeholder="Selec. el componente..." />
                      <CommandList>
                        <CommandEmpty>No se han encontrado componentes...</CommandEmpty>
                        {
                          filteredBatches?.map((batch) => (
                            <CommandGroup key={batch.batch_id} heading={batch.name}>
                              {
                                batch.articles.map((article) => (
                                  <CommandItem key={article.id} onSelect={() => {
                                    handleArticleSelect(article.id!, article?.serial ?? null, batch.batch_id)
                                    setArticleSelected(article)
                                  }}><Check className={cn("mr-2 h-4 w-4", articleSelected?.id === article.id ? "opacity-100" : "opacity-0")} />
                                    {article.serial}</CommandItem>
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
        </div>
        <div className="flex gap-2">
          <FormField
            control={form.control}
            name="submission_date"
            render={({ field }) => (
              <FormItem className="flex flex-col mt-2.5">
                <FormLabel>Fecha de Solicitud</FormLabel>
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
                          format(field.value, "PPP", {
                            locale: es
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
                <FormControl>
                  <Input className="w-[230px]" placeholder="Ej: Jefatura de Desarrollo, etc..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="justification"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Justificacion</FormLabel>
              <FormControl>
                <Textarea rows={5} className="w-full" placeholder="EJ: Se necesita para la limpieza de..." {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <Button className="bg-primary mt-2 text-white hover:bg-blue-900 disabled:bg-primary/70" disabled={createDispatchRequest?.isPending} type="submit">
          {createDispatchRequest?.isPending ? <Loader2 className="size-4 animate-spin" /> : <p>Crear</p>}
        </Button>
      </form>
    </Form >
  )
}
