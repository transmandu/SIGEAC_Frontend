import axiosInstance from "@/lib/axios";

/**
 * La versión la inyecta next.config.mjs desde package.json en tiempo de build,
 * así que nunca hay un número escrito a mano que se quede viejo.
 */
export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? "dev";
export const APP_COMMIT = process.env.NEXT_PUBLIC_COMMIT || null;
export const APP_BUILT_AT = process.env.NEXT_PUBLIC_BUILT_AT || null;

export interface ApiVersion {
  version: string;
  commit: string | null;
  built_at: string | null;
  environment: string;
}

/**
 * Frontend y backend comparten numeración, así que una diferencia aquí
 * significa que un lado quedó sin desplegar.
 */
export const fetchApiVersion = async (): Promise<ApiVersion> => {
  const { data } = await axiosInstance.get<ApiVersion>("/version");

  return data;
};
