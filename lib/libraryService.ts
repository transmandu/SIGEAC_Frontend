import axiosInstance from './axios';

export interface Document {
    id: number;
    title: string;
    document: string;
    category_name: string;
    department_name: string;
    folder_path: string | null;
    emission_date: string | null;
    expiration_date: string | null;
    status: 'vigente' | 'vencido' | 'no_aplica';
    created_at: string;
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
        const response = await axiosInstance.post(`/${company}/library/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    /**
     * Elimina un documento por ID
     */
    deleteDocument: async (company: string, id: number | string) => {
        const response = await axiosInstance.delete(`/${company}/library/documents/${id}`);
        return response.data;
    },

    /**
     * Retorna la URL para el visor (usada como fallback)
     */
    getViewUrl: (company: string, id: number) => {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
        return `${baseUrl}/${company}/library/view/${id}`;
    },

    /**
     * Obtiene el archivo como un Blob para visualización segura.
     * Soporta ID privado (number) o Token Público QR (string).
     */
    getFileBlob: async (company: string, documentId: number | string, isVersionHistory: boolean = false) => {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

        // CASO A: Es un escaneo de QR Público (Llega un Token string de 32+ caracteres)
        if (typeof documentId === 'string' && documentId.length > 10) {
            const encodedToken = encodeURIComponent(documentId);
            const response = await fetch(`${baseUrl}/${company}/library/shared/content/${encodedToken}`, {
                method: 'GET',
            });

            if (!response.ok) {
                throw new Error('No se pudo establecer una conexión para cargar el documento público.');
            }

            const blob = await response.blob();
            return URL.createObjectURL(blob);
        }

        // CASO B: Es una versión anterior del historial (Llega con la bandera activada)
        if (isVersionHistory) {
            const response = await axiosInstance.get(`/${company}/library/versions/${documentId}/view`, {
                responseType: 'blob' 
            });
            return URL.createObjectURL(response.data);
        }

        // CASO C: Es la vista privada normal dentro del sistema (Llega un ID numérico normal)
        const response = await axiosInstance.get(`/${company}/library/view/${documentId}`, {
            responseType: 'blob' 
        });
        return URL.createObjectURL(response.data);
    },

    /**
     * Obtiene el historial de trazabilidad de la empresa
     */
    getTrazabilidad: async (company: string) => {
        const response = await axiosInstance.get(`/${company}/library/trazabilidad`);
        return response.data;
    },

    /**
     * Registra una acción (VIEW/DOWNLOAD) en la auditoría
     */
    registerLog: async (company: string, documentId: number, action: 'VIEW' | 'DOWNLOAD') => {
        const response = await axiosInstance.post(`/${company}/library/logs`, {
            document_id: documentId,
            action: action
        });
        return response.data;
    },

    getFolders: async (company: string, departmentId: number) => {
        const response = await axiosInstance.get(`/${company}/library/folders`, {
            params: { department_id: departmentId }
        });
        return response.data;
    },

    createFolder: async (company: string, data: { department_id: number; name: string; parent_id?: string }) => {
        const response = await axiosInstance.post(`/${company}/library/folders`, data);
        return response.data;
    },

    updateFolder: async (company: string, folderId: string, data: { department_id: number; name: string }) => {
        const response = await axiosInstance.patch(`/${company}/library/folders/${folderId}`, data);
        return response.data;
    },

    deleteFolder: async (company: string, folderId: string, departmentId: number) => {
        const response = await axiosInstance.delete(`/${company}/library/folders/${folderId}`, {
            params: { department_id: departmentId }
        });
        return response.data;
    },

    getSharedInfo: async (company: string, token: string) => {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
        const response = await fetch(`${baseUrl}/${company}/library/shared/info/${encodeURIComponent(token)}`);
        return response.json();
    },

    moveDocument: async (company: string, documentId: number, folderPath: string) => {
        const response = await axiosInstance.patch(`/${company}/library/documents/${documentId}/move`, {
            folder_path: folderPath
        });
        return response.data;
    },

    getShareRequests: async (company: string, params?: { status?: string }) => {
        const response = await axiosInstance.get(`/${company}/library/share-requests`, { params });
        return response.data;
    },

    createShareRequest: async (company: string, data: {
        document_id: number;
        version_id?: number;
        shared_with_name?: string;
        reason: string;
        expires_in_hours: number;
        read_only?: boolean;
    }) => {
        const response = await axiosInstance.post(`/${company}/library/share-requests`, data);
        return response.data;
    },

    approveShareRequest: async (company: string, requestId: number) => {
        const response = await axiosInstance.patch(`/${company}/library/share-requests/${requestId}/approve`);
        return response.data;
    },

    rejectShareRequest: async (company: string, requestId: number, rejectionReason: string) => {
        const response = await axiosInstance.patch(`/${company}/library/share-requests/${requestId}/reject`, {
            rejection_reason: rejectionReason
        });
        return response.data;
    }
};

export default libraryService;
