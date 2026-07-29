"use client";

import { useLayoutEffect } from "react";

import { usePageTitle } from "@/contexts/PageTitleContext";

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

  return (
    <div className="container relative z-0 pt-8 pb-8 px-4 sm:px-8">
      {children}
    </div>
  );
}
