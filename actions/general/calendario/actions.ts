import axiosInstance from "@/lib/axios";
import {
  CalendarVisibilityGrantType,
  CalendarVisibilityScopeType,
} from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { notifyError } from "@/lib/notify-error";

export interface ManualCalendarEventData {
  calendar_event_type_id?: number | null;
  title: string;
  description?: string;
  start_at: string;
  end_at: string;
  all_day?: boolean;
}

const invalidateEvents = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({
    queryKey: ["calendar-events"],
    exact: false,
  });
  queryClient.invalidateQueries({
    queryKey: ["calendar-manual-events"],
    exact: false,
  });
};

export const useCreateCalendarEvent = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async ({
      data,
      company,
    }: {
      data: ManualCalendarEventData;
      company: string;
    }) => {
      const { data: response } = await axiosInstance.post(
        `/${company}/calendar-events`,
        data,
      );
      return response;
    },
    onSuccess: () => {
      invalidateEvents(queryClient);
      toast.success("¡Creado!", {
        description: "El evento ha sido registrado correctamente.",
      });
    },
    onError: (error) => {
      notifyError(error, { action: "registrar el evento" });
    },
  });

  return { createCalendarEvent: createMutation };
};

export const useUpdateCalendarEvent = () => {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
      company,
    }: {
      id: string | number;
      data: ManualCalendarEventData;
      company: string;
    }) => {
      const { data: response } = await axiosInstance.put(
        `/${company}/calendar-events/${id}`,
        data,
      );
      return response;
    },
    onSuccess: () => {
      invalidateEvents(queryClient);
      toast.success("¡Actualizado!", {
        description: "El evento ha sido actualizado correctamente.",
      });
    },
    onError: (error) => {
      notifyError(error, { action: "actualizar el evento" });
    },
  });

  return { updateCalendarEvent: updateMutation };
};

export const useDeleteCalendarEvent = () => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async ({
      id,
      company,
    }: {
      id: string | number;
      company: string;
    }) => {
      await axiosInstance.delete(`/${company}/calendar-events/${id}`);
    },
    onSuccess: () => {
      invalidateEvents(queryClient);
      toast.success("¡Eliminado!", {
        description: "El evento ha sido eliminado correctamente.",
      });
    },
    onError: (error) => {
      notifyError(error, { action: "eliminar el evento" });
    },
  });

  return { deleteCalendarEvent: deleteMutation };
};

export interface CalendarEventTypeData {
  label: string;
  color: string;
  icon?: string;
}

export const useCreateCalendarEventType = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async ({
      data,
      company,
    }: {
      data: CalendarEventTypeData;
      company: string;
    }) => {
      const { data: response } = await axiosInstance.post(
        `/${company}/calendar-event-types`,
        data,
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["calendar-event-types"],
        exact: false,
      });
      toast.success("¡Creado!", {
        description: "El tipo de evento ha sido registrado correctamente.",
      });
    },
    onError: (error) => {
      notifyError(error, { action: "registrar el tipo de evento" });
    },
  });

  return { createCalendarEventType: createMutation };
};

export const useUpdateCalendarEventType = () => {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
      company,
    }: {
      id: string | number;
      data: CalendarEventTypeData;
      company: string;
    }) => {
      const { data: response } = await axiosInstance.put(
        `/${company}/calendar-event-types/${id}`,
        data,
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["calendar-event-types"],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ["calendar-events"],
        exact: false,
      });
      toast.success("¡Actualizado!", {
        description: "El tipo de evento ha sido actualizado correctamente.",
      });
    },
    onError: (error) => {
      notifyError(error, { action: "actualizar el tipo de evento" });
    },
  });

  return { updateCalendarEventType: updateMutation };
};

export const useDeleteCalendarEventType = () => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async ({
      id,
      company,
    }: {
      id: string | number;
      company: string;
    }) => {
      await axiosInstance.delete(`/${company}/calendar-event-types/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["calendar-event-types"],
        exact: false,
      });
      // Los eventos que usaban este tipo quedan sin color (la FK es
      // nullOnDelete): sin refrescarlos, siguen pintados con el color viejo.
      invalidateEvents(queryClient);
      toast.success("¡Eliminado!", {
        description: "El tipo de evento ha sido eliminado correctamente.",
      });
    },
    onError: (error: any) => {
      notifyError(error, { action: "eliminar el tipo de evento" });
    },
  });

  return { deleteCalendarEventType: deleteMutation };
};

export interface CalendarVisibilityRuleData {
  scope_type: CalendarVisibilityScopeType;
  source_key?: string;
  calendar_event_id?: number;
  grant_type: CalendarVisibilityGrantType;
  department_id?: number;
  user_id?: number;
}

export const useCreateCalendarVisibilityRule = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async ({
      data,
      company,
    }: {
      data: CalendarVisibilityRuleData;
      company: string;
    }) => {
      const { data: response } = await axiosInstance.post(
        `/${company}/calendar-visibility-rules`,
        data,
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["calendar-visibility-rules"],
        exact: false,
      });
      invalidateEvents(queryClient);
      toast.success("¡Agregado!", {
        description:
          "La regla de visibilidad ha sido registrada correctamente.",
      });
    },
    onError: (error: any) => {
      notifyError(error, { action: "registrar la regla de visibilidad" });
    },
  });

  return { createCalendarVisibilityRule: createMutation };
};

export const useDeleteCalendarVisibilityRule = () => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async ({
      id,
      company,
    }: {
      id: string | number;
      company: string;
    }) => {
      await axiosInstance.delete(`/${company}/calendar-visibility-rules/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["calendar-visibility-rules"],
        exact: false,
      });
      invalidateEvents(queryClient);
      toast.success("¡Eliminada!", {
        description: "La regla de visibilidad ha sido eliminada correctamente.",
      });
    },
    onError: (error) => {
      notifyError(error, { action: "eliminar la regla de visibilidad" });
    },
  });

  return { deleteCalendarVisibilityRule: deleteMutation };
};
