'use client';

import { useCreateQuote } from "@/actions/mantenimiento/compras/cotizaciones/actions";
import { useUpdateRequisitionStatus } from "@/actions/mantenimiento/compras/requisiciones/actions";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useGetVendors } from "@/hooks/general/proveedores/useGetVendors";
import { useGetLocationsByCompanyId } from "@/hooks/sistema/useGetLocationsByCompanyId";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import { AdministrationRequisition } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { AmountInput } from "../../../misc/AmountInput";
import { Calendar } from "../../../ui/calendar";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../../../ui/command";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../../ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "../../../ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../ui/select";
import CreateVendorForm from "../../general/CreateVendorForm";

const FormSchema = z.object({
  justification: z.string({ message: "Debe ingresar una justificación." }),
  submission_date: z.date({ message: "Debe ingresar una fecha de solicitud." }),
  articles: z.array(
    z.object({
      description: z.string().min(1, { message: "Debe ingresar una descripción." }),
      quantity: z.string().min(1, { message: "Debe ingresar al menos 1." }),
      unit_price: z.string().min(0, { message: "El precio no puede ser negativo." }),
      amount: z.string().min(0),
      serial: z.string().optional(),
    })
  ),
  vendor_id: z.string({ message: "Debe seleccionar un proveedor." }),
  location_id: z.string({ message: "Debe ingresar una ubicación destino." }),
  quote_date: z.date({ message: "Debe ingresar una fecha de cotización." }),
});

type FormSchemaType = z.infer<typeof FormSchema>;

export function CreateAdministrationQuoteForm({
  initialData,
  onClose,
  req
}: {
  initialData: any,
  onClose: () => void,
  req: AdministrationRequisition
}) {
  const [openVendor, setOpenVendor] = useState(false);
  const [openVendorDialog, setOpenVendorDialog] = useState(false);
  const { selectedCompany } = useCompanyStore();
  const { updateStatusRequisition } = useUpdateRequisitionStatus();
  const { createQuote } = useCreateQuote();
  const { user } = useAuth();
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      submission_date: new Date(initialData!.submission_date),
      justification: initialData?.justification || "",
      quote_date: new Date(),
      articles: initialData?.articles?.map((article: any) => ({
        description: article.description,
        quantity: article.quantity,
        unit_price: "0",
        amount: "0",
        serial: "",
      })) || [],
    },
  });

  const { control, handleSubmit, watch, setValue } = form;
  const { fields } = useFieldArray({
    control,
    name: "articles",
  });

  const watchArticles = form.watch("articles");
  const watchUnitPrices = form.watch("articles").map(a => a.unit_price);

  const total = useMemo(() => {
    return watchArticles.reduce((sum, article) => sum + (Number(article.quantity) * Number(article.unit_price) || 0), 0);
  }, [watchArticles]);

  const { data: vendors, isLoading: isVendorsLoading, isError: isVendorsError } = useGetVendors(selectedCompany?.slug);
  const { mutate, data: locations, isPending: isLocationsPending } = useGetLocationsByCompanyId();

  useEffect(() => {
    if (selectedCompany) {
      mutate(Number(2));
    }
  }, [selectedCompany, mutate]);

  // Actualizar amount cuando cambia quantity o unit_price
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      // Solo actualizamos si cambia un unit_price
      if (name && name.startsWith("articles") && name.includes("unit_price")) {
        const index = Number(name.split(".")[1]);
        const quantity = value.articles?.[index]?.quantity || 0;
        const unitPrice = Number(value.articles?.[index]?.unit_price) || 0;
        const amount = Number(quantity) * Number(unitPrice);

        form.setValue(`articles.${index}.amount`, amount.toString(), {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);


  const onSubmit = async (data: FormSchemaType) => {
    const formattedData = {
      justification: data.justification,
      submission_date: data.submission_date,
      total: data.articles.reduce((sum, article) => sum + Number(article.amount), 0), // Calculate total from article amounts
      location_id: Number(data.location_id),
      req_id: req.id.toString(),
      vendor_id: Number(data.vendor_id),
      articles: data.articles.map(article => ({
        quantity: article.quantity,
        unit_price: Number(article.unit_price),
        amount: article.amount,
        serial: article.serial || "",
      })),
      company: selectedCompany!.split(" ").join("").toLowerCase(),
      created_by: user?.id.toString() || "",
      quote_date: data.quote_date,
    };

    // await createQuote.mutateAsync(formattedData);
    // await updateStatusRequisition.mutateAsync({
    //   id: req.id,
    //   data: {
    //     status: "cotizado",
    //     updated_by: `${user?.first_name} ${user?.last_name}`,
    //     company: selectedCompany!.split(" ").join("").toLowerCase(),
    //   }
    // });
    console.log(formattedData);
    //onClose();
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col space-y-4">
        {/* Fechas */}
        <div className="flex gap-4">
          <FormField
            control={form.control}
            name="submission_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
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
                          format(field.value, "PPP", { locale: es })
                        ) : (
                          <span>Seleccione la fecha</span>
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
                      locale={es}
                      disabled
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="quote_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha de Cotización</FormLabel>
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
                          format(field.value, "PPP", { locale: es })
                        ) : (
                          <span>Seleccione la fecha</span>
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
                      locale={es}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Proveedor y Ubicación */}
        <div className="flex gap-4 items-center">
          <FormField
            control={form.control}
            name="vendor_id"
            render={({ field }) => (
              <FormItem className="flex-1 flex flex-col mt-2.5">
                <FormLabel>Proveedor</FormLabel>
                <Popover open={openVendor} onOpenChange={setOpenVendor}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        disabled={isVendorsLoading}
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "justify-between",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {isVendorsLoading && <Loader2 className="size-4 animate-spin mr-2" />}
                        {field.value
                          ? vendors?.find(vendor => vendor.id.toString() === field.value)?.name
                          : "Elige al proveedor..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0">
                    <Command>
                      <CommandInput placeholder="Busque un proveedor..." />
                      <CommandList>
                        <CommandEmpty>No se ha encontrado un proveedor.</CommandEmpty>
                        <CommandGroup>
                          <Dialog open={openVendorDialog} onOpenChange={setOpenVendorDialog}>
                            <DialogTrigger asChild>
                              <div className="flex justify-center">
                                <Button variant={"ghost"} className="w-[130px] h-[30px] m-1" onClick={() => setOpenVendorDialog(true)}>
                                  Crear Proveedor
                                </Button>
                              </div>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[490px]">
                              <DialogHeader>
                                <DialogTitle>Creación de Proveedor</DialogTitle>
                                <DialogDescription>
                                  Cree un proveedor rellenando la información necesaria.
                                </DialogDescription>
                              </DialogHeader>
                              <CreateVendorForm onClose={() => setOpenVendorDialog(false)} />
                            </DialogContent>
                          </Dialog>
                          {vendors?.map((vendor) => (
                            <CommandItem
                              value={vendor.name}
                              key={vendor.id.toString()}
                              onSelect={() => {
                                form.setValue("vendor_id", vendor.id.toString());
                                setOpenVendor(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  vendor.id.toString() === field.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {vendor.name}
                            </CommandItem>
                          ))}
                          {isVendorsError && (
                            <p className="text-sm text-muted-foreground">Ha ocurrido un error al cargar los datos...</p>
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

          <FormField
            control={form.control}
            name="location_id"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Destino</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger disabled={isLocationsPending}>
                      <SelectValue placeholder="Seleccione la ubicación" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {locations?.map((location) => (
                      <SelectItem key={location.id} value={location.id.toString()}>
                        {location.address} - {location.type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Justificación */}
        <FormField
          control={control}
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
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Artículos */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold">Artículos</h3>
          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
              {/* Descripción */}
              <FormField
                control={control}
                name={`articles.${index}.description`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Input
                        disabled
                        className="disabled:opacity-85 font-semibold"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Cantidad */}
              <FormField
                control={control}
                name={`articles.${index}.quantity`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cantidad</FormLabel>
                    <FormControl>
                      <Input
                        disabled
                        type="number"
                        min={1}
                        className="disabled:opacity-85 font-semibold"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Precio Unitario */}
              <FormField
                control={control}
                name={`articles.${index}.unit_price`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio Unitario</FormLabel>
                    <FormControl>
                      <AmountInput
                        {...field}
                        onChange={(value) => {
                          field.onChange(value);
                          const quantity = watch(`articles.${index}.quantity`);
                          const unitPrice = Number(value) || 0;
                          setValue(`articles.${index}.amount`, (Number(quantity) * unitPrice).toString());
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Serial */}
              <FormField
                control={control}
                name={`articles.${index}.serial`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Serial/Número</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Opcional"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Total del Artículo */}
              <div className="flex flex-col justify-center items-center">
                <Label>Total</Label>
                <p className="text-base font-bold">
                  ${(Number(watchArticles[index]?.quantity) * Number(watchArticles[index]?.unit_price) || 0).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Total general */}
        <div className="font-bold text-lg">
          Total General: ${total.toFixed(2)}
        </div>

        <Separator />

        {/* Botón para enviar */}
        <Button
          type="submit"
        >
          Validar Formulario
        </Button>
      </form>
    </Form>
  );
}
