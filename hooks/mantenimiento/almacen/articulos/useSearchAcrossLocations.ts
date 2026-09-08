import axiosInstance from "@/lib/axios";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useQuery } from "@tanstack/react-query";

/**
 * Existencia de un artículo en las sedes de la compañía.
 *
 * Responde "¿hay de esto en algún lado?" sin cambiar la estación en la que se
 * trabaja. Devuelve TODOS los estados a propósito: ocultar lo que no está
 * disponible haría leer como inexistente algo que sí existe pero está en
 * cuarentena o despachado, y eso lleva a decidir sobre información falsa.
 *
 * Solo busca por número de parte, que es como se identifica una pieza; los
 * artículos generales no lo tienen y por eso quedan fuera de esta consulta.
 *
 * De la sede solo llega el código IATA: el almacén y la ubicación física son
 * detalles de operación de esa estación.
 */
export interface CrossLocationAeronautical {
  id: number;
  type: "aeronautical";
  part_number: string | null;
  alternative_part_number: string[] | string | null;
  /** Serial de la pieza, o número de lote si es consumible. */
  serial: string | null;
  /** Nombre del renglón (batch), que es la descripción del artículo. */
  description: string | null;
  category: string | null;
  condition: string | null;
  status: string | null;
  quantity: number;
  unit: string;
  location: string;
}

interface CrossLocationResponse {
  aeronautical: CrossLocationAeronautical[];
}

const fetchAcrossLocations = async (
  company: string | undefined,
  search: string,
  excludeLocationId: string | null,
): Promise<CrossLocationResponse> => {
  const { data } = await axiosInstance.get(
    `/${company}/articles/search-across-locations`,
    { params: { search, exclude_location_id: excludeLocationId } },
  );
  return data;
};

export const useSearchAcrossLocations = (search: string) => {
  const { selectedCompany, selectedStation } = useCompanyStore();

  // El backend exige 2 caracteres: pedir por debajo solo produciría un 422 por
  // cada tecla.
  const term = search.trim();
  const enabled = !!selectedCompany && term.length >= 2;

  return useQuery<CrossLocationResponse>({
    // La sede activa entra en la clave: al cambiar de estación el resultado
    // deja de ser el mismo, porque es justo la que se excluye.
    queryKey: ["articles-across-locations", selectedCompany?.slug, selectedStation, term],
    queryFn: () => fetchAcrossLocations(selectedCompany?.slug, term, selectedStation),
    enabled,
    staleTime: 1000 * 60,
  });
};
