"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Download,
  FileText,
  Folder,
  Frown,
  Loader2,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { SecurePdfViewer } from "@/components/library/SecurePdfViewer";
import { Button } from "@/components/ui/button";
import libraryService, {
  FolderNode,
  SharedFolderContent,
} from "@/lib/libraryService";
import { notifyError } from "@/lib/notify-error";

function findNode(nodes: FolderNode[], path: string): FolderNode | null {
  for (const node of nodes) {
    if (node.path === path) return node;
    const found = findNode(node.children, path);
    if (found) return found;
  }
  return null;
}

/** Carpeta compartida por enlace: se recorre y se leen sus documentos, sin cuenta. */
export default function PublicSharedFolderPage() {
  const params = useParams();
  const company = params.company as string;
  const token = params.token as string;

  const [content, setContent] = useState<SharedFolderContent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState<string | null>(null);
  const [viewing, setViewing] = useState<{
    id: number;
    title: string;
    url: string;
  } | null>(null);
  const [opening, setOpening] = useState<number | null>(null);
  const activeUrl = useRef<string | null>(null);
  const loaded = useRef(false);

  // Mismo bloqueo que el visor de documentos: no se copia el contenido.
  useEffect(() => {
    const block = (e: ClipboardEvent) => {
      e.preventDefault();
      e.clipboardData?.setData(
        "text/plain",
        "⚠️ Contenido Protegido por SIGEAC Library",
      );
    };
    window.addEventListener("copy", block);
    window.addEventListener("cut", block);
    return () => {
      window.removeEventListener("copy", block);
      window.removeEventListener("cut", block);
    };
  }, []);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    libraryService
      .getSharedFolderContent(company, token)
      .then((data) => {
        setContent(data);
        setCurrentPath(data.root_path);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));

    return () => {
      if (activeUrl.current) URL.revokeObjectURL(activeUrl.current);
    };
  }, [company, token]);

  const subfolders = useMemo(() => {
    if (!content || !currentPath) return [];
    if (currentPath === content.root_path) return content.folders;
    return findNode(content.folders, currentPath)?.children ?? [];
  }, [content, currentPath]);

  const documents = useMemo(
    () =>
      content && currentPath
        ? content.documents.filter((d) => d.folder_paths.includes(currentPath))
        : [],
    [content, currentPath],
  );

  const goUp = () => {
    if (!content || !currentPath || currentPath === content.root_path) return;
    const parent = currentPath.slice(0, currentPath.lastIndexOf("/"));
    setCurrentPath(
      parent.length >= content.root_path.length ? parent : content.root_path,
    );
  };

  const openDocument = async (id: number, title: string) => {
    setOpening(id);
    try {
      const url = await libraryService.getSharedFolderDocumentBlob(
        company,
        token,
        id,
      );
      if (activeUrl.current) URL.revokeObjectURL(activeUrl.current);
      activeUrl.current = url;
      setViewing({ id, title, url });
    } catch (err) {
      notifyError(err, { action: "abrir el documento" });
    } finally {
      setOpening(null);
    }
  };

  const download = async () => {
    if (!viewing) return;
    try {
      const url = await libraryService.getSharedFolderDocumentBlob(
        company,
        token,
        viewing.id,
        true,
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = `${viewing.title}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      notifyError(err, { action: "descargar el documento" });
    }
  };

  const breadcrumb =
    content && currentPath
      ? currentPath
          .slice(content.root_path.lastIndexOf("/"))
          .replace(/\//g, " › ")
          .replace(/^ › /, "")
      : "";

  return (
    <div
      className="h-screen w-screen flex flex-col bg-[#111214] text-white overflow-hidden select-text"
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="flex items-center justify-between gap-3 border-b border-gray-800 bg-[#1a1c1e] px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-500/10">
            <ShieldCheck className="size-5 text-emerald-500" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold leading-tight text-white">
              {content?.title ?? "Carpeta compartida"}
            </h3>
            <p className="text-xs text-gray-500">
              Transmisión protegida por SIGEAC
            </p>
          </div>
        </div>

        {viewing && (
          <div className="flex items-center gap-2">
            {!content?.read_only && (
              <Button
                type="button"
                onClick={download}
                className="gap-2 max-sm:h-10"
              >
                <Download className="size-4" /> Descargar
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              onClick={() => setViewing(null)}
              className="gap-2 text-gray-300 hover:bg-white/10 hover:text-white max-sm:h-10"
            >
              <ArrowLeft className="size-4" /> Volver
            </Button>
          </div>
        )}
      </div>

      <div className="flex-1 relative overflow-hidden bg-[#141517]">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="size-8 animate-spin text-emerald-500" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="mb-5 grid size-14 place-items-center rounded-2xl bg-amber-500/10">
              <Frown className="size-7 text-amber-500" />
            </div>
            <h2 className="mb-2 text-lg font-semibold">
              No se pudo abrir la carpeta
            </h2>
            <p className="max-w-md text-sm text-gray-400">{error}</p>
          </div>
        ) : viewing ? (
          <div className="h-full w-full">
            <SecurePdfViewer fileUrl={viewing.url} theme="dark" />
          </div>
        ) : (
          <div className="h-full overflow-y-auto p-4 sm:p-6">
            <div className="mx-auto max-w-4xl space-y-6">
              <div className="flex items-center gap-3">
                {content && currentPath !== content.root_path && (
                  <button
                    type="button"
                    onClick={goUp}
                    aria-label="Subir un nivel"
                    className="grid size-9 place-items-center rounded-lg hover:bg-white/10"
                  >
                    <ArrowLeft className="size-4" />
                  </button>
                )}
                <p className="text-sm text-gray-400 wrap-anywhere">
                  {breadcrumb}
                </p>
              </div>

              {subfolders.length > 0 && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {subfolders.map((folder) => (
                    <button
                      key={folder.id}
                      onClick={() => setCurrentPath(folder.path)}
                      className="flex items-center gap-3 rounded-xl border border-gray-800 bg-[#1a1c1e] px-3 py-3 text-left transition-colors hover:border-emerald-500/50"
                    >
                      <Folder className="size-5 shrink-0 text-emerald-500" />
                      <span className="truncate text-sm font-semibold">
                        {folder.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {documents.length > 0 ? (
                <div className="rounded-xl border border-gray-800 divide-y divide-gray-800 bg-[#1a1c1e]">
                  {documents.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => openDocument(doc.id, doc.title)}
                      disabled={opening === doc.id}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-white/5 disabled:opacity-60"
                    >
                      <FileText className="size-5 shrink-0 text-gray-400" />
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                        {doc.title}
                      </span>
                      {doc.version && (
                        <span className="text-xs tabular-nums text-gray-500">
                          {doc.version}
                        </span>
                      )}
                      {opening === doc.id && (
                        <Loader2 className="size-4 animate-spin" />
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                subfolders.length === 0 && (
                  <p className="py-16 text-center text-sm text-gray-500">
                    No hay documentos en esta carpeta
                  </p>
                )
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center border-t border-gray-800 bg-[#1a1c1e] px-3 py-2.5">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Lock className="size-3" />© SIGEAC Digital Library - 2026
        </div>
      </div>
    </div>
  );
}
