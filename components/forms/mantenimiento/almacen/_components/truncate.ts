/**
 * Recorta descripciones para las listas del formulario de salidas.
 *
 * Hay descripciones de cientos de caracteres: en un `CommandItem` el `truncate`
 * de CSS ya las corta visualmente, pero se llevan todo el ancho disponible y
 * dejan sin sitio al resto de la línea (disponible, unidad).
 */
export function truncateText(value: string | null | undefined, max = 30) {
    const text = value?.trim()
    if (!text) return ""
    return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text
}
