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

import {
  useCreateSMSActivity,
  useUpdateSMSActivity,
} from "@/actions/sms/sms_actividades/actions";
import { Calendar } from "@/components/ui/calendar";
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
import { Textarea } from "@/components/ui/textarea";
import { useGetEmployeesByDepartment } from "@/hooks/sistema/useGetEmployeesByDepartament";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import { SMSActivity } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Separator } from "@radix-ui/react-select";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Loader2, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const FormSchema = z
  .object({
    activity_name: z.string(),
    activity_number: z.string(),
    start_date: z
      .date()
      .refine((val) => !isNaN(val.getTime()), { message: "Fecha inválida" }),
    end_date: z
      .date()
      .refine((val) => !isNaN(val.getTime()), { message: "Fecha inválida" }),
    start_time: z.string(),
    end_time: z.string(),
    place: z.string(),
    topics: z.string(),
    objetive: z.string(),
    description: z.string(),
    authorized_by: z.string(),
    planned_by: z.string(),
    executed_by: z.string().optional(),
    title: z.string(),
  })
  .refine(
    (data) => {
      const start = new Date(data.start_date);
      const end = new Date(data.end_date);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      return end >= start;
    },
    {
      message: "La fecha final debe ser mayor o igual a la fecha de inicio",
      path: ["end_date"],
    }
  );
type FormSchemaType = z.infer<typeof FormSchema>;

interface FormProps {
  onClose: (open: boolean) => void;
  initialData?: SMSActivity;
  isEditing?: boolean;
  selectedDate?: string;
}

export default function CreateSMSActivityForm({
  onClose,
  isEditing,
  initialData,
  selectedDate,
}: FormProps) {
  const router = useRouter();
  const { selectedCompany, selectedStation } = useCompanyStore();
  const { data: employees, isLoading: isLoadingEmployees } =
    useGetEmployeesByDepartment("SMS", selectedStation, selectedCompany?.slug);

  const { createSMSActivity } = useCreateSMSActivity();
  const { updateSMSActivity } = useUpdateSMSActivity();

  const [topics, setTopics] = useState<string[]>([]);
  const [newTopic, setNewTopic] = useState("");

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    // Los defaultValues aquí están bien, pero los re-aplicaremos en el useEffect
    defaultValues: {
      activity_name: initialData?.activity_name || "",
      title: initialData?.title || "",
      activity_number: initialData?.activity_number || "",
      start_date: initialData?.start_date
        ? new Date(initialData.start_date)
        : selectedDate
          ? new Date(selectedDate)
          : new Date(),
      end_date: initialData?.end_date
        ? new Date(initialData.end_date)
        : undefined,
      start_time: initialData?.start_time || "",
      end_time: initialData?.end_time || "",
      place: initialData?.place || "",
      topics: initialData?.topics || "",
      objetive: initialData?.objetive || "",
      description: initialData?.description || "",
      authorized_by: initialData?.authorized_by?.dni?.toString(),
      planned_by: initialData?.planned_by?.dni?.toString(),
      executed_by: initialData?.executed_by || "",
    },
  });

  // ======================= INICIO DE LA SOLUCIÓN =======================
  // Este useEffect se encarga de resolver la "race condition".
  // Se ejecuta cuando los datos iniciales o la lista de empleados cambian.
  useEffect(() => {
    // Solo actuamos si estamos en modo edición y si YA tenemos los datos de los empleados.
    if (isEditing && initialData && employees) {
      // Usamos form.reset para re-poblar el formulario. Esto fuerza a los campos
      // a actualizarse con los nuevos valores, y como 'employees' ya existe,
      // el Select podrá encontrar la opción correspondiente y mostrarla.
      form.reset({
        activity_name: initialData.activity_name || "",
        title: initialData.title || "",
        activity_number: initialData.activity_number || "",
        start_date: initialData.start_date
          ? new Date(initialData.start_date)
          : new Date(),
        end_date: initialData.end_date
          ? new Date(initialData.end_date)
          : undefined,
        start_time: initialData.start_time || "",
        end_time: initialData.end_time || "",
        place: initialData.place || "",
        topics: initialData.topics || "",
        objetive: initialData.objetive || "",
        description: initialData.description || "",
        authorized_by: initialData.authorized_by?.dni?.toString(),
        planned_by: initialData.planned_by?.dni?.toString(),
        executed_by: initialData.executed_by || "",
      });
    }
  }, [isEditing, initialData, employees, form.reset, form]); // Dependencias del efecto
  // ======================= FIN DE LA SOLUCIÓN =======================
  console.log("THIS IS INITIAL DATA", initialData);
  useEffect(() => {
    if (initialData?.topics) {
      const initialTopics = initialData.topics
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      setTopics(initialTopics);
    }
  }, [initialData]);

  const addTopic = () => {
    if (newTopic.trim()) {
      const updated = [...topics, newTopic.trim()];
      setTopics(updated);
      form.setValue("topics", updated.join(","));
      setNewTopic("");
    }
  };

  const removeTopic = (index: number) => {
    const updated = topics.filter((_, i) => i !== index);
    setTopics(updated);
    form.setValue("topics", updated.join(","));
  };

  const handleTopicKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTopic();
    }
  };

  const onSubmit = async (data: FormSchemaType) => {
    if (isEditing && initialData) {
      const value = {
        company: selectedCompany!.slug,
        id: initialData.id.toString(),
        data: {
          ...data,
          status: initialData.status,
        },
      };
      await updateSMSActivity.mutateAsync(value);
    } else {
      try {
        await createSMSActivity.mutateAsync({
          company: selectedCompany!.slug,
          data,
        });
        router.push(`/${selectedCompany?.slug}/sms/planificacion/actividades`);
      } catch (error) {
        console.error("Error al crear la actividad", error);
      }
    }
    onClose(true);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col space-y-3"
      >
        <FormLabel className="text-lg text-center m-2"></FormLabel>
        {/* ... (el resto del JSX no necesita cambios) ... */}
        <div className="flex gap-9 items-center justify-between">
          <FormField
            control={form.control}
            name="activity_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de la Actividad</FormLabel>
                <FormControl>
                  <Input {...field} maxLength={50} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Titulo de la Actividad</FormLabel>
                <FormControl>
                  <Input {...field} maxLength={100} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="activity_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre de la Actividad</FormLabel>
                <FormControl>
                  <Input {...field} maxLength={50} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>
        <div className="flex gap-2 items-center justify-center">
          <FormField
            control={form.control}
            name="start_date"
            render={({ field }) => (
              <FormItem className="flex flex-col mt-2.5 w-full">
                <FormLabel>Fecha de Inicio</FormLabel>
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
                          <span>Seleccionar Fecha de Inicio</span>
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
                      disabled={false}
                      initialFocus
                      fromYear={1988}
                      toYear={new Date().getFullYear() + 5}
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
            name="end_date"
            render={({ field }) => (
              <FormItem className="flex flex-col mt-2.5 w-full">
                <FormLabel>Fecha Final</FormLabel>
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
                          <span>Seleccionar Fecha de Inicio</span>
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
                      disabled={false}
                      initialFocus
                      fromYear={1988}
                      toYear={new Date().getFullYear() + 5}
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
        <div className="flex gap-4 justify-center items-center">
          <FormField
            control={form.control}
            name="start_time"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Hora de Inicio</FormLabel>
                <FormControl>
                  <Input
                    type="time"
                    {...field}
                    onChange={(e) => {
                      if (
                        e.target.value.match(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
                      ) {
                        field.onChange(e.target.value);
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="end_time"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Hora Final</FormLabel>
                <FormControl>
                  <Input
                    type="time"
                    {...field}
                    onChange={(e) => {
                      if (
                        e.target.value.match(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
                      ) {
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
        <div className="flex gap-4 justify-center items-center">
          <FormField
            control={form.control}
            name="place"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Luagar de Actividad</FormLabel>
                <FormControl>
                  <Input {...field} maxLength={20} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="objetive"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Objetivo de la Acividad</FormLabel>
                <FormControl>
                  <Input {...field} maxLength={100} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>
        <FormItem>
          <FormLabel>Temas Abordados</FormLabel>
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="Escriba un tema y presione Enter"
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                onKeyPress={handleTopicKeyPress}
              />
              <Button type="button" onClick={addTopic} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 p-2 border rounded-md max-h-48 overflow-y-auto">
              {topics.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-muted/40 border rounded-full px-3 py-1.5"
                >
                  <span className="text-sm">{item}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 rounded-full"
                    onClick={() => removeTopic(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </FormItem>
        <FormField
          control={form.control}
          name="topics"
          render={({ field }) => (
            <FormItem className="hidden">
              <FormControl>
                <Input type="hidden" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Observaciones</FormLabel>
              <FormControl>
                <Textarea {...field} maxLength={200} />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
        <div className="flex gap-4 justify-center items-center">
          <FormField
            control={form.control}
            name="authorized_by"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Autorizado por..</FormLabel>
                {isLoadingEmployees ? (
                  <div className="flex items-center gap-2 p-2 border rounded-md bg-muted">
                    <Loader2 className="h-4 w-4 animate-spin" />{" "}
                    <span className="text-sm">Cargando...</span>
                  </div>
                ) : (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value} // Cambiar defaultValue por value para un control completo
                    disabled={isLoadingEmployees}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Autorizador por.." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {employees?.map((employee) => (
                        <SelectItem
                          key={employee.dni}
                          value={employee.dni.toString()}
                        >
                          {employee.first_name} {employee.last_name}
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
            name="planned_by"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Planificado por..</FormLabel>
                {isLoadingEmployees ? (
                  <div className="flex items-center gap-2 p-2 border rounded-md bg-muted">
                    <Loader2 className="h-4 w-4 animate-spin" />{" "}
                    <span className="text-sm">Cargando...</span>
                  </div>
                ) : (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value} // Cambiar defaultValue por value
                    disabled={isLoadingEmployees}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Planeado por.." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {employees?.map((employee) => (
                        <SelectItem
                          key={employee.id}
                          value={employee.dni.toString()}
                        >
                          {employee.first_name} {employee.last_name}
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
            name="executed_by"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Ejecutado por</FormLabel>
                <FormControl>
                  <Input {...field} maxLength={100} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-between items-center gap-x-4">
          <Separator className="flex-1" />
          <p className="text-muted-foreground">SIGEAC</p>
          <Separator className="flex-1" />
        </div>
        <Button type="submit">Enviar</Button>
      </form>
    </Form>
  );
}
