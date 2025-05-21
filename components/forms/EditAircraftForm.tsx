"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
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
import { useGetLocationsByCompanies } from "@/hooks/useGetLocationsByCompanies";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { es } from "date-fns/locale/es";
import { CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Separator } from "../ui/separator";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateAircraft } from "@/actions/administracion/aeronaves/actions";
import { useGetAircraftByAcronym } from "@/hooks/administracion/useGetAircraftByAcronym";
import { Aircraft } from "@/types";

const FormSchema = z.object({
  fabricant: z
    .string()
    .min(2, {
      message: "El fabricante debe tener al menos 2 caracteres.",
    })
    .max(30, {
      message: "El fabricante tiene un máximo 30 caracteres.",
    }),
  brand: z
    .string()
    .min(2, {
      message: "La marca debe tener al menos 2 caracteres.",
    })
    .max(30, {
      message: "La marca tiene un máximo 30 caracteres.",
    }),
  model: z
    .string()
    .min(2, {
      message: "El modelo debe tener al menos 2 caracteres alfanuméricos.",
    })
    .max(30, {
      message: "El modelo tiene un máximo 20 caracteres alfanuméricos.",
    }),
  serial: z
    .string()
    .min(2, {
      message: "El serial debe tener al menos 2 números.",
    })
    .max(30, {
      message: "El serial tiene un máximo 8 números.",
    }),
  acronym: z
    .string()
    .min(2, {
      message: "La matrícula debe tener al menos 2 caracteres alfanuméricos.",
    })
    .max(8, {
      message: "La matricula tiene un máximo 8 caracteres alfanuméricos.",
    }),
  fabricant_date: z.date({
    required_error: "La fecha de vuelo es requerida",
  }),
  owner: z
    .string()
    .regex(
      /^[a-zA-Z0-9\s]+$/,
      "No se permiten caracteres especiales, solo letras"
    )
    .min(2, {
      message: "El dueño debe tener al menos 2 caracteres.",
    })
    .max(30, {
      message: "El dueño tiene un máximo 30 caracteres.",
    }),
  comments: z
    .string()
    .min(2, {
      message: "El comentario debe tener al menos 2 caracteres.",
    })
    .max(100, {
      message: "El comentario tiene un máximo 100 caracteres.",
    }),
  location_id: z.string(),
  status: z.enum(["VENDIDO", "EN POSESION", "RENTADO"]),
});

type FormSchemaType = z.infer<typeof FormSchema>;

interface EditAircraftFormProps {
  aircraft: Aircraft;
  onClose: () => void;
}

export function EditAircraftForm({ aircraft, onClose }: EditAircraftFormProps) {
  const { updateAircraft } = useUpdateAircraft();
  const { data: locationsData } = useGetLocationsByCompanies();
  const locations = locationsData;
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      // Cargar los valores actuales del avión
      fabricant: aircraft.fabricant,
      brand: aircraft.brand,
      model: aircraft.model,
      serial: aircraft.serial,
      acronym: aircraft.acronym,
      fabricant_date: aircraft.fabricant_date
        ? new Date(aircraft.fabricant_date)
        : new Date(), // Valor por defecto si es undefined
      owner: aircraft.owner,
      comments: aircraft.comments,
      location_id: aircraft.location.id.toString(),
      status: aircraft.status,
    },
  });

  const onSubmit = async (formData: FormSchemaType) => {
    const data = {
      fabricant: formData.fabricant,
      brand: formData.brand,
      model: formData.model,
      serial: formData.serial,
      acronym: formData.acronym,
      fabricant_date: formData.fabricant_date,
      owner: formData.owner,
      comments: formData.comments,
      location: {
        id: parseInt(formData.location_id), // Convertir location_id a número
      },
      status: formData.status,
    };
    await updateAircraft.mutateAsync({ acronym: aircraft.acronym, data });
    onClose();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex gap-2">
          <FormField
            control={form.control}
            name="serial"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Serial</FormLabel>
                <FormControl>
                  <Input placeholder="Ingrese el código" {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="acronym"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Matrícula</FormLabel>
                <FormControl>
                  <Input placeholder="Ingrese la Matrícula" {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>
        <div className="flex gap-2 items-center justify-center">
          <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Modelo</FormLabel>
                <FormControl>
                  <Input placeholder="Marca de la Aeronave" {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="location_id"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Ubicacion</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Locación a donde pertenecerá" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {locationsData &&
                      locationsData[0].locations.map((location) => (
                        <SelectItem
                          key={location.id}
                          value={location.id.toString()}
                        >
                          {location.address}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex gap-2 items-center">
          <FormField
            control={form.control}
            name="owner"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Dueño</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre del dueño" {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="brand"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Marca</FormLabel>
                <FormControl>
                  <Input placeholder="Ingrese la marca" {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>
        <div className="flex gap-2 items-center">
          <FormField
            control={form.control}
            name="fabricant"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Fabricante</FormLabel>
                <FormControl>
                  <Input placeholder="Ingrese el fabricante" {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="fabricant_date"
            render={({ field }) => (
              <FormItem className="flex flex-col mt-2.5">
                <FormLabel>Fecha de Fabricación</FormLabel>
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
                          format(field.value, "PPP", {
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
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1999-04-27")
                      }
                      initialFocus
                      fromYear={1980} // Año mínimo que se mostrará
                      toYear={new Date().getFullYear()} // Año máximo (actual)
                      captionLayout="dropdown-buttons" // Selectores de año/mes
                      components={{
                        Dropdown: (props) => (
                          <select
                            {...props}
                            className="bg-popover text-popover-foreground"
                          >
                            {props.children}
                          </select>
                        ),
                      }}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex gap-2 items-center">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Estado</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl className="w-[220px]">
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="VENDIDO">Vendido</SelectItem>
                    <SelectItem value="EN POSESION">En Posesión</SelectItem>
                    <SelectItem value="RENTADO">Rentado</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="comments"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Comentarios</FormLabel>
              <FormControl>
                <Textarea placeholder="Detalles/Comentarios" {...field} />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
        <div className="flex justify-between items-center gap-x-4">
          <Separator className="flex-1" />
          <p className="text-muted-foreground">SIGEAC</p>
          <Separator className="flex-1" />
        </div>
        <Button type="submit" disabled={updateAircraft.isPending}>
          {updateAircraft.isPending ? "Actualizando..." : "Actualizar"}
        </Button>
      </form>
    </Form>
  );
}
