/**
 * El texto que el backend mandó, para no tapar con un genérico la razón real
 * del fallo: el 409 de "ya se usó en una Orden de Trabajo" y el detalle de
 * campo de un 422 son lo único que le dice al usuario qué corregir.
 */
export const apiErrorMessage = (error: unknown, fallback: string): string => {
    const data = (error as { response?: { data?: unknown } })?.response?.data as
        | { message?: string; errors?: Record<string, string[]> }
        | undefined;

    if (!data) return fallback;

    // 422: Laravel manda los mensajes por campo y un "message" genérico
    // ("The given data was invalid"), que solo no dice qué campo falló.
    const fieldErrors = Object.values(data.errors ?? {}).flat();
    if (fieldErrors.length) return fieldErrors.join(" ");

    return data.message || fallback;
};
