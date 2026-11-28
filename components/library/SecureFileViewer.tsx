"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Loader2, ShieldCheck, Lock, Frown, RotateCcw } from "lucide-react";
import { SecurePdfViewer } from "@/components/library/SecurePdfViewer";
import { Button } from "@/components/ui/button";
import { useBlobUrlLoader } from "@/hooks/useBlobUrlLoader";

interface SecureFileViewerProps {
  isOpen: boolean;
  onClose: () => void;
  /** Título breve mostrado en el header del visor (p. ej. nombre del documento). */
  title?: string;
  /** Resuelve el archivo a mostrar como una Object URL de blob. */
  fetchBlobUrl: () => Promise<string>;
  /**
   * Renderiza el blob como imagen en vez de PDF. Necesario donde se aceptan
   * adjuntos jpg/png (documentación de artículos): el visor de PDF no los
   * puede montar.
   */
  isImage?: boolean;
  /**
   * Qué se está viendo. Si cambia con el visor abierto se vuelve a cargar;
   * sin él, "abierto" es la única identidad y el archivo se pide una vez.
   */
  signature?: string;
  /** Marcas del recorrido guiado de cada zona del visor. */
  tour?: { title?: string; close?: string; toolbar?: string; footer?: string };
}

const LOAD_ERROR =
  "No pudimos establecer una conexión segura para cargar este documento.";

/**
 * Visor seguro de documentos (fork genérico de components/library/SecureVisualizer,
 * desacoplado de libraryService): recibe cómo resolver el blob en vez de asumir
 * el endpoint de la Biblioteca, para poder reutilizarse en otros módulos.
 */
export default function SecureFileViewer({
  isOpen,
  onClose,
  title,
  fetchBlobUrl,
  isImage,
  signature = "open",
  tour,
}: SecureFileViewerProps) {
  const [currentTheme, setCurrentTheme] = useState<"light" | "dark">("dark");
  // La detección queda ligada a la URL que la produjo: al cambiar de archivo
  // deja de valer sin tener que reiniciarla desde un efecto.
  const [detected, setDetected] = useState<string | null>(null);

  const {
    url: fileUrl,
    loading,
    failed,
    retry,
  } = useBlobUrlLoader(fetchBlobUrl, isOpen ? signature : null);
  const error = failed ? LOAD_ERROR : null;

  useEffect(() => {
    if (!fileUrl || isImage) return;

    let cancelled = false;
    fetch(fileUrl)
      .then((res) => res.blob())
      .then((blob) => {
        if (!cancelled && blob.type.startsWith("image/")) {
          setDetected(fileUrl);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [fileUrl, isImage]);

  const showAsImage = isImage || (!!fileUrl && detected === fileUrl);

  useEffect(() => {
    const updateTheme = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setCurrentTheme(isDark ? "dark" : "light");
    };
    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  // Cuando el visor se abre desde dentro de un Dialog de Radix, ese Dialog
  // sigue montado: su overlay oscurece el visor por encima y su lock de scroll
  // impide desplazar el documento. Se neutraliza mientras dura el preview.
  useEffect(() => {
    if (!isOpen) return;

    const hidden = Array.from(
      document.querySelectorAll<HTMLElement>("[data-dialog-overlay]"),
    );

    hidden.forEach((el) => {
      el.style.display = "none";
    });

    // Radix reaplica su lock en el body mientras el diálogo sigue abierto, así
    // que aquí hace falta `important` para poder scrollear el documento.
    const previousOverflow = document.body.style.overflow;
    const previousPointerEvents = document.body.style.pointerEvents;
    document.body.style.setProperty("overflow", "auto", "important");
    document.body.style.setProperty("pointer-events", "auto", "important");

    return () => {
      hidden.forEach((el) => {
        el.style.display = "";
      });
      document.body.style.overflow = previousOverflow;
      document.body.style.pointerEvents = previousPointerEvents;
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isControl = e.ctrlKey || e.metaKey;
      const forbiddenKeys = ["s", "p", "u", "c"];
      if (isControl && forbiddenKeys.includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    };

    // En captura y frenando la propagación: si el visor está encima de un
    // diálogo, Escape cierra solo el visor y no también lo que tiene debajo.
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("keydown", handleEscape, true);
      window.addEventListener("copy", handleCopy);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keydown", handleEscape, true);
      window.removeEventListener("copy", handleCopy);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Al portal del body: montado dentro del layout, cualquier ancestro con
  // transform/filter convierte el `fixed` en relativo a ese ancestro y el
  // visor sale recortado por el sidebar/navbar en vez de cubrir la pantalla.
  return createPortal(
    // pointer-events-auto: si el visor se abre encima de un dialog modal de
    // Radix, este pone pointer-events:none en el body; sin re-activarlos aquí,
    // el visor queda visible pero inclickeable (no se puede cerrar).
    <div
      // El visor vive en el portal del body, fuera del DialogContent: sin
      // frenar la propagación, cada clic le llega al Dialog padre como "click
      // fuera" y lo cierra por debajo del visor.
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      className={`pointer-events-auto fixed inset-0 z-200 flex items-center justify-center p-0 sm:p-2 md:p-6 ${
        currentTheme === "dark" ? "bg-black/95" : "bg-slate-900/40"
      }`}
    >
      <div
        className={`relative flex h-full w-full max-w-7xl flex-col overflow-hidden border shadow-2xl max-sm:rounded-none sm:rounded-xl ${
          currentTheme === "dark"
            ? "bg-[#111214] border-gray-800"
            : "bg-white border-gray-300"
        }`}
      >
        {/* HEADER */}
        <div
          className={`flex items-center justify-between border-b px-4 py-3 max-sm:pt-[max(0.75rem,env(safe-area-inset-top))] ${currentTheme === "dark" ? "bg-[#1a1c1e] border-gray-800" : "bg-gray-50 border-gray-200"}`}
        >
          <div className="flex items-center gap-3" data-tour={tour?.title}>
            <div className="grid size-10 place-items-center rounded-xl bg-emerald-500/10">
              <ShieldCheck className="size-5 text-emerald-500" />
            </div>
            <div>
              <h3
                className={`text-sm font-semibold leading-tight ${currentTheme === "dark" ? "text-white" : "text-slate-900"}`}
              >
                {title ?? "Visualizador Seguro"}
              </h3>
              <p className="text-xs text-gray-500">Transmisión protegida</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar visor"
            data-tour={tour?.close}
            className="grid size-10 place-items-center rounded-xl text-gray-500 transition-colors hover:bg-red-500/10 hover:text-red-500"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* ÁREA DE CONTENIDO */}
        <div
          className="flex-1 overflow-hidden relative select-text"
          onContextMenu={(e) => e.preventDefault()}
        >
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-inherit z-10">
              <Loader2 className="size-8 animate-spin text-emerald-500" />
              <p className="mt-4 px-4 text-center text-sm text-gray-500">
                Estableciendo conexión segura...
              </p>
            </div>
          )}

          {error ? (
            <div className="flex h-full flex-col items-center justify-center bg-inherit p-8 text-center">
              <div className="mb-5 grid size-14 place-items-center rounded-2xl bg-amber-500/10">
                <Frown className="size-7 text-amber-500" />
              </div>
              <h2
                className={`mb-2 text-lg font-semibold ${currentTheme === "dark" ? "text-white" : "text-gray-900"}`}
              >
                No se pudo cargar el documento
              </h2>
              <p className="mb-8 max-w-md text-sm text-gray-500">{error}</p>

              <div className="flex w-full max-w-sm flex-col justify-center gap-3 sm:flex-row">
                <Button
                  type="button"
                  onClick={retry}
                  className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 sm:w-auto"
                >
                  <RotateCcw className="size-4" />
                  Reintentar
                </Button>
                <Button
                  type="button"
                  onClick={onClose}
                  variant="outline"
                  className="w-full border-gray-500 sm:w-auto"
                >
                  Cerrar visor
                </Button>
              </div>
            </div>
          ) : (
            fileUrl && (
              <div className="absolute inset-0">
                {showAsImage ? (
                  <div className="flex h-full w-full items-center justify-center overflow-auto p-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={fileUrl}
                      alt={title ?? "Documento"}
                      draggable={false}
                      className="max-h-full max-w-full object-contain select-none"
                    />
                  </div>
                ) : (
                  <SecurePdfViewer
                    fileUrl={fileUrl}
                    theme={currentTheme}
                    toolbarTour={tour?.toolbar}
                  />
                )}
              </div>
            )
          )}
        </div>

        {/* FOOTER */}
        <div
          data-tour={tour?.footer}
          className={`flex items-center justify-center border-t px-3 py-2.5 max-sm:pb-[max(0.625rem,env(safe-area-inset-bottom))] ${currentTheme === "dark" ? "bg-[#1a1c1e] border-gray-800" : "bg-gray-50 border-gray-200"}`}
        >
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Lock className="size-3" />© SIGEAC Digital Library - 2026
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
