"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Search, 
  FolderOpen, 
  Loader2, 
  MoreVertical,
  History 
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import DocumentTable from "./data-table"; 
import UploadModal from "./UploadModal"; 
import DocumentViewer from "@/components/library/SecureVisualizer";
import libraryService from "@/lib/libraryService";

const BibliotecaPage = () => {
  const params = useParams();
  const router = useRouter();
  const companySlug = (params.company as string) || "transmandu";

  // --- ESTADOS ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [groupedDocuments, setGroupedDocuments] = useState<any>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // ESTADOS PARA EL VISOR
  const [viewingDocId, setViewingDocId] = useState<number | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  // ESTADO PARA VISIBILIDAD DE COLUMNAS
  const [columnVisibility, setColumnVisibility] = useState({
    title: true,
    expiry_date: true,
    status: true,
    actions: true,
  });

  // --- FUNCIONES ---
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

  const handleOpenViewer = (id: number) => {
    setViewingDocId(id);
    setIsViewerOpen(true);
  };

  // --- LÓGICA DE FILTRADO POR NOMBRE ---
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
        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={() => setIsModalOpen(true)}
            variant="outline"
            size="sm"
            className="w-fit flex items-center gap-1.5 rounded-lg border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-500 dark:text-blue-400 font-medium px-4 shadow-sm transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Subir Documento
          </Button>

          {/* BOTÓN DE TRAZABILIDAD - RUTA ACTUALIZADA */}
          <Button
            onClick={() => router.push(`/${companySlug}/general/biblioteca/trazabilidad`)}
            variant="outline"
            size="sm"
            className="w-fit flex items-center gap-1.5 rounded-lg border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium px-4 shadow-sm transition-all active:scale-95"
          >
            <History className="h-4 w-4" />
            Trazabilidad
          </Button>
        </div>

        {/* BUSCADOR COMPACTO */}
        <div className="flex items-center w-full sm:w-64 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus-within:ring-1 focus-within:ring-blue-500 transition-all">
          <div className="pl-3 py-2">
            <Search className="h-4 w-4 text-gray-400" />
          </div>

          <input
            type="text"
            placeholder="Buscar documento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none px-2 py-2 text-sm text-gray-800 dark:text-white placeholder:text-gray-400"
          />

          <div className="h-6 w-[1px] bg-gray-300 dark:bg-gray-600 mx-1" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 mr-1 text-gray-500"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-xl border-gray-200 dark:border-gray-800">
              <DropdownMenuLabel className="text-xs font-semibold uppercase tracking-wider text-gray-500 py-2">
                Mostrar / Ocultar
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuCheckboxItem
                checked={columnVisibility.title}
                onCheckedChange={(v) => setColumnVisibility(prev => ({ ...prev, title: !!v }))}
                className="text-sm cursor-pointer"
              >
                Título del documento
              </DropdownMenuCheckboxItem>
              
              <DropdownMenuCheckboxItem
                checked={columnVisibility.expiry_date}
                onCheckedChange={(v) => setColumnVisibility(prev => ({ ...prev, expiry_date: !!v }))}
                className="text-sm cursor-pointer"
              >
                Fecha de vencimiento
              </DropdownMenuCheckboxItem>

              <DropdownMenuCheckboxItem
                checked={columnVisibility.status}
                onCheckedChange={(v) => setColumnVisibility(prev => ({ ...prev, status: !!v }))}
                className="text-sm cursor-pointer"
              >
                Estado (Vigencia)
              </DropdownMenuCheckboxItem>

              <DropdownMenuCheckboxItem
                checked={columnVisibility.actions}
                onCheckedChange={(v) => setColumnVisibility(prev => ({ ...prev, actions: !!v }))}
                className="text-sm cursor-pointer"
              >
                Acciones
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
              onView={handleOpenViewer}
              columnVisibility={columnVisibility}
            />
          )}
        </div>
      </div>

      <UploadModal
        company={companySlug}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchDocs}
      />

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