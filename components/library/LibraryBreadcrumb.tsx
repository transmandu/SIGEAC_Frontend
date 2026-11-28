"use client";

import { ChevronRight } from "lucide-react";

interface LibraryBreadcrumbProps {
  departmentName: string;
  /** Ruta de la carpeta abierta ("/" = raíz). */
  path: string;
  onNavigate: (path: string) => void;
}

/**
 * Ruta navegable de la carpeta abierta: cada tramo lleva a esa carpeta, como en
 * un explorador de archivos.
 */
export default function LibraryBreadcrumb({
  departmentName,
  path,
  onNavigate,
}: LibraryBreadcrumbProps) {
  const segments = path.split("/").filter(Boolean);

  const crumbs = [
    { label: departmentName, path: "/" },
    ...segments.map((segment, index) => ({
      label: segment,
      path: `/${segments.slice(0, index + 1).join("/")}`,
    })),
  ];

  return (
    <nav
      aria-label="Ruta de la carpeta"
      className="flex flex-wrap items-center gap-0.5 text-sm text-slate-600 dark:text-slate-400"
    >
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;

        return (
          <span key={crumb.path} className="flex min-w-0 items-center gap-0.5">
            {index > 0 && <ChevronRight className="size-3.5 shrink-0" />}
            {isLast ? (
              <span
                aria-current="page"
                className="truncate font-semibold text-slate-700 dark:text-slate-200"
              >
                {crumb.label}
              </span>
            ) : (
              <button
                type="button"
                onClick={() => onNavigate(crumb.path)}
                className="truncate rounded-md px-1.5 py-0.5 outline-hidden motion-safe:transition-colors hover:bg-muted hover:text-primary focus-visible:ring-2 focus-visible:ring-primary/30"
              >
                {crumb.label}
              </button>
            )}
          </span>
        );
      })}
    </nav>
  );
}
