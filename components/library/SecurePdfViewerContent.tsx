"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Loader2, Maximize, ZoomIn, ZoomOut } from "lucide-react";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// El worker sale del paquete instalado. Antes los tres visores lo bajaban de
// unpkg, así que el visor "seguro" dependía de un tercero en tiempo de
// ejecución y quedaba pegado a una versión escrita a mano en la URL.
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

const MIN_SCALE = 0.5;
const MAX_SCALE = 3;
const STEP = 0.25;

export type SecurePdfViewerProps = {
  fileUrl: string;
  theme: "light" | "dark";
  /** Marca de recorrido guiado para la barra de herramientas. */
  toolbarTour?: string;
};

/**
 * Visor de PDF de la biblioteca: desplazamiento continuo, zoom, número de
 * página y pantalla completa.
 *
 * Reemplaza a @react-pdf-viewer, que quedó sin mantenimiento fijado a pdfjs 3
 * y con una vulnerabilidad sin parche. La barra reproduce la que tenían los
 * tres visores, que era idéntica en los tres.
 */
export function SecurePdfViewerContent({
  fileUrl,
  theme,
  toolbarTour,
}: SecurePdfViewerProps) {
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1);
  const [width, setWidth] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

  // El ancho de la página se mide del contenedor: `scale` solo no alcanza
  // porque el PDF debe entrar a lo ancho antes de cualquier acercamiento. Se
  // mide de entrada y en cada resize; ResizeObserver solo afina los cambios
  // que no pasan por la ventana (un panel que se abre al costado).
  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    const measure = () => setWidth(element.clientWidth);
    measure();

    window.addEventListener("resize", measure);

    const observer =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    observer?.observe(element);

    return () => {
      window.removeEventListener("resize", measure);
      observer?.disconnect();
    };
  }, []);

  // La página visible es la que cruza el centro del área de lectura. Se mide
  // con rectángulos y no con offsetTop, que es relativo al primer ancestro
  // posicionado y no tiene por qué ser este contenedor.
  const handleScroll = useCallback(() => {
    const element = scrollRef.current;
    if (!element) return;

    const middle = element.getBoundingClientRect().top + element.clientHeight / 2;
    let visible = 1;

    pageRefs.current.forEach((page, index) => {
      if (page && page.getBoundingClientRect().top <= middle) visible = index + 1;
    });

    setCurrentPage(visible);
  }, []);

  const goToPage = (page: number) => {
    const target = pageRefs.current[page - 1];
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const isDark = theme === "dark";

  return (
    <div ref={containerRef} className="secure-pdf-viewer flex h-full flex-col">
      <div
        data-tour={toolbarTour}
        className={`flex items-center justify-between border-b px-4 py-2 ${
          isDark
            ? "border-gray-800 bg-[#1a1c1e]"
            : "border-gray-200 bg-gray-50"
        }`}
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Alejar"
            onClick={() => setScale((s) => Math.max(MIN_SCALE, s - STEP))}
            className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-accent hover:text-foreground"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="w-12 text-center text-xs font-bold text-gray-500">
            {Math.round(scale * 100)}%
          </span>
          <button
            type="button"
            aria-label="Acercar"
            onClick={() => setScale((s) => Math.min(MAX_SCALE, s + STEP))}
            className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-accent hover:text-foreground"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
          <input
            aria-label="Página actual"
            value={currentPage}
            onChange={(event) => {
              const page = Number(event.target.value);
              if (!Number.isNaN(page) && page >= 1 && page <= numPages) {
                setCurrentPage(page);
                goToPage(page);
              }
            }}
            className={`w-10 rounded border bg-transparent px-1 py-0.5 text-center ${
              isDark ? "border-gray-700" : "border-gray-300"
            }`}
          />
          / <span data-test="total-paginas">{numPages}</span>
        </div>

        <button
          type="button"
          aria-label="Pantalla completa"
          onClick={() => containerRef.current?.requestFullscreen?.()}
          className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-accent hover:text-foreground"
        >
          <Maximize className="h-4 w-4" />
        </button>
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className={`flex-1 overflow-auto ${isDark ? "bg-[#0b0c0d]" : "bg-gray-100"}`}
      >
        <Document
          file={fileUrl}
          onLoadSuccess={({ numPages: total }) => {
            setNumPages(total);
            pageRefs.current = Array.from({ length: total }, () => null);
          }}
          loading={
            <div className="flex h-full items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            </div>
          }
          error={
            <p className="py-16 text-center text-sm text-gray-500">
              No se pudo leer el documento.
            </p>
          }
          className="flex flex-col items-center gap-4 py-4"
        >
          {Array.from({ length: numPages }, (_, index) => (
            <div
              key={index}
              ref={(node) => {
                pageRefs.current[index] = node;
              }}
              data-test="pagina-pdf"
            >
              {/* react-pdf multiplica el ancho por `scale`, así que el zoom
                  sigue funcionando mientras no haya medida del contenedor. */}
              <Page
                pageNumber={index + 1}
                width={width ? Math.max(width - 32, 120) : undefined}
                scale={scale}
                className="shadow-lg"
              />
            </div>
          ))}
        </Document>
      </div>
    </div>
  );
}
