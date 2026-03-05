import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { toast } from "sonner";

export const useCreateAuthorizedEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      dni_employee: string;
      from_company_db: string;
      to_company_db: string;
    }) => {
      const response = await axios.post( "/authorized-employees", payload );
      return response;
    },

    onSuccess: async (response, variables) => {
      if (response.status === 201) {
        toast.success("Autorización creada correctamente.");
        await queryClient.invalidateQueries({
          queryKey: [ "authorized-employees-from-company", variables.from_company_db, ],
        });
      }
      if (response.status === 204) {
        toast.info( "El empleado ya existe en la empresa destino. No es necesario autorizarlo." );
      }
    },

    onError: (error: any) => {
      if (error.response?.status === 422) {
        toast.error("Datos inválidos. Verifique la información ingresada.");
        return;
      }
      toast.error("Ha ocurrido un error al crear la autorización.");
    },
  });
};