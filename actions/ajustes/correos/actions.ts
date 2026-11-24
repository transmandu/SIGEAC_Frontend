import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { MAIL_RULES_KEY } from "@/hooks/ajustes/correos/useMailRecipientRules";
import axiosInstance from "@/lib/axios";
import { notifyError } from "@/lib/notify-error";
import type { MailRecipientRulePayload } from "@/types/mail-recipients";

export const useCreateMailRecipientRule = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async ({
      company,
      data,
    }: {
      company: string;
      data: MailRecipientRulePayload;
    }) => await axiosInstance.post(`/${company}/mail-recipient-rules`, data),
    onSuccess: (_, { company }) => {
      queryClient.invalidateQueries({ queryKey: [MAIL_RULES_KEY, company] });
      toast.success("¡Destinatario agregado!", {
        description: "El aviso se enviará a este destinatario desde ahora.",
      });
    },
    onError: (error) => {
      notifyError(error, { action: "agregar el destinatario" });
    },
  });

  return { createRule: createMutation };
};

export const useUpdateMailRecipientRule = () => {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async ({
      company,
      id,
      data,
      silent,
    }: {
      company: string;
      id: number;
      data: MailRecipientRulePayload;
      /** El interruptor de activar/desactivar no necesita un aviso aparte. */
      silent?: boolean;
    }) => {
      const response = await axiosInstance.put(
        `/${company}/mail-recipient-rules/${id}`,
        data,
      );
      return { response, silent };
    },
    onSuccess: ({ silent }, { company }) => {
      queryClient.invalidateQueries({ queryKey: [MAIL_RULES_KEY, company] });
      if (!silent) {
        toast.success("¡Actualizado!", {
          description: "El destinatario ha sido actualizado correctamente.",
        });
      }
    },
    onError: (error) => {
      notifyError(error, { action: "actualizar el destinatario" });
    },
  });

  return { updateRule: updateMutation };
};

export const useDeleteMailRecipientRule = () => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async ({ company, id }: { company: string; id: number }) =>
      await axiosInstance.delete(`/${company}/mail-recipient-rules/${id}`),
    onSuccess: (_, { company }) => {
      queryClient.invalidateQueries({ queryKey: [MAIL_RULES_KEY, company] });
      toast.success("¡Eliminado!", {
        description: "El destinatario ya no recibirá este aviso.",
      });
    },
    onError: (error) => {
      notifyError(error, { action: "eliminar el destinatario" });
    },
  });

  return { deleteRule: deleteMutation };
};
