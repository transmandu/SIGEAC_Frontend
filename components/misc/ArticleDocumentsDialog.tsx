"use client";

import SecureFileViewer from "@/components/library/SecureFileViewer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useGetArticleDocumentRequirements } from "@/hooks/mantenimiento/almacen/articulos/useGetArticleDocumentRequirements";
import axiosInstance from "@/lib/axios";
import { cn } from "@/lib/utils";
import { isImageDocument } from "@/lib/warehouse/documents";
import { useCompanyStore } from "@/stores/CompanyStore";
import type { ArticleDocument } from "@/types";
import { Check, Eye, FileDown, Loader2, Minus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

/**
 * Documentación consignada de un artículo: checklist de lo que se le exige y,
 * por cada documento cargado, previsualización en el visor seguro y descarga.
 */
const ArticleDocumentsDialog = ({
  open,
  onOpenChange,
  articleId,
  partNumber,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  articleId: string | number;
  partNumber?: string;
}) => {
  const { selectedCompany } = useCompanyStore();
  const [previewDoc, setPreviewDoc] = useState<ArticleDocument | null>(null);

  const {
    data: requirements,
    isLoading,
    isError,
  } = useGetArticleDocumentRequirements(articleId, selectedCompany?.slug, open);

  const handleDownload = async (doc: ArticleDocument) => {
    try {
      const { data } = await axiosInstance.get(
        `/${selectedCompany?.slug}/article-documents/${doc.id}/download`,
        { responseType: "blob" }
      );

      const url = URL.createObjectURL(new Blob([data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        doc.file_path?.split("/").pop() ?? `documento-${doc.id}`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("No se pudo descargar el documento");
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Documentación del artículo</DialogTitle>
            <DialogDescription>
              {partNumber
                ? `Documentos consignados de ${partNumber}.`
                : "Documentos consignados del artículo."}
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
          ) : isError ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No se pudo cargar la documentación del artículo.
            </p>
          ) : requirements && requirements.length > 0 ? (
            <div className="space-y-2">
              {requirements.map((req) => {
                const consigned = req.documents.length > 0;
                return (
                  <div
                    key={req.id}
                    className={cn(
                      "flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2",
                      consigned
                        ? "border-emerald-300/60 bg-emerald-50/50 dark:border-emerald-700/40 dark:bg-emerald-950/20"
                        : "border-border bg-muted/30"
                    )}
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      {consigned ? (
                        <Check className="size-4 shrink-0 text-emerald-600" />
                      ) : (
                        <Minus className="size-4 shrink-0 text-muted-foreground" />
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {req.document_type?.name ?? "Tipo de documento"}
                        </p>
                        {req.document_type?.regulation && (
                          <p className="text-[10px] text-muted-foreground">
                            {req.document_type.regulation}
                          </p>
                        )}
                      </div>
                    </div>

                    <TooltipProvider>
                      <div className="flex flex-wrap items-center gap-1">
                        {req.documents.map((doc) => (
                          <span key={doc.id} className="flex items-center gap-1">
                            {doc.is_physical && (
                              <span className="select-none inline-flex items-center rounded-full border border-amber-300/60 bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:border-amber-600/40 dark:bg-amber-950/30 dark:text-amber-400">
                                Físico
                              </span>
                            )}
                            {doc.file_path && (
                              <>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="size-7"
                                      onClick={() => setPreviewDoc(doc)}
                                    >
                                      <Eye className="size-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Ver documento</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="size-7"
                                      onClick={() => handleDownload(doc)}
                                    >
                                      <FileDown className="size-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Descargar</TooltipContent>
                                </Tooltip>
                              </>
                            )}
                          </span>
                        ))}
                        {!consigned && (
                          <span className="text-[10px] font-medium text-muted-foreground">
                            Pendiente por consignar
                          </span>
                        )}
                      </div>
                    </TooltipProvider>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Este artículo no tiene documentos registrados.
            </p>
          )}
        </DialogContent>
      </Dialog>

      {previewDoc && (
        <SecureFileViewer
          isOpen={!!previewDoc}
          onClose={() => setPreviewDoc(null)}
          title={previewDoc.file_path?.split("/").pop()}
          isImage={isImageDocument(previewDoc.file_path)}
          fetchBlobUrl={async () => {
            const { data } = await axiosInstance.get(
              `/${selectedCompany?.slug}/article-documents/${previewDoc.id}/view`,
              { responseType: "blob" }
            );
            return URL.createObjectURL(data);
          }}
        />
      )}
    </>
  );
};

export default ArticleDocumentsDialog;
