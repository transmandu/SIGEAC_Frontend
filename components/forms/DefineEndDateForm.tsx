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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale/es";
import { CalendarIcon, Loader2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Separator } from "../ui/separator";
import { Calendar } from "../ui/calendar";
import { useGetRentingById } from "@/hooks/administracion/useGetRentingById";
import { useDefineEndDateRenting } from "@/actions/administracion/arrendamiento/actions";

const formSchema = z.object({
  end_date: z
    .date({
      required_error: "Debe definir una fecha final",
    })
    .optional(),
});

type FormSchemaType = z.infer<typeof formSchema>;

interface DefineEndDateFormProps {
  id: string;
  onClose: () => void;
}

export function DefineEndDateForm({ id, onClose }: DefineEndDateFormProps) {
  const { data: rentingDetails, isLoading } = useGetRentingById(id);
  const { defineEndDateRenting } = useDefineEndDateRenting();
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      end_date: rentingDetails?.end_date,
    },
  });

  // Función de validación personalizada
  const validateEndDate = (date: Date) => {
    const startDate = rentingDetails?.start_date;

    if (startDate && date < new Date(startDate)) {
      return "La fecha final no debe ser menor a la fecha de inicio";
    }
    return true;
  };

  const onSubmit = async (formData: FormSchemaType) => {
    // Validación adicional antes de enviar
    const validationResult = validateEndDate(formData.end_date!);
    if (typeof validationResult === "string") {
      form.setError("end_date", { message: validationResult });
      return;
    }

    const data = {
      end_date: formData.end_date,
    };

    defineEndDateRenting.mutate(
      { id, data: { end_date: formData.end_date } },
      {
        onSuccess: () => onClose(), // Cierra solo si la mutación es exitosa
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="end_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-sm font-medium text-gray-700">
                  Definir Fecha Final
                </FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal h-10",
                          !field.value && "text-muted-foreground",
                          "hover:bg-gray-50 transition-colors"
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
                      disabled={(date) => {
                        const startDate = rentingDetails?.start_date
                          ? new Date(rentingDetails.start_date)
                          : new Date("1999-07-21");
                        return (
                          date < startDate || date > new Date() // Opcional: para no permitir fechas futuras
                        );
                      }}
                      initialFocus
                      className="border rounded-md shadow-sm"
                      fromYear={1980} // Año mínimo que se mostrará
                      toYear={new Date().getFullYear()} // Año máximo (actual)
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
                <FormMessage className="text-xs text-red-500">
                  {form.formState.errors.end_date?.message}
                </FormMessage>
                <div className="text-xs text-gray-500 mt-1">
                  {rentingDetails?.start_date && (
                    <p>
                      Fecha de inicio:{" "}
                      {format(new Date(rentingDetails.start_date), "PPP", {
                        locale: es,
                      })}
                    </p>
                  )}
                </div>
              </FormItem>
            )}
          />
        </div>

        <div className="flex items-center w-full gap-2">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">SIGEAC</span>
          <Separator className="flex-1" />
        </div>

        <div className="flex gap-3 w-full">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={defineEndDateRenting.isPending}
            className="flex-1 bg-primary hover:bg-primary/90 transition-colors"
          >
            {defineEndDateRenting.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Definiendo...
              </>
            ) : (
              "Registrar"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
