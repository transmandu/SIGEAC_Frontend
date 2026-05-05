import { useEffect, useState, ReactNode } from "react";
import axios from "axios";
import axiosInstance from "@/lib/axios";

// Definición estricta de la función para evitar el error "implicitly has any type"
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

        const fetchFile = async () => {
            if (!path) return;

            try {
                setIsLoading(true);
                setHasError(false);

                // const endpoint = type === "file"
                //     ? `/${company}/files/serve/${btoa(path)}`
                //     : `/${company}/sms/document/${btoa(path)}`;


                const endpoint = `/${company}/files/serve/${btoa(path)}`;

                const { data } = await axiosInstance.get(endpoint, {
                    responseType: "blob",
                    signal: abortController.signal
                });

                const newUrl = URL.createObjectURL(new Blob([data]));
                setUrl(newUrl);
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
            if (url) {
                URL.revokeObjectURL(url);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [path, company, type]);

    return <>{children(url, isLoading, hasError)}</>;
};
