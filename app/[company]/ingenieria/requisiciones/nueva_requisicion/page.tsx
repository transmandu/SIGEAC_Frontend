"use client";

import { useCreateRequisition } from "@/actions/mantenimiento/compras/requisiciones/actions";
import { CreateBatchDialog } from "@/components/dialogs/mantenimiento/almacen/CreateBatchDialog";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useGetSecondaryUnits } from "@/hooks/general/unidades/useGetSecondaryUnits";
import { useGetBatchesByLocationId } from "@/hooks/mantenimiento/almacen/renglones/useGetBatchesByLocationId";
import { useGetMaintenanceAircrafts } from "@/hooks/mantenimiento/planificacion/useGetMaintenanceAircrafts";
import { useGetWorkOrders } from "@/hooks/mantenimiento/planificacion/useGetWorkOrders";
import { useGetUserDepartamentEmployees } from "@/hooks/sistema/empleados/useGetUserDepartamentEmployees";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown, Loader2, MinusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface Article {
  part_number: string;
  alt_part_number?: string;
  justification: string;
  manual: string;
  reference_cod: string;
  pma?: string;
  quantity: number;
  image?: File;
  unit?: string;
  certificates?: string[];
}

interface Batch {
  batch: string;
  batch_name: string;
  category: string;
  batch_articles: Article[];
}

interface AircraftWithArticles {
  aircraft_id: string;
  articles: Batch[];
}

const FormSchema = z.object({
  justification: z.string().min(2, "La justificación debe tener al menos 2 caracteres."),
  company: z.string(),
  location_id: z.string(),
  work_order_id: z.string(),
  created_by: z.string(),
  requested_by: z.string({ required_error: "Debe ingresar quien lo solicita." }),
  type: z.string(),
  image: z
    .instanceof(File)
    .refine(file => file.size <= 5 * 1024 * 1024, "Max 5MB")
    .refine(file => ["image/jpeg", "image/png"].includes(file.type), "Solo JPEG/PNG")
    .optional(),
  aircrafts: z.array(
    z.object({
      aircraft_id: z.string(),
      articles: z.array(
        z.object({
          batch: z.string(),
          batch_name: z.string(),
          category: z.string(),
          batch_articles: z.array(
            z.object({
              part_number: z.string().optional(),
              alt_part_number: z.string().optional(),
              justification: z.string({ required_error: "Debe ingresar una justificación." }),
              manual: z.string({ required_error: "Debe ingresar un manual de referencia." }),
              reference_cod: z.string({ required_error: "Debe ingresar el código de referencia." }),
              pma: z.string().optional(),
              quantity: z.number().min(1, "Debe ingresar una cantidad válida"),
              image: z.instanceof(File).optional(),
              unit: z.string().optional(),
              certificates: z.array(z.string()).optional(),
            })
          ),
        })
      ),
    })
  ),
});

type FormSchemaType = z.infer<typeof FormSchema>;

const CreateRequisitionPage = () => {
  const { user } = useAuth();
  const { mutate, data: batches } = useGetBatchesByLocationId();
  const { selectedCompany, selectedStation } = useCompanyStore();
  const { data: employees, isPending: employeesLoading } = useGetUserDepartamentEmployees(selectedCompany?.slug);
  const { data: secondaryUnits, isLoading: secondaryUnitLoading } = useGetSecondaryUnits(selectedCompany?.slug);
  const { data: aircrafts, isLoading: isAircraftsLoading } = useGetMaintenanceAircrafts(selectedCompany?.slug);
  const { data: workOrders, isLoading: isWorkOrdersLoading } = useGetWorkOrders(selectedStation, selectedCompany?.slug);
  const { createRequisition } = useCreateRequisition();
  const router = useRouter();

  const [selectedAircrafts, setSelectedAircrafts] = useState<string[]>([]);
  const [aircraftsData, setAircraftsData] = useState<AircraftWithArticles[]>([]);
  const [openAircraft, setOpenAircraft] = useState(false);

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      justification: "",
      type: "AVIACION",
      requested_by: "",
      created_by: `${user?.username}`,
      aircrafts: [],
    },
  });

  useEffect(() => {
    if (user && selectedCompany && selectedStation) {
      form.setValue("created_by", user.id.toString());
      form.setValue("company", selectedCompany?.slug);
      form.setValue("location_id", selectedStation);
    }
  }, [user, form, selectedCompany, selectedStation]);

  useEffect(() => {
    if (selectedStation) {
      mutate({ location_id: Number(selectedStation), company: selectedCompany!.slug });
    }
  }, [selectedStation, mutate, selectedCompany]);

  const handleAircraftSelect = (aircraftId: string) => {
    setSelectedAircrafts(prev =>
      prev.includes(aircraftId)
        ? prev.filter(id => id !== aircraftId)
        : [...prev, aircraftId]
    );

    setAircraftsData(prev => {
      const exists = prev.find(a => a.aircraft_id === aircraftId);
      if (exists) return prev;
      return [...prev, { aircraft_id: aircraftId, articles: [] }];
    });
  };

  const isAircraftSelected = (aircraftId: string) => selectedAircrafts.includes(aircraftId);

  const handleBatchSelectForAircraft = (aircraftId: string, batch: any) => {
    setAircraftsData(prev =>
      prev.map(a =>
        a.aircraft_id === aircraftId
          ? {
              ...a,
              articles: a.articles.some(b => b.batch === batch.id.toString())
                ? a.articles.filter(b => b.batch !== batch.id.toString())
                : [
                    ...a.articles,
                    {
                      batch: batch.id.toString(),
                      batch_name: batch.name,
                      category: batch.category,
                      batch_articles: [
                        { part_number: "", alt_part_number: "", justification: "", manual: "", reference_cod: "", quantity: 0 },
                      ],
                    },
                  ],
            }
          : a
      )
    );
  };

  const handleArticleChange = (aircraftId: string, batchId: string, index: number, field: keyof Article, value: any) => {
    setAircraftsData(prev =>
      prev.map(a =>
        a.aircraft_id === aircraftId
          ? {
              ...a,
              articles: a.articles.map(batch =>
                batch.batch === batchId
                  ? {
                      ...batch,
                      batch_articles: batch.batch_articles.map((art, i) =>
                        i === index ? { ...art, [field]: value } : art
                      ),
                    }
                  : batch
              ),
            }
          : a
      )
    );
  };

  const addArticle = (aircraftId: string, batchId: string) => {
    setAircraftsData(prev =>
      prev.map(a =>
        a.aircraft_id === aircraftId
          ? {
              ...a,
              articles: a.articles.map(batch =>
                batch.batch === batchId
                  ? {
                      ...batch,
                      batch_articles: [
                        ...batch.batch_articles,
                        { part_number: "", alt_part_number: "", justification: "", manual: "", reference_cod: "", quantity: 0 },
                      ],
                    }
                  : batch
              ),
            }
          : a
      )
    );
  };

  const removeArticle = (aircraftId: string, batchId: string, index: number) => {
    setAircraftsData(prev =>
      prev.map(a =>
        a.aircraft_id === aircraftId
          ? {
              ...a,
              articles: a.articles.map(batch =>
                batch.batch === batchId
                  ? {
                      ...batch,
                      batch_articles: batch.batch_articles.filter((_, i) => i !== index),
                    }
                  : batch
              ),
            }
          : a
      )
    );
  };

  const removeBatchFromAircraft = (aircraftId: string, batchId: string) => {
    setAircraftsData(prev =>
      prev.map(a =>
        a.aircraft_id === aircraftId
          ? { ...a, articles: a.articles.filter(b => b.batch !== batchId) }
          : a
      )
    );
  };

  const onSubmit = async (data: FormSchemaType) => {
    // await createRequisition.mutateAsync({ data: { ...data, aircrafts: aircraftsData }, company: selectedCompany!.slug });
    // router.push(`/${selectedCompany!.slug}/general/requisiciones`);
    console.log(data)
  };

  return (
    <ContentLayout title="Solicitud de Compra">
      <div className="space-y-6">
        <h1 className="text-5xl font-bold text-center">Crear Nueva Solicitud de Compra</h1>
        <p className="text-muted-foreground text-center italic">
          Ingrese la información para crear una solicitud de compra de uno o múltiples artículos.
        </p>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col space-y-3">
            <div className="flex gap-2">
              {/* Solicitante */}
              <FormField
                control={form.control}
                name="requested_by"
                render={({ field }) => (
                  <FormItem className="flex flex-col w-full">
                    <FormLabel>Solicitante</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            disabled={employeesLoading}
                            variant="outline"
                            role="combobox"
                            className={cn("justify-between", !field.value && "text-muted-foreground")}
                          >
                            {employeesLoading && <Loader2 className="size-4 animate-spin mr-2" />}
                            {field.value
                              ? `${employees?.find(e => `${e.dni}` === field.value)?.first_name} ${employees?.find(e => `${e.dni}` === field.value)?.last_name}`
                              : "Elige al solicitante..."}
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
                              {employees?.map(employee => (
                                <CommandItem
                                  value={`${employee.dni}`}
                                  key={employee.id}
                                  onSelect={() => form.setValue("requested_by", `${employee.dni}`)}
                                >
                                  <Check className={cn("mr-2 h-4 w-4", `${employee.dni}` === field.value ? "opacity-100" : "opacity-0")} />
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
                )}
              />

              {/* Aeronaves */}
              <FormField
                control={form.control}
                name="aircrafts"
                render={() => (
                  <FormItem className="flex flex-col w-full">
                    <FormLabel>Aeronave(s)</FormLabel>
                    <Popover open={openAircraft} onOpenChange={setOpenAircraft}>
                      <PopoverTrigger asChild>
                        <Button disabled={isAircraftsLoading} variant="outline" className="justify-between">
                          {selectedAircrafts.length > 0 ? `${selectedAircrafts.length} seleccionadas` : "Seleccione aeronave(s)..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="p-0">
                        <Command>
                          <CommandInput placeholder="Buscar aeronave..." />
                          <CommandList>
                            <CommandEmpty>No hay aeronaves disponibles.</CommandEmpty>
                            <CommandGroup>
                              {aircrafts?.map(aircraft => (
                                <CommandItem key={aircraft.id} value={aircraft.id.toString()} onSelect={() => handleAircraftSelect(aircraft.id.toString())}>
                                  <Check className={cn("mr-2 h-4 w-4", isAircraftSelected(aircraft.id.toString()) ? "opacity-100" : "opacity-0")} />
                                  {aircraft.acronym}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                )}
              />
              {/* Orden de Trabajo */}

              <FormField
                control={form.control}
                name="work_order_id"
                render={({ field }) => (
                  <FormItem className="flex flex-col w-full">
                    <FormLabel>Ord. de Trabajo</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            disabled={isWorkOrdersLoading}
                            variant="outline"
                            role="combobox"
                            className={cn("justify-between", !field.value && "text-muted-foreground")}
                          >
                            {isWorkOrdersLoading && <Loader2 className="size-4 animate-spin mr-2" />}
                            {field.value
                              ? `${workOrders?.find(w => `${w.id}` === field.value)?.aircraft.acronym} - ${workOrders?.find(w => `${w.id}` === field.value)?.order_number}`
                              : "Elige al solicitante..."}
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
                              {workOrders?.map(workOrder => (
                                <CommandItem
                                  value={`${workOrder.aircraft.acronym} - ${workOrder.order_number}`}
                                  key={workOrder.id}
                                  onSelect={() => form.setValue("work_order_id", `${workOrder.id}`)}
                                >
                                  <Check className={cn("mr-2 h-4 w-4", `${workOrder.id}` === field.value ? "opacity-100" : "opacity-0")} />
                                  {workOrder.aircraft.acronym} {workOrder.order_number}
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

            </div>
            {/* Batches + Artículos por Aeronave */}
            {aircraftsData.map(a => {
              const aircraftInfo = aircrafts?.find(ac => ac.id.toString() === a.aircraft_id);
              return (
                <div key={a.aircraft_id} className="border p-4 rounded-lg space-y-4">
                  <h3 className="font-semibold">Aeronave: {aircraftInfo?.acronym}</h3>

                  {/* Selección de Batches */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-[200px] justify-between">
                        {a.articles.length > 0 ? `${a.articles.length} renglones selec...` : "Selec. renglón(es)..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0">
                      <Command>
                        <CommandInput placeholder="Buscar renglón..." />
                        <CommandList>
                          <CommandEmpty>No hay renglones disponibles.</CommandEmpty>
                          <CommandGroup>
                            <div className="flex justify-center m-2"><CreateBatchDialog /></div>
                            {batches?.map(batch => (
                              <CommandItem key={batch.id} value={batch.id.toString()} onSelect={() => handleBatchSelectForAircraft(a.aircraft_id, batch)}>
                                <Check className={cn("mr-2 h-4 w-4", a.articles.some(b => b.batch === batch.id.toString()) ? "opacity-100" : "opacity-0")} />
                                {batch.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  {/* Artículos por Batch */}
                  <div className="space-y-4">
                    {a.articles.map(batch => (
                      <div key={batch.batch} className="border p-3 rounded-md space-y-3 bg-gray-50">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">{batch.batch_name}</h4>
                          <Button variant="ghost" size="sm" onClick={() => removeBatchFromAircraft(a.aircraft_id, batch.batch)} className="text-red-500">
                            <MinusCircle className="mr-1" />Eliminar lote
                          </Button>
                        </div>

                        {batch.batch_articles.map((article, index) => (
                          <div key={index} className="p-4 border rounded-md bg-white space-y-2">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">

                              <div className="flex flex-col justify-center gap-2">
                                <Label>N° de Parte</Label>
                                <Input placeholder="N° de parte" value={article.part_number} onChange={e => handleArticleChange(a.aircraft_id, batch.batch, index, "part_number", e.target.value)} />
                              </div>

                              <div className="flex flex-col gap-2">
                                <Label>N/P Alterno</Label>
                                <Input placeholder="N/P Alterno" value={article.alt_part_number || ""} onChange={e => handleArticleChange(a.aircraft_id, batch.batch, index, "alt_part_number", e.target.value)} />
                              </div>

                              <div className="flex flex-col gap-2">
                                <Label>Manual</Label>
                                <Input placeholder="Manual" value={article.manual} onChange={e => handleArticleChange(a.aircraft_id, batch.batch, index, "manual", e.target.value)} />
                              </div>

                              <div className="flex flex-col gap-2">
                                <Label>Cod. de Referencia</Label>
                                <Input placeholder="Código Referencia" value={article.reference_cod} onChange={e => handleArticleChange(a.aircraft_id, batch.batch, index, "reference_cod", e.target.value)} />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                              <Input placeholder="PMA" value={article.pma || ""} onChange={e => handleArticleChange(a.aircraft_id, batch.batch, index, "pma", e.target.value)} />
                              <Select value={article.unit} onValueChange={v => handleArticleChange(a.aircraft_id, batch.batch, index, "unit", v)}>
                                <SelectTrigger><SelectValue placeholder="Unidad Secundaria" /></SelectTrigger>
                                <SelectContent>
                                  {secondaryUnits?.map(u => <SelectItem key={u.id} value={u.id.toString()}>{u.secondary_unit}</SelectItem>)}
                                </SelectContent>
                              </Select>
                              <Input type="number" placeholder="Cantidad" value={article.quantity} onChange={e => handleArticleChange(a.aircraft_id, batch.batch, index, "quantity", Number(e.target.value))} />
                              <Input type="file" accept="image/*" onChange={e => handleArticleChange(a.aircraft_id, batch.batch, index, "image", e.target.files?.[0])} />
                            </div>
                            <div className="flex justify-end space-x-2">
                              <Button size="sm" variant="outline" onClick={() => removeArticle(a.aircraft_id, batch.batch, index)}>Eliminar artículo</Button>
                              <Button size="sm" variant="outline" onClick={() => addArticle(a.aircraft_id, batch.batch)}>Agregar artículo</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            <div className="flex justify-center">
              <Button type="submit" className="mt-4">Crear Solicitud</Button>
            </div>
          </form>
        </Form>
      </div>
    </ContentLayout>
  );
};

export default CreateRequisitionPage;
