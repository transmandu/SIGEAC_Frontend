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
  useCreateCourse,
  useUpdateCourse,
} from "@/actions/general/cursos/actions";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import { Course } from "@/types";
import { addDays, format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FormProps {
  onClose: (open: boolean) => void;
  initialData?: Course;
  isEditing?: boolean;
  selectedDate?: string;
}
export function CreateCourseForm({
  onClose,
  isEditing,
  initialData,
  selectedDate,
}: FormProps) {
  const { selectedCompany, selectedStation } = useCompanyStore();
  const { createCourse } = useCreateCourse();
  const { updateCourse } = useUpdateCourse();

  const FormSchema = z
    .object({
      name: z.string(),
      description: z.string(),
      course_type: z.string(),
      instructor: z.string().optional(),
      end_date: z
        .date()
        .refine((val) => !isNaN(val.getTime()), { message: "Fecha no válida" }),
      start_date: z
        .date()
        .refine((val) => !isNaN(val.getTime()), { message: "Fecha no válida" }),
      end_time: z.string(),
      start_time: z.string(),
    })
    .refine((data) => data.end_date >= data.start_date, {
      message:
        "La fecha de fin debe ser igual o posterior a la fecha de inicio",
      path: ["end_date"], // Esto hace que el error se muestre en el campo end_date
    });

  type FormSchemaType = z.infer<typeof FormSchema>;

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: initialData?.name,
      course_type: initialData?.course_type || "",
      description: initialData?.description,
      instructor: initialData?.instructor,

      start_date: initialData?.start_date
        ? addDays(new Date(initialData.start_date), 1)
        : selectedDate
          ? new Date(selectedDate)
          : undefined,

      end_date: initialData?.end_date
        ? addDays(new Date(initialData.end_date), 1)
        : undefined,

      start_time: initialData
        ? initialData.start_time
        : selectedDate
          ? selectedDate.split(" ")[1]
          : undefined,

      end_time: initialData
        ? initialData.end_time
        : selectedDate
          ? selectedDate.split(" ")[1]
          : undefined,
    },
  });

  const onSubmit = async (data: FormSchemaType) => {
    if (initialData && isEditing) {
      const value = {
        id: initialData.id,
        company: selectedCompany!.slug,
        data: {
          name: data.name,
          description: data.description,
          instructor: data.instructor,
          start_date: data.start_date,
          end_date: data.end_date,
          start_time: data.start_time,
          end_time: data.end_time,
          course_type: data.course_type,
        },
      };
      updateCourse.mutateAsync(value);
    } else {
      try {
        await createCourse.mutateAsync({
          company: selectedCompany!.slug,
          location_id: selectedStation!,
          course: data,
        });
      } catch (error) {
        console.error("Error al crear el curso:", error);
      }
    }
    onClose(false);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col space-y-3"
      >
        <FormLabel className="text-lg text-center">Formulario Curso</FormLabel>

        <div className="flex flex-col gap-2 items-center justify-center  ">
          <div className="flex  justify-center items-center w-full gap-10">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Nombre del Curso</FormLabel>
                  <FormControl>
                    <Input placeholder="" {...field} />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="course_type"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Tipo de Curso</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar Curso" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="RECURRENTE">RECURRENTE</SelectItem>
                      <SelectItem value="INICIAL">INICIAL</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex w-full justify-center items-center gap-10">
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
                        disabled={false} // Solo deshabilitar fechas futuras
                        initialFocus
                        fromYear={1988} // Año mínimo que se mostrará
                        toYear={new Date().getFullYear() + 5} // Año máximo (actual)
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
              name="start_time"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Hora de Inicio</FormLabel>
                  <FormControl>
                    <Input
                      type="time"
                      {...field}
                      onChange={(e) => {
                        // Validamos que el formato sea correcto
                        if (
                          e.target.value.match(
                            /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
                          )
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

          <div className="flex  justify-center items-center w-full gap-10">
            <FormField
              control={form.control}
              name="end_date"
              render={({ field }) => (
                <FormItem className="flex flex-col mt-2.5 w-full">
                  <FormLabel>Fecha de Finalización</FormLabel>
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
                            <span>Seleccionar Fecha</span>
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
                        disabled={false} // Solo deshabilitar fechas futuras
                        initialFocus
                        fromYear={1980} // Año mínimo que se mostrará
                        toYear={new Date().getFullYear() + 5} // Año máximo (actual)
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
              name="end_time"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Hora Final</FormLabel>
                  <FormControl>
                    <Input
                      type="time"
                      {...field}
                      onChange={(e) => {
                        // Validamos que el formato sea correcto
                        if (
                          e.target.value.match(
                            /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
                          )
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

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Descripcion</FormLabel>
                <FormControl>
                  <Textarea placeholder="" {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="instructor"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Instructor</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} />
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
        <Button disabled={createCourse.isPending}>
          {createCourse.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            "Enviar"
          )}
        </Button>
      </form>
    </Form>
  );
}
