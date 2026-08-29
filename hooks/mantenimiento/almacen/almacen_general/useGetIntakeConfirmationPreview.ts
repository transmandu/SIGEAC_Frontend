import axios from '@/lib/axios';
import { useCompanyStore } from '@/stores/CompanyStore';
import { useQuery } from '@tanstack/react-query';
import type { NeedsUnitConversionCandidate } from '@/types/purchase';

/** Conversión ya registrada: lo que se sumará al stock si se confirma. */
export interface AppliedConversionPreview {
  general_article_id: number;
  existing_unit_id: number;
  existing_unit_label: string | null;
  intake_unit_id: number;
  intake_unit_label: string | null;
  base_per_unit: number;
  lectura?: string;
  converted_quantity: number;
}

/** Qué puede declararse sobre el modo dimensional al confirmar. */
export interface DimensionPreview {
  status: 'AVAILABLE' | 'ALREADY_DIMENSIONAL' | 'UNAVAILABLE' | 'NO_UNITS';
  reason?: string;
  /** Piezas que se crearían; ausente si la cantidad no es entera. */
  pieces_to_add?: number | null;
  /** Unidades habilitadas para declarar medidas. */
  measure_units?: { id: number; label: string; value: string }[];
  profile?: {
    axes: number;
    piece_length: number;
    piece_width: number | null;
    measure_unit_label: string | null;
    magnitude_label: string;
  };
}

interface ConfirmationPreviewResponse {
  needs_conversion: boolean;
  candidate?: NeedsUnitConversionCandidate;
  applied_conversion?: AppliedConversionPreview;
  misoriented_conversion?: boolean;
  dimension?: DimensionPreview;
  /** Catálogo completo, para declarar equivalencias hacia cualquier unidad. */
  units?: { id: number; label: string; value: string }[];
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
