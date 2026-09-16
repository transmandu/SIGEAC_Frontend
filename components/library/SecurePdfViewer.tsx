"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

import type { SecurePdfViewerProps } from "@/components/library/SecurePdfViewerContent";

/**
 * pdfjs toca `document` y `window` al evaluar su módulo, así que el pase de
 * render en servidor revienta con un 500 aunque la página sea de cliente. El
 * visor se carga solo en el navegador; acá queda el límite.
 */
export const SecurePdfViewer = dynamic<SecurePdfViewerProps>(
  () =>
    import("@/components/library/SecurePdfViewerContent").then(
      (mod) => mod.SecurePdfViewerContent,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    ),
  },
);
