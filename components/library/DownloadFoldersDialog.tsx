"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Building2,
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen,
  FolderTree as FolderTreeIcon,
  KeyRound,
  Loader2,
  Minus,
  PackageCheck,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { DepartmentFolderGroup } from "@/components/library/FolderTree";
import type { Document, FolderNode } from "@/lib/libraryService";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";

/**
 * Nombre con el que se guarda el ZIP. Lo pone el cliente porque la respuesta
 * llega cross-origin y `Content-Disposition` no está en la lista de cabeceras
 * expuestas, así que el navegador no puede leer el nombre que envía el servidor.
 */
const buildArchiveFileName = (company: string) =>
  `${company}_biblioteca_${new Date()
    .toISOString()
    .slice(0, 16)
    .replace(/[-:T]/g, "")}.zip`;

/** Dispara la descarga de un blob y libera la URL temporal. */
const downloadBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

/**
 * Con `responseType: "blob"` axios entrega también los errores como blob, así que
 * el mensaje de validación del backend hay que sacarlo a mano; si no, el toast
 * mostraría siempre un error genérico.
 */
const messageFromError = async (error: unknown): Promise<string | null> => {
  const data = (error as { response?: { data?: unknown } })?.response?.data;
  if (!(data instanceof Blob)) return null;
  try {
    const parsed = JSON.parse(await data.text()) as { message?: string };
    return typeof parsed.message === "string" ? parsed.message : null;
  } catch {
    return null;
  }
};

const isAbortError = (error: unknown) =>
  (error as { code?: string })?.code === "ERR_CANCELED" ||
  (error as { name?: string })?.name === "CanceledError";

/** Bytes en unidades legibles para la barra de progreso. */
const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/**
 * Aviso de qué quedó fuera del ZIP.
 *
 * El backend separa "no te dejo bajarlo" (sin permiso) de "el archivo no está
 * en el servidor" (no disponible): son problemas distintos y con soluciones
 * distintas. Antes el aviso lo traducía todo a "sin permisos", que es mentira
 * cuando simplemente falta el fichero.
 */
const buildSkipNotice = (
  total: number,
  permissions: number,
  unavailable: number,
): { message: string; description?: string } => {
  const partes: string[] = [];
  if (permissions > 0) partes.push(`${permissions} sin permisos`);
  if (unavailable > 0) partes.push(`${unavailable} no disponibles`);

  const mensaje = `${total} archivo${total === 1 ? "" : "s"} en el ZIP${
    partes.length > 0 ? `, ${partes.join(" y ")}` : ""
  }`;

  const detalles: string[] = [];
  if (permissions > 0) {
    detalles.push("Pide a un administrador que te los comparta.");
  }
  if (unavailable > 0) {
    detalles.push(
      "Sus archivos no están en el servidor: avisa a un administrador.",
    );
  }

  return { message: mensaje, description: detalles.join(" ") };
};

/** Lee una cabecera numérica; no numérica o ausente cuenta como 0. */
const readCountHeader = (
  headers: Record<string, unknown>,
  name: string,
): number => {
  const value = Number(headers[name]);
  return Number.isFinite(value) ? value : 0;
};

interface DownloadFoldersDialogProps {
  open: boolean;
  onClose: () => void;
  company: string;
  departmentFolders: DepartmentFolderGroup[];
  documentsByDepartment: Record<string, Document[]>;
  onLoadFolders: (departmentId: number) => void;
  loadingDepartmentIds?: number[];
}

/** Nodo seleccionable del árbol, ya aplanado para poder recorrerlo sin recursión. */
interface TreeNode {
  key: string;
  label: string;
  /** Ruta interna de la carpeta en la biblioteca ("/" para la raíz). */
  path: string;
  departmentId: number;
  departmentName: string;
  /** 0 en la raíz del departamento, 1 en sus carpetas, etc. */
  depth: number;
  childKeys: string[];
  docCount: number;
}

type CheckState = "checked" | "unchecked" | "indeterminate";

/** Departamentos del árbol, incluidos los anidados. */
const collectDepartmentIds = (
  groups: DepartmentFolderGroup[],
  acc: number[] = [],
): number[] => {
  for (const group of groups) {
    acc.push(group.departmentId);
    if (group.descendants?.length) {
      collectDepartmentIds(group.descendants, acc);
    }
  }
  return acc;
};

const nodeKey = (departmentId: number, folderPath: string) =>
  `${departmentId}::${folderPath}`;

/**
 * Estado tri-estado de un nodo: una rama con parte de sus hijos marcados se
 * muestra intermedia. Se resuelve hacia abajo, así que el resultado de un padre
 * depende del de sus descendientes.
 */
const resolveCheckState = (
  nodes: Record<string, TreeNode>,
  selected: Record<string, boolean>,
  key: string,
): CheckState => {
  const node = nodes[key];
  if (!node) return "unchecked";
  if (node.childKeys.length === 0) {
    return selected[key] ? "checked" : "unchecked";
  }

  const states = node.childKeys.map((child) =>
    resolveCheckState(nodes, selected, child),
  );
  if (states.every((state) => state === "checked")) {
    return selected[key] ? "checked" : "indeterminate";
  }
  if (states.every((state) => state === "unchecked")) {
    return selected[key] ? "indeterminate" : "unchecked";
  }
  return "indeterminate";
};

export default function DownloadFoldersDialog({
  open,
  onClose,
  company,
  departmentFolders,
  documentsByDepartment,
  onLoadFolders,
  loadingDepartmentIds = [],
}: DownloadFoldersDialogProps) {
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [phase, setPhase] = useState<
    "idle" | "confirm" | "downloading" | "saving"
  >("idle");
  const [progress, setProgress] = useState({ received: 0, total: 0 });
  // Reconfirmación de contraseña antes de exportar la biblioteca. No se guarda
  // en localStorage ni en un ref de sesión: se limpia al cerrar el diálogo.
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const requestedDepartments = useRef<Set<number>>(new Set());
  const wasOpen = useRef(false);

  // El árbol lateral carga las carpetas de forma perezosa, así que para poder
  // elegir ramas hay que pedirlas todas. Cada departamento se pide una sola vez
  // por sesión: `onLoadFolders` no corta la recarga cuando la carpeta viene
  // vacía, y sin este filtro un departamento sin carpetas re-dispararía la
  // petición en bucle.
  useEffect(() => {
    if (!open) {
      requestedDepartments.current = new Set();
      return;
    }
    const pending = collectDepartmentIds(departmentFolders).filter(
      (id) => !requestedDepartments.current.has(id),
    );
    if (pending.length === 0) return;
    for (const id of pending) requestedDepartments.current.add(id);
    for (const id of pending) onLoadFolders(id);
  }, [open, departmentFolders, onLoadFolders]);

  useEffect(() => {
    if (open && !wasOpen.current) {
      setSelected({});
      setCollapsed({});
      setProgress({ received: 0, total: 0 });
      setPassword("");
      setPasswordError(null);
    }
    wasOpen.current = open;
  }, [open]);

  /**
   * Documentos de una carpeta concreta. Usa el mismo criterio que la tabla
   * para que el ZIP contenga exactamente lo que el usuario ve en pantalla.
   */
  const documentsInFolder = useCallback(
    (departmentName: string, folderPath: string): Document[] => {
      const documents = documentsByDepartment[departmentName] ?? [];
      if (!folderPath || folderPath === "/") {
        return documents.filter(
          (doc) => !doc.folder_paths?.length || doc.folder_paths.includes("/"),
        );
      }
      return documents.filter((doc) => doc.folder_paths?.includes(folderPath));
    },
    [documentsByDepartment],
  );

  const { nodes, rootKeys } = useMemo(() => {
    const built: Record<string, TreeNode> = {};

    const visitFolder = (
      folder: FolderNode,
      depth: number,
      departmentId: number,
      departmentName: string,
    ): string[] => {
      // La raíz del departamento ya está representada por el propio nodo del
      // departamento. Si una carpeta llegar a tener la ruta "/" su clave
      // coincidiría con ella y el árbol se volvería cíclico, así que el
      // recorrido nunca terminaría. No ocurre con los datos del backend (las
      // carpetas de primer nivel siempre se llaman "/Nombre"), pero el recorrido
      // se aplana por si acaso.
      if (!folder.path || folder.path === "/") {
        return (folder.children ?? []).flatMap((child) =>
          visitFolder(child, depth, departmentId, departmentName),
        );
      }

      const key = nodeKey(departmentId, folder.path);
      const childKeys = (folder.children ?? []).flatMap((child) =>
        visitFolder(child, depth + 1, departmentId, departmentName),
      );
      built[key] = {
        key,
        label: folder.name,
        path: folder.path,
        departmentId,
        departmentName,
        depth,
        childKeys,
        docCount: documentsInFolder(departmentName, folder.path).length,
      };
      return [key];
    };

    const visitDepartment = (group: DepartmentFolderGroup): string[] => {
      const key = nodeKey(group.departmentId, "/");
      const childKeys = (group.folders ?? []).flatMap((folder) =>
        visitFolder(folder, 1, group.departmentId, group.departmentName),
      );
      built[key] = {
        key,
        label: group.departmentName,
        path: "/",
        departmentId: group.departmentId,
        departmentName: group.departmentName,
        depth: 0,
        childKeys,
        docCount: documentsInFolder(group.departmentName, "/").length,
      };
      return [key];
    };

    const roots = departmentFolders.flatMap(visitDepartment);
    return { nodes: built, rootKeys: roots };
  }, [departmentFolders, documentsInFolder]);

  /** Estado tri-estado: una rama con parte de sus hijos marcados va intermedia. */
  const resolveState = useCallback(
    (key: string): CheckState => resolveCheckState(nodes, selected, key),
    [nodes, selected],
  );

  /**
   * Marca o desmarca las ramas indicadas y, en cascada, toda su descendencia.
   *
   * Marcar cada descendiente (y no solo la raíz) es lo que hace que el ZIP
   * refleje la estructura real: el plan de descarga recorre las carpetas
   * seleccionadas, así que una subcarpeta sin marcar se quedaría sin sus
   * documentos aunque su padre estuviera elegido.
   */
  const setBranches = (rootKeysToSet: string[], checked: boolean) => {
    setSelected((previous) => {
      const next = { ...previous };
      const stack = [...rootKeysToSet];
      while (stack.length > 0) {
        const current = stack.pop() as string;
        next[current] = checked;
        stack.push(...(nodes[current]?.childKeys ?? []));
      }
      return next;
    });
  };

  const toggleBranch = (key: string, checked: boolean) =>
    setBranches([key], checked);

  const selectedKeys = useMemo(
    () =>
      Object.keys(selected)
        .filter((key) => selected[key] && nodes[key])
        // Orden estable para que el ZIP salga igual ante la misma selección.
        .sort(),
    [selected, nodes],
  );

  /**
   * Documentos únicos dentro de las carpetas elegidas. Solo se usa para el
   * contador de la interfaz: el ZIP lo arma el backend, que ya se encarga de
   * escribir cada documento en todas las carpetas donde está replicado.
   */
  const plan = useMemo(() => {
    const byDocumentId = new Map<number, Document>();

    for (const key of selectedKeys) {
      const node = nodes[key];
      for (const document of documentsInFolder(
        node.departmentName,
        node.path,
      )) {
        byDocumentId.set(document.id, document);
      }
    }

    return { documents: [...byDocumentId.values()] };
  }, [selectedKeys, nodes, documentsInFolder]);

  // "confirm" no es una fase ocupada: ahí el usuario teclea su contraseña,
  // así que los botones de cancelar y la entrada deben seguir activos.
  const isBusy = phase === "downloading" || phase === "saving";

  /**
   * Con una sola petición no hay pasos que contar, así que la barra muestra los
   * bytes recibidos. `total` llega en 0 cuando la respuesta va streamada sin
   * Content-Length, y entonces se muestra como indeterminado.
   */
  const percentage =
    progress.total > 0
      ? Math.min(100, Math.round((progress.received / progress.total) * 100))
      : 0;

  const handleCancel = () => {
    abortRef.current?.abort();
  };

  /**
   * El botón de descarga en dos pasos: primero se pide la contraseña del
   * usuario (el backend también la exige), y solo con ella confirmada se hace
   * la petición. Así una contraseña mal escrita no dispara el armado del ZIP.
   */
  const handleStart = () => {
    if (plan.documents.length === 0) {
      toast.error("Las carpetas seleccionadas no contienen documentos");
      return;
    }
    setPasswordError(null);
    setPhase("confirm");
    // El diálogo acaba de cambiar de fase: se espera un frame para enfocar.
    window.requestAnimationFrame(() => passwordRef.current?.focus());
  };

  const handleBackToSelection = () => {
    if (isBusy) return;
    setPassword("");
    setPasswordError(null);
    setPhase("idle");
  };

  const handleDownload = async () => {
    if (plan.documents.length === 0) {
      toast.error("Las carpetas seleccionadas no contienen documentos");
      return;
    }

    if (!password) {
      setPasswordError("Introduce tu contraseña para continuar");
      passwordRef.current?.focus();
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setPhase("downloading");
    setProgress({ received: 0, total: 0 });
    setPasswordError(null);
    // Si la clave falla se vuelve a la fase de confirmación para poder
    // reintentar sin perder la selección de carpetas.
    let retypePassword = false;

    try {
      // Una sola petición con TODAS las carpetas: el backend arma el ZIP y lo
      // devuelve entero. Antes se descargaba documento por documento y eso
      // multiplicaba las peticiones por el número de archivos.
      const response = await axiosInstance.post<Blob>(
        `/${company}/library/folders/download-zip`,
        {
          password,
          folders: selectedKeys.map((key) => ({
            department_id: nodes[key].departmentId,
            folder_path: nodes[key].path,
          })),
        },
        {
          responseType: "blob",
          signal: controller.signal,
          onDownloadProgress: (event) => {
            setProgress({
              received: event.loaded,
              total: event.total ?? 0,
            });
          },
        },
      );

      setPhase("saving");
      downloadBlob(response.data, buildArchiveFileName(company));

      // El servidor cuenta lo que metió y lo que dejó fuera por permisos. Sin
      // estas cabeceras el toast affirmaría que se descargó todo cuando en
      // realidad se omitieron documentos.
      const included = Number(response.headers["x-library-zip-included"]);
      const skipped = Number(response.headers["x-library-zip-skipped"]);
      const total = Number.isFinite(included)
        ? included
        : plan.documents.length;

      if (skipped > 0) {
        const headers = response.headers as Record<string, unknown>;
        let permissions = readCountHeader(
          headers,
          "x-library-zip-skipped-permissions",
        );
        let unavailable = readCountHeader(
          headers,
          "x-library-zip-skipped-unavailable",
        );

        // Si el servidor no mandó el desglose (versión anterior), no se
        // atribuye la culpa a los permisos sin saberlo: se cuentan todos
        // como no disponibles, que es lo único que se puede afirmar.
        if (permissions + unavailable === 0) {
          unavailable = skipped;
        }

        const aviso = buildSkipNotice(total, permissions, unavailable);
        toast.warning(aviso.message, {
          description: aviso.description,
        });
      } else {
        toast.success(
          `${total} archivo${total === 1 ? "" : "s"} en ${selectedKeys.length} carpeta${selectedKeys.length === 1 ? "" : "s"}`,
        );
      }
      onClose();
    } catch (error) {
      if (isAbortError(error)) {
        toast.info("Descarga cancelada");
      } else if (
        (error as { response?: { status?: number } })?.response?.status === 403
      ) {
        // Contraseña errada (el backend responde 403 y no 401 para no matar
        // la sesión vía el interceptor de AuthContext).
        retypePassword = true;
        setPassword("");
        setPasswordError(
          (await messageFromError(error)) ?? "La contraseña es incorrecta",
        );
        window.requestAnimationFrame(() => passwordRef.current?.focus());
      } else if (
        (error as { response?: { status?: number } })?.response?.status === 429
      ) {
        // Demasiados intentos: se vuelve a la selección para que espere.
        console.error("Límite de intentos alcanzado:", error);
        toast.error(
          (await messageFromError(error)) ??
            "Demasiados intentos. Espera un momento y vuelve a probar",
        );
      } else {
        console.error("Error al descargar el ZIP:", error);
        toast.error(
          (await messageFromError(error)) ??
            "No se pudo generar el archivo ZIP",
        );
      }
    } finally {
      abortRef.current = null;
      setPhase(retypePassword ? "confirm" : "idle");
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) return;
    // Durante el armado no se cierra: pulsar fuera perdería todo el trabajo.
    if (isBusy) return;
    // En la fase de contraseña, Esc o un clic fuera vuelve a la selección en
    // vez de cerrar, para no perder lo que ya se marcó.
    if (phase === "confirm") {
      handleBackToSelection();
      return;
    }
    onClose();
  };

  const renderRow = (key: string) => {
    const node = nodes[key];
    if (!node) return null;

    const isDepartment = node.depth === 0;
    const isCollapsed = !!collapsed[key];
    const hasChildren = node.childKeys.length > 0;
    const state = resolveState(key);

    return (
      <div key={key}>
        <div
          className={`group flex items-center gap-2 py-1.5 pr-2 rounded-lg transition-colors ${
            state === "checked"
              ? "bg-blue-50 dark:bg-blue-900/20"
              : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
          }`}
          style={{ paddingLeft: `${8 + node.depth * 16}px` }}
        >
          {hasChildren ? (
            <button
              type="button"
              onClick={() =>
                setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }))
              }
              aria-label={isCollapsed ? "Expandir" : "Contraer"}
              className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400"
            >
              {isCollapsed ? (
                <ChevronRight className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </button>
          ) : (
            <span className="w-4" />
          )}

          <Checkbox
            checked={
              state === "indeterminate" ? "indeterminate" : state === "checked"
            }
            onCheckedChange={(checked) => toggleBranch(key, checked === true)}
            aria-label={`Descargar ${node.label}`}
            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 data-[state=checked]:text-white data-[state=indeterminate]:bg-blue-600 data-[state=indeterminate]:border-blue-600 data-[state=indeterminate]:text-white"
          />

          {isDepartment ? (
            isCollapsed ? (
              <Building2 className="h-3.5 w-3.5 shrink-0 text-blue-500" />
            ) : (
              <Building2 className="h-3.5 w-3.5 shrink-0 text-blue-600" />
            )
          ) : isCollapsed ? (
            <Folder className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          ) : (
            <FolderOpen className="h-3.5 w-3.5 shrink-0 text-amber-500" />
          )}

          <span
            className={`truncate flex-1 text-sm ${
              isDepartment
                ? "font-bold text-slate-800 dark:text-slate-100"
                : "text-slate-600 dark:text-slate-300"
            }`}
          >
            {isDepartment ? node.label : node.label}
          </span>

          {node.docCount > 0 && (
            <span className="shrink-0 select-none px-1.5 py-0.5 text-[9px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-full min-w-4.5 text-center leading-none">
              {node.docCount}
            </span>
          )}
        </div>

        {!isCollapsed && node.childKeys.map(renderRow)}
      </div>
    );
  };

  const isLoadingFolders = loadingDepartmentIds.length > 0;
  const hasTree = rootKeys.length > 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-white dark:bg-[#1a1c1e] border-none text-slate-900 dark:text-white sm:max-w-[560px] rounded-2xl overflow-hidden p-0 outline-hidden shadow-2xl">
        <div className="bg-slate-50 dark:bg-gray-800/40 px-6 py-5 border-b border-slate-200 dark:border-gray-700">
          <DialogTitle className="text-lg font-bold text-slate-800 dark:text-white tracking-tight uppercase">
            Descargar carpetas
          </DialogTitle>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-1">
            Elige las ramas que quieres descargar
          </p>
        </div>

        <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400 flex items-center gap-2">
              <FolderTreeIcon className="h-3.5 w-3.5 text-blue-500" /> Carpetas
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setBranches(rootKeys, true)}
                disabled={!hasTree || isBusy}
                className="text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-40 disabled:no-underline"
              >
                Todo
              </button>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <button
                type="button"
                onClick={() => setSelected({})}
                disabled={isBusy}
                className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 hover:underline disabled:opacity-40 disabled:no-underline"
              >
                Limpiar
              </button>
            </div>
          </div>

          <div className="border border-slate-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 max-h-80 overflow-y-auto p-2 space-y-0.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full">
            {hasTree ? (
              rootKeys.map(renderRow)
            ) : (
              <div className="flex flex-col items-center gap-2 px-2 py-6">
                {isLoadingFolders ? (
                  <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                ) : null}
                <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-center">
                  {isLoadingFolders
                    ? "Cargando carpetas..."
                    : "No hay carpetas disponibles"}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            <span>
              {selectedKeys.length} carpeta
              {selectedKeys.length === 1 ? "" : "s"}
            </span>
            <span>
              {plan.documents.length} documento
              {plan.documents.length === 1 ? "" : "s"}
            </span>
          </div>

          {phase === "confirm" && (
            <div className="space-y-2 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/60 dark:bg-amber-900/10 p-3">
              <div className="flex items-center gap-2">
                <KeyRound className="h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                <p className="text-[9px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-300">
                  Confirma tu contraseña
                </p>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                Se exportarán {plan.documents.length} documento
                {plan.documents.length === 1 ? "" : "s"} de{" "}
                {selectedKeys.length} carpeta
                {selectedKeys.length === 1 ? "" : "s"}. Escribe tu contraseña de
                usuario para continuar.
              </p>
              <Input
                ref={passwordRef}
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  if (passwordError) setPasswordError(null);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void handleDownload();
                  }
                }}
                placeholder="Contraseña"
                aria-invalid={passwordError ? true : undefined}
                aria-describedby={
                  passwordError ? "library-export-password-error" : undefined
                }
                className={`h-9 text-[13px] ${
                  passwordError
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }`}
              />
              {passwordError && (
                <p
                  id="library-export-password-error"
                  role="alert"
                  className="text-[11px] font-bold text-red-600 dark:text-red-400"
                >
                  {passwordError}
                </p>
              )}
            </div>
          )}
          {isBusy && (
            <div className="space-y-2 rounded-xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-900/10 p-3">
              {/* La barra solo aparece si se conoce el tamaño total: la
                    respuesta va streamada y suele llegar sin Content-Length, y
                    un `Progress` sin total se quedaría en 0% dando a entender
                    que no avanza nada. */}
              {progress.total > 0 && (
                <Progress
                  value={percentage}
                  className="h-1.5 bg-blue-100 dark:bg-blue-900/40 [&>div]:bg-blue-600"
                />
              )}
              <p className="text-[9px] font-bold uppercase tracking-widest text-blue-700 dark:text-blue-300 truncate">
                {phase === "saving"
                  ? "Generando el ZIP..."
                  : progress.total > 0
                    ? `${percentage}% · ${formatBytes(progress.received)} de ${formatBytes(progress.total)}`
                    : `Descargando… ${formatBytes(progress.received)}`}
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-gray-700">
            {phase === "confirm" ? (
              <>
                <button
                  type="button"
                  onClick={handleBackToSelection}
                  className="flex-1 px-4 py-3 text-[10px] font-black text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 uppercase tracking-widest transition-colors"
                >
                  ATRÁS
                </button>
                <button
                  type="button"
                  onClick={() => void handleDownload()}
                  disabled={isBusy}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-[10px] font-black text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-500/20 uppercase tracking-widest transition-all"
                >
                  <KeyRound className="h-3 w-3" />
                  CONFIRMAR Y DESCARGAR
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={isBusy ? handleCancel : onClose}
                  className="flex-1 px-4 py-3 text-[10px] font-black text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 uppercase tracking-widest transition-colors"
                >
                  {isBusy ? "CANCELAR" : "CERRAR"}
                </button>
                <button
                  type="button"
                  onClick={handleStart}
                  disabled={isBusy || plan.documents.length === 0}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-[10px] font-black text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-500/20 uppercase tracking-widest transition-all"
                >
                  {isBusy ? (
                    <>
                      {phase === "saving" ? (
                        <PackageCheck className="h-3 w-3" />
                      ) : (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      )}
                      DESCARGANDO...
                    </>
                  ) : (
                    <>
                      <Minus className="h-3 w-3 rotate-90" />
                      DESCARGAR ZIP
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
