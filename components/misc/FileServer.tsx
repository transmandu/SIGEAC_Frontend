import { useEffect, useState, ReactNode } from "react";
import axios from "axios";
import { fetchFileBlobUrl, FileServerType } from "@/lib/file-server";

type FileServerChildrenFn = (
  url: string | null,
  isLoading: boolean,
  hasError: boolean,
) => ReactNode;

interface FileServerProps {
  path: string;
  company: string;
  type?: FileServerType;
  children: FileServerChildrenFn;
}

export const FileServer = ({
  path,
  company,
  type = "file",
  children,
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

        currentUrl = await fetchFileBlobUrl(
          path,
          company,
          type,
          abortController.signal,
        );

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
