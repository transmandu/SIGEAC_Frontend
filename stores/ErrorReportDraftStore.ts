import { create } from "zustand";

/**
 * Lo que un aviso de error entrega al formulario de reportes: qué falló y el
 * código que une el reporte con el log del servidor.
 */
/**
 * Lo técnico que el aviso sabía y el usuario no tiene por qué dictar. Viaja con
 * el reporte para quien lo atiende; el usuario nunca lo ve ni lo edita.
 */
export interface ErrorReportContext {
  title?: string;
  /** El texto que se le mostró al usuario. */
  message?: string;
  /** Pista del servidor: modelo, columna o ruta. */
  hint?: string;
  kind?: string;
  /** Petición que falló: "POST /api/…". */
  request?: string;
  userAgent?: string;
  viewport?: string;
  language?: string;
  online?: boolean;
}

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
  context?: ErrorReportContext;
}

interface ErrorReportDraftState {
  /**
   * Solo hay a quién reportar con la sesión iniciada. Lo fija quien monta el
   * diálogo (ErrorReportDraftHost) y lo lee `notifyError`, que vive fuera de
   * React y no puede preguntarle al contexto de autenticación.
   */
  canReport: boolean;
  /**
   * Los detalles técnicos del aviso (ruta, modelo, columna) solo son para quien
   * administra el sistema. Lo fija el mismo componente que `canReport`.
   */
  isSuperUser: boolean;
  open: boolean;
  draft: ErrorReportDraft | null;

  setCanReport: (canReport: boolean) => void;
  setIsSuperUser: (isSuperUser: boolean) => void;
  openDraft: (draft: ErrorReportDraft) => void;
  closeDraft: () => void;
}

export const useErrorReportDraftStore = create<ErrorReportDraftState>()(
  (set) => ({
    canReport: false,
    isSuperUser: false,
    open: false,
    draft: null,

    setCanReport: (canReport) => set({ canReport }),
    setIsSuperUser: (isSuperUser) => set({ isSuperUser }),
    openDraft: (draft) => set({ draft, open: true }),
    // El borrador se conserva: el diálogo se anima al cerrar y vaciarlo antes
    // lo dejaba en blanco durante la salida.
    closeDraft: () => set({ open: false }),
  }),
);
