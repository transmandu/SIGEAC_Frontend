"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { cn } from "@/lib/utils";
import type { Requisition } from "@/types/purchase";
import RequisitionPreviewPanel from "./RequisitionPreviewPanel";
import {
  NO_LAST_PREVIEW_MARK,
  resolvePreviewRowMark,
  useLastPreviewMark,
  type LastPreviewMark,
  type PreviewRowMark,
} from "./preview-row-mark";

const RequisitionPreviewContext = createContext<
  ((requisition: Requisition) => void) | null
>(null);

const RequisitionPreviewSelectedContext = createContext<number | null>(null);

const RequisitionPreviewLastContext =
  createContext<LastPreviewMark>(NO_LAST_PREVIEW_MARK);

const RequisitionPreviewSyncContext = createContext<
  ((rows: Requisition[]) => void) | null
>(null);

export function useRequisitionPreview() {
  return useContext(RequisitionPreviewContext);
}

export function useRequisitionPreviewSelectedId() {
  return useContext(RequisitionPreviewSelectedContext);
}

/** Marca que la tabla pinta en cada fila; ver `PreviewRowMark`. */
export function useRequisitionRowMark() {
  const openId = useContext(RequisitionPreviewSelectedContext);
  const last = useContext(RequisitionPreviewLastContext);

  return useCallback(
    (requisition: Requisition): PreviewRowMark | undefined =>
      resolvePreviewRowMark(requisition.id, openId, last),
    [openId, last],
  );
}

/**
 * El panel guarda el documento que se eligió, y ese objeto queda viejo en
 * cuanto el listado se refresca (se avanzó el estado, se pagó, se editó). La
 * pantalla le pasa aquí sus filas vigentes para que el panel muestre siempre
 * lo mismo que la tabla.
 */
export function useRequisitionPreviewSync(rows: Requisition[]) {
  const sync = useContext(RequisitionPreviewSyncContext);

  useEffect(() => {
    sync?.(rows);
  }, [rows, sync]);
}

interface RequisitionSplitViewProps {
  children: React.ReactNode;
}

export default function RequisitionSplitView({
  children,
}: RequisitionSplitViewProps) {
  const [selected, setSelected] = useState<Requisition | null>(null);
  const { last, markOpened } = useLastPreviewMark(selected !== null);

  const onPreview = (requisition: Requisition) => {
    markOpened(requisition.id);
    setSelected((prev) => (prev?.id === requisition.id ? null : requisition));
  };

  // Si la fila ya no está en la tabla (se eliminó, o los filtros o la página la
  // sacaron), el panel se cierra: no debe seguir mostrando algo que la tabla no.
  const sync = useCallback((rows: Requisition[]) => {
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
    <RequisitionPreviewContext.Provider value={onPreview}>
      <RequisitionPreviewSelectedContext.Provider value={selected?.id ?? null}>
        <RequisitionPreviewLastContext.Provider value={last}>
          <RequisitionPreviewSyncContext.Provider value={sync}>
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
                <RequisitionPreviewPanel
                  key={selected.id}
                  requisition={selected}
                  onClose={() => setSelected(null)}
                />
              </div>
            )}
          </RequisitionPreviewSyncContext.Provider>
        </RequisitionPreviewLastContext.Provider>
      </RequisitionPreviewSelectedContext.Provider>
    </RequisitionPreviewContext.Provider>
  );
}
