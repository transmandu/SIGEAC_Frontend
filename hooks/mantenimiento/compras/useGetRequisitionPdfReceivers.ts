import axios from '@/lib/axios';
import { useQuery } from '@tanstack/react-query';

/**
 * Empleado elegible como "Departamento Receptor" del formato de requisición:
 * personal activo de Compras, Administración y RRHH.
 */
export interface RequisitionPdfReceiver {
  id: number;
  first_name: string;
  last_name: string;
  dni: string;
  department?: {
    id: number;
    name: string;
    acronym: string;
  } | null;
  job_title?: {
    id: number;
    name: string;
  } | null;
}

const fetchRequisitionPdfReceivers = async (
  company: string
): Promise<RequisitionPdfReceiver[]> => {
  const { data } = await axios.get(`/${company}/requisition-pdf-receivers`);
  return data;
};

export const useGetRequisitionPdfReceivers = (company?: string) => {
  return useQuery<RequisitionPdfReceiver[], Error>({
    queryKey: ['requisition-pdf-receivers', company],
    queryFn: () => fetchRequisitionPdfReceivers(company!),
    enabled: !!company,
    // La nómina de receptores cambia muy poco: se cachea para que abrir el
    // diálogo varias veces no repita la petición.
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};
