import axios from "@/lib/axios";
import { AeronauticalAircraft } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchAircraftByAcronym = async (
  company?: string,
  acronym?: string,
): Promise<AeronauticalAircraft> => {
  const { data } = await axios.get(
    `/${company}/aeronautical/aircrafts/${acronym}`,
  );
  return data;
};

export const useGetMaintenanceAircraftByAcronym = (
  company?: string,
  acronym?: string,
) => {
  return useQuery<AeronauticalAircraft, Error>({
    queryKey: ["aircraft", company, acronym],
    queryFn: () => fetchAircraftByAcronym(company, acronym),
    enabled: !!company && !!acronym,
  });
};
