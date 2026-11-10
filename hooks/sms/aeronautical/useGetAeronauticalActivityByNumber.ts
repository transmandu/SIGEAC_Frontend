import axiosInstance from "@/lib/axios";
import type { AeronauticalActivity } from "@/types/sms/aeronautical/activity";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

const fetchAeronauticalActivityByNumber = async ({
  company,
  activityNumber,
}: {
  company?: string;
  activityNumber: string;
}): Promise<AeronauticalActivity> => {
  const { data } = await axiosInstance.get(
    `/${company}/sms/aeronautical/activities/${activityNumber}`,
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
      console.error("Error loading activity image:", error);
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
      console.error("Error loading activity document:", error);
      data.documentUrl = null;
    }
  }

  return data;
};

export const useGetAeronauticalActivityByNumber = ({
  company,
  activityNumber,
}: {
  company?: string;
  activityNumber: string;
}) => {
  const query = useQuery<AeronauticalActivity>({
    queryKey: ["aeronautical-activity", company, activityNumber],
    queryFn: () =>
      fetchAeronauticalActivityByNumber({ company, activityNumber }),
    staleTime: 1000 * 60 * 5,
    enabled: !!company && !!activityNumber,
  });

  useEffect(() => {
    return () => {
      if (query.data?.imageUrl) URL.revokeObjectURL(query.data.imageUrl);
      if (query.data?.documentUrl) URL.revokeObjectURL(query.data.documentUrl);
    };
  }, [query.data?.imageUrl, query.data?.documentUrl]);

  return query;
};
