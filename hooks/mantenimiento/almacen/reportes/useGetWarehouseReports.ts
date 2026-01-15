// hooks/useInventoryExport.ts
"use client";
import axiosInstance from "@/lib/axios";
import { useCompanyStore } from "@/stores/CompanyStore";
import axios from "axios";
import { useEffect, useRef, useState } from "react";

type Category = "COMPONENT" | "CONSUMABLE" | "TOOL";

type ExportParams = {
  category: Category;
  search?: string | null;
  // Ejemplos: { condition: 'SERVICIABLE' } ó { group: 'QUIMICOS' }
  filters?: Record<string, string | number | boolean | null | undefined>;
  dateFrom?: string | null; // 'YYYY-MM-DD'
  dateTo?: string | null; // 'YYYY-MM-DD'
  filenamePrefix?: string;
};

type State = { pdf: boolean; xlsx: boolean };

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

export function useInventoryExport() {
  const { selectedCompany, selectedStation } = useCompanyStore();
  const [exporting, setExporting] = useState<State>({
    pdf: false,
    xlsx: false,
  });
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  const buildParams = (p: ExportParams) => {
    const params: Record<string, any> = {
      category: p.category,
      search: p.search?.trim() || undefined,
      date_from: p.dateFrom || undefined,
      date_to: p.dateTo || undefined,
      ...p.filters, // condition, group, etc.
    };
    // limpia null/undefined
    Object.keys(params).forEach(
      (k) => (params[k] == null || params[k] === "") && delete params[k]
    );
    return params;
  };

  const run = async (kind: "pdf" | "xlsx", p: ExportParams) => {
    if (!selectedCompany) throw new Error("Falta companySlug");
    if (selectedStation == null) throw new Error("Falta locationId");

    setExporting((s) => ({ ...s, [kind]: true }));
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    const base = p.filenamePrefix || "inventario";
    const filename = `${base}_${p.category.toLowerCase()}.${kind === "pdf" ? "pdf" : "xlsx"}`;

    const endpoint =
      kind === "pdf"
        ? `/${selectedCompany.slug}/${selectedStation}/articles-by-category-export-pdf`
        : `/${selectedCompany.slug}/${selectedStation}/articles-by-category-export-excel`;

    try {
      const res = await axiosInstance.get(endpoint, {
        params: buildParams(p),
        responseType: "blob",
        signal: abortRef.current.signal,
      });
      downloadBlob(res.data as Blob, filename);
    } finally {
      setExporting((s) => ({ ...s, [kind]: false }));
    }
  };

  const exportPdf = (p: ExportParams) => run("pdf", p);
  const exportExcel = (p: ExportParams) => run("xlsx", p);

  return { exporting, exportPdf, exportExcel };
}
