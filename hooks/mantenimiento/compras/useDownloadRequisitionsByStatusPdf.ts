import axios from '@/lib/axios';
import { isAxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';

/**
 * El backend responde 400/403/422 con JSON { error }; al pedir la respuesta
 * como blob ese JSON llega como Blob y hay que leerlo para mostrar el
 * mensaje real.
 */
const extractErrorMessage = async (error: unknown): Promise<string> => {
  if (isAxiosError(error) && error.response?.data instanceof Blob) {
    try {
      const parsed = JSON.parse(await error.response.data.text());
      if (typeof parsed?.error === 'string') return parsed.error;
    } catch {
      // el cuerpo no era JSON; se usa el mensaje genérico
    }
  }
  return 'No se pudo generar el reporte de solicitudes por estado.';
};

const fetchRequisitionsByStatusPdf = async (
  company: string,
  locationId: string,
  statuses: string[]
): Promise<Blob> => {
  try {
    const { data } = await axios.get(
      `/${company}/${locationId}/requisition-orders/by-status/pdf`,
      {
        params: { statuses },
        // PHP no admite claves repetidas (statuses=A&statuses=B se queda con la
        // ULTIMA): la lista debe viajar como statuses[]=A&statuses[]=B.
        paramsSerializer: {
          indexes: false,
        },
        responseType: 'blob',
      }
    );
    return data;
  } catch (error) {
    throw new Error(await extractErrorMessage(error));
  }
};

export const useDownloadRequisitionsByStatusPdf = () => {
  return useMutation<
    Blob,
    Error,
    { company: string; locationId: string; statuses: string[] }
  >({
    mutationFn: ({ company, locationId, statuses }) =>
      fetchRequisitionsByStatusPdf(company, locationId, statuses),
  });
};
