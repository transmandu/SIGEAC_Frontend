import axios from '@/lib/axios';
import { useCompanyStore } from '@/stores/CompanyStore';
import { GeneralArticle, LowStockConsumableArticle } from '@/types';
import { useQuery } from '@tanstack/react-query';

/**
 * Factory generica para "articulos por debajo de su stock minimo": cada tipo
 * de articulo (general, consumible, y los que se agreguen a futuro) tiene su
 * propio endpoint/logica SQL en el backend, pero comparten la misma forma de
 * query (por company+location, misma key de cache por tipo). Agregar un tipo
 * nuevo es una linea, no un archivo nuevo.
 */
const makeLowStockArticlesHook = <TArticle>(queryKeyPrefix: string, endpointSuffix: string) => {
    const fetchLowStockArticles = async (location_id: number | string, company: string): Promise<TArticle[]> => {
        const { data } = await axios.get(`/${company}/${location_id}/${endpointSuffix}`);
        return data;
    };

    return (enabled: boolean = true) => {
        const { selectedCompany, selectedStation } = useCompanyStore();
        return useQuery<TArticle[], Error>({
            queryKey: [queryKeyPrefix, selectedCompany?.slug],
            queryFn: () => fetchLowStockArticles(selectedStation!, selectedCompany?.slug!),
            enabled: enabled && !!selectedCompany && !!selectedStation,
        });
    };
};

export const useGetLowStockGeneralArticles = makeLowStockArticlesHook<GeneralArticle>(
    'low-stock-general-articles',
    'general-articles/low-stock',
);

export const useGetLowStockConsumableArticles = makeLowStockArticlesHook<LowStockConsumableArticle>(
    'low-stock-consumable-articles',
    'articles/low-stock-consumables',
);
