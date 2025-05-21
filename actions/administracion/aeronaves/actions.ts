import axiosInstance from "@/lib/axios"
import { CashMovement } from "@/types"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export const useCreateAircraft = () => {

    const queryAircraft = useQueryClient()
    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            await axiosInstance.post('/transmandu/aircrafts-administration', data)
          },
        onSuccess: () => {
            queryAircraft.invalidateQueries({queryKey: ['aircrafts']})
            toast("¡Creado!", {
                description: `¡La aeronave se ha creado correctamente!`
            })
          },
        onError: (error) => {
            toast('Hey', {
              description: `No se creo correctamente: ${error}`
            })
          },
        }
    )

    return {
      createAircraft: createMutation,
    }
}

export const useDeleteAircraft = () => {

  const queryAircraft = useQueryClient()

  const deleteMutation = useMutation({
      mutationFn: async (acronym: string) => {
          await axiosInstance.delete(`/transmandu/aircrafts-administration/${acronym}`)
        },
      onSuccess: () => {

          queryAircraft.invalidateQueries({queryKey: ['aircrafts']})
          toast.success("¡Eliminado!", {
              description: `¡La aeronave ha sido eliminado correctamente!`
          })
        },
      onError: (e) => {
          toast.error("Oops!", {
            description: "¡Hubo un error al eliminar la aeronave!"
        })
        },
      }
  )

  return {
    deleteAircraft: deleteMutation,
  }
}

export const useUpdateAircraft = () => {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async ({ acronym, data }: { acronym: string; data: any }) => {
      await axiosInstance.put(`/transmandu/aircrafts-administration/${acronym}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aircrafts'] });
      toast("¡Actualizado!", {
        description: "¡La aeronave se ha actualizado correctamente!",
      });
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: `Hubo un error al actualizar la aeronave: ${error}`,
      });
    },
  });

  return {
    updateAircraft: updateMutation,
  };
};

interface AircraftExpenseFormData {
  date: Date;
  movements: {
    cash_id: string;
    bank_account_id?: string | null;
    total_amount: number;
    reference_cod: string;
    details: string;
    employee_responsible_id: string;
    vendor_id: string;
    cash_movement_details: {
      accountant_id: string;
      category_id: string;
      details: string;
      amount: number;
    }[];
  }[];
}

export const useCashMovementForAircraft = () => {
  const queryAircraft = useQueryClient();
  const createMutation = useMutation({
    mutationFn: async (data: {
      acronym: string;
      formData: AircraftExpenseFormData
    }) => {
      const response = await axiosInstance.post(
        `/transmandu/cash-movement-aircraft/${data.acronym}/expenses`,
        data.formData
      );
      return response.data as CashMovement;
    },
    onSuccess: (newMovement) => {
      queryAircraft.setQueryData(
        ["aircrafts", "movements"],
        (old: CashMovement[] | undefined) =>
          old ? [...old, newMovement] : [newMovement]
      );
      toast("¡Creado!", {
        description: "Movimiento registrado correctamente",
      });
    },
    onError: (error) => {
      toast("Hey", {
        description: `No se creo correctamente: ${error}`,
      });
    },
  });

  return {
    createCashMovementForAircraft: createMutation,
  };
};
