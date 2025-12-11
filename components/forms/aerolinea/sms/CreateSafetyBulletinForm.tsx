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
  useCreateBulletin,
  useUpdateBulletin,
} from "@/actions/sms/boletin/actions";
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
import { addDays, format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, FileText, Loader2, X } from "lucide-react";
import Image from "next/image";
import { SafetyBulletin } from "@/types";
interface FormProps {
  onClose: (open: boolean) => void;
  initialData?: SafetyBulletin;
  isEditing?: boolean;
  selectedDate?: string;
}
export function CreateSafetyBulletinForm({
  onClose,
  isEditing,
  initialData,
  selectedDate,
}: FormProps) {
  const { selectedCompany } = useCompanyStore();
  const { createBulletin } = useCreateBulletin();
  const { updateBulletin } = useUpdateBulletin();

  const FormSchema = z.object({
    title: z.string(),
    description: z.string(),
    date: z
      .date()
      .refine((val) => !isNaN(val.getTime()), { message: "Fecha no válida" }),
    image: z
      .instanceof(File)
      .refine((file) => file.size <= 10 * 1024 * 1024, "Max 10MB")
      .refine(
        (file) => ["image/jpeg", "image/png"].includes(file.type),
        "Solo JPEG/PNG"
      )
      .optional(),

    document: z
      .instanceof(File, { message: "Debes seleccionar un archivo PDF" }) // Mensaje cuando no hay archivo
      .refine((file) => file.size <= 10 * 1024 * 1024, "Máximo 10MB")
      .refine(
        (file) => file.type === "application/pdf",
        "Solo se permiten archivos PDF"
      ),
  });

  type FormSchemaType = z.infer<typeof FormSchema>;

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: initialData?.title,
      description: initialData?.description,
      date: initialData?.date
        ? addDays(new Date(initialData.date), 1)
        : selectedDate
          ? new Date(selectedDate)
          : undefined,
    },
  });

  const onSubmit = async (data: FormSchemaType) => {
    if (initialData && isEditing) {
      const value = {
        company: selectedCompany!.slug,
        id: initialData.id,
        data: {
          title: data.title,
          description: data.description,
          date: data.date,
          image: data.image,
          document: data.document,
        },
      };
      updateBulletin.mutateAsync(value);
    } else {
      try {
        await createBulletin.mutateAsync({
          company: selectedCompany!.slug,
          data: data,
        });
        console.log("data", data);
      } catch (error) {
        console.error("Error al crear el boletin:", error);
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
        <FormLabel className="text-lg text-center">
          Formulario Boletin
        </FormLabel>

        <div className="flex flex-col gap-2 items-center justify-center  ">
          <div className="flex  justify-center items-center w-full gap-10">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Titulo</FormLabel>
                  <FormControl>
                    <Input placeholder="" {...field} />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </div>

          <div className="flex w-full justify-center items-center gap-10">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col mt-2.5 w-full">
                  <FormLabel>Fecha</FormLabel>
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
        </div>

        {/* Sección de Carga de Archivos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Imagen del Reporte</FormLabel>
                <div className="flex flex-col-reverse items-center gap-4">
                  {field.value ? (
                    <div className="relative">
                      {/* Mostrar preview del archivo seleccionado */}
                      <div className="relative w-16 h-16">
                        <Image
                          src={URL.createObjectURL(field.value)}
                          alt="Preview"
                          fill
                          className="rounded-md object-contain"
                          unoptimized // Para mostrar el blob URL
                        />
                      </div>
                    </div>
                  ) : initialData?.image &&
                    typeof initialData.image === "string" ? (
                    <div className="relative">
                      <div className="relative w-16 h-16">
                        <Image
                          src={`${process.env.NEXT_PUBLIC_STORAGE_BASE_URL}${initialData.image}`}
                          alt="Preview"
                          fill
                          className="rounded-md object-contain"
                        />
                      </div>
                    </div>
                  ) : null}
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/jpeg, image/png, image/jpg"
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
                <div className="flex flex-col-reverse gap-2">
                  {field.value ? (
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded">
                          <FileText className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm truncate max-w-[200px]">
                            {field.value.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(field.value.size / 1024).toFixed(0)} KB
                          </p>
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                        onClick={() => field.onChange(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : initialData?.document &&
                    typeof initialData.document === "string" ? (
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded">
                          <FileText className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm truncate max-w-[200px]">
                            {initialData.document.split("/").pop() || ""}
                          </p>
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                        onClick={() => field.onChange(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : null}

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
        <Button disabled={createBulletin.isPending}>
          {createBulletin.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            "Enviar"
          )}
        </Button>
      </form>
    </Form>
  );
}
