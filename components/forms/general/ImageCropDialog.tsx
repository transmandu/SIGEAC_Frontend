"use client";

import { useEffect, useRef, useState } from "react";
import { Crop, Loader2, Minus, Plus, RotateCcw } from "lucide-react";

import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useObjectUrl } from "@/hooks/useObjectUrl";

/** Lado del recuadro de recorte en pantalla (px CSS). */
const VIEW = 288;
/** Lado máximo de la imagen que se guarda. */
const OUTPUT_MAX = 800;
const OUTPUT_MIN = 200;
const MAX_ZOOM = 4;
const KEY_STEP = 12;

interface Natural {
  width: number;
  height: number;
}

interface Point {
  x: number;
  y: number;
}

const between = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/**
 * Recorte de una foto de perfil a cuadrado. Se arrastra para encuadrar, se
 * acerca con el control, la rueda, el pellizco o el teclado, y al aplicar entrega
 * un archivo WebP cuadrado (hasta 800 px) que todas las pantallas del sistema
 * reducen igual: avatar de la tabla, barra de usuario, formularios y carnet.
 * El círculo marca cómo se ve el avatar; lo que queda fuera se descarta.
 */
export function ImageCropDialog({
  file,
  onCancel,
  onConfirm,
}: {
  file: File;
  onCancel: () => void;
  onConfirm: (cropped: File) => void;
}) {
  const url = useObjectUrl(file);
  const imageRef = useRef<HTMLImageElement>(null);
  const viewRef = useRef<HTMLDivElement>(null);
  const pointers = useRef(new Map<number, Point>());
  const lastPinch = useRef<number | null>(null);

  const [natural, setNatural] = useState<Natural | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);

  // Con zoom 1 la imagen cubre justo el recuadro por su lado menor.
  const base = natural ? VIEW / Math.min(natural.width, natural.height) : 1;

  const clampOffset = (point: Point, nextZoom: number): Point => {
    if (!natural) return point;
    const scale = base * nextZoom;
    const maxX = Math.max(0, (natural.width * scale - VIEW) / 2);
    const maxY = Math.max(0, (natural.height * scale - VIEW) / 2);

    return {
      x: between(point.x, -maxX, maxX),
      y: between(point.y, -maxY, maxY),
    };
  };

  const applyZoom = (next: number) => {
    const clamped = between(next, 1, MAX_ZOOM);
    setOffset((current) =>
      clampOffset(
        { x: (current.x * clamped) / zoom, y: (current.y * clamped) / zoom },
        clamped,
      ),
    );
    setZoom(clamped);
  };

  // La rueda necesita preventDefault para no desplazar el diálogo, y React la
  // registra como pasiva: se engancha a mano.
  const wheelHandler = useRef<(event: WheelEvent) => void>(() => {});
  useEffect(() => {
    wheelHandler.current = (event) => {
      event.preventDefault();
      applyZoom(zoom * Math.exp(-event.deltaY * 0.0015));
    };
  });

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    const listener = (event: WheelEvent) => wheelHandler.current(event);
    view.addEventListener("wheel", listener, { passive: false });
    return () => view.removeEventListener("wheel", listener);
  }, [natural]);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });
    lastPinch.current = null;
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const previous = pointers.current.get(event.pointerId);
    if (!previous) return;

    const current = { x: event.clientX, y: event.clientY };
    pointers.current.set(event.pointerId, current);

    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);

      if (lastPinch.current) applyZoom((zoom * distance) / lastPinch.current);
      lastPinch.current = distance;
      return;
    }

    setOffset((value) =>
      clampOffset(
        {
          x: value.x + current.x - previous.x,
          y: value.y + current.y - previous.y,
        },
        zoom,
      ),
    );
  };

  const onPointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    pointers.current.delete(event.pointerId);
    lastPinch.current = null;
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const moves: Record<string, Point> = {
      ArrowLeft: { x: KEY_STEP, y: 0 },
      ArrowRight: { x: -KEY_STEP, y: 0 },
      ArrowUp: { x: 0, y: KEY_STEP },
      ArrowDown: { x: 0, y: -KEY_STEP },
    };
    const move = moves[event.key];

    if (move) {
      event.preventDefault();
      setOffset((value) =>
        clampOffset({ x: value.x + move.x, y: value.y + move.y }, zoom),
      );
    } else if (event.key === "+" || event.key === "=") {
      event.preventDefault();
      applyZoom(zoom * 1.15);
    } else if (event.key === "-") {
      event.preventDefault();
      applyZoom(zoom / 1.15);
    }
  };

  const reset = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const apply = () => {
    const image = imageRef.current;
    if (!image || !natural) return;

    setSaving(true);

    const scale = base * zoom;
    const side = VIEW / scale;
    const sx = natural.width / 2 - (VIEW / 2 + offset.x) / scale;
    const sy = natural.height / 2 - (VIEW / 2 + offset.y) / scale;
    const output = between(Math.round(side), OUTPUT_MIN, OUTPUT_MAX);

    const canvas = document.createElement("canvas");
    canvas.width = output;
    canvas.height = output;

    const context = canvas.getContext("2d");
    if (!context) {
      setSaving(false);
      setFailed(true);
      return;
    }

    // Un PNG con transparencia no debe quedar negro al comprimirse.
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, output, output);
    context.imageSmoothingQuality = "high";
    context.drawImage(image, sx, sy, side, side, 0, 0, output, output);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setSaving(false);
          setFailed(true);
          return;
        }

        onConfirm(new File([blob], "foto.webp", { type: "image/webp" }));
      },
      "image/webp",
      0.9,
    );
  };

  const scale = base * zoom;
  const ready = !!natural && !!url;

  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <FormDialogContent
        icon={Crop}
        title="Ajustar la foto"
        description="Arrastre para encuadrar y acerque hasta que el rostro quede dentro del círculo."
        className="sm:max-w-md"
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={apply}
              disabled={!ready || saving}
              className="min-w-32"
            >
              {saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Usar esta foto"
              )}
            </Button>
          </>
        }
      >
        <div className="flex flex-col items-center gap-5">
          <div
            ref={viewRef}
            role="group"
            tabIndex={0}
            aria-label="Encuadre de la foto. Flechas para mover, más y menos para acercar."
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerEnd}
            onPointerCancel={onPointerEnd}
            onKeyDown={onKeyDown}
            style={{ width: VIEW, height: VIEW }}
            className="relative max-w-full shrink-0 cursor-grab touch-none overflow-hidden rounded-xl bg-slate-900 outline-hidden select-none focus-visible:ring-2 focus-visible:ring-primary/50 active:cursor-grabbing"
          >
            {url && (
              // eslint-disable-next-line @next/next/no-img-element -- vista previa local del archivo elegido
              <img
                ref={imageRef}
                src={url}
                alt=""
                draggable={false}
                onLoad={(event) =>
                  setNatural({
                    width: event.currentTarget.naturalWidth,
                    height: event.currentTarget.naturalHeight,
                  })
                }
                onError={() => setFailed(true)}
                style={
                  natural
                    ? {
                        width: natural.width * scale,
                        height: natural.height * scale,
                        left: VIEW / 2 - (natural.width * scale) / 2 + offset.x,
                        top: VIEW / 2 - (natural.height * scale) / 2 + offset.y,
                      }
                    : { opacity: 0 }
                }
                className="pointer-events-none absolute max-w-none"
              />
            )}

            {!ready && !failed && (
              <div className="absolute inset-0 grid place-items-center text-white/70">
                <Loader2 className="size-6 animate-spin" />
              </div>
            )}

            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-full shadow-[0_0_0_999px_rgb(0_0_0/0.55)] ring-2 ring-white/80"
            />
          </div>

          <div className="flex w-full max-w-72 items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Alejar"
              disabled={!ready || zoom <= 1}
              onClick={() => applyZoom(zoom / 1.25)}
              className="size-9 shrink-0"
            >
              <Minus className="size-4" />
            </Button>

            <input
              type="range"
              min={1}
              max={MAX_ZOOM}
              step={0.01}
              value={zoom}
              disabled={!ready}
              aria-label="Acercamiento"
              onChange={(event) => applyZoom(Number(event.target.value))}
              className="h-9 min-w-0 flex-1 cursor-pointer accent-primary"
            />

            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Acercar"
              disabled={!ready || zoom >= MAX_ZOOM}
              onClick={() => applyZoom(zoom * 1.25)}
              className="size-9 shrink-0"
            >
              <Plus className="size-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Restablecer el encuadre"
              disabled={
                !ready || (zoom === 1 && offset.x === 0 && offset.y === 0)
              }
              onClick={reset}
              className="size-9 shrink-0"
            >
              <RotateCcw className="size-4" />
            </Button>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            {failed
              ? "No se pudo leer la imagen. Pruebe con otra foto."
              : "Se guarda como un cuadrado; el círculo es como se verá en el sistema."}
          </p>
        </div>
      </FormDialogContent>
    </Dialog>
  );
}
