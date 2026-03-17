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
     * Obtiene el archivo como un Blob para visualización segura
     */
    getFileBlob: async (company: string, documentId: number) => {
        const response = await axiosInstance.get(`/${company}/library/view/${documentId}`, {
            responseType: 'blob' 
        });
        // Creamos una URL temporal que solo vive en la sesión del navegador
        return URL.createObjectURL(response.data);
    }
};

export default libraryService;