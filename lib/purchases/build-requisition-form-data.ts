/**
 * Serializes a requisition payload (which may contain `File` instances
 * nested inside `articles[].batch_articles[]` / `general_articles[]`) into a
 * real `FormData` using Laravel's bracket notation (`key[index][field]`), so
 * nested file uploads survive the request instead of being lost to JSON
 * serialization.
 */
function appendValue(formData: FormData, key: string, value: unknown): void {
  if (value === undefined || value === null) return

  if (value instanceof File) {
    formData.append(key, value)
    return
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => appendValue(formData, `${key}[${index}]`, item))
    return
  }

  if (typeof value === "object" && !(value instanceof Date)) {
    Object.entries(value as Record<string, unknown>).forEach(([nestedKey, nestedValue]) =>
      appendValue(formData, `${key}[${nestedKey}]`, nestedValue)
    )
    return
  }

  formData.append(key, value instanceof Date ? value.toISOString() : String(value))
}

export function buildRequisitionFormData(data: object): FormData {
  const formData = new FormData()
  Object.entries(data).forEach(([key, value]) => appendValue(formData, key, value))
  return formData
}

/**
 * Extracts a human-readable message from a Laravel 422 validation error
 * response (`{ message, errors: { field: string[] } }`), preferring the
 * first field-level message since the top-level `message` is usually the
 * generic "The given data was invalid."
 */
export function getRequisitionErrorMessage(error: unknown, fallback: string): string {
  const response = (error as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } })?.response

  const firstFieldError = response?.data?.errors
    ? Object.values(response.data.errors)[0]?.[0]
    : undefined

  return firstFieldError ?? response?.data?.message ?? fallback
}
