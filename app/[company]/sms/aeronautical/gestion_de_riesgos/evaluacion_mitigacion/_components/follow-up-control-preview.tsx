'use client';

import { Download, ExternalLink, Eye, FileImage, FileText } from 'lucide-react';
import { useMemo } from 'react';

import { FileServer } from '@/components/misc/FileServer';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

import {
    getAttachmentFileName,
    getAttachmentMimeType,
    getAttachmentPreviewKind,
} from './evaluation-workflow-helpers';

type FollowUpControlPreviewProps = {
    company: string;
    path: string;
    title: string;
    description: string;
    triggerLabel: string;
};

const downloadResolvedUrl = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export function FollowUpControlPreview({
    company,
    path,
    title,
    description,
    triggerLabel,
}: FollowUpControlPreviewProps) {
    const previewKind = useMemo(() => getAttachmentPreviewKind(path), [path]);
    const mimeType = useMemo(() => getAttachmentMimeType(path), [path]);
    const filename = useMemo(() => getAttachmentFileName(path), [path]);

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button type="button" variant="outline" size="sm">
                    <Eye className="mr-2 h-4 w-4" />
                    {triggerLabel}
                </Button>
            </DialogTrigger>

            <DialogContent className="flex max-h-[85vh] max-w-4xl flex-col overflow-hidden">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                <FileServer path={path} company={company} type="file">
                    {(url, isLoading, hasError) => (
                        <>
                            <div className="flex min-h-[380px] items-center justify-center overflow-hidden rounded-lg border bg-muted/20 p-4">
                                {isLoading ? (
                                    <p className="text-sm text-muted-foreground">Cargando vista previa...</p>
                                ) : null}

                                {hasError ? (
                                    <p className="text-sm text-destructive">No fue posible cargar el archivo adjunto.</p>
                                ) : null}

                                {!isLoading && !hasError && url && previewKind === 'image' ? (
                                    <object
                                        data={url}
                                        type={mimeType}
                                        className="h-[65vh] w-full rounded-md"
                                        aria-label={title}
                                    >
                                        <div className="flex flex-col items-center gap-2 text-center text-sm text-muted-foreground">
                                            <FileImage className="h-8 w-8" />
                                            No fue posible renderizar la imagen.
                                        </div>
                                    </object>
                                ) : null}

                                {!isLoading && !hasError && url && previewKind === 'pdf' ? (
                                    <object
                                        data={url}
                                        type={mimeType}
                                        className="h-[65vh] w-full rounded-md"
                                        aria-label={title}
                                    >
                                        <div className="flex flex-col items-center gap-2 text-center text-sm text-muted-foreground">
                                            <FileText className="h-8 w-8" />
                                            La vista previa no está disponible para este documento.
                                        </div>
                                    </object>
                                ) : null}

                                {!isLoading && !hasError && url && previewKind === 'unsupported' ? (
                                    <div className="flex flex-col items-center gap-2 text-center text-sm text-muted-foreground">
                                        <FileText className="h-8 w-8" />
                                        La vista previa no está disponible para este tipo de archivo.
                                    </div>
                                ) : null}
                            </div>

                            <DialogFooter className="gap-2">
                                {url ? (
                                    <>
                                        <Button type="button" variant="outline" onClick={() => window.open(url, '_blank')}>
                                            <ExternalLink className="mr-2 h-4 w-4" />
                                            Abrir en nueva pestaña
                                        </Button>
                                        <Button type="button" onClick={() => downloadResolvedUrl(url, filename)}>
                                            <Download className="mr-2 h-4 w-4" />
                                            Descargar
                                        </Button>
                                    </>
                                ) : null}
                            </DialogFooter>
                        </>
                    )}
                </FileServer>
            </DialogContent>
        </Dialog>
    );
}
