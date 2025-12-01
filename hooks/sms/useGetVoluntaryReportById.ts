// hooks/useGetVoluntaryReportById.ts
import axiosInstance from "@/lib/axios";
import { DangerIdentification } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

const fetchVoluntaryReportById = async ({
  company,
  id,
}: {
  company?: string;
  id: string;
}) => {
  const { data } = await axiosInstance.get(
    `/${company}/sms/voluntary-reports/${id}`
  );

  // Solo cargar URLs de imagen y documento
  const loadUrls = async () => {
    // Cargar imagen
    if (data.image) {
      try {
        const encodedImagePath = btoa(data.image);
        const imageResponse = await axiosInstance.get(
          `/${company}/sms/image/${encodedImagePath}`,
          { responseType: "blob" }
        );
        data.imageUrl = URL.createObjectURL(new Blob([imageResponse.data]));
      } catch (error) {
        console.error("Error loading image:", error);
        data.imageUrl = null;
      }
    }

    // Cargar documento
    if (data.document) {
      try {
        const encodedDocumentPath = btoa(data.document);
        const documentResponse = await axiosInstance.get(
          `/${company}/sms/document/${encodedDocumentPath}`,
          { responseType: "blob" }
        );
        data.documentUrl = URL.createObjectURL(
          new Blob([documentResponse.data])
        );
      } catch (error) {
        console.error("Error loading document:", error);
        data.documentUrl = null;
      }
    }
  };

  await loadUrls();
  return data;
};

export type GetVoluntaryReport = {
  id: number;
  report_number: string;
  report_date: Date;
  identification_date: Date;
  danger_location: string;
  danger_area: string;
  description: string;
  airport_location: string;
  possible_consequences: string;
  danger_identification_id: number;
  danger_identification: DangerIdentification;
  status: string;
  reporter_name?: string;
  reporter_last_name?: string;
  reporter_phone?: string;
  reporter_email?: string;
  image?: string;
  document?: string;
  imageUrl?: string;
  documentUrl?: string;
};

export const useGetVoluntaryReportById = ({
  company,
  id,
}: {
  company?: string;
  id: string;
}) => {
  const query = useQuery<GetVoluntaryReport>({
    queryKey: ["voluntary-report", company, id],
    queryFn: () => fetchVoluntaryReportById({ company, id }),
    staleTime: 1000 * 60 * 5,
    enabled: !!company,
  });

  // Cleanup de URLs
  useEffect(() => {
    return () => {
      if (query.data?.imageUrl) URL.revokeObjectURL(query.data.imageUrl);
      if (query.data?.documentUrl) URL.revokeObjectURL(query.data.documentUrl);
    };
  }, [query.data?.imageUrl, query.data?.documentUrl]);

  return query;
};
