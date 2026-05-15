"use client";

import { Download, File } from "lucide-react";
import Image from "next/image";

import { FileServer } from "@/components/misc/FileServer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { DetailGrid } from "../../_components/detail-grid";

import {
    buildControlDetails,
    handleDownloadImage,
} from "./report-detail-helpers";
import { FollowUpControlLike } from "./report-detail-types";

type ReportFollowUpControlCardProps = {
    company: string;
    control: FollowUpControlLike;
    controlIndex: number;
    measureIndex: number;
};

export function ReportFollowUpControlCard({
    company,
    control,
    controlIndex,
    measureIndex,
}: ReportFollowUpControlCardProps) {
    const imagePath = control.image;

    return (
        <Card
            key={control.id ?? `${measureIndex}-${controlIndex}-${control.description ?? "control"}`}
            className="bg-muted/30"
        >
            <CardHeader className="space-y-1 pb-3">
                <CardTitle className="text-base">Control {controlIndex + 1}</CardTitle>
                <CardDescription>
                    {control.description || "Control de seguimiento sin descripción"}
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                <DetailGrid items={buildControlDetails(control)} />

                {imagePath ? (
                    <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-muted-foreground">
                            Imagen del control
                        </h4>

                        <FileServer path={imagePath} company={company} type="file">
                            {(url, isLoading, hasError) => (
                                <div className="space-y-3">
                                    <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-lg border bg-muted">
                                        {isLoading ? (
                                            <p className="text-sm text-muted-foreground">
                                                Cargando imagen...
                                            </p>
                                        ) : null}

                                        {hasError ? (
                                            <p className="text-sm text-destructive">
                                                Error al cargar la imagen
                                            </p>
                                        ) : null}

                                        {!isLoading && !hasError && url ? (
                                            <Image
                                                src={url}
                                                alt={`Imagen control ${controlIndex + 1}`}
                                                fill
                                                className="object-contain"
                                                unoptimized
                                            />
                                        ) : null}
                                    </div>

                                    {url ? (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                handleDownloadImage(
                                                    imagePath,
                                                    `Control-${control.id || controlIndex + 1}-imagen.jpg`,
                                                );
                                            }}
                                        >
                                            <Download className="mr-2 h-4 w-4" />
                                            Descargar Imagen
                                        </Button>
                                    ) : null}
                                </div>
                            )}
                        </FileServer>
                    </div>
                ) : null}

                {control.document ? (
                    <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-muted-foreground">
                            Documento del control
                        </h4>

                        <FileServer path={control.document} company={company} type="file">
                            {(url, isLoading, hasError) => (
                                <div className="space-y-3">
                                    <div className="relative flex min-h-[100px] items-center justify-center overflow-hidden rounded-lg border bg-muted">
                                        {isLoading ? (
                                            <p className="text-sm text-muted-foreground">
                                                Cargando documento...
                                            </p>
                                        ) : null}

                                        {hasError ? (
                                            <p className="text-sm text-destructive">
                                                Error al cargar el documento
                                            </p>
                                        ) : null}

                                        {!isLoading && !hasError && url ? (
                                            <div className="flex flex-col items-center gap-2 p-4">
                                                <File className="h-8 w-8 text-muted-foreground" />
                                                <p className="text-sm text-muted-foreground">
                                                    Documento disponible
                                                </p>
                                            </div>
                                        ) : null}
                                    </div>

                                    {url ? (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => window.open(url, "_blank")}
                                            className="w-full"
                                        >
                                            <Download className="mr-2 h-4 w-4" />
                                            Ver Documento
                                        </Button>
                                    ) : null}
                                </div>
                            )}
                        </FileServer>
                    </div>
                ) : null}
            </CardContent>
        </Card>
    );
}