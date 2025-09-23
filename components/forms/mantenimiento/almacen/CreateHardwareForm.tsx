"use client";

import {
  useCreateHardwareArticle,
} from "@/actions/mantenimiento/almacen/inventario/hardware/actions";
import { Button } from "@/components/ui/button";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetConditions } from "@/hooks/administracion/useGetConditions";
import { useGetManufacturers } from "@/hooks/general/fabricantes/useGetManufacturers";
import { useGetBatchesByLocationId } from "@/hooks/mantenimiento/almacen/renglones/useGetBatchesByLocationId";
import { useCompanyStore } from "@/stores/CompanyStore";
import { HardwareArticle, Batch, Manufacturer, Condition } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileUpIcon, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Checkbox } from "../../../ui/checkbox";
import { Textarea } from "../../../ui/textarea";
import { MultiInputField } from "../../../misc/MultiInputField";

const hardwareFormSchema = z.object({
  article_type: z.literal("ferreteria"),
  part_number: z.string().min(2, {
    message: "El número de parte debe contener al menos 2 caracteres.",
  }),
  alternative_part_number: z
    .array(
      z.string().min(2, {
        message: "Cada número de parte alterno debe contener al menos 2 caracteres.",
      })
    )
    .optional(),
  description: z
    .string({
      message: "Debe ingresar la descripción del artículo.",
    })
    .min(2, {
      message: "La descripción debe contener al menos 2 caracteres.",
    }),
  zone: z.string({
    message: "Debe ingresar la ubicación del artículo.",
  }),
  manufacturer_id: z.string({
    message: "Debe ingresar un fabricante.",
  }),
  condition_id: z.string({
    message: "Debe ingresar la condición del artículo.",
  }),
  batches_id: z.string({
    message: "Debe ingresar un lote.",
  }),
  quantity: z.coerce
    .number({
      message: "Debe ingresar una cantidad.",
    })
    .nonnegative({
      message: "No puede ingresar valores negativos.",
    }),
  
  // Información básica de ferretería
  brand: z.string().optional(),
  model: z.string().optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  
  // Especificaciones físicas
  size: z.string().optional(),
  material: z.string().optional(),
  color: z.string().optional(),
  weight: z.coerce.number().optional(),
  
  // Dimensiones detalladas
  diameter: z.string().optional(),
  length: z.string().optional(),
  width: z.string().optional(),
  height: z.string().optional(),
  thickness: z.string().optional(),
  
  // Especificaciones técnicas
  thread_type: z.string().optional(),
  hardness: z.string().optional(),
  surface_treatment: z.string().optional(),
  temperature_range: z.string().optional(),
  
  // Especificaciones eléctricas
  voltage_rating: z.string().optional(),
  current_rating: z.string().optional(),
  power_rating: z.string().optional(),
  pressure_rating: z.string().optional(),
  
  // Características especiales
  is_corrosion_resistant: z.boolean().optional(),
  is_waterproof: z.boolean().optional(),
  
  // Información comercial
  unit_cost: z.coerce.number().optional(),
  supplier_code: z.string().optional(),
  barcode: z.string().optional(),
  
  // Información de uso
  usage_application: z.string().optional(),
  storage_requirements: z.string().optional(),
  safety_notes: z.string().optional(),
  warranty_period: z.string().optional(),
  
  // Documentación
  image: z.instanceof(File).optional(),
  technical_datasheet: z.instanceof(File).optional(),
  safety_datasheet: z.instanceof(File).optional(),
});

interface EditingHardwareArticle extends HardwareArticle {
  batches: Batch;
  manufacturer?: Manufacturer;
  condition?: Condition;
}

const CreateHardwareForm = ({
  initialData,
  isEditing,
}: {
  initialData?: EditingHardwareArticle;
  isEditing?: boolean;
}) => {
  const [filteredBatches, setFilteredBatches] = useState<Batch[]>();

  const { createHardwareArticle } = useCreateHardwareArticle();
  const { selectedStation, selectedCompany } = useCompanyStore();

  const {
    mutate,
    data: batches,
    isPending: isBatchesLoading,
    isError,
  } = useGetBatchesByLocationId();

  const {
    data: conditions,
    isLoading: isConditionsLoading,
  } = useGetConditions();

  const {
    data: manufacturers,
    isLoading: isManufacturerLoading,
  } = useGetManufacturers(selectedCompany?.slug);

  useEffect(() => {
    if (selectedStation && selectedCompany) {
      mutate({
        location_id: Number(selectedStation),
        company: selectedCompany!.slug,
      });
    }
  }, [selectedStation, mutate, selectedCompany]);

  useEffect(() => {
    if (batches) {
      // Filtrar los batches por categoría de ferretería
      const filtered = batches.filter(
        (batch) => batch.category === "HERRAMIENTA" || batch.category === "FERRETERIA"
      );
      setFilteredBatches(filtered);
    }
  }, [batches]);

  const form = useForm<z.infer<typeof hardwareFormSchema>>({
    resolver: zodResolver(hardwareFormSchema),
    defaultValues: {
      part_number: initialData?.part_number || "",
      alternative_part_number: initialData?.alternative_part_number || [],
      batches_id: initialData?.batches?.id?.toString() || "",
      manufacturer_id: initialData?.manufacturer?.id?.toString() || "",
      condition_id: initialData?.condition?.id?.toString() || "",
      description: initialData?.description || "",
      zone: initialData?.zone || "",
      quantity: initialData?.quantity || 1,
      brand: initialData?.brand || "",
      model: initialData?.model || "",
      category: initialData?.category || "",
      is_corrosion_resistant: initialData?.is_corrosion_resistant || false,
      is_waterproof: initialData?.is_waterproof || false,
    },
  });

  form.setValue("article_type", "ferreteria");

  const onSubmit = async (values: z.infer<typeof hardwareFormSchema>) => {
    const formattedValues: HardwareArticle = {
      ...values,
      batches_id: Number(values.batches_id),
      article_type: "ferreteria",
    };

    createHardwareArticle.mutate({
      company: selectedCompany!.slug,
      data: formattedValues,
    });
  };

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-6 max-w-6xl mx-auto"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        {/* Información básica */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Información Básica</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="part_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de Parte *</FormLabel>
                  <FormControl>
                    <Input placeholder="EJ: TOR-M8x20" {...field} />
                  </FormControl>
                  <FormDescription>
                    Identificador único del artículo.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="brand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Marca Comercial</FormLabel>
                  <FormControl>
                    <Input placeholder="EJ: Stanley, DeWalt, etc." {...field} />
                  </FormControl>
                  <FormDescription>
                    Marca comercial del producto.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Modelo</FormLabel>
                  <FormControl>
                    <Input placeholder="EJ: DCD771C2" {...field} />
                  </FormControl>
                  <FormDescription>
                    Modelo específico del producto.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione categoría..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="tornilleria">Tornillería</SelectItem>
                      <SelectItem value="herramientas_manuales">Herramientas Manuales</SelectItem>
                      <SelectItem value="herramientas_electricas">Herramientas Eléctricas</SelectItem>
                      <SelectItem value="materiales_construccion">Materiales de Construcción</SelectItem>
                      <SelectItem value="ferreteria_general">Ferretería General</SelectItem>
                      <SelectItem value="plomeria">Plomería</SelectItem>
                      <SelectItem value="electricidad">Electricidad</SelectItem>
                      <SelectItem value="pintura">Pintura y Acabados</SelectItem>
                      <SelectItem value="seguridad">Seguridad Industrial</SelectItem>
                      <SelectItem value="medicion">Instrumentos de Medición</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Categoría principal del artículo.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="alternative_part_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Números de Parte Alternos</FormLabel>
                <FormControl>
                  <MultiInputField
                    values={field.value || []}
                    onChange={field.onChange}
                    placeholder="EJ: ALT-123"
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

        {/* Especificaciones técnicas */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Especificaciones Técnicas</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="material"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Material</FormLabel>
                  <FormControl>
                    <Input placeholder="EJ: Acero inoxidable, Aluminio" {...field} />
                  </FormControl>
                  <FormDescription>
                    Material de construcción.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="size"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tamaño/Dimensión</FormLabel>
                  <FormControl>
                    <Input placeholder="EJ: M8, 1/4 pulgada, 10mm" {...field} />
                  </FormControl>
                  <FormDescription>
                    Tamaño principal del artículo.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <FormControl>
                    <Input placeholder="EJ: Negro, Galvanizado" {...field} />
                  </FormControl>
                  <FormDescription>
                    Color o acabado del artículo.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="diameter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Diámetro</FormLabel>
                  <FormControl>
                    <Input placeholder="EJ: 8mm, 1/4 pulgada" {...field} />
                  </FormControl>
                  <FormDescription>
                    Diámetro del artículo.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="length"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Longitud</FormLabel>
                  <FormControl>
                    <Input placeholder="EJ: 20mm, 3 pulgadas" {...field} />
                  </FormControl>
                  <FormDescription>
                    Longitud del artículo.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="thread_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Rosca</FormLabel>
                  <FormControl>
                    <Input placeholder="EJ: Métrica, UNC, BSP" {...field} />
                  </FormControl>
                  <FormDescription>
                    Tipo de rosca (si aplica).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Información de inventario */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Información de Inventario</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="manufacturer_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fabricante *</FormLabel>
                  <Select
                    disabled={isManufacturerLoading}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione fabricante..." />
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
                    Fabricante del artículo.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="condition_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Condición *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger disabled={isConditionsLoading}>
                        <SelectValue placeholder="Seleccione condición..." />
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
                  <FormDescription>Estado físico del artículo.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="batches_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lote del Artículo *</FormLabel>
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
                  <FormDescription>Lote a asignar el artículo.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="zone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ubicación del Artículo *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="EJ: Pasillo 4, Estante A-3"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Ubicación exacta del artículo.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cantidad *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="1"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Cantidad inicial del artículo.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="unit_cost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Costo Unitario</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Costo por unidad del artículo.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Características especiales */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Características Especiales</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="is_corrosion_resistant"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Resistente a la Corrosión</FormLabel>
                    <FormDescription>
                      El artículo tiene tratamiento anticorrosivo.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_waterproof"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Resistente al Agua</FormLabel>
                    <FormDescription>
                      El artículo es impermeable o resistente al agua.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Descripción y documentos */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Descripción y Documentos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción del Artículo *</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={5}
                        placeholder="Descripción detallada del artículo de ferretería..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Descripción completa del artículo.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="usage_application"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aplicación/Uso</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder="Para qué se usa este artículo..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Descripción del uso o aplicación del artículo.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Imagen del Artículo</FormLabel>
                    <FormControl>
                      <div className="relative h-10 w-full">
                        <FileUpIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10" />
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            form.setValue("image", e.target.files![0])
                          }
                          className="pl-10 pr-3 py-2 text-md w-full border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6E23DD] focus:border-transparent cursor-pointer"
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Imagen descriptiva del artículo.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="safety_notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas de Seguridad</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder="Precauciones de seguridad para el manejo..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Información importante de seguridad.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            className="bg-primary text-white hover:bg-blue-900"
            disabled={createHardwareArticle?.isPending}
            type="submit"
          >
            {createHardwareArticle?.isPending ? "Creando..." : "Crear Artículo de Ferretería"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CreateHardwareForm;
