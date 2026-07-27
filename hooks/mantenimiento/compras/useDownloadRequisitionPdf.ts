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

/**
 * Quién firma como "Recibe conforme": un empleado elegido en el select, o el
 * propio usuario (personal de compras). En este último caso se manda una
 * bandera en vez del id porque su ficha puede estar en otra compañía y ese id
 * no existe —o peor, es de otra persona— en el tenant de la requisición.
 */
type RequisitionPdfReceiverParam =
  | { receiverEmployeeId: number; receiverSelf?: false }
  | { receiverSelf: true; receiverEmployeeId?: never };

type DownloadRequisitionPdfVariables = {
  company: string;
  requisitionId: number;
} & RequisitionPdfReceiverParam;

const fetchRequisitionPdf = async ({
  company,
  requisitionId,
  receiverEmployeeId,
  receiverSelf,
}: DownloadRequisitionPdfVariables): Promise<Blob> => {
  try {
    const { data } = await axios.get(
      `/${company}/requisition-orders/${requisitionId}/pdf`,
      {
        params: receiverSelf
          ? { receiver_self: 1 }
          : { receiver_employee_id: receiverEmployeeId },
        responseType: 'blob',
      }
    );
    return data;
  } catch (error) {
    throw new Error(await extractErrorMessage(error));
  }
};

export const useDownloadRequisitionPdf = () => {
  return useMutation<Blob, Error, DownloadRequisitionPdfVariables>({
    mutationFn: fetchRequisitionPdf,
  });
};
