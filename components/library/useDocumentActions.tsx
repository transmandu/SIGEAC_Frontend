"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  ArrowRightLeft,
  Copy,
  Download,
  Eye,
  History,
  Lock,
  Pencil,
  Star,
  Share2,
  Trash2,
  UploadCloud,
} from "lucide-react";
import type { MenuAction } from "@/components/library/menu-actions";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios";
import { notifyError } from "@/lib/notify-error";
import libraryService from "@/lib/libraryService";
import {
  extensionOf,
  hasNoPreview,
  NO_PREVIEW_MESSAGE,
} from "@/lib/Library/preview";
import SecureViewer from "@/components/library/SecureVisualizer";
import { HistoryPanel } from "@/components/library/VersionPanel";
import ShareDialog from "@/components/library/ShareDialog";
import { DeleteDocumentDialog } from "@/components/library/DeleteDocumentDialog";
import { RenameDocumentDialog } from "@/components/library/RenameDocumentDialog";
import { UploadVersionDialog } from "@/components/library/UploadVersionDialog";
import { DownloadDocumentDialog } from "@/components/library/DownloadDocumentDialog";
import DocumentAccessDialog from "@/components/library/DocumentAccessDialog";

export type DocumentAction = MenuAction;

interface Role {
  name: string;
}

interface Employee {
  job_title?: { name?: string };
  position?: string;
  department_id?: number;
  department?: { id?: number; acronym?: string | null } | null;
}

interface User {
  roles?: Role[];
  employee?: Employee | Employee[] | null;
}

interface UseDocumentActionsProps {
  company: string;
  doc: any;
  user: User | null;
  canManage: boolean;
  isDipDirector: boolean;
  onView: (id: number) => void;
  onRefresh: () => Promise<void>;
  /** Carpeta actual: permite borrar solo la réplica en lugar del documento completo. */
  folderPath?: string;
  /** Mueve este documento (o la selección donde esté incluido) a otra carpeta. */
  onMove?: (id: number) => void;
  /** Copia este documento (o la selección donde esté incluido) a otra carpeta. */
  onCopy?: (id: number) => void;
  /** Marca o desmarca el documento como favorito del usuario. */
  onToggleFavorite?: (id: number, favorite: boolean) => void;
}

/**
 * Monta su contenido la primera vez que se abre y lo conserva después (así la
 * animación de cierre funciona). Cada documento tiene seis diálogos y un
 * visor: montarlos todos aunque nunca se abran hacía lenta la lista.
 */
function LazyMount({ open, children }: { open: boolean; children: ReactNode }) {
  const [everOpened, setEverOpened] = useState(open);
  if (open && !everOpened) setEverOpened(true);

  return everOpened ? <>{children}</> : null;
}

/**
 * Qué se puede hacer con un documento y los diálogos que esas acciones abren.
 *
 * Es la única definición: el menú «⋯» de la lista y de la cuadrícula la
 * consumen igual, y el menú de clic derecho, el teclado y lo que se añada
 * después se alimentan de `actions` sin duplicar permisos ni diálogos. Quien lo
 * use debe pintar `dialogs` una vez, junto al documento.
 */
export function useDocumentActions({
  company,
  doc,
  user,
  canManage,
  isDipDirector,
  onView,
  onRefresh,
  folderPath,
  onMove,
  onCopy,
  onToggleFavorite,
}: UseDocumentActionsProps) {
  // Ningún diálogo se monta hasta que se abre el primero: con cientos de
  // documentos, siete envoltorios por documento pesaban sin hacer nada.
  const [dialogsMounted, setDialogsMounted] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [accessOpen, setAccessOpen] = useState(false);

  const [selectedVersionId, setSelectedVersionId] = useState<number | null>(
    null,
  );
  const [versionList, setVersionList] = useState<any[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);

  // Las mismas reglas que aplica el servidor, documento por documento:
  // descargar = administrador, Director DIP (toda la biblioteca) o Director del
  // departamento del documento; modificarlo (renombrar, versionar, mover,
  // copiar) = administrador o Director de SU departamento. Un director de otro
  // departamento no ve acciones que el servidor le rechazaría con un 403.
  const { canDownload, ownsDocument } = useMemo(() => {
    if (!user || !doc) return { canDownload: false, ownsDocument: false };

    const isSuperUser = user.roles?.some((role) =>
      ["SUPERUSER", "ADMIN", "ADMINISTRADOR"].includes(role.name.toUpperCase()),
    );
    if (isSuperUser) return { canDownload: true, ownsDocument: true };

    const employeeData = user.employee;
    const employees: Employee[] = Array.isArray(employeeData)
      ? employeeData
      : employeeData
        ? [employeeData]
        : [];
    const docDepartmentId = Number(doc.department?.id ?? doc.department_id);

    let download = false;
    let owns = false;

    for (const emp of employees) {
      const title =
        `${emp.job_title?.name ?? ""} ${emp.position ?? ""}`.toUpperCase();
      if (!title.includes("DIRECTOR")) continue;

      const isDip = emp.department?.acronym?.toUpperCase() === "DIP";
      const ownDepartmentId = Number(emp.department?.id ?? emp.department_id);
      const sameDepartment =
        !!docDepartmentId && ownDepartmentId === docDepartmentId;

      if (isDip || sameDepartment) download = true;
      if (sameDepartment) owns = true;
    }

    return { canDownload: download, ownsDocument: owns };
  }, [doc, user]);

  const canModify = canManage && ownsDocument;
  const canShareOrDelete = canManage && (ownsDocument || isDipDirector);

  const openDialog = (open: (value: boolean) => void) => () => {
    setDialogsMounted(true);
    open(true);
  };

  const handleRestoreVersion = async (versionId: number) => {
    try {
      const result = await libraryService.restoreVersion(company, versionId);
      toast.success(result.message || "Versión restaurada");
    } catch (error) {
      notifyError(error, { action: "restaurar la versión" });
      throw error;
    }

    // Lista nueva (la restaurada es ahora la primera) y documentos al día.
    try {
      const response = await axiosInstance.get(
        `/${company}/library/documents/${doc.id}/versions`,
      );
      const versions = response.data?.data?.versions;
      setVersionList(Array.isArray(versions) ? versions : []);
    } catch (error) {
      notifyError(error, { action: "actualizar el historial" });
    }
    await onRefresh();
  };

  const fetchVersions = async () => {
    setLoadingVersions(true);
    try {
      const response = await axiosInstance.get(
        `/${company}/library/documents/${doc.id}/versions`,
      );
      const versions = response.data?.data?.versions;
      setVersionList(Array.isArray(versions) ? versions : []);
      setDialogsMounted(true);
      setHistoryOpen(true);
    } catch (error) {
      console.error("Error al cargar versiones:", error);
      notifyError(error, { action: "cargar versiones" });
    } finally {
      setLoadingVersions(false);
    }
  };

  const viewOldVersion = (versionId: number) => {
    const version = versionList.find((v) => v.id === versionId);
    if (hasNoPreview(extensionOf(version?.file_path))) {
      toast.info(NO_PREVIEW_MESSAGE);
      return;
    }
    setSelectedVersionId(versionId);
    setViewerOpen(true);
  };

  const actions: DocumentAction[] = [
    {
      key: "view",
      label: "Ver documento",
      icon: Eye,
      tone: "blue",
      tour: "biblioteca-doc-view-btn",
      onSelect: () => onView(doc.id),
    },
    ...(onToggleFavorite
      ? [
          {
            key: "favorite",
            label: doc.is_favorite
              ? "Quitar de favoritos"
              : "Añadir a favoritos",
            icon: Star,
            tone: "amber",
            onSelect: () => onToggleFavorite(doc.id, !doc.is_favorite),
          } satisfies DocumentAction,
        ]
      : []),
    ...(canModify
      ? [
          {
            key: "rename",
            label: "Renombrar",
            icon: Pencil,
            tone: "blue",
            onSelect: openDialog(setRenameOpen),
          } satisfies DocumentAction,
        ]
      : []),
    ...(canShareOrDelete
      ? [
          {
            key: "share",
            label: "Compartir",
            icon: Share2,
            tone: "blue",
            tour: "biblioteca-share-btn",
            onSelect: openDialog(setShareOpen),
          } satisfies DocumentAction,
        ]
      : []),
    ...(canModify
      ? [
          {
            key: "upload-version",
            label: "Subir nueva versión",
            icon: UploadCloud,
            tone: "blue",
            tour: "biblioteca-upload-version-btn",
            onSelect: openDialog(setUploadOpen),
          } satisfies DocumentAction,
          ...(onMove
            ? [
                {
                  key: "move",
                  label: "Mover a...",
                  icon: ArrowRightLeft,
                  tone: "blue",
                  onSelect: () => onMove(doc.id),
                } satisfies DocumentAction,
              ]
            : []),
        ]
      : []),
    ...(canModify
      ? [
          {
            key: "access",
            label: "Gestionar acceso",
            icon: Lock,
            tone: "amber",
            onSelect: openDialog(setAccessOpen),
          } satisfies DocumentAction,
        ]
      : []),
    ...(canModify && onCopy
      ? [
          {
            key: "copy",
            label: "Copiar a...",
            icon: Copy,
            tone: "blue",
            onSelect: () => onCopy(doc.id),
          } satisfies DocumentAction,
        ]
      : []),
    ...(canDownload
      ? [
          {
            key: "download",
            label: "Descargar",
            icon: Download,
            tone: "emerald",
            tour: "biblioteca-download-btn",
            onSelect: openDialog(setDownloadOpen),
          } satisfies DocumentAction,
        ]
      : []),
    {
      key: "versions",
      label: "Historial de versiones",
      icon: History,
      tone: "blue",
      tour: "biblioteca-version-history-btn",
      onSelect: () => void fetchVersions(),
    },
    ...(canShareOrDelete
      ? [
          {
            key: "delete",
            label: "Eliminar",
            icon: Trash2,
            tone: "red",
            tour: "biblioteca-delete-doc-btn",
            separatorBefore: true,
            onSelect: openDialog(setDeleteOpen),
          } satisfies DocumentAction,
        ]
      : []),
  ];

  const dialogs = dialogsMounted ? (
    <>
      <LazyMount open={downloadOpen}>
        <DownloadDocumentDialog
          isOpen={downloadOpen}
          onClose={() => setDownloadOpen(false)}
          doc={doc}
          company={company}
        />
      </LazyMount>

      <LazyMount open={historyOpen}>
        <HistoryPanel
          isOpen={historyOpen}
          onClose={() => setHistoryOpen(false)}
          versions={versionList}
          docTitle={doc.title}
          onViewVersion={viewOldVersion}
          onRestoreVersion={canShareOrDelete ? handleRestoreVersion : undefined}
        />
      </LazyMount>

      <LazyMount open={accessOpen}>
        <DocumentAccessDialog
          open={accessOpen}
          onClose={() => setAccessOpen(false)}
          company={company}
          documentId={doc.id}
          documentTitle={doc.title}
          onSuccess={onRefresh}
        />
      </LazyMount>

      <LazyMount open={shareOpen}>
        <ShareDialog
          isOpen={shareOpen}
          onClose={() => setShareOpen(false)}
          doc={doc}
          company={company}
          isDipDirector={isDipDirector}
        />
      </LazyMount>

      <LazyMount open={renameOpen}>
        <RenameDocumentDialog
          isOpen={renameOpen}
          onClose={() => setRenameOpen(false)}
          doc={doc}
          company={company}
          onSuccess={onRefresh}
        />
      </LazyMount>

      <LazyMount open={deleteOpen}>
        <DeleteDocumentDialog
          isOpen={deleteOpen}
          onClose={() => setDeleteOpen(false)}
          doc={doc}
          company={company}
          onSuccess={onRefresh}
          folderPath={folderPath}
        />
      </LazyMount>

      <LazyMount open={uploadOpen}>
        <UploadVersionDialog
          isOpen={uploadOpen}
          onClose={() => setUploadOpen(false)}
          doc={doc}
          company={company}
          onSuccess={onRefresh}
        />
      </LazyMount>

      <LazyMount open={viewerOpen}>
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
      </LazyMount>
    </>
  ) : null;

  return { actions, dialogs, loadingVersions };
}
