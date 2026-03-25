'use client';

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Search, FolderOpen, Loader2, MoreVertical, History } from "lucide-react";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

import DocumentTable from "./DocumentTable";
import UploadModal from "./UploadModal"; 
import DocumentViewer from "@/components/library/SecureVisualizer";
import TraceabilityPanel from "@/components/library/TraceabilityPanel"; 
import libraryService from "@/lib/libraryService";
import { toast } from "sonner";

const BibliotecaPage = () => {
  const params = useParams();
  const { user } = useAuth();
  const companySlug = (params.company as string) || "transmandu";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [groupedDocuments, setGroupedDocuments] = useState<any>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const [viewingDocId, setViewingDocId] = useState<number | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const [auditTarget, setAuditTarget] = useState<number | 'global' | null>(null);

  const [columnVisibility, setColumnVisibility] = useState({
    title: true,
    expiry_date: true,
    status: true,
    actions: true,
  });

  const canManage = useMemo(() => {
    const isSuperUser = user?.roles?.some(role => role.name.toUpperCase() === 'SUPERUSER');
    const isDirector = user?.job_name === 'Director';
    return isSuperUser || isDirector;
  }, [user]);

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

  const handleDeleteDocument = async (id: number) => {
    try {
      await libraryService.deleteDocument(companySlug, id); 
      toast.success("Documento eliminado correctamente");
      fetchDocs();
    } catch (error) {
      console.error("Error al eliminar:", error);
      toast.error("No se pudo eliminar el documento");
    }
  };

  useEffect(() => {
    if (companySlug) {
      fetchDocs();
    }
  }, [companySlug, fetchDocs]);

  const filteredDocuments = Object.keys(groupedDocuments).reduce((acc: any, dept) => {
    const docs = (groupedDocuments as any)[dept].filter((doc: any) =>
      doc.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (docs.length > 0) acc[dept] = docs;
    return acc;
  }, {});

  return (
    <ContentLayout title="Biblioteca Digital">
      <div className="flex flex-col gap-2 mb-12">
        <h1 className="text-5xl font-bold text-center text-gray-900 dark:text-white uppercase tracking-tighter">
          Biblioteca Digital
        </h1>
        <p className="text-sm italic text-muted-foreground text-center">
          Gestión de documentos técnicos y certificados de{" "}
          <span className="font-bold uppercase text-blue-600">{companySlug}</span>
        </p>
      </div>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          {canManage && (
            <>
              <Button
                onClick={() => setIsModalOpen(true)}
                variant="outline"
                size="sm"
                className="w-fit flex items-center gap-1.5 rounded-lg border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-500 dark:text-blue-400 font-medium px-4 shadow-sm transition-all active:scale-95"
              >
                <Plus className="h-4 w-4" />
                Subir Documento
              </Button>

              <Button
                onClick={() => setAuditTarget('global')}
                variant="outline"
                size="sm"
                className="w-fit flex items-center gap-1.5 rounded-lg border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium px-4 shadow-sm transition-all active:scale-95"
              >
                <History className="h-4 w-4" />
                Historial
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center w-full sm:w-64 bg-white dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-lg shadow-sm focus-within:ring-1 focus-within:ring-blue-500 transition-all">
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
          <div className="h-6 w-[1px] bg-slate-300 dark:bg-gray-600 mx-1" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 mr-1 text-gray-500">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-xl border-gray-200 dark:border-gray-800">
              <DropdownMenuLabel className="text-xs font-semibold uppercase tracking-wider text-gray-500 py-2">Mostrar / Ocultar</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {Object.keys(columnVisibility).map((col) => (
                <DropdownMenuCheckboxItem
                  key={col}
                  checked={(columnVisibility as any)[col]}
                  onCheckedChange={(v) => setColumnVisibility(prev => ({ ...prev, [col]: !!v }))}
                  className="text-sm cursor-pointer capitalize"
                >
                  {col.replace('_', ' ')}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="w-full rounded-xl border border-slate-300 p-8 shadow-md dark:border-gray-800 dark:bg-gray-900 bg-slate-50/50 relative">
        <div className="flex items-center gap-2 mb-6 border-b pb-4 border-slate-300 dark:border-gray-800">
          <FolderOpen className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-black text-slate-900 dark:text-gray-200 uppercase tracking-tight">
            Documentos Organizados
          </h2>
        </div>
        <div className="overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
              <p className="text-sm text-slate-500">Cargando archivos...</p>
            </div>
          ) : (
            <DocumentTable
              company={companySlug}
              groupedDocuments={filteredDocuments}
              onRefresh={fetchDocs}
              onView={(id: number) => { setViewingDocId(id); setIsViewerOpen(true); }}
              onDelete={handleDeleteDocument}
              onAudit={(id: number) => setAuditTarget(id)}
              columnVisibility={columnVisibility}
              canManage={canManage} 
            />
          )}
        </div>
      </div>

      <UploadModal company={companySlug} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchDocs} />
      <DocumentViewer company={companySlug} documentId={viewingDocId} isOpen={isViewerOpen} onClose={() => setIsViewerOpen(false)} />

      {auditTarget && (
        <div className="fixed inset-0 z-[100] flex justify-end overflow-hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-300" onClick={() => setAuditTarget(null)} />
          <div className="relative z-10 h-full">
            <TraceabilityPanel documentId={auditTarget === 'global' ? null : auditTarget} company={companySlug} onClose={() => setAuditTarget(null)} />
          </div>
        </div>
      )}
    </ContentLayout>
  );
};

export default BibliotecaPage;