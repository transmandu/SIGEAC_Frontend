import axios from '@/lib/axios';
import { useCompanyStore } from '@/stores/CompanyStore';
import { useQuery } from '@tanstack/react-query';
import type { NeedsUnitConversionCandidate } from '@/types/purchase';

interface ConfirmationPreviewResponse {
  needs_conversion: boolean;
  candidate?: NeedsUnitConversionCandidate;
}

const fetchConfirmationPreview = async (
  company: string,
  intakeId: number
): Promise<ConfirmationPreviewResponse> => {
  const { data } = await axios.get(`/${company}/general-article-intakes/${intakeId}/confirmation-preview`);
  return data;
};

// Consulta de solo lectura para saber, apenas se abre el diálogo de
// confirmación (antes del primer click en "Confirmar"), si el intake va a
// necesitar una equivalencia de conversión de unidad. Evita el ciclo
// "confirmar falla con 422 → el usuario llena el dato → confirmar de nuevo",
// que duplicaba las mismas consultas dentro de una transacción cada vez.
export const useGetIntakeConfirmationPreview = (intakeId: number, enabled: boolean) => {
  const { selectedCompany } = useCompanyStore();

  return useQuery<ConfirmationPreviewResponse, Error>({
    queryKey: ['general-article-intake-confirmation-preview', selectedCompany?.slug, intakeId],
    queryFn: () => fetchConfirmationPreview(selectedCompany!.slug, intakeId),
    enabled: enabled && !!selectedCompany,
  });
};
