import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";

export const useCreateAuthorizedEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      dni_employee: string;
      from_company_db: string;
      to_company_db: string;
    }) => {
      const { data } = await axios.post("/authorized-employees", payload);
      return data;
    },
    onSuccess: (_, variables) => {
      // Ahora la invalidación se hace usando la empresa de ORIGEN
      queryClient.invalidateQueries({
        queryKey: ["authorized-employees", variables.from_company_db],
      });
    },
  });
};