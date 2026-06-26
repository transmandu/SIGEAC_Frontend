"use client"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { FileText, ImageIcon, Upload, X } from "lucide-react"
import Image from "next/image"
import { useRef, useCallback } from "react"
import type { UseFormReturn } from "react-hook-form"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { RequiredIndicator } from "./RequiredIndicator"

interface AdditionalInfoSectionProps {
  form: UseFormReturn<any>;
}

function ImageUploadField({ value, onChange }: { value: File | undefined; onChange: (file: File | undefined) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange(file);
    }
  }, [onChange]);

  const handleRemove = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(undefined);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, [onChange]);

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
          "relative w-full overflow-hidden rounded-md border-2 border-dashed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          value
            ? "border-muted-foreground/40 hover:border-muted-foreground/70"
            : "border-muted-foreground/40 hover:border-muted-foreground/60",
          // Compact aspect ratio area
          "aspect-[16/9]"
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
            <span className="text-xs text-muted-foreground/60 leading-tight text-center">
              Click para subir imagen
            </span>
          </div>
        )}
      </button>
    </>
  );
}

export function AdditionalInfoSection({ form }: AdditionalInfoSectionProps) {
  return (
    <div className="rounded-lg border bg-card p-3 space-y-1.5">
      <div className="flex items-center gap-1.5">
        <h4 className="text-xs font-semibold text-muted-foreground tracking-wider select-none">INFORMACIÓN ADICIONAL</h4>
        <Separator className="flex-1" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Justification — takes 3/4 of the row on large screens */}
        <div className="lg:col-span-3 lg:flex lg:flex-col">
          <FormField
            control={form.control}
            name="justification"
            render={({ field }) => (
              <FormItem className="space-y-1.5 lg:flex lg:flex-col lg:flex-1 lg:gap-1.5">
                  <FormLabel className="flex items-center gap-1.5 select-none">
                    <FileText className="size-3.5 text-muted-foreground" />
                    Justificación
                    <RequiredIndicator />
                  </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Ej: Necesidad de la pieza X para instalación..."
                    className="min-h-[60px] lg:min-h-0 lg:flex-1 resize-none rounded-md border-muted-foreground/30 bg-muted/20 shadow-sm hover:border-muted-foreground/50 focus-visible:border-muted-foreground/50 focus-visible:ring-1 focus-visible:ring-muted-foreground/10 focus-visible:ring-offset-0 transition-colors"
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
              <FormLabel className="flex items-center gap-1.5 select-none">
                <ImageIcon className="size-3.5 text-muted-foreground" />
                Imagen General
              </FormLabel>
              <FormControl>
                <ImageUploadField value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}