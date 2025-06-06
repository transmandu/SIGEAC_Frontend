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

import { CalendarIcon } from "lucide-react";
import { es } from "date-fns/locale";

import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format, min } from "date-fns";

import { Separator } from "@radix-ui/react-select";
import {
  useCreateMitigationMeasure,
  useUpdateMitigationMeasure,
} from "@/actions/sms/medida_de_mitigacion/actions";
import { MitigationMeasure } from "@/types";

const FormSchema = z.object({
  description: z.string().min(5),
  implementation_supervisor: z
    .string()
    .min(3, { message: "El supervisor debe tener al menos 3 caracteres" })
    .max(19, { message: "El supervisor no puede exceder los 19 caracteres" }),
  implementation_responsible: z
    .string()
    .min(3, { message: "El responsable debe tener al menos 3 caracteres" })
    .max(23, { message: "El responsable no puede exceder los 23 caracteres" }),

  estimated_date: z
    .date()
    .refine((val) => !isNaN(val.getTime()), { message: "Invalid Date" }),
  execution_date: z
    .date()
    .refine((val) => !isNaN(val.getTime()), { message: "Invalid Date" }),
});

type FormSchemaType = z.infer<typeof FormSchema>;

interface FormProps {
  onClose: () => void;
  id: number | string;
  isEditing?: boolean;
  initialData?: MitigationMeasure;
}

export default function CreateMitigationMeasureForm({
  onClose,
  id,
  initialData,
  isEditing,
}: FormProps) {
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      description: initialData?.description,
      implementation_responsible: initialData?.implementation_responsible,
      implementation_supervisor: initialData?.implementation_supervisor,
      estimated_date: initialData?.estimated_date
        ? new Date(initialData.estimated_date)
        : new Date(),
      execution_date: initialData?.execution_date
        ? new Date(initialData.execution_date)
        : new Date(),
    },
  });

  const { createMitigationMeasure } = useCreateMitigationMeasure();
  const { updateMitigationMeasure } = useUpdateMitigationMeasure();

  const onSubmit = async (data: FormSchemaType) => {
    if (isEditing && initialData) {
      const value = {
        ...data,
        id: initialData.id,
      };
      await updateMitigationMeasure.mutateAsync(value);
    } else {
      await createMitigationMeasure.mutateAsync({
        ...data,
        mitigation_plan_id: id,
      });
    }

    onClose();
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col space-y-3"
      >
        <FormLabel className="text-lg text-center m-2">
          Medida a Implementar
        </FormLabel>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripcion de la medida</FormLabel>
              <FormControl>
                <Input placeholder="Descripcion de la medida" {...field} />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <div className="flex justify-center items-center gap-2">
          <FormField
            control={form.control}
            name="implementation_responsible"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Encargado de la implementación</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Quien implementara la medida"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="implementation_supervisor"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Encargado del seguimiento</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Quien se encarga de supervisar"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-center items-center gap-2">
          <FormField
            control={form.control}
            name="estimated_date"
            render={({ field }) => (
              <FormItem className="flex flex-col mt-2.5 w-full">
                <FormLabel>Fecha estimada de ejecución</FormLabel>
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
                        date < new Date("2019-01-01") ||
                        date > new Date(new Date().getFullYear(), 12, 31)
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
            name="execution_date"
            render={({ field }) => (
              <FormItem className="flex flex-col mt-2.5 w-full">
                <FormLabel>Fecha de ejecución</FormLabel>
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
        <div className="flex justify-between items-center gap-x-4">
          <Separator className="flex-1" />
          <p className="text-muted-foreground">SIGEAC</p>
          <Separator className="flex-1" />
        </div>
        <Button>Enviar</Button>
      </form>
    </Form>
  );
}
