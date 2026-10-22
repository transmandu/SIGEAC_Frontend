import axios from '@/lib/axios';
import { useMutation, useQuery } from '@tanstack/react-query';

interface locationsByCompanyId {
    id: number,
    address: string,
    type: string,
    cod_iata: string,
    isMainBase: boolean,
}[]

const fetchLocationsByCompanyId = async (company_id: number): Promise<locationsByCompanyId[]> => {
    const { data } = await axios.post('/locations-by-company-id', { company_id });
    return data.companies_location;
};

// Lectura vía POST: el backend recibe el filtro en el body. Usa useMutation
// porque se dispara a demanda, no porque modifique algo.
export const useGetLocationsByCompanyId = () => {
    return useMutation<locationsByCompanyId[], Error, number>({
        mutationFn: fetchLocationsByCompanyId,
    });
};

/** Sedes de una compañía como consulta: se pide en cuanto hay una compañía elegida. */
export const useLocationsOfCompany = (companyId?: number) => {
    return useQuery<locationsByCompanyId[], Error>({
        queryKey: ['locations-by-company-id', companyId],
        queryFn: () => fetchLocationsByCompanyId(companyId!),
        enabled: !!companyId,
    });
};
