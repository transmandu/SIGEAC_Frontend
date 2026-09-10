"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  MoreVertical,
  Trash2,
  Share2,
  History,
  UploadCloud,
  Download,
  Eye,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";

import SecureViewer from "@/components/library/SecureVisualizer";
import { HistoryPanel } from "@/components/library/VersionPanel";
import ShareDialog from "@/components/library/ShareDialog";
import { DeleteDocumentDialog } from "@/components/library/DeleteDocumentDialog";
import { UploadVersionDialog } from "@/components/library/UploadVersionDialog";
import { DownloadDocumentDialog } from "@/components/library/DownloadDocumentDialog";

const iconBase =
  "size-[18px] transition-all duration-200 ease-out group-hover:scale-110";

const itemBase = `
  group
  flex items-center justify-center
  size-9
  rounded-xl
  transition-all duration-200 ease-out
  hover:bg-muted hover:shadow-sm
  active:scale-95
`;

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
  onView: (id: number) => void;
  onDelete: (id: number | string) => Promise<void>;
  onRefresh: () => Promise<void>;
}

export const LibraryDropdownActions = ({
  doc,
  user,
  canManage,
  isDipDirector,
  onView,
  onDelete,
  onRefresh,
}: Props) => {
  const params = useParams();
  const company = params.company as string;

  const [openDropdown, setOpenDropdown] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);

  const [selectedVersionId, setSelectedVersionId] = useState<number | null>(
    null,
  );
  const [versionList, setVersionList] = useState<any[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);

  const canDownload = useMemo(() => {
    if (!user || !doc) return false;
    const docDeptName = doc.department?.name?.toUpperCase() || "";
    const isSmsDoc =
      docDeptName.includes("SEGURIDAD OPERACIONAL") ||
      docDeptName.includes("SMS");
    if (!isSmsDoc) return false;

    const isSuperUser = user.roles?.some((role: Role) =>
      ["SUPERUSER", "ADMIN", "ADMINISTRADOR"].includes(role.name.toUpperCase()),
    );
    if (isSuperUser) return true;

    const employeeData = user.employee;
    let isDirector = false;
    const checkJobTitle = (emp: Employee) => {
      const nameFromJob = emp.job_title?.name?.toUpperCase() || "";
      const nameFromPosition = emp.position?.toUpperCase() || "";
      return (
        nameFromJob.includes("DIRECTOR") ||
        nameFromPosition.includes("DIRECTOR")
      );
    };
    if (Array.isArray(employeeData)) {
      isDirector = employeeData.some((emp) => checkJobTitle(emp));
    } else if (employeeData) {
      isDirector = checkJobTitle(employeeData);
    }
    return isDirector;
  }, [doc, user]);

  const handleFetchVersions = async () => {
    if (!company) return;
    setLoadingVersions(true);
    try {
      const response = await axiosInstance.get(
        `/${company}/library/documents/${doc.id}/versions`,
      );
      const versions = response.data?.data?.versions;
      setVersionList(Array.isArray(versions) ? versions : []);
      setHistoryOpen(true);
    } catch (error) {
      console.error("Error al cargar versiones:", error);
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
    <TooltipProvider delayDuration={120}>
      <DropdownMenu open={openDropdown} onOpenChange={setOpenDropdown}>
        <DropdownMenuTrigger asChild>
          <button className="p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-gray-800 rounded-lg transition-all outline-none">
            <MoreVertical className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="center"
          sideOffset={3}
          className="
            flex items-center justify-center gap-1.5
            rounded-2xl
            border border-border/50
            bg-background/90
            backdrop-blur-xl
            shadow-xl
            p-1.5
            animate-in fade-in zoom-in-95 duration-200
            overflow-visible
          "
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <span data-tour="biblioteca-doc-view-btn">
                <DropdownMenuItem asChild className="p-0 focus:bg-transparent">
                  <button
                    onClick={() => {
                      setOpenDropdown(false);
                      onView(doc.id);
                    }}
                    className={`${itemBase} text-blue-600`}
                  >
                    <Eye className={iconBase} />
                  </button>
                </DropdownMenuItem>
              </span>
            </TooltipTrigger>
            <TooltipContent>Ver documento</TooltipContent>
          </Tooltip>

          {canManage && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span data-tour="biblioteca-share-btn">
                  <DropdownMenuItem asChild className="p-0 focus:bg-transparent">
                    <button
                      onClick={() => {
                        setOpenDropdown(false);
                        setShareOpen(true);
                      }}
                      className={`${itemBase} text-blue-600`}
                    >
                      <Share2 className={iconBase} />
                    </button>
                  </DropdownMenuItem>
                </span>
              </TooltipTrigger>
              <TooltipContent>Compartir</TooltipContent>
            </Tooltip>
          )}

          {canManage && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span data-tour="biblioteca-upload-version-btn">
                  <DropdownMenuItem asChild className="p-0 focus:bg-transparent">
                    <button
                      onClick={() => {
                        setOpenDropdown(false);
                        setUploadOpen(true);
                      }}
                      className={`${itemBase} text-blue-600`}
                    >
                      <UploadCloud className={iconBase} />
                    </button>
                  </DropdownMenuItem>
                </span>
              </TooltipTrigger>
              <TooltipContent>Subir nueva versión</TooltipContent>
            </Tooltip>
          )}

          {canDownload && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span data-tour="biblioteca-download-btn">
                  <DropdownMenuItem asChild className="p-0 focus:bg-transparent">
                    <button
                      onClick={() => {
                        setOpenDropdown(false);
                        setDownloadOpen(true);
                      }}
                      className={`${itemBase} text-emerald-600`}
                    >
                      <Download className={iconBase} />
                    </button>
                  </DropdownMenuItem>
                </span>
              </TooltipTrigger>
              <TooltipContent>Descargar</TooltipContent>
            </Tooltip>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <span data-tour="biblioteca-version-history-btn">
                <DropdownMenuItem asChild className="p-0 focus:bg-transparent">
                  <button
                    onClick={handleFetchVersions}
                    className={`${itemBase} text-primary`}
                  >
                    {loadingVersions ? (
                      <Loader2 className={`${iconBase} animate-spin`} />
                    ) : (
                      <History className={iconBase} />
                    )}
                  </button>
                </DropdownMenuItem>
              </span>
            </TooltipTrigger>
            <TooltipContent>Historial de versiones</TooltipContent>
          </Tooltip>

          {canManage && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span data-tour="biblioteca-delete-doc-btn">
                  <DropdownMenuItem asChild className="p-0 focus:bg-transparent">
                    <button
                      onClick={() => {
                        setOpenDropdown(false);
                        setDeleteOpen(true);
                      }}
                      className={`${itemBase} text-red-600`}
                    >
                      <Trash2 className={iconBase} />
                    </button>
                  </DropdownMenuItem>
                </span>
              </TooltipTrigger>
              <TooltipContent>Eliminar</TooltipContent>
            </Tooltip>
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

      <ShareDialog
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        doc={doc}
        company={company}
        isDipDirector={isDipDirector}
      />

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
    </TooltipProvider>
  );
};
