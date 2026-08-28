import axiosInstance from "@/lib/axios";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type GenerateReceptionFormPayload = {
  inspection_date: string;
  purchase_order_code: string | null;
  client: string | null;
  others: string | null;
  article_ids: number[];
  download: boolean;
  /** Al corregir, el formato que esta emisión reemplaza: el backend lo anula. */
  corrects_inspection_id?: number | null;
  void_reason?: string | null;
  /** false = la columna Vo/Bo del checklist sale en blanco en el PDF. */
  show_checklist?: boolean;
};

export type IssuedIncomingFormat = {
  id: number;
  purchase_order_code: string | null;
  inspection_date: string;
  verified_by: string;
  pdf_path: string | null;
  issuance_status: "ISSUED" | "VOIDED";
  corrects_inspection_id: number | null;
  void_reason: string | null;
  voided_by: string | null;
  voided_at: string | null;
  printed_client: string | null;
  printed_others: string | null;
  items?: { id: number; article_id: number; quantity: number }[];
};

// El flag download (checkbox en la UI) solo decide si la respuesta es el PDF
// como blob o un JSON: en ambos casos los artículos pasan a WAITING_TO_LOCATE,
// salvo que sea una corrección, que no mueve inventario.
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
      ).catch(async (e) => {
        throw new Error(await messageFromError(e));
      });

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
      queryClient.invalidateQueries({ queryKey: ["incoming-formats"] });
      if (company) {
        queryClient.invalidateQueries({ queryKey: ["articles", company, "WAITING_FOR_FORMAT"] });
        queryClient.invalidateQueries({ queryKey: ["articles", company, "WAITING_TO_LOCATE"] });
      }
    },
  });
}

export function useGetIssuedIncomingFormats(search?: string) {
  const { selectedCompany } = useCompanyStore();
  const company = selectedCompany?.slug;

  return useQuery({
    queryKey: ["incoming-formats", company, search ?? ""],
    queryFn: async () => {
      const res = await axiosInstance.get<IssuedIncomingFormat[]>(
        `/${company}/incoming-formats`,
        { params: search ? { search } : undefined }
      );
      return res.data;
    },
    enabled: !!company,
  });
}

/** Baja el PDF tal cual quedó archivado, sin regenerarlo. */
export function useReprintIncomingFormat() {
  const { selectedCompany } = useCompanyStore();

  return useMutation({
    mutationFn: async (format: IssuedIncomingFormat) => {
      const company = selectedCompany?.slug;
      if (!company) throw new Error("Empresa no seleccionada.");

      const res = await axiosInstance.get(
        `/${company}/incoming-formats/${format.id}/reprint`,
        { responseType: "blob" }
      ).catch(async (e) => {
        throw new Error(await messageFromError(e));
      });

      const filename =
        filenameFromDisposition(res.headers?.["content-disposition"]) ??
        `H74-036_${format.purchase_order_code ?? "N_A"}.pdf`;

      downloadBlob(res.data, filename);
      return true;
    },
  });
}

/**
 * Con responseType blob el cuerpo del error también llega como Blob, así que el
 * mensaje del backend hay que leerlo antes de poder mostrarlo.
 */
async function messageFromError(e: any): Promise<string> {
  const data = e?.response?.data;

  if (data instanceof Blob) {
    try {
      return JSON.parse(await data.text())?.message ?? "No se pudo generar el formato.";
    } catch {
      return "No se pudo generar el formato.";
    }
  }

  return data?.message ?? e?.message ?? "No se pudo generar el formato.";
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
