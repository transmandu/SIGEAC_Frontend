import axios from "@/lib/axios";
import type {
  IndividualStatus,
  ToolHolder,
} from "@/types/general-article-individual";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useQuery } from "@tanstack/react-query";

export interface IndividualHistoryEvent {
  at: string;
  /** Alta, cambio de estado o corrección del identificador. */
  event: "IDENTIFIED" | "STATUS" | "UPDATED";
  /** Estado al que pasó, en un cambio de estado. */
  status: IndividualStatus | null;
  detail: string | null;
  by: string | null;
  dispatch: ToolHolder | null;
}

export interface IndividualHistory {
  individual: {
    id: number;
    identifier: string;
    status: IndividualStatus;
    description: string | null;
  };
  events: IndividualHistoryEvent[];
}

export interface ToolBoxHistoryEntry {
  at: string;
  /** De quién es el hecho: la propia caja o algo de lo que guarda. */
  source: "BOX" | "TOOL" | "INDIVIDUAL";
  subject: string | null;
  event: string;
  status: string | null;
  detail: string | null;
  by: string | null;
  dispatch: ToolHolder | null;
}

export interface ToolBoxHistory {
  box: { id: number; name: string };
  entries: ToolBoxHistoryEntry[];
}

/** Historial de un artículo individual; solo se pide con el diálogo abierto. */
export const useGetIndividualHistory = (id: number | null) => {
  const { selectedCompany } = useCompanyStore();

  return useQuery<IndividualHistory, Error>({
    queryKey: [
      "general-articles",
      selectedCompany?.slug,
      "individual-history",
      id,
    ],
    queryFn: async () => {
      const { data } = await axios.get(
        `/${selectedCompany?.slug}/general-article-individuals/${id}/history`,
      );
      return data;
    },
    enabled: !!id && !!selectedCompany,
  });
};

/** Historial de una caja de herramientas y de lo que guarda. */
export const useGetToolBoxHistory = (id: number | null) => {
  const { selectedCompany } = useCompanyStore();

  return useQuery<ToolBoxHistory, Error>({
    queryKey: ["tool-boxes", selectedCompany?.slug, "history", id],
    queryFn: async () => {
      const { data } = await axios.get(
        `/${selectedCompany?.slug}/tool-box/${id}/history`,
      );
      return data;
    },
    enabled: !!id && !!selectedCompany,
  });
};
