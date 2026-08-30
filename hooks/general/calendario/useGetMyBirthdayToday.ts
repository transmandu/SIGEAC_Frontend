import axios from '@/lib/axios';
import { useQuery } from '@tanstack/react-query';

export type MyBirthdayToday = {
  is_birthday: boolean;
  first_name?: string;
};

const fetchMyBirthdayToday = async (company: string | undefined): Promise<MyBirthdayToday> => {
  const { data } = await axios.get(`/${company}/my-birthday-today`);
  return data;
};

/**
 * Simple a propósito: se revisa en cada login, sin persistir nada entre
 * sesiones (guardarlo en localStorage/sessionStorage dio más problemas de
 * caché vieja que beneficio). El endpoint ya es liviano — una sola columna,
 * sin joins — así que no hace falta evitar la consulta.
 */
export const useGetMyBirthdayToday = (company: string | undefined) => {
  return useQuery<MyBirthdayToday, Error>({
    queryKey: ["my-birthday-today", company],
    queryFn: () => fetchMyBirthdayToday(company),
    enabled: !!company,
    refetchOnWindowFocus: false,
  });
};
