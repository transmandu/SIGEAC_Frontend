import axiosInstance from './axios';

export interface Document {
    id: number;
    title: string;
    document: string;
    category_name: string;
    department_name: string;
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
    deleteDocument: async (company: string, id: number) => {
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
            const response = await fetch(`${baseUrl}/${company}/library/shared/content/${documentId}`, {
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
    }
};

export default libraryService;