import { useQuery } from '@tanstack/react-query';
import axios from '@/lib/axios';
import { User } from '@/types';

const fetchUsers = async (): Promise<User[]> => {
  const  response  = await axios.get('/users');
  const users = await response.data.users;
  return users
};

/**
 * `enabled` permite no pedirlos: `/users` es solo de SUPERUSER y a cualquier
 * otro la API le responde 403.
 */
export const useGetUsers = ({ enabled = true }: { enabled?: boolean } = {}) => {
  return useQuery<User[]>({
    queryKey: ['users'],
    queryFn: fetchUsers,
    staleTime: 1000 * 60 * 5,
    enabled,
  });
};
