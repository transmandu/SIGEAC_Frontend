"use client";

import { useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { es } from "date-fns/locale/es";
import { CalendarIcon, Loader2 } from "lucide-react";
import {
  useCreateAircraft,
  useUpdateAircraft,
  type AirlineAircraftPayload,
} from "@/actions/aerolinea/aeronaves/actions";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useGetManufacturers } from "@/hooks/general/fabricantes/useGetManufacturers";
import { useGetLocationsByCompany } from "@/hooks/sistema/useGetLocationsByCompany";
import { AIRCRAFT_STATUS_LABELS, parseApiDate } from "@/lib/airline-aircraft";
import { cn } from "@/lib/utils";
import { zodResolver } from "@/lib/zod-resolver";
import { useCompanyStore } from "@/stores/CompanyStore";
import type { AirlineAircraft } from "@/types";

const NO_MANUFACTURER = "none";

const formSchema = z
  .object({
    acronym: z
      .string()
      .trim()
      .min(2, "La matrícula debe tener al menos 2 caracteres.")
      .max(8, "La matrícula no puede superar 8 caracteres."),
    serial: z
      .string()
      .trim()
      .min(2, "El serial debe tener al menos 2 caracteres.")
      .max(20, "El serial no puede superar 20 caracteres."),
    brand: z
      .string()
      .trim()
      .min(2, "La marca debe tener al menos 2 caracteres.")
      .max(30, "La marca no puede superar 30 caracteres."),
    model: z
      .string()
      .trim()
      .min(2, "El modelo debe tener al menos 2 caracteres.")
      .max(30, "El modelo no puede superar 30 caracteres."),
    owner: z
      .string()
      .trim()
      .min(2, "El propietario debe tener al menos 2 caracteres.")
      .max(30, "El propietario no puede superar 30 caracteres."),
    fabricant_date: z
      .date({ error: "La fecha de fabricación es obligatoria." })
      // Se evalúa al validar: un `max(new Date())` fijaría "ahora" al cargar el módulo.
      .refine((date) => date <= new Date(), {
        message: "La fecha de fabricación no puede ser futura.",
      }),
    status: z.enum(["EN POSESION", "RENTADO", "VENDIDO"], {
      error: "Seleccione el estado.",
    }),
    location_id: z.string().min(1, "Seleccione la ubicación."),
    manufacturer_id: z.string().optional(),
    comments: z
      .string()
      .max(100, "Los comentarios no pueden superar 100 caracteres.")
      .optional(),
    is_external: z.boolean(),
    inac: z.boolean(),
  })
  .superRefine((values, ctx) => {
    const hasManufacturer =
      !!values.manufacturer_id && values.manufacturer_id !== NO_MANUFACTURER;

    if (!values.is_external && !hasManufacturer) {
      ctx.addIssue({
        code: "custom",
        path: ["manufacturer_id"],
        message: "El fabricante es obligatorio para una aeronave propia.",
      });
    }
  });

type FormValues = z.infer<typeof formSchema>;

interface AircraftFormProps {
  /** Con aeronave, el formulario edita; sin ella, crea. */
  aircraft?: AirlineAircraft;
  onClose: () => void;
}

const toPayload = (values: FormValues): AirlineAircraftPayload => ({
  acronym: values.acronym,
  serial: values.serial,
  brand: values.brand,
  model: values.model,
  owner: values.owner,
  status: values.status,
  fabricant_date: format(values.fabricant_date, "yyyy-MM-dd"),
  location_id: Number(values.location_id),
  manufacturer_id:
    values.manufacturer_id && values.manufacturer_id !== NO_MANUFACTURER
      ? Number(values.manufacturer_id)
      : null,
  comments: values.comments?.trim() || null,
  is_external: values.is_external,
  inac: values.inac,
});

export function AircraftForm({ aircraft, onClose }: AircraftFormProps) {
  const { selectedCompany } = useCompanyStore();
  const { createAircraft } = useCreateAircraft();
  const { updateAircraft } = useUpdateAircraft();
  const { data: locations, isLoading: locationsLoading } =
    useGetLocationsByCompany(selectedCompany?.slug);
  const { data: manufacturers, isLoading: manufacturersLoading } =
    useGetManufacturers(selectedCompany?.slug);

  const aircraftManufacturers = useMemo(
    () => (manufacturers ?? []).filter((m) => m.type === "AIRCRAFT"),
    [manufacturers],
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: aircraft
      ? {
          acronym: aircraft.acronym,
          serial: aircraft.serial,
          brand: aircraft.brand,
          model: aircraft.model,
          owner: aircraft.owner,
          fabricant_date: parseApiDate(aircraft.fabricant_date),
          status: aircraft.status,
          location_id: String(aircraft.location_id),
          manufacturer_id: aircraft.manufacturer_id
            ? String(aircraft.manufacturer_id)
            : undefined,
          comments: aircraft.comments ?? "",
          is_external: aircraft.is_external,
          inac: aircraft.inac,
        }
      : {
          acronym: "",
          serial: "",
          brand: "",
          model: "",
          owner: "",
          status: "EN POSESION",
          location_id: "",
          comments: "",
          is_external: false,
          inac: true,
        },
  });

  const isExternal = useWatch({ control: form.control, name: "is_external" });
  const isPending = createAircraft.isPending || updateAircraft.isPending;

  const onSubmit = async (values: FormValues) => {
    const company = selectedCompany!.slug;

    try {
      if (aircraft) {
        await updateAircraft.mutateAsync({
          company,
          acronym: aircraft.acronym,
          data: toPayload(values),
        });
      } else {
        await createAircraft.mutateAsync({ company, data: toPayload(values) });
      }
      onClose();
    } catch {
      // El aviso lo muestra la mutación; el formulario queda abierto.
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="acronym"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Matrícula</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: YV2272"
                    className="uppercase"
                    {...field}
                    onChange={(e) =>
                      field.onChange(e.target.value.toUpperCase())
                    }
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="serial"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Serial</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: 208B0555"
                    className="uppercase"
                    {...field}
                    onChange={(e) =>
                      field.onChange(e.target.value.toUpperCase())
                    }
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="brand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Marca</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Cessna" {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
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
                  <Input placeholder="Ej: Caravan 208B" {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="manufacturer_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Fabricante
                  {isExternal && (
                    <span className="ml-1 font-normal text-muted-foreground">
                      (opcional)
                    </span>
                  )}
                </FormLabel>
                <Select
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                  disabled={manufacturersLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          manufacturersLoading
                            ? "Cargando..."
                            : "Seleccione un fabricante"
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {isExternal && (
                      <SelectItem value={NO_MANUFACTURER}>
                        Sin fabricante
                      </SelectItem>
                    )}
                    {aircraftManufacturers.map((manufacturer) => (
                      <SelectItem
                        key={manufacturer.id}
                        value={String(manufacturer.id)}
                      >
                        {manufacturer.description
                          ? `${manufacturer.name} — ${manufacturer.description}`
                          : manufacturer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="location_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ubicación</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={locationsLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          locationsLoading
                            ? "Cargando..."
                            : "Seleccione una ubicación"
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {(locations ?? []).map((location) => (
                      <SelectItem key={location.id} value={String(location.id)}>
                        {location.name || location.address}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="owner"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Propietario</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Transmandu" {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione el estado" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(AIRCRAFT_STATUS_LABELS).map(
                      ([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="fabricant_date"
            render={({ field }) => (
              <FormItem className="flex flex-col sm:col-span-2">
                <FormLabel>Fecha de fabricación</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: es })
                        ) : (
                          <span>Seleccione una fecha</span>
                        )}
                        <CalendarIcon className="ml-auto size-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date > new Date()}
                      autoFocus
                      startMonth={new Date(1950, 0)}
                      endMonth={new Date(new Date().getFullYear(), 11)}
                      captionLayout="dropdown"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="comments"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Comentarios
                <span className="ml-1 font-normal text-muted-foreground">
                  (opcional)
                </span>
              </FormLabel>
              <FormControl>
                <Textarea
                  rows={2}
                  placeholder="Observaciones sobre la aeronave"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="is_external"
            render={({ field }) => (
              <FormItem className="flex items-start justify-between gap-3 rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel>Aeronave externa</FormLabel>
                  <FormDescription className="text-xs">
                    De un tercero: solo sirve para registrar su carga.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      field.onChange(checked);
                      // Al crear, una externa no está registrada ante el INAC de la empresa.
                      if (!aircraft) form.setValue("inac", !checked);
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="inac"
            render={({ field }) => (
              <FormItem className="flex items-start justify-between gap-3 rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel>Registrada ante el INAC</FormLabel>
                  <FormDescription className="text-xs">
                    Aparece en los reportes de SMS.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            {aircraft ? "Guardar cambios" : "Crear aeronave"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
