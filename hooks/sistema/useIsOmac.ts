import { useQuery } from '@tanstack/react-query';
import axios from '@/lib/axios';


const fetchIsOmac = async (company: string): Promise<boolean> => {
    const response = await axios.get(`/${company}/is-omac`);
    return !!response.data.isOmac;
};


export const useIsOmac = (company?: string) => {
    return useQuery<boolean>({
        queryKey: ['is_omac', company],
        queryFn: () => fetchIsOmac(company!),
        enabled: !!company, staleTime: 1000 * 60 * 30,
    });
};
