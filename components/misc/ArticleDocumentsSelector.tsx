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
import { useGetArticleDocumentTypes } from "@/hooks/mantenimiento/almacen/articulos/useGetArticleDocumentTypes";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import { Check, ChevronsUpDown, FileUpIcon, Loader2, X } from "lucide-react";
import { useState } from "react";

/**
 * Selector de documentación del artículo: multi-select del catálogo de tipos
 * de documento (article_document_types) y, por cada tipo seleccionado, un
 * input de archivo para consignar el documento.
 */
const ArticleDocumentsSelector = ({
    value,
    onChange,
    disabled,
}: {
    value: ArticleDocumentSelection[];
    onChange: (value: ArticleDocumentSelection[]) => void;
    disabled?: boolean;
}) => {
    const [open, setOpen] = useState(false);
    const { selectedCompany } = useCompanyStore();

    const { data: documentTypes, isLoading } = useGetArticleDocumentTypes(
        selectedCompany?.slug
    );

    const isSelected = (typeId: number) =>
        value.some((doc) => doc.typeId === typeId);

    const toggleType = (typeId: number) => {
        if (isSelected(typeId)) {
            onChange(value.filter((doc) => doc.typeId !== typeId));
        } else {
            onChange([...value, { typeId }]);
        }
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

            {value.map((doc) => (
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
                            : "PDF o imagen. Máx. 10 MB. Puede dejarse vacío y consignarse luego."}
                    </p>
                </div>
            ))}
        </div>
    );
};

export default ArticleDocumentsSelector;
