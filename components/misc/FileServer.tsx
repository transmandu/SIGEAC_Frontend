import { useEffect, useState, ReactNode } from "react";
import axios from "axios";
import axiosInstance from "@/lib/axios";

type FileServerChildrenFn = (
    url: string | null,
    isLoading: boolean,
    hasError: boolean
) => ReactNode;

interface FileServerProps {
    path: string;
    company: string;
    type?: "file" | "document";
    children: FileServerChildrenFn;
}

export const FileServer = ({
    path,
    company,
    type = "file",
    children
}: FileServerProps) => {
    const [url, setUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [hasError, setHasError] = useState<boolean>(false);

    useEffect(() => {
        const abortController = new AbortController();
        let currentUrl: string | null = null;

        const fetchFile = async () => {
            if (!path) return;

            try {
                setIsLoading(true);
                setHasError(false);

                // Endpoint dinámico según el tipo si decides reactivarlo
                const endpoint = type === "file"
                    ? `/${company}/files/serve/${btoa(path)}`
                    : `/${company}/sms/document/${btoa(path)}`;

                const response = await axiosInstance.get(endpoint, {
                    responseType: "blob",
                    signal: abortController.signal
                });

                /**
                 * SOLUCIÓN AL BINARIO:
                 * response.data ya es un Blob porque usamos responseType: 'blob'.
                 * Al crear el ObjectURL directamente desde el blob de la respuesta,
                 * este ya contiene el 'type' (MIME type) correcto enviado por el servidor.
                 */
                const blob = response.data;
                currentUrl = URL.createObjectURL(blob);

                setUrl(currentUrl);
            } catch (e) {
                if (axios.isCancel(e)) return;
                console.error("Error loading file:", e);
                setHasError(true);
            } finally {
                setIsLoading(false);
            }
        };

        fetchFile();

        return () => {
            abortController.abort();
            if (currentUrl) {
                URL.revokeObjectURL(currentUrl);
            }
        };
    }, [path, company, type]);

    return <>{children(url, isLoading, hasError)}</>;
};
