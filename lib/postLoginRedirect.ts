"use client";

/**
 * Ruta que el usuario pedía cuando el middleware lo mandó al login. La escribe
 * AuthRedirect y la consume CompanyBootstrap, que es quien navega: entrar
 * directo a una ruta de empresa saltándose el bootstrap deja la sesión sin
 * estación resuelta, y medio sistema la lee desde CompanyStore.
 *
 * Va en sessionStorage y no en el store persistido: es de un solo uso y de esta
 * pestaña, no debe sobrevivir al cierre ni cruzarse entre pestañas.
 */
export const POST_LOGIN_REDIRECT_KEY = "post-login-redirect";

/**
 * Solo rutas internas. Se rechaza `//host` y `/\host` porque el navegador
 * normaliza la barra invertida y ambos saldrían del dominio: sería un
 * redirector abierto con destino controlado por la URL del login.
 */
export function isSafeInternalPath(path: string | null): path is string {
  return (
    !!path &&
    path.startsWith("/") &&
    !path.startsWith("//") &&
    !path.startsWith("/\\")
  );
}

/** `null` limpia cualquier valor anterior. */
export function setPostLoginRedirect(path: string | null) {
  if (typeof window === "undefined") return;

  try {
    if (path) {
      sessionStorage.setItem(POST_LOGIN_REDIRECT_KEY, path);
    } else {
      sessionStorage.removeItem(POST_LOGIN_REDIRECT_KEY);
    }
  } catch {
    // Storage bloqueado (modo privado): se pierde el destino, no la sesión.
  }
}

/** Lo devuelve y lo borra: un `from` solo se honra una vez. */
export function consumePostLoginRedirect(): string | null {
  if (typeof window === "undefined") return null;

  try {
    const value = sessionStorage.getItem(POST_LOGIN_REDIRECT_KEY);

    sessionStorage.removeItem(POST_LOGIN_REDIRECT_KEY);

    // Se revalida al consumir: entre que se guardó y ahora, el valor pudo ser
    // manipulado a mano en el storage.
    return isSafeInternalPath(value) ? value : null;
  } catch {
    return null;
  }
}

// Rutas protegidas que no cuelgan de /{slug}: el destino es válido sin importar
// qué empresa resolvió el bootstrap. Su acceso lo sigue filtrando ProtectedRoute.
const TENANT_FREE_PREFIXES = ["/sistema/", "/cuenta/"];

/**
 * Destino final tras el bootstrap: el `from` pendiente si es alcanzable con la
 * empresa ya resuelta, o `fallback` (su dashboard). Consume el `from` en el acto,
 * así que se llama en el momento de navegar, no al calcular el destino.
 */
export function resolveLandingPath(slug: string, fallback: string): string {
  const from = consumePostLoginRedirect();

  if (!from) return fallback;

  // `/hangar74/…` solo si la sesión resolvió esa misma empresa: el `from` puede
  // venir de la sesión anterior, con otra compañía.
  if (from.split("/")[1] === slug) return from;

  // `/sistema/empresas` y `/cuenta/…` no dependen de la empresa. Se exige la
  // barra final para que `/sistemaX` no cuele como `/sistema`.
  if (TENANT_FREE_PREFIXES.some((prefix) => from.startsWith(prefix))) {
    return from;
  }

  return fallback;
}
