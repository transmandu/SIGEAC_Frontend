'use client';

import { useState } from "react";
import { useParams } from "next/navigation";
import { MoreVertical, Trash2, QrCode, History, UploadCloud } from "lucide-react";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";

// Componentes refactorizados
import SecureViewer from "@/components/library/SecureVisualizer";
import { HistoryPanel } from "@/components/library/HistoryPanel";
import { ShareQRDialog } from "@/components/library/ShareQRDialog";
import { DeleteDocumentDialog } from "@/components/library/DeleteDocumentDialog";
import { UploadVersionDialog } from "@/components/library/UploadVersionDialog";

interface Props {
  doc: any;
  canManage: boolean;
  onDelete: (id: number | string) => Promise<void>;
  onRefresh: () => Promise<void>;
}

export const LibraryDropdownActions = ({ doc, canManage, onDelete, onRefresh }: Props) => {
  const params = useParams();
  const company = params.company as string;

  // 🛡️ Estados de Visibilidad
  const [viewerOpen, setViewerOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);

  // 📊 Estados de Datos
  const [selectedVersionId, setSelectedVersionId] = useState<number | null>(null);
  const [versionList, setVersionList] = useState<any[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);

  // 📜 Lógica para obtener versiones
  const handleFetchVersions = async () => {
    if (!company) return;
    setLoadingVersions(true);
    try {
      const response = await axiosInstance.get(`/${company}/library/documents/${doc.id}/versions`);
      // Ajustamos según la estructura de tu respuesta API
      setVersionList(response.data.data.versions || response.data.data || []);
      setHistoryOpen(true);
    } catch (error) {
      toast.error("Error al cargar versiones");
    } finally {
      setLoadingVersions(false);
    }
  };

  const handleViewOldVersion = (versionId: number) => {
    setSelectedVersionId(versionId);
    setViewerOpen(true);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-gray-800 rounded-lg transition-all outline-none">
            <MoreVertical className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-52 bg-white dark:bg-[#1a1c1e] border-slate-200 dark:border-gray-700 text-slate-800 dark:text-white shadow-2xl">
          
          <DropdownMenuItem onClick={() => setShareOpen(true)} className="gap-2 cursor-pointer">
            <QrCode className="h-4 w-4 text-blue-500" />
            <span className="text-xs font-medium">Generar/Ver QR</span>
          </DropdownMenuItem>

          <div className="h-px bg-slate-200 dark:bg-gray-700 my-1" />
          
          {canManage && (
            <DropdownMenuItem onClick={() => setUploadOpen(true)} className="gap-2 cursor-pointer">
              <UploadCloud className="h-4 w-4 text-blue-500" />
              <span className="text-xs font-medium">Subir nueva versión</span>
            </DropdownMenuItem>
          )}

          <DropdownMenuItem onClick={handleFetchVersions} className="gap-2 cursor-pointer">
            <History className={`h-4 w-4 text-purple-500 ${loadingVersions ? 'animate-spin' : ''}`} />
            <span className="text-xs font-medium">Historial de versiones</span>
          </DropdownMenuItem>
          
          {canManage && (
            <>
              <div className="h-px bg-slate-200 dark:bg-gray-700 my-1" />
              <DropdownMenuItem onClick={() => setDeleteOpen(true)} className="gap-2 cursor-pointer text-red-500 focus:bg-red-500/10 focus:text-red-500">
                <Trash2 className="h-4 w-4" />
                <span className="text-xs font-bold">Eliminar</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 🚀 COMPONENTES EXTRAÍDOS CON INTERFACES CORREGIDAS */}
      
      <HistoryPanel 
        isOpen={historyOpen} 
        onClose={() => setHistoryOpen(false)} 
        versions={versionList} 
        docTitle={doc.title}
        onViewVersion={handleViewOldVersion}
      />

      {/* Se agregó 'company' que faltaba */}
      <ShareQRDialog 
        isOpen={shareOpen} 
        onClose={() => setShareOpen(false)} 
        doc={doc} 
        company={company}
      />

      {/* Se cambió 'onConfirm' por 'onSuccess' y se agregó 'company' según la nueva lógica del modal de borrado gestión */}
      <DeleteDocumentDialog 
        isOpen={deleteOpen} 
        onClose={() => setDeleteOpen(false)} 
        doc={doc}
        company={company}
        onSuccess={onRefresh} 
      />

      <UploadVersionDialog 
        isOpen={uploadOpen} 
        onClose={() => setUploadOpen(false)} 
        doc={doc} 
        company={company} 
        onSuccess={onRefresh} 
      />

      <SecureViewer 
        company={company}
        documentId={selectedVersionId} 
        isOpen={viewerOpen}
        isVersionHistory={true}
        onClose={() => {
          setViewerOpen(false);
          setSelectedVersionId(null);
        }}
      />
    </>
  );
};