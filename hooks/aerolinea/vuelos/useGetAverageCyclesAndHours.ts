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
  dateRange?: DateRange
): Promise<AverageCyclesAndHoursResponse> => {
 
  const { data } = await axiosInstance.get(
    `/${company}/average-cycles-and-hours/${acronym}?first_date=${dateRange?.first_date}&second_date=${dateRange?.second_date}`);
    console.log(data);
  return data;
};

export const useGetAverageCyclesAndHours = (
  company?: string,
  acronym?: string,
  dateRange?: DateRange
) => {
  return useQuery<AverageCyclesAndHoursResponse, Error>({
    queryKey: ["average-cycles-hours", company, acronym, dateRange],
    queryFn: () => fetchAverageCyclesAndHours(company, acronym, dateRange),
    refetchOnWindowFocus: false,
    enabled: !!company && !!acronym && !!dateRange?.first_date && !!dateRange?.second_date,
  });
};
