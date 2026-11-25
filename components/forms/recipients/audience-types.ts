import type { ReactNode } from "react";

/**
 * Forma común de una regla de "quién ve / recibe esto" cuando el destino es
 * gente del sistema. La usan dos configuraciones que NO se mezclan —quién ve
 * cada alerta crítica y a quién le llega cada notificación in-app—: cada una
 * tiene su pantalla, su API y sus reglas, y solo comparten estas piezas.
 */
export type AudienceTargetType = "ROLE" | "USER" | "EMPLOYEE" | "DEPARTMENT";

export interface AudienceRule {
  id: number;
  target_type: AudienceTargetType;
  user_id: number | null;
  employee_id: number | null;
  department_id: number | null;
  role_name: string | null;
  is_active: boolean;
  /** Nombre del destino ya resuelto por el servidor. */
  target_label: string;
  target_detail: string | null;
}

export interface AudiencePayload {
  target_type?: AudienceTargetType;
  user_id?: number | null;
  employee_id?: number | null;
  department_id?: number | null;
  role_name?: string | null;
  is_active?: boolean;
  [key: string]: unknown;
}

/** Aquello a lo que se le asigna audiencia: una alerta o un aviso in-app. */
export interface AudienceSubject {
  key: string;
  label: string;
}

/** Las mutaciones de cada configuración, con la forma mínima que necesitan los componentes. */
export interface AudienceApi {
  /** Columna que nombra el sujeto en el cuerpo de la petición (`alert_key`, `notice_key`). */
  keyField: string;
  useCreate: () => {
    mutateAsync: (args: {
      company: string;
      data: AudiencePayload;
    }) => Promise<unknown>;
    isPending: boolean;
  };
  useUpdate: () => {
    mutateAsync: (args: {
      company: string;
      id: number;
      data: AudiencePayload;
    }) => Promise<unknown>;
    mutate: (args: {
      company: string;
      id: number;
      data: AudiencePayload;
      silent?: boolean;
    }) => void;
    isPending: boolean;
  };
  useDelete: () => {
    mutateAsync: (args: { company: string; id: number }) => Promise<unknown>;
    isPending: boolean;
  };
}

/** Los textos que cambian entre una configuración y otra. */
export interface AudienceCopy {
  panelTitle: string;
  panelHint: ReactNode;
  emptyTitle: string;
  emptyDescription: string;
  formTitleNew: string;
  formTitleEdit: string;
  /** Texto bajo el título del diálogo; recibe el nombre del sujeto. */
  formIntro: (label: string) => ReactNode;
  formSectionTitle: string;
  formSectionHint: string;
  inactiveHint: string;
  removeTitle: string;
  removeWarning: string;
}
