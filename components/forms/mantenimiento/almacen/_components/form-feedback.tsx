import type { FieldValues, UseFormSetError } from "react-hook-form";
import { toast } from "sonner";

import { collectIssues, type FieldIssue } from "@/lib/formErrors";

/** Rótulo con que el usuario conoce cada campo, por nombre de campo. */
export type FieldLabels = Record<string, string>;

const MAX_LISTED = 5;

/** El primero por campo raíz: `serial.0` y `serial.1` son el mismo aviso. */
const onePerField = (issues: FieldIssue[]) => {
  const seen = new Set<string>();

  return issues.filter(({ field }) => {
    const root = field.split(".")[0];
    if (seen.has(root)) return false;
    seen.add(root);

    return true;
  });
};

/**
 * Lleva la vista al primer campo con error, en el orden en que aparecen en
 * pantalla. Los formularios son largos y, dentro de un diálogo, el campo
 * fallido casi nunca está a la vista: el envío parecía no hacer nada.
 *
 * Espera a que los errores estén pintados —`aria-invalid` se marca al renderizar
 * y no al registrar el error— y a que react-hook-form termine de enfocar por su
 * cuenta el primer error en orden de esquema: esto debe quedar encima de eso.
 */
const revealFirstError = (form?: Element | null) => {
  setTimeout(() => {
    // Sin formulario conocido, el diálogo abierto más reciente: el resto de la
    // página queda detrás y puede tener sus propios campos inválidos.
    const dialogs = document.querySelectorAll('[role="dialog"]');
    const scope = form ?? dialogs[dialogs.length - 1] ?? document;
    const target = scope.querySelector<HTMLElement>('[aria-invalid="true"]');
    if (!target) return;

    target.scrollIntoView({ behavior: "smooth", block: "center" });
    target.focus?.({ preventScroll: true });
  }, 60);
};

/**
 * Manejador de `handleSubmit` para cuando el formulario no pasa su validación.
 *
 * Sin él el envío fallaba en silencio: el error vivía bajo un campo que podía
 * estar fuera de la pantalla y ni el botón ni un aviso decían qué faltaba.
 */
export const invalidFormHandler =
  (labels: FieldLabels) => (errors: unknown, event?: unknown) => {
    const issues = onePerField(collectIssues(errors));
    if (issues.length === 0) return;

    const listed = issues.slice(0, MAX_LISTED);
    const rest = issues.length - listed.length;

    toast.error(
      issues.length === 1
        ? "Hay un dato por corregir"
        : `Hay ${issues.length} datos por corregir`,
      {
        description: (
          <ul className="mt-1 list-disc space-y-0.5 pl-4">
            {listed.map(({ field, message }) => (
              <li key={field}>
                <span className="font-medium">
                  {labels[field.split(".")[0]] ?? field}:
                </span>{" "}
                {message}
              </li>
            ))}
            {rest > 0 && <li>y {rest} más.</li>}
          </ul>
        ),
      },
    );

    const target = (event as { target?: unknown } | undefined)?.target;

    revealFirstError(target instanceof Element ? target.closest("form") : null);
  };

/** Los errores por campo de un 422 de Laravel, o `null` si es otro tipo de fallo. */
export const serverFieldErrors = (
  error: unknown,
): Record<string, string[]> | null => {
  const response = (
    error as {
      response?: { status?: number; data?: { errors?: unknown } };
    }
  )?.response;

  const errors = response?.data?.errors;
  if (response?.status !== 422 || !errors || typeof errors !== "object") {
    return null;
  }

  return errors as Record<string, string[]>;
};

/**
 * Pinta bajo su campo los errores que rechazó el servidor.
 *
 * El toast ya dice el motivo, pero sin esto el formulario quedaba intacto: el
 * usuario leía el aviso, lo perdía de vista y no sabía cuál campo corregir.
 * Solo se marcan los campos que el formulario conoce; los demás (dimensiones,
 * equivalencias) viven en sus propios controles y los cubre el toast.
 */
export const applyServerFieldErrors = <T extends FieldValues>(
  setError: UseFormSetError<T>,
  errors: Record<string, string[]>,
  labels: FieldLabels,
) => {
  let applied = false;

  for (const [field, messages] of Object.entries(errors)) {
    // Laravel nombra los elementos de lista `serial.0`: se reconocen por su raíz.
    if (!(field.split(".")[0] in labels) || !messages?.[0]) continue;

    setError(field as never, { type: "server", message: messages[0] });
    applied = true;
  }

  if (applied) revealFirstError();
};
