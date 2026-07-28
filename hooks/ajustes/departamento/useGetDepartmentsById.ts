import axios from "@/lib/axios";
import { Department } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchDepartments = async ({
  company,
  id,
}: {
  company?: string;
  id: string;
}): Promise<Department> => {
  const { data } = await axios.get(`/${company}/departments/${id}`);
  return data;
};

export const useGetDepartmentById = ({
  company,
  id,
}: {
  company?: string;
  id: string;
}) => {
  return useQuery<Department, Error>({
    queryKey: ["departments", company],
    queryFn: () => fetchDepartments({ company, id }),
    enabled: !!id && !!company,
  });
};
