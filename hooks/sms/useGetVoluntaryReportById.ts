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

  // Si hay imagen, crear la URL blob inmediatamente
  if (data.image) {
    const encodedFilePath: string = btoa(data.image);
    try {
      const imageResponse = await axiosInstance.get(
        `/${company}/report-image/${encodedFilePath}`,
        {
          responseType: "blob",
        }
      );

      const blob = new Blob([imageResponse.data]);
      data.imageUrl = URL.createObjectURL(blob);
    } catch (error) {
      console.error("Error loading image:", error);
      data.imageUrl = null;
    }
  } else {
    data.imageUrl = null;
  }

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

  // Cleanup de la imagen cuando el componente se desmonta o los datos cambian
  useEffect(() => {
    return () => {
      if (query.data?.imageUrl) {
        URL.revokeObjectURL(query.data.imageUrl);
      }
    };
  }, [query.data?.imageUrl]);
console.log("imageUrl",query.data?.imageUrl);
  return query;
};
