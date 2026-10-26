import { z } from "zod";

/**
 * Alta de un convenio: la empresa a la que se habilita y al menos un alcance
 * (un convenio sin alcances no sirve para nada). El servidor repite la regla.
 */
export const createLoanSchema = z.object({
  borrower_company_slug: z
    .string()
    .min(1, { message: "Seleccione la empresa que desea habilitar." }),
  scopes: z.array(z.string()).min(1, { message: "Abra al menos un alcance." }),
});

/** Al editar sí se admite dejarlo vacío: es la forma de cerrar todo sin borrar. */
export const updateLoanScopesSchema = z.object({
  scopes: z.array(z.string()),
});

export type CreateLoanValues = z.infer<typeof createLoanSchema>;
export type UpdateLoanScopesValues = z.infer<typeof updateLoanScopesSchema>;

export const LOAN_FIELD_LABELS: Record<string, string> = {
  borrower_company_slug: "Empresa",
  scopes: "Alcances",
};
