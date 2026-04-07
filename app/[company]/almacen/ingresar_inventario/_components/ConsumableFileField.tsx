"use client";

import { FileUpIcon } from "lucide-react";
import { useForm } from "react-hook-form";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { FormValues } from "./consumableFormSchema";

export function ConsumableFileField({
  form,
  name,
  label,
  accept = ".pdf,image/*",
  description,
  busy,
}: {
  form: ReturnType<typeof useForm<FormValues>>;
  name: keyof FormValues;
  label: React.ReactNode;
  accept?: string;
  description?: string;
  busy?: boolean;
}) {
  const fileValue = form.watch(name as any);
  const fileName = fileValue instanceof File ? fileValue.name : "";

  const handleClearFile = (inputRef: HTMLInputElement | null) => {
    if (inputRef) {
      inputRef.value = "";
    }
    form.setValue(name as any, undefined as any, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  return (
    <FormField
      control={form.control}
      name={name as any}
      render={() => {
        let inputRef: HTMLInputElement | null = null;

        return (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <div className="relative">
                <FileUpIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 z-10 pointer-events-none" />
                <Input
                  ref={(el) => {
                    inputRef = el;
                  }}
                  type="file"
                  accept={accept}
                  disabled={busy}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      form.setValue(name as any, f as any, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }
                  }}
                  className="hidden"
                  id={`file-input-${name}`}
                />
                <div
                  onClick={() => !busy && !fileName && inputRef?.click()}
                  className={`flex items-center justify-between pl-10 pr-3 py-2 w-full border border-gray-300 rounded ${
                    !busy && !fileName
                      ? "cursor-pointer hover:border-gray-400"
                      : ""
                  } ${busy ? "opacity-50" : ""}`}
                >
                  <span
                    className={`text-sm truncate flex-1 ${fileName ? "text-gray-900" : "text-gray-500"}`}
                  >
                    {fileName || "Ningún archivo seleccionado"}
                  </span>
                  {fileName && !busy && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClearFile(inputRef);
                      }}
                      className="ml-2 p-1 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                      title="Eliminar archivo"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-red-600"
                      >
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        <line x1="10" y1="11" x2="10" y2="17" />
                        <line x1="14" y1="11" x2="14" y2="17" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </FormControl>
            {description ? (
              <FormDescription>{description}</FormDescription>
            ) : null}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
