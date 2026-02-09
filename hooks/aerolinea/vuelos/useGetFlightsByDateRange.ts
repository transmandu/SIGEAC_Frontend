"use client"

import axiosInstance from "@/lib/axios";
import { FlightControl } from "@/types";
import { useQuery } from "@tanstack/react-query";


interface DateRange {
  first_date: string;
  second_date: string;
}

const fetchFlightsByDateRange = async (
  company?: string,
  acronym?: string,
  dateRange?: DateRange | null,
): Promise<FlightControl[]> => {
  const { data } = await axiosInstance.get(
    `/${company}/flights-by-date-range/${acronym}`,
    {
      params: {
        first_date: dateRange?.first_date,
        second_date: dateRange?.second_date,
      },
    },
  );

  return data;
};

//IF YOU DO NOT HAVE A DATE RANGE, THIS WILL CALCULATE ALL RECORDS
export const useGetFlightsByDateRange = (
  company?: string,
  acronym?: string,
  dateRange?: DateRange | null
) => {
  return useQuery<FlightControl[], Error>({
    queryKey: ["flights-by-date-range", company, acronym, dateRange],
    queryFn: () => fetchFlightsByDateRange(company, acronym, dateRange?? null),
    refetchOnWindowFocus: false,
    enabled: !!company && !!acronym
  });
};
