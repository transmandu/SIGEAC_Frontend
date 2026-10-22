import axiosInstance from "@/lib/axios";
import { notifyError } from "@/lib/notify-error";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export interface LibraryDocumentVersion {
  id: number;
  version_number: string;
  version_label?: string;
  file_path?: string;
  change_log: string;
  created_at: string;
}

interface UseGetDocumentVersionsProps {
  company?: string;
  documentId?: number | string;
  enabled?: boolean;
  /** Qué se intentaba hacer, para el aviso si la consulta falla ("obtener el historial…"). */
  action: string;
}

const NO_VERSIONS: LibraryDocumentVersion[] = [];

const fetchVersions = async (
  company: string,
  documentId: number | string,
): Promise<LibraryDocumentVersion[]> => {
  const response = await axiosInstance.get(
    `/${company}/library/documents/${documentId}/versions`,
  );
  const versions = response.data?.data?.versions;
  return Array.isArray(versions) ? versions : NO_VERSIONS;
};

/**
 * Versiones de un documento de la biblioteca, de la más reciente a la más
 * antigua. Se piden al abrir el diálogo que las necesita (`enabled`).
 */
export const useGetDocumentVersions = ({
  company,
  documentId,
  enabled = true,
  action,
}: UseGetDocumentVersionsProps) => {
  const query = useQuery<LibraryDocumentVersion[], Error>({
    queryKey: ["library-document-versions", company, documentId],
    queryFn: () => fetchVersions(company!, documentId!),
    enabled: enabled && !!company && !!documentId,
    staleTime: 0,
    meta: { silent: true },
  });

  const { error } = query;
  useEffect(() => {
    if (error) notifyError(error, { action });
  }, [error, action]);

  return { ...query, versions: query.data ?? NO_VERSIONS };
};
