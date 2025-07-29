import axiosInstance from "@/lib/axios"
import { CashMovement } from "@/types"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export const useCreateAircraft = () => {
    const queryAircraft = useQueryClient()
    const createMutation = useMutation({
        mutationFn: async ({data, company}: {data: any, company: string}) => {
            await axiosInstance.post(`/${company}/aircrafts`, data)
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
      mutationFn: async ({company, acronym}: {acronym: string, company: string}) => {
          await axiosInstance.delete(`/${company}/aircrafts/${acronym}`)
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
    mutationFn: async ({ acronym, data, company }: { acronym: string; data: any, company: string | undefined }) => {
      await axiosInstance.put(`/${company}/aircrafts/${acronym}`, data);
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
    reference_cod?: string;
    details: string;
    employee_responsible: string;
    vendor_id?: string;
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
    mutationFn: async ({company, acronym, data}: {
      company?: string;
      acronym: string;
      data: AircraftExpenseFormData;
    }) => {
      const response = await axiosInstance.post(
        `/${company}/cash-movement-aircraft/${acronym}/expenses`,
        data
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
