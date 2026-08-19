import axios from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export type DimensionCut = {
  id: number;
  input_mode: "MEASURES" | "MAGNITUDE";
  cut_length: number | null;
  cut_width: number | null;
  magnitude: number;
  reason: "DISPATCH" | "ADJUSTMENT" | "SCRAP";
  observation: string | null;
  dispatch_order_id: number | null;
  registered_by: string | null;
  created_at: string | null;
};

export type PieceCutsResponse = {
  piece: {
    id: number;
    code: string;
    initial_magnitude: number;
    remaining_magnitude: number;
    consumed_magnitude: number;
    status: string;
    magnitude_label: string | null;
  };
  cuts: DimensionCut[];
};

/** Trazos cortados de una pieza: explica por qué le queda lo que le queda. */
export const useGetPieceCuts = (
  piece_id: number | null,
  company?: string,
) => {
  return useQuery<PieceCutsResponse, Error>({
    queryKey: ["dimension-piece-cuts", company, piece_id],
    queryFn: async () => {
      const { data } = await axios.get(
        `/${company}/dimension-pieces/${piece_id}/cuts`,
      );
      return data;
    },
    enabled: !!piece_id && !!company,
  });
};

export const useScrapPiece = () => {
  const queryClient = useQueryClient();

  const scrapMutation = useMutation({
    mutationFn: async ({
      pieceId,
      company,
      observation,
    }: {
      pieceId: number;
      company: string;
      /** Se usa para refrescar el detalle del artículo tras la baja. */
      articleId?: number;
      observation?: string;
    }) => {
      const { data } = await axios.post(
        `/${company}/dimension-pieces/${pieceId}/scrap`,
        { observation },
      );
      return data;
    },
    onSuccess: (_data, variables) => {
      // La baja mueve el saldo del artículo, así que el listado de inventario
      // queda desactualizado igual que el detalle de sus piezas.
      queryClient.invalidateQueries({
        queryKey: ["article-dimension", variables.company, variables.articleId],
      });
      queryClient.invalidateQueries({ queryKey: ["general-articles"] });
      toast.success("¡Pieza dada de baja!", {
        description: "La merma quedó registrada en el historial.",
      });
    },
    onError: (error: any) => {
      toast.error("Oops!", {
        description:
          error?.response?.data?.message ?? "No se pudo dar de baja la pieza.",
      });
    },
  });

  return { scrapPiece: scrapMutation };
};
