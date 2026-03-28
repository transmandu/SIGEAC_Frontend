
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

import { useState } from "react";

import { useCreateObligatoryReport, ObligatoryReportOmacData } from "@/actions/sms/reporte_obligatorio/actions";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
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
import { ObligatoryReport } from "@/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Check, ChevronsUpDown, Loader2 } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useGetLocationsByCompany } from "@/hooks/sistema/useGetLocationsByCompany";
import { Textarea } from "@/components/ui/textarea";

interface FormProps {
    isEditing?: boolean;
    initialData?: ObligatoryReport;
    onClose: () => void;
}

export function CreateGenAeroObligatoryReport({
    onClose,
    isEditing,
    initialData,
}: FormProps) {
    const FormSchema = z
        .object({
            incident_location: z
                .string()
                .min(3, {
                    message: "El lugar de evento debe tener al menos 3 caracteres",
                })
                .max(50, {
                    message: "El lugar de evento no debe exceder los 50 caracteres",
                }),
            description: z.string(),
            location_id: z.string(),
            report_date: z
                .date()
                .refine((val) => !isNaN(val.getTime()), { message: "Fecha inválida" }),
            incident_date: z
                .date()
                .refine((val) => !isNaN(val.getTime()), { message: "Fecha inválida" }),
            incident_time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
                message: "Formato de hora inválido (HH:mm)",
            }),
            report_time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
                message: "Formato de hora inválido (HH:mm)",
            }),
            name: z
                .string()
                .min(3, {
                    message: "El origen del vuelo debe tener al menos 3 caracteres.",
                })
                .max(100, {
                    message: "El origen del vuelo debe tener máximo 100 caracteres.",
                }),
            last_name: z
                .string()
                .min(3, {
                    message: "El Apellido tener al menos 3 caracteres.",
                })
                .max(100, {
                    message: "El Apellito tener máximo 100 caracteres.",
                }),
            phone_number: z
                .string()
                .min(3, {
                    message:
                        "El numero debe tener al menos 3 caracteres.",
                })
                .max(100, {
                    message:
                        "El numero debe tener máximo 50 caracteres.",
                }),
            email: z
                .string()
                .min(3, {
                    message:
                        "El email debe tener al menos 3 caracteres.",
                })
                .max(50, {
                    message:
                        "El email debe tener máximo 50 caracteres.",
                }),
            incidents: z.array(z.string()).optional(),
            other_incidents: z.preprocess(
                (val) => (val === null || val === undefined ? "" : val),
                z.string().optional()
            ),
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
        })
        .refine(
            (data) => {
                const hasIncidents = data.incidents && data.incidents.length > 0;
                const hasOtherIncidents = data.other_incidents?.trim() !== "";
                return hasIncidents || hasOtherIncidents;
            },
            {
                message: "Debe proporcionar al menos un evento o descripción",
                path: ["incidents"],
            }
        );

    type FormSchemaType = z.infer<typeof FormSchema>;

    const { createObligatoryReport } = useCreateObligatoryReport();
    const router = useRouter();
    const { company } = useParams<{ company: string }>();
    const { data: locations, isLoading: isLoadingLocations } = useGetLocationsByCompany(company);
    const [showOtherInput, setShowOtherInput] = useState(
        initialData?.other_incidents ? true : false
    );

    const [open, setOpen] = useState(false);

    const [selectedValues, setSelectedValues] = useState<string[]>(() => {
        if (initialData?.incidents) {
            try {
                return JSON.parse(initialData.incidents);
            } catch (error) {
                return []; // Devuelve un array vacío en caso de error de parseo
            }
        }
        return []; // Devuelve un array vacío si initialData?.incidents es null o undefined
    });


    const OPTIONS_LIST = [
        "ACCIDENTE",
        "AERONAVES QUE RETORNAN CON REPORTES LUEGO DE SERVICIO EN HANGAR 74, C.A.",
        "INCIDENTE GRAVE",
        "PROCEDIMIENTOS DE INCOMING INSPECTION INCOMPLETOS",
        "FALTA DE UTILIZACIÓN DE ELEMENTOS DE PROTECCIÓN PERSONAL",
        "REPUESTOS SIN TARJETAS DE IDENTIFICACIÓN",
        "INTOXICACIÓN CON QUIMICOS",
        "HERRAMIENTAS EXTRAVIADAS",
        "DAÑOS CAUSADOS POR ELEMENTOS EXTRAÑOS (F.O.D)",
        "CUALQUIER DAÑO QUE SUFRA UNA AERONAVE",
        "EFECTUAR UN TRABAJO MIENTRAS SE ENCUENTRA BAJO LAS INFLUENCIAS DEL ALCOHOL O SUSTANCIAS PROHIBIDAS",
        "UTILIZACIÓN DE UNA HERRAMIENTA NO CALIBRADA O CON EL PERIODO DE CALIBRACIÓN VENCIDO"
    ];

    const form = useForm<FormSchemaType>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            description: initialData?.description,
            incident_location: initialData?.incident_location,
            incidents: initialData?.incidents
                ? JSON.parse(initialData.incidents)
                : [],
            other_incidents: initialData?.other_incidents ?? "",
            report_date: initialData?.report_date
                ? new Date(initialData?.report_date)
                : new Date(),
            incident_date: initialData?.incident_date
                ? new Date(initialData?.incident_date)
                : new Date(),
            incident_time: initialData?.incident_time
                ? initialData.incident_time.substring(0, 5) // Extraemos solo HH:mm
                : "00:00",
            report_time: "00:00", // Asegurando un valor default para evitar errores
            name: "",
            last_name: "",
            phone_number: "",
            email: "",
        },
    });
    const { reset } = form;
    const onSubmit = async (data: FormSchemaType) => {
        const value: ObligatoryReportOmacData = {
            report_date: data.report_date,           // Date
            incident_date: data.incident_date,       // Date
            incident_time: `${data.incident_time}:00`,
            incident_location: data.incident_location,
            description: data.description,
            status: "PROCESO",

            // CAMPOS FALTANTES QUE REQUIERE TU INTERFACE:
            location_id: data.location_id,           // <--- Necesario según BaseObligatoryReport
            report_time: `${data.report_time}:00`,   // <--- Necesario según ObligatoryReportOmacData

            // Campos opcionales (Base)
            incidents: data.incidents,
            other_incidents: data.other_incidents,
            image: data.image,
            document: data.document,

            // Campos específicos de OMAC
            type: "OMAC",
            name: data.name,
            last_name: data.last_name,
            phone_number: data.phone_number,
            email: data.email,
        };

        try {
            createObligatoryReport.mutateAsync(value);
            //router.push(`/${company}/dashboard`);
            //           router.push(`https://sigeac-one.vercel.app/login`);
            reset();

        } catch (error) {
            console.error("Error al crear reporte:", error);
        }
        onClose();
    };

    const handleOtherCheckboxChange = (checked: boolean) => {
        setShowOtherInput(checked);
        if (!checked) {
            form.setValue("other_incidents", "");
        }
    };

    const handleOtherInputChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        form.setValue("other_incidents", event.target.value);
    };

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col space-y-6 w-full"
            >
                <FormLabel className="text-xl text-center m-2 font-bold">
                    Reporte Obligatorio de suceso
                </FormLabel>

                {/* --- 1 & 2: FECHAS Y HORAS --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-md">
                    {/* Fecha y Hora de Reporte */}
                    <div className="flex flex-col gap-4">
                        <h3 className="font-semibold underline">1. Fecha y Hora de Reporte</h3>
                        <FormField
                            control={form.control}
                            name="report_date"
                            render={({ field }) => (
                                <FormItem className="flex flex-col w-full">
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
                                                initialFocus
                                                fromYear={1980}
                                                toYear={new Date().getFullYear()}
                                                captionLayout="dropdown-buttons"
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="report_time"
                            render={({ field }) => (
                                <FormItem className="w-full">
                                    <FormLabel>Hora del Reporte</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="time"
                                            {...field}
                                            onChange={(e) => {
                                                if (e.target.value.match(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
                                                    field.onChange(e.target.value);
                                                }
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Fecha y Hora del evento */}
                    <div className="flex flex-col gap-4">
                        <h3 className="font-semibold underline">2. Fecha y Hora del evento</h3>
                        <FormField
                            control={form.control}
                            name="incident_date"
                            render={({ field }) => (
                                <FormItem className="flex flex-col w-full">
                                    <FormLabel>Fecha del Evento</FormLabel>
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
                                                initialFocus
                                                fromYear={1980}
                                                toYear={new Date().getFullYear()}
                                                captionLayout="dropdown-buttons"
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="incident_time"
                            render={({ field }) => (
                                <FormItem className="w-full">
                                    <FormLabel>Hora del Evento</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="time"
                                            {...field}
                                            onChange={(e) => {
                                                if (e.target.value.match(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
                                                    field.onChange(e.target.value);
                                                }
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* --- 3 & 4: BASES (UBICACIONES) --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-md">
                    <div className="flex flex-col gap-4">
                        <h3 className="font-semibold underline">3. Base donde se genera</h3>
                        <FormField
                            control={form.control}
                            name="location_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Base de Localización</FormLabel>
                                    {isLoadingLocations ? (
                                        <div className="flex items-center gap-2 p-2 border rounded-md bg-muted">
                                            <Loader2 className="h-4 w-4 animate-spin " />
                                            <span className="text-sm">Cargando locaciones...</span>
                                        </div>
                                    ) : (
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            disabled={isLoadingLocations}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccionar Base" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {locations?.map((location) => (
                                                    <SelectItem key={location.id} value={location.id.toString()}>
                                                        {location.cod_iata}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="flex flex-col gap-4">
                        <h3 className="font-semibold underline">4. Base donde ocurrió el evento</h3>
                        <FormField
                            control={form.control}
                            name="incident_location"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Lugar del Evento</FormLabel>
                                    <FormControl>
                                        <Input placeholder="" {...field} maxLength={50} />
                                    </FormControl>
                                    <FormMessage className="text-xs" />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* --- 5: DATOS DE QUIEN REPORTA --- */}
                <div className="flex flex-col gap-4 p-4 border rounded-md">
                    <h3 className="font-semibold underline">5. Datos de quien reporta</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem className="w-full">
                                    <FormLabel>Nombre</FormLabel>
                                    <FormControl>
                                        <Input placeholder="" {...field} />
                                    </FormControl>
                                    <FormMessage className="text-xs" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="last_name"
                            render={({ field }) => (
                                <FormItem className="w-full">
                                    <FormLabel>Apellido</FormLabel>
                                    <FormControl>
                                        <Input placeholder="" {...field} />
                                    </FormControl>
                                    <FormMessage className="text-xs" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="phone_number"
                            render={({ field }) => (
                                <FormItem className="w-full">
                                    <FormLabel>Numero de Telefono</FormLabel>
                                    <FormControl>
                                        <Input placeholder="" {...field} />
                                    </FormControl>
                                    <FormMessage className="text-xs" />
                                </FormItem>
                            )}
                        />
                        {/* Note: I added the Email field because it's required in your Zod schema! */}
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem className="w-full">
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="" {...field} type="email" />
                                    </FormControl>
                                    <FormMessage className="text-xs" />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* --- 6: EVENTO A REPORTAR --- */}
                <div className="flex flex-col gap-6 p-4 border rounded-md">
                    <h3 className="font-semibold underline">6. Evento a reportar</h3>

                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Descripcion del Evento</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="" {...field} />
                                </FormControl>
                                <FormMessage className="text-xs" />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {!showOtherInput && (
                            <FormField
                                control={form.control}
                                name="incidents"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="mb-2 block">Eventos:</FormLabel>
                                        <FormControl>
                                            <Popover open={open} onOpenChange={setOpen}>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        aria-expanded={open}
                                                        className="w-full justify-between"
                                                    >
                                                        {selectedValues && selectedValues.length > 0 ? (
                                                            <p>({selectedValues.length}) seleccionados</p>
                                                        ) : (
                                                            "Seleccionar eventos..."
                                                        )}
                                                        <ChevronsUpDown className="opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[300px] p-0">
                                                    <Command>
                                                        <CommandInput placeholder="Buscar eventos..." />
                                                        <CommandList>
                                                            <CommandEmpty>
                                                                No se encontraron eventos.
                                                            </CommandEmpty>
                                                            <CommandGroup>
                                                                {OPTIONS_LIST.map((option) => (
                                                                    <CommandItem
                                                                        key={option}
                                                                        value={option}
                                                                        onSelect={(currentValue) => {
                                                                            const isSelected = selectedValues.includes(currentValue);
                                                                            const newValues = isSelected
                                                                                ? selectedValues.filter((v) => v !== currentValue)
                                                                                : [...selectedValues, currentValue];

                                                                            setSelectedValues(newValues);
                                                                            field.onChange(newValues.length > 0 ? newValues : []);
                                                                        }}
                                                                    >
                                                                        {option}
                                                                        {selectedValues && (
                                                                            <Check
                                                                                className={cn(
                                                                                    "ml-auto",
                                                                                    selectedValues.includes(option)
                                                                                        ? "opacity-100"
                                                                                        : "opacity-0"
                                                                                )}
                                                                            />
                                                                        )}
                                                                    </CommandItem>
                                                                ))}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                        </FormControl>
                                        <FormMessage className="text-xs" />
                                    </FormItem>
                                )}
                            />
                        )}

                        <FormField
                            control={form.control}
                            name="other_incidents"
                            render={() => (
                                <FormItem className="flex flex-col">
                                    <div className="flex flex-row items-center space-x-3 space-y-0 mt-[34px]">
                                        <FormControl>
                                            <Checkbox
                                                checked={showOtherInput}
                                                onCheckedChange={handleOtherCheckboxChange}
                                            />
                                        </FormControl>
                                        <FormLabel className="text-sm font-normal">
                                            Otros eventos
                                        </FormLabel>
                                    </div>
                                    {showOtherInput && (
                                        <FormItem className="mt-2">
                                            <FormControl>
                                                <Input
                                                    type="text"
                                                    placeholder="Detalles del Evento"
                                                    {...form.register("other_incidents")}
                                                    onChange={handleOtherInputChange}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                        <FormField
                            control={form.control}
                            name="image"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Imagen General</FormLabel>
                                    <div className="flex items-center gap-4">
                                        {field.value ? (
                                            <div className="relative h-16 w-16 border rounded">
                                                <Image
                                                    src={URL.createObjectURL(field.value)}
                                                    alt="Preview"
                                                    width={64}
                                                    height={64}
                                                    className="rounded-md object-contain"
                                                />
                                            </div>
                                        ) : initialData?.image &&
                                            typeof initialData.image === "string" ? (
                                            <div className="relative h-16 w-16 border rounded">
                                                <Image
                                                    src={
                                                        initialData.image.startsWith("data:image")
                                                            ? initialData.image
                                                            : `data:image/jpeg;base64,${initialData.image}`
                                                    }
                                                    alt="Preview"
                                                    width={64}
                                                    height={64}
                                                    className="rounded-md object-contain"
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
                                    <div className="flex flex-col gap-2">
                                        {field.value && (
                                            <div>
                                                <p className="text-sm text-gray-500">
                                                    Archivo seleccionado:
                                                </p>
                                                <p className="font-semibold text-sm truncate">
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
                </div>

                {/* --- FOOTER / SUBMIT --- */}
                <div className="flex justify-between items-center gap-x-4 pt-4">
                    <Separator className="flex-1" />
                    <p className="text-muted-foreground font-semibold">SIGEAC</p>
                    <Separator className="flex-1" />
                </div>

                <Button type="submit" className="w-full md:w-auto self-end">
                    Enviar reporte
                </Button>
            </form>
        </Form>
    );
}
