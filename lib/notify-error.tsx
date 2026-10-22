"use client";

import type { FieldValues, UseFormSetError } from "react-hook-form";
import { isAxiosError } from "axios";
import { toast } from "sonner";

import {
  applyServerFieldErrors,
  type FieldLabels,
} from "@/components/forms/mantenimiento/almacen/_components/form-feedback";
import { findFormForErrors } from "@/lib/form-error-bridge";
import {
  describeApiError,
  isBlobError,
  readBlobError,
  type ApiErrorKind,
  type DescribedError,
  type DescribeOptions,
} from "@/lib/api-error";
import { guessErrorReportModuleFromPath } from "@/lib/errorReportModules";
import {
  useErrorReportDraftStore,
  type ErrorReportContext,
} from "@/stores/ErrorReportDraftStore";

/**
 * Fallos de conectividad: cuando una pantalla lanza varias peticiones a la vez
 * y todas fallan por lo mismo, un solo aviso que se actualiza dice más que
 * cinco iguales apilados.
 */
const ONE_AT_A_TIME: ReadonlySet<ApiErrorKind> = new Set([
  "offline",
  "timeout",
  "unreachable",
  "unavailable",
]);

/**
 * Fallos que solo un desarrollador puede resolver, y por tanto vale la pena
 * reportar. Un error de validación o de red no: el usuario ya sabe qué hacer.
 */
const REPORTABLE: ReadonlySet<ApiErrorKind> = new Set([
  "server",
  "schema",
  "database",
  "external",
  "endpointMissing",
]);

/** Quien debe comunicar un código al desarrollador necesita tiempo para anotarlo. */
const DURATION_WITH_REFERENCE = 12_000;

export interface NotifyErrorOptions<
  T extends FieldValues = FieldValues,
> extends DescribeOptions {
  /**
   * Formulario que originó la petición: si el servidor rechazó campos
   * concretos, se marcan bajo su input además de avisar.
   */
  form?: { setError: UseFormSetError<T>; labels: FieldLabels };
  /**
   * Un solo aviso por familia de error aunque se repita. Es lo que usa el
   * manejador global de consultas: una pantalla con varias peticiones fallando
   * por la misma causa no debe apilar un aviso por cada una.
   */
  dedupe?: boolean;
}

const copyReference = async (reference: string) => {
  try {
    await navigator.clipboard.writeText(reference);
    toast.success("Código copiado", { duration: 1500 });
  } catch {
    // Sin permiso de portapapeles el código sigue a la vista en el aviso.
  }
};

/** Los títulos llevan "¡Ops!" o "¡Error!"; dentro de una frase estorban. */
const plainTitle = (title: string) => title.replace(/^¡(?:Ops|Error)!\s*/, "");

/**
 * Texto con que arranca el reporte: lo mismo que vio el usuario en el aviso
 * (qué intentaba, qué le dijo el sistema) y la pregunta que el desarrollador
 * necesita que responda. El código y la pantalla viajan aparte.
 */
const reportDescription = (error: DescribedError, action?: string) => {
  const title = plainTitle(error.title);
  const intro = action
    ? `Al intentar ${action} me apareció el aviso "${title}".`
    : `Me apareció el aviso "${title}".`;

  return [
    intro,
    `El sistema me dijo: ${error.description}`,
    "¿Qué estabas haciendo cuando ocurrió? ",
  ].join("\n\n");
};

/** "POST /api/articles" de la petición que falló, si el error vino de una. */
const failedRequest = (error: unknown): string | undefined => {
  if (!isAxiosError(error) || !error.config?.url) return undefined;

  const base = error.config.baseURL?.replace(/\/+$/, "") ?? "";
  const path = error.config.url.startsWith("http")
    ? error.config.url
    : `${base}/${error.config.url.replace(/^\/+/, "")}`;

  return `${(error.config.method ?? "get").toUpperCase()} ${path}`;
};

const reportContext = (
  error: DescribedError,
  raw: unknown,
): ErrorReportContext => ({
  title: plainTitle(error.title),
  message: error.description,
  hint: error.hint,
  kind: error.kind,
  request: failedRequest(raw),
  ...(typeof window === "undefined"
    ? {}
    : {
        userAgent: navigator.userAgent,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        language: navigator.language,
        online: navigator.onLine,
      }),
});

const reportDraft = (
  error: DescribedError,
  raw: unknown,
  action?: string,
) => ({
  context: reportContext(error, raw),
  description: reportDescription(error, action),
  errorTitle: plainTitle(error.title),
  errorReference: error.reference,
  errorCode: error.code,
  httpStatus: error.status,
  pageUrl:
    typeof window === "undefined"
      ? undefined
      : `${window.location.pathname}${window.location.search}`,
  module:
    typeof window === "undefined"
      ? undefined
      : guessErrorReportModuleFromPath(window.location.pathname),
});

function ErrorBody({
  error,
  showHint,
}: {
  error: DescribedError;
  showHint: boolean;
}) {
  return (
    <div className="space-y-1">
      <p>{error.description}</p>
      {showHint && error.hint && (
        <p className="font-mono text-xs opacity-80">{error.hint}</p>
      )}
      {error.reference && (
        <p className="text-xs opacity-80">
          Código para soporte:{" "}
          <span className="font-mono font-semibold">{error.reference}</span>
          {" · "}
          {/* Un botón del propio texto y no del aviso: los botones de sonner
              cierran el aviso al pulsarlos, y el código debe seguir a la vista
              mientras se anota. */}
          <button
            type="button"
            onClick={() => void copyReference(error.reference as string)}
            className="underline underline-offset-2 hover:opacity-100"
          >
            Copiar
          </button>
        </p>
      )}
    </div>
  );
}

/**
 * Avisa de un error de la API con título y texto propios de su causa, y
 * devuelve lo que se mostró por si el llamador quiere reaccionar.
 *
 * Reemplaza al `toast.error("Oops!", { description })` repetido en cada
 * mutación: el mismo fallo se explica igual en todas partes y el texto sale de
 * lo que realmente pasó, no de una frase fija escrita de antemano.
 *
 * Las peticiones canceladas a propósito no avisan. Si el error viene de una
 * descarga (`responseType: "blob"`) su cuerpo llega sin decodificar: se lee y el
 * aviso sale un instante después, así que ningún llamador tiene que saber qué
 * clase de petición hizo.
 */
export function notifyError<T extends FieldValues = FieldValues>(
  error: unknown,
  options: NotifyErrorOptions<T> = {},
): DescribedError {
  const described = describeApiError(error, {
    action: options.action,
    messages: options.messages,
  });

  if (isBlobError(error)) {
    void readBlobError(error).then((decoded) => notifyError(decoded, options));

    return described;
  }

  if (described.silent) return described;

  // Un 401 lo atiende AuthContext (cierra la sesión y avisa "Sesión
  // finalizada"): un segundo aviso aquí se apilaba sobre el suyo. Otros fallos
  // de sesión (un 419, un 401 de una sesión ya reemplazada) sí se avisan.
  if (described.kind === "session" && described.status === 401) {
    return described;
  }

  if (process.env.NODE_ENV !== "production") {
    console.error(
      `[${described.code ?? described.kind}]`,
      described.reference ?? "",
      error,
    );
  }

  if (described.fieldErrors) {
    // Con `form` explícito se usa ese; si no, el formulario abierto que tenga
    // alguno de los campos rechazados.
    const target = options.form ?? findFormForErrors(described.fieldErrors);

    if (target) {
      applyServerFieldErrors(
        target.setError as UseFormSetError<T>,
        described.fieldErrors,
        target.labels,
      );
    }
  }

  // Reportar solo tiene sentido con sesión (quien monta el formulario lo
  // avisa en la tienda) y para fallos que le tocan al desarrollador.
  const { canReport: sessionCanReport, isSuperUser } =
    useErrorReportDraftStore.getState();
  const canReport = REPORTABLE.has(described.kind) && sessionCanReport;

  toast.error(described.title, {
    id:
      options.dedupe || ONE_AT_A_TIME.has(described.kind)
        ? `error:${described.kind}`
        : undefined,
    description: <ErrorBody error={described} showHint={isSuperUser} />,
    duration: described.reference ? DURATION_WITH_REFERENCE : undefined,
    // "Reportar" abre el formulario con el código y la pantalla ya cargados.
    action: canReport
      ? {
          label: "Reportar",
          onClick: () =>
            useErrorReportDraftStore
              .getState()
              .openDraft(reportDraft(described, error, options.action)),
        }
      : undefined,
  });

  return described;
}

/** Igual que `notifyError`, para quien necesita esperar a que el aviso salga. */
export async function notifyBlobError<T extends FieldValues = FieldValues>(
  error: unknown,
  options: NotifyErrorOptions<T> = {},
): Promise<DescribedError> {
  return notifyError(await readBlobError(error), options);
}
