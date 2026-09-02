"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCameraCapture } from "@/hooks/useCameraCapture";
import {
  AlertTriangle,
  Camera,
  ImagePlus,
  Loader2,
  RefreshCw,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface EvidenceCaptureProps {
  files: File[];
  onChange: (files: File[]) => void;
  max?: number;
  /** Qué se está fotografiando; se muestra en el diálogo de la cámara. */
  label?: string;
}

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 8 * 1024 * 1024;

/**
 * Adjunta fotos de respaldo, desde archivo o desde la cámara del equipo.
 *
 * Las miniaturas usan object URLs que se revocan al cambiar la lista: sin eso
 * cada foto queda retenida en memoria hasta recargar la página.
 */
export function EvidenceCapture({
  files,
  onChange,
  max = 6,
  label,
}: EvidenceCaptureProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [openCamera, setOpenCamera] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);

  const camera = useCameraCapture();

  // Los llamadores pasan `files={mapa[clave] ?? []}`, y ese `?? []` crea un
  // array nuevo en cada render: dependiendo de la referencia, el efecto se
  // dispararía en bucle creando y revocando URLs que la vista está usando.
  // La identidad de los File sí es estable, así que se compara por ellos.
  const filesKey = files.map((file) => `${file.name}:${file.size}:${file.lastModified}`).join("|");

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviews(urls);

    return () => urls.forEach((url) => URL.revokeObjectURL(url));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- filesKey identifica el contenido; `files` cambia de referencia en cada render
  }, [filesKey]);

  const remaining = max - files.length;

  const addFiles = useCallback(
    (incoming: File[]) => {
      const valid: File[] = [];

      for (const file of incoming) {
        if (!ACCEPTED.includes(file.type)) {
          toast.error("Formato no admitido", {
            description: `${file.name}: solo se aceptan JPG, PNG o WEBP.`,
          });
          continue;
        }

        if (file.size > MAX_BYTES) {
          toast.error("Imagen muy pesada", {
            description: `${file.name} supera los 8 MB.`,
          });
          continue;
        }

        valid.push(file);
      }

      if (valid.length === 0) return;

      const accepted = valid.slice(0, remaining);

      if (accepted.length < valid.length) {
        toast.warning("Límite alcanzado", {
          description: `Solo se admiten ${max} imágenes por artículo.`,
        });
      }

      onChange([...files, ...accepted]);
    },
    [files, max, onChange, remaining]
  );

  const removeAt = (index: number) =>
    onChange(files.filter((_, position) => position !== index));

  const handleCapture = async () => {
    const file = await camera.capture();

    if (!file) {
      toast.error("No se pudo tomar la foto", {
        description: "Espere a que la imagen aparezca y vuelva a intentarlo.",
      });
      return;
    }

    addFiles([file]);

    // Se cierra tras capturar: quien necesite otra vuelve a abrir, y así la
    // cámara no queda encendida sin que nadie la mire.
    if (remaining <= 1) {
      setOpenCamera(false);
    }
  };

  const closeCamera = (next: boolean) => {
    if (!next) camera.stop();
    setOpenCamera(next);
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(",")}
        multiple
        className="hidden"
        onChange={(event) => {
          addFiles(Array.from(event.target.files ?? []));
          // Permite volver a elegir el mismo archivo tras quitarlo.
          event.target.value = "";
        }}
      />

      <div className="flex items-center gap-2">
        {remaining > 0 && (
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  {/* Mismo lenguaje que los demás botones de la fila (h-7,
                      outline): el fondo sale de `background`, así que el modo
                      oscuro lo hereda sin fijar un blanco literal. */}
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-7 shrink-0 bg-background"
                  >
                    <Camera className="size-3.5 text-muted-foreground" />
                    <span className="sr-only">Adjuntar evidencia</span>
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>
                {files.length > 0 ? "Añadir otra evidencia" : "Adjuntar evidencia"}
              </TooltipContent>
            </Tooltip>

            <DropdownMenuContent align="start" className="w-52">
              <DropdownMenuItem
                className="cursor-pointer gap-2"
                onSelect={() => inputRef.current?.click()}
              >
                <ImagePlus className="size-4 text-muted-foreground" />
                Subir desde el equipo
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer gap-2"
                onSelect={() => {
                  setOpenCamera(true);
                  camera.start();
                }}
              >
                <Camera className="size-4 text-muted-foreground" />
                Tomar con la cámara
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Carrusel: una tira que se desplaza en lugar de crecer hacia abajo,
            para que la fila del artículo no cambie de alto al adjuntar. */}
        {previews.length > 0 && (
          <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto">
            {previews.map((url, index) => (
              <div
                key={url}
                className="group relative size-7 shrink-0 overflow-hidden rounded-md border bg-muted"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- object URL local, no pasa por el optimizador */}
                <img
                  src={url}
                  alt={`Evidencia ${index + 1}`}
                  className="size-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeAt(index)}
                  aria-label={`Quitar evidencia ${index + 1}`}
                  className="absolute inset-0 flex items-center justify-center bg-background/70 opacity-0 backdrop-blur-[1px] transition-opacity group-hover:opacity-100 focus:opacity-100"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

      </div>

      <Dialog open={openCamera} onOpenChange={closeCamera}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Tomar evidencia</DialogTitle>
            <DialogDescription>
              {label
                ? `Fotografía de ${label}.`
                : "Capture la condición del artículo."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="relative aspect-video overflow-hidden rounded-lg border bg-muted">
              <video
                ref={camera.videoRef}
                playsInline
                muted
                className="size-full object-cover"
              />

              {camera.isStarting && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                  <Loader2 className="size-8 animate-spin text-muted-foreground" />
                </div>
              )}

              {camera.error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/90 px-6 text-center">
                  <AlertTriangle className="size-6 text-amber-500" />
                  <p className="text-sm text-muted-foreground">{camera.error}</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => camera.start(camera.deviceId ?? undefined)}
                  >
                    <RefreshCw className="mr-2 size-4" />
                    Reintentar
                  </Button>
                </div>
              )}
            </div>

            {camera.devices.length > 1 && (
              <Select
                value={camera.deviceId ?? undefined}
                onValueChange={(value) => camera.start(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione una cámara" />
                </SelectTrigger>
                <SelectContent>
                  {camera.devices.map((device) => (
                    <SelectItem key={device.deviceId} value={device.deviceId}>
                      {device.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => closeCamera(false)}
            >
              Cerrar
            </Button>
            {camera.isActive && (
              <Button type="button" onClick={handleCapture}>
                <Camera className="mr-2 size-4" />
                Capturar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default EvidenceCapture;
