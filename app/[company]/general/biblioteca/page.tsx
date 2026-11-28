"use client";

import {
  useDeferredValue,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTourContext } from "@/components/tour/TourProvider";
import { bibliotecaPageSteps } from "@/components/tour/steps/general/biblioteca/biblioteca-page";
import useLibraryNotifications from "@/hooks/notifications/useLibraryNotifications";
import { createPortal } from "react-dom";
import { useParams } from "next/navigation";
import { useActionDialog } from "@/hooks/helpers/use-action-dialog";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { ActionTriggerButton } from "@/components/misc/ActionTriggerButton";
import { StripButton } from "@/components/library/StripButton";
import { ConfirmDeleteDialog } from "@/components/dialogs/shared/ConfirmDeleteDialog";
import { EmptyState } from "@/components/misc/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import LibraryToolbar, {
  type SortKey,
} from "@/components/library/LibraryToolbar";
import { useLibraryView } from "@/hooks/useLibraryView";
import { useTabParam } from "@/hooks/helpers/use-tab-param";
import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowRightLeft,
  Clock,
  Copy,
  FolderOpen,
  FolderPlus,
  Inbox,
  LayoutGrid,
  List,
  Loader2,
  Menu,
  Plus,
  SearchX,
  Star,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { useGetDepartments } from "@/hooks/ajustes/departamento/useGetDepartment";
import DocumentTable from "./DocumentTable";
import UploadModal from "./UploadModal";
import DocumentViewer from "@/components/library/SecureVisualizer";
import TraceabilityPanel from "@/components/library/HistoryPanel";
import FolderTree, {
  DepartmentFolderGroup,
} from "@/components/library/FolderTree";
import CreateFolderDialog from "@/components/library/CreateFolderDialog";
import RenameFolderDialog from "@/components/library/RenameFolderDialog";
import FolderAccessDialog from "@/components/library/FolderAccessDialog";
import SubfolderGrid from "@/components/library/SubfolderGrid";
import TrashView from "@/components/library/TrashView";
import QuickAccessNav, {
  type QuickAccess,
} from "@/components/library/QuickAccessNav";
import {
  ActionsContextMenu,
  useContextMenu,
} from "@/components/library/ActionsContextMenu";
import {
  folderActions,
  type MenuAction,
} from "@/components/library/menu-actions";
import LibraryBreadcrumb from "@/components/library/LibraryBreadcrumb";
import { fileProblem } from "@/lib/Library/upload-rules";
import { hasOpenOverlay, isInteractiveTarget } from "@/lib/Library/shortcuts";
import FolderShareDialog from "@/components/library/FolderShareDialog";
import FolderSharesDialog from "@/components/library/FolderSharesDialog";
import DeleteFolderDialog from "@/components/library/DeleteFolderDialog";
import ShareRequestsPanel from "@/components/library/ShareRequestsPanel";
import DashboardModal from "@/components/library/DashboardModal";
import MoveDocumentsDialog from "@/components/library/MoveDocumentsDialog";
import DownloadFoldersDialog from "@/components/library/DownloadFoldersDialog";
import libraryService, { FolderNode, Document } from "@/lib/libraryService";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { notifyError } from "@/lib/notify-error";
import { hasNoPreview, NO_PREVIEW_MESSAGE } from "@/lib/Library/preview";
import { departmentNameOf } from "@/lib/Library/document-info";

// Poda el árbol dejando solo las ramas que llevan a un departamento accesible:
// un padre no accesible se descarta pero sus hijos permitidos suben de nivel.
const collectAllowedDepartments = (
  dept: any,
  accessibleDepartmentIds: number[],
): any[] => {
  const children = Array.isArray(dept.descendants)
    ? dept.descendants.flatMap((child: any) =>
        collectAllowedDepartments(child, accessibleDepartmentIds),
      )
    : [];

  if (accessibleDepartmentIds.includes(Number(dept.id))) {
    return [{ ...dept, descendants: children }];
  }

  return children;
};

const expiryOf = (doc: any): string | null =>
  doc.latest_version?.expiration_date ?? doc.expiration_date ?? null;

function TreeSkeleton() {
  return (
    <div className="space-y-2 p-2">
      {[0, 1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-8" style={{ width: `${95 - i * 9}%` }} />
      ))}
    </div>
  );
}

function WorkspaceSkeleton() {
  return (
    <div className="space-y-3">
      {[0, 1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-14 w-full rounded-xl" />
      ))}
    </div>
  );
}

// Un solo colador para todas las comparaciones: `localeCompare` con opciones
// crea uno nuevo en cada llamada y ordenar cientos de títulos se notaba.
const TITLE_COLLATOR = new Intl.Collator("es", {
  numeric: true,
  sensitivity: "base",
});

const BIBLIOTECA_SECTIONS = [
  "carpetas",
  "favoritos",
  "recientes",
  "papelera",
] as const;

/** Cuántos documentos recientes se listan (el servidor recuerda hasta 50). */
const RECENTS_SHOWN = 30;

const BibliotecaPage = () => {
  const params = useParams();
  const { user } = useAuth();
  const companySlug = (params.company as string) || "transmandu";

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [mobileFolderOpen, setMobileFolderOpen] = useState(false);

  const { data: rawDepartments = [] } = useGetDepartments(companySlug);
  const [foldersMap, setFoldersMap] = useState<Record<number, FolderNode[]>>(
    {},
  );
  const [pickedDeptName, setSelectedDeptName] = useState<string | null>(null);
  const [selectedFolderPath, setSelectedFolderPath] = useState<string | null>(
    null,
  );
  const [loadingDeptIds, setLoadingDeptIds] = useState<number[]>([]);
  const [movingDocument, setMovingDocument] = useState(false);
  const [sortBy, setSortBy] = useState<SortKey>("default");
  const [view, setView] = useLibraryView();
  // Archivo del escritorio soltado sobre el panel, y si hay uno encima ahora.
  const [droppedFile, setDroppedFile] = useState<File | null>(null);
  const [isFileDragging, setIsFileDragging] = useState(false);
  const [pickedDocumentIds, setSelectedDocumentIds] = useState<number[]>([]);
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  // Documentos que se están copiando y el departamento al que pertenecen todos.
  const [copyTarget, setCopyTarget] = useState<{
    ids: number[];
    department: { id: number; name: string };
  } | null>(null);
  // Qué ocupa el panel de contenido: las carpetas, los favoritos o recientes
  // (documentos de todos los departamentos, sin carpeta) o la papelera. Se
  // puede fijar con `?tab=` desde el buscador global.
  const [section, setSection] = useTabParam(BIBLIOTECA_SECTIONS, "carpetas");

  const [isModalOpen, setIsModalOpen] = useActionDialog("subir-documento");
  const [viewingDocId, setViewingDocId] = useState<number | string | null>(
    null,
  );
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [auditTarget, setAuditTarget] = useState<number | "global" | null>(
    null,
  );
  const [shareRequestsOpen, setShareRequestsOpen] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [downloadFoldersOpen, setDownloadFoldersOpen] = useState(false);

  const [createFolderOpen, setCreateFolderOpen] =
    useActionDialog("crear-carpeta");
  const [renameTarget, setRenameTarget] = useState<{
    node: FolderNode;
    departmentId: number;
    departmentName: string;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    node: FolderNode;
    departmentId: number;
    departmentName: string;
  } | null>(null);
  const [shareFolderTarget, setShareFolderTarget] = useState<{
    node: FolderNode;
    departmentId: number;
    departmentName: string;
  } | null>(null);
  const [folderSharesOpen, setFolderSharesOpen] = useState(false);
  const [accessTarget, setAccessTarget] = useState<{
    node: FolderNode;
    departmentId: number;
    departmentName: string;
  } | null>(null);

  const canManage = useMemo(() => {
    if (!user) return false;
    const isSuperUser = user.roles?.some((role) =>
      ["SUPERUSER", "ADMIN", "ADMINISTRADOR"].includes(role.name.toUpperCase()),
    );
    const isDirector = user.employee?.some((emp: any) => {
      const cargoNombre = emp.job_title?.name || "";
      return cargoNombre.toUpperCase().includes("DIRECTOR");
    });
    return !!(isSuperUser || isDirector);
  }, [user]);

  // La papelera es de quien gestiona: la URL no salta ese permiso.
  const trashOpen = section === "papelera" && canManage;
  const quickAccess: QuickAccess | null =
    section === "favoritos"
      ? "favorites"
      : section === "recientes"
        ? "recents"
        : null;

  const isSuperUser = useMemo(() => {
    return (
      user?.roles?.some((role) =>
        ["SUPERUSER", "ADMIN", "ADMINISTRADOR"].includes(
          role.name.toUpperCase(),
        ),
      ) ?? false
    );
  }, [user]);

  const isDipDirector = useMemo(() => {
    if (isSuperUser) return true;
    if (!user) return false;
    return (
      user.employee?.some((emp: any) => {
        const isDIP = emp.department?.acronym?.toUpperCase() === "DIP";
        const isDir = emp.job_title?.name?.toUpperCase().includes("DIRECTOR");
        return isDIP && isDir;
      }) ?? false
    );
  }, [isSuperUser, user]);

  const isDirector = useMemo(() => {
    if (isSuperUser) return true;
    return (
      user?.employee?.some((emp: any) => {
        const name = emp.job_title?.name || "";
        return name.toUpperCase().includes("DIRECTOR");
      }) ?? false
    );
  }, [isSuperUser, user]);

  const canViewDashboard = isSuperUser || isDirector;

  const accessibleDepartmentIds = useMemo<number[]>(() => {
    if (!user) return [];
    return (
      user.employee
        ?.map((emp: any) => Number(emp.department?.id))
        .filter((id: number) => !Number.isNaN(id)) ?? []
    );
  }, [user]);

  const hasNestedDepartmentTree = useMemo(() => {
    return rawDepartments.some(
      (d: any) => Array.isArray(d.descendants) && d.descendants.length > 0,
    );
  }, [rawDepartments]);

  const buildFlatDepartmentTree = useCallback((departmentsList: any[]) => {
    const nodes: Record<number, any> = {};
    departmentsList.forEach((dept: any) => {
      nodes[Number(dept.id)] = {
        ...dept,
        descendants: [],
        department_parent_id: dept.department_parent_id ?? null,
      };
    });

    const roots: any[] = [];
    Object.values(nodes).forEach((node) => {
      const parentId =
        node.department_parent_id == null
          ? null
          : Number(node.department_parent_id);
      if (parentId != null && nodes[parentId]) {
        nodes[parentId].descendants = nodes[parentId].descendants || [];
        nodes[parentId].descendants.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }, []);

  const documentsQuery = useQuery({
    queryKey: ["library-documents", companySlug],
    queryFn: async () => {
      const response = await libraryService.getDocuments(companySlug);
      return {
        grouped: (response.data || {}) as Record<string, Document[]>,
        // Departamentos de los que el backend devuelve carpetas: el propio y los
        // que le comparten carpetas a este usuario.
        visibleDepartmentNames: Object.keys(response.folders || {}),
      };
    },
    enabled: !!companySlug,
  });

  const visibleDepartmentNames = useMemo(
    () => documentsQuery.data?.visibleDepartmentNames ?? [],
    [documentsQuery.data],
  );

  const departments = useMemo(() => {
    if (isSuperUser || isDipDirector) {
      return rawDepartments;
    }

    const own =
      accessibleDepartmentIds.length === 0
        ? []
        : hasNestedDepartmentTree
          ? rawDepartments.flatMap((dept: any) =>
              collectAllowedDepartments(dept, accessibleDepartmentIds),
            )
          : buildFlatDepartmentTree(rawDepartments).flatMap((dept: any) =>
              collectAllowedDepartments(dept, accessibleDepartmentIds),
            );

    // Departamentos ajenos que le comparten carpetas: aparecen aparte, sin
    // sus hijos, porque solo se ve lo compartido.
    const ownIds = new Set<number>();
    const collectIds = (list: any[]) =>
      list.forEach((d) => {
        ownIds.add(Number(d.id));
        collectIds(d.descendants ?? []);
      });
    collectIds(own);

    const shared: any[] = [];
    const collectShared = (list: any[]) =>
      list.forEach((d) => {
        if (
          visibleDepartmentNames.includes(d.name) &&
          !ownIds.has(Number(d.id))
        ) {
          shared.push({ ...d, descendants: [], department_parent_id: null });
        }
        collectShared(d.descendants ?? []);
      });
    collectShared(rawDepartments);

    return [...own, ...shared];
  }, [
    rawDepartments,
    isSuperUser,
    isDipDirector,
    accessibleDepartmentIds,
    hasNestedDepartmentTree,
    buildFlatDepartmentTree,
    visibleDepartmentNames,
  ]);

  // Con un solo departamento no hay nada que elegir: queda seleccionado de
  // entrada en vez de fijarlo con un efecto tras el primer render.
  const selectedDeptName =
    pickedDeptName ??
    (departments.length === 1 ? (departments[0].name as string) : null);

  const isMultiDept = useMemo(() => {
    return isSuperUser || departments.length > 1;
  }, [isSuperUser, departments]);

  const categoriesQuery = useQuery({
    queryKey: ["library-categories", companySlug],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `/${companySlug}/library/categories-list`,
      );
      return (response.data || []) as { id: number; name: string }[];
    },
    enabled: !!companySlug,
  });

  const pendingRequestsQuery = useQuery({
    queryKey: ["library-pending-requests", companySlug],
    queryFn: async () => {
      const res = await libraryService.getShareRequests(companySlug, {
        status: "pending",
      });
      const list = Array.isArray(res) ? res : res.data || [];
      return list.length as number;
    },
    enabled: !!companySlug,
    // Un fallo de red no debe mostrarse como "no hay solicitudes": se conserva
    // el último conteo bueno en lugar de caer a cero.
    placeholderData: (previous: number | undefined) => previous,
  });

  // El ?? crea un valor nuevo en cada render, así que se memoiza para no
  // invalidar los useMemo que dependen de estos datos.
  const groupedDocuments = useMemo(
    () => documentsQuery.data?.grouped ?? {},
    [documentsQuery.data],
  );
  const categoriesList = useMemo(
    () => categoriesQuery.data ?? [],
    [categoriesQuery.data],
  );
  const pendingRequestCount = pendingRequestsQuery.data ?? 0;

  const loading =
    documentsQuery.isPending ||
    categoriesQuery.isPending ||
    pendingRequestsQuery.isPending;

  useEffect(() => {
    if (documentsQuery.isError) {
      // dedupe: el manejador global de consultas ya avisa de fallos de red o
      // del sistema; así los dos avisos se funden en uno.
      notifyError(documentsQuery.error, {
        action: "sincronizar los documentos",
        dedupe: true,
      });
    }
  }, [documentsQuery.isError, documentsQuery.error]);

  useEffect(() => {
    if (categoriesQuery.isError) {
      notifyError(categoriesQuery.error, {
        action: "cargar las categorías",
        dedupe: true,
      });
    }
  }, [categoriesQuery.isError, categoriesQuery.error]);

  // Mismo prefijo de clave que el diálogo de enlaces: aprobar o rechazar allí
  // refresca este conteo.
  const pendingFolderSharesQuery = useQuery({
    queryKey: ["library-folder-shares", companySlug, "pending"],
    queryFn: async () => {
      const shares = await libraryService.getFolderShares(companySlug);
      return shares.filter((s) => s.status === "pending").length;
    },
    enabled: !!companySlug && isDipDirector,
    placeholderData: (previous: number | undefined) => previous,
  });
  const pendingFolderShareCount = pendingFolderSharesQuery.data ?? 0;

  const { refetch: refetchDocuments } = documentsQuery;
  const { refetch: refetchPendingRequests } = pendingRequestsQuery;

  const fetchDocs = useCallback(async () => {
    await refetchDocuments();
  }, [refetchDocuments]);

  const queryClient = useQueryClient();

  // Solicitudes de documentos y de enlaces de carpeta: lo llama también el
  // aviso en tiempo real, así los contadores y el listado se mantienen al día.
  const refreshPendingCount = useCallback(async () => {
    await Promise.all([
      refetchPendingRequests(),
      queryClient.invalidateQueries({
        queryKey: ["library-folder-shares", companySlug],
      }),
    ]);
  }, [refetchPendingRequests, queryClient, companySlug]);

  const currentDeptDocs = useMemo(() => {
    if (!selectedDeptName || !groupedDocuments[selectedDeptName]) return [];
    return groupedDocuments[selectedDeptName] as Document[];
  }, [selectedDeptName, groupedDocuments]);

  // Favoritos y recientes cruzan departamentos: salen de todo lo que el
  // usuario ve, no de la carpeta abierta.
  const quickAccessDocs = useMemo(() => {
    const all = Object.values(groupedDocuments).flat() as Document[];
    return {
      favorites: all.filter((d) => d.is_favorite),
      recents: all
        .filter((d) => d.opened_at)
        .sort((a, b) => String(b.opened_at).localeCompare(String(a.opened_at)))
        .slice(0, RECENTS_SHOWN),
    };
  }, [groupedDocuments]);

  const categoriesToDisplay = useMemo(() => {
    if (categoriesList && categoriesList.length > 0) {
      return categoriesList;
    }
    // Fallback dinámico: Extraer categorías directamente de los documentos reales cargados
    const uniqueNames = new Set<string>();
    Object.values(groupedDocuments).forEach((docs: any) => {
      if (Array.isArray(docs)) {
        docs.forEach((d: any) => {
          const name = d.category_name || d.category?.name;
          if (name) uniqueNames.add(name);
        });
      }
    });
    return Array.from(uniqueNames)
      .sort()
      .map((name, index) => ({
        id: index,
        name: name,
      }));
  }, [categoriesList, groupedDocuments]);

  // El campo responde al instante; el filtrado (que repinta la lista) va un
  // paso detrás y se descarta si se sigue escribiendo.
  const deferredSearch = useDeferredValue(searchTerm);
  const isSearching = deferredSearch.trim() !== "";

  const filteredDocs = useMemo(() => {
    let docs = quickAccess ? quickAccessDocs[quickAccess] : currentDeptDocs;

    // Buscar recorre TODO el departamento, no solo la carpeta abierta (como en
    // MEGA): cada resultado indica en qué carpeta vive.
    if (quickAccess) {
      // Sin carpetas: solo se filtra por lo que se escriba en el buscador.
      if (isSearching) {
        const term = deferredSearch.trim().toLowerCase();
        docs = docs.filter((d) => (d.title ?? "").toLowerCase().includes(term));
      }
    } else if (!isSearching) {
      // Sin carpeta elegida la vista es la raíz: filtrarla igual que "/" evita
      // que se cuelen los documentos de las subcarpetas bajo el breadcrumb.
      // `folder_paths` incluye todas las carpetas en las que aparece el
      // documento (incluida la primaria por retrocompatibilidad).
      if (!selectedFolderPath || selectedFolderPath === "/") {
        docs = docs.filter(
          (d) => !d.folder_paths?.length || d.folder_paths.includes("/"),
        );
      } else {
        docs = docs.filter((d) => d.folder_paths?.includes(selectedFolderPath));
      }
    } else {
      const term = deferredSearch.trim().toLowerCase();
      docs = docs.filter((d) => (d.title ?? "").toLowerCase().includes(term));
    }

    if (selectedCategory) {
      docs = docs.filter((d) => {
        const catName = d.category_name || (d as any).category?.name;
        return catName?.toLowerCase() === selectedCategory.toLowerCase();
      });
    }

    if (selectedStatus) {
      docs = docs.filter((d) => {
        const statusValue = (d as any).expiry_status || d.status;
        return statusValue?.toLowerCase() === selectedStatus.toLowerCase();
      });
    }

    // Por defecto manda el orden del backend (LibraryDocument::compareCorrelative);
    // las demás opciones reordenan una copia.
    if (sortBy === "default") return docs;

    const byTitle = (a: Document, b: Document) =>
      TITLE_COLLATOR.compare(a.title ?? "", b.title ?? "");
    // Sin vencimiento (permanentes) siempre al final, sea cual sea el sentido.
    const byExpiry = (a: Document, b: Document, direction: 1 | -1) => {
      const ea = expiryOf(a);
      const eb = expiryOf(b);
      if (!ea && !eb) return byTitle(a, b);
      if (!ea) return 1;
      if (!eb) return -1;
      return direction * ea.localeCompare(eb) || byTitle(a, b);
    };

    return [...docs].sort((a, b) => {
      switch (sortBy) {
        case "title-asc":
          return byTitle(a, b);
        case "title-desc":
          return byTitle(b, a);
        case "expiry-asc":
          return byExpiry(a, b, 1);
        default:
          return byExpiry(a, b, -1);
      }
    });
  }, [
    currentDeptDocs,
    quickAccess,
    quickAccessDocs,
    selectedFolderPath,
    isSearching,
    deferredSearch,
    selectedCategory,
    selectedStatus,
    sortBy,
  ]);

  // Documentos que hay directamente en cada carpeta del departamento abierto.
  const folderDocCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const doc of currentDeptDocs) {
      for (const path of doc.folder_paths ?? []) {
        counts[path] = (counts[path] ?? 0) + 1;
      }
    }
    return counts;
  }, [currentDeptDocs]);

  // Solo cuentan los documentos que se están viendo: tras buscar o filtrar,
  // una selección anterior no debe mover documentos que ya no están a la vista.
  const selectedDocumentIds = useMemo(() => {
    const visible = new Set(filteredDocs.map((d) => d.id));
    return pickedDocumentIds.filter((id) => visible.has(id));
  }, [pickedDocumentIds, filteredDocs]);

  const selectedDocumentsAllFavorite = useMemo(
    () =>
      selectedDocumentIds.length > 0 &&
      filteredDocs
        .filter((d) => selectedDocumentIds.includes(d.id))
        .every((d) => d.is_favorite),
    [selectedDocumentIds, filteredDocs],
  );

  // Espejo de foldersMap para que los callbacks lean el valor vigente sin
  // depender de él: incluirlo en sus deps los recrearía en cada carga de carpetas.
  const foldersMapRef = useRef(foldersMap);
  useEffect(() => {
    foldersMapRef.current = foldersMap;
  }, [foldersMap]);

  const handleToggleDept = useCallback(
    async (deptId: number) => {
      const existing = foldersMapRef.current[deptId];
      if (existing && existing.length > 0) return;

      setLoadingDeptIds((prev) => [...prev, deptId]);
      try {
        const res = await libraryService.getFolders(companySlug, deptId);
        setFoldersMap((prev) => ({ ...prev, [deptId]: res.folders || [] }));
      } catch (error) {
        console.error("Error al cargar carpetas:", error);
        notifyError(error, { action: "cargar las carpetas del departamento" });
      } finally {
        setLoadingDeptIds((prev) => prev.filter((id) => id !== deptId));
      }
    },
    [companySlug],
  );

  // Polling eliminado — las notificaciones llegan vía WebSocket (useLibraryNotifications)

  const departmentFolders = useMemo<DepartmentFolderGroup[]>(() => {
    const buildNode = (dept: any): DepartmentFolderGroup => ({
      departmentId: dept.id,
      departmentName: dept.name,
      folders: foldersMap[dept.id] || [],
      department_parent_id: dept.department_parent_id ?? null,
      descendants: Array.isArray(dept.descendants)
        ? dept.descendants.map(buildNode)
        : [],
    });

    const hasNestedDescendants = departments.some(
      (d: any) => Array.isArray(d.descendants) && d.descendants.length > 0,
    );
    if (hasNestedDescendants) {
      return departments.map(buildNode);
    }

    const nodes: Record<number, DepartmentFolderGroup> = {};
    departments.forEach((d: any) => {
      nodes[d.id] = {
        departmentId: d.id,
        departmentName: d.name,
        folders: foldersMap[d.id] || [],
        department_parent_id: d.department_parent_id ?? null,
        descendants: [],
      };
    });

    const roots: DepartmentFolderGroup[] = [];
    Object.values(nodes).forEach((node) => {
      const parentId = node.department_parent_id as number | null | undefined;
      if (parentId != null && nodes[parentId]) {
        nodes[parentId].descendants = nodes[parentId].descendants || [];
        nodes[parentId].descendants.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }, [departments, foldersMap]);

  const handleFolderRefresh = useCallback(
    async (deptId: number) => {
      try {
        const res = await libraryService.getFolders(companySlug, deptId);
        setFoldersMap((prev) => ({ ...prev, [deptId]: res.folders || [] }));
      } catch (error) {
        console.error("Error al refrescar carpetas:", error);
        notifyError(error, { action: "refrescar las carpetas" });
      }
    },
    [companySlug],
  );

  const handleDropDocument = useCallback(
    async (
      documentIds: number[],
      folderPath: string,
      departmentId: number,
      departmentName: string,
      // Desde el árbol se navega a la carpeta destino; al soltar sobre una tarjeta
      // del panel se queda donde está, como en un explorador de archivos.
      navigate = true,
    ) => {
      if (!departmentId) return;
      setMovingDocument(true);
      try {
        // Solo con una carpeta abierta se sabe de dónde sale cada documento: al
        // buscar o en favoritos/recientes los resultados vienen de cualquier
        // carpeta y se mueve el documento mismo, no una réplica de la abierta.
        const sourcePath =
          quickAccess || isSearching
            ? undefined
            : selectedFolderPath && selectedFolderPath !== "/"
              ? selectedFolderPath
              : "/";

        if (documentIds.length === 1) {
          await libraryService.moveDocument(
            companySlug,
            documentIds[0],
            folderPath,
            departmentId,
            sourcePath,
          );
          toast.success("Documento movido exitosamente");
        } else {
          await libraryService.moveDocumentsBatch(companySlug, {
            document_ids: documentIds,
            department_id: departmentId,
            folder_path: folderPath,
            source_folder_path: sourcePath,
          });
          toast.success(
            `${documentIds.length} documentos movidos exitosamente`,
          );
        }

        // El destino se navega y se refresca tras la mutación para que el
        // documento aparezca en la nueva carpeta y el árbol quede al día.
        if (navigate) {
          setSelectedDeptName(departmentName);
          setSelectedFolderPath(folderPath);
        }
        setSelectedDocumentIds([]);

        // Mover documentos no cambia el árbol de carpetas: solo se piden los documentos.
        await fetchDocs();
      } catch (error: any) {
        notifyError(error, { action: "mover los documentos" });
      } finally {
        setMovingDocument(false);
      }
    },
    [companySlug, selectedFolderPath, quickAccess, isSearching, fetchDocs],
  );

  const handleSelectFolder = useCallback(
    (folderPath: string, departmentName: string) => {
      setSelectedDeptName(departmentName);
      setSelectedFolderPath(folderPath);
      // Al cambiar de vista la selección anterior deja de tener sentido: se
      // limpia para no mover documentos que ya no están visibles.
      setSelectedDocumentIds([]);
      setMobileFolderOpen(false);
      setSection("carpetas");
    },
    [setSection],
  );

  const handleQuickAccess = useCallback(
    (value: QuickAccess) => {
      setSection(value === "favorites" ? "favoritos" : "recientes");
      setSelectedDocumentIds([]);
      setMobileFolderOpen(false);
    },
    [setSection],
  );

  const handleBatchMoveSuccess = useCallback(
    async (departmentId: number, folderPath: string) => {
      const target = departments.find(
        (d) => Number(d.id) === Number(departmentId),
      );

      setSelectedDocumentIds([]);
      setMoveDialogOpen(false);
      setSection("carpetas");

      // Solo hacen falta los documentos: el árbol de carpetas no cambia al
      // mover documentos, y el grupo por departamento y carpeta sale de ellos.
      await fetchDocs();

      if (target) {
        setSelectedDeptName(target.name);
        setSelectedFolderPath(folderPath);
      }
    },
    [departments, fetchDocs, setSection],
  );

  useLibraryNotifications(
    user?.id ? Number(user.id) : undefined,
    refreshPendingCount,
  );

  // Los marcadores del documento (favorito, último acceso) se cambian en la
  // caché del listado para verse al instante, sin esperar otra consulta.
  const patchDocument = useCallback(
    (id: number, patch: Partial<Document>) => {
      queryClient.setQueryData<{
        grouped: Record<string, Document[]>;
        visibleDepartmentNames: string[];
      }>(["library-documents", companySlug], (old) =>
        old
          ? {
              ...old,
              grouped: Object.fromEntries(
                Object.entries(old.grouped).map(([department, docs]) => [
                  department,
                  docs.map((d) => (d.id === id ? { ...d, ...patch } : d)),
                ]),
              ),
            }
          : old,
      );
    },
    [queryClient, companySlug],
  );

  const handleToggleFavorite = useCallback(
    async (id: number, favorite: boolean) => {
      patchDocument(id, { is_favorite: favorite });
      try {
        await libraryService.setFavorite(companySlug, id, favorite);
      } catch (error) {
        patchDocument(id, { is_favorite: !favorite });
        notifyError(error, { action: "actualizar los favoritos" });
      }
    },
    [companySlug, patchDocument],
  );

  // Acciones sobre la selección: un solo viaje al servidor por acción.
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const handleBulkFavorite = useCallback(
    async (ids: number[], favorite: boolean) => {
      ids.forEach((id) => patchDocument(id, { is_favorite: favorite }));
      try {
        await libraryService.setFavoriteBatch(companySlug, ids, favorite);
      } catch (error) {
        ids.forEach((id) => patchDocument(id, { is_favorite: !favorite }));
        notifyError(error, { action: "actualizar los favoritos" });
      }
    },
    [companySlug, patchDocument],
  );

  const docsRef = useRef<Document[]>([]);
  useEffect(() => {
    docsRef.current = filteredDocs;
  }, [filteredDocs]);

  // Estable a propósito: si dependiera de la lista, cada filtro, favorito o
  // apertura lo recrearía y repintaría TODAS las filas (que están memoizadas).
  const handleViewDocument = useCallback(
    (id: number) => {
      const doc = docsRef.current.find((d) => d.id === id);
      if (hasNoPreview((doc as any)?.file_type)) {
        toast.info(NO_PREVIEW_MESSAGE);
        return;
      }
      setViewingDocId(id);
      setIsViewerOpen(true);

      // Reciente al instante; el servidor lo anota aparte y, si falla, no importa.
      patchDocument(id, { opened_at: new Date().toISOString() });
      libraryService.markOpened(companySlug, id).catch(() => {});
    },
    [patchDocument, companySlug],
  );

  const handleDocRefresh = useCallback(async () => {
    await fetchDocs();
  }, [fetchDocs]);

  const breadcrumbText = useMemo(() => {
    if (!selectedFolderPath || selectedFolderPath === "/") return "Raíz";
    return selectedFolderPath.replace(/\//g, " > ").replace(/^ > /, "");
  }, [selectedFolderPath]);

  // Mover documentos exige ser director del departamento destino (o
  // administrador): los departamentos ajenos que solo comparten carpetas no se
  // ofrecen, porque el servidor los rechazaría.
  const moveTargetDepartments = useMemo(
    () =>
      departments
        .filter(
          (d) => isSuperUser || accessibleDepartmentIds.includes(Number(d.id)),
        )
        .map((d) => ({ id: Number(d.id), name: d.name as string })),
    [departments, isSuperUser, accessibleDepartmentIds],
  );

  const currentDeptForDialog = useMemo(() => {
    if (!selectedDeptName) return null;
    return departments.find((d) => d.name === selectedDeptName) || null;
  }, [selectedDeptName, departments]);

  const currentFoldersForDialog = useMemo(() => {
    if (!selectedDeptName) return [];
    // Find in recursive departmentFolders
    const find = (
      list: DepartmentFolderGroup[],
    ): DepartmentFolderGroup | null => {
      for (const g of list) {
        if (g.departmentName === selectedDeptName) return g;
        if (g.descendants && g.descendants.length > 0) {
          const r = find(g.descendants);
          if (r) return r;
        }
      }
      return null;
    };
    const group = find(departmentFolders);
    return group?.folders || [];
  }, [selectedDeptName, departmentFolders]);

  // Carpetas que contiene la que se está viendo (o las de primer nivel en la
  // raíz) y su carpeta superior, para recorrerlas desde el panel de documentos.
  const { subfolders, parentFolderPath } = useMemo(() => {
    const atRoot = !selectedFolderPath || selectedFolderPath === "/";
    if (atRoot) {
      return { subfolders: currentFoldersForDialog, parentFolderPath: null };
    }
    const find = (nodes: FolderNode[]): FolderNode | null => {
      for (const node of nodes) {
        if (node.path === selectedFolderPath) return node;
        const found = find(node.children);
        if (found) return found;
      }
      return null;
    };
    const parent = selectedFolderPath.slice(
      0,
      selectedFolderPath.lastIndexOf("/"),
    );
    return {
      subfolders: find(currentFoldersForDialog)?.children ?? [],
      parentFolderPath: parent || "/",
    };
  }, [selectedFolderPath, currentFoldersForDialog]);

  // Scroll lock del drawer de carpetas en móvil: mientras esté abierto la
  // página de fondo no debe moverse.
  useEffect(() => {
    if (!mobileFolderOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [mobileFolderOpen]);

  // Escape cierra el panel lateral abierto. Si encima hay un diálogo, este ya
  // atendió la tecla (Radix la marca como atendida) y el panel se queda.
  const sidePanelOpen = auditTarget !== null || shareRequestsOpen;
  useEffect(() => {
    if (!sidePanelOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      setAuditTarget(null);
      setShareRequestsOpen(false);
      refreshPendingCount();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [sidePanelOpen, refreshPendingCount]);

  // «/» lleva al buscador, como en tantos exploradores y gestores web. No actúa
  // si ya se está escribiendo o si hay un diálogo, menú, visor o panel abierto.
  const overlayOpen =
    isViewerOpen ||
    auditTarget !== null ||
    shareRequestsOpen ||
    mobileFolderOpen;
  useEffect(() => {
    if (overlayOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.key !== "/" ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        event.defaultPrevented ||
        isInteractiveTarget(event.target) ||
        hasOpenOverlay()
      )
        return;

      const input = document.querySelector<HTMLInputElement>(
        '[data-tour="biblioteca-search-input"] input',
      );
      if (!input) return;
      event.preventDefault();
      input.focus();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [overlayOpen]);

  const { registerTour, unregisterTour } = useTourContext();

  useEffect(() => {
    registerTour(
      "biblioteca-principal",
      "Biblioteca Digital",
      bibliotecaPageSteps,
      { onlyVisible: true },
    );
    return () => unregisterTour("biblioteca-principal");
  }, [registerTour, unregisterTour]);

  // Estables para que el árbol (memoizado) no se repinte con cada tecla del buscador.
  const openRename = useCallback(
    (node: FolderNode, departmentId: number, departmentName: string) =>
      setRenameTarget({ node, departmentId, departmentName }),
    [],
  );
  const openDelete = useCallback(
    (node: FolderNode, departmentId: number, departmentName: string) =>
      setDeleteTarget({ node, departmentId, departmentName }),
    [],
  );
  const openAccess = useCallback(
    (node: FolderNode, departmentId: number, departmentName: string) =>
      setAccessTarget({ node, departmentId, departmentName }),
    [],
  );
  const openShare = useCallback(
    (node: FolderNode, departmentId: number, departmentName: string) =>
      setShareFolderTarget({ node, departmentId, departmentName }),
    [],
  );

  const openUpload = useCallback(() => setIsModalOpen(true), [setIsModalOpen]);
  const openGlobalHistory = useCallback(() => setAuditTarget("global"), []);
  const openShareRequests = useCallback(() => setShareRequestsOpen(true), []);
  const openFolderShares = useCallback(() => setFolderSharesOpen(true), []);
  const openDashboard = useCallback(() => setDashboardOpen(true), []);
  const openDownloadFolders = useCallback(
    () => setDownloadFoldersOpen(true),
    [],
  );

  // Mover desde el menú de un documento: si ya está en la selección se mueve
  // toda la selección; si no, solo ese documento.
  const selectedIdsRef = useRef<number[]>([]);
  useEffect(() => {
    selectedIdsRef.current = selectedDocumentIds;
  }, [selectedDocumentIds]);

  // Copiar es una réplica dentro del departamento del documento: todos los que
  // se copian deben ser de uno solo (en favoritos y recientes pueden mezclarse).
  const startCopy = useCallback(
    (ids: number[]) => {
      const names = new Set(
        docsRef.current
          .filter((d) => ids.includes(d.id))
          .map((d) => departmentNameOf(d)),
      );
      const department = moveTargetDepartments.find((d) => names.has(d.name));

      if (names.size !== 1 || !department) {
        toast.error(
          names.size > 1
            ? "Seleccione documentos de un solo departamento para copiarlos."
            : "No puede copiar documentos de ese departamento.",
        );
        return;
      }
      setCopyTarget({ ids, department });
    },
    [moveTargetDepartments],
  );

  // Desde el menú de un documento: si ya está seleccionado se copia toda la
  // selección; si no, solo ese documento.
  const handleCopyDocument = useCallback(
    (id: number) => {
      const current = selectedIdsRef.current;
      startCopy(current.includes(id) ? current : [id]);
    },
    [startCopy],
  );

  const handleMoveDocument = useCallback((id: number) => {
    setSelectedDocumentIds((current) =>
      current.includes(id) ? current : [id],
    );
    setMoveDialogOpen(true);
  }, []);

  // Menú de clic derecho de las carpetas del panel de contenido.
  const getSubfolderActions = useCallback(
    (folder: FolderNode): MenuAction[] => {
      if (!currentDeptForDialog || !selectedDeptName) return [];
      const departmentId = Number(currentDeptForDialog.id);
      return folderActions({
        node: folder,
        canManage,
        onOpen: () => handleSelectFolder(folder.path, selectedDeptName),
        onRename: () => openRename(folder, departmentId, selectedDeptName),
        onAccess: () => openAccess(folder, departmentId, selectedDeptName),
        onShare: () => openShare(folder, departmentId, selectedDeptName),
        onDelete: () => openDelete(folder, departmentId, selectedDeptName),
      });
    },
    [
      currentDeptForDialog,
      selectedDeptName,
      canManage,
      handleSelectFolder,
      openRename,
      openAccess,
      openShare,
      openDelete,
    ],
  );

  // Clic derecho en un hueco del panel de contenido: lo que se hace «aquí».
  const backgroundMenu = useContextMenu();
  const backgroundActions: MenuAction[] =
    selectedDeptName && !quickAccess
      ? [
          ...(canManage
            ? ([
                {
                  key: "upload",
                  label: "Subir documento",
                  icon: UploadCloud,
                  tone: "blue",
                  onSelect: openUpload,
                },
                {
                  key: "folder",
                  label: "Nueva carpeta",
                  icon: FolderPlus,
                  tone: "blue",
                  onSelect: () => setCreateFolderOpen(true),
                },
              ] satisfies MenuAction[])
            : []),
          {
            key: "view",
            label: view === "grid" ? "Ver como lista" : "Ver como cuadrícula",
            icon: view === "grid" ? List : LayoutGrid,
            tone: "blue",
            separatorBefore: canManage,
            onSelect: () => setView(view === "grid" ? "list" : "grid"),
          },
        ]
      : [];

  // El panel de carpetas se usa dos veces: fijo en escritorio y dentro del
  // drawer móvil.
  const folderPanelBody = (
    <>
      <div
        className="flex shrink-0 items-center justify-between gap-2 border-b bg-muted/30 px-4 py-2"
        data-tour="biblioteca-carpetas-header"
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <FolderOpen className="size-4 shrink-0 text-muted-foreground" />
          <h2 className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">
            Carpetas
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setMobileFolderOpen(false)}
          aria-label="Cerrar carpetas"
          className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-muted lg:hidden"
        >
          <X className="size-4" />
        </button>
      </div>

      <div
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2"
        data-tour="biblioteca-folder-tree"
      >
        {loading ? (
          <TreeSkeleton />
        ) : (
          <>
            <QuickAccessNav
              value={trashOpen ? null : quickAccess}
              onChange={handleQuickAccess}
              counts={{
                favorites: quickAccessDocs.favorites.length,
                recents: quickAccessDocs.recents.length,
              }}
            />
            <FolderTree
              departmentFolders={departmentFolders}
              isMultiDept={isMultiDept}
              selectedDeptName={quickAccess ? null : selectedDeptName}
              selectedFolderPath={quickAccess ? null : selectedFolderPath}
              onSelect={handleSelectFolder}
              onRename={openRename}
              onDelete={openDelete}
              onAccess={openAccess}
              onShare={openShare}
              onDropDocument={handleDropDocument}
              onToggleDept={handleToggleDept}
              loadingDeptIds={loadingDeptIds}
              canManage={canManage}
              companySlug={companySlug}
            />
          </>
        )}
      </div>

      {canManage && (
        <div className="shrink-0 border-t p-3">
          <ActionTriggerButton
            type="button"
            data-tour="biblioteca-nueva-carpeta-btn"
            onClick={() => setCreateFolderOpen(true)}
            className="w-full"
          >
            <FolderPlus className="mr-2 size-4" />
            Nueva carpeta
          </ActionTriggerButton>
        </div>
      )}
    </>
  );

  // En favoritos, recientes o la papelera no hay carpeta abierta: subir desde
  // ahí no debe caer en la última carpeta que se miró.
  const detached = !!quickAccess || trashOpen;

  const folderParam =
    selectedFolderPath && selectedFolderPath !== "/" ? selectedFolderPath : "/";

  return (
    <ContentLayout title="Biblioteca Digital">
      <div className="flex flex-col gap-6 lg:h-[calc(100dvh-8rem)]">
        <PageHeader />

        <div className="flex shrink-0 flex-col gap-2 border-b pb-4">
          <h1
            className="text-2xl font-semibold tracking-tight sm:text-3xl"
            data-tour="biblioteca-title"
          >
            Biblioteca Digital
          </h1>
          <p className="text-sm text-muted-foreground">
            Gestión de documentos técnicos y certificados de {companySlug}.
          </p>
        </div>

        <LibraryToolbar
          search={searchTerm}
          onSearchChange={setSearchTerm}
          category={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categories={categoriesToDisplay}
          status={selectedStatus}
          onStatusChange={setSelectedStatus}
          sort={sortBy}
          onSortChange={setSortBy}
          view={view}
          onViewChange={setView}
          count={
            loading || trashOpen || (!selectedDeptName && !quickAccess)
              ? undefined
              : filteredDocs.length
          }
          trashOpen={trashOpen}
          onTrash={() => {
            setSelectedDocumentIds([]);
            setSection(trashOpen ? "carpetas" : "papelera");
          }}
          canManage={canManage}
          isDipDirector={isDipDirector}
          canViewDashboard={canViewDashboard}
          pendingRequestCount={pendingRequestCount}
          pendingFolderShareCount={pendingFolderShareCount}
          onUpload={openUpload}
          onHistory={openGlobalHistory}
          onRequests={openShareRequests}
          onFolderShares={openFolderShares}
          onDashboard={openDashboard}
          onDownloadFolders={openDownloadFolders}
        />

        {/* Explorador: carpetas a la izquierda, contenido a la derecha. En
            escritorio cada columna desplaza por dentro y la página no se mueve. */}
        <div className="relative flex min-h-112 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700/60 dark:bg-slate-900/60 lg:min-h-0 lg:flex-1 lg:flex-row">
          {movingDocument && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-background/75">
              <Loader2 className="size-8 animate-spin text-primary" />
              <p className="text-sm font-medium text-muted-foreground">
                Moviendo documentos...
              </p>
            </div>
          )}

          <aside className="hidden shrink-0 flex-col border-r lg:flex lg:w-72 xl:w-80">
            {folderPanelBody}
          </aside>

          <section
            className="relative flex min-h-0 min-w-0 flex-1 flex-col"
            data-tour="biblioteca-documentos-header"
            // Arrastrar un archivo del escritorio sobre el panel lo sube a la
            // carpeta abierta. Solo cuentan los archivos (Files): mover
            // documentos de la biblioteca usa otro tipo y no se toca aquí.
            onDragOver={(e) => {
              if (
                trashOpen ||
                quickAccess ||
                !canManage ||
                !selectedDeptName ||
                !e.dataTransfer.types.includes("Files")
              )
                return;
              e.preventDefault();
              setIsFileDragging(true);
            }}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                setIsFileDragging(false);
              }
            }}
            onDrop={(e) => {
              if (!e.dataTransfer.types.includes("Files")) return;
              e.preventDefault();
              setIsFileDragging(false);
              if (trashOpen || quickAccess || !canManage || !selectedDeptName)
                return;
              const file = e.dataTransfer.files[0];
              if (!file) return;
              const problem = fileProblem(file);
              if (problem) {
                toast.error(problem);
                return;
              }
              setDroppedFile(file);
              setIsModalOpen(true);
            }}
          >
            {isFileDragging && (
              <div className="pointer-events-none absolute inset-2 z-10 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary bg-primary/5 text-primary">
                <Plus className="size-8" />
                <p className="text-sm font-semibold">
                  Suelte el archivo para subirlo a{" "}
                  {breadcrumbText === "Raíz"
                    ? selectedDeptName
                    : breadcrumbText}
                </p>
              </div>
            )}

            {trashOpen ? (
              <TrashView
                company={companySlug}
                onExit={() => setSection("carpetas")}
                onChanged={fetchDocs}
              />
            ) : (
              <>
                {/* Ruta de la carpeta abierta (o, al buscar, el alcance de la búsqueda) */}
                <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 border-b bg-muted/30 px-4 py-2">
                  <StripButton
                    icon={Menu}
                    onClick={() => setMobileFolderOpen(true)}
                    data-tour="biblioteca-carpetas-movil-btn"
                    className="lg:hidden"
                  >
                    Carpetas
                  </StripButton>

                  <div className="min-w-0 flex-1">
                    {quickAccess ? (
                      <p className="truncate text-sm text-slate-600 dark:text-slate-400">
                        <span className="font-semibold text-slate-700 dark:text-slate-200">
                          {quickAccess === "favorites"
                            ? "Favoritos"
                            : "Recientes"}
                        </span>
                        {isSearching && (
                          <> · resultados de «{deferredSearch.trim()}»</>
                        )}
                      </p>
                    ) : !selectedDeptName ? (
                      <p className="text-sm text-muted-foreground">
                        Seleccione una carpeta
                      </p>
                    ) : isSearching ? (
                      <p className="truncate text-sm text-slate-600 dark:text-slate-400">
                        Resultados de «{deferredSearch.trim()}» en todo{" "}
                        <span className="font-semibold text-slate-700 dark:text-slate-200">
                          {selectedDeptName}
                        </span>
                      </p>
                    ) : (
                      <LibraryBreadcrumb
                        departmentName={selectedDeptName}
                        path={selectedFolderPath ?? "/"}
                        onNavigate={(path) =>
                          handleSelectFolder(path, selectedDeptName)
                        }
                      />
                    )}
                  </div>
                </div>

                {selectedDocumentIds.length > 0 && canManage && (
                  <div className="flex shrink-0 items-center gap-3 border-b bg-primary/5 px-4 py-2 max-sm:px-3">
                    <span className="text-[13px] font-semibold text-primary">
                      {selectedDocumentIds.length}{" "}
                      {selectedDocumentIds.length === 1
                        ? "documento seleccionado"
                        : "documentos seleccionados"}
                    </span>
                    <StripButton
                      icon={ArrowRightLeft}
                      onClick={() => setMoveDialogOpen(true)}
                      className="ml-auto"
                    >
                      Mover a...
                    </StripButton>
                    <StripButton
                      icon={Copy}
                      onClick={() => startCopy(selectedDocumentIds)}
                    >
                      Copiar a...
                    </StripButton>
                    <StripButton
                      icon={Star}
                      onClick={() =>
                        handleBulkFavorite(
                          selectedDocumentIds,
                          !selectedDocumentsAllFavorite,
                        )
                      }
                    >
                      {selectedDocumentsAllFavorite
                        ? "Quitar favoritos"
                        : "Favoritos"}
                    </StripButton>
                    <StripButton
                      icon={Trash2}
                      danger
                      onClick={() => setBulkDeleteOpen(true)}
                    >
                      Eliminar
                    </StripButton>
                    <button
                      type="button"
                      onClick={() => setSelectedDocumentIds([])}
                      aria-label="Limpiar selección"
                      className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-muted max-sm:size-10"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                )}

                <div
                  className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain p-4 max-sm:p-3"
                  onContextMenu={
                    backgroundActions.length > 0
                      ? backgroundMenu.onContextMenu
                      : undefined
                  }
                >
                  <ActionsContextMenu
                    point={backgroundMenu.point}
                    onClose={backgroundMenu.close}
                    actions={backgroundActions}
                  />
                  {loading ? (
                    <WorkspaceSkeleton />
                  ) : (
                    <>
                      {selectedDeptName && !isSearching && !quickAccess && (
                        <SubfolderGrid
                          getActions={getSubfolderActions}
                          folders={subfolders}
                          counts={folderDocCounts}
                          parentPath={parentFolderPath}
                          onDropDocument={
                            canManage && currentDeptForDialog
                              ? (documentIds, folderPath) =>
                                  handleDropDocument(
                                    documentIds,
                                    folderPath,
                                    Number(currentDeptForDialog.id),
                                    selectedDeptName,
                                    false,
                                  )
                              : undefined
                          }
                          onOpenParent={
                            parentFolderPath
                              ? () =>
                                  handleSelectFolder(
                                    parentFolderPath,
                                    selectedDeptName,
                                  )
                              : undefined
                          }
                          onOpen={(path) =>
                            handleSelectFolder(path, selectedDeptName)
                          }
                        />
                      )}

                      {!selectedDeptName && !quickAccess ? (
                        <EmptyState
                          icon={FolderOpen}
                          title="Seleccione una carpeta"
                          description="Elija una carpeta del árbol para ver sus documentos."
                          className="flex-1 py-12"
                          action={
                            <StripButton
                              icon={FolderOpen}
                              onClick={() => setMobileFolderOpen(true)}
                              data-tour="biblioteca-empty-folder"
                              className="mt-2 lg:hidden"
                            >
                              Ver carpetas
                            </StripButton>
                          }
                        />
                      ) : filteredDocs.length === 0 ? (
                        <div
                          data-tour="biblioteca-empty-docs"
                          className="flex flex-1 items-center justify-center py-8"
                        >
                          {quickAccess &&
                          !isSearching &&
                          !selectedCategory &&
                          !selectedStatus ? (
                            <EmptyState
                              icon={quickAccess === "favorites" ? Star : Clock}
                              title={
                                quickAccess === "favorites"
                                  ? "Aún no tiene favoritos"
                                  : "Aún no ha abierto documentos"
                              }
                              description={
                                quickAccess === "favorites"
                                  ? "Marque un documento con la estrella para tenerlo siempre a mano."
                                  : "Los documentos que abra aparecerán aquí."
                              }
                            />
                          ) : isSearching ||
                            selectedCategory ||
                            selectedStatus ? (
                            <EmptyState
                              icon={SearchX}
                              title="Ningún documento coincide"
                              description="Pruebe con otro nombre o limpie los filtros."
                            />
                          ) : (
                            <EmptyState
                              icon={Inbox}
                              title="No hay documentos en esta carpeta"
                              action={
                                canManage ? (
                                  <ActionTriggerButton
                                    type="button"
                                    onClick={() => setIsModalOpen(true)}
                                    className="mt-2"
                                  >
                                    <Plus className="mr-2 size-4" />
                                    Subir aquí
                                  </ActionTriggerButton>
                                ) : undefined
                              }
                            />
                          )}
                        </div>
                      ) : (
                        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700/60 dark:bg-slate-900/60">
                          <DocumentTable
                            onMove={handleMoveDocument}
                            onCopy={handleCopyDocument}
                            company={companySlug}
                            documents={filteredDocs}
                            view={view}
                            onRefresh={handleDocRefresh}
                            onView={handleViewDocument}
                            canManage={canManage}
                            isDipDirector={isDipDirector}
                            user={user}
                            selectedIds={selectedDocumentIds}
                            onSelectionChange={setSelectedDocumentIds}
                            // Sin carpeta de referencia en favoritos y recientes: cada documento
                            // se trata en su propia carpeta (eliminar no debe confundirlo con una réplica).
                            folderPath={quickAccess ? undefined : folderParam}
                            showFolderPath={isSearching || !!quickAccess}
                            showDepartment={!!quickAccess}
                            onToggleFavorite={handleToggleFavorite}
                            shortcutsEnabled={!overlayOpen}
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      </div>

      <UploadModal
        company={companySlug}
        isOpen={isModalOpen && canManage}
        onClose={() => {
          setIsModalOpen(false);
          setDroppedFile(null);
        }}
        onSuccess={handleDocRefresh}
        initialFile={droppedFile}
        departmentId={detached ? null : (currentDeptForDialog?.id ?? null)}
        folders={detached ? [] : currentFoldersForDialog}
        currentFolderPath={
          !detached && selectedFolderPath && selectedFolderPath !== "/"
            ? selectedFolderPath
            : ""
        }
      />

      <DocumentViewer
        company={companySlug}
        documentId={viewingDocId}
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
      />

      <CreateFolderDialog
        open={createFolderOpen && canManage}
        onClose={() => setCreateFolderOpen(false)}
        company={companySlug}
        departmentId={detached ? null : (currentDeptForDialog?.id ?? null)}
        departmentName={selectedDeptName}
        departments={departments}
        folders={detached ? [] : currentFoldersForDialog}
        selectedFolderPath={detached ? null : selectedFolderPath}
        isSuperUser={isSuperUser}
        onSuccess={(deptId) => handleFolderRefresh(deptId)}
      />

      {renameTarget && (
        <RenameFolderDialog
          open={!!renameTarget}
          onClose={() => setRenameTarget(null)}
          company={companySlug}
          folderId={renameTarget.node.id}
          currentName={renameTarget.node.name}
          departmentId={renameTarget.departmentId}
          onSuccess={(newPath) => {
            const oldPath = renameTarget.node.path;
            // La carpeta abierta (o una de sus subcarpetas) cambió de ruta.
            if (
              newPath &&
              selectedDeptName === renameTarget.departmentName &&
              selectedFolderPath &&
              (selectedFolderPath === oldPath ||
                selectedFolderPath.startsWith(`${oldPath}/`))
            ) {
              setSelectedFolderPath(
                newPath + selectedFolderPath.slice(oldPath.length),
              );
            }
            return Promise.all([
              fetchDocs(),
              handleFolderRefresh(renameTarget.departmentId),
            ]);
          }}
        />
      )}

      {shareFolderTarget && (
        <FolderShareDialog
          open={!!shareFolderTarget}
          onClose={() => setShareFolderTarget(null)}
          company={companySlug}
          folderId={shareFolderTarget.node.id}
          folderName={shareFolderTarget.node.name}
          departmentId={shareFolderTarget.departmentId}
        />
      )}

      <FolderSharesDialog
        open={folderSharesOpen}
        onClose={() => setFolderSharesOpen(false)}
        company={companySlug}
        canReview={isDipDirector}
      />

      {accessTarget && (
        <FolderAccessDialog
          open={!!accessTarget}
          onClose={() => setAccessTarget(null)}
          company={companySlug}
          folderId={accessTarget.node.id}
          folderName={accessTarget.node.name}
          departmentId={accessTarget.departmentId}
          onSuccess={() =>
            Promise.all([
              fetchDocs(),
              handleFolderRefresh(accessTarget.departmentId),
            ])
          }
        />
      )}

      {deleteTarget && (
        <DeleteFolderDialog
          open={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          company={companySlug}
          folderId={deleteTarget.node.id}
          folderName={deleteTarget.node.name}
          departmentId={deleteTarget.departmentId}
          onSuccess={() => {
            const deletedPath = deleteTarget.node.path;
            // Si se estaba viendo la carpeta borrada, se vuelve a la raíz.
            if (
              selectedDeptName === deleteTarget.departmentName &&
              selectedFolderPath &&
              (selectedFolderPath === deletedPath ||
                selectedFolderPath.startsWith(`${deletedPath}/`))
            ) {
              setSelectedFolderPath("/");
            }
            return handleFolderRefresh(deleteTarget.departmentId);
          }}
        />
      )}

      {auditTarget &&
        createPortal(
          <div className="fixed inset-0 z-100 flex justify-end overflow-hidden">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setAuditTarget(null)}
            />
            <div className="relative z-10 h-full">
              <TraceabilityPanel
                documentId={auditTarget === "global" ? null : auditTarget}
                company={companySlug}
                onClose={() => setAuditTarget(null)}
              />
            </div>
          </div>,
          document.body,
        )}

      {shareRequestsOpen &&
        createPortal(
          <div className="fixed inset-0 z-100 flex justify-end overflow-hidden">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setShareRequestsOpen(false)}
            />
            <div className="relative z-10 h-full">
              <ShareRequestsPanel
                company={companySlug}
                onClose={() => {
                  setShareRequestsOpen(false);
                  refreshPendingCount();
                }}
                onRefresh={refreshPendingCount}
              />
            </div>
          </div>,
          document.body,
        )}

      {/* Drawer de carpetas en móvil: al body, porque el layout crea su propio
          contexto de apilamiento y por dentro quedaría bajo la barra y el menú. */}
      {mobileFolderOpen &&
        createPortal(
          <div className="lg:hidden">
            <button
              type="button"
              aria-label="Cerrar carpetas"
              onClick={() => setMobileFolderOpen(false)}
              className="fixed inset-0 z-40 bg-black/40"
            />
            <div className="fixed inset-y-0 left-0 z-50 flex w-[85vw] max-w-xs flex-col border-r border-border/50 bg-background shadow-2xl motion-safe:animate-item-in">
              {folderPanelBody}
            </div>
          </div>,
          document.body,
        )}

      <DashboardModal
        open={dashboardOpen}
        onClose={() => setDashboardOpen(false)}
        company={companySlug}
      />

      <DownloadFoldersDialog
        open={downloadFoldersOpen}
        onClose={() => setDownloadFoldersOpen(false)}
        company={companySlug}
        departmentFolders={departmentFolders}
        documentsByDepartment={groupedDocuments}
        onLoadFolders={handleToggleDept}
        loadingDepartmentIds={loadingDeptIds}
      />

      <MoveDocumentsDialog
        key="copy"
        mode="copy"
        open={!!copyTarget}
        onClose={() => setCopyTarget(null)}
        company={companySlug}
        documentIds={copyTarget?.ids ?? []}
        departmentFolders={departmentFolders}
        departments={copyTarget ? [copyTarget.department] : []}
        onLoadFolders={handleToggleDept}
        loadingDepartmentIds={loadingDeptIds}
        onSuccess={async () => {
          setSelectedDocumentIds([]);
          await fetchDocs();
        }}
      />

      <ConfirmDeleteDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        title="Eliminar documentos"
        entityName={`${selectedDocumentIds.length} ${selectedDocumentIds.length === 1 ? "documento" : "documentos"}`}
        confirmLabel="Enviar a la papelera"
        warning="Van a la papelera: dejan de verse y sus enlaces dejan de funcionar, pero se pueden restaurar durante 30 días. Las réplicas de esta carpeta solo se quitan de ella."
        onConfirm={async () => {
          try {
            await libraryService.trashDocuments(
              companySlug,
              selectedDocumentIds,
              // La carpeta de origen decide si una réplica solo se quita de ella;
              // fuera de una carpeta (búsqueda, accesos rápidos) se elimina el documento.
              detached || isSearching ? undefined : (selectedFolderPath ?? "/"),
            );
            toast.success("Documentos enviados a la papelera");
            setSelectedDocumentIds([]);
            await fetchDocs();
          } catch (error) {
            notifyError(error, { action: "eliminar los documentos" });
            throw error;
          }
        }}
      />

      <MoveDocumentsDialog
        open={moveDialogOpen}
        onClose={() => setMoveDialogOpen(false)}
        company={companySlug}
        documentIds={selectedDocumentIds}
        departmentFolders={departmentFolders}
        departments={moveTargetDepartments}
        onLoadFolders={handleToggleDept}
        loadingDepartmentIds={loadingDeptIds}
        onSuccess={handleBatchMoveSuccess}
        sourceFolderPath={
          selectedFolderPath && selectedFolderPath !== "/"
            ? selectedFolderPath
            : "/"
        }
      />
    </ContentLayout>
  );
};

export default BibliotecaPage;
