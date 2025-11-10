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
import { CalendarIcon, Check, ChevronsUpDown, Loader2 } from "lucide-react";
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
    .optional(), // Nuevo campo
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

  // ❌ ELIMINAR estas líneas (95-97):
  // const [filteredBatches, setFilteredBatches] = useState<
  //   BatchesWithCountProp[]
  // >([]);

  const [articleSelected, setArticleSelected] = useState<Article>();
  const [isDepartment, setIsDepartment] = useState(false);

  const { createDispatchRequest } = useCreateDispatchRequest();

  const { data: departments, isLoading: isDepartmentsLo } = useGetDepartments(
    selectedCompany?.slug
  );

  const { data: aircrafts, isLoading: isAircraftsLoading } = useGetMaintenanceAircrafts(
    selectedCompany?.slug
  );

  const {
    data: batches,
    isPending: isBatchesLoading,
  } = useGetBatchesWithInWarehouseArticles({
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

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      justification: "",
      requested_by: `${user?.employee[0].dni}`,
      destination_place: "",
      status: "proceso",
    },
  });

  // useEffect(() => {
  //   if (batches) {
  //     // Filtrar los batches por categoría
  //     const filtered = batches.filter(
  //       (batch) => batch.category === "consumible"
  //     );
  //     setFilteredBatches(filtered);
  //   }
  // }, [batches]);

  useEffect(() => {
    const unit = form.watch("unit");
    const currentQuantity = parseFloat(quantity) || 0;
    const article = form.getValues("articles");
    if (articleSelected?.unit !== "unidades") {
      const newQuantity =
        unit === "mililitros" ? currentQuantity / 1000 : currentQuantity;

      form.setValue("articles", {
        ...article,
        quantity: newQuantity,
      });
    } else {
      // Si es "unidades", no se realiza conversión
      form.setValue("articles", {
        ...article,
        quantity: currentQuantity,
      });
    }
  }, [quantity, articleSelected, form]);

  // Limpiar destination_place cuando cambia el tipo de destino
  useEffect(() => {
    form.setValue("destination_place", "");
  }, [isDepartment, form]);

  const { setValue } = form;

  const onSubmit = async (data: FormSchemaType) => {
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
      // Actualizar el valor del campo "unit" en el formulario
      if (selectedArticle.unit === "u") {
        form.setValue("unit", undefined); // Ocultar el RadioGroup si es "unidades"
      } else {
        form.setValue("unit", "litros"); // Establecer un valor predeterminado si es "litros"
      }

      // Actualizar el estado del artículo seleccionado
      setValue("articles", {
        article_id: Number(id),
        serial: serial ? serial : null,
        quantity: 0,
        batch_id: Number(batch_id),
      });

      setArticleSelected(selectedArticle);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col space-y-4 w-full"
      >
        {/* Sección: Personal Responsable */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-px flex-1 bg-border"></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Personal Responsable</span>
            <div className="h-px flex-1 bg-border"></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="delivered_by"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Entregado por:</FormLabel>
                <Select 
                  onValueChange={field.onChange}
                  disabled={warehouseEmployeesLoading || !selectedStation}
                >
                  <FormControl>
                    <SelectTrigger>
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
                    {!warehouseEmployeesLoading && !employeesError && warehouseEmployees && warehouseEmployees.length === 0 && (
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
                <FormLabel>Recibe / MTTO</FormLabel>
                <Select onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione el responsable..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {employeesLoading && (
                      <Loader2 className="size-4 animate-spin" />
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
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-px flex-1 bg-border"></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Información de la Solicitud</span>
            <div className="h-px flex-1 bg-border"></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="submission_date"
            render={({ field }) => (
              <FormItem className="flex flex-col w-full">
                <FormLabel>Fecha de Solicitud</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
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
                    <FormLabel className="flex items-center gap-2">
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
                        onCheckedChange={(checked) => setIsDepartment(checked as boolean)}
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
                    disabled={isDepartment ? isDepartmentsLo : isAircraftsLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
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
                          {!isDepartmentsLo && departments && departments.length === 0 && (
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
                          {!isAircraftsLoading && aircrafts && aircrafts.length === 0 && (
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
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-px flex-1 bg-border"></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Artículo a Retirar</span>
            <div className="h-px flex-1 bg-border"></div>
          </div>
          <div className="flex gap-2">
            <FormField
              control={form.control}
              name="articles"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Consumible a Retirar</FormLabel>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between"
                        disabled={isBatchesLoading}
                      >
                        {isBatchesLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            <span className="text-muted-foreground">Cargando...</span>
                          </>
                        ) : articleSelected ? (
                          <span className="truncate">{articleSelected.part_number}</span>
                        ) : (
                          <span className="text-muted-foreground">Seleccione el consumible...</span>
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0" align="start">
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
                                          article.serial ? article.serial : null,
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
                                        <span className="font-medium truncate">{article.part_number}</span>
                                        <span className="text-xs text-muted-foreground">
                                          Disponible: {article.quantity} {article.unit}
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
            <div className="flex items-end gap-4">
              <div className="flex flex-col space-y-2 flex-1">
                <Label>Cantidad</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  disabled={!articleSelected}
                  value={quantity}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    if (articleSelected && value <= 0) {
                      setQuantity(articleSelected.quantity!.toString());
                      form.setError("articles.quantity", {
                        type: "manual",
                        message: `La cantidad no puede ser menor a 0`,
                      });
                    } else {
                      setQuantity(e.target.value);
                      form.clearErrors("articles.quantity");
                    }
                  }}
                  placeholder={
                    articleSelected 
                      ? `Máx: ${articleSelected.quantity} ${articleSelected.unit}` 
                      : "Ingrese la cantidad..."
                  }
                  className="w-full"
                />
                {articleSelected && (
                  <p className="text-xs text-muted-foreground">
                    Disponible: {articleSelected.quantity} {articleSelected.unit}
                  </p>
                )}
              </div>
              {articleSelected && articleSelected.unit === "L" && (
                <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Unidad</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="litros" id="litros" />
                            <Label htmlFor="litros" className="cursor-pointer">Litros</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value="mililitros"
                              id="mililitros"
                            />
                            <Label htmlFor="mililitros" className="cursor-pointer">Mililitros</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          </div>

          {/* Sección: Justificación */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-px flex-1 bg-border"></div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Justificación</span>
              <div className="h-px flex-1 bg-border"></div>
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
        </div>

        <Separator className="my-2" />

        {/* Botón de acción */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={createDispatchRequest?.isPending}
          >
            Cancelar
          </Button>
          <Button
            className="bg-primary text-white hover:bg-primary/90 disabled:bg-primary/70 min-w-[120px]"
            disabled={createDispatchRequest?.isPending}
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