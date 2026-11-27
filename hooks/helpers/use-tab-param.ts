"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { consumeUrlParam } from "@/hooks/helpers/consume-url-param";

export const TAB_PARAM = "tab";

/**
 * Pestaña activa que también puede fijarse con `?tab=<valor>` (lo usa el
 * buscador global y algunos enlaces). Un valor que no figura en `tabs` se
 * ignora. Como `useActionDialog`, retira el parámetro al consumirlo para que
 * pedir de nuevo la misma pestaña vuelva a cambiarla. `param` permite otro
 * nombre cuando una pantalla tiene dos niveles de pestañas (`dashboard`, `tab`).
 */
export function useTabParam<T extends string>(
  tabs: readonly T[],
  initial: T,
  param: string = TAB_PARAM,
) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const raw = searchParams.get(param);
  const requested = tabs.find((tab) => tab === raw) ?? null;

  const [tab, setTab] = useState<T>(requested ?? initial);
  const [lastRequested, setLastRequested] = useState<T | null>(requested);

  if (requested !== lastRequested) {
    setLastRequested(requested);
    if (requested) setTab(requested);
  }

  useEffect(() => {
    if (!requested) return;

    consumeUrlParam(param, (url) => router.replace(url, { scroll: false }));
  }, [requested, param, router]);

  return [tab, setTab] as const;
}
