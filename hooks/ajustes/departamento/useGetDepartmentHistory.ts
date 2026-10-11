import axios from "@/lib/axios";
import { DepartmentAuditLog, DepartmentMembership } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchHistory = async (
  company: string | undefined,
  departmentId: number | null,
): Promise<DepartmentMembership[]> => {
  const { data } = await axios.get(
    `/${company}/departments/${departmentId}/history`,
  );
  return data;
};

const fetchAuditLogs = async (
  company: string | undefined,
  departmentId: number | null,
): Promise<DepartmentAuditLog[]> => {
  const { data } = await axios.get(
    `/${company}/departments/${departmentId}/audit-logs`,
  );
  return data;
};

export const useGetDepartmentHistory = (
  company: string | undefined,
  departmentId: number | null,
) => {
  return useQuery<DepartmentMembership[], Error>({
    queryKey: ["departments", company, departmentId, "history"],
    queryFn: () => fetchHistory(company, departmentId),
    enabled: !!company && departmentId !== null,
  });
};

export const useGetDepartmentAuditLogs = (
  company: string | undefined,
  departmentId: number | null,
) => {
  return useQuery<DepartmentAuditLog[], Error>({
    queryKey: ["departments", company, departmentId, "audit-logs"],
    queryFn: () => fetchAuditLogs(company, departmentId),
    enabled: !!company && departmentId !== null,
  });
};
