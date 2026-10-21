import axios from "axios";

/**
 * Familias de error que el usuario distingue. Cada una tiene su título y su
 * tratamiento; `describeApiError` decide a cuál pertenece un fallo.
 */
export type ApiErrorKind =
  // El usuario no tiene la culpa, pero tampoco el servidor: es la red.
  | "offline"
  | "timeout"
  | "unreachable"
  | "unavailable"
  // El usuario puede corregirlo.
  | "validation"
  | "invalidData"
  | "business"
  | "duplicate"
  | "inUse"
  | "conflict"
  | "tooLarge"
  | "tooManyRequests"
  | "forbidden"
  | "notFound"
  | "session"
  // Es del sistema: hace falta un desarrollador.
  | "endpointMissing"
  | "schema"
  | "database"
  | "external"
  | "server"
  | "unknown";

export interface DescribedError {
  kind: ApiErrorKind;
  /** Lo primero que ve el usuario: qué pasó, en pocas palabras. */
  title: string;
  /** Por qué pasó y qué puede hacer. */
  description: string;
  /** Identificador estable que manda el backend (`SCHEMA_MISSING_COLUMN`...). */
  code?: string;
  /** Código para comunicar al desarrollador; une el aviso con el log. */
  reference?: string;
  /** Pista técnica corta: columna, tabla o restricción. Nunca SQL. */
  hint?: string;
  status?: number;
  /** Errores por campo de un 422. */
  fieldErrors?: Record<string, string[]>;
  retryAfter?: number;
  /** La petición se canceló a propósito (navegación, nueva búsqueda): no se avisa. */
  silent: boolean;
}

interface ApiErrorBody {
  message?: unknown;
  code?: unknown;
  reference?: unknown;
  hint?: unknown;
  errors?: unknown;
  retry_after?: unknown;
  /** Clave antigua de muchos endpoints: `{ "error": "texto" }` en vez de `message`. */
  error?: unknown;
}

export interface DescribeOptions {
  /** Lo que se intentaba hacer, en infinitivo: "crear el artículo". */
  action?: string;
  /**
   * Texto propio para una familia de error, cuando el flujo sabe algo que el
   * genérico no: "El máximo permitido es 10 MB" para `tooLarge` en una subida.
   * Gana sobre el mensaje del backend y sobre el por defecto.
   */
  messages?: Partial<Record<ApiErrorKind, string>>;
}

const str = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim() !== "" ? value : undefined;

const isFieldErrors = (value: unknown): value is Record<string, string[]> =>
  !!value &&
  typeof value === "object" &&
  !Array.isArray(value) &&
  Object.values(value).every((messages) => Array.isArray(messages));

/** Primer mensaje de cada campo, sin repetir, en el orden en que llegaron. */
export const fieldErrorMessages = (
  errors: Record<string, string[]>,
): string[] => {
  const seen = new Set<string>();

  for (const messages of Object.values(errors)) {
    const first = str(messages?.[0]);
    if (first) seen.add(first);
  }

  return [...seen];
};

/**
 * Textos del propio framework que un backend sin actualizar o un proxy pueden
 * dejar pasar ("No query results for model [...]"): no dicen nada a un usuario.
 */
const FRAMEWORK_TEXT =
  /^(No query results for model|The route |Server Error$|Unauthenticated\.?$|This action is unauthorized)/i;

/** El error viene de una descarga (`responseType: "blob"`) y su cuerpo no está leído. */
export const isBlobError = (error: unknown): boolean =>
  axios.isAxiosError(error) && error.response?.data instanceof Blob;

const isOffline = () =>
  typeof navigator !== "undefined" && navigator.onLine === false;

/** Pagina HTML devuelta por un proxy o balanceador, no por la API. */
const isHtmlBody = (data: unknown) =>
  typeof data === "string" && /^\s*<(!doctype|html)/i.test(data);

const kindFromCode = (code: string | undefined): ApiErrorKind | undefined => {
  switch (code) {
    case "VALIDATION_ERROR":
      return "validation";
    case "BUSINESS_RULE":
    case "BAD_REQUEST":
    case "METHOD_NOT_ALLOWED":
      return "business";
    case "UNAUTHENTICATED":
      return "session";
    case "FORBIDDEN":
      return "forbidden";
    case "RESOURCE_NOT_FOUND":
    case "COMPANY_NOT_FOUND":
      return "notFound";
    case "ENDPOINT_NOT_FOUND":
      return "endpointMissing";
    case "DUPLICATE_RECORD":
      return "duplicate";
    case "RECORD_IN_USE":
      return "inUse";
    case "INVALID_REFERENCE":
    case "DATA_TOO_LONG":
    case "INVALID_DATA_FORMAT":
    case "CONSTRAINT_VIOLATION":
      return "invalidData";
    case "CONCURRENT_UPDATE":
      return "conflict";
    case "PAYLOAD_TOO_LARGE":
      return "tooLarge";
    case "TOO_MANY_REQUESTS":
      return "tooManyRequests";
    case "SCHEMA_MISSING_COLUMN":
    case "SCHEMA_MISSING_TABLE":
      return "schema";
    case "DB_UNAVAILABLE":
    case "SERVICE_UNAVAILABLE":
      return "unavailable";
    case "DB_TIMEOUT":
      return "timeout";
    case "DATABASE_ERROR":
    case "REQUIRED_VALUE_MISSING":
      return "database";
    case "EXTERNAL_SERVICE_ERROR":
      return "external";
    case "INTERNAL_ERROR":
      return "server";
    default:
      return undefined;
  }
};

const kindFromStatus = (
  status: number,
  hasFieldErrors: boolean,
): ApiErrorKind => {
  if (status === 401 || status === 419) return "session";
  if (status === 403) return "forbidden";
  if (status === 404) return "notFound";
  if (status === 413) return "tooLarge";
  if (status === 429) return "tooManyRequests";
  if (status === 422 && hasFieldErrors) return "validation";
  if (status === 409) return "business";
  if (status === 408 || status === 504) return "timeout";
  if (status === 502 || status === 503) return "unavailable";
  if (status >= 500) return "server";
  if (status >= 400) return "business";

  return "unknown";
};

/** Título de cada familia: "¡Ops!" si el usuario puede resolverlo, "¡Error!" si no. */
const titleFor = (kind: ApiErrorKind, action?: string): string => {
  switch (kind) {
    case "offline":
      return "¡Ops! Sin conexión a internet";
    case "timeout":
      return "¡Error! El servidor tarda demasiado";
    case "unreachable":
      return "¡Error! No pudimos conectar con el servidor";
    case "unavailable":
      return "¡Error! Servidor no disponible";
    case "validation":
      return "¡Ops! Revisa el formulario";
    case "invalidData":
      return "¡Ops! Hay un dato que no se aceptó";
    case "business":
      return action
        ? `¡Ops! No se pudo ${action}`
        : "¡Ops! No se pudo completar";
    case "duplicate":
      return "¡Ops! Ya existe un registro igual";
    case "inUse":
      return "¡Ops! Está en uso";
    case "conflict":
      return "¡Ops! Alguien más modificó lo mismo";
    case "tooLarge":
      return "¡Ops! Archivo demasiado grande";
    case "tooManyRequests":
      return "¡Ops! Vas muy rápido";
    case "forbidden":
      return "¡Ops! Acción no permitida";
    case "notFound":
      return "¡Ops! No lo encontramos";
    case "session":
      return "¡Ops! Tu sesión terminó";
    case "endpointMissing":
      return "¡Error! Función no disponible";
    case "schema":
      return "¡Error! Falta una actualización del sistema";
    case "database":
      return "¡Error! Problema con la base de datos";
    case "external":
      return "¡Error! Un servicio externo no respondió";
    case "server":
      return action
        ? `¡Error! Algo falló al ${action}`
        : "¡Error! Algo falló de nuestro lado";
    default:
      return action ? `¡Ops! No se pudo ${action}` : "¡Ops! Algo salió mal";
  }
};

/**
 * Texto por defecto cuando el backend no trae uno propio. Solo menciona "este
 * código" si hay un código que comunicar: un 500 que no pasó por el manejador
 * del backend no lo trae, y pedirlo dejaría al usuario buscando algo que no
 * existe.
 */
const defaultDescription = (
  kind: ApiErrorKind,
  retryAfter?: number,
  hasReference = false,
): string => {
  const reportIt = hasReference
    ? " Comunica este código a tu desarrollador."
    : " Si se repite, avisa a tu desarrollador.";

  switch (kind) {
    case "offline":
      return "Tu equipo no tiene internet. Revisa tu conexión y vuelve a intentarlo.";
    case "timeout":
      return "La solicitud tardó más de lo normal y se canceló. Inténtalo de nuevo; si se repite, avisa a soporte.";
    case "unreachable":
      return "El servidor no respondió. Puede ser un corte momentáneo de la red o del servicio: reintenta en unos segundos y, si persiste, avisa a soporte.";
    case "unavailable":
      return "El servidor no puede atender la solicitud en este momento. Inténtalo de nuevo en unos minutos.";
    case "validation":
      return "Hay datos del formulario que corregir.";
    case "invalidData":
      return "Uno de los datos enviados no es válido. Revísalo e inténtalo de nuevo.";
    case "business":
      return "La operación no se pudo completar con los datos enviados.";
    case "duplicate":
      return "Ya hay un registro con esos datos.";
    case "inUse":
      return "No se puede eliminar porque otros registros lo están usando.";
    case "conflict":
      return "Otro usuario estaba modificando la misma información. Inténtalo de nuevo.";
    case "tooLarge":
      return "El archivo o los datos enviados son demasiado grandes.";
    case "tooManyRequests":
      return retryAfter
        ? `Espera ${retryAfter} segundos e inténtalo de nuevo.`
        : "Espera un momento e inténtalo de nuevo.";
    case "forbidden":
      return "No tienes permiso para realizar esta acción.";
    case "notFound":
      return "El registro ya no existe o fue eliminado.";
    case "session":
      return "Tu sesión no es válida o ya expiró. Inicia sesión de nuevo.";
    case "endpointMissing":
      return "Esta función no existe en el servidor. Puede haber una actualización pendiente: avisa a tu desarrollador.";
    case "schema":
      return `El sistema necesita una actualización de base de datos que todavía no se aplicó.${reportIt}`;
    case "database":
      return `Ocurrió un error al guardar o consultar la información.${reportIt}`;
    case "external":
      return "No se pudo comunicar con un servicio externo (correo o notificaciones). Inténtalo de nuevo.";
    case "server":
      return `Ocurrió un error inesperado en el servidor.${reportIt}`;
    default:
      return "Ocurrió un error inesperado. Inténtalo de nuevo.";
  }
};

/**
 * Qué familias muestran el mensaje del backend tal cual. En el resto el texto
 * lo decide el cliente porque el servidor no llegó a responder, o responde un
 * texto genérico que aquí se puede decir mejor.
 */
const USES_BACKEND_MESSAGE: ReadonlySet<ApiErrorKind> = new Set([
  "validation",
  "invalidData",
  "business",
  "duplicate",
  "inUse",
  "conflict",
  "tooLarge",
  "tooManyRequests",
  "forbidden",
  "notFound",
  "schema",
  "database",
  "external",
  "server",
  "unavailable",
  "timeout",
]);

const describeValidation = (
  fieldErrors: Record<string, string[]> | undefined,
  backendMessage: string | undefined,
): string => {
  const messages = fieldErrors ? fieldErrorMessages(fieldErrors) : [];

  if (messages.length === 0) {
    return backendMessage ?? defaultDescription("validation");
  }

  const listed = messages.slice(0, 3).join(" ");
  const rest = messages.length - 3;

  return rest > 0 ? `${listed} (y ${rest} más)` : listed;
};

/**
 * Clasifica cualquier error y arma lo que se le dice al usuario.
 *
 * Es la única fuente de esos textos: los avisos, los formularios y los
 * reportes pasan por aquí para que el mismo fallo se explique igual en todas
 * partes. No decide cómo se muestra, solo qué pasó.
 */
export function describeApiError(
  error: unknown,
  options: DescribeOptions = {},
): DescribedError {
  const described = classifyApiError(error, options);
  const override = options.messages?.[described.kind];

  return override ? { ...described, description: override } : described;
}

function classifyApiError(
  error: unknown,
  options: DescribeOptions,
): DescribedError {
  const { action } = options;

  if (axios.isCancel(error)) {
    return {
      kind: "unknown",
      title: "",
      description: "",
      silent: true,
    };
  }

  if (!axios.isAxiosError(error)) {
    // Un `Error` plano lo lanza el propio código a propósito (`throw new
    // Error("No hay datos para esos filtros")`): su texto es para el usuario,
    // igual que el de una regla de negocio del backend.
    if (
      error instanceof Error &&
      error.constructor === Error &&
      str(error.message)
    ) {
      return {
        kind: "business",
        title: titleFor("business", action),
        description: error.message,
        silent: false,
      };
    }

    // Cualquier otra cosa (TypeError, ReferenceError...) es un bug de la
    // pantalla: el texto técnico va como pista para que quien lo reporte lo
    // dicte tal cual.
    return {
      kind: "unknown",
      title: titleFor("unknown", action),
      description:
        "Ocurrió un error inesperado en la aplicación. Recarga la página; si se repite, avisa a tu desarrollador.",
      hint: error instanceof Error ? str(error.message) : undefined,
      silent: false,
    };
  }

  if (!error.response) {
    const kind: ApiErrorKind = isOffline()
      ? "offline"
      : error.code === "ECONNABORTED" || error.code === "ETIMEDOUT"
        ? "timeout"
        : "unreachable";

    return {
      kind,
      title: titleFor(kind),
      description: defaultDescription(kind),
      status: undefined,
      silent: false,
    };
  }

  const { status, data } = error.response;
  const body: ApiErrorBody =
    data && typeof data === "object" && !(data instanceof Blob)
      ? (data as ApiErrorBody)
      : {};

  const code = str(body.code);
  const reference = str(body.reference);
  const hint = str(body.hint);
  const backendMessage = str(body.message) ?? str(body.error);
  // Algunos endpoints antiguos mandan el mapa por campo dentro de `message`.
  const fieldErrors = isFieldErrors(body.errors)
    ? body.errors
    : isFieldErrors(body.message)
      ? body.message
      : undefined;
  const retryAfter =
    typeof body.retry_after === "number" ? body.retry_after : undefined;

  // Una página HTML no viene de la API: un proxy o un balanceador respondiendo
  // por ella. Su texto no sirve para nada.
  const fromProxy = isHtmlBody(data);

  const kind =
    (fromProxy ? undefined : kindFromCode(code)) ??
    kindFromStatus(status, !!fieldErrors);

  const useBackend =
    !fromProxy &&
    !!backendMessage &&
    !FRAMEWORK_TEXT.test(backendMessage) &&
    USES_BACKEND_MESSAGE.has(kind);

  let description: string;

  if (kind === "validation") {
    description = describeValidation(fieldErrors, backendMessage);
  } else if (useBackend && (status < 500 || reference || code)) {
    // Con `code` o `reference` el backend ya redactó el texto para el usuario;
    // un 5xx sin ninguno de los dos es un texto crudo y no se muestra.
    description = backendMessage as string;
  } else {
    description = defaultDescription(kind, retryAfter, !!reference);
  }

  return {
    kind,
    title: titleFor(kind, action),
    description,
    code,
    reference,
    hint,
    status,
    fieldErrors,
    retryAfter,
    silent: false,
  };
}

/**
 * Descarga con `responseType: "blob"`: el cuerpo del error llega como Blob y
 * hay que leerlo antes de clasificarlo. Devuelve el mismo error con su cuerpo
 * ya decodificado, listo para `describeApiError`.
 */
export async function readBlobError(error: unknown): Promise<unknown> {
  if (!axios.isAxiosError(error) || !(error.response?.data instanceof Blob)) {
    return error;
  }

  try {
    const text = await error.response.data.text();
    error.response.data = JSON.parse(text);
  } catch {
    // No era JSON (un PDF a medias, una página del proxy): se deja el texto.
    error.response.data = undefined;
  }

  return error;
}
