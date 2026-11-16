"use client";

import { useRef, useState } from "react";
import { Camera, Crop, Trash2, Upload } from "lucide-react";

import { fieldClass } from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import { Button } from "@/components/ui/button";
import { useObjectUrl } from "@/hooks/useObjectUrl";
import { cn } from "@/lib/utils";
import { ImageCropDialog } from "./ImageCropDialog";

// El original puede pesar más que lo que se guarda: se recorta y recomprime
// aquí a un cuadrado de pocos cientos de KB, muy por debajo del tope del servidor.
const MAX_SOURCE_SIZE = 20 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

/**
 * Foto del empleado: un círculo que se pulsa para elegir archivo, con los
 * botones de cambiar y quitar debajo. La imagen elegida pasa por el recorte a
 * cuadrado (`ImageCropDialog`): el sistema guarda siempre la misma medida y
 * todas las pantallas la muestran igual. Valida tipo y tamaño aquí porque el
 * servidor rechazaba el archivo recién al guardar, sin decir el motivo.
 *
 * Con `existingUrl` (edición) muestra la foto guardada; "Quitar" la marca para
 * eliminarla al guardar, y elegir otra archivo la reemplaza.
 */
export function EmployeePhotoField({
  file,
  onFileChange,
  existingUrl,
  removed,
  onRemovedChange,
  initials,
  disabled,
}: {
  file?: File;
  onFileChange: (file?: File) => void;
  existingUrl?: string | null;
  removed?: boolean;
  onRemovedChange?: (removed: boolean) => void;
  initials: string;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  // Archivo en el recorte, y el original elegido para poder reencuadrar.
  const [cropping, setCropping] = useState<File | null>(null);
  const [original, setOriginal] = useState<File | null>(null);
  const preview = useObjectUrl(file);

  const shown = preview ?? (removed ? null : (existingUrl ?? null));
  const canRemove = !!file || (!!existingUrl && !removed);

  const choose = (picked?: File) => {
    if (!picked) return;

    if (!ACCEPTED.includes(picked.type)) {
      setError("La foto debe ser JPG, PNG o WebP.");
      return;
    }

    if (picked.size > MAX_SOURCE_SIZE) {
      setError("La foto no puede pesar más de 20 MB.");
      return;
    }

    setError(null);
    setCropping(picked);
  };

  const confirmCrop = (cropped: File) => {
    setOriginal(cropping);
    setCropping(null);
    onRemovedChange?.(false);
    onFileChange(cropped);
  };

  const remove = () => {
    const discardingNewPhoto = !!file;

    setError(null);
    onFileChange(undefined);
    setOriginal(null);
    if (inputRef.current) inputRef.current.value = "";
    // Con una foto nueva elegida, "Quitar" solo la descarta y vuelve la guardada;
    // sin ella, la guardada queda marcada para eliminarse al guardar.
    if (!discardingNewPhoto && existingUrl) onRemovedChange?.(true);
  };

  return (
    <div className="flex flex-col items-center gap-2.5 max-md:pb-1">
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        aria-label={shown ? "Cambiar la foto" : "Agregar una foto"}
        className={cn(
          "group relative flex size-28 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-slate-300 bg-muted/40 text-lg font-semibold text-muted-foreground transition-colors hover:border-blue-400/60 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-hidden dark:border-slate-600",
          shown && "border-solid border-slate-200 dark:border-slate-700",
        )}
      >
        {shown ? (
          // eslint-disable-next-line @next/next/no-img-element -- vista previa local o URL firmada del servidor
          <img src={shown} alt="" className="size-full object-cover" />
        ) : (
          <span aria-hidden="true">
            {initials || <Camera className="size-6" />}
          </span>
        )}

        <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          <Camera className="size-5" />
        </span>
      </button>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className={cn(fieldClass, "px-4 font-medium")}
        >
          <Upload className="mr-2 size-4" />
          {shown ? "Cambiar" : "Subir foto"}
        </Button>

        {original && file && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={disabled}
            onClick={() => setCropping(original)}
            aria-label="Reencuadrar la foto"
            className={cn(fieldClass, "w-10 shrink-0")}
          >
            <Crop className="size-4" />
          </Button>
        )}

        {canRemove && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={disabled}
            onClick={remove}
            aria-label="Quitar la foto"
            className={cn(
              fieldClass,
              "w-10 shrink-0 text-destructive hover:border-destructive/40 hover:text-destructive",
            )}
          >
            <Trash2 className="size-4" />
          </Button>
        )}
      </div>

      <p className="max-w-40 text-center text-xs text-muted-foreground">
        {error ? (
          <span className="text-destructive">{error}</span>
        ) : removed && existingUrl ? (
          "Se quitará al guardar."
        ) : (
          "JPG, PNG o WebP · se ajusta a un cuadrado"
        )}
      </p>

      {cropping && (
        <ImageCropDialog
          file={cropping}
          onCancel={() => setCropping(null)}
          onConfirm={confirmCrop}
        />
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => {
          choose(event.target.files?.[0]);
          // Para poder volver a elegir el mismo archivo tras quitarlo.
          event.target.value = "";
        }}
      />
    </div>
  );
}
