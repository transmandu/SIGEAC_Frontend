import { zodResolver as hookformZodResolver } from "@hookform/resolvers/zod";
import type { FieldValues, Resolver } from "react-hook-form";
import type * as z from "zod";

/**
 * Resolver de zod tipado con el esquema de SALIDA.
 *
 * @hookform/resolvers 5 pasó a devolver `Resolver<z.input, ctx, z.output>`, y
 * entrada y salida dejan de coincidir en cuanto el esquema tiene `.default()` o
 * `z.coerce`. Los formularios de la app tipan el `useForm` con el tipo de
 * salida —que es lo que llega al submit ya parseado—, así que la diferencia se
 * absorbe acá en lugar de declarar los tres genéricos en 119 `useForm`.
 *
 * En runtime es el resolver de la librería sin envolver: solo cambia el tipo.
 */
export const zodResolver = <TValues extends FieldValues>(
  schema: z.ZodType<TValues>,
): Resolver<TValues, any, TValues> =>
  hookformZodResolver(schema as never) as unknown as Resolver<TValues, any, TValues>;
