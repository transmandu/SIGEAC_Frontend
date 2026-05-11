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
import { useCreateCourseExam } from "@/actions/general/cursos/actions";
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
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Loader2 } from "lucide-react";

interface FormProps {
  onClose: () => void;
  courseId: string;
}

export function CreateExamForm({ onClose, courseId }: FormProps) {
  const { selectedCompany } = useCompanyStore();
  const { createCourseExam } = useCreateCourseExam();

  const FormSchema = z.object({
    name: z.string().min(1, "El nombre es obligatorio"),
    description: z.string().min(1, "La descripción es obligatoria"),
    exam_date: z
      .date({ required_error: "La fecha es obligatoria" })
      .refine((val) => !isNaN(val.getTime()), { message: "Fecha no válida" }),
  });

  type FormSchemaType = z.infer<typeof FormSchema>;

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      description: "",
      exam_date: undefined,
    },
  });

  const onSubmit = async (data: FormSchemaType) => {
    try {
      await createCourseExam.mutateAsync({
        company: selectedCompany!.slug,
        course_id: courseId,
        data: data,
      });
      onClose();
    } catch (error) {
      console.error("Error al crear el examen:", error);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col space-y-4"
      >
        <div className="flex flex-col gap-4 items-center justify-center">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Nombre del Examen</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Examen Final" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="exam_date"
            render={({ field }) => (
              <FormItem className="flex flex-col w-full">
                <FormLabel>Fecha del Examen</FormLabel>
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
                      initialFocus
                      fromYear={1980}
                      toYear={new Date().getFullYear() + 5}
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
            name="description"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Descripción</FormLabel>
                <FormControl>
                  <Textarea placeholder="Detalles del examen..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-between items-center gap-x-4 pt-2">
          <Separator className="flex-1" />
          <p className="text-muted-foreground text-sm">SIGEAC</p>
          <Separator className="flex-1" />
        </div>
        
        <div className="flex justify-end gap-2 w-full mt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button disabled={createCourseExam.isPending} type="submit">
            {createCourseExam.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              "Guardar Examen"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
