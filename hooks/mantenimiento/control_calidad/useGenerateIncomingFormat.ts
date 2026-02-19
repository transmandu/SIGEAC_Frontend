import axiosInstance from "@/lib/axios";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useMutation } from "@tanstack/react-query";

export type GenerateReceptionFormPayload = {
  inspection_date: string;
  purchase_order_code: string;
  client: string;
  others?: string | null;
  article_ids: number[];
};

export function useGenerateIncomingFormat() {
  const { selectedCompany } = useCompanyStore();

  return useMutation({
    mutationFn: async (payload: GenerateReceptionFormPayload) => {
      const company = selectedCompany?.slug;
      if (!company) throw new Error("Empresa no seleccionada.");

      const res = await axiosInstance.post(
        `/${company}/incoming-format`,
        payload,
        { responseType: "blob" }
      );

      const disposition = res.headers?.["content-disposition"];
      const filename =
        filenameFromDisposition(disposition) ??
        `H74-036_${payload.purchase_order_code}_${payload.inspection_date}.pdf`;

      downloadBlob(res.data, filename);

      return true;
    },
  });
}

function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

function filenameFromDisposition(disposition?: string) {
  if (!disposition) return null;
  // attachment; filename="xxx.pdf"  | filename*=UTF-8''xxx.pdf
  const match = /filename\*?=(?:UTF-8''|")?([^;"\n]+)"?/i.exec(disposition);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}
