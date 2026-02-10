// /components/forms/componentes/CreateComponentForm/FileField.tsx
"use client";

import { FileUpIcon } from "lucide-react";
import { Control, UseFormSetValue } from "react-hook-form";

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FormValues } from "@/components/forms/mantenimiento/almacen/CreateComponentForm";

type Props = {
  control: Control<FormValues>;
  setValue: UseFormSetValue<FormValues>;
  name: string;
  label: React.ReactNode;
  description?: string;
  accept: string;
  currentFileLabel?: string;
  onDownload?: () => void;
  replaceHint?: string;
};

export function FileField({
  control,
  setValue,
  name,
  label,
  description,
  accept,
  currentFileLabel,
  onDownload,
  replaceHint,
}: Props) {
  const hasCurrent = Boolean(currentFileLabel && onDownload);

  return (
    <FormField
      control={control}
      name={name}
      render={() => (
        <FormItem>
          <FormLabel>{label}</FormLabel>

          {hasCurrent && (
            <div className="text-xs text-muted-foreground bg-muted p-2 rounded mb-2">
              <span className="font-medium">Archivo actual:</span>{" "}
              <button
                type="button"
                onClick={onDownload}
                className="text-primary hover:underline cursor-pointer underline"
              >
                {currentFileLabel}
              </button>
            </div>
          )}

          <FormControl>
            <div className="relative h-10 w-full">
              <FileUpIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 z-10" />
              <Input
                type="file"
                accept={accept}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  setValue(name, f as any, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }}
                className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6E23DD] focus:border-transparent cursor-pointer"
              />
            </div>
          </FormControl>

          <FormDescription>
            {hasCurrent ? (replaceHint ?? "Subir nuevo archivo para reemplazar el actual") : (description ?? "PDF o imagen. Máx. 10 MB.")}
          </FormDescription>

          <FormMessage />
        </FormItem>
      )}
    />
  );
}
