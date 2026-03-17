"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { Button } from "@/components/ui/button";
import { Plus, Search, FolderOpen, Loader2 } from "lucide-react";
import DocumentTable from "./data-table"; 
import UploadModal from "./UploadModal"; 
import DocumentViewer from "@/components/library/SecureVisualizer";
import libraryService from "@/lib/libraryService";

const BibliotecaPage = () => {
  const params = useParams();
  const companySlug = (params.company as string) || "transmandu";

  // ESTADOS EXISTENTES
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [groupedDocuments, setGroupedDocuments] = useState<any>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // 2. NUEVOS ESTADOS PARA EL VISOR
  const [viewingDocId, setViewingDocId] = useState<number | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await libraryService.getDocuments(companySlug);
      setGroupedDocuments(response.data || {});
    } catch (error) {
      console.error("Error al cargar la biblioteca:", error);
    } finally {
      setLoading(false);
    }
  }, [companySlug]);

  useEffect(() => {
    if (companySlug) {
      fetchDocs();
    }
  }, [companySlug, fetchDocs]);

  // 3. FUNCIÓN PARA DISPARAR EL VISOR
  const handleOpenViewer = (id: number) => {
    setViewingDocId(id);
    setIsViewerOpen(true);
  };

  const filteredDocuments = Object.keys(groupedDocuments).reduce((acc: any, dept) => {
    const docs = (groupedDocuments as any)[dept].filter((doc: any) =>
      doc.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (docs.length > 0) {
      acc[dept] = docs;
    }
    return acc;
  }, {});

  return (
    <ContentLayout title="Biblioteca Digital">
      {/* TÍTULO Y SUBTÍTULO */}
      <div className="flex flex-col gap-2 mb-12">
        <h1 className="text-5xl font-bold text-center text-gray-900 dark:text-white">
          Biblioteca Digital
        </h1>
        <p className="text-sm italic text-muted-foreground text-center">
          Gestión de documentos técnicos y certificados de{" "}
          <span className="font-bold uppercase text-blue-600">{companySlug}</span>
        </p>
      </div>

      {/* BARRA DE CONTROLES */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button
          onClick={() => setIsModalOpen(true)}
          variant="outline"
          size="sm"
          className="w-fit flex items-center gap-1.5 rounded-lg border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-500 dark:text-blue-400 font-medium px-4 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Subir Documento
        </Button>

        <div className="relative w-full sm:w-80 group">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar documento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-10 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 outline-none focus:ring-1 focus:ring-blue-500 transition-all text-sm text-gray-800 dark:text-white shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* CONTENEDOR DE LA TABLA */}
      <div className="w-full rounded-lg border border-gray-200 p-8 shadow-md dark:border-gray-800 dark:bg-gray-900 bg-white">
        <div className="flex items-center gap-2 mb-6 border-b pb-4 dark:border-gray-800">
          <FolderOpen className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 uppercase tracking-tight">
            Documentos Organizados
          </h2>
        </div>

        <div className="overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
              <p className="text-sm text-gray-500">Cargando archivos de {companySlug}...</p>
            </div>
          ) : (
            <DocumentTable
              company={companySlug}
              groupedDocuments={filteredDocuments}
              onRefresh={fetchDocs}
              onView={handleOpenViewer} // 4. PASAR LA FUNCIÓN A LA TABLA
            />
          )}
        </div>
      </div>

      {/* MODAL DE SUBIDA */}
      <UploadModal
        company={companySlug}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchDocs}
      />

      {/* 5. EL VISOR SE RENDERIZA AQUÍ ABAJO */}
      <DocumentViewer
        company={companySlug}
        documentId={viewingDocId}
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
      />
    </ContentLayout>
  );
};

export default BibliotecaPage;