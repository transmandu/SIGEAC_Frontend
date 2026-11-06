"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { cn } from "@/lib/utils";
import type { Quote } from "@/types/purchase";
import QuotePreviewPanel from "./QuotePreviewPanel";
import {
  NO_LAST_PREVIEW_MARK,
  resolvePreviewRowMark,
  useLastPreviewMark,
  type LastPreviewMark,
  type PreviewRowMark,
} from "./preview-row-mark";

const QuotePreviewContext = createContext<((quote: Quote) => void) | null>(
  null,
);

const QuotePreviewSelectedContext = createContext<number | null>(null);

const QuotePreviewLastContext =
  createContext<LastPreviewMark>(NO_LAST_PREVIEW_MARK);

const QuotePreviewSyncContext = createContext<((rows: Quote[]) => void) | null>(
  null,
);

export function useQuotePreview() {
  return useContext(QuotePreviewContext);
}

export function useQuotePreviewSelectedId() {
  return useContext(QuotePreviewSelectedContext);
}

/** Marca que la tabla pinta en cada fila; ver `PreviewRowMark`. */
export function useQuoteRowMark() {
  const openId = useContext(QuotePreviewSelectedContext);
  const last = useContext(QuotePreviewLastContext);

  return useCallback(
    (quote: Quote): PreviewRowMark | undefined =>
      resolvePreviewRowMark(quote.id, openId, last),
    [openId, last],
  );
}

/**
 * El panel guarda el documento que se eligió, y ese objeto queda viejo en
 * cuanto el listado se refresca (se avanzó el estado, se pagó, se editó). La
 * pantalla le pasa aquí sus filas vigentes para que el panel muestre siempre
 * lo mismo que la tabla.
 */
export function useQuotePreviewSync(rows: Quote[]) {
  const sync = useContext(QuotePreviewSyncContext);

  useEffect(() => {
    sync?.(rows);
  }, [rows, sync]);
}

interface QuoteSplitViewProps {
  children: React.ReactNode;
}

export default function QuoteSplitView({ children }: QuoteSplitViewProps) {
  const [selected, setSelected] = useState<Quote | null>(null);
  const { last, markOpened } = useLastPreviewMark(selected !== null);

  const onPreview = (quote: Quote) => {
    markOpened(quote.id);
    setSelected((prev) => (prev?.id === quote.id ? null : quote));
  };

  // Si la fila ya no está en la tabla (se eliminó, o los filtros o la página la
  // sacaron), el panel se cierra: no debe seguir mostrando algo que la tabla no.
  const sync = useCallback((rows: Quote[]) => {
    setSelected((prev) => {
      if (!prev) return prev;
      const fresh = rows.find((row) => row.id === prev.id);
      if (!fresh) return null;
      return fresh !== prev ? fresh : prev;
    });
  }, []);

  useEffect(() => {
    if (!selected) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selected]);

  return (
    <QuotePreviewContext.Provider value={onPreview}>
      <QuotePreviewSelectedContext.Provider value={selected?.id ?? null}>
        <QuotePreviewLastContext.Provider value={last}>
          <QuotePreviewSyncContext.Provider value={sync}>
            <div
              className={cn(
                "transition-[margin-right] duration-300 ease-in-out",
                selected && "lg:mr-105",
              )}
            >
              {children}
            </div>

            {/* En escritorio queda junto a la tabla, bajo los botones flotantes
                (z-30); por debajo de lg ocupa toda la pantalla, como el resto de
                paneles laterales del sistema, y se cierra con la X. */}
            {selected && (
              <div
                className="
                  fixed inset-y-0 right-0 z-45 lg:z-30
                  flex w-full flex-col
                  border-l bg-background lg:w-105
                  shadow-[0_0_40px_rgba(0,0,0,0.12)]
                  animate-in slide-in-from-right duration-300 ease-in-out
                "
              >
                <QuotePreviewPanel
                  key={selected.id}
                  quote={selected}
                  onClose={() => setSelected(null)}
                />
              </div>
            )}
          </QuotePreviewSyncContext.Provider>
        </QuotePreviewLastContext.Provider>
      </QuotePreviewSelectedContext.Provider>
    </QuotePreviewContext.Provider>
  );
}
