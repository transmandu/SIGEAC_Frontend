"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { useCreateRequisition } from "@/actions/mantenimiento/compras/requisiciones/actions";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useGetMaintenanceAircrafts } from "@/hooks/mantenimiento/planificacion/useGetMaintenanceAircrafts";
import { useGetWorkOrderEmployees } from "@/hooks/mantenimiento/planificacion/useGetWorkOrderEmployees";
import { useGetWorkOrders } from "@/hooks/mantenimiento/planificacion/useGetWorkOrders";
import { useGetGeneralArticles } from "@/hooks/mantenimiento/almacen/almacen_general/useGetGeneralArticles";
import { useGetArticle } from "@/hooks/mantenimiento/almacen/articulos/useGetArticle";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown, Loader2, MinusCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

// ----------------------
// Esquema del formulario
// ----------------------
const FormSchema = z.object({
  order_number: z.string().min(3, {
    message: "Debe ingresar un nro. de orden.",
  }),
  justification: z.string().min(5, {
    message: "La justificación debe tener al menos 5 caracteres.",
  }),
  company: z.string(),
  created_by: z.string(),
  aircraft_id: z.string().optional(),
  work_order_id: z.string().optional(),
  requested_by: z.string(),
  requisition_type: z.enum(["GENERAL", "AERONAUTICO"], {
    errorMap: () => ({ message: "Debe seleccionar el tipo de requisición" }),
  }),
  articles: z.array(
    z.union([
      z.object({
        id: z.number(),
        description: z.string(),
        quantity: z.number().min(1, "La cantidad debe ser mayor a 0"),
        type: z.literal("GENERAL"),
        variant_type: z.string(),
        brand_model: z.string(),
      }),
      z.object({
        id: z.number(),
        part_number: z.string(),
        serial: z.string(),
        quantity: z.number().min(1, "La cantidad debe ser mayor a 0"),
        type: z.literal("AERONAUTICO"),
      }),
    ])
  ).min(1, "Debe agregar al menos un artículo"),
});

type FormSchemaType = z.infer<typeof FormSchema>;

interface FormProps {
  onClose: () => void;
}

export function CreateRequisitionForm({ onClose }: FormProps) {
  const { user } = useAuth();
  const { selectedStation, selectedCompany } = useCompanyStore();
  const { createRequisition } = useCreateRequisition();

  const {
    data: employees,
    isLoading: employeesLoading,
    isError: employeesError,
  } = useGetWorkOrderEmployees({
    company: selectedCompany?.slug,
    location_id: selectedStation ?? undefined,
    acronym: "MANP",
  });

  const {
    data: aircrafts,
    isLoading: aircraftsLoading,
    isError: aircraftsError,
  } = useGetMaintenanceAircrafts(selectedCompany?.slug);

  const {
    data: workOrders,
    isLoading: workOrdersLoading,
    isError: workOrdersError,
  } = useGetWorkOrders(selectedStation ?? null, selectedCompany?.slug);

  const {
    data: generalArticles,
    isLoading: generalArticlesLoading,
    refetch: refetchGeneralArticles,
  } = useGetGeneralArticles();

  const [selectedArticles, setSelectedArticles] = useState<FormSchemaType["articles"]>([]);

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      order_number: "",
      justification: "",
      requested_by: "",
      company: "",
      created_by: "",
      requisition_type: "GENERAL",
      articles: [],
    },
  });

  // ----------------------
  // Efectos iniciales
  // ----------------------
  useEffect(() => {
    if (user && selectedCompany) {
      form.setValue("created_by", user.id.toString());
      form.setValue("company", selectedCompany.slug);
    }
  }, [user, selectedCompany, form]);

  useEffect(() => {
    form.setValue("articles", selectedArticles);
  }, [selectedArticles, form]);

  useEffect(() => {
    // Refetch de artículos al cambiar tipo de requisición
    if (form.getValues("requisition_type") === "GENERAL") {
      refetchGeneralArticles();
    }
  }, [form.watch("requisition_type"), refetchGeneralArticles]);

  // ----------------------
  // Funciones de manejo de artículos
  // ----------------------
  const addArticle = (article: any) => {
    if (!selectedArticles.some((a) => a.id === article.id)) {
      setSelectedArticles((prev) => [...prev, article]);
    }
  };

  const removeArticle = (articleId: number) => {
    setSelectedArticles((prev) => prev.filter((a) => a.id !== articleId));
  };

  const updateArticleQuantity = (articleId: number, quantity: number) => {
    setSelectedArticles((prev) =>
      prev.map((a) => (a.id === articleId ? { ...a, quantity } : a))
    );
  };

  // ----------------------
  // Submit del formulario
  // ----------------------
  const onSubmit = async (data: FormSchemaType) => {
    const formattedData = {
      ...data,
      type: data.requisition_type,
      work_order_id: data.work_order_id ? Number(data.work_order_id) : null,
      aircraft_id: data.aircraft_id ? Number(data.aircraft_id) : null,
    };
    console.log(formattedData);
    // await createRequisition.mutateAsync({data: formattedData, company: selectedCompany!.slug})
    // onClose();
  };

  // ----------------------
  // Renderizado
  // ----------------------
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col space-y-3"
      >
        {/* Nro. de Orden y Orden de Trabajo */}
        <div className="flex gap-2 items-center">
          <FormField
            control={form.control}
            name="order_number"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Nro. de Orden</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: 001OCA, etc..." {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="work_order_id"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Ord. de Trabajo</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger disabled={workOrdersLoading}>
                      <SelectValue placeholder="Seleccione WO..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {workOrders &&
                      workOrders.map((wo) => (
                        <SelectItem value={wo.id.toString()} key={wo.id}>
                          {wo.order_number}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          {/* Solicitante */}
          <FormField
            control={form.control}
            name="requested_by"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Solicitante</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        disabled={employeesLoading}
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-[200px] justify-between",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {employeesLoading && (
                          <Loader2 className="size-4 animate-spin mr-2" />
                        )}
                        {field.value
                          ? field.value
                          : "Elige al solicitante..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0">
                    <Command>
                      <CommandInput placeholder="Busque un empleado..." />
                      <CommandList>
                        <CommandEmpty>
                          No se ha encontrado un empleado.
                        </CommandEmpty>
                        <CommandGroup>
                          {employees?.map((employee) => (
                            <CommandItem
                              value={`${employee.first_name} ${employee.last_name}`}
                              key={employee.id}
                              onSelect={() =>
                                form.setValue(
                                  "requested_by",
                                  `${employee.first_name} ${employee.last_name}`
                                )
                              }
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  `${employee.first_name} ${employee.last_name}` ===
                                    field.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {employee.first_name} {employee.last_name}
                            </CommandItem>
                          ))}
                          {employeesError && (
                            <p className="text-sm text-muted-foreground">
                              Ha ocurrido un error al cargar los datos...
                            </p>
                          )}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Tipo de Requisición */}
        <FormField
          control={form.control}
          name="requisition_type"
          render={({ field }) => (
            <FormItem className="w-1/2">
              <FormLabel>Tipo de Requisición</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione tipo..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="GENERAL">General</SelectItem>
                  <SelectItem value="AERONAUTICO">Aeronáutico</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Artículos */}
        <FormField
          control={form.control}
          name="articles"
          render={({ field }) => (
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
                        ? `${selectedBatches.length} lotes seleccionados`
                        : "Seleccione un lote..."}
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
                        {data &&
                          data
                            .filter((batch): batch is NonNullable<typeof batch> => Boolean(batch))
                            .map((batch) =>
                              batch ? (
                                <CommandItem
                                  key={batch.id}
                                  value={batch.id.toString()}
                                  onSelect={() =>
                                    handleBatchSelect(
                                      batch?.name ?? "Sin nombre",
                                      batch.id.toString()
                                    )
                                  }
                                >
                                  {batch?.name ?? "Sin nombre"}
                                </CommandItem>
                              ) : null
                        )}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <div className="mt-4 space-y-4">
                <ScrollArea
                  className={cn("", selectedArticles.length > 2 ? "h-[300px]" : "")}
                >
                  {selectedArticles.map((article, index) => (
                    <div key={article.id} className="flex items-center space-x-2 mt-2">
                      {article.type === "GENERAL" ? (
                        <>
                          <Input
                            value={article.description}
                            disabled
                            className="flex-1"
                          />
                        </>
                      ) : (
                        <>
                          <Input
                            value={article.part_number}
                            disabled
                            className="flex-1"
                          />
                        </>
                      )}
                      <Input
                        type="number"
                        min={1}
                        value={article.quantity}
                        onChange={(e) =>
                          updateArticleQuantity(article.id, Number(e.target.value))
                        }
                        className="w-[80px]"
                      />
                      <Button
                        variant="ghost"
                        type="button"
                        size="icon"
                        onClick={() => removeArticle(article.id)}
                      >
                        <MinusCircle className="size-4" />
                      </Button>
                    </div>
                  ))}
                </ScrollArea>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Justificación */}
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

        {/* Separador */}
        <div className="flex justify-between items-center gap-x-4">
          <Separator className="flex-1" />
          <p className="text-muted-foreground">SIGEAC</p>
          <Separator className="flex-1" />
        </div>

        {/* Submit */}
        <Button disabled={createRequisition.isPending}>
          Generar Requisición
        </Button>
      </form>
    </Form>
  );
}
