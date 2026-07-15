import axios from '@/lib/axios';
import { isAxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';

/**
 * El backend responde 4xx con JSON { error } (requisición inexistente,
 * receptor no seleccionado, etc.); al pedir la respuesta como blob ese JSON
 * llega como Blob y hay que leerlo para mostrar el mensaje real.
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
  return 'No se pudo generar el PDF de la requisición.';
};

const fetchRequisitionPdf = async (
  company: string,
  requisitionId: number,
  receiverEmployeeId: number
): Promise<Blob> => {
  try {
    const { data } = await axios.get(
      `/${company}/requisition-orders/${requisitionId}/pdf`,
      {
        params: { receiver_employee_id: receiverEmployeeId },
        responseType: 'blob',
      }
    );
    return data;
  } catch (error) {
    throw new Error(await extractErrorMessage(error));
  }
};

export const useDownloadRequisitionPdf = () => {
  return useMutation<
    Blob,
    Error,
    { company: string; requisitionId: number; receiverEmployeeId: number }
  >({
    mutationFn: ({ company, requisitionId, receiverEmployeeId }) =>
      fetchRequisitionPdf(company, requisitionId, receiverEmployeeId),
  });
};
