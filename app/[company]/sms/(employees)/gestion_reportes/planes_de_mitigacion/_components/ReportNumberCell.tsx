"use client";

import Link from "next/link";
import { useCompanyStore } from "@/stores/CompanyStore";

interface ReportNumberCellProps {
  reportNumber?: string;
  type: string;
  report_id?: number;
}

export const getFullReportNumber = (reportNumber?: string, type?: string) => {
  if (!reportNumber) return "N/A";
  const prefix = type === "obligatory" ? "ROS-" : "RVP-"; // Ajusta según prefijos reales
  return `${prefix}${reportNumber}`;
};

export const ReportNumberCell = ({
  reportNumber,
  type,
  report_id,
}: ReportNumberCellProps) => {
  const { selectedCompany } = useCompanyStore();
  const displayNumber = getFullReportNumber(reportNumber, type);
  if (!reportNumber || !selectedCompany) return null;

  const href =
    type === "obligatory"
      ? `/${selectedCompany.slug}/sms/reportes/reportes_obligatorios/${report_id}`
      : `/${selectedCompany.slug}/sms/reportes/reportes_voluntarios/${report_id}`;

  return (
    <div className="flex justify-center items-center gap-2">
      <Link
        href={href}
        className="ml-2 font-bold hover:scale-105 transition-all cursor-pointer"
      >
        {displayNumber}
      </Link>
    </div>
  );
};
