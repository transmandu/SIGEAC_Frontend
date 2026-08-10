import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { toast } from "sonner";

// Autoriza a un empleado de otra empresa a operar en la destino, sin copiarlo
// como empleado propio. El 204 significa que ya pertenecía a la destino y no
// hacía falta autorización, por eso no es un error.
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

// El backend responde 403 si quien elimina no es la empresa de origen.
export const useDeleteAuthorizedEmployee = (companySlug?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await axios.delete(`/${companySlug}/authorized-employees/${id}`);
    },

    onSuccess: async () => {
      toast.success("Autorización eliminada correctamente.");
      await queryClient.invalidateQueries({
        queryKey: ["authorized-employees-from-company", companySlug],
      });
    },

    onError: (error: any) => {
      if (error.response?.status === 403) {
        toast.error("Solo la empresa de origen puede eliminar esta autorización.");
        return;
      }
      toast.error("Ha ocurrido un error al eliminar la autorización.");
    },
  });
};
