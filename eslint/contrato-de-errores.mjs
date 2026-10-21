/**
 * Contrato de errores: cómo se avisa un fallo al usuario.
 *
 * Existe para que nadie tenga que acordarse. Un `toast.error("Oops!")` escrito
 * a mano vuelve a dejar al usuario sin saber qué pasó y al desarrollador sin un
 * código que buscar en el log; estas reglas lo vuelven un error de lint, en el
 * editor y en el CI, con el mensaje que dice qué usar en su lugar.
 *
 * Se carga desde `eslint.config.mjs`: lo ve el editor y lo corre el CI con
 * `pnpm lint`.
 *
 * Guía: docs/manejo-de-errores.md
 */

const HOW =
  'Usa notifyError(error, { action: "crear el artículo" }) de @/lib/notify-error (docs/manejo-de-errores.md).';

const TOAST_ERROR =
  "CallExpression[callee.object.name='toast'][callee.property.name='error']";

export const contratoDeErrores = [
  {
    files: ["**/*.{ts,tsx}"],
    // Las dos piezas que implementan el contrato sí hablan con toast directamente.
    ignores: ["lib/notify-error.tsx", "lib/api-error.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: `${TOAST_ERROR}[arguments.0.type='Literal'][arguments.0.value=/^.?(oops|ops|error)!?$/i]`,
          message: `Un título genérico ("Oops!", "Error") no dice qué pasó. ${HOW}`,
        },
        {
          selector: `Property[key.name='onError'] ${TOAST_ERROR}`,
          message: `No avises el fallo de una mutación con toast.error: pierde el título según la causa, el código de referencia y el botón Reportar. ${HOW}`,
        },
        {
          selector: `${TOAST_ERROR} MemberExpression[property.name='response']`,
          message: `No leas error.response a mano para armar el aviso: notifyError ya entiende todas las respuestas del backend. ${HOW}`,
        },
        {
          selector: `${TOAST_ERROR} MemberExpression[property.name='message'][object.name=/^(error|err|e)$/]`,
          message: `error.message es texto técnico ("Request failed with status code 500"), no para el usuario. ${HOW}`,
        },
        {
          selector: `CallExpression[callee.object.name='toast'][callee.property.name=/^(error|warning)$/] TemplateLiteral > Identifier[name=/^(error|err|e)$/]`,
          message: `Interpolar el error en el texto vuelca "AxiosError: ..." al usuario. ${HOW}`,
        },
        {
          selector: `CallExpression[callee.name='toast'] Property[key.name='variant'][value.value='destructive']`,
          message: `toast({ variant: "destructive" }) es la otra vía de avisar errores y no pasa por el contrato. ${HOW}`,
        },
      ],
    },
  },
];
