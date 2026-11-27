"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { consumeUrlParam } from "@/hooks/helpers/consume-url-param";

export const ACTION_PARAM = "accion";

/**
 * Estado de apertura de un diálogo que también puede abrirse con
 * `?accion=<action>` en la URL (lo usa el buscador global). El parámetro se
 * retira al consumirlo: así recargar no reabre el diálogo y volver a pedir la
 * misma acción sí produce un cambio de URL. Cada diálogo usa un nombre propio;
 * una pantalla con dos diálogos de crear no debe abrirlos a la vez.
 */
export function useActionDialog(action: string) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const requested = searchParams.get(ACTION_PARAM) === action;

  const [open, setOpen] = useState(requested);
  const [wasRequested, setWasRequested] = useState(requested);

  if (requested !== wasRequested) {
    setWasRequested(requested);
    if (requested) setOpen(true);
  }

  useEffect(() => {
    if (!requested) return;

    consumeUrlParam(ACTION_PARAM, (url) =>
      router.replace(url, { scroll: false }),
    );
  }, [requested, router]);

  return [open, setOpen] as const;
}
