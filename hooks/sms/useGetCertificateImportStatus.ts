import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import type { SMSCertificateImport } from "@/types";

const ACTIVE_STATUSES = ["queued", "running"];

const fetchCertificateImportStatus = async (
  company: string,
  importId: string,
): Promise<SMSCertificateImport> => {
  const { data } = await axiosInstance.get<{ data: SMSCertificateImport }>(
    `/${company}/sms/certificates/bulk/${importId}`,
  );

  return data.data;
};

/**
 * Consulta el avance de una carga masiva. Solo sigue consultando mientras el
 * job está en cola o corriendo; al terminar se detiene solo.
 */
export const useGetCertificateImportStatus = (
  company: string | undefined,
  importId: string | null,
  enabled = true,
) => {
  return useQuery<SMSCertificateImport, Error>({
    queryKey: ["sms-certificate-import", company, importId],
    queryFn: () =>
      fetchCertificateImportStatus(company as string, importId as string),
    enabled: !!company && !!importId && enabled,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status && ACTIVE_STATUSES.includes(status) ? 1000 : false;
    },
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
};
