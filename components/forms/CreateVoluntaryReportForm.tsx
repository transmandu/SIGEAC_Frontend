"use client";

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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  useCreateVoluntaryReport,
  useUpdateVoluntaryReport,
} from "@/actions/sms/reporte_voluntario/actions";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { VoluntaryReport } from "@/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Label } from "../ui/label";
import { useCompanyStore } from "@/stores/CompanyStore";

interface FormProps {
  onClose: () => void;
  initialData?: VoluntaryReport;
  isEditing?: boolean;
}
// { onClose }: FormProps
// lo de arriba va en prop
export function CreateVoluntaryReportForm({
  onClose,
  isEditing,
  initialData,
}: FormProps) {
  const { selectedCompany } = useCompanyStore();
  const { createVoluntaryReport } = useCreateVoluntaryReport();
  const { updateVoluntaryReport } = useUpdateVoluntaryReport();
  const [isAnonymous, setIsAnonymous] = useState(true);
  const router = useRouter();

  const { user } = useAuth();

  const userRoles = user?.roles?.map((role) => role.name) || [];

  const shouldEnableField = userRoles.some((role) =>
    ["SUPERUSER", "ANALISTA_SMS", "JEFE_SMS"].includes(role)
  );

  const FormSchema = z.object({
    identification_date: z
      .date()
      .refine((val) => !isNaN(val.getTime()), { message: "Invalid Date" }),
    report_date: z
      .date()
      .refine((val) => !isNaN(val.getTime()), { message: "Invalid Date" }),

    report_number: shouldEnableField
      ? z
          .string()
          .min(1, "El número de reporte es obligatorio")
          .refine((val) => !isNaN(Number(val)), {
            message: "El valor debe ser un número",
          })
      : z
          .string()
          .refine((val) => val === "" || !isNaN(Number(val)), {
            message: "El valor debe ser un número o estar vacío",
          })
          .optional(),

    danger_location: z.string(),
    danger_area: z.string(),
    airport_location: z.string(),
    description: z
      .string()
      .min(3, {
        message: "La descripción debe tener al menos 3 caracteres",
      })
      .max(255, {
        message: "La descripción no debe exceder los 255 caracteres",
      }),
    possible_consequences: z
      .string()
      .min(3, {
        message: "Las consecuencias deben tener al menos 3 caracteres",
      })
      .max(255, {
        message: "Las consecuencias no debe exceder los 255 caracteres",
      }),

    reporter_name: z
      .string()
      .min(3, {
        message: "El nombre de quien reporta debe tener al menos 3 letras.",
      })
      .max(40)
      .optional(),
    reporter_last_name: z
      .string()
      .min(3, {
        message: "El Apellido de quien reporta debe tener al menos 3 letras.",
      })
      .max(40)
      .optional(),
    reporter_phone: z
      .string()
      .regex(/^\d{11}$/, {
        message: "El número telefónico debe tener almenos 11 dígitos",
      })
      .optional(),

    reporter_email: z
      .string()
      .min(10, {
        message: "El correo electrónico debe tener al menos 10 caracteres",
      })
      .email({ message: "Formato de correo electrónico inválido" })
      .optional(),
    image: z
      .instanceof(File)
      .refine((file) => file.size <= 5 * 1024 * 1024, "Max 5MB")
      .refine(
        (file) => ["image/jpeg", "image/png"].includes(file.type),
        "Solo JPEG/PNG"
      )
      .optional(),

    document: z
      .instanceof(File)
      .refine((file) => file.size <= 5 * 1024 * 1024, "Máximo 5MB")
      .refine(
        (file) => file.type === "application/pdf",
        "Solo se permiten archivos PDF"
      )
      .optional(),
    // Otros campos del esquema...
  });

  type FormSchemaType = z.infer<typeof FormSchema>;

  useEffect(() => {
    if (initialData && isEditing) {
      if (
        initialData.reporter_email &&
        initialData.reporter_name &&
        initialData.reporter_last_name &&
        initialData.reporter_phone
      ) {
        setIsAnonymous(false);
      }
    }
  }, [initialData, isEditing]); // Only run when these values change

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      report_number: initialData?.report_number || "",
      danger_area: initialData?.danger_area || "",
      danger_location: initialData?.danger_location || "",
      description: initialData?.description || "",
      possible_consequences: initialData?.possible_consequences || "",
      airport_location: initialData?.airport_location || "",
      identification_date: initialData?.identification_date
        ? new Date(initialData.identification_date)
        : new Date(),
      report_date: initialData?.report_date
        ? new Date(initialData.report_date)
        : new Date(),

      // Campos del reporter - solo se asignan si existen en initialData
      ...(initialData?.reporter_name && {
        reporter_name: initialData.reporter_name,
      }),
      ...(initialData?.reporter_last_name && {
        reporter_last_name: initialData.reporter_last_name,
      }),
      ...(initialData?.reporter_email && {
        reporter_email: initialData.reporter_email,
      }),
      ...(initialData?.reporter_phone && {
        reporter_phone: initialData.reporter_phone,
      }),
    },
  });

  const onSubmit = async (data: FormSchemaType) => {
    if (isAnonymous) {
      data.reporter_name = "";
      data.reporter_last_name = "";
      data.reporter_email = "";
      data.reporter_phone = "";
    }

    if (initialData && isEditing) {
      const value = {
        ...data,
        status: initialData.status,
        id: initialData.id,
        danger_identification_id: initialData?.danger_identification_id,
      };
      await updateVoluntaryReport.mutateAsync(value);
    } else {
      const value = {
        company: selectedCompany,
        reportData: {
          ...data,
          status: shouldEnableField ? "ABIERTO" : "PROCESO",
        },
      };
      try {
        const response = await createVoluntaryReport.mutateAsync(value);
        if (shouldEnableField) {
          router.push(
            `/${selectedCompany}/sms/reportes/reportes_voluntarios/${response.voluntary_report_id}`
          );
        } else {
          router.push(
            `/${selectedCompany}/dashboard`
          );
        }
      } catch (error) {
        console.error("Error al crear el reporte:", error);
      }
    }
    onClose();
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col space-y-3"
      >
        <FormLabel className="text-lg text-center">
          Reporte Voluntario de Peligro
        </FormLabel>

        {shouldEnableField && (
          <FormField
            control={form.control}
            name="report_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código del Reporte Voluntario</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} maxLength={4} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        )}
        <div className="flex gap-2 items-center justify-center  ">
          <FormField
            control={form.control}
            name="identification_date"
            render={({ field }) => (
              <FormItem className="flex flex-col mt-2.5 w-full">
                <FormLabel>Fecha de Identificacion</FormLabel>
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
                      disabled={(date) => date > new Date()} // Solo deshabilitar fechas futuras
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
          <FormField
            control={form.control}
            name="report_date"
            render={({ field }) => (
              <FormItem className="flex flex-col mt-2.5 w-full">
                <FormLabel>Fecha de Reporte</FormLabel>
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
                      disabled={(date) => date > new Date()} // Solo deshabilitar fechas futuras
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

        <div className="flex gap-2 items-center justify-center">
          <FormField
            control={form.control}
            name="danger_location"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Base de Localizacion</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar localización" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="PZO">Puerto Ordaz</SelectItem>
                    <SelectItem value="CBL">Ciudad Bolívar</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="danger_area"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Area de identificación</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar área" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="OPERACIONES">OPERACIONES</SelectItem>
                    <SelectItem value="MANTENIMIENTO">MANTENIMIENTO</SelectItem>
                    <SelectItem value="ADMINISTRACION_RRHH">
                      ADMINISTRACION Y RRHH
                    </SelectItem>
                    <SelectItem value="CONTROL_CALIDAD">
                      CONTROL DE CALIDAD
                    </SelectItem>
                    <SelectItem value="IT">TECNOLOGIA E INFORMACION</SelectItem>
                    <SelectItem value="AVSEC">AVSEC</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="airport_location"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Lugar de Identificacion</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="CALLE_RODAJE">CALLE DE RODAJE</SelectItem>
                  <SelectItem value="HANGAR13B">HANGAR13B</SelectItem>
                  <SelectItem value="HANGAR17/18C">HANGAR17/18 C</SelectItem>
                  <SelectItem value="AEROPUERTO_CANAIMA">
                    AEROPUERTO CANAIMA
                  </SelectItem>
                  <SelectItem value="PLATAFORMA">PLATAFORMA</SelectItem>
                  <SelectItem value="PISTA_ATERRIZAJE">
                    PISTA DE ATERRIZAJE
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripcion de peligro</FormLabel>
              <FormControl>
                <Input placeholder="Breve descripcion del peligro" {...field} />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="possible_consequences"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Consecuencias segun su criterio</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Si son varias, separar por una coma (,)"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <div>
          <Checkbox
            checked={isAnonymous}
            onCheckedChange={(checked) => {
              // Asegurarse de que el valor sea un booleano
              if (typeof checked === "boolean") {
                setIsAnonymous(checked);
                console.log(checked);
              }
            }}
            value={isAnonymous.toString()} // Convertimos el booleano a string
          />
          <Label className="ml-2 text-sm">Reporte anónimo</Label>
        </div>

        {!isAnonymous && (
          <div className="grid grid-cols-2 gap-2">
            <FormField
              control={form.control}
              name="reporter_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre de quien reporta" {...field} />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reporter_last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Apellido</FormLabel>
                  <FormControl>
                    <Input placeholder="Apellido de quien reporta" {...field} />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reporter_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo electrónico</FormLabel>
                  <FormControl>
                    <Input placeholder="ejemplo@gmail.com" {...field} />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reporter_phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono</FormLabel>
                  <FormControl>
                    <Input placeholder="" {...field} />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </div>
        )}

        <div className="flex justify-center items-center gap-2">
          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Imagen del Reporte</FormLabel>

                <div className="flex items-center gap-4">
                  {field.value ? (
                    <div className="relative">
                      <Image
                        src={URL.createObjectURL(field.value)}
                        alt="Preview"
                        width={64}
                        height={64}
                        className="rounded-md object-contain h-16 w-auto"
                      />
                    </div>
                  ) : initialData?.image &&
                    typeof initialData.image === "string" ? (
                    <div className="relative">
                      <Image
                        src={
                          initialData.image.startsWith("data:image")
                            ? initialData.image
                            : `data:image/jpeg;base64,${initialData.image}`
                        }
                        alt="Preview"
                        width={64}
                        height={64}
                        className="rounded-md object-contain h-16 w-auto"
                      />
                    </div>
                  ) : null}

                  <FormControl>
                    <Input
                      type="file"
                      accept="image/jpeg, image/png"
                      onChange={(e) => field.onChange(e.target.files?.[0])}
                    />
                  </FormControl>
                </div>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="document"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Documento PDF</FormLabel>
                <div className="flex items-center gap-4">
                  {field.value && (
                    <div>
                      <p className="text-sm text-gray-500">
                        Archivo seleccionado:
                      </p>
                      <p className="font-semibold text-sm">
                        {field.value.name}
                      </p>
                    </div>
                  )}
                  <FormControl>
                    <Input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => field.onChange(e.target.files?.[0])}
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-between items-center gap-x-4">
          <Separator className="flex-1" />
          <p className="text-muted-foreground">SIGEAC</p>
          <Separator className="flex-1" />
        </div>
        <Button disabled={createVoluntaryReport.isPending}>
          {createVoluntaryReport.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            "Enviar Reporte"
          )}
        </Button>
      </form>
    </Form>
  );
}
