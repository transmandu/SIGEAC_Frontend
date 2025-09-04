"use client";

import {
  useConfirmIncomingArticle,
  useCreateArticle,
} from "@/actions/mantenimiento/almacen/inventario/articulos/actions";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
import { useGetConditions } from "@/hooks/administracion/useGetConditions";
import { useGetManufacturers } from "@/hooks/general/fabricantes/useGetManufacturers";
import { useGetSecondaryUnits } from "@/hooks/general/unidades/useGetSecondaryUnits";
import { useGetBatchesByLocationId } from "@/hooks/mantenimiento/almacen/renglones/useGetBatchesByLocationId";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import { Article, Batch, Convertion } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { addYears, format, subYears } from "date-fns";
import { es } from "date-fns/locale";
import {
  CalendarIcon,
  Check,
  ChevronsUpDown,
  FileUpIcon,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Checkbox } from "../../../ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../../../ui/command";
import { Label } from "../../../ui/label";
import { Textarea } from "../../../ui/textarea";
import { MultiInputField } from "../../../misc/MultiInputField";

const formSchema = z.object({
  article_type: z.string().optional(),
  part_number: z.string().min(2, {
    message: "El serial debe contener al menos 2 carácteres.",
  }),
  alternative_part_number: z
    .array(
      z.string().min(2, {
        message:
          "Cada número de parte alterno debe contener al menos 2 carácteres.",
      })
    )
    .optional(),
  description: z
    .string({
      message: "Debe ingresar la descripción del articulo.",
    })
    .min(2, {
      message: "La descripción debe contener al menos 2 carácteres.",
    }),
  zone: z.string({
    message: "Debe ingresar la ubicación del articulo.",
  }),
  caducate_date: z
    .string({
      required_error: "A date of birth is required.",
    })
    .optional(),
  fabrication_date: z
    .string({
      required_error: "A date of birth is required.",
    })
    .optional(),
  manufacturer_id: z.string({
    message: "Debe ingresar una marca.",
  }),
  condition_id: z
    .string({
      message: "Debe ingresar la condición del articulo.",
    })
    .optional(),
  quantity: z.coerce
    .number({
      message: "Debe ingresar una cantidad de articulos.",
    })
    .nonnegative({
      message: "No puede ingresar valores negativos.",
    }),
  batches_id: z.string({
    message: "Debe ingresar un lote.",
  }),
  is_managed: z.boolean().optional(),
  certificate_8130: z
    .instanceof(File, { message: "Please upload a file." })
    .refine((f) => f.size < 10000_000, "Max 100Kb upload size.")
    .optional(),

  certificate_fabricant: z
    .instanceof(File, { message: "Please upload a file." })
    .refine((f) => f.size < 100_000, "Max 100Kb upload size.")
    .optional(),

  certificate_vendor: z
    .instanceof(File, { message: "Please upload a file." })
    .refine((f) => f.size < 10000_000, "Max 100Kb upload size.")
    .optional(),
  image: z.instanceof(File).optional(),
});

interface EditingArticle extends Article {
  batches: Batch;
  consumable?: {
    article_id: number;
    is_managed: boolean;
    convertions: Convertion[];
    quantity: number;
    shell_time: {
      caducate_date: Date;
      fabrication_date: string;
      consumable_id: string;
    };
  };
}

const CreateConsumableForm = ({
  initialData,
  isEditing,
}: {
  initialData?: EditingArticle;
  isEditing?: boolean;
}) => {
  const router = useRouter();

  const [open, setOpen] = useState(false);

  const [secondaryQuantity, setSecondaryQuantity] = useState<number>();

  const [secondarySelected, setSecondarySelected] = useState<Convertion | null>(
    null
  );

  const [filteredBatches, setFilteredBatches] = useState<Batch[]>();

  const [fabricationDate, setFabricationDate] = useState<Date>();

  const [caducateDate, setCaducateDate] = useState<Date>();

  const { createArticle } = useCreateArticle();

  const { confirmIncoming } = useConfirmIncomingArticle();

  const { selectedStation, selectedCompany } = useCompanyStore();

  const {
    data: secondaryUnits,
    isLoading: secondaryLoading,
    isError: secondaryError,
  } = useGetSecondaryUnits(selectedCompany?.slug);

  const {
    data: manufacturers,
    isLoading: isManufacturerLoading,
    isError: isManufacturerError,
  } = useGetManufacturers(selectedCompany?.slug);

  const {
    data: conditions,
    isLoading: isConditionsLoading,
    error: isConditionsError,
  } = useGetConditions(selectedCompany?.slug);

  const {
    mutate,
    data: batches,
    isPending: isBatchesLoading,
    isError,
  } = useGetBatchesByLocationId();

  useEffect(() => {
    if (selectedStation) {
      mutate({location_id: Number(selectedStation), company: selectedCompany!.slug})
    }
  }, [selectedStation, selectedCompany, mutate]);

  useEffect(() => {
    if (batches) {
      // Filtrar los batches por categoría
      const filtered = batches.filter(
        (batch) => batch.category === "consumible"
      );
      setFilteredBatches(filtered);
    }
  }, [batches]);

  useEffect(() => {
    if (initialData && initialData.consumable) {
      setSecondarySelected(initialData.consumable!.convertions[0]);
    }
  }, [initialData]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      part_number: initialData?.part_number || undefined,
      alternative_part_number: initialData?.alternative_part_number || [],
      batches_id: initialData?.batches.id?.toString() || undefined,
      manufacturer_id: initialData?.manufacturer?.id.toString() || undefined,
      condition_id: initialData?.condition?.id.toString() || undefined,
      description: initialData?.description || "",
      zone: initialData?.zone || undefined,
    },
  });
  form.setValue("article_type", "consumible");

  useEffect(() => {
    if (secondarySelected && secondaryQuantity) {
      const quantity =
        secondarySelected.convertion_rate *
        secondarySelected.quantity_unit *
        secondaryQuantity;
      form.setValue("quantity", quantity);
      console.log(quantity);
    }
  }, [form, secondarySelected, secondaryQuantity]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const formattedValues = {
      ...values,
      caducate_date: caducateDate && format(caducateDate, "yyyy-MM-dd"),
      fabrication_date:
        fabricationDate && format(fabricationDate, "yyyy-MM-dd"),
      batches_id: Number(values.batches_id),
      convertion_id: secondarySelected?.id,
    };
    if (isEditing) {
      const formattedValues = {
        ...values,
        id: initialData?.id,
        certificate_8130:
          values.certificate_8130 || initialData?.certifcate_8130,
        certificate_fabricant:
          values.certificate_fabricant || initialData?.certifcate_fabricant,
        certificate_vendor:
          values.certificate_vendor || initialData?.certifcate_vendor,
        status: "Stored",
      };

      await confirmIncoming.mutateAsync({values: formattedValues, company: selectedCompany!.slug})
      router.push(`/${selectedCompany?.slug}/almacen/ingreso/en_recepcion`)
    } else {
      createArticle.mutate({
        data: formattedValues,
        company: selectedCompany!.slug,
      });
    }
  };
  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-4 max-w-6xl mx-auto"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="max-w-7xl flex flex-col lg:flex-row gap-2 w-full">
          <FormField
            control={form.control}
            name="part_number"
            render={({ field }) => (
              <FormItem className="w-full xl:w-1/3">
                <FormLabel>Nro. de Parte</FormLabel>
                <FormControl>
                  <Input placeholder="EJ: 234ABAC" {...field} />
                </FormControl>
                <FormDescription>
                  Identificador único del articulo.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="alternative_part_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nro. de Parte Alternos</FormLabel>
                <FormControl>
                  <MultiInputField
                    values={field.value || []}
                    onChange={field.onChange}
                    placeholder="EJ: 234ABAC"
                  />
                </FormControl>
                <FormDescription>
                  Identificadores alternativos del artículo.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="max-w-7xl flex flex-col lg:flex-row gap-2 justify-center items-center w-full">
          <FormField
            control={form.control}
            name="condition_id"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Condición</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger disabled={isConditionsLoading}>
                      <SelectValue placeholder="Seleccione..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {conditions &&
                      conditions.map((condition) => (
                        <SelectItem
                          key={condition.id}
                          value={condition.id.toString()}
                        >
                          {condition.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <FormDescription>Estado físico del articulo.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="fabrication_date"
            render={({ field }) => (
              <FormItem className="flex flex-col p-0 mt-2.5 w-full">
                <FormLabel>Fecha de Fabricacion</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !fabricationDate && "text-muted-foreground"
                        )}
                      >
                        {fabricationDate ? (
                          format(fabricationDate, "PPP", {
                            locale: es,
                          })
                        ) : (
                          <span>Seleccione una fecha</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Select
                      onValueChange={(value) =>
                        setFabricationDate(
                          subYears(new Date(), parseInt(value))
                        )
                      }
                    >
                      <SelectTrigger className="p-3">
                        <SelectValue placeholder="Seleccione una opcion..." />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        <SelectItem value="0">Actual</SelectItem>
                        <SelectItem value="5">Ir 5 años atrás</SelectItem>
                        <SelectItem value="10">Ir 10 años atrás</SelectItem>
                        <SelectItem value="15">Ir 15 años atrás</SelectItem>
                      </SelectContent>
                    </Select>
                    <Calendar
                      locale={es}
                      mode="single"
                      selected={fabricationDate}
                      onSelect={setFabricationDate}
                      initialFocus
                      month={fabricationDate}
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  Fecha de creación del articulo.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="caducate_date"
            render={({ field }) => (
              <FormItem className="flex flex-col p-0 mt-2.5 w-full">
                <FormLabel>Fecha de Caducidad</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !caducateDate && "text-muted-foreground"
                        )}
                      >
                        {caducateDate ? (
                          format(caducateDate, "PPP", {
                            locale: es,
                          })
                        ) : (
                          <span>Seleccione una fecha</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Select
                      onValueChange={(value) =>
                        setCaducateDate(addYears(new Date(), parseInt(value)))
                      }
                    >
                      <SelectTrigger className="p-3">
                        <SelectValue placeholder="Seleccione una opcion..." />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        <SelectItem value="0">Actual</SelectItem>
                        <SelectItem value="5">5 años</SelectItem>
                        <SelectItem value="10">10 años</SelectItem>
                        <SelectItem value="15">15 años</SelectItem>
                      </SelectContent>
                    </Select>
                    <Calendar
                      locale={es}
                      mode="single"
                      selected={caducateDate}
                      onSelect={setCaducateDate}
                      initialFocus
                      month={caducateDate}
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>Fecha límite del articulo.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-row gap-12 justify-center max-w-6xl">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-x-0 space-y-2 mt-2.5">
              <Label>Metodo de Ingreso</Label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    disabled={secondaryLoading}
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="justify-between"
                  >
                    {secondaryUnits &&
                      (secondarySelected
                        ? secondaryUnits.find(
                            (secondaryUnits) =>
                              secondaryUnits.id.toString() ===
                              secondarySelected.id.toString()
                          )?.secondary_unit
                        : "Seleccione...")}
                    <ChevronsUpDown className="opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput placeholder="Search framework..." />
                    <CommandList>
                      <CommandEmpty>
                        No existen unidades secundarias.
                      </CommandEmpty>
                      <CommandGroup>
                        {secondaryUnits &&
                          secondaryUnits.map((secondaryUnit) => (
                            <CommandItem
                              key={secondaryUnit.id}
                              value={secondaryUnit.id.toString()}
                              onSelect={(currentValue) => {
                                setSecondarySelected(
                                  secondaryUnits.find(
                                    (secondaryUnit) =>
                                      secondaryUnit.id.toString() ===
                                      currentValue
                                  ) || null
                                );
                                setOpen(false);
                              }}
                            >
                              {secondaryUnit.secondary_unit}
                              <Check
                                className={cn(
                                  "ml-auto",
                                  secondarySelected?.id.toString() ===
                                    secondaryUnit.id.toString()
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <p className="text-sm text-muted-foreground">
                Indique como será ingresado el articulo.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Cantidad</Label>
              <Input
                type="number"
                onChange={(e) =>
                  setSecondaryQuantity(parseFloat(e.target.value))
                }
                placeholder="EJ: 2, 4, 6..."
              />
              <p className="text-sm text-muted-foreground">
                Indique la cantidad a ingresar.
              </p>
            </div>
            <FormField
              control={form.control}
              name="manufacturer_id"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Fabricante</FormLabel>
                  <Select
                    disabled={isManufacturerLoading}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecccione..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {manufacturers &&
                        manufacturers.map((manufacturer) => (
                          <SelectItem
                            key={manufacturer.id}
                            value={manufacturer.id.toString()}
                          >
                            {manufacturer.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Marca específica del articulo.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* {
              isEditing && (
                <FormField
                  control={form.control}
                  name="zone"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Ubicación del Articulo</FormLabel>
                      <FormControl>
                        <Input placeholder="EJ: Pasillo 4, repisa 3..." {...field} />
                      </FormControl>
                      <FormDescription>
                        Ubicación exacta del articulo.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )
            } */}
            <FormField
              control={form.control}
              name="zone"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Ubicación del Articulo</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="EJ: Pasillo 4, repisa 3..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Ubicación exacta del articulo.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="batches_id"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Lote del Articulo</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            isBatchesLoading ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              "Seleccione lote..."
                            )
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredBatches &&
                        filteredBatches.map((batch) => (
                          <SelectItem
                            key={batch.name}
                            value={batch.id.toString()}
                          >
                            {batch.name} - {batch.warehouse_name}
                          </SelectItem>
                        ))}
                      {!filteredBatches ||
                        (filteredBatches?.length <= 0 && (
                          <p className="text-sm text-muted-foreground p-2 text-center">
                            No se han encontrado lotes....
                          </p>
                        ))}
                      {isError && (
                        <p className="text-sm text-muted-foreground p-2 text-center">
                          Ha ocurrido un error al cargar los lotes...
                        </p>
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription>Lote a asignar el articulo.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="is_managed"
              render={({ field }) => (
                <FormItem
                  className={cn(
                    "flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4",
                    isEditing ? "" : "col-span-2"
                  )}
                >
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>¿Es manejable?</FormLabel>
                    <FormDescription>
                      ¿El articulo es manejable (consumible)?
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>
          <div className="flex flex-col max-w-7xl w-1/2 space-y-3">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción del Articulo</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={5}
                      placeholder="EJ: Motor V8 de..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Breve descricion del articulo.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Imágen del Articulo</FormLabel>
                  <FormControl>
                    <div className="relative h-10 w-full ">
                      <FileUpIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10" />
                      <Input
                        type="file"
                        onChange={(e) =>
                          form.setValue("image", e.target.files![0])
                        }
                        className="pl-10 pr-3 py-2 text-md w-full border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6E23DD] focus:border-transparent cursor-pointer" // Add additional styling as needed
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Imágen descriptiva del articulo
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex flex-col lg:flex-row gap-2 items-center">
              <FormField
                control={form.control}
                name="certificate_8130"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Certificado #
                      <span className="text-primary font-bold">8130</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative h-10 w-full ">
                        <FileUpIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10" />
                        <Input
                          type="file"
                          className="pl-8 pr-3 py-2 text-md w-full border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6E23DD] focus:border-transparent cursor-pointer" // Add additional styling as needed
                          placeholder="Subir archivo..."
                          onChange={(e) =>
                            form.setValue(
                              "certificate_8130",
                              e.target.files![0]
                            )
                          }
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Documento legal del archivo.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="certificate_fabricant"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Certificado del{" "}
                      <span className="text-primary">Fabricante</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative h-10 w-full ">
                        <FileUpIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10" />
                        <Input
                          type="file"
                          className="pl-8 pr-3 py-2 text-md w-full border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6E23DD] focus:border-transparent cursor-pointer"
                          onChange={(e) =>
                            form.setValue(
                              "certificate_fabricant",
                              e.target.files![0]
                            )
                          }
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Documentos legal del articulo.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="certificate_vendor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Certificado del{" "}
                      <span className="text-primary">Vendedor</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative h-10 w-full ">
                        <FileUpIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10" />
                        <Input
                          type="file"
                          className="pl-8 pr-3 py-2 text-md w-full border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6E23DD] focus:border-transparent cursor-pointer" // Add additional styling as needed
                          onChange={(e) =>
                            form.setValue(
                              "certificate_vendor",
                              e.target.files![0]
                            )
                          }
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Documentos legal del articulo.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>
        <div>
          <Button
            className="bg-primary text-white hover:bg-blue-900 disabled:bg-slate-50 disabled:border-dashed disabled:border-black"
            disabled={createArticle?.isPending || confirmIncoming.isPending}
            type="submit"
          >
            {createArticle?.isPending || confirmIncoming.isPending ? (
              "Cargando..."
            ) : (
              <p>{isEditing ? "Confirmar Ingreso" : "Crear Articulo"}</p>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CreateConsumableForm;
