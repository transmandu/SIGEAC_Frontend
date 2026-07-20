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
} from "@/actions/mantenimiento/sms/reporte_voluntario/actions";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { addDays, format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Loader2, X } from "lucide-react"; // Añadido el icono X
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useGetLocationsByCompany } from "@/hooks/sistema/useGetLocationsByCompany";
import { VoluntaryReport } from "@/types/sms/mantenimiento";

interface FormProps {
  onClose: () => void;
  initialData?: VoluntaryReport;
  isEditing?: boolean;
}

export function CreateGenVolReport({
  onClose,
  isEditing,
  initialData,
}: FormProps) {
  const { company } = useParams<{ company: string }>();
  const { createVoluntaryReport } = useCreateVoluntaryReport();
  const { updateVoluntaryReport } = useUpdateVoluntaryReport();
  const { data: locations, isLoading: isLocationsLoading } = useGetLocationsByCompany(company);

  const [isAnonymous, setIsAnonymous] = useState(false);

  // Estado local para manejar lo que el usuario está escribiendo en el input de consecuencias
  const [consequenceInput, setConsequenceInput] = useState("");

  const FormSchema = z.object({
    identification_date: z
      .date({ required_error: "La fecha de identificación es obligatoria" })
      .default(() => new Date())
      .refine((val) => !isNaN(val.getTime()), { message: "Fecha inválida" }),
    report_date: z
      .date({ required_error: "La fecha de reporte es obligatoria" })
      .default(() => new Date())
      .refine((val) => !isNaN(val.getTime()), { message: "Fecha inválida" }),

    location_id: z.string().min(1, "Seleccione una ubicación"),
    identification_area: z.string().min(1, "Seleccione el área de identificación"),
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
        message: "Debe agregar al menos una consecuencia válida",
      })
      .max(255, {
        message: "Las consecuencias no deben exceder los 255 caracteres en total",
      }),

    reporter_name: z
      .string()

      .max(40)
      .optional(),
    reporter_last_name: z
      .string()

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
  }, [initialData, isEditing]);

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      description: initialData?.description || "",
      possible_consequences: initialData?.possible_consequences || "",
      location_id: initialData?.location?.id?.toString() || "",
      identification_date: initialData?.identification_date
        ? addDays(new Date(initialData.identification_date), 1)
        : new Date(),

      report_date: initialData?.report_date
        ? addDays(new Date(initialData.report_date), 1)
        : new Date(),

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

  // Observamos el string actual para poder separarlo y renderizar las etiquetas
  const currentConsequencesStr = form.watch("possible_consequences");
  const consequencesList = currentConsequencesStr
    ? currentConsequencesStr.split("~").filter(Boolean)
    : [];

  const handleAddConsequence = (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    // Limpiamos el texto y evitamos que el usuario meta ~ manualmente rompiendo la lógica
    const trimmed = consequenceInput.trim().replace(/~/g, "-");

    if (!trimmed) return;

    const currentVal = form.getValues("possible_consequences");
    const newVal = currentVal ? `${currentVal}~${trimmed}` : trimmed;

    form.setValue("possible_consequences", newVal, { shouldValidate: true });
    setConsequenceInput("");
  };

  const handleRemoveConsequence = (indexToRemove: number) => {
    const currentVal = form.getValues("possible_consequences");
    if (!currentVal) return;

    const list = currentVal.split("~");
    list.splice(indexToRemove, 1);

    form.setValue("possible_consequences", list.join("~"), { shouldValidate: true });
  };

  const onSubmit = async (data: FormSchemaType) => {
    if (isAnonymous) {
      data.reporter_name = "";
      data.reporter_last_name = "";
      data.reporter_email = "";
      data.reporter_phone = "";
    }

    if (initialData && isEditing) {
      const value = {
        company: company,
        id: initialData.id.toString(),
        data: {
          ...data,
          status: initialData.status,
        },
      };
      await updateVoluntaryReport.mutateAsync(value);
    } else {
      const value = {
        company: company,
        reportData: {
          ...data,
          status: "EN_PROCESO",
        },
      };
      try {
        await createVoluntaryReport.mutateAsync(value);
      } catch (error) {
        console.error("Error al crear el reporte:", error);
      }
    }

    form.reset({
      description: "",
      possible_consequences: "",
      location_id: "",
      identification_area: "",
      identification_date: new Date(),
      report_date: new Date(),
      reporter_name: "",
      reporter_last_name: "",
      reporter_email: "",
      reporter_phone: "",
    });
    setIsAnonymous(false);
    setConsequenceInput("");
    onClose();
  };
  const onError = (errors: any) => {
    console.log("Errores del formulario:", errors);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col space-y-5 w-full pb-4"
      >
        {/* Header */}
        <div className="pb-2 border-b border-border/60">
          <FormLabel className="text-base font-semibold">
            H74-SMS-001 REPORTE VOLUNTARIO
          </FormLabel>
        </div>

        {/* --- SECCIÓN 1: FECHAS --- */}
        <div className="space-y-3 p-4 rounded-lg border border-border/60">
          <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">1. Tiempos del Reporte</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
            <FormField
              control={form.control}
              name="report_date"
              render={({ field }) => (
                <FormItem className="flex flex-col w-full">
                  <FormLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Fecha de Reporte</FormLabel>
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
                            format(field.value, "PPP", { locale: es })
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
                        initialFocus
                        fromYear={2000}
                        toYear={new Date().getFullYear()}
                        captionLayout="dropdown-buttons"
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
              name="identification_date"
              render={({ field }) => (
                <FormItem className="flex flex-col w-full">
                  <FormLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Fecha de Identificación</FormLabel>
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
                            format(field.value, "PPP", { locale: es })
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
                        initialFocus
                        fromYear={2000}
                        toYear={new Date().getFullYear()}
                        captionLayout="dropdown-buttons"
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
        </div>

        {/* --- SECCIÓN 2: UBICACIONES --- */}
        <div className="space-y-3 p-4 rounded-lg border border-border/60">
          <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">2. Localización</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
            <FormField
              control={form.control}
              name="location_id"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Base donde se genera</FormLabel>
                  {isLocationsLoading ? (
                    <div className="flex items-center gap-2 p-2 border rounded-md bg-muted">
                      <Loader2 className="h-4 w-4 animate-spin " />
                      <span className="text-sm">Cargando Bases...</span>
                    </div>
                  ) : (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isLocationsLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar Base" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {locations?.map((loc) => (
                          <SelectItem key={loc.id} value={loc.id.toString()}>
                            {loc.cod_iata}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="identification_area"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Área de identificación del Peligro</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar área" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="TALLER">TALLER</SelectItem>
                      <SelectItem value="MANTENIMIENTO">MANTENIMIENTO</SelectItem>
                      <SelectItem value="OFICINA">OFICINAS</SelectItem>
                      <SelectItem value="OTROS">OTROS</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* --- SECCIÓN 3: DATOS DEL REPORTANTE --- */}
        <div className="space-y-3 p-4 rounded-lg border border-border/60">
          <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">3. Información del Reportante</h3>

          <div className="flex items-center space-x-2 py-2">
            <Checkbox
              id="anonymous-check-gen"
              checked={isAnonymous}
              onCheckedChange={(checked) => {
                if (typeof checked === "boolean") {
                  setIsAnonymous(checked);
                }
              }}
              value={isAnonymous.toString()}
            />
            <Label htmlFor="anonymous-check-gen" className="text-sm font-medium cursor-pointer">
              Realizar este reporte de forma anónima
            </Label>
          </div>

          {!isAnonymous && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
              <FormField
                control={form.control}
                name="reporter_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Nombre</FormLabel>
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
                    <FormLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Apellido</FormLabel>
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
                    <FormLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Correo electrónico</FormLabel>
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
                    <FormLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Teléfono</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. 04141234567" {...field} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>
          )}
        </div>

        {/* --- SECCIÓN 4: DETALLES DEL PELIGRO --- */}
        <div className="space-y-3 p-4 rounded-lg border border-border/60">
          <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">4. Detalles del Peligro</h3>
          <div className="flex flex-col gap-3">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Descripción de peligro</FormLabel>
                  <FormControl>
                    <Input placeholder="Breve descripción del peligro" {...field} />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="possible_consequences"
              render={() => (
                <FormItem>
                  <FormLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Consecuencias según su criterio</FormLabel>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      value={consequenceInput}
                      onChange={(e) => setConsequenceInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault(); // Evitamos que el formulario se envíe
                          handleAddConsequence();
                        }
                      }}
                      placeholder="Escriba una consecuencia y presione Enter..."
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleAddConsequence}
                    >
                      Agregar
                    </Button>
                  </div>

                  {/* Contenedor visual de las etiquetas (píldoras) */}
                  {consequencesList.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3 p-3 bg-muted/20 border border-border/60 rounded-md min-h-[50px]">
                      {consequencesList.map((cons, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium"
                        >
                          <span>{cons}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveConsequence(index)}
                            className="hover:text-destructive focus:outline-none transition-colors"
                          >
                            <X className="size-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* --- SECCIÓN 5: EVIDENCIA ADJUNTA --- */}
        <div className="space-y-3 p-4 rounded-lg border border-border/60">
          <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">5. Evidencia Adjunta</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Imagen del Reporte (JPEG/PNG)</FormLabel>
                  <div className="flex flex-col gap-3 mt-2">
                    {field.value ? (
                      <div className="relative border border-border/60 rounded-md p-2 bg-muted/20 inline-block">
                        <Image
                          src={URL.createObjectURL(field.value)}
                          alt="Preview"
                          width={64}
                          height={64}
                          className="rounded-md object-contain h-16 w-auto"
                        />
                      </div>
                    ) : initialData?.image && typeof initialData.image === "string" ? (
                      <div className="relative border border-border/60 rounded-md p-2 bg-muted/20 inline-block">
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
                        className="cursor-pointer file:cursor-pointer"
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
                  <FormLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Documento adjunto (PDF)</FormLabel>
                  <div className="flex flex-col gap-3 mt-2">
                    {field.value ? (
                      <p className="text-sm text-muted-foreground border border-border/60 rounded-md bg-muted/20 px-3 py-2">
                        {field.value.name}
                      </p>
                    ) : null}
                    <FormControl>
                      <Input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => field.onChange(e.target.files?.[0])}
                        className="cursor-pointer file:cursor-pointer"
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

          </div>
        </div>

        {/* --- FOOTER / SUBMIT --- */}
        <div className="flex flex-col gap-4 mt-4">
          <Button
            disabled={createVoluntaryReport.isPending}
            type="submit"
            className="w-full h-10"
          >
            {createVoluntaryReport.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              "Enviar Reporte"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
