import axiosInstance from "@/lib/axios";
import { SMSActivity } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

const fetchSMSActivityByNumber = async ({
  company,
  activityNumber,
}: {
  company?: string;
  activityNumber: string;
}) => {
  const { data } = await axiosInstance.get(`/${company}/sms/activities/${activityNumber}`);

  // Cargar imagen como Blob para poder mostrarla desde el disco privado
  if (data.image) {
    try {
      const encodedImagePath = btoa(data.image);
      const imageResponse = await axiosInstance.get(
        `/${company}/sms/image/${encodedImagePath}`,
        { responseType: "blob" }
      );
      data.imageUrl = URL.createObjectURL(new Blob([imageResponse.data]));
    } catch (error) {
      console.error("Error loading activity image:", error);
      data.imageUrl = null;
    }
  }

  // Cargar documento como Blob
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
      console.error("Error loading activity document:", error);
      data.documentUrl = null;
    }
  }

  return data;
};

export const useGetSMSActivityByNumber = ({
  company,
  activityNumber,
}: {
  company?: string;
  activityNumber: string;
}) => {
  const query = useQuery<SMSActivity>({
    queryKey: ["sms-activity", activityNumber],
    queryFn: () => fetchSMSActivityByNumber({ company, activityNumber }),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!company,
  });

  // Cleanup de URLs para evitar memory leaks
  useEffect(() => {
    return () => {
      if (query.data?.imageUrl) URL.revokeObjectURL(query.data.imageUrl);
      if (query.data?.documentUrl) URL.revokeObjectURL(query.data.documentUrl);
    };
  }, [query.data?.imageUrl, query.data?.documentUrl]);

  return query;
};
