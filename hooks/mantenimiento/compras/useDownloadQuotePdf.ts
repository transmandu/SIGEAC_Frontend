import axios from "@/lib/axios";
import { isAxiosError } from "axios";
import { useMutation } from "@tanstack/react-query";

/**
 * Al pedir la respuesta como blob, los errores del backend (JSON) también
 * llegan como Blob: hay que leerlos para mostrar el mensaje real.
 */
const extractErrorMessage = async (error: unknown): Promise<string> => {
  if (isAxiosError(error) && error.response?.data instanceof Blob) {
    try {
      const parsed = JSON.parse(await error.response.data.text());
      if (typeof parsed?.message === "string") return parsed.message;
      if (typeof parsed?.error === "string") return parsed.error;
    } catch {
      // el cuerpo no era JSON; se usa el mensaje genérico
    }
  }
  return "No se pudo generar el formato de la cotización.";
};

type DownloadQuotePdfVariables = {
  company: string;
  quoteId: number;
  authorizer: string;
};

const fetchQuotePdf = async ({
  company,
  quoteId,
  authorizer,
}: DownloadQuotePdfVariables): Promise<Blob> => {
  try {
    const { data } = await axios.get(`/${company}/quote/${quoteId}/pdf`, {
      params: { authorizer },
      responseType: "blob",
    });
    return data;
  } catch (error) {
    throw new Error(await extractErrorMessage(error));
  }
};

export const useDownloadQuotePdf = () => {
  return useMutation<Blob, Error, DownloadQuotePdfVariables>({
    mutationFn: fetchQuotePdf,
  });
};
