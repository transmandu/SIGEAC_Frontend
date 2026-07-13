"use client";

import { useCreateErrorReport } from "@/hooks/sistema/reportes/useCreateErrorReport";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ERROR_REPORT_MODULES, getDefaultErrorReportModule } from "@/lib/errorReportModules";
import { ERROR_REPORT_SEVERITIES } from "@/lib/errorReportSeverity";
import { useAuth } from "@/contexts/AuthContext";

const formSchema = z.object({
  description: z.string().min(10, {
    message: "Describe el problema o solicitud con al menos 10 carácteres.",
  }),
  module: z.string().min(1, {
    message: "Debe seleccionar un módulo.",
  }),
  severity: z.string().optional(),
  http_status: z.string().optional(),
});

interface FormProps {
  onClose: () => void;
  /** Muestra severidad y código HTTP, solo disponibles para el superuser desde el panel de gestión. */
  showAdvancedFields?: boolean;
}

export default function CreateErrorReportForm({ onClose, showAdvancedFields = false }: FormProps) {
  const { createErrorReport } = useCreateErrorReport();
  const { user } = useAuth();
  const [images, setImages] = useState<File[]>([]);

  const defaultModule = showAdvancedFields ? "" : getDefaultErrorReportModule(user?.roles) ?? "";

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      module: defaultModule,
      severity: "",
      http_status: "",
    },
  });

  const previews = images.map((image) => URL.createObjectURL(image));

  useEffect(() => {
    return () => previews.forEach((preview) => URL.revokeObjectURL(preview));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images]);

  const handleAddImages = (files: FileList | null) => {
    if (!files) return;
    setImages((prev) => [...prev, ...Array.from(files)]);
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await createErrorReport.mutateAsync({
      description: values.description,
      module: values.module,
      severity: showAdvancedFields && values.severity
        ? (values.severity as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL")
        : undefined,
      http_status: showAdvancedFields && values.http_status
        ? Number(values.http_status)
        : undefined,
      images: images.length > 0 ? images : undefined,
    });
    form.reset();
    setImages([]);
    onClose();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="module"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Módulo</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione el módulo relacionado..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {ERROR_REPORT_MODULES.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe el error que encontraste o la solicitud que quieres hacer..."
                  className="min-h-32"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="space-y-2">
          <Label htmlFor="images">Imágenes (opcional)</Label>
          <div className="flex flex-wrap gap-2">
            {previews.map((preview, index) => (
              <div key={preview} className="relative h-16 w-16">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt={`Imagen ${index + 1}`}
                  className="h-16 w-16 rounded object-cover border"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  aria-label={`Quitar imagen ${index + 1}`}
                  className="absolute -top-1.5 -right-1.5 rounded-full bg-destructive text-destructive-foreground h-5 w-5 flex items-center justify-center"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            <label
              htmlFor="images"
              className="flex h-16 w-16 flex-col items-center justify-center gap-1 rounded border border-dashed text-muted-foreground cursor-pointer hover:bg-muted/50"
            >
              <ImagePlus className="h-5 w-5" />
              <span className="text-[10px]">Agregar</span>
            </label>
            <input
              id="images"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(event) => {
                handleAddImages(event.target.files);
                event.target.value = "";
              }}
            />
          </div>
        </div>
        {showAdvancedFields && (
          <>
            <FormField
              control={form.control}
              name="severity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Severidad (opcional)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sin clasificar" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ERROR_REPORT_SEVERITIES.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="http_status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código HTTP (opcional)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Ej: 404" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
        <Button
          className="bg-primary mt-2 text-white hover:bg-blue-900 disabled:bg-primary/70"
          disabled={createErrorReport.isPending}
          type="submit"
        >
          {createErrorReport.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <p>Enviar reporte</p>
          )}
        </Button>
      </form>
    </Form>
  );
}
