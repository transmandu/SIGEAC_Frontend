import { z } from "zod";

const fileMaxBytes = 10_000_000; // 10 MB

export const formSchema = z.object({
  part_number: z
    .string({ message: "Debe ingresar un número de parte." })
    .min(2, {
      message: "El número de parte debe contener al menos 2 caracteres.",
    }),
  lot_number: z.string().optional(),
  alternative_part_number: z
    .array(
      z.string().min(2, {
        message: "Cada número alterno debe contener al menos 2 caracteres.",
      }),
    )
    .optional(),
  description: z.string().optional(),
  batch_name: z.string().optional(),
  zone: z.string().optional(),
  expiration_date: z.string().optional(),
  fabrication_date: z.string().optional(),
  manufacturer_id: z.string().optional(),
  condition_id: z.any().superRefine((val, ctx) => {
    if (val === undefined || val === null || val === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Debe ingresar la condición del artículo.",
      });
    }
  }),
  quantity: z.coerce
    .number({ message: "Debe ingresar una cantidad." })
    .min(0, { message: "No puede ser negativo." })
    .refine((val) => !isNaN(val), {
      message: "Debe ser un número válido",
    }),
  min_quantity: z.coerce
    .number()
    .min(0, { message: "No puede ser negativo." })
    .optional(),
  batch_id: z
    .string({ message: "Debe ingresar un lote." })
    .min(1, "Seleccione un lote"),
  certificate_8130: z
    .instanceof(File, { message: "Suba un archivo válido." })
    .refine((f) => f.size <= fileMaxBytes, "Tamaño máximo 10 MB.")
    .optional(),
  certificate_fabricant: z
    .instanceof(File, { message: "Suba un archivo válido." })
    .refine((f) => f.size <= fileMaxBytes, "Tamaño máximo 10 MB.")
    .optional(),
  certificate_vendor: z
    .instanceof(File, { message: "Suba un archivo válido." })
    .refine((f) => f.size <= fileMaxBytes, "Tamaño máximo 10 MB.")
    .optional(),
  image: z.instanceof(File).optional(),
  conversion_id: z.number().optional(),
  primary_unit_id: z.number().optional(),
  has_documentation: z.boolean().optional(),
  shelf_life: z.string().optional(),
  inspector: z.string().optional(),
  inspect_date: z.string().optional(),
});

export type FormValues = z.infer<typeof formSchema>;

export interface UnitSelection {
  conversion_id: number;
}
