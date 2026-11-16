"use client";

import { useState } from "react";
import { Download, Eye, File, FileText, ImageIcon } from "lucide-react";
import Image from "next/image";

import { FileServer } from "@/components/misc/FileServer";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

import { handleDownloadImage } from "./report-detail-helpers";
import { ReportSection } from "./report-section";

type ReportAttachmentsSectionProps = {
  company: string;
  report: {
    id: number;
    image?: string;
    document?: string;
    management_doc?: string;
  };
};

type PreviewState = {
  title: string;
  kind: "image" | "pdf";
  url: string;
};

export function ReportAttachmentsSection({
  company,
  report,
}: ReportAttachmentsSectionProps) {
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const managementDoc = report.management_doc ?? null;

  if (!report.image && !report.document && !managementDoc) {
    return null;
  }

  return (
    <>
      <ReportSection icon={File} title="Archivos adjuntos">
        <div className="divide-y divide-border/70">
          {report.image ? (
            <FileServer
              path={String(report.image)}
              company={company}
              type="file"
            >
              {(url, isLoading, hasError) => (
                <div className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                    <ImageIcon className="h-4 w-4" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">Imagen</p>
                    <p className="truncate text-xs text-muted-foreground">
                      Archivo principal del reporte
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={!url || isLoading || hasError}
                      onClick={() =>
                        url &&
                        setPreview({
                          title: `Imagen del reporte ${report.id}`,
                          kind: "image",
                          url,
                        })
                      }
                      title="Ver imagen"
                    >
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">Ver imagen</span>
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={!url || isLoading || hasError}
                      onClick={() => {
                        if (!report.image) return;
                        handleDownloadImage(
                          report.image,
                          `Imagen-RVP-${report.id || "adjunta"}.jpg`,
                        );
                      }}
                      title="Descargar imagen"
                    >
                      <Download className="h-4 w-4" />
                      <span className="sr-only">Descargar imagen</span>
                    </Button>
                  </div>
                </div>
              )}
            </FileServer>
          ) : null}

          {report.document ? (
            <FileServer path={report.document} company={company}>
              {(url, isLoading, hasError) => (
                <div className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                    <FileText className="h-4 w-4" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">Reporte original</p>
                    <p className="truncate text-xs text-muted-foreground">
                      Documento del reporte
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={!url || isLoading || hasError}
                      onClick={() =>
                        url &&
                        setPreview({
                          title: `Documento del reporte ${report.id}`,
                          kind: "pdf",
                          url,
                        })
                      }
                      title="Ver PDF"
                    >
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">Ver PDF</span>
                    </Button>

                    {url ? (
                      <Button asChild variant="ghost" size="icon">
                        <a
                          href={url}
                          download={`Documento-${report.id}.pdf`}
                          title="Descargar PDF"
                        >
                          <Download className="h-4 w-4" />
                          <span className="sr-only">Descargar PDF</span>
                        </a>
                      </Button>
                    ) : null}
                  </div>
                </div>
              )}
            </FileServer>
          ) : null}

          {managementDoc ? (
            <FileServer path={managementDoc} company={company}>
              {(url, isLoading, hasError) => (
                <div className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                    <FileText className="h-4 w-4" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">Documento de cierre</p>
                    <p className="truncate text-xs text-muted-foreground">
                      Gestión y cierre del reporte
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={!url || isLoading || hasError}
                      onClick={() =>
                        url &&
                        setPreview({
                          title: `Documento de cierre ${report.id}`,
                          kind: "pdf",
                          url,
                        })
                      }
                      title="Ver cierre"
                    >
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">Ver cierre</span>
                    </Button>

                    {url ? (
                      <Button asChild variant="ghost" size="icon">
                        <a
                          href={url}
                          download={`Management-doc-${report.id}.pdf`}
                          title="Descargar cierre"
                        >
                          <Download className="h-4 w-4" />
                          <span className="sr-only">Descargar cierre</span>
                        </a>
                      </Button>
                    ) : null}
                  </div>
                </div>
              )}
            </FileServer>
          ) : null}
        </div>
      </ReportSection>

      <Dialog
        open={Boolean(preview)}
        onOpenChange={(open) => !open && setPreview(null)}
      >
        <DialogContent className="max-w-[96vw] p-0 sm:max-w-6xl">
          <DialogHeader className="border-b border-border/60 px-6 py-4">
            <DialogTitle>{preview?.title ?? "Vista previa"}</DialogTitle>
            <DialogDescription>
              Revisa el archivo antes de descargarlo o cerrarlo.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[80vh]">
            <div
              className={cn(
                "p-4",
                preview?.kind === "image" ? "flex justify-center" : "",
              )}
            >
              {preview?.kind === "image" ? (
                <div className="relative min-h-[50vh] w-full overflow-hidden rounded-lg border bg-muted/20">
                  <Image
                    src={preview.url}
                    alt={preview.title}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              ) : preview ? (
                <iframe
                  src={`${preview.url}#toolbar=0&navpanes=0`}
                  className="h-[75vh] w-full rounded-lg border bg-background"
                  title={preview.title}
                />
              ) : null}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
