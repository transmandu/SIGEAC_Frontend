// lib/download-helper.ts
import axiosInstance from "@/lib/axios";

/**
 * Descarga un archivo desde el backend manejando el Blob y el Token de seguridad.
 * @param url - La ruta de la API (ej: /empresa/library/documents/1/download)
 * @param fileName - El nombre con el que se guardará el archivo (ej: manual_v2.pdf)
 */
export const downloadDocumentFile = async (url: string, fileName: string) => {
  try {
    const response = await axiosInstance.get(url, {
      responseType: 'blob', // 👈 Crucial: Indica a Axios que el retorno es un archivo binario
    });

    // 1. Creamos una URL temporal que apunta al objeto Blob en memoria
    const urlBlob = window.URL.createObjectURL(new Blob([response.data]));

    // 2. Creamos un elemento <a> invisible para disparar la descarga
    const link = document.createElement('a');
    link.href = urlBlob;
    link.setAttribute('download', fileName);

    // 3. Lo añadimos al DOM, simulamos el click y lo removemos
    document.body.appendChild(link);
    link.click();
    
    // 4. Limpieza de memoria (importante para no saturar el navegador)
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(urlBlob);
    
    return true;
  } catch (error) {
    console.error("Error en la descarga del archivo:", error);
    throw error; // Re-lanzamos para que el modal pueda mostrar el toast.error
  }
};