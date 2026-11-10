"use client";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { MessageSquareText, Upload, X } from "lucide-react";
import Image from "next/image";
import { useRef, useCallback } from "react";
import type { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { RequiredIndicator } from "@/components/misc/RequiredIndicator";
import { FieldLabel, RequisitionSection } from "./RequisitionSection";
import { textareaClass } from "@/components/forms/mantenimiento/almacen/_components/form-theme";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png"];

interface AdditionalInfoSectionProps {
  form: UseFormReturn<any>;
}

function ImageUploadField({
  value,
  onChange,
}: {
  value: File | undefined;
  onChange: (file: File | undefined) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        toast.error(
          "¡Ops! Formato de imagen inválido. Solo se permiten archivos JPG o PNG.",
        );
        e.target.value = "";
        return;
      }

      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        toast.error(
          "¡Ops! La imagen excede el límite de 5MB. Seleccione una más ligera.",
        );
        e.target.value = "";
        return;
      }

      onChange(file);
    },
    [onChange],
  );

  const handleRemove = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange(undefined);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    },
    [onChange],
  );

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg, image/png"
        className="hidden"
        onChange={handleFileChange}
      />
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          "relative w-full overflow-hidden rounded-md border-2 border-dashed transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          value
            ? "border-muted-foreground/40 hover:border-muted-foreground/70"
            : "border-muted-foreground/40 hover:border-muted-foreground/60",
          // Compact aspect ratio area
          "aspect-video",
        )}
      >
        {value ? (
          <>
            <Image
              src={URL.createObjectURL(value)}
              alt="Preview"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 25vw"
              unoptimized
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-1.5 right-1.5 z-10 flex size-5 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
              aria-label="Eliminar imagen"
            >
              <X className="size-3" />
            </button>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 p-2">
            <Upload className="size-5 text-muted-foreground/60" />
            <span className="text-xs text-muted-foreground leading-tight text-center">
              Pulse para subir una imagen
            </span>
          </div>
        )}
      </button>
    </>
  );
}

export function AdditionalInfoSection({ form }: AdditionalInfoSectionProps) {
  return (
    <RequisitionSection
      icon={MessageSquareText}
      title="Información adicional"
      description="Por qué se solicita y, si ayuda, una imagen de referencia."
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Justification — takes 3/4 of the row on large screens */}
        <div className="lg:col-span-3 lg:flex lg:flex-col">
          <FormField
            control={form.control}
            name="justification"
            render={({ field }) => (
              <FormItem className="space-y-1.5 lg:flex lg:flex-col lg:flex-1 lg:gap-1.5">
                <FieldLabel>
                  Justificación
                  <RequiredIndicator />
                </FieldLabel>
                <FormControl>
                  <Textarea
                    placeholder="Ej: Necesidad de la pieza X para instalación..."
                    className={cn(
                      textareaClass,
                      "min-h-24 lg:min-h-0 lg:flex-1 max-sm:text-base",
                    )}
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>

        {/* Image upload — takes 1/4 of the row on large screens */}
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem className="space-y-1.5 lg:flex lg:flex-col lg:flex-1 lg:gap-1.5">
              <FieldLabel>Imagen general</FieldLabel>
              <FormControl>
                <ImageUploadField
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </RequisitionSection>
  );
}
