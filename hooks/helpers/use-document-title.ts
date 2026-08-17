"use client";

import { useEffect } from "react";

import { setPageTitle } from "@/lib/document-title";

/**
 * Para páginas cliente que no pasan por ContentLayout (login, error, etc.):
 * las páginas con "use client" no pueden exportar `metadata`, así que el
 * título de la pestaña se publica desde acá.
 */
export function useDocumentTitle(title: string) {
  useEffect(() => setPageTitle(title), [title]);
}
