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
    return value && value.startsWith("/") && !value.startsWith("//")
      ? value
      : null;
  } catch {
    return null;
  }
}
