import axiosInstance from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { notifyError } from "@/lib/notify-error";
import type { CreatePaxFlightInput, PaxFlight } from "@/types";

export const usePaxFlights = (
  company: string,
  month: number,
  year: number,
  aircraftId?: number | null,
  flightType?: string | null,
) => {
  return useQuery({
    queryKey: ["pax-flights", company, month, year, aircraftId, flightType],
    queryFn: async (): Promise<PaxFlight[]> => {
      const response = await axiosInstance.get(`/${company}/pax-flights`, {
        params: {
          month,
          year,
          ...(aircraftId ? { aircraft_id: aircraftId } : {}),
          ...(flightType ? { flight_type: flightType } : {}),
        },
      });
      return response.data;
    },
    enabled: !!company && !!month && !!year,
  });
};

export const usePaxFlight = (company: string, id: number) => {
  return useQuery({
    queryKey: ["pax-flight", company, id],
    queryFn: async (): Promise<PaxFlight> => {
      const response = await axiosInstance.get(`/${company}/pax-flights/${id}`);
      return response.data;
    },
    enabled: !!company && !!id,
  });
};

export const useNextFlightCode = (
  company: string,
  month: number,
  year: number,
) => {
  return useQuery({
    queryKey: ["pax-flights-next-code", company, month, year],
    queryFn: async (): Promise<string> => {
      const response = await axiosInstance.get(
        `/${company}/pax-flights/next-code`,
        {
          params: { month, year },
        },
      );
      return response.data.next_code;
    },
    enabled: !!company && !!month && !!year,
  });
};

export const useAvailableCargoManifests = (
  company: string,
  month: number,
  year: number,
  aircraftId?: number | null,
) => {
  return useQuery({
    queryKey: ["available-cargo-manifests", company, month, year, aircraftId],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `/${company}/pax-flights/available-cargo-manifests`,
        {
          params: {
            month,
            year,
            ...(aircraftId ? { aircraft_id: aircraftId } : {}),
          },
        },
      );
      return response.data;
    },
    enabled: !!company && !!month && !!year,
  });
};

export const useCreatePaxFlight = (company: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePaxFlightInput): Promise<PaxFlight> => {
      const response = await axiosInstance.post(
        `/${company}/pax-flights`,
        data,
      );
      return response.data;
    },
    onSuccess: (newFlight) => {
      toast.success(
        `Manifiesto de vuelo ${newFlight.flight_code} creado exitosamente.`,
      );
      queryClient.invalidateQueries({ queryKey: ["pax-flights", company] });
      queryClient.invalidateQueries({
        queryKey: ["available-cargo-manifests", company],
      });
    },
    onError: (error) => {
      notifyError(error, { action: "crear el manifiesto de vuelo" });
    },
  });
};

export const useUpdatePaxFlight = (company: string, id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: Partial<CreatePaxFlightInput>,
    ): Promise<PaxFlight> => {
      const response = await axiosInstance.put(
        `/${company}/pax-flights/${id}`,
        data,
      );
      return response.data;
    },
    onSuccess: (updated) => {
      toast.success(
        `Manifiesto de vuelo ${updated.flight_code} actualizado exitosamente.`,
      );
      queryClient.invalidateQueries({ queryKey: ["pax-flights", company] });
      queryClient.invalidateQueries({ queryKey: ["pax-flight", company, id] });
      queryClient.invalidateQueries({
        queryKey: ["available-cargo-manifests", company],
      });
    },
    onError: (error) => {
      notifyError(error, { action: "actualizar el manifiesto de vuelo" });
    },
  });
};

export const useDeletePaxFlight = (company: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await axiosInstance.delete(`/${company}/pax-flights/${id}`);
    },
    onSuccess: () => {
      toast.success("Manifiesto de vuelo eliminado correctamente.");
      queryClient.invalidateQueries({ queryKey: ["pax-flights", company] });
      queryClient.invalidateQueries({
        queryKey: ["available-cargo-manifests", company],
      });
    },
    onError: (error) => {
      notifyError(error, { action: "eliminar el manifiesto de vuelo" });
    },
  });
};

export const useMarkInFlight = (company: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<PaxFlight> => {
      const response = await axiosInstance.patch(
        `/${company}/pax-flights/${id}/mark-in-flight`,
      );
      return response.data;
    },
    onSuccess: (updated) => {
      toast.success(`Vuelo ${updated.flight_code} marcado como EN VUELO.`);
      queryClient.invalidateQueries({ queryKey: ["pax-flights", company] });
      queryClient.invalidateQueries({
        queryKey: ["pax-flight", company, updated.id],
      });
    },
    onError: (error) => {
      notifyError(error, { action: "marcar el vuelo como en vuelo" });
    },
  });
};

export const useFinalizeFlight = (company: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<PaxFlight> => {
      const response = await axiosInstance.patch(
        `/${company}/pax-flights/${id}/finalize`,
      );
      return response.data;
    },
    onSuccess: (updated) => {
      toast.success(
        `Manifiesto ${updated.flight_code} FINALIZADO. Ya puede descargar el PDF.`,
      );
      queryClient.invalidateQueries({ queryKey: ["pax-flights", company] });
      queryClient.invalidateQueries({
        queryKey: ["pax-flight", company, updated.id],
      });
    },
    onError: (error) => {
      notifyError(error, { action: "finalizar el manifiesto" });
    },
  });
};

export const downloadPaxFlightPdf = async (
  company: string,
  id: number,
  flightCode?: string,
) => {
  try {
    const response = await axiosInstance.get(
      `/${company}/pax-flights/${id}/pdf`,
      { responseType: "blob" },
    );

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `MANIFIESTO_PAX_${flightCode ?? id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    notifyError(error, { action: "descargar el PDF del manifiesto" });
  }
};
