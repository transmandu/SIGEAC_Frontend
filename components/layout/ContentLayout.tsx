"use client";

import { useEffect, useLayoutEffect } from "react";

import { usePageTitle } from "@/contexts/PageTitleContext";
import { setPageTitle } from "@/lib/document-title";

interface ContentLayoutProps {
  title: string;
  children: React.ReactNode;
}

/**
 * El Navbar ya NO se renderiza aquí: vive en DashboardLayout para que
 * persista entre navegaciones. Este componente solo publica el título
 * de la página al Navbar y mantiene el contenedor de contenido.
 */
export function ContentLayout({ title, children }: ContentLayoutProps) {
  const { registerTitle } = usePageTitle();

  useLayoutEffect(() => registerTitle(title), [registerTitle, title]);

  // Sin cleanup a propósito: el layout saliente desmonta antes de que monte el
  // entrante, y limpiar aquí dejaría la pestaña en "SIGEAC" pelado un instante.
  useEffect(() => setPageTitle(title), [title]);

  return (
    // Ancho completo con un margen propio: `container` imponía un ancho máximo
    // y encima sumaba su padding, dejando la página flotando en pantallas
    // anchas. El tope alto evita la línea de texto interminable.
    <div className="relative z-0 mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
      {children}
    </div>
  );
}
