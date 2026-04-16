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
import { useCreateObligatoryReport } from "@/actions/mantenimiento/sms/reporte_obligatorio/actions";
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
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Check, ChevronsUpDown, Loader2 } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { ObligatoryReport } from "@/types/sms/mantenimiento";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@radix-ui/react-select";
import { useGetLocationsByCompany } from "@/hooks/sistema/useGetLocationsByCompany";

interface FormProps {
    isEditing?: boolean;
    initialData?: ObligatoryReport;
    onClose: () => void;
}

export function CreateGenObliReport({
    onClose,
    isEditing,
    initialData,
}: FormProps) {
    const FormSchema = z
        .object({
            incident_location_id: z.string(),
            report_location_id: z.string(),
            description: z.string(),
            name: z.string().min(1, "El nombre es requerido"),
            last_name: z.string().min(1, "El apellido es requerido"),
            phone: z.string().optional(),
            email: z.string().email("Formato de correo inválido").optional().or(z.literal("")),
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
                message: "Debe proporcionar al menos un incidente o descripción",
                path: ["incidents"],
            }
        );

    type FormSchemaType = z.infer<typeof FormSchema>;

    const { createObligatoryReport } = useCreateObligatoryReport();
    const { company } = useParams<{ company: string }>();

    const [showOtherInput, setShowOtherInput] = useState(
        initialData?.other_incidents ? true : false
    );

    const [open, setOpen] = useState(false);

    const [selectedValues, setSelectedValues] = useState<string[]>(() => {
        if (initialData?.incidents) {
            try {
                return JSON.parse(initialData.incidents);
            } catch (error) {
                return [];
            }
        }
        return [];
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

    const { data: locations, isLoading: isLocationsLoading } = useGetLocationsByCompany(company);
    const form = useForm<FormSchemaType>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            report_date: initialData?.report_date ? new Date(initialData?.report_date) : new Date(),
            report_time: initialData?.report_time ? initialData.report_time.substring(0, 5) : "00:00",
            incident_date: initialData?.incident_date ? new Date(initialData?.incident_date) : new Date(),
            incident_time: initialData?.incident_time ? initialData.incident_time.substring(0, 5) : "00:00",
            incident_location_id: initialData?.incident_location_id?.toString() ?? "",
            // Asegúrate de que este acceso coincida con cómo viene la data real
            report_location_id: initialData?.incident_location_id?.id?.toString() ?? "",
            name: initialData?.name ?? "",
            last_name: initialData?.last_name ?? "",
            phone: initialData?.phone ?? "",
            email: initialData?.email ?? "",
            incidents: initialData?.incidents ? JSON.parse(initialData.incidents) : [],
            other_incidents: initialData?.other_incidents ?? "",
            description: initialData?.description ?? "",
        },
    });

    const onSubmit = async (data: FormSchemaType) => {
        const value = {
            report_date: data.report_date,
            report_time: `${data.report_time}:00`,
            incident_date: data.incident_date,
            incident_time: `${data.incident_time}:00`,
            incident_location_id: data.incident_location_id,
            report_location_id: data.report_location_id,
            name: data.name,
            last_name: data.last_name,
            phone: data.phone,
            email: data.email,
            incidents: data.incidents,
            other_incidents: data.other_incidents,
            description: data.description,
            status: "IN_PROCESS",
            image: data.image,
            document: data.document,
        };

        try {
            await createObligatoryReport.mutateAsync(value);
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

    const handleOtherInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        form.setValue("other_incidents", event.target.value);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col space-y-6 w-full pb-4">

                {/* Header */}
                <div className="text-center pb-2 border-b">
                    <FormLabel className="text-xl font-bold">
                        H74-SMS-002 REPORTE OBLIGATORIO HANGAR
                    </FormLabel>
                </div>
                {/* --- SECCIÓN 1: FECHAS Y HORAS --- */}
                <div className="space-y-4 p-4 rounded-lg border">
                    <h3 className="font-semibold text-md text-primary">1. Fechas y horas</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                        {/* Bloque: Reporte */}
                        <div className="flex flex-col gap-4">
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
                                                    fromYear={1980}
                                                    toYear={new Date().getFullYear()}
                                                    captionLayout="dropdown-buttons"
                                                    components={{
                                                        Dropdown: (props) => (
                                                            <select {...props} className="bg-popover text-popover-foreground">
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

                        {/* Bloque: Incidente */}
                        <div className="flex flex-col gap-4">
                            <FormField
                                control={form.control}
                                name="incident_date"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col w-full">
                                        <FormLabel>Fecha de Incidente</FormLabel>
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
                                                    fromYear={1980}
                                                    toYear={new Date().getFullYear()}
                                                    captionLayout="dropdown-buttons"
                                                    components={{
                                                        Dropdown: (props) => (
                                                            <select {...props} className="bg-popover text-popover-foreground">
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
                                name="incident_time"
                                render={({ field }) => (
                                    <FormItem className="w-full">
                                        <FormLabel>Hora del incidente</FormLabel>
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
                </div>



                {/* --- SECCIÓN 3: UBICACIONES --- */}
                <div className="space-y-4 p-4 rounded-lg border bg-muted/10">
                    <h3 className="font-semibold text-md text-primary">2. Ubicaciones</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                        <FormField
                            control={form.control}
                            name="incident_location_id"
                            render={({ field }) => (
                                <FormItem className="flex flex-col w-full">
                                    <FormLabel>Base del Incidente</FormLabel>
                                    {isLocationsLoading ? (
                                        <div className="flex items-center gap-2 h-10 px-3 py-2 border border-input rounded-md bg-muted/50">
                                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                            <span className="text-sm text-muted-foreground">Cargando Bases...</span>
                                        </div>
                                    ) : (
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            disabled={isLocationsLoading}
                                        >
                                            <FormControl>
                                                {/* Clases agregadas aquí para forzar el borde, tamaño y separación */}
                                                <SelectTrigger className="w-full border border-input rounded-md bg-background px-3 py-2 h-10">
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
                            name="report_location_id"
                            render={({ field }) => (
                                <FormItem className="flex flex-col w-full">
                                    <FormLabel>Base donde se genera</FormLabel>
                                    {isLocationsLoading ? (
                                        <div className="flex items-center gap-2 h-10 px-3 py-2 border border-input rounded-md bg-muted/50">
                                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                            <span className="text-sm text-muted-foreground">Cargando Bases...</span>
                                        </div>
                                    ) : (
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            disabled={isLocationsLoading}
                                        >
                                            <FormControl>
                                                {/* Clases agregadas aquí para forzar el borde, tamaño y separación */}
                                                <SelectTrigger className="w-full border border-input rounded-md bg-background px-3 py-2 h-10">
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
                    </div>
                </div>
                {/* --- SECCIÓN 4: DETALLES DEL SUCESO --- */}
                <div className="space-y-4 p-4 rounded-lg border">
                    <h3 className="font-semibold text-md text-primary">4. Detalles del Suceso</h3>

                    <div className="flex flex-col gap-4">
                        {!showOtherInput && (
                            <FormField
                                control={form.control}
                                name="incidents"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col w-full">
                                        <FormLabel>Incidentes</FormLabel>
                                        <FormControl>
                                            <Popover open={open} onOpenChange={setOpen}>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        aria-expanded={open}
                                                        className="w-full sm:w-[400px] justify-between"
                                                    >
                                                        {selectedValues && selectedValues.length > 0 ? (
                                                            <p>({selectedValues.length}) seleccionados</p>
                                                        ) : (
                                                            "Seleccionar opciones..."
                                                        )}
                                                        <ChevronsUpDown className="opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[300px] sm:w-[400px] p-0">
                                                    <Command>
                                                        <CommandInput placeholder="Buscar opciones..." />
                                                        <CommandList>
                                                            <CommandEmpty>No se encontraron opciones.</CommandEmpty>
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
                                                                                    selectedValues.includes(option) ? "opacity-100" : "opacity-0"
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
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <FormField
                            control={form.control}
                            name="other_incidents"
                            render={() => (
                                <FormItem className="space-y-2">
                                    <div className="flex flex-row items-center space-x-3">
                                        <FormControl>
                                            <Checkbox
                                                checked={showOtherInput}
                                                onCheckedChange={handleOtherCheckboxChange}
                                            />
                                        </FormControl>
                                        <FormLabel className="text-sm font-normal">
                                            Otros incidentes
                                        </FormLabel>
                                    </div>
                                    {showOtherInput && (
                                        <FormControl>
                                            <Input
                                                type="text"
                                                placeholder="Detalles del incidente"
                                                {...form.register("other_incidents")}
                                                onChange={handleOtherInputChange}
                                            />
                                        </FormControl>
                                    )}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descripción Completa del Suceso</FormLabel>
                                    <FormControl>
                                        <Textarea className="min-h-[100px]" placeholder="Detalle lo ocurrido..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* --- SECCIÓN 5: ADJUNTOS --- */}
                <div className="space-y-4 bg-muted/30 p-4 rounded-lg border">
                    <h3 className="font-semibold text-md text-primary">5. Evidencia Adjunta</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="image"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Imagen General (JPEG/PNG)</FormLabel>
                                    <div className="flex items-center gap-4 mt-2">
                                        {field.value ? (
                                            <div className="relative h-16 w-16">
                                                <Image
                                                    src={URL.createObjectURL(field.value)}
                                                    alt="Preview"
                                                    width={64}
                                                    height={64}
                                                    className="rounded-md object-cover"
                                                />
                                            </div>
                                        ) : initialData?.image && typeof initialData.image === "string" ? (
                                            <div className="relative h-16 w-16">
                                                <Image
                                                    src={initialData.image.startsWith("data:image") ? initialData.image : `data:image/jpeg;base64,${initialData.image}`}
                                                    alt="Preview"
                                                    width={64}
                                                    height={64}
                                                    className="rounded-md object-cover"
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
                                    <FormLabel>Documento (PDF)</FormLabel>
                                    <div className="flex flex-col gap-2 mt-2">
                                        {field.value && (
                                            <div className="text-sm text-muted-foreground">
                                                <span className="font-semibold text-foreground">Archivo actual: </span>
                                                {field.value.name}
                                            </div>
                                        )}
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
                    <div className="flex justify-between items-center gap-x-4">
                        <Separator className="flex-1" />
                        <p className="text-muted-foreground text-sm font-medium tracking-widest">SIGEAC</p>
                        <Separator className="flex-1" />
                    </div>
                    <Button type="submit" size="lg" className="w-full sm:w-auto self-center px-8">
                        Enviar reporte
                    </Button>
                </div>
            </form>
        </Form>
    );
}
