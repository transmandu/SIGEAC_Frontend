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

import { useUpdateFollowUpControl } from "@/actions/sms/controles_de_seguimiento/actions";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { FollowUpControl } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Separator } from "../ui/separator";
import Image from "next/image";
import { useCompanyStore } from "@/stores/CompanyStore";
const FormSchema = z.object({
  description: z.string().max(255),
  date: z
    .date()
    .refine((val) => !isNaN(val.getTime()), { message: "Invalid Date" }),
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
});

type FormSchemaType = z.infer<typeof FormSchema>;

interface FormProps {
  onClose: () => void;
  initialData: FollowUpControl;
}

export function EditFollowUpControlForm({ onClose, initialData }: FormProps) {
  const { selectedCompany } = useCompanyStore();
  const { plan_id, measure_id } = useParams<{
    plan_id: string;
    measure_id: string;
  }>();
  console.log("plan id and measuer id", plan_id, measure_id);
  const { updateFollowUpControl } = useUpdateFollowUpControl();
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      description: initialData.description || "",
      date: initialData.date ? new Date(initialData.date) : new Date(),
    },
  });

  const onSubmit = async (data: FormSchemaType) => {
    const formattedData = {
      company: selectedCompany,
      id: initialData.id.toString(),
      data: {
        ...data,
        id: initialData.id,
        mitigation_measure_id: measure_id,
      },
    };
    await updateFollowUpControl.mutateAsync(formattedData);
    onClose();
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col space-y-3"
      >
        <FormLabel className="text-lg text-center">
          Formulario de Control de Seguimiento
        </FormLabel>
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripcion del Control</FormLabel>
              <FormControl>
                <Input placeholder="" {...field} />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col mt-2.5 w-full">
              <FormLabel>Fecha del Control</FormLabel>
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
                    disabled={(date) => date > new Date()} // Solo deshabilitar fechas futuras
                    initialFocus
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
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-center items-center gap-2">
          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Imagen General</FormLabel>

                <div className="flex items-center gap-4">
                  {field.value ? (
                    <Image
                      src={URL.createObjectURL(field.value)}
                      alt="Preview"
                      className="h-16 w-16 rounded-md object-cover"
                      width={64}
                      height={64}
                    />
                  ) : initialData?.image &&
                    typeof initialData.image === "string" ? (
                    <Image
                      src={
                        initialData.image.startsWith("data:image")
                          ? initialData.image
                          : `data:image/jpeg;base64,${initialData.image}`
                      }
                      alt="Preview"
                      className="h-16 w-16 rounded-md object-cover"
                      width={64}
                      height={64}
                    />
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
                <div className="flex items-center gap-4">
                  {field.value && (
                    <div>
                      <p className="text-sm text-gray-500">
                        Archivo seleccionado:
                      </p>
                      <p className="font-semibold text-sm">
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
        <div className="flex justify-between items-center gap-x-4">
          <Separator className="flex-1" />
          <p className="text-muted-foreground">SIGEAC</p>
          <Separator className="flex-1" />
        </div>
        <Button disabled={updateFollowUpControl.isPending}>
          {updateFollowUpControl.isPending ? (
            <Loader2 className="animate-spin size-4" />
          ) : (
            "Actualizar Control de Seguimiento"
          )}
        </Button>
      </form>
    </Form>
  );
}
