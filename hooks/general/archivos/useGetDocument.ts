  // hooks/useGetSMSDocument.ts
  import axiosInstance from "@/lib/axios";
  import { useQuery } from "@tanstack/react-query";

  interface UseGetDocumentProps {
    company?: string;
    fileName: string;
    origin?: string; // Para consistencia con useGetImage
  }

  const fetchDocument = async ({
    company,
    fileName,
    origin = "sms", // Valor por defecto
  }: UseGetDocumentProps): Promise<string> => {
    const encodedDocumentPath = btoa(fileName);
    const response = await axiosInstance.get(
      `${company}/${origin}/document/${encodedDocumentPath}`,
      {
        responseType: "blob",
      }
    );

    // Verificar que sea un documento válido (PDF u otro tipo)
    const contentType = response.headers["content-type"] || response.data.type;
    const isValidDocument =
      contentType.includes("pdf") ||
      contentType.includes("application/") ||
      contentType.includes("text/");

    if (!isValidDocument) {
      throw new Error("El archivo no es un documento válido");
    }

    const blob = new Blob([response.data], {
      type: contentType || "application/pdf",
    });

    return URL.createObjectURL(blob);
  };

  export const useGetDocument = (props: UseGetDocumentProps) => {
    const { company, fileName, origin = "sms" } = props;

    return useQuery<string, Error>({
      queryKey: ["document", company, origin, fileName],
      queryFn: () => fetchDocument(props),
      staleTime: 1000 * 60 * 5, // 5 minutos
      gcTime: 1000 * 60 * 10, // 10 minutos (cache)
      enabled: !!company && !!fileName,
    });
  };
