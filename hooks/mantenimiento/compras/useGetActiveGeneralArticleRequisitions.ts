import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from '@/lib/axios';
import { useCompanyStore } from '@/stores/CompanyStore';
import type { ActiveGeneralArticleRequisition } from '@/types/purchase';

/**
 * Qué artículos generales ya viajan en una requisición sin cerrar, para avisar
 * a quien está por pedir lo mismo. Informativo, nunca bloqueante.
 */

/**
 * La marca queda fuera a propósito (igual que en el backend): pedir el mismo
 * trapo de otra marca sigue siendo pedir el mismo trapo.
 */
export const getRequisitionArticleKey = (
    description?: string | null,
    variantType?: string | null,
) => `${(description ?? "").trim().toUpperCase()}__${(variantType ?? "").trim().toUpperCase()}`;

const fetchActiveRequisitions = async (
    location_id: number | string,
    company: string,
): Promise<ActiveGeneralArticleRequisition[]> => {
    const { data } = await axios.get(`/${company}/${location_id}/general-articles/active-requisitions`);
    return data;
};

export const useGetActiveGeneralArticleRequisitions = (enabled: boolean = true) => {
    const { selectedCompany, selectedStation } = useCompanyStore();

    const query = useQuery<ActiveGeneralArticleRequisition[], Error>({
        queryKey: ['active-general-article-requisitions', selectedCompany?.slug, selectedStation],
        queryFn: () => fetchActiveRequisitions(selectedStation!, selectedCompany?.slug!),
        enabled: enabled && !!selectedCompany && !!selectedStation,
    });

    // Indexado porque el formulario consulta una vez por fila en cada render.
    const byArticle = useMemo(() => {
        const map = new Map<string, ActiveGeneralArticleRequisition[]>();

        for (const entry of query.data ?? []) {
            const key = getRequisitionArticleKey(entry.description, entry.variant_type);
            map.set(key, [...(map.get(key) ?? []), entry]);
        }

        return map;
    }, [query.data]);

    return { ...query, byArticle };
};
