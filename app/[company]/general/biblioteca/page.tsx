'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import useLibraryNotifications from "@/hooks/notifications/useLibraryNotifications";
import { useParams } from "next/navigation";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Search, FolderOpen, Loader2, History, FolderPlus, Send, BarChart, SlidersHorizontal, X, Filter } from "lucide-react";

import DocumentTable from "./DocumentTable";
import UploadModal from "./UploadModal";
import DocumentViewer from "@/components/library/SecureVisualizer";
import TraceabilityPanel from "@/components/library/HistoryPanel";
import FolderTree, { DepartmentFolderGroup } from "@/components/library/FolderTree";
import CreateFolderDialog from "@/components/library/CreateFolderDialog";
import RenameFolderDialog from "@/components/library/RenameFolderDialog";
import DeleteFolderDialog from "@/components/library/DeleteFolderDialog";
import ShareRequestsPanel from "@/components/library/ShareRequestsPanel";
import DashboardModal from "@/components/library/DashboardModal";
import libraryService, { FolderNode, Document } from "@/lib/libraryService";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";

const BibliotecaPage = () => {
  const params = useParams();
  const { user } = useAuth();
  const companySlug = (params.company as string) || "transmandu";

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [categoriesList, setCategoriesList] = useState<{ id: number; name: string }[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
    };
    if (showFilters) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showFilters]);

  const [departments, setDepartments] = useState<{ id: number; name: string }[]>([]);
  const [departmentFolders, setDepartmentFolders] = useState<DepartmentFolderGroup[]>([]);
  const [selectedDeptName, setSelectedDeptName] = useState<string | null>(null);
  const [selectedFolderPath, setSelectedFolderPath] = useState<string | null>(null);
  const [loadingDeptIds, setLoadingDeptIds] = useState<number[]>([]);
  const [movingDocument, setMovingDocument] = useState(false);

  const [groupedDocuments, setGroupedDocuments] = useState<Record<string, Document[]>>({});

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingDocId, setViewingDocId] = useState<number | string | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [auditTarget, setAuditTarget] = useState<number | 'global' | null>(null);
  const [shareRequestsOpen, setShareRequestsOpen] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(false);

  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [pendingRequestCount, setPendingRequestCount] = useState(0);
  const [renameTarget, setRenameTarget] = useState<{ node: FolderNode; departmentId: number; departmentName: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ node: FolderNode; departmentId: number; departmentName: string } | null>(null);

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

  const isSuperUser = useMemo(() => {
    return user?.roles?.some(role =>
      ['SUPERUSER', 'ADMIN', 'ADMINISTRADOR'].includes(role.name.toUpperCase())
    ) ?? false;
  }, [user]);

  const userDeptId = useMemo(() => {
    return user?.employee?.[0]?.department?.id ?? null;
  }, [user]);

  const isDipDirector = useMemo(() => {
    if (isSuperUser) return true;
    if (!user) return false;
    return user.employee?.some((emp: any) => {
      const isDIP = emp.department?.acronym?.toUpperCase() === 'DIP';
      const isDir = emp.job_title?.name?.toUpperCase().includes('DIRECTOR');
      return isDIP && isDir;
    }) ?? false;
  }, [isSuperUser, user]);

  const isDirector = useMemo(() => {
    if (isSuperUser) return true;
    return user?.employee?.some((emp: any) => {
      const name = emp.job_title?.name || '';
      return name.toUpperCase().includes('DIRECTOR');
    }) ?? false;
  }, [isSuperUser, user]);

  const canViewDashboard = isSuperUser || isDirector;

  const isMultiDept = useMemo(() => {
    return isSuperUser || departments.length > 1;
  }, [isSuperUser, departments]);

  const currentDeptDocs = useMemo(() => {
    if (!selectedDeptName || !groupedDocuments[selectedDeptName]) return [];
    return groupedDocuments[selectedDeptName] as Document[];
  }, [selectedDeptName, groupedDocuments]);

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
    return Array.from(uniqueNames).sort().map((name, index) => ({
      id: index,
      name: name
    }));
  }, [categoriesList, groupedDocuments]);

  const filteredDocs = useMemo(() => {
    let docs = currentDeptDocs;

    if (selectedFolderPath === '/') {
      docs = docs.filter(d => !d.folder_path || d.folder_path === '/');
    } else if (selectedFolderPath) {
      docs = docs.filter(d => d.folder_path === selectedFolderPath);
    }

    if (searchTerm) {
      docs = docs.filter(d =>
        d.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      docs = docs.filter(d => {
        const catName = d.category_name || (d as any).category?.name;
        return catName?.toLowerCase() === selectedCategory.toLowerCase();
      });
    }

    if (selectedStatus) {
      docs = docs.filter(d => {
        const statusValue = (d as any).expiry_status || d.status;
        return statusValue?.toLowerCase() === selectedStatus.toLowerCase();
      });
    }

    return docs;
  }, [currentDeptDocs, selectedFolderPath, searchTerm, selectedCategory, selectedStatus]);

  const fetchDocs = useCallback(async () => {
    try {
      const response = await libraryService.getDocuments(companySlug);
      setGroupedDocuments(response.data || {});
    } catch (error) {
      console.error("Error al cargar la biblioteca:", error);
      toast.error("Error al sincronizar documentos");
    }
  }, [companySlug]);

  const fetchDepartments = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`/${companySlug}/library/departments-list`);
      let depts = response.data || [];
      if (!isSuperUser && !isDipDirector && userDeptId) {
        depts = depts.filter((d: any) => Number(d.id) === Number(userDeptId));
      }
      setDepartments(depts);
      if (depts.length === 1) {
        setSelectedDeptName(prev => prev ?? depts[0].name);
      }
    } catch (error) {
      console.error("Error al cargar departamentos:", error);
    }
  }, [companySlug, isSuperUser, userDeptId, isDipDirector]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`/${companySlug}/library/categories-list`);
      setCategoriesList(response.data || []);
    } catch (error) {
      console.error("Error al cargar categorías:", error);
    }
  }, [companySlug]);

  const refreshPendingCount = useCallback(async () => {
    try {
      const res = await libraryService.getShareRequests(companySlug, { status: 'pending' });
      const list = Array.isArray(res) ? res : res.data || [];
      setPendingRequestCount(list.length);
    } catch {
      setPendingRequestCount(0);
    }
  }, [companySlug]);

  const initialLoad = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      fetchDocs(),
      fetchDepartments(),
      fetchCategories(),
    ]);
    refreshPendingCount();
    setLoading(false);
  }, [fetchDocs, fetchDepartments, fetchCategories, refreshPendingCount]);

  const deptFoldersRef = useRef(departmentFolders);
  deptFoldersRef.current = departmentFolders;

  const handleToggleDept = useCallback(async (deptId: number) => {
    const existing = deptFoldersRef.current.find(g => g.departmentId === deptId);
    if (existing && existing.folders.length > 0) return;

    setLoadingDeptIds(prev => [...prev, deptId]);
    try {
      const res = await libraryService.getFolders(companySlug, deptId);
      setDepartmentFolders(prev => prev.map(g =>
        g.departmentId === deptId
          ? { ...g, folders: res.folders || [] }
          : g
      ));
    } catch (error) {
      console.error("Error al cargar carpetas:", error);
    } finally {
      setLoadingDeptIds(prev => prev.filter(id => id !== deptId));
    }
  }, [companySlug]);

  useEffect(() => {
    if (companySlug) {
      initialLoad();
    }
  }, [companySlug, initialLoad]);

  // Polling eliminado — las notificaciones llegan vía WebSocket (useLibraryNotifications)

  useEffect(() => {
    setDepartmentFolders(prev => {
      const prevMap = new Map(prev.map(g => [g.departmentId, g]));
      return departments.map(d => prevMap.get(d.id) || {
        departmentId: d.id,
        departmentName: d.name,
        folders: [],
      });
    });
  }, [departments]);

  const handleDeleteDocument = async (id: number | string) => {
    try {
      await libraryService.deleteDocument(companySlug, id);
      toast.success("Documento eliminado correctamente");
      await fetchDocs();
    } catch (error) {
      console.error("Error al eliminar:", error);
      toast.error("No se pudo eliminar el documento");
    }
  };

  const handleDropDocument = async (documentId: number, folderPath: string, departmentName: string) => {
    setMovingDocument(true);
    try {
      await libraryService.moveDocument(companySlug, documentId, folderPath);
      toast.success("Documento movido exitosamente");
      setSelectedDeptName(departmentName);
      setSelectedFolderPath(folderPath);
      await Promise.all([fetchDocs(), handleToggleDept(
        departments.find(d => d.name === departmentName)?.id ?? 0
      )]);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al mover el documento");
    } finally {
      setMovingDocument(false);
    }
  };

  const handleSelectFolder = (folderPath: string, departmentName: string) => {
    setSelectedDeptName(departmentName);
    setSelectedFolderPath(folderPath);
  };

  const handleFolderRefresh = useCallback(async (deptId: number) => {
    try {
      const res = await libraryService.getFolders(companySlug, deptId);
      setDepartmentFolders(prev => prev.map(g =>
        g.departmentId === deptId
          ? { ...g, folders: res.folders || [] }
          : g
      ));
    } catch (error) {
      console.error("Error al refrescar carpetas:", error);
    }
  }, [companySlug]);

  useLibraryNotifications(user?.id ? Number(user.id) : undefined, refreshPendingCount);

  const handleDocRefresh = useCallback(async () => {
    await fetchDocs();
  }, [fetchDocs]);

  const breadcrumbText = useMemo(() => {
    if (!selectedFolderPath || selectedFolderPath === '/') return 'Raíz';
    return selectedFolderPath.replace(/\//g, ' > ').replace(/^ > /, '');
  }, [selectedFolderPath]);

  const currentDeptForDialog = useMemo(() => {
    if (!selectedDeptName) return null;
    return departments.find(d => d.name === selectedDeptName) || null;
  }, [selectedDeptName, departments]);

  const currentFoldersForDialog = useMemo(() => {
    if (!selectedDeptName) return [];
    const group = departmentFolders.find(g => g.departmentName === selectedDeptName);
    return group?.folders || [];
  }, [selectedDeptName, departmentFolders]);

  return (
    <ContentLayout title="Biblioteca Digital">
      <div className="flex flex-col gap-y-4">
        {loading ? (
          <div className="w-full rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1a1c1e] shadow-xl animate-pulse overflow-hidden">
            <div className="flex min-h-[400px]">
              <div className="w-[380px] shrink-0 border-r border-slate-200 dark:border-slate-800 p-5">
                <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded mb-3" style={{ width: `${60 + i * 8}%` }} />
                ))}
              </div>
              <div className="flex-1 p-8">
                <div className="h-5 w-40 bg-slate-200 dark:bg-slate-700 rounded mb-6" />
                {[1,2,3].map(i => (
                  <div key={i} className="h-12 w-full bg-slate-200 dark:bg-slate-700 rounded mb-3" />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* HEADER */}
            <div className="flex flex-col gap-2 mb-8">
              <h1 className="text-5xl font-black text-center text-slate-900 dark:text-white uppercase tracking-tighter">
                Biblioteca Digital
              </h1>
              <p className="text-[11px] font-bold tracking-[0.2em] text-slate-400 dark:text-slate-500 text-center uppercase">
                Gestión de documentos técnicos y certificados de{" "}
                <span className="text-blue-600 dark:text-blue-400">{companySlug}</span>
              </p>
            </div>

            {/* CONTROLES */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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

                    {isDipDirector && (
                      <Button
                        onClick={() => { setShareRequestsOpen(true); setPendingRequestCount(0); }}
                        variant="outline"
                        size="sm"
                        className="w-fit flex items-center gap-1.5 rounded-xl border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-white font-bold text-[10px] uppercase tracking-widest px-5 h-10 shadow-sm transition-all active:scale-95"
                      >
                        <Send className="h-4 w-4" />
                        Solicitudes
                        {pendingRequestCount > 0 && (
                          <span className="ml-1 px-1.5 py-0.5 text-[9px] font-bold text-white bg-red-500 rounded-full min-w-[18px] text-center leading-none">
                            {pendingRequestCount > 99 ? '99+' : pendingRequestCount}
                          </span>
                        )}
                      </Button>
                    )}

                    {canViewDashboard && (
                      <Button
                        onClick={() => setDashboardOpen(true)}
                        variant="outline"
                        size="sm"
                        className="w-fit flex items-center gap-1.5 rounded-xl border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-white font-bold text-[10px] uppercase tracking-widest px-5 h-10 shadow-sm transition-all active:scale-95"
                      >
                        <BarChart className="h-4 w-4" />
                        Dashboard
                      </Button>
                    )}
                  </>
                )}
              </div>

              {/* BUSCADOR CON POPOVER DE FILTROS */}
              <div className="relative flex items-center w-full sm:w-80" ref={popoverRef}>
                <div className="flex items-center w-full bg-white dark:bg-[#111214] border border-slate-300 dark:border-slate-800 rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all overflow-hidden h-10">
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
                  {/* Botón de filtro con indicador */}
                  <button
                    type="button"
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center justify-center h-full px-3.5 border-l border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 relative ${
                      selectedCategory || selectedStatus ? "text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10" : ""
                    }`}
                    title="Filtros avanzados"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    {(selectedCategory || selectedStatus) && (
                      <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
                    )}
                  </button>
                </div>

                {/* POPOVER DE FILTROS */}
                {showFilters && (
                  <div className="absolute right-0 top-12 z-50 w-72 p-5 bg-white dark:bg-[#1a1c1e] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-855 dark:text-white">Filtros</span>
                      {(selectedCategory || selectedStatus || searchTerm) && (
                        <button
                          onClick={() => {
                            setSelectedCategory("");
                            setSelectedStatus("");
                            setSearchTerm("");
                          }}
                          className="text-[9px] font-extrabold text-red-500 hover:text-red-600 uppercase tracking-widest transition-colors"
                        >
                          Limpiar todo
                        </button>
                      )}
                    </div>

                    <div className="space-y-4">
                      {/* Categoría Selector */}
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">Categoría</label>
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="w-full h-9 px-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-[#111214] text-slate-700 dark:text-white text-[10px] font-bold tracking-wider uppercase focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all cursor-pointer"
                        >
                          <option value="">TODAS LAS CATEGORÍAS</option>
                          {categoriesToDisplay.map(cat => (
                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Estado Selector */}
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">Estado</label>
                        <select
                          value={selectedStatus}
                          onChange={(e) => setSelectedStatus(e.target.value)}
                          className="w-full h-9 px-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-[#111214] text-slate-700 dark:text-white text-[10px] font-bold tracking-wider uppercase focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all cursor-pointer"
                        >
                          <option value="">TODOS LOS ESTADOS</option>
                          <option value="vigente">VIGENTE</option>
                          <option value="vencido">VENCIDO</option>
                          <option value="no_aplica">NO APLICA</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* TARJETA ÚNICA: SIDEBAR + CONTENIDO */}
            <div className="w-full rounded-[2rem] border border-slate-200 dark:border-slate-800 dark:bg-[#1a1c1e] bg-white shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden">
              {movingDocument && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-white/75 dark:bg-[#1a1c1e]/75 backdrop-blur-[2px]">
                  <Loader2 className="h-9 w-9 animate-spin text-blue-600 dark:text-blue-400" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                    Moviendo documento...
                  </p>
                </div>
              )}
              <div className="flex min-h-[400px]">
                {/* SIDEBAR - Carpetas */}
                <div className="w-[380px] shrink-0 border-r border-slate-200 dark:border-slate-800 p-5 pt-8 flex flex-col">
                  <div className="flex items-center gap-3 mb-6 border-b pb-6 border-slate-200 dark:border-slate-800 shrink-0">
                    <div className="p-2 bg-slate-800 dark:bg-slate-200 rounded-lg">
                      <FolderOpen className="h-5 w-5 text-white dark:text-slate-900" />
                    </div>
                    <div>
                      <h2 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-[0.1em]">
                        Carpetas
                      </h2>
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wide">
                        Organización departamental
                      </p>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto max-h-[500px] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full pr-2">
                    <FolderTree
                      departmentFolders={departmentFolders}
                      isMultiDept={isMultiDept}
                      selectedDeptName={selectedDeptName}
                      selectedFolderPath={selectedFolderPath}
                      onSelect={handleSelectFolder}
                      onRename={(node, deptId, deptName) => setRenameTarget({ node, departmentId: deptId, departmentName: deptName })}
                      onDelete={(node, deptId, deptName) => setDeleteTarget({ node, departmentId: deptId, departmentName: deptName })}
                      onDropDocument={handleDropDocument}
                      onToggleDept={handleToggleDept}
                      loadingDeptIds={loadingDeptIds}
                      canManage={canManage}
                      companySlug={companySlug}
                    />
                  </div>
                  {canManage && (
                    <button
                      onClick={() => setCreateFolderOpen(true)}
                      className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-xl transition-all active:scale-[0.98] shrink-0"
                    >
                      <FolderPlus className="h-3.5 w-3.5" />
                      Nueva Carpeta
                    </button>
                  )}
                </div>

                {/* CONTENIDO - Documentos */}
                <div className="flex-1 p-8">
                  <div className="flex items-center gap-3 mb-6 border-b pb-6 border-slate-200 dark:border-slate-800">
                    <div className="p-2 bg-blue-600 rounded-lg">
                      <FolderOpen className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-[0.1em]">
                        Documentos
                      </h2>
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wide">
                        {selectedDeptName ? `${selectedDeptName} — ${breadcrumbText}` : 'Selecciona una carpeta'}
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    {!selectedDeptName ? (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <FolderOpen className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
                        <p className="text-sm font-bold text-slate-400 dark:text-slate-500">
                          Selecciona una carpeta del árbol para ver sus documentos
                        </p>
                      </div>
                    ) : filteredDocs.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <FolderOpen className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
                        <p className="text-sm font-bold text-slate-400 dark:text-slate-500">
                          No hay documentos en esta carpeta
                        </p>
                        {canManage && (
                          <Button
                            onClick={() => setIsModalOpen(true)}
                            variant="outline"
                            size="sm"
                            className="mt-4 text-[10px] font-bold uppercase tracking-widest"
                          >
                            Subir aquí
                          </Button>
                        )}
                      </div>
                    ) : (
                      <DocumentTable
                        company={companySlug}
                        documents={filteredDocs}
                        onRefresh={handleDocRefresh}
                        onView={(id: number) => { setViewingDocId(id); setIsViewerOpen(true); }}
                        onDelete={handleDeleteDocument}
                        canManage={canManage}
                        isDipDirector={isDipDirector}
                        user={user}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <UploadModal
        company={companySlug}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleDocRefresh}
        departmentId={currentDeptForDialog?.id ?? null}
        folders={currentFoldersForDialog}
      />

      <DocumentViewer company={companySlug} documentId={viewingDocId} isOpen={isViewerOpen} onClose={() => setIsViewerOpen(false)} />

      <CreateFolderDialog
        open={createFolderOpen}
        onClose={() => setCreateFolderOpen(false)}
        company={companySlug}
        departmentId={currentDeptForDialog?.id ?? null}
        departmentName={selectedDeptName}
        departments={departments}
        folders={currentFoldersForDialog}
        selectedFolderPath={selectedFolderPath}
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
          onSuccess={() => handleFolderRefresh(renameTarget.departmentId)}
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
          onSuccess={() => handleFolderRefresh(deleteTarget.departmentId)}
        />
      )}

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

      {shareRequestsOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end overflow-hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-300" onClick={() => setShareRequestsOpen(false)} />
          <div className="relative z-10 h-full">
            <ShareRequestsPanel
              company={companySlug}
              onClose={() => { setShareRequestsOpen(false); refreshPendingCount(); }}
              onRefresh={refreshPendingCount}
            />
          </div>
        </div>
      )}

      <DashboardModal
        open={dashboardOpen}
        onClose={() => setDashboardOpen(false)}
        company={companySlug}
      />
    </ContentLayout>
  );
};

export default BibliotecaPage;

