import { useQuery } from '@tanstack/react-query';
import axios from '@/lib/axios';
import { User } from '@/types';

const fetchUsers = async (): Promise<User[]> => {
  const  response  = await axios.get('/users');
  const users = await response.data.users;
  return users
};

export const useGetUsers = () => {
  return useQuery<User[]>({
    queryKey: ['users'],
    queryFn: fetchUsers,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
