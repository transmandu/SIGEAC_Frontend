import { create } from "zustand";

/**
 * Lo que un aviso de error entrega al formulario de reportes: qué falló y el
 * código que une el reporte con el log del servidor.
 */
export interface ErrorReportDraft {
  /** Texto con que arranca la descripción; el usuario lo completa. */
  description: string;
  /** Título del aviso que vio el usuario, para mostrarlo como contexto. */
  errorTitle: string;
  errorReference?: string;
  errorCode?: string;
  httpStatus?: number;
  /** Ruta y query de la pantalla donde ocurrió, sin el dominio. */
  pageUrl?: string;
  /** Módulo deducido de la ruta; el usuario puede cambiarlo. */
  module?: string;
}

interface ErrorReportDraftState {
  /**
   * Solo hay a quién reportar con la sesión iniciada. Lo fija quien monta el
   * diálogo (ErrorReportDraftHost) y lo lee `notifyError`, que vive fuera de
   * React y no puede preguntarle al contexto de autenticación.
   */
  canReport: boolean;
  open: boolean;
  draft: ErrorReportDraft | null;

  setCanReport: (canReport: boolean) => void;
  openDraft: (draft: ErrorReportDraft) => void;
  closeDraft: () => void;
}

export const useErrorReportDraftStore = create<ErrorReportDraftState>()(
  (set) => ({
    canReport: false,
    open: false,
    draft: null,

    setCanReport: (canReport) => set({ canReport }),
    openDraft: (draft) => set({ draft, open: true }),
    // El borrador se conserva: el diálogo se anima al cerrar y vaciarlo antes
    // lo dejaba en blanco durante la salida.
    closeDraft: () => set({ open: false }),
  }),
);
