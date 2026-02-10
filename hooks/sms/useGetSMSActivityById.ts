import axiosInstance from "@/lib/axios";
import { SMSActivity } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

const fetchSMSActivityById = async ({
  company,
  id,
}: {
  company?: string;
  id: string;
}) => {
  const { data } = await axiosInstance.get(`/${company}/sms/activities/${id}`);

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

export const useGetSMSActivityById = ({
  company,
  id,
}: {
  company?: string;
  id: string;
}) => {
  const query = useQuery<SMSActivity>({
    queryKey: ["sms-activity", id], // Incluye el ID en la clave de la query
    queryFn: () => fetchSMSActivityById({ company, id }), // Pasa el ID a la función fetchUser
    staleTime: 1000 * 60 * 5, // 5 minutos
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
