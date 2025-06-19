"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";

import { useCreateSMSActivity } from "@/actions/sms/sms_actividades/actions";
import { useGetEmployesByDepartmentId } from "@/hooks/administracion/useGetEmployeesByDepartment";
import { cn } from "@/lib/utils";
import { SMSActivity } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Separator } from "@radix-ui/react-select";
import { format, isValid, parse } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, ClockIcon, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Calendar } from "../ui/calendar";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

function timeFormat(date: Date) {
  const timeString = date.toString();
  const parsedTime = parse(timeString, "HH:mm:ss", new Date());
  return parsedTime;
}

const FormSchema = z.object({
  activity_name: z.string(),
  activity_number: z.string(),
  start_date: z
    .date()
    .refine((val) => !isNaN(val.getTime()), { message: "Fecha inválida" }),
  end_date: z
    .date()
    .refine((val) => !isNaN(val.getTime()), { message: "Fecha inválida" }),
  hour: z
    .date()
    .refine((val) => !isNaN(val.getTime()), { message: "Hora inválida" }),
  duration: z.string(),
  place: z.string(),
  topics: z.string(),
  objetive: z.string(),
  description: z.string(),
  authorized_by: z.string(),
  planned_by: z.string(),
  executed_by: z.string(),
}).refine(
  (data) => data.end_date >= data.start_date,
  {
    message: "La fecha final debe ser mayor o igual a la fecha de inicio",
    path: ["end_date"],
  }
);

type FormSchemaType = z.infer<typeof FormSchema>;

interface FormProps {
  onClose: () => void;
  initialData?: SMSActivity;
  isEditing?: boolean;
}

export default function CreateSMSActivityForm({
  onClose,
  isEditing,
  initialData,
}: FormProps) {
  
  const router = useRouter();
  const { data: employees, isLoading: isLoadingEmployees } = useGetEmployesByDepartmentId(3);
  const { createSMSActivity } = useCreateSMSActivity();
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
        activity_name: initialData?.activity_name,
        activity_number: initialData?.activity_number,
        start_date: initialData?.start_date,
        end_date: initialData?.end_date,
        hour: initialData?.hour
        ? timeFormat(initialData?.hour)
        : new Date(),
        duration: initialData?.duration,
        place: initialData?.place,
        topics: initialData?.topics,
        objetive: initialData?.objetive,
        description: initialData?.description,
        authorized_by: initialData?.authorized_by,
        planned_by: initialData?.planned_by,
        executed_by: initialData?.executed_by,
    }
  });
  const onSubmit = async (data: FormSchemaType) => {
    console.log(data);

    if (isEditing && initialData) {
      const value = {
        ...data,
        id: initialData.id,
      };
    } else {
      const value = {
        activity_name: data.activity_name,
        activity_number: data.activity_number,
        start_date: data.start_date,
        end_date: data.end_date,
        hour: format(data.hour, "HH:mm:ss"),
        duration: data.duration,
        place: data.place,
        topics: data.topics,
        objetive: data.objetive,
        description: data.description,
        authorized_by: data.authorized_by,
        planned_by: data.planned_by,
        executed_by: data.executed_by,
      };
      try {
        const response = await createSMSActivity.mutateAsync(value);
        router.push(
          `/transmandu/sms/planificacion/actividades`
        );
      } catch (error) {
        console.error("Error al crear la actividad", error);
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
        <FormLabel className="text-lg text-center m-2"></FormLabel>
        
        
        <div className="flex gap-9 items-center justify-between">
          <FormField
              control={form.control}
              name="activity_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de la Actividad</FormLabel>
                  <FormControl>
                     <Input  {...field} maxLength={50} />
                  </FormControl>
                   <FormMessage className="text-xs" />
                </FormItem>
              )}
          />
          
          <FormField
              control={form.control}
              name="activity_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de la Actividad</FormLabel>
                  <FormControl>
                     <Input  {...field} maxLength={50} />
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
                      <FormItem className="flex flex-col mt-2.5">
                        <FormLabel>Inicio de Actividad</FormLabel>
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
                                  <span>Seleccione una fecha...</span>
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
                              locale={es}
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
                      <FormItem className="flex flex-col mt-2.5">
                        <FormLabel>Final de Actividad</FormLabel>
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
                                  <span>Seleccione una fecha...</span>
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
                              locale={es}
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
            name="hour"
            render={({ field }) => {
              const handleChange = (event: { target: { value: any } }) => {
                const timeString = event.target.value;
                const time = parse(timeString, "HH:mm", new Date());
                if (isValid(time)) {
                  field.onChange(time);
                }
              };

              return (
                <FormItem className="w-full flex flex-col">

                  <FormLabel className="mb-1">
                    Hora del Curso
                  </FormLabel>
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
                            format(field.value, "HH:mm")
                          ) : (
                            <span>Seleccionar Hora</span>
                          )}
                          <ClockIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <input
                        type="time"
                        value={field.value ? format(field.value, "HH:mm") : ""}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              );
            }}
          />


      <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Duración del Curso</FormLabel>
                  <FormControl>
                     <Input  {...field} maxLength={20} />
                  </FormControl>
                   <FormMessage className="text-xs" />
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
                     <Input  {...field} maxLength={20} />
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
                     <Input  {...field} maxLength={100} />
                  </FormControl>
                   <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
        </div>
        

        <FormField
              control={form.control}
              name="topics"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Temas Abordados</FormLabel>
                  <FormControl>
                     <Input  {...field} maxLength={200} />
                  </FormControl>
                   <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

          
          <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                     <Input  {...field} maxLength={200} />
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
                    defaultValue={field.value}
                    disabled={isLoadingEmployees} // Deshabilitar durante carga
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Autorizador por.." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {employees?.map((employee) => (
                        <SelectItem key={employee.dni} value={employee.dni.toString()}>
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
                    defaultValue={field.value}
                    disabled={isLoadingEmployees} // Deshabilitar durante carga
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Planeado por.." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {employees?.map((employee) => (
                        <SelectItem key={employee.id} value={employee.dni.toString()}>
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
                   <Input  {...field} maxLength={100} />
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
