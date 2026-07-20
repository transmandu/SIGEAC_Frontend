"use client";

import { ArticleDocumentSelection } from "@/actions/mantenimiento/almacen/inventario/articulos/actions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import SecureFileViewer from "@/components/library/SecureFileViewer";
import axiosInstance from "@/lib/axios";
import { useGetArticleDocumentTypes } from "@/hooks/mantenimiento/almacen/articulos/useGetArticleDocumentTypes";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import type { ArticleDocument, ArticleDocumentRequirementSummary } from "@/types";
import { Check, CheckCircle2, ChevronsUpDown, Eye, FileUpIcon, Loader2, RefreshCw, X } from "lucide-react";
import { useState } from "react";

/**
 * Selector de documentación del artículo: multi-select del catálogo de tipos
 * de documento (article_document_types) y, por cada tipo seleccionado, un
 * input de archivo para consignar el documento.
 *
 * En modo edición (consignedRequirements) los tipos que ya tienen un
 * documento consignado se muestran con su estado real (no como vacíos):
 * botón para previsualizar y otro para reemplazar explícitamente, en vez de
 * un input de carga que sugiera que no hay nada guardado todavía.
 */
const ArticleDocumentsSelector = ({
    value,
    onChange,
    disabled,
    consignedRequirements,
}: {
    value: ArticleDocumentSelection[];
    onChange: (value: ArticleDocumentSelection[]) => void;
    disabled?: boolean;
    /** Requerimientos ya consignados de este artículo (modo edición). */
    consignedRequirements?: ArticleDocumentRequirementSummary[];
}) => {
    const [open, setOpen] = useState(false);
    const [replacingTypeIds, setReplacingTypeIds] = useState<Set<number>>(new Set());
    const [previewDoc, setPreviewDoc] = useState<ArticleDocument | null>(null);
    const { selectedCompany } = useCompanyStore();

    const { data: documentTypes, isLoading } = useGetArticleDocumentTypes(
        selectedCompany?.slug
    );

    const consignedByTypeId = new Map(
        (consignedRequirements ?? [])
            .filter((req) => req.documents.length > 0 && typeof req.document_type?.id === "number")
            .map((req) => [req.document_type!.id, req])
    );

    const isSelected = (typeId: number) =>
        value.some((doc) => doc.typeId === typeId);

    const toggleType = (typeId: number) => {
        if (isSelected(typeId)) {
            onChange(value.filter((doc) => doc.typeId !== typeId));
            setReplacingTypeIds((prev) => {
                const next = new Set(prev);
                next.delete(typeId);
                return next;
            });
            return;
        }

        const consigned = consignedByTypeId.get(typeId);
        onChange([
            ...value,
            consigned ? { typeId, requirementId: consigned.id } : { typeId },
        ]);
    };

    const setFile = (typeId: number, file?: File) => {
        onChange(
            value.map((doc) => (doc.typeId === typeId ? { ...doc, file } : doc))
        );
    };

    const setPhysical = (typeId: number, isPhysical: boolean) => {
        onChange(
            value.map((doc) =>
                doc.typeId === typeId ? { ...doc, isPhysical } : doc
            )
        );
    };

    const startReplacing = (typeId: number, existingDocumentId: number) => {
        setReplacingTypeIds((prev) => new Set(prev).add(typeId));
        onChange(
            value.map((doc) =>
                doc.typeId === typeId ? { ...doc, replaceDocumentId: existingDocumentId } : doc
            )
        );
    };

    const cancelReplacing = (typeId: number) => {
        setReplacingTypeIds((prev) => {
            const next = new Set(prev);
            next.delete(typeId);
            return next;
        });
        onChange(
            value.map((doc) =>
                doc.typeId === typeId
                    ? { ...doc, file: undefined, replaceDocumentId: undefined }
                    : doc
            )
        );
    };

    const typeName = (typeId: number) =>
        documentTypes?.find((type) => type.id === typeId)?.name ?? `#${typeId}`;

    return (
        <div className="space-y-4">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        type="button"
                        variant="outline"
                        role="combobox"
                        disabled={disabled || isLoading}
                        className="w-full justify-between"
                    >
                        {isLoading ? (
                            <>
                                Cargando tipos de documento...{" "}
                                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                            </>
                        ) : value.length > 0 ? (
                            `Documentos seleccionados: ${value.length}`
                        ) : (
                            <>
                                Seleccionar documentos...{" "}
                                <ChevronsUpDown className="ml-2 h-4 w-4" />
                            </>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[320px] p-0">
                    <Command>
                        <CommandInput placeholder="Buscar tipo de documento..." />
                        <CommandList>
                            <CommandEmpty>No se encontraron tipos de documento</CommandEmpty>
                            <CommandGroup>
                                {documentTypes?.map((type) => (
                                    <CommandItem
                                        key={type.id}
                                        value={type.name}
                                        onSelect={() => toggleType(type.id)}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                isSelected(type.id) ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        <div className="flex flex-col">
                                            <span>{type.name}</span>
                                            {type.regulation && (
                                                <span className="text-xs text-muted-foreground">
                                                    {type.regulation}
                                                </span>
                                            )}
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            {value.map((doc) => {
                const consigned = consignedByTypeId.get(doc.typeId);
                const existingDocument = consigned?.documents[0];
                const isReplacing = replacingTypeIds.has(doc.typeId);

                // Ya consignado y el usuario no pidió reemplazarlo: mostrar
                // el estado real en vez de un input de carga vacío.
                if (existingDocument && !isReplacing) {
                    return (
                        <div key={doc.typeId} className="space-y-1">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm">
                                    Certificado{" "}
                                    <span className="text-primary font-semibold">
                                        {typeName(doc.typeId)}
                                    </span>
                                </Label>
                                <button
                                    type="button"
                                    onClick={() => toggleType(doc.typeId)}
                                    disabled={disabled}
                                    className="text-muted-foreground hover:text-red-500"
                                    aria-label={`Quitar ${typeName(doc.typeId)}`}
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="flex items-center justify-between gap-2 rounded border border-emerald-200 bg-emerald-50 px-3 py-2 dark:border-emerald-800/60 dark:bg-emerald-950/40">
                                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                                    <CheckCircle2 className="size-3.5" />
                                    Ya consignado
                                    {existingDocument.is_physical && " (físico)"}
                                </span>
                                <div className="flex items-center gap-1">
                                    {existingDocument.file_path && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6"
                                            title="Ver documento"
                                            onClick={() => setPreviewDoc(existingDocument)}
                                        >
                                            <Eye className="size-3.5" />
                                        </Button>
                                    )}
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 gap-1 px-2 text-xs"
                                        disabled={disabled}
                                        onClick={() => startReplacing(doc.typeId, existingDocument.id)}
                                    >
                                        <RefreshCw className="size-3" />
                                        Reemplazar
                                    </Button>
                                </div>
                            </div>
                        </div>
                    );
                }

                return (
                    <div key={doc.typeId} className="space-y-1">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm">
                                Certificado{" "}
                                <span className="text-primary font-semibold">
                                    {typeName(doc.typeId)}
                                </span>
                            </Label>
                            <div className="flex items-center gap-2">
                                {isReplacing && (
                                    <button
                                        type="button"
                                        onClick={() => cancelReplacing(doc.typeId)}
                                        disabled={disabled}
                                        className="text-xs text-muted-foreground hover:text-foreground"
                                    >
                                        Cancelar
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => toggleType(doc.typeId)}
                                    disabled={disabled}
                                    className="text-muted-foreground hover:text-red-500"
                                    aria-label={`Quitar ${typeName(doc.typeId)}`}
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                        <div className="relative h-10 w-full">
                            <FileUpIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 z-10" />
                            <Input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                disabled={disabled}
                                onChange={(e) => setFile(doc.typeId, e.target.files?.[0])}
                                className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6E23DD] focus:border-transparent cursor-pointer"
                            />
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                            <Checkbox
                                id={`physical-${doc.typeId}`}
                                checked={doc.isPhysical ?? false}
                                onCheckedChange={(checked) =>
                                    setPhysical(doc.typeId, checked === true)
                                }
                                disabled={disabled}
                            />
                            <Label
                                htmlFor={`physical-${doc.typeId}`}
                                className="text-xs font-normal cursor-pointer"
                            >
                                Documento recibido en físico
                            </Label>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {doc.file
                                ? doc.file.name
                                : isReplacing
                                    ? "Seleccione el archivo que reemplazará al documento actual. El cambio se guarda junto con el resto del formulario."
                                    : "PDF o imagen. Máx. 10 MB. Puede dejarse vacío y consignarse luego."}
                        </p>
                    </div>
                );
            })}

            {previewDoc && (
                <SecureFileViewer
                    isOpen={!!previewDoc}
                    onClose={() => setPreviewDoc(null)}
                    fetchBlobUrl={async () => {
                        const { data } = await axiosInstance.get(
                            `/${selectedCompany?.slug}/article-documents/${previewDoc.id}/view`,
                            { responseType: "blob" }
                        );
                        return URL.createObjectURL(data);
                    }}
                />
            )}
        </div>
    );
};

export default ArticleDocumentsSelector;
