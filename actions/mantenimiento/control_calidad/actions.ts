import axiosInstance from "@/lib/axios";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export type GenerateReceptionFormPayload = {
  inspection_date: string;
  purchase_order_code: string | null;
  client: string | null;
  others: string | null;
  article_ids: number[];
  download: boolean;
};

// El flag download (checkbox en la UI) parte el endpoint en dos: con true solo
// devuelve el PDF del formato H74-036 como blob y no toca los artículos; con
// false es cuando el backend los pasa a WAITING_TO_LOCATE.
export function useGenerateIncomingFormat() {
  const { selectedCompany } = useCompanyStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: GenerateReceptionFormPayload) => {
      const company = selectedCompany?.slug;
      if (!company) throw new Error("Empresa no seleccionada.");

      const res = await axiosInstance.post(
        `/${company}/incoming-format`,
        payload,
        { responseType: payload.download ? "blob" : "json" }
      );

      if (payload.download) {
        const disposition = res.headers?.["content-disposition"];
        const filename =
          filenameFromDisposition(disposition) ??
          `H74-036_${(payload.purchase_order_code ?? 'N_A').replace(/[/\\\s]+/g, '_')}_${payload.inspection_date}.pdf`;

        downloadBlob(res.data, filename);
      }

      return true;
    },
    onSuccess: () => {
      const company = selectedCompany?.slug;

      queryClient.invalidateQueries({ queryKey: ["warehouse-articles"] });
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      if (company) {
        queryClient.invalidateQueries({ queryKey: ["articles", company, "WAITING_FOR_FORMAT"] });
        queryClient.invalidateQueries({ queryKey: ["articles", company, "WAITING_TO_LOCATE"] });
      }
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
  // El backend puede mandarlo como filename="x.pdf" o filename*=UTF-8''x.pdf.
  const match = /filename\*?=(?:UTF-8''|")?([^;"\n]+)"?/i.exec(disposition);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}
