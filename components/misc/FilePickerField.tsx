"use client";

import { useRef, useState } from "react";
import { FileUp, X } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

const formatSize = (bytes: number) =>
  bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;

/**
 * Selector de un archivo: se pulsa o se arrastra encima. Valida tipo y tamaño
 * antes de aceptarlo, con el mismo aviso en cualquier pantalla, y un archivo
 * rechazado nunca queda a la vista.
 */
export function FilePickerField({
  file,
  onChange,
  acceptedTypes,
  typesLabel,
  maxBytes,
  disabled,
  emptyLabel = "Seleccionar archivo",
  className,
}: {
  file: File | null | undefined;
  onChange: (file: File | undefined) => void;
  /** Tipos MIME admitidos (p. ej. `application/pdf`). */
  acceptedTypes: string[];
  /** Cómo se nombran al usuario: "PDF, JPG o PNG". */
  typesLabel: string;
  maxBytes: number;
  disabled?: boolean;
  emptyLabel?: string;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const accept = (candidate: File | undefined) => {
    if (!candidate) return;

    if (!acceptedTypes.includes(candidate.type)) {
      toast.error(`¡Ops! Solo se admiten archivos ${typesLabel}.`);
      return;
    }

    if (candidate.size > maxBytes) {
      toast.error(
        `¡Ops! El archivo supera el máximo de ${formatSize(maxBytes)}.`,
      );
      return;
    }

    onChange(candidate);
  };

  return (
    <div
      onDragOver={(event) => {
        if (disabled) return;
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        if (!disabled) accept(event.dataTransfer.files?.[0]);
      }}
      className={cn(
        "flex items-center gap-2 rounded-xl border border-dashed p-2.5 transition-colors duration-200",
        dragging
          ? "border-primary bg-primary/6"
          : "border-slate-400/60 bg-background/40 hover:border-blue-400/40 dark:border-slate-600/60",
        disabled && "opacity-60",
        className,
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={acceptedTypes.join(",")}
        className="hidden"
        disabled={disabled}
        onChange={(event) => {
          accept(event.target.files?.[0]);
          // Se limpia siempre: elegir de nuevo el mismo archivo ya corregido
          // no dispararía el cambio.
          event.target.value = "";
        }}
      />

      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className="flex min-h-11 min-w-0 flex-1 items-center gap-3 rounded-lg px-1 text-left outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed"
      >
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors duration-200",
            file
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground",
          )}
        >
          <FileUp className="size-4" />
        </span>

        <span className="min-w-0 flex-1">
          <span
            className={cn(
              "block text-sm wrap-anywhere",
              file ? "font-medium" : "text-muted-foreground",
            )}
          >
            {file ? file.name : emptyLabel}
          </span>
          <span className="block text-[13px] text-muted-foreground">
            {file
              ? `${formatSize(file.size)} · pulse para cambiarlo`
              : `${typesLabel} · máximo ${formatSize(maxBytes)} · o arrástrelo aquí`}
          </span>
        </span>
      </button>

      {file && (
        <button
          type="button"
          disabled={disabled}
          aria-label="Quitar archivo"
          onClick={() => onChange(undefined)}
          className="flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed max-sm:size-10"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}
