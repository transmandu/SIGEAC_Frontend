import axios from "@/lib/axios";
import { isAxiosError } from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const errorMessage = (error: unknown, fallback: string): string => {
  if (isAxiosError(error)) {
    const data = error.response?.data;
    const firstFileError = data?.errors?.file?.[0];
    if (typeof firstFileError === "string") return firstFileError;
    if (typeof data?.message === "string") return data.message;
  }
  return fallback;
};

type Variables = { company: string; quoteId: number };

/**
 * La cotización cambia (aparece/desaparece `signed_document`), así que se
 * invalidan el detalle y los listados que la muestran.
 */
const useRefreshQuotes = () => {
  const queryClient = useQueryClient();

  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ["quote"] }),
      queryClient.invalidateQueries({ queryKey: ["quotes"] }),
    ]);
};

export const useUploadSignedQuote = () => {
  const refresh = useRefreshQuotes();

  return useMutation<void, Error, Variables & { file: File }>({
    mutationFn: async ({ company, quoteId, file }) => {
      const body = new FormData();
      body.append("file", file);

      try {
        await axios.post(`/${company}/quote/${quoteId}/signed-document`, body);
      } catch (error) {
        throw new Error(
          errorMessage(error, "No se pudo guardar el documento firmado."),
        );
      }
    },
    onSuccess: refresh,
  });
};

export const useDeleteSignedQuote = () => {
  const refresh = useRefreshQuotes();

  return useMutation<void, Error, Variables>({
    mutationFn: async ({ company, quoteId }) => {
      try {
        await axios.delete(`/${company}/quote/${quoteId}/signed-document`);
      } catch (error) {
        throw new Error(
          errorMessage(error, "No se pudo eliminar el documento firmado."),
        );
      }
    },
    onSuccess: refresh,
  });
};

/** Descarga el escaneo guardado (el endpoint exige sesión, no sirve un <a href>). */
export const fetchSignedQuoteBlob = async (
  company: string,
  quoteId: number,
): Promise<Blob> => {
  const { data } = await axios.get(
    `/${company}/quote/${quoteId}/signed-document`,
    { responseType: "blob" },
  );
  return data;
};
