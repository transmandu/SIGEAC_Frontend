import axiosInstance from "./axios";

export interface Document {
  id: number;
  title: string;
  document: string;
  category_name: string;
  department_name: string;
  folder_path: string | null;
  folder_paths: string[];
  emission_date: string | null;
  expiration_date: string | null;
  status: "vigente" | "vencido" | "no_aplica";
  created_at: string;
  /** El documento tiene lista propia de personas con acceso (un candado). */
  restricted?: boolean;
  /** Tamaño de esa lista; solo lo recibe quien administra el departamento. */
  member_count?: number;
  /** Favorito del usuario que consulta (personal). */
  is_favorite?: boolean;
  /** Último acceso del usuario que consulta (personal); de ahí salen los recientes. */
  opened_at?: string | null;
}

export interface DocumentAccess {
  document_id: number;
  restricted: boolean;
  employee_ids: number[];
  candidates: {
    id: number;
    name: string;
    job_title: string | null;
    department: string | null;
  }[];
}

export interface ActivityLog {
  id: number;
  employee_name: string;
  document_title: string;
  department: string;
  ip_address: string;
  accessed_at: string;
  action?: string;
}

export interface FolderNode {
  id: string;
  name: string;
  path: string;
  children: FolderNode[];
  /** Visible solo para una lista de empleados. */
  restricted?: boolean;
  /** Solo lo recibe quien administra el departamento. */
  member_count?: number;
  /** Carpeta ajena que solo se recorre para llegar a una compartida. */
  navigation_only?: boolean;
}

export interface FolderAccessCandidate {
  id: number;
  name: string;
  job_title: string | null;
  department: string | null;
}

export interface FolderShare {
  id: number;
  department_id: number;
  department_name: string | null;
  folder_id: string;
  folder_name: string;
  folder_path: string;
  requested_by_name: string;
  shared_with_name: string | null;
  reason: string;
  expires_in_hours: number;
  read_only: boolean;
  status: "pending" | "approved" | "rejected";
  rejection_reason: string | null;
  reviewed_by_name: string | null;
  expires_at: string | null;
  access_count: number;
  created_at: string;
  is_active: boolean;
  is_expired: boolean;
  share_url: string | null;
}

export interface SharedFolderContent {
  title: string;
  read_only: boolean;
  expires_at: string;
  root_path: string;
  folders: FolderNode[];
  documents: {
    id: number;
    title: string;
    folder_paths: string[];
    file_type: string | null;
    version: string | null;
  }[];
}

/** Un documento en la papelera de la biblioteca. */
export interface TrashedDocument {
  id: number;
  title: string;
  department_name: string | null;
  category_name: string | null;
  /** Carpeta donde estaba al eliminarlo. */
  folder_path: string;
  file_type: string | null;
  version_label: string | null;
  deleted_at: string;
  /** Cuándo se elimina definitivamente (el servidor lo purga a diario a los 30 días). */
  purge_at: string | null;
  /** Nombre de quien lo eliminó (el servidor ya lo resuelve). */
  deleted_by: string | null;
}

export interface FolderAccess {
  folder_id: string;
  restricted: boolean;
  employee_ids: number[];
  /** Carpeta restringida superior que limita a quién se puede asignar. */
  inherited_from: { path: string } | null;
  candidates: FolderAccessCandidate[];
}

const libraryService = {
  /**
   * Obtiene los documentos agrupados por departamento
   */
  getDocuments: async (company: string) => {
    const response = await axiosInstance.get(`/${company}/library/documents`);
    return response.data;
  },

  /**
   * Sube un archivo usando FormData
   */
  uploadDocument: async (company: string, formData: FormData) => {
    const response = await axiosInstance.post(
      `/${company}/library/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  },

  /**
   * Elimina un documento por ID. Si se indica `sourceFolderPath` y NO es la
   * carpeta primaria, el backend solo desvincula esa réplica (el original queda).
   */
  deleteDocument: async (
    company: string,
    id: number | string,
    sourceFolderPath?: string,
  ) => {
    const response = await axiosInstance.delete(
      `/${company}/library/documents/${id}`,
      {
        ...(sourceFolderPath != null
          ? { data: { source_folder_path: sourceFolderPath } }
          : {}),
      },
    );
    return response.data;
  },

  /**
   * Retorna la URL para el visor (usada como fallback)
   */
  getViewUrl: (company: string, id: number) => {
    const baseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";
    return `${baseUrl}/${company}/library/view/${id}`;
  },

  /**
   * Obtiene el archivo como un Blob para visualización segura.
   * Soporta ID privado (number) o Token Público QR (string).
   */
  getFileBlob: async (
    company: string,
    documentId: number | string,
    isVersionHistory: boolean = false,
  ) => {
    const baseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

    // CASO A: Es un escaneo de QR Público (Llega un Token string de 32+ caracteres)
    if (typeof documentId === "string" && documentId.length > 10) {
      const encodedToken = encodeURIComponent(documentId);
      const response = await fetch(
        `${baseUrl}/${company}/library/shared/content/${encodedToken}`,
        {
          method: "GET",
        },
      );

      if (!response.ok) {
        throw new Error(
          "No se pudo establecer una conexión para cargar el documento público.",
        );
      }

      const blob = await response.blob();
      return URL.createObjectURL(blob);
    }

    // CASO B: Es una versión anterior del historial (Llega con la bandera activada)
    if (isVersionHistory) {
      const response = await axiosInstance.get(
        `/${company}/library/versions/${documentId}/view`,
        {
          responseType: "blob",
        },
      );
      return URL.createObjectURL(response.data);
    }

    // CASO C: Es la vista privada normal dentro del sistema (Llega un ID numérico normal)
    const response = await axiosInstance.get(
      `/${company}/library/view/${documentId}`,
      {
        responseType: "blob",
      },
    );
    return URL.createObjectURL(response.data);
  },

  /**
   * Obtiene el historial de trazabilidad de la empresa
   */
  getTrazabilidad: async (company: string) => {
    const response = await axiosInstance.get(
      `/${company}/library/trazabilidad`,
    );
    return response.data;
  },

  /**
   * Descarga de un enlace público. El backend rechaza con 403 si el enlace es
   * de solo lectura: la decisión no puede quedar en el cliente.
   */
  downloadSharedFile: async (company: string, token: string) => {
    const baseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";
    const encodedToken = encodeURIComponent(token);

    const response = await fetch(
      `${baseUrl}/${company}/library/shared/content/${encodedToken}?download=1`,
      { method: "GET" },
    );

    if (!response.ok) {
      throw new Error(
        response.status === 403
          ? "Este enlace es de solo lectura: la descarga no está permitida."
          : "No se pudo descargar el documento.",
      );
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  },

  setFavorite: async (
    company: string,
    documentId: number,
    favorite: boolean,
  ) => {
    const response = await axiosInstance.put(
      `/${company}/library/documents/${documentId}/favorite`,
      { favorite },
    );
    return response.data;
  },

  /** Marca o desmarca varios favoritos en una sola petición. */
  setFavoriteBatch: async (
    company: string,
    documentIds: number[],
    favorite: boolean,
  ) => {
    const response = await axiosInstance.put(
      `/${company}/library/documents/favorite-batch`,
      { document_ids: documentIds, favorite },
    );
    return response.data as { updated: number; favorite: boolean };
  },

  /**
   * Envía varios documentos a la papelera (todo o nada). Con
   * `sourceFolderPath`, las réplicas en esa carpeta solo se desvinculan.
   */
  trashDocuments: async (
    company: string,
    documentIds: number[],
    sourceFolderPath?: string,
  ) => {
    const response = await axiosInstance.post(
      `/${company}/library/documents/trash-batch`,
      {
        document_ids: documentIds,
        ...(sourceFolderPath ? { source_folder_path: sourceFolderPath } : {}),
      },
    );
    return response.data as { trashed: number; unlinked: number };
  },

  /** Anota el acceso: alimenta los recientes. */
  markOpened: async (company: string, documentId: number) => {
    await axiosInstance.post(
      `/${company}/library/documents/${documentId}/opened`,
    );
  },

  /** Documentos en la papelera que el usuario puede gestionar. */
  getTrash: async (company: string): Promise<TrashedDocument[]> => {
    const response = await axiosInstance.get(`/${company}/library/trash`);
    return response.data?.data ?? [];
  },

  /** Devuelve el documento a la biblioteca; `moved_to_root` si su carpeta ya no existía. */
  restoreTrashed: async (
    company: string,
    documentId: number,
  ): Promise<{ message: string; moved_to_root: boolean }> => {
    const response = await axiosInstance.post(
      `/${company}/library/trash/${documentId}/restore`,
    );
    return response.data;
  },

  /** Eliminación definitiva de un documento de la papelera. */
  purgeTrashed: async (company: string, documentId: number) => {
    const response = await axiosInstance.delete(
      `/${company}/library/trash/${documentId}`,
    );
    return response.data;
  },

  emptyTrash: async (
    company: string,
  ): Promise<{ purged: number; failed: number }> => {
    const response = await axiosInstance.delete(`/${company}/library/trash`);
    return response.data;
  },

  getFolders: async (company: string, departmentId: number) => {
    const response = await axiosInstance.get(`/${company}/library/folders`, {
      params: { department_id: departmentId },
    });
    return response.data;
  },

  createFolder: async (
    company: string,
    data: {
      department_id: number;
      name: string;
      parent_id?: string;
      restricted?: boolean;
      employee_ids?: number[];
    },
  ) => {
    const response = await axiosInstance.post(
      `/${company}/library/folders`,
      data,
    );
    return response.data;
  },

  /**
   * Accesos de una carpeta. Con `folderId = "root"` (o `forChild`) devuelve los
   * asignables de una carpeta NUEVA dentro de esa ubicación.
   */
  getFolderAccess: async (
    company: string,
    folderId: string,
    departmentId: number,
    forChild = false,
  ): Promise<FolderAccess> => {
    const response = await axiosInstance.get(
      `/${company}/library/folders/${folderId}/access`,
      { params: { department_id: departmentId, for_child: forChild } },
    );
    return response.data;
  },

  /** Quién ve un documento: su lista propia y a quién se puede asignar. */
  getDocumentAccess: async (
    company: string,
    documentId: number,
  ): Promise<DocumentAccess> => {
    const response = await axiosInstance.get(
      `/${company}/library/documents/${documentId}/access`,
    );
    return response.data;
  },

  updateDocumentAccess: async (
    company: string,
    documentId: number,
    data: { restricted: boolean; employee_ids?: number[] },
  ) => {
    const response = await axiosInstance.put(
      `/${company}/library/documents/${documentId}/access`,
      data,
    );
    return response.data as {
      status: string;
      document_id: number;
      restricted: boolean;
      member_count: number;
    };
  },

  /**
   * Vuelve vigente una versión anterior: el servidor la copia como una versión
   * nueva y deja el historial intacto.
   */
  restoreVersion: async (company: string, versionId: number) => {
    const response = await axiosInstance.post(
      `/${company}/library/versions/${versionId}/restore`,
    );
    return response.data as { status: string; message: string; id: number };
  },

  /** Cambia el título del documento (el archivo y sus versiones no se tocan). */
  renameDocument: async (
    company: string,
    documentId: number,
    title: string,
  ) => {
    const response = await axiosInstance.patch(
      `/${company}/library/documents/${documentId}`,
      { title },
    );
    return response.data as { status: string; title: string };
  },

  /** Vence en el acto un enlace compartido de documento. */
  revokeSharedLink: async (company: string, linkId: number) => {
    const response = await axiosInstance.patch(
      `/${company}/library/shared-links/${linkId}/revoke`,
    );
    return response.data;
  },

  getFolderShares: async (company: string): Promise<FolderShare[]> => {
    const response = await axiosInstance.get(
      `/${company}/library/folder-shares`,
    );
    return response.data;
  },

  createFolderShare: async (
    company: string,
    data: {
      department_id: number;
      folder_id: string;
      shared_with_name?: string;
      reason: string;
      expires_at: number;
      read_only: boolean;
    },
  ): Promise<{ message: string; data: FolderShare }> => {
    const response = await axiosInstance.post(
      `/${company}/library/folder-shares`,
      data,
    );
    return response.data;
  },

  reviewFolderShare: async (
    company: string,
    shareId: number,
    action: "approve" | "reject" | "revoke",
    data?: { rejection_reason: string },
  ) => {
    const response = await axiosInstance.patch(
      `/${company}/library/folder-shares/${shareId}/${action}`,
      data,
    );
    return response.data;
  },

  /** Rutas públicas de una carpeta compartida: el token es la autorización. */
  getSharedFolderContent: async (
    company: string,
    token: string,
  ): Promise<SharedFolderContent> => {
    const baseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";
    const response = await fetch(
      `${baseUrl}/${company}/library/shared-folder/${encodeURIComponent(token)}/content`,
    );
    if (!response.ok) {
      throw new Error(
        response.status === 403
          ? "Este enlace expiró."
          : "El enlace no es válido o la carpeta ya no existe.",
      );
    }
    return response.json();
  },

  getSharedFolderDocumentBlob: async (
    company: string,
    token: string,
    documentId: number,
    download = false,
  ) => {
    const baseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";
    const response = await fetch(
      `${baseUrl}/${company}/library/shared-folder/${encodeURIComponent(token)}/documents/${documentId}${download ? "?download=1" : ""}`,
    );
    if (!response.ok) {
      throw new Error("No se pudo cargar el documento.");
    }
    return URL.createObjectURL(await response.blob());
  },

  updateFolderAccess: async (
    company: string,
    folderId: string,
    data: {
      department_id: number;
      restricted: boolean;
      employee_ids?: number[];
    },
  ) => {
    const response = await axiosInstance.put(
      `/${company}/library/folders/${folderId}/access`,
      data,
    );
    return response.data;
  },

  updateFolder: async (
    company: string,
    folderId: string,
    data: { department_id: number; name: string },
  ) => {
    const response = await axiosInstance.patch(
      `/${company}/library/folders/${folderId}`,
      data,
    );
    return response.data;
  },

  deleteFolder: async (
    company: string,
    folderId: string,
    departmentId: number,
  ) => {
    const response = await axiosInstance.delete(
      `/${company}/library/folders/${folderId}`,
      {
        params: { department_id: departmentId },
      },
    );
    return response.data;
  },

  getSharedInfo: async (company: string, token: string) => {
    const baseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";
    const response = await fetch(
      `${baseUrl}/${company}/library/shared/info/${encodeURIComponent(token)}`,
    );
    return response.json();
  },

  moveDocument: async (
    company: string,
    documentId: number,
    folderPath: string,
    departmentId?: number,
    sourceFolderPath?: string,
  ) => {
    const response = await axiosInstance.patch(
      `/${company}/library/documents/${documentId}/move`,
      {
        folder_path: folderPath,
        ...(sourceFolderPath != null
          ? { source_folder_path: sourceFolderPath }
          : {}),
        ...(departmentId != null ? { department_id: departmentId } : {}),
      },
    );
    return response.data;
  },

  /** Réplica (vínculo) de los documentos en otra carpeta de su departamento. */
  copyDocuments: async (
    company: string,
    data: {
      document_ids: number[];
      department_id: number;
      folder_path: string;
    },
  ): Promise<{ copied: number; skipped: number }> => {
    const response = await axiosInstance.post(
      `/${company}/library/documents/copy`,
      data,
    );
    return response.data;
  },

  moveDocumentsBatch: async (
    company: string,
    data: {
      document_ids: number[];
      department_id: number;
      folder_path: string;
      source_folder_path?: string;
    },
  ) => {
    const response = await axiosInstance.post(
      `/${company}/library/documents/move-batch`,
      data,
    );
    return response.data;
  },

  getShareRequests: async (company: string, params?: { status?: string }) => {
    const response = await axiosInstance.get(
      `/${company}/library/share-requests`,
      { params },
    );
    return response.data;
  },

  createShareRequest: async (
    company: string,
    data: {
      document_id: number;
      version_id?: number;
      shared_with_name?: string;
      reason: string;
      expires_at: number;
      read_only?: boolean;
    },
  ) => {
    const response = await axiosInstance.post(
      `/${company}/library/share-requests`,
      data,
    );
    return response.data;
  },

  approveShareRequest: async (company: string, requestId: number) => {
    const response = await axiosInstance.patch(
      `/${company}/library/share-requests/${requestId}/approve`,
    );
    return response.data;
  },

  rejectShareRequest: async (
    company: string,
    requestId: number,
    rejectionReason: string,
  ) => {
    const response = await axiosInstance.patch(
      `/${company}/library/share-requests/${requestId}/reject`,
      {
        rejection_reason: rejectionReason,
      },
    );
    return response.data;
  },
};

export default libraryService;
