'use client';

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Search, FolderOpen, Loader2, History } from "lucide-react";

import DocumentTable from "./DocumentTable";
import UploadModal from "./UploadModal"; 
import DocumentViewer from "@/components/library/SecureVisualizer";
import TraceabilityPanel from "@/components/library/HistoryPanel"; 
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

  const [viewingDocId, setViewingDocId] = useState<number | string | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [auditTarget, setAuditTarget] = useState<number | 'global' | null>(null);

  const [columnVisibility] = useState({
    title: true,
    expiry_date: true,
    status: true,
    actions: true,
  });

  const canManage = useMemo(() => {
    if (!user) return false;
    const isSuperUser = user.roles?.some(role => 
      ['SUPERUSER', 'ADMIN', 'ADMINISTRADOR'].includes(role.name.toUpperCase())
    );
    const isDirector = user.employee?.some((emp: any) => {
      const cargoNombre = emp.job_title?.name || "";
      return cargoNombre.toUpperCase().includes('DIRECTOR');
    });
    return !!(isSuperUser || isDirector);
  }, [user]);

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await libraryService.getDocuments(companySlug);
      setGroupedDocuments(response.data || {});
    } catch (error) {
      console.error("Error al cargar la biblioteca:", error);
      toast.error("Error al sincronizar documentos");
    } finally {
      setTimeout(() => setLoading(false), 300);
    }
  }, [companySlug]);

  const handleDeleteDocument = async (id: number) => {
    try {
      await libraryService.deleteDocument(companySlug, id); 
      toast.success("Documento eliminado correctamente");
      await fetchDocs();
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
      <div className="flex flex-col gap-y-4">
        
        {loading ? (
          <div className="flex w-full h-[600px] justify-center items-center py-20 bg-transparent animate-in fade-in duration-300">
            <Loader2 className="size-16 animate-spin text-blue-600 dark:text-white opacity-80" />
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* HEADER */}
            <div className="flex flex-col gap-2 mb-12">
              <h1 className="text-5xl font-black text-center text-slate-900 dark:text-white uppercase tracking-tighter">
                Biblioteca Digital
              </h1>
              <p className="text-[11px] font-bold tracking-[0.2em] text-slate-400 dark:text-slate-500 text-center uppercase">
                Gestión de documentos técnicos y certificados de{" "}
                <span className="text-blue-600 dark:text-blue-400">{companySlug}</span>
              </p>
            </div>

            {/* CONTROLES: Con HOVER corregido para Modo Oscuro */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                {canManage && (
                  <>
                    <Button
                      onClick={() => setIsModalOpen(true)}
                      variant="outline"
                      size="sm"
                      className="w-fit flex items-center gap-1.5 rounded-xl border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-500 dark:text-blue-400 dark:hover:bg-blue-500/10 dark:hover:text-blue-300 font-bold text-[10px] uppercase tracking-widest px-5 h-10 shadow-sm transition-all active:scale-95"
                    >
                      <Plus className="h-4 w-4" />
                      Subir Documento
                    </Button>

                    <Button
                      onClick={() => setAuditTarget('global')}
                      variant="outline"
                      size="sm"
                      className="w-fit flex items-center gap-1.5 rounded-xl border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-white font-bold text-[10px] uppercase tracking-widest px-5 h-10 shadow-sm transition-all active:scale-95"
                    >
                      <History className="h-4 w-4" />
                      Historial
                    </Button>
                  </>
                )}
              </div>

              {/* BUSCADOR */}
              <div className="flex items-center w-full sm:w-80 bg-white dark:bg-[#111214] border border-slate-300 dark:border-slate-800 rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all overflow-hidden h-10">
                <div className="pl-4">
                  <Search className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="BUSCAR DOCUMENTO..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none px-3 text-[10px] font-bold tracking-widest text-slate-700 dark:text-white placeholder:text-slate-300 uppercase"
                />
              </div>
            </div>

            {/* TABLA SECTION */}
            <div className="w-full rounded-[2rem] border border-slate-200 p-1 dark:border-slate-800 dark:bg-[#1a1c1e] bg-white shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden">
              <div className="bg-slate-50/50 dark:bg-slate-800/30 p-8 rounded-[1.8rem]">
                <div className="flex items-center gap-3 mb-8 border-b pb-6 border-slate-200 dark:border-slate-800">
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <FolderOpen className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-[0.1em]">
                    Documentos Organizados
                  </h2>
                </div>
                
                <div className="overflow-x-auto">
                  <DocumentTable
                    company={companySlug}
                    groupedDocuments={filteredDocuments}
                    onRefresh={fetchDocs}
                    onView={(id: number) => { setViewingDocId(id); setIsViewerOpen(true); }}
                    onDelete={handleDeleteDocument}
                    onAudit={(id: number) => setAuditTarget(id)}
                    columnVisibility={columnVisibility}
                    canManage={canManage}
                    user={user} 
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <UploadModal company={companySlug} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchDocs} />
      <DocumentViewer company={companySlug} documentId={viewingDocId} isOpen={isViewerOpen} onClose={() => setIsViewerOpen(false)} />

      {auditTarget && (
        <div className="fixed inset-0 z-[100] flex justify-end overflow-hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-300" onClick={() => setAuditTarget(null)} />
          <div className="relative z-10 h-full">
            <TraceabilityPanel 
              documentId={auditTarget === 'global' ? null : auditTarget} 
              company={companySlug} 
              onClose={() => setAuditTarget(null)} 
            />
          </div>
        </div>
      )}
    </ContentLayout>
  );
};

export default BibliotecaPage;