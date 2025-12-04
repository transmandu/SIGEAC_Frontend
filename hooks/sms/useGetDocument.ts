// hooks/useGetSMSDocument.ts
import axiosInstance from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

interface UseGetSMSDocumentProps {
  company?: string;
  fileName: string;
  enabled?: boolean;
}

const fetchSMSDocument = async ({
  company,
  fileName,
}: UseGetSMSDocumentProps): Promise<string> => {
  if (!company || !fileName) {
    throw new Error("Compañía o nombre de archivo no proporcionado");
  }

  const encodedDocumentPath = btoa(fileName);

  const response = await axiosInstance.get(
    `${company}/sms/document/${encodedDocumentPath}`,
    {
      responseType: "blob",
      timeout: 30000,
    }
  );

  const blob = new Blob([response.data], {
    type: response.data.type || "application/pdf",
  });
  return URL.createObjectURL(blob);
};

export const useGetDocument = (props: UseGetSMSDocumentProps) => {
  const { company, fileName, enabled = true } = props;

  return useQuery<string, Error>({
    queryKey: ["sms-document", company, fileName],
    queryFn: () => fetchSMSDocument(props),
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos (cache)
    enabled: !!company && !!fileName && enabled,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
