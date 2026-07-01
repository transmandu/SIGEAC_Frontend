import axios from '@/lib/axios';
import { useCompanyStore } from '@/stores/CompanyStore';
import { GeneralArticle } from '@/types';
import { useQuery } from '@tanstack/react-query';

const fetchGeneralArticles = async (location_id: number | string, company: string): Promise<GeneralArticle[]> => {
    const { data } = await axios.get(`/${company}/${location_id}/general-articles`,);
    return data;
};

export const useGetGeneralArticles = (enabled: boolean = true) => {
    const { selectedCompany, selectedStation } = useCompanyStore()
    return useQuery<GeneralArticle[], Error>({
        queryKey: ["general-articles", selectedCompany?.slug],
        queryFn: () => fetchGeneralArticles(selectedStation!, selectedCompany?.slug!),
        enabled: enabled && !!selectedCompany && !!selectedStation,
    });
};
