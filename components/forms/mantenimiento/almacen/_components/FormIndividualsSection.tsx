"use client";

import { Loader2 } from "lucide-react";

import {
  INDIVIDUAL_TYPE_LABEL,
  type IndividualType,
  type IndividualsSummary,
} from "@/types/general-article-individual";
import {
  IndividualIdentifiersField,
  type IndividualIdentifiersDraft,
} from "./IndividualIdentifiersField";

const ALL_TYPES = Object.keys(INDIVIDUAL_TYPE_LABEL) as IndividualType[];

interface Props {
  /** Se edita un artículo ya registrado: lo que se puede identificar lo dice su resumen. */
  editing: boolean;
  loading: boolean;
  summary?: IndividualsSummary;
  types?: IndividualType[];
  /** Al crear: la existencia que se está escribiendo. */
  quantity: number;
  draft: IndividualIdentifiersDraft;
  onChange: (next: IndividualIdentifiersDraft) => void;
  serverError?: string | null;
  disabled?: boolean;
  fieldClassName?: string;
}

/**
 * Captura de los artículos que se identifican al guardar.
 *
 * Al crear el tope es la existencia que se escribe; al editar, el resumen del
 * servidor: ya puede haber identificados, con un tipo fijado, y solo queda por
 * identificar lo que no tiene identidad. Que el artículo admita o no
 * identificar (dimensiones) lo decide quien lo aloja.
 */
export function FormIndividualsSection({
  editing,
  loading,
  summary,
  types,
  quantity,
  draft,
  onChange,
  serverError,
  disabled,
  fieldClassName,
}: Props) {
  if (editing && loading) {
    return (
      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <Loader2 className="size-3.5 animate-spin" />
        Consultando los artículos individuales…
      </p>
    );
  }

  const max = editing ? (summary?.anonymous ?? 0) : Math.floor(quantity);

  const reason = editing
    ? max === 0
      ? "Todos los artículos de la existencia ya están identificados."
      : null
    : max < 1
      ? "Indique primero la cantidad: se identifica uno por cada artículo que entra."
      : null;

  if (reason) {
    return (
      <p className="text-center text-xs text-muted-foreground">{reason}</p>
    );
  }

  return (
    <IndividualIdentifiersField
      draft={{ ...draft, type: summary?.type ?? draft.type }}
      // El tipo fijado se guarda en el borrador: quien lo valida fuera no
      // tiene el resumen y vería un tipo sin elegir.
      onChange={(next) =>
        onChange({ ...next, type: summary?.type ?? next.type })
      }
      types={types ?? ALL_TYPES}
      lockedType={summary?.type ?? null}
      max={max}
      disabled={disabled}
      serverError={serverError}
      fieldClassName={fieldClassName}
    />
  );
}
