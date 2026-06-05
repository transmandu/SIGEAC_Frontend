"use client";

import { useState } from "react";
import { Download, Eye, File, FileText, ImageIcon } from "lucide-react";
import Image from "next/image";

import { FileServer } from "@/components/misc/FileServer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

import { handleDownloadImage } from "./report-detail-helpers";

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
            <Card>
                <CardHeader className="space-y-2">
                    <CardTitle className="flex items-center gap-2 text-xl">
                        <File className="h-5 w-5" />
                        Archivos adjuntos
                    </CardTitle>
                    <CardDescription>
                        Vista previa y descarga de imagen, documento original y documento de cierre.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-3 lg:grid-cols-3">
                        {report.image ? (
                            <FileServer path={String(report.image)} company={company} type="file">
                                {(url, isLoading, hasError) => (
                                    <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="space-y-1">
                                                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
                                                    Imagen
                                                </p>
                                                <p className="text-sm font-medium">Archivo principal</p>
                                            </div>
                                            <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                        </div>

                                        <div className="mt-3 flex flex-wrap gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                disabled={!url || isLoading || hasError}
                                                onClick={() => url && setPreview({ title: `Imagen del reporte ${report.id}`, kind: "image", url })}
                                            >
                                                <Eye className="mr-2 h-4 w-4" />
                                                Ver imagen
                                            </Button>
                                            {url ? (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        if (!report.image) return;
                                                        handleDownloadImage(
                                                            report.image,
                                                            `Imagen-RVP-${report.id || "adjunta"}.jpg`,
                                                        );
                                                    }}
                                                >
                                                    <Download className="mr-2 h-4 w-4" />
                                                    Descargar
                                                </Button>
                                            ) : null}
                                        </div>
                                    </div>
                                )}
                            </FileServer>
                        ) : null}

                        {report.document ? (
                            <FileServer path={report.document} company={company}>
                                {(url, isLoading, hasError) => (
                                    <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="space-y-1">
                                                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
                                                    Documento
                                                </p>
                                                <p className="text-sm font-medium">Reporte original</p>
                                            </div>
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                        </div>

                                        <div className="mt-3 flex flex-wrap gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                disabled={!url || isLoading || hasError}
                                                onClick={() => url && setPreview({ title: `Documento del reporte ${report.id}`, kind: "pdf", url })}
                                            >
                                                <Eye className="mr-2 h-4 w-4" />
                                                Ver PDF
                                            </Button>
                                            {url ? (
                                                <Button asChild variant="outline" size="sm">
                                                    <a href={url} download={`Documento-${report.id}.pdf`}>
                                                        <Download className="mr-2 h-4 w-4" />
                                                        Descargar
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
                                    <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="space-y-1">
                                                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
                                                    Documento de cierre
                                                </p>
                                                <p className="text-sm font-medium">management_doc</p>
                                            </div>
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                        </div>

                                        <div className="mt-3 flex flex-wrap gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                disabled={!url || isLoading || hasError}
                                                onClick={() => url && setPreview({ title: `Documento de cierre ${report.id}`, kind: "pdf", url })}
                                            >
                                                <Eye className="mr-2 h-4 w-4" />
                                                Ver cierre
                                            </Button>
                                            {url ? (
                                                <Button asChild variant="outline" size="sm">
                                                    <a href={url} download={`Management-doc-${report.id}.pdf`}>
                                                        <Download className="mr-2 h-4 w-4" />
                                                        Descargar
                                                    </a>
                                                </Button>
                                            ) : null}
                                        </div>
                                    </div>
                                )}
                            </FileServer>
                        ) : null}
                    </div>
                </CardContent>
            </Card>

            <Dialog open={Boolean(preview)} onOpenChange={(open) => !open && setPreview(null)}>
                <DialogContent className="max-w-[96vw] p-0 sm:max-w-6xl">
                    <DialogHeader className="border-b border-border/60 px-6 py-4">
                        <DialogTitle>{preview?.title ?? "Vista previa"}</DialogTitle>
                        <DialogDescription>
                            Revisa el archivo antes de descargarlo o cerrarlo.
                        </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="max-h-[80vh]">
                        <div className={cn("p-4", preview?.kind === "image" ? "flex justify-center" : "") }>
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