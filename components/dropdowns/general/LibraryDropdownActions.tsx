'use client';

import { useState, useMemo, useEffect } from "react";
import { useParams } from "next/navigation";
import { MoreVertical, Trash2, QrCode, History, UploadCloud, Download, Send } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";

import SecureViewer from "@/components/library/SecureVisualizer";
import { HistoryPanel } from "@/components/library/VersionPanel";
import { ShareQRDialog } from "@/components/library/ShareQRDialog";
import RequestShareDialog from "@/components/library/RequestShareDialog";
import { DeleteDocumentDialog } from "@/components/library/DeleteDocumentDialog";
import { UploadVersionDialog } from "@/components/library/UploadVersionDialog";
import { DownloadDocumentDialog } from "@/components/library/DownloadDocumentDialog";

interface Role {
  id: number;
  name: string;
}

interface JobTitle {
  id: number;
  name: string;
}

interface Employee {
  id?: number;
  job_title?: JobTitle;
  position?: string;
  department_id?: number;
}

interface User {
  id?: number;
  roles?: Role[];
  employee?: Employee | Employee[] | null;
}

interface Props {
  doc: any;
  user: User | null;
  canManage: boolean;
  isDipDirector: boolean;
  onDelete: (id: number | string) => Promise<void>;
  onRefresh: () => Promise<void>;
}

export const LibraryDropdownActions = ({ doc, user, canManage, isDipDirector, onDelete, onRefresh }: Props) => {
  const params = useParams();
  const company = params.company as string;

  const [viewerOpen, setViewerOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [requestShareOpen, setRequestShareOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);

  const [selectedVersionId, setSelectedVersionId] = useState<number | null>(null);
  const [versionList, setVersionList] = useState<any[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);

  const canDownload = useMemo(() => {
    if (!user || !doc) return false;
    const docDeptName = doc.department?.name?.toUpperCase() || "";
    const isSmsDoc = docDeptName.includes("SEGURIDAD OPERACIONAL") || docDeptName.includes("SMS");
    if (!isSmsDoc) return false;

    const isSuperUser = user.roles?.some((role: Role) =>
      ['SUPERUSER', 'ADMIN', 'ADMINISTRADOR'].includes(role.name.toUpperCase())
    );
    if (isSuperUser) return true;

    const employeeData = user.employee;
    let isDirector = false;
    const checkJobTitle = (emp: Employee) => {
      const nameFromJob = emp.job_title?.name?.toUpperCase() || "";
      const nameFromPosition = emp.position?.toUpperCase() || "";
      return nameFromJob.includes('DIRECTOR') || nameFromPosition.includes('DIRECTOR');
    };
    if (Array.isArray(employeeData)) {
      isDirector = employeeData.some(emp => checkJobTitle(emp));
    } else if (employeeData) {
      isDirector = checkJobTitle(employeeData);
    }
    return isDirector;
  }, [doc, user]);

  const handleFetchVersions = async () => {
    if (!company) return;
    setLoadingVersions(true);
    try {
      const response = await axiosInstance.get(`/${company}/library/documents/${doc.id}/versions`);
      setVersionList(response.data.data.versions || response.data.data || []);
      setHistoryOpen(true);
    } catch (error) {
      toast.error("Error al cargar versiones");
    } finally {
      setLoadingVersions(false);
    }
  };

  const handleOpenShareQR = async () => {
    if (!company) return;
    if (versionList.length === 0) {
      setLoadingVersions(true);
      try {
        const response = await axiosInstance.get(`/${company}/library/documents/${doc.id}/versions`);
        const versions = response.data.data.versions || response.data.data || [];
        setVersionList(versions);
      } catch (error) {
        toast.error("Error al cargar versiones para el QR");
      } finally {
        setLoadingVersions(false);
      }
    }
    setShareOpen(true);
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

          {canManage && isDipDirector && (
            <>
              <DropdownMenuItem onClick={handleOpenShareQR} className="gap-2 cursor-pointer">
                <QrCode className={`h-4 w-4 text-blue-500 ${loadingVersions ? 'animate-spin' : ''}`} />
                <span className="text-xs font-medium">Generar/Ver QR</span>
              </DropdownMenuItem>
              <div className="h-px bg-slate-200 dark:bg-gray-700 my-1" />
            </>
          )}

          {canManage && !isDipDirector && (
            <>
              <DropdownMenuItem onClick={() => setRequestShareOpen(true)} className="gap-2 cursor-pointer">
                <Send className="h-4 w-4 text-blue-500" />
                <span className="text-xs font-medium">Solicitar Compartición</span>
              </DropdownMenuItem>
              <div className="h-px bg-slate-200 dark:bg-gray-700 my-1" />
            </>
          )}

          {canManage && (
            <DropdownMenuItem onClick={() => setUploadOpen(true)} className="gap-2 cursor-pointer">
              <UploadCloud className="h-4 w-4 text-blue-500" />
              <span className="text-xs font-medium">Subir nueva versión</span>
            </DropdownMenuItem>
          )}

          {canDownload && (
            <DropdownMenuItem onClick={() => setDownloadOpen(true)} className="gap-2 cursor-pointer">
              <Download className="h-4 w-4 text-emerald-500" />
              <span className="text-xs font-medium">Descargar PDF</span>
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

      <DownloadDocumentDialog
        isOpen={downloadOpen}
        onClose={() => setDownloadOpen(false)}
        doc={doc}
        company={company}
      />

      <HistoryPanel
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        versions={versionList}
        docTitle={doc.title}
        onViewVersion={handleViewOldVersion}
      />

      {isDipDirector ? (
        <ShareQRDialog
          isOpen={shareOpen}
          onClose={() => setShareOpen(false)}
          doc={{ ...doc, versions: versionList }}
          company={company}
        />
      ) : (
        <RequestShareDialog
          open={requestShareOpen}
          onClose={() => setRequestShareOpen(false)}
          doc={doc}
          company={company}
        />
      )}

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
