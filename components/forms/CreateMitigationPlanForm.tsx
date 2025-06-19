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

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

import { useCreateMitigationPlan, useUpdateMitigationPlan } from "@/actions/sms/planes_de_mitigation/actions";
import { MitigationPlan } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Separator } from "../ui/separator";
import { Textarea } from "../ui/textarea";

const FormSchema = z.object({
  description: z.string()
    .min(5, { message: "La descripción debe tener al menos 5 caracteres" })
    .max(200, { message: "La descripción no puede exceder los 200 caracteres" }),
    
  responsible: z.string()
    .min(3, { message: "El responsable debe tener al menos 3 caracteres" })
    .max(50, { message: "El responsable no puede exceder los 50 caracteres" }),

  start_date: z
    .date()
    .refine((val) => !isNaN(val.getTime()), { message: "Fecha Invalida" }),
});

type FormSchemaType = z.infer<typeof FormSchema>;

interface FormProps {
  onClose: () => void;
  id: number;
  isEditing?: boolean;
  initialData?: MitigationPlan;
}

export default function CreateMitigationPlanForm({
  onClose,
  id,
  initialData,
  isEditing,
}: FormProps) {


  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      description: initialData?.description,
      responsible: initialData?.responsible,
      start_date: initialData?.start_date
        ? new Date(initialData?.start_date)
        : new Date(),
    },
  });

  const { createMitigationPlan } = useCreateMitigationPlan();
  const { updateMitigationPlan } = useUpdateMitigationPlan();

  const onSubmit = async (data: FormSchemaType) => {
    if (isEditing && initialData) {
      const value = {
        ...data,
        id: initialData.id,
      };
      await updateMitigationPlan.mutateAsync(value);
    } else {
      await createMitigationPlan.mutateAsync({
        ...data,
        danger_identification_id: id,
      });
      console.log(data);
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
          Plan de Mitigacion
        </FormLabel>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripcion del Plan</FormLabel>
              <FormControl>
                <Textarea placeholder="" {...field} />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />


        <div className="flex gap-2 items-center justify-center">
 
          <FormField
            control={form.control}
            name="responsible"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Area de Responsable</FormLabel>
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
                    <SelectItem value="SMS">DIRECCIÓN DE SMS</SelectItem>
                    <SelectItem value="OPERACIONES">OPERACIONES</SelectItem>
                    <SelectItem value="MANTENIMIENTO">MANTENIMIENTO</SelectItem>
                    <SelectItem value="ADMINISTRACION_RRHH">ADMINISTRACION Y RRHH</SelectItem>
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
          name="start_date"
          render={({ field }) => (
            <FormItem className="flex flex-col mt-2.5">
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
