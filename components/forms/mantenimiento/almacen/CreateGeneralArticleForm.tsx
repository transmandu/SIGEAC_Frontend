"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

import { useCompanyStore } from "@/stores/CompanyStore";
import loadingGif from "@/public/loading2.gif";
import { useCreateGeneralArticle } from "@/actions/mantenimiento/almacen/inventario/articulos_generales/actions";
import { useGetUnits } from "@/hooks/general/unidades/useGetPrimaryUnits";
import { Select } from "@radix-ui/react-select";
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGetWarehousesByLocation } from "@/hooks/administracion/useGetWarehousesByUser";
import { useAddQuantityGeneralArticle } from "@/hooks/mantenimiento/almacen/almacen_general/useAddQuantityGeneralArticle";
import { useGetGeneralArticles } from "@/hooks/mantenimiento/almacen/almacen_general/useGetGeneralArticles";
import { toast } from "@/components/ui/use-toast";


export type GeneralArticle = {
  id: number;
  description: string;
  variant_type: string;
  quantity: number;
  brand_model: string;
};

const formSchema = z.object({
  description: z
    .string({ message: "Debe ingresar una descripción." })
    .min(2, "Mínimo 2 caracteres."),
  brand_model: z.string().optional(),
  primary_unit_id: z.string(),
  warehouse_id: z.string(),
  variant_type: z.string().optional(),
  quantity: z.coerce
    .number()
    .min(0, "No puede ser negativo"),
});

type FormValues = z.infer<typeof formSchema>;

const createSchema = z.object({
  description: z.string().min(2),
  brand_model: z.string().optional(),
  variant_type: z.string().optional(),
  primary_unit_id: z.string().min(1),
  warehouse_id: z.string().min(1),
  quantity: z.coerce.number().min(0),
});

const addQuantitySchema = z.object({
  quantity: z.coerce.number().gt(0, "Debe ser mayor a 0"),
});

const normalize = (s?: string) => (s ?? "").trim();

const CreateGeneralArticleForm = ({
  initialData,
  isEditing,
}: {
  initialData?: Partial<GeneralArticle>;
  isEditing?: boolean;
}) => {
  const router = useRouter();

  const [useExisting, setUseExisting] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<GeneralArticle | null>(null);

  const { selectedCompany, selectedStation } = useCompanyStore();
  const { data: generalArticles } = useGetGeneralArticles();
  const { addQuantityGeneralArticle } = useAddQuantityGeneralArticle();

  const { createGeneralArticle } = useCreateGeneralArticle();
  const {data: units, isLoading: isUnitsLoading} =  useGetUnits(selectedCompany?.slug);
  const {data: warehouses, isLoading: isWarehousesLoading} = useGetWarehousesByLocation({
    company: selectedCompany?.slug,
    location_id: selectedStation ?? null,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: initialData?.description ?? "",
      brand_model: initialData?.brand_model ?? "",
      variant_type: initialData?.variant_type ?? "",
      quantity: undefined,
    },
  });

  useEffect(() => {
    if (!initialData) return;
    form.reset({
      description: initialData.description ?? "",
      brand_model: initialData.brand_model ?? "",
      variant_type: initialData.variant_type ?? "",
      quantity: undefined,
    });
  }, [initialData, form]);

  const busy =
    createGeneralArticle?.isPending ||
    addQuantityGeneralArticle?.isPending;

  const onSubmit = async (values: FormValues) => {
    if (!selectedCompany?.slug) return;

    if (useExisting && selectedArticle) {
      if (values.quantity === undefined || values.quantity <= 0) {
        toast({variant: "destructive", title: "Error", description: "Ingrese una cantidad válida a sumar",});
        return;
      }
      await addQuantityGeneralArticle.mutateAsync({
        id: selectedArticle.id,
        quantity: values.quantity ?? 0,
      });

      router.back();
      return;
    }

    const payload = {
      ...values,
      description: normalize(values.description),
      brand_model: normalize(values.brand_model) || "N/A",
      variant_type: normalize(values.variant_type) || "N/A",
      quantity: values.quantity ?? 0,
    };

    await createGeneralArticle.mutateAsync({
      company: selectedCompany.slug,
      data: payload,
    });

    form.reset({
      description: "",
      brand_model: "",
      variant_type: "",
      quantity: undefined,
    });
  };

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-6 max-w-7xl mx-auto"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <input
              type="checkbox"
              checked={useExisting}
              onChange={(e) => {
                setUseExisting(e.target.checked);
                setSelectedArticle(null);
                form.reset({
                  description: "",
                  brand_model: "",
                  variant_type: "",
                  quantity: undefined,
                });
              }}
            />
            <span className="text-sm font-medium">
              Usar artículo general existente
            </span>
          </CardContent>
        </Card>
        {useExisting && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Artículo existente</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                onValueChange={(value) => {
                  const article = generalArticles?.find(
                    (a) => a.id.toString() === value
                  );

                  if (!article) return;

                  setSelectedArticle(article);

                  form.setValue("description", article.description);
                  form.setValue("brand_model", article.brand_model);
                  form.setValue("variant_type", article.variant_type);
                  form.setValue("quantity", undefined);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un artículo..." />
                </SelectTrigger>
                <SelectContent>
                  {generalArticles?.map((a) => (
                    <SelectItem key={a.id} value={a.id.toString()}>
                      {a.description} — {a.variant_type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        )}

        {/* Encabezado */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">
              {isEditing ? "Editar artículo general" : "Registrar artículo general"}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder="Ej: Tornillo hexagonal 1/2, arandela plana..."
                      {...field} disabled={useExisting}
                    />
                  </FormControl>
                  <FormDescription>
                    Texto principal del artículo para búsquedas.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Identificación */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">Identificación</CardTitle>
          </CardHeader>

          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="brand_model"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Marca / Modelo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Makita XPH12, Truper..." {...field} disabled={useExisting}/>
                  </FormControl>
                  <FormDescription>
                    Opcional, ayuda a filtrar rápido en ferretería.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="variant_type"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Presentación / Especificación</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: TOR-M6X20 / BROCA-10MM..." {...field} disabled={useExisting}/>
                  </FormControl>
                  <FormDescription>
                    Tipo, variante o código interno si existe.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Inventario */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">Inventario</CardTitle>
          </CardHeader>

          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>
                    {useExisting ? "Cantidad a sumar" : "Cantidad"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      inputMode="numeric"
                      placeholder={useExisting ? "Ingrese cantidad a sumar" : "0"}
                      {...field}
                      value={field.value ?? ""} // está bien
                      onChange={(e) => field.onChange(Number(e.target.value))} // convierte string a number
                      className="tabular-nums"
                    />
                  </FormControl>
                  <FormDescription>
                    {useExisting
                      ? "Esta cantidad se sumará al stock actual del artículo."
                      : "Cantidad inicial del artículo."}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="primary_unit_id"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Unidad</FormLabel>
                  <FormControl>
                    <Select {...field}disabled={useExisting} onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selec. unidad..." />
                      </SelectTrigger>
                      <SelectContent>
                        {
                          isUnitsLoading ? (
                            <SelectItem value="loading">Cargando unidades...</SelectItem>
                          ) :
                          units?.map((unit) => (
                            <SelectItem key={unit.id} value={unit.id.toString()}>
                              {unit.label}
                            </SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>
                    Si estás creando desde cero, normalmente arranca en 0.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="warehouse_id"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Almacén</FormLabel>
                  <FormControl>
                    <Select {...field} disabled={useExisting} onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selec. almacén..." />
                      </SelectTrigger>
                      <SelectContent>
                        {isWarehousesLoading ? (
                          <SelectItem value="loading">Cargando almacenes...</SelectItem>
                        ) : (
                          warehouses?.map((w) => (
                            <SelectItem key={w.id} value={w.id.toString()}>
                              {w.name} - {w.location.address}
                            </SelectItem>
                          )))
                        }
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>
                    Si estás creando desde cero, normalmente arranca en 0.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Separator />

        {/* Acciones */}
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={busy}
          >
            Cancelar
          </Button>

          <Button
            className="bg-primary text-white hover:bg-blue-900 disabled:bg-slate-100 disabled:text-slate-400"
            disabled={busy || !selectedCompany?.slug || (useExisting && !selectedArticle)}
            type="submit"
          >
            {busy ? (
              <Image
                className="text-black"
                src={loadingGif}
                width={170}
                height={170}
                alt="Cargando..."
              />
            ) : (
              <span>{isEditing ? "Guardar cambios" : "Crear artículo"}</span>
            )}
          </Button>

          {busy && (
            <div className="inline-flex items-center text-sm text-muted-foreground gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Procesando…
            </div>
          )}
        </div>
      </form>
    </Form>
  );
};

export default CreateGeneralArticleForm;
