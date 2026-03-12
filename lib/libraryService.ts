import axiosInstance from './axios';

// Definimos una interfaz básica para los documentos (opcional pero recomendado en TS)
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
        return response.data; // Retorna { total: x, data: { Area: [docs] } }
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
     * Retorna la URL completa para el visor de PDFs
     */
    getViewUrl: (company: string, id: number) => {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
        return `${baseUrl}/${company}/library/view?id=${id}`;
    }
};

export default libraryService;