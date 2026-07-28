import axios from "@/lib/axios";
import { JobTitle } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchJobTitleById = async ({
  company,
  id,
}: {
  company?: string;
  id: string;
}): Promise<JobTitle> => {
  const { data } = await axios.get(`/${company}/job-titles/${id}`);
  return data;
};

export const useGetJobTitleById = ({
  company,
  id,
}: {
  company?: string;
  id: string;
}) => {
  return useQuery<JobTitle, Error>({
    queryKey: ["job_titles", company],
    queryFn: () => fetchJobTitleById({ company, id }),
    enabled: !!company,
  });
};
