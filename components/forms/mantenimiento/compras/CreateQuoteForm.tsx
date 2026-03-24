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
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useGetVendors } from "@/hooks/general/proveedores/useGetVendors";
import { useGetLocationsByCompanyId } from "@/hooks/sistema/useGetLocationsByCompanyId";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import { Requisition } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Check, ChevronsUpDown, Loader2, PackageSearch } from "lucide-react";
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
import { useGetUnits } from "@/hooks/general/unidades/useGetPrimaryUnits";

const FormSchema = z.object({
  justification: z.string({ message: "Debe ingresar una justificacion." }),
  articles: z.array(
    z.object({
      part_number: z.string(),
      alt_part_number: z.string().optional(),
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
  onClose,
  req,
}: {
  onClose: () => void;
  req: Requisition;
}) {
  const { selectedCompany } = useCompanyStore();
  const [openVendor, setOpenVendor] = useState(false);
  const [openVendorDialog, setOpenVendorDialog] = useState(false);
  const { updateStatusRequisition } = useUpdateRequisitionStatus();
  const { data: units } = useGetUnits(selectedCompany?.slug);
  const { createQuote } = useCreateQuote();
  const { user } = useAuth();

  const transformedArticles = req.batch.flatMap((batch) =>
    batch.batch_articles.map((article: any) => ({
      part_number: article.article_part_number,
      alt_part_number: article.article_alt_part_number ?? "",
      quantity: article.quantity,
      unit: article.unit ? article.unit.id.toString() : undefined,
      unit_price: "0",
    }))
  );

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      justification: req.justification || "",
      articles: transformedArticles,
    },
  });

  const { control, handleSubmit } = form;

  const { fields } = useFieldArray({
    control,
    name: "articles",
  });

  const calculateTotal = (articles: FormSchemaType["articles"]) => {
    return articles.reduce(
      (sum, article) =>
        sum + (article.quantity * Number(article.unit_price) || 0),
      0
    );
  };

  const articles = useWatch({ control, name: "articles" });
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

  const isPending = createQuote.isPending || updateStatusRequisition.isPending;

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">

        {/* ── Sección meta: fecha / proveedor / destino ────────────────── */}
        <div className="grid grid-cols-3 gap-3">
          {/* Fecha */}
          <FormField
            control={form.control}
            name="quote_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">
                  Fecha de cotización
                </FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal text-sm h-9",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-3.5 w-3.5 opacity-60" />
                        {field.value
                          ? format(field.value, "dd MMM yyyy", { locale: es })
                          : "Seleccionar fecha"}
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
              <FormItem className="flex flex-col">
                <FormLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">
                  Proveedor
                </FormLabel>
                <Popover open={openVendor} onOpenChange={setOpenVendor}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        disabled={isVendorsLoading}
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-full justify-between text-sm h-9",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {isVendorsLoading ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : field.value ? (
                          <span className="truncate">
                            {vendors?.find((v) => v.id.toString() === field.value)?.name}
                          </span>
                        ) : (
                          "Seleccionar..."
                        )}
                        <ChevronsUpDown className="ml-1 h-3.5 w-3.5 shrink-0 opacity-40" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[220px] p-0">
                    <Command>
                      <CommandInput placeholder="Buscar proveedor..." className="text-sm" />
                      <CommandList>
                        <CommandEmpty>Sin resultados.</CommandEmpty>
                        <CommandGroup>
                          <Dialog open={openVendorDialog} onOpenChange={setOpenVendorDialog}>
                            <DialogTrigger asChild>
                              <div className="flex justify-center py-1 px-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-full text-xs h-7"
                                  onClick={() => setOpenVendorDialog(true)}
                                >
                                  + Crear proveedor
                                </Button>
                              </div>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[490px]">
                              <DialogHeader>
                                <DialogTitle>Crear proveedor</DialogTitle>
                                <DialogDescription>
                                  Complete la información del nuevo proveedor.
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
                              className="text-sm"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-3.5 w-3.5",
                                  vendor.id.toString() === field.value ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {vendor.name}
                            </CommandItem>
                          ))}
                          {isVendorsErros && (
                            <p className="text-xs text-muted-foreground px-2 py-1">
                              Error al cargar proveedores.
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

          {/* Destino */}
          <FormField
            control={form.control}
            name="location_id"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">
                  Destino
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger disabled={isLocationsPending} className="h-9 text-sm">
                      <SelectValue placeholder="Seleccionar ubicación" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {locations?.map((location) => (
                      <SelectItem
                        key={location.id}
                        value={location.id.toString()}
                        className="text-sm"
                      >
                        {location.address} — {location.type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* ── Justificación ─────────────────────────────────────────────── */}
        <FormField
          control={control}
          name="justification"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Justificación
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describa la necesidad que origina esta cotización..."
                  className="resize-none text-sm min-h-[72px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ── Artículos ─────────────────────────────────────────────────── */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Artículos
            </span>
            <span className="text-xs text-muted-foreground tabular-nums">
              {fields.length} {fields.length === 1 ? "ítem" : "ítems"}
            </span>
          </div>

          {/* Cabecera de columnas */}
          <div className="grid grid-cols-[1fr_72px_130px_88px] gap-3 px-3 pb-1 border-b border-border/60">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
              Parte / Alterno
            </span>
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
              Cant.
            </span>
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
              P. Unitario
            </span>
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70 text-right">
              Total
            </span>
          </div>

          <ScrollArea className={cn(fields.length > 3 && "h-[260px]")}>
            <div className="space-y-0">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-[1fr_72px_130px_88px] gap-3 items-start px-3 py-3 border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors"
                >
                  {/* ── Identidad de parte ── */}
                  <div className="space-y-1.5 min-w-0">
                    {/* Número de parte principal */}
                    <FormField
                      control={control}
                      name={`articles.${index}.part_number`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              disabled
                              className="font-mono text-sm h-8 bg-muted/60 border-border/50 disabled:opacity-100 disabled:cursor-default tracking-wide"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    {/* Número de parte alterno */}
                    <FormField
                      control={control}
                      name={`articles.${index}.alt_part_number`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="flex items-center gap-1.5">
                              <span className="shrink-0 text-[10px] font-mono font-semibold text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 px-1.5 py-0.5 rounded tracking-widest select-none">
                                ALT
                              </span>
                              <Input
                                placeholder="N/A"
                                className="font-mono text-sm h-7 text-muted-foreground placeholder:text-muted-foreground/40 border-dashed"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* ── Cantidad + Unidad ── */}
                  <div className="space-y-1.5">
                    <FormField
                      control={control}
                      name={`articles.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              className="font-mono text-sm h-8 text-center"
                              value={field.value ?? ""}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {articles[index]?.unit && (
                      <Select value={articles[index].unit!.toString()} disabled>
                        <SelectTrigger className="h-7 text-xs border-dashed disabled:opacity-70 disabled:cursor-default">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {units?.map((unit) => (
                            <SelectItem key={unit.id} value={unit.id.toString()} className="text-xs">
                              {unit.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  {/* ── Precio unitario ── */}
                  <FormField
                    control={control}
                    name={`articles.${index}.unit_price`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <AmountInput {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* ── Total de línea ── */}
                  <div className="flex items-center justify-end pt-0.5">
                    <span className="font-mono text-sm font-semibold tabular-nums text-right">
                      ${(
                        (articles[index]?.quantity || 0) *
                        (Number(articles[index]?.unit_price) || 0)
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* ── Total general ─────────────────────────────────────────────── */}
        <div className="flex justify-end pt-1 border-t border-border/60">
          <div className="flex items-baseline gap-3">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Total
            </span>
            <span className="font-mono text-xl font-bold tabular-nums">
              ${total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* ── Enviar ────────────────────────────────────────────────────── */}
        <Button
          disabled={isPending}
          type="submit"
          className="w-full h-10"
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <>
              <PackageSearch className="size-4 mr-2" />
              Crear cotización
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
