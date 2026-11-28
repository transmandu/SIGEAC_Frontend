"use client";

import { memo, useCallback, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useObjectUrl } from "@/hooks/useObjectUrl";
import { cn } from "@/lib/utils";
import {
  fetchDocumentFile,
  fetchStoredThumbnail,
  limitThumbnailWork,
  renderThumbnail,
  storeThumbnail,
  thumbnailKindOf,
} from "@/lib/Library/thumbnail";
import type {
  LibraryDocument,
  describeDocument,
} from "@/lib/Library/document-info";

interface DocumentThumbnailProps {
  company: string;
  doc: LibraryDocument;
  info: ReturnType<typeof describeDocument>;
  className?: string;
}

/**
 * Primera página del documento. Solo se pide cuando la tarjeta entra en
 * pantalla: una carpeta con cientos de documentos no dispara cientos de
 * descargas. Si el servidor ya la tiene, la sirve (unos KB); si no, la dibuja
 * este navegador una vez y la deja guardada para los demás. Lo que no se puede
 * dibujar (Excel, Word, un PDF dañado) queda con el icono de su tipo.
 */
function DocumentThumbnail({
  company,
  doc,
  info,
  className,
}: DocumentThumbnailProps) {
  const kind = thumbnailKindOf(info.extension);
  const versionId = info.latestVersion?.id;

  // Cuando la tarjeta aparece en pantalla. El observador se suelta al verla:
  // una miniatura ya pedida no vuelve a depender del desplazamiento.
  const [visible, setVisible] = useState(false);
  const watch = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const hasStored = !!doc.has_thumbnail;
  const query = useQuery({
    queryKey: ["library-thumbnail", company, doc.id, versionId],
    enabled: visible && kind !== null && versionId != null,
    staleTime: Infinity,
    gcTime: 30 * 60_000,
    retry: false,
    queryFn: async (): Promise<Blob | null> => {
      if (hasStored) {
        const stored = await fetchStoredThumbnail(company, doc.id, versionId);
        if (stored) return stored;
      }

      return limitThumbnailWork(async () => {
        const file = await fetchDocumentFile(company, doc.id);
        const thumbnail = await renderThumbnail(kind!, file).catch(() => null);
        if (thumbnail) void storeThumbnail(company, doc.id, thumbnail);
        return thumbnail;
      });
    },
  });

  const url = useObjectUrl(query.data);
  const [loadedUrl, setLoadedUrl] = useState<string | null>(null);
  const Icon = info.kind.icon;
  const pending = kind !== null && !query.isError && query.data === undefined;

  return (
    <div
      ref={watch}
      className={cn(
        "relative flex items-center justify-center overflow-hidden",
        info.kind.iconClass,
        className,
      )}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element -- blob: local, no hay nada que optimizar
        <img
          src={url}
          alt=""
          draggable={false}
          onLoad={() => setLoadedUrl(url)}
          className={cn(
            "absolute inset-0 size-full bg-white object-cover object-top motion-safe:transition-opacity motion-safe:duration-300",
            loadedUrl === url ? "opacity-100" : "opacity-0",
          )}
        />
      ) : (
        <div
          className={cn(
            "flex flex-col items-center gap-1.5",
            pending && "motion-safe:animate-pulse",
          )}
        >
          <Icon className="size-8" strokeWidth={1.5} />
          <span className="text-xs font-semibold">{info.kind.label}</span>
        </div>
      )}
    </div>
  );
}

export default memo(DocumentThumbnail);
