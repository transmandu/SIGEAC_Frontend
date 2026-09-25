"use client";
import axiosInstance from "@/lib/axios";
import { useCompanyStore } from "@/stores/CompanyStore";
import axios from "axios";
import { useEffect, useRef, useState } from "react";

type Category = "COMPONENT" | "PART" | "CONSUMABLE" | "TOOL";

/**
 * La exportación recibe los mismos filtros que el listado del almacén, con
 * los mismos nombres (`search`, `status`, `tool_status`, `condition`, `zone`,
 * `is_hazardous`, filtros de columna): lo que se exporta es lo que la tabla
 * muestra.
 */
type ExportParams = {
  category: Category;
  filters?: Record<string, string | number | boolean | null | undefined>;
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

type UseInventoryExportReturn = {
  exporting: State;
  exportPdf: (p: ExportParams) => Promise<void>;
  exportExcel: (p: ExportParams) => Promise<void>;
};

export function useInventoryExport(): UseInventoryExportReturn {
  const { selectedCompany, selectedStation } = useCompanyStore();
  const [exporting, setExporting] = useState<State>({
    pdf: false,
    xlsx: false,
  });
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  const buildParams = (p: ExportParams): Record<string, any> => {
    const params: Record<string, any> = {
      category: p.category,
      ...p.filters,
    };
    Object.keys(params).forEach((k) => {
      if (params[k] === true) params[k] = 1;
      if (params[k] == null || params[k] === "" || params[k] === false)
        delete params[k];
    });
    return params;
  };

  const run = async (kind: "pdf" | "xlsx", p: ExportParams): Promise<void> => {
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

  const exportPdf = (p: ExportParams): Promise<void> => run("pdf", p);
  const exportExcel = (p: ExportParams): Promise<void> => run("xlsx", p);

  return { exporting, exportPdf, exportExcel };
}
