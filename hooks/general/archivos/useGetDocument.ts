import axiosInstance from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

interface UseGetDocumentProps {
  company?: string;
  fileName: string;
  origin?: string;
  enabled?: boolean;
}

const fetchDocument = async ({
  company,
  fileName,
  origin = "sms",
}: UseGetDocumentProps): Promise<string> => {
  const encodedDocumentPath = btoa(fileName);
  const response = await axiosInstance.get(
    `${company}/${origin}/document/${encodedDocumentPath}`,
    { responseType: "blob" }
  );

  const contentType = response.headers["content-type"] || response.data.type;

  const blob = new Blob([response.data], {
    type: contentType || "application/pdf",
  });

  // Devuelve una object URL, no el archivo: quien la consuma debe revocarla.
  return URL.createObjectURL(blob);
};

export const useGetDocument = (props: UseGetDocumentProps) => {
  const { company, fileName, origin = "sms", enabled = true } = props;

  return useQuery<string, Error>({
    queryKey: ["document", company, origin, fileName],
    queryFn: () => fetchDocument(props),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    enabled: enabled && !!company && !!fileName,
  });
};
