import axiosInstance from "@/lib/axios";
import { ObligatoryReport } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

/**
 * Aeronautical obligatory report detail.
 *
 * The airline and aeronautical obligatory reports live in different tables and
 * controllers, so they cannot share the generic `/sms/obligatory-reports`
 * endpoint.
 */
const fetchObligatoryReportById = async ({
  company,
  id,
}: {
  company?: string;
  id: string;
}) => {
  const { data } = await axiosInstance.get(
    `/${company}/sms/aeronautical/obligatory-reports/${id}`,
  );

  if (data.image) {
    try {
      const encodedImagePath = btoa(data.image);
      const imageResponse = await axiosInstance.get(
        `/${company}/sms/image/${encodedImagePath}`,
        { responseType: "blob" },
      );
      data.imageUrl = URL.createObjectURL(new Blob([imageResponse.data]));
    } catch (error) {
      console.error("Error loading image:", error);
      data.imageUrl = null;
    }
  }

  if (data.document) {
    try {
      const encodedDocumentPath = btoa(data.document);
      const documentResponse = await axiosInstance.get(
        `/${company}/sms/document/${encodedDocumentPath}`,
        { responseType: "blob" },
      );
      data.documentUrl = URL.createObjectURL(new Blob([documentResponse.data]));
    } catch (error) {
      console.error("Error loading document:", error);
      data.documentUrl = null;
    }
  }

  return data;
};

export const useGetAeronauticalObligatoryReportById = ({
  company,
  id,
}: {
  company?: string;
  id: string;
}) => {
  const query = useQuery<ObligatoryReport>({
    queryKey: ["aeronautical-obligatory-report", company, id],
    queryFn: () => fetchObligatoryReportById({ company, id }),
    staleTime: 1000 * 60 * 5,
    enabled: !!company && !!id,
  });

  useEffect(() => {
    return () => {
      if (query.data?.imageUrl) URL.revokeObjectURL(query.data.imageUrl);
      if (query.data?.documentUrl) URL.revokeObjectURL(query.data.documentUrl);
    };
  }, [query.data?.imageUrl, query.data?.documentUrl]);

  return query;
};
