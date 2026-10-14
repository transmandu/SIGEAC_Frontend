"use client";

import axiosInstance from "@/lib/axios";
import { AircraftAcronym } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchAircraftAcronyms = async (
  company: string | undefined,
): Promise<AircraftAcronym[]> => {
  const { data } = await axiosInstance.get(
    `/${company}/aeronautical/aircraft-acronyms`,
  );
  return data;
};

export const useGetAircraftAcronyms = (company: string | undefined) => {
  return useQuery<AircraftAcronym[]>({
    queryKey: ["aircraft-acronyms", "aeronautical", company],
    queryFn: () => fetchAircraftAcronyms(company),
    staleTime: 1000 * 60 * 5,
    enabled: !!company,
  });
};
