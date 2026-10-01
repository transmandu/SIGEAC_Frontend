import axiosInstance from "./axios";

export type FileServerType = "file" | "document";

// Los assets del backend no son públicos: se piden al endpoint autenticado de la
// compañía con el path en base64 y se devuelven como blob.
const fileServerEndpoint = (
  path: string,
  company: string,
  type: FileServerType = "file",
): string =>
  type === "file"
    ? `/${company}/files/serve/${btoa(path)}`
    : `/${company}/sms/document/${btoa(path)}`;

// El blob ya trae el MIME type que envía el backend, así que el object URL se
// puede usar tal cual en <Image unoptimized> o en un <img> normal.
export const fetchFileBlobUrl = async (
  path: string,
  company: string,
  type: FileServerType = "file",
  signal?: AbortSignal,
): Promise<string> => {
  const response = await axiosInstance.get(
    fileServerEndpoint(path, company, type),
    {
      responseType: "blob",
      signal,
    },
  );

  return URL.createObjectURL(response.data as Blob);
};
