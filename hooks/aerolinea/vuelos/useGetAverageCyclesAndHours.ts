"use client"

import axiosInstance from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export interface AverageCyclesAndHoursResponse {
  aircraft_acronym: string;
  average_flight_hours: number;
  average_flight_cycles: number;
  total_flights: number;
}

interface DateRange {
  first_date: string;
  second_date: string;
}

const fetchAverageCyclesAndHours = async (
  company?: string,
  acronym?: string,
  dateRange?: DateRange | null,
): Promise<AverageCyclesAndHoursResponse> => {
  const { data } = await axiosInstance.get(
    `/${company}/average-cycles-and-hours/${acronym}`,
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
export const useGetAverageCyclesAndHours = (
  company?: string,
  acronym?: string,
  dateRange?: DateRange | null
) => {
  return useQuery<AverageCyclesAndHoursResponse, Error>({
    queryKey: ["average-cycles-hours", company, acronym, dateRange],
    queryFn: () => fetchAverageCyclesAndHours(company, acronym, dateRange?? null),
    refetchOnWindowFocus: false,
    enabled: !!company && !!acronym
  });
};
