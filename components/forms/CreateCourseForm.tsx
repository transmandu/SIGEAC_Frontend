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
import { Course, VoluntaryReport } from "@/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Label } from "../ui/label";
import Image from "next/image";
import { useCreateCourse } from "@/actions/cursos/actions";
import { useCompanyStore } from "@/stores/CompanyStore";

interface FormProps {
  onClose: () => void;
  initialData?: Course;
  isEditing?: boolean;
}
// { onClose }: FormProps
// lo de arriba va en prop
export function CreateCourseForm({
  onClose,
  isEditing,
  initialData,
}: FormProps) {
  const { selectedCompany } = useCompanyStore();
  const { createCourse } = useCreateCourse();
  
  const FormSchema = z.object({
    name: z.string(),
    description: z.string(),
    duration: z.string(),
    time: z.string(),
    instructor: z.string().optional(),
    end_date: z
      .date()
      .refine((val) => !isNaN(val.getTime()), { message: "Invalid Date" }),
    start_date: z
      .date()
      .refine((val) => !isNaN(val.getTime()), { message: "Invalid Date" }),
  });

  type FormSchemaType = z.infer<typeof FormSchema>;

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: initialData?.name,
      description: initialData?.description,
      instructor: initialData?.instructor,
      time: initialData?.time,
      duration: initialData?.duration,
      start_date: initialData?.start_date
        ? new Date(initialData.start_date)
        : new Date(),
      end_date: initialData?.end_date
        ? new Date(initialData.end_date)
        : new Date(),
    },
  });

  const onSubmit = async (data: FormSchemaType) => {
    if (initialData && isEditing) {
      //await updateVoluntaryReport.mutateAsync(value);
    } else {
      const value = {
        company: selectedCompany,
        course: data,
      }
      try {
        await createCourse.mutateAsync(value);
      } catch (error) {
        console.error("Error al crear el curso:", error);
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
        <FormLabel className="text-lg text-center">Curso</FormLabel>

        <div className="flex flex-col gap-2 items-center justify-center  ">
          <div className="flex justify-center items-center gap-10">
            <FormField
              control={form.control}
              name="start_date"
              render={({ field }) => (
                <FormItem className="flex flex-col mt-2.5">
                  <FormLabel>Fecha de Inicio</FormLabel>
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
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
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
                  <FormLabel>Fecha Final</FormLabel>
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
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
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

          <div className="flex w-full gap-10">
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Duracion</FormLabel>
                  <FormControl>
                    <Input placeholder="" {...field} />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Hora del Curso</FormLabel>
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
