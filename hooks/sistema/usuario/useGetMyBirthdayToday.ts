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
 * Sin caché a propósito: la respuesta depende del DÍA, y cachearla es guardar
 * un "no es tu cumpleaños" que deja de ser cierto a la medianoche — con la
 * pestaña abierta de un día para el otro, el saludo no aparece nunca. El
 * endpoint es de dos columnas sin joins, así que la consulta no vale la pena
 * evitarla. Que el saludo no se repita en cada navegación lo resuelve
 * BirthdayConfetti con sessionStorage, que es donde corresponde.
 */
export const useGetMyBirthdayToday = (company: string | undefined) => {
  return useQuery<MyBirthdayToday, Error>({
    queryKey: ["my-birthday-today", company],
    queryFn: () => fetchMyBirthdayToday(company),
    enabled: !!company,
    refetchOnWindowFocus: false,
  });
};
