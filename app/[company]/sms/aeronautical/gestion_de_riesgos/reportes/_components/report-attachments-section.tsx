"use client";

import { Download, File } from "lucide-react";

import { FileServer } from "@/components/misc/FileServer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { handleDownloadImage } from "./report-detail-helpers";

type ReportAttachmentsSectionProps = {
    company: string;
    report: {
        id: number;
        image?: string | null;
        documentUrl?: string | null;
    };
};

export function ReportAttachmentsSection({
    company,
    report,
}: ReportAttachmentsSectionProps) {
    if (!report.image && !report.documentUrl) {
        return null;
    }

    return (
        <div className="grid gap-6 lg:grid-cols-2">
            {report.image ? (
                <Card>
                    <CardHeader className="space-y-2">
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <File className="h-5 w-5" />
                            Archivo adjunto
                        </CardTitle>
                        <CardDescription>Vista previa del archivo cargado.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FileServer path={String(report.image)} company={company} type="file">
                            {(url, isLoading, hasError) => (
                                <>
                                    <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-lg border bg-muted">
                                        {isLoading ? <p>Cargando archivo...</p> : null}

                                        {hasError || (!url && !isLoading) ? (
                                            <p className="text-destructive">
                                                Error al cargar el archivo.
                                            </p>
                                        ) : url ? (
                                            <img
                                                src={url}
                                                alt="Vista previa"
                                                className="h-full w-full object-contain"
                                            />
                                        ) : null}
                                    </div>

                                    {url ? (
                                        <Button
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
                                            Descargar Imagen
                                        </Button>
                                    ) : null}
                                </>
                            )}
                        </FileServer>
                    </CardContent>
                </Card>
            ) : null}

            {report.documentUrl ? (
                <Card>
                    <CardHeader className="space-y-2">
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <File className="h-5 w-5" />
                            Documento adjunto
                        </CardTitle>
                        <CardDescription>
                            Archivo asociado al reporte para consulta o descarga.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild variant="outline" className="w-full">
                            <a href={report.documentUrl} target="_blank" rel="noreferrer">
                                Abrir documento
                            </a>
                        </Button>
                    </CardContent>
                </Card>
            ) : null}
        </div>
    );
}
