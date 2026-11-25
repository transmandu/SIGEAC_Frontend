import { useQuery } from "@tanstack/react-query";

import axios from "@/lib/axios";
import type {
  MailAudiencePreviewRecipient,
  MailRecipientRulesResponse,
} from "@/types/mail-recipients";

export const MAIL_RULES_KEY = "mail-recipient-rules";

export const useGetMailRecipientRules = (company?: string) =>
  useQuery<MailRecipientRulesResponse, Error>({
    queryKey: [MAIL_RULES_KEY, company],
    queryFn: async () => {
      const { data } = await axios.get(`/${company}/mail-recipient-rules`);
      return data;
    },
    enabled: !!company,
  });

/** Quién recibiría hoy el aviso en esa etapa, con las reglas ya guardadas. */
export const useMailAudiencePreview = ({
  company,
  notice,
  stage,
  enabled,
}: {
  company?: string;
  notice: string;
  stage: string | null;
  enabled: boolean;
}) =>
  useQuery<MailAudiencePreviewRecipient[], Error>({
    queryKey: [MAIL_RULES_KEY, company, "preview", notice, stage],
    queryFn: async () => {
      const { data } = await axios.get(
        `/${company}/mail-recipient-rules/preview`,
        { params: { notice, ...(stage ? { stage } : {}) } },
      );
      return data.recipients;
    },
    enabled: enabled && !!company,
    // Es una comprobación puntual: siempre fresca al abrirla.
    gcTime: 0,
  });
