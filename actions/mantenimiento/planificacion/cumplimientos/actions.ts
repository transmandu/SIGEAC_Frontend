import axiosInstance from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner";

export interface CreateMaintenanceComplianceData {
  maintenance_control_item_id: number,
  maintenance_provider_id: string,
  work_order_id: string,
  compliance_date: string,
  hours_reading: number,
  cycles_reading: number,
  notes?: string,
}

export const useCreateMaintenanceCompliance = () => {

  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: async ({ data, company }: { data: CreateMaintenanceComplianceData, company: string }) => {
      const { data: response } = await axiosInstance.post(`/${company}/maintenance-compliances`, data)
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-controls'] })
      queryClient.invalidateQueries({ queryKey: ['maintenance-compliances'] })
      toast.success("¡Registrado!", {
        description: `El cumplimiento ha sido registrado correctamente.`
      })
    },
    onError: (error) => {
      toast.error('Oops!', {
        description: 'No se pudo registrar el cumplimiento...'
      })
      console.log(error)
    },
  })

  return {
    createMaintenanceCompliance: createMutation,
  }
}

export interface ImportComplianceHistorySkippedRow {
  row: number;
  reason: string;
}

export interface ImportComplianceHistoryResult {
  imported: number;
  skipped: ImportComplianceHistorySkippedRow[];
}

// Sincrónico (no se encola): el archivo es de un solo control y a lo sumo
// unas pocas decenas de filas, así que se procesa en la misma petición y la
// respuesta ya trae el resumen final (importados/omitidos), no un estado a consultar.
export const useImportMaintenanceComplianceHistory = () => {
  const queryClient = useQueryClient()

  const importMutation = useMutation({
    mutationFn: async ({
      file,
      controlId,
      company,
    }: {
      file: File;
      controlId: string | number;
      company: string;
    }): Promise<ImportComplianceHistoryResult> => {
      const formData = new FormData()
      formData.append("file", file)

      const { data } = await axiosInstance.post(
        `/${company}/maintenance-controls/${controlId}/import-compliance-history`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      )
      return data
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-compliances'] })
      if (result.imported > 0) {
        toast.success("¡Histórico importado!", {
          description: `${result.imported} cumplimiento(s) cargado(s)${result.skipped.length ? `, ${result.skipped.length} fila(s) omitida(s).` : "."}`,
        })
      } else {
        toast.error("Nada para importar", {
          description: "Ninguna fila coincidió con un certificado/servicio de este control.",
        })
      }
    },
    onError: (error) => {
      toast.error('Oops!', {
        description: 'No se pudo importar el archivo...'
      })
      console.log(error)
    },
  })

  return {
    importComplianceHistory: importMutation,
  }
}
