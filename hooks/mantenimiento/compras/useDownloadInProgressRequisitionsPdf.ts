import axios from '@/lib/axios';
import { isAxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';

/**
 * El backend responde 400 con JSON { error } cuando no hay solicitudes en
 * proceso; al pedir la respuesta como blob ese JSON llega como Blob y hay
 * que leerlo para mostrar el mensaje real.
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
  return 'No se pudo generar el listado de solicitudes en proceso.';
};

const fetchInProgressRequisitionsPdf = async (
  company: string,
  locationId: string
): Promise<Blob> => {
  try {
    const { data } = await axios.get(
      `/${company}/${locationId}/requisition-orders/in-progress/pdf`,
      { responseType: 'blob' }
    );
    return data;
  } catch (error) {
    throw new Error(await extractErrorMessage(error));
  }
};

export const useDownloadInProgressRequisitionsPdf = () => {
  return useMutation<Blob, Error, { company: string; locationId: string }>({
    mutationFn: ({ company, locationId }) =>
      fetchInProgressRequisitionsPdf(company, locationId),
  });
};
