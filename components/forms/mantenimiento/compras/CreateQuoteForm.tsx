"use client";
import { useCreateQuote } from "@/actions/mantenimiento/compras/cotizaciones/actions";
import { useUpdateRequisitionStatus } from "@/actions/mantenimiento/compras/requisiciones/actions";
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
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useGetVendors } from "@/hooks/general/proveedores/useGetVendors";
import { useGetSecondaryUnits } from "@/hooks/general/unidades/useGetSecondaryUnits";
import { useGetLocationsByCompanyId } from "@/hooks/sistema/useGetLocationsByCompanyId";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import { Requisition } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { AmountInput } from "../../../misc/AmountInput";
import { Calendar } from "../../../ui/calendar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../../../ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "../../../ui/popover";
import { ScrollArea } from "../../../ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../ui/select";
import CreateVendorForm from "../../general/CreateVendorForm";

const FormSchema = z.object({
  justification: z.string({ message: "Debe ingresar una justificacion." }),
  articles: z.array(
    z.object({
      part_number: z.string(),
      quantity: z.number().min(1, { message: "Debe ingresar al menos 1." }),
      unit: z.string().optional(),
      unit_price: z
        .string()
        .min(0, { message: "El precio no puede ser negativo." }),
    })
  ),
  vendor_id: z.string({ message: "Debe seleccionar un proveedor." }),
  location_id: z.string({ message: "Debe ingresar una ubicacion destino." }),
  quote_date: z.date({ message: "Debe ingresar una fecha de cotizacion." }),
});

type FormSchemaType = z.infer<typeof FormSchema>;

export function CreateQuoteForm({
  initialData,
  onClose,
  req,
}: {
  initialData?: any;
  onClose: () => void;
  req: Requisition;
}) {
  const { selectedCompany } = useCompanyStore();

  const [openVendor, setOpenVendor] = useState(false);

  const [openVendorDialog, setOpenVendorDialog] = useState(false);

  const { updateStatusRequisition } = useUpdateRequisitionStatus();

  const { data: secondaryUnits } = useGetSecondaryUnits(selectedCompany?.slug);

  const { createQuote } = useCreateQuote();

  const { user } = useAuth();

  const transformedArticles =
    initialData?.articles?.flatMap((article: any) =>
      article.batch_articles.map((batchArticle: any) => ({
        part_number: batchArticle.part_number,
        quantity: batchArticle.quantity,
        unit: batchArticle.unit ? batchArticle.unit.id.toString() : undefined,
        unit_price: 0,
        image: batchArticle.image,
      }))
    ) || [];

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      justification: initialData?.justification || "",
      articles: transformedArticles,
    },
  });

  const { control, handleSubmit } = form;

  const { fields } = useFieldArray({
    control,
    name: "articles",
  });
  const calculateTotal = (articles: FormSchemaType["articles"]) => {
    const articlesTotal = articles.reduce(
      (sum, article) =>
        sum + (article.quantity * Number(article.unit_price) || 0),
      0
    );
    return articlesTotal;
  };

  const articles = useWatch({
    control,
    name: "articles",
  });

  const total = useMemo(() => calculateTotal(articles), [articles]);

  const {
    data: vendors,
    isLoading: isVendorsLoading,
    isError: isVendorsErros,
  } = useGetVendors(selectedCompany?.slug);

  const {
    mutate,
    data: locations,
    isPending: isLocationsPending,
  } = useGetLocationsByCompanyId();

  useEffect(() => {
    if (selectedCompany) {
      mutate(Number(2));
    }
  }, [selectedCompany, mutate]);

  const onSubmit = async (data: FormSchemaType) => {
    const formattedData = {
      ...data,
      created_by: `${user?.id}`,
      sub_total: total,
      total: total,
      location_id: Number(data.location_id),
      company: selectedCompany!.slug,
      requisition_order_id: req.id,
      vendor_id: Number(data.vendor_id),
      articles: data.articles.map((article: any) => ({
        ...article,
        amount: Number(article.unit_price) * Number(article.quantity),
      })),
    };
    await createQuote.mutateAsync({ data: formattedData, company: selectedCompany!.slug });
    await updateStatusRequisition.mutateAsync({
      id: req.id,
      data: {
        status: "COTIZADO",
        updated_by: `${user?.first_name} ${user?.last_name}`,
      },
      company: selectedCompany!.slug,
    });
    onClose();
  };

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col space-y-4"
      >
        <div className="flex gap-2 items-center">
          <FormField
            control={form.control}
            name="quote_date"
            render={({ field }) => (
              <FormItem className="flex flex-col mt-1.5">
                <FormLabel>Fecha de Cotizacion</FormLabel>
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
          {/* Proveedor */}
          <FormField
            control={form.control}
            name="vendor_id"
            render={({ field }) => (
              <FormItem className="w-full flex flex-col mt-1 space-y-3">
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
                        {isVendorsLoading && (
                          <Loader2 className="size-4 animate-spin mr-2" />
                        )}
                        {field.value ? (
                          <p>
                            {
                              vendors?.find(
                                (vendor) => vendor.id.toString() === field.value
                              )?.name
                            }
                          </p>
                        ) : (
                          "Elige al proveedor..."
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0">
                    <Command>
                      <CommandInput placeholder="Busque un proveedor..." />
                      <CommandList>
                        <CommandEmpty>
                          No se ha encontrado un proveedor.
                        </CommandEmpty>
                        <CommandGroup>
                          <Dialog
                            open={openVendorDialog}
                            onOpenChange={setOpenVendorDialog}
                          >
                            <DialogTrigger asChild>
                              <div className="flex justify-center">
                                <Button
                                  variant={"ghost"}
                                  className="w-[130px] h-[30px] m-1"
                                  onClick={() => setOpenVendorDialog(true)}
                                >
                                  Crear Proveedor
                                </Button>
                              </div>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[490px]">
                              <DialogHeader>
                                <DialogTitle>Creación de Proveedor</DialogTitle>
                                <DialogDescription>
                                  Cree un proveedor rellenando la información
                                  necesaria.
                                </DialogDescription>
                              </DialogHeader>
                              <CreateVendorForm
                                onClose={() => setOpenVendorDialog(false)}
                              />
                            </DialogContent>
                          </Dialog>
                          {vendors?.map((vendor) => (
                            <CommandItem
                              value={vendor.name}
                              key={vendor.id.toString()}
                              onSelect={() => {
                                form.setValue(
                                  "vendor_id",
                                  vendor.id.toString()
                                );
                                setOpenVendor(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  vendor.id === field.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {<p>{vendor.name}</p>}
                            </CommandItem>
                          ))}
                          {isVendorsErros && (
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
          <FormField
            control={form.control}
            name="location_id"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Destino</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger disabled={isLocationsPending}>
                      <SelectValue placeholder="Seleccione la ubicacion" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {locations?.map((location) => (
                      <SelectItem
                        key={location.id}
                        value={location.id.toString()}
                      >
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
            <FormItem className="w-full">
              <FormLabel>Justificación</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Ej: Necesidad de la pieza X para instalación..."
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
          <ScrollArea className={cn("", fields.length > 3 && "h-[280px]")}>
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-4 items-end p-2 border-b">
                {/* Número de parte */}
                <FormField
                  control={control}
                  name={`articles.${index}.part_number`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor={`part-number-${index}`}>
                        # Parte
                      </FormLabel>
                      <FormControl>
                        <Input
                          id={`part-number-${index}`}
                          disabled
                          className="disabled:opacity-85 disabled:cursor-default font-semibold"
                          placeholder="Ej: ABC123"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Cantidad y Unidad */}
                <div className="flex gap-2 items-end">
                  <FormField
                    control={control}
                    name={`articles.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel htmlFor={`quantity-${index}`}>
                          Cantidad
                        </FormLabel>
                        <FormControl>
                          <Input
                            id={`quantity-${index}`}
                            disabled
                            className="disabled:opacity-85 font-semibold"
                            type="number"
                            min={1}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {articles[index]?.unit && (
                    <FormItem className="flex-1">
                      <FormLabel htmlFor={`unit-${index}`}>Unidad</FormLabel>
                      <Select value={articles[index].unit.toString()} disabled>
                        <SelectTrigger id={`unit-${index}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {secondaryUnits?.map((unit) => (
                            <SelectItem
                              key={unit.id}
                              value={unit.id.toString()}
                            >
                              {unit.secondary_unit}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                </div>

                {/* Precio Unitario */}
                <FormField
                  control={control}
                  name={`articles.${index}.unit_price`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor={`unit-price-${index}`}>
                        Precio Unitario
                      </FormLabel>
                      <FormControl>
                        <AmountInput {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Total del Artículo */}
                <div className="flex flex-col">
                  <Label className="mb-2">Total</Label>
                  <p className="text-base font-bold p-2 rounded-md">
                    {new Intl.NumberFormat("es-AR", {
                      style: "currency",
                      currency: "ARS",
                    }).format(
                      (articles[index]?.quantity || 0) *
                        (Number(articles[index]?.unit_price) || 0)
                    )}
                  </p>
                </div>
              </div>
            ))}
          </ScrollArea>
        </div>

        {/* Total general */}
        <div className=" font-bold text-lg">
          Total General: ${total.toFixed(2)}
        </div>
        <Separator />
        {/* Botón para enviar */}
        <Button
          disabled={createQuote.isPending || updateStatusRequisition.isPending}
          type="submit"
        >
          {createQuote.isPending || updateStatusRequisition.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            "Crear Cotizacion"
          )}
        </Button>
      </form>
    </Form>
  );
}
