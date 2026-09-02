"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Loader2, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export interface EvidenceImage {
  id: number;
  url: string | null;
}

interface EvidenceGalleryProps {
  images: EvidenceImage[];
  title?: string;
  /** Lado de la miniatura en px. */
  size?: number;
  /** Habilita quitar una foto. Sin esto la galería es de solo lectura. */
  onDelete?: (id: number) => void;
  isDeleting?: boolean;
}

/**
 * Miniaturas de evidencia que abren un carrusel a tamaño completo.
 *
 * No renderiza nada si no hay imágenes: la evidencia es opcional y un hueco
 * vacío en cada artículo sin fotos solo ensuciaría el resumen.
 */
export function EvidenceGallery({
  images,
  title = "Evidencia",
  size = 48,
  onDelete,
  isDeleting = false,
}: EvidenceGalleryProps) {
  const usable = images.filter((image) => !!image.url);

  const [openAt, setOpenAt] = useState<number | null>(null);

  const move = useCallback(
    (delta: number) =>
      setOpenAt((current) =>
        current === null
          ? null
          : // Se envuelve por los dos extremos: llegar al final y no poder
            // seguir obliga a cerrar y reabrir para ver la primera.
            (current + delta + usable.length) % usable.length
      ),
    [usable.length]
  );

  useEffect(() => {
    if (openAt === null) return;

    const onKey = (event: KeyboardEvent) => {
      // Un campo enfocado se queda con las flechas: mover el cursor dentro de
      // un input no debe pasar a la foto siguiente.
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;

      if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable) {
        return;
      }

      if (event.key === "ArrowRight") move(1);
      if (event.key === "ArrowLeft") move(-1);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openAt, move]);

  if (usable.length === 0) return null;

  // `?? null` y no `usable[openAt]` a secas: si la lista se acorta con el
  // visor abierto, el índice guardado apuntaría fuera del array.
  const current = openAt !== null ? (usable[openAt] ?? null) : null;

  return (
    <>
      <div className="flex flex-wrap gap-1.5">
        {usable.map((image, index) => (
          <button
            key={image.id}
            type="button"
            onClick={() => setOpenAt(index)}
            style={{ width: size, height: size }}
            className="overflow-hidden rounded-md border transition-opacity hover:opacity-80"
            aria-label={`Ver ${title.toLowerCase()} ${index + 1}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- ruta servida por storage, fuera del optimizador */}
            <img
              src={image.url!}
              alt={`${title} ${index + 1}`}
              className="size-full object-cover"
              loading="lazy"
            />
          </button>
        ))}
      </div>

      <Dialog
        open={openAt !== null}
        onOpenChange={(next) => !next && setOpenAt(null)}
      >
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {title}
              {usable.length > 1 && openAt !== null
                ? ` · ${openAt + 1} de ${usable.length}`
                : ""}
            </DialogTitle>
          </DialogHeader>

          <div className="relative flex items-center justify-center overflow-hidden rounded-lg border bg-muted">
            {/* Dentro del visor y no en la miniatura: se borra tras ver la foto
                completa, no de un clic al pasar por encima. */}
            {onDelete && current && (
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="absolute right-2 top-2 z-10 rounded-full opacity-90"
                disabled={isDeleting}
                onClick={() => {
                  onDelete(current.id);
                  setOpenAt(null);
                }}
                aria-label="Eliminar esta evidencia"
              >
                {isDeleting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Trash2 className="size-4 text-destructive" />
                )}
              </Button>
            )}

            {current?.url && (
              /* eslint-disable-next-line @next/next/no-img-element -- ruta servida por storage */
              <img
                src={current.url}
                alt={title}
                className="max-h-[70vh] w-full object-contain"
              />
            )}

            {usable.length > 1 && (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="absolute left-2 rounded-full opacity-90"
                  onClick={() => move(-1)}
                  aria-label="Anterior"
                >
                  <ChevronLeft className="size-5" />
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="absolute right-2 rounded-full opacity-90"
                  onClick={() => move(1)}
                  aria-label="Siguiente"
                >
                  <ChevronRight className="size-5" />
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default EvidenceGallery;
