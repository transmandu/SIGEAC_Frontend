import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

import {
  archivosSinContratoDeErrores,
  reglasDeErrores,
} from "./eslint/contrato-de-errores.mjs";
import {
  archivosSinContratoDeFechas,
  reglasDeFechas,
} from "./eslint/contrato-de-fechas.mjs";
import {
  archivosSinContratoDeNombres,
  reglasDeNombres,
} from "./eslint/contrato-de-nombres.mjs";

const config = [
  // Flat config solo ignora node_modules por su cuenta.
  {
    ignores: [".next/**", "next-env.d.ts", "public/**"],
  },
  ...nextCoreWebVitals,
  {
    // Los contratos comparten una sola regla `no-restricted-syntax`: dos bloques
    // sobre los mismos archivos se pisarían. Cada uno aporta sus selectores y los
    // archivos que lo implementan (que no se vigilan a sí mismos).
    //  - Errores: cómo se avisa un fallo al usuario (docs/manejo-de-errores.md).
    //  - Nombres: cómo se escribe el nombre de una persona (lib/person-name.ts).
    //  - Fechas: instantes en la zona de la compañía, días de calendario sin convertir (lib/date.ts).
    files: ["**/*.{ts,tsx}"],
    ignores: [
      ...archivosSinContratoDeErrores,
      ...archivosSinContratoDeNombres,
      ...archivosSinContratoDeFechas,
    ],
    rules: {
      "no-restricted-syntax": [
        "error",
        ...reglasDeErrores,
        ...reglasDeNombres,
        ...reglasDeFechas,
      ],
    },
  },
  {
    // eslint-plugin-react-hooks 7 sumó los diagnósticos del React Compiler, que
    // marcan 178 puntos de código que ya existía. Quedan en advertencia para no
    // volver `lint` inútil como barrera mientras se revisan por módulo:
    // set-state-in-effect (109), refs (47), static-components (11),
    // preserve-manual-memoization (7), immutability (4).
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/static-components": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
      "react-hooks/immutability": "warn",
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["../*"],
              message:
                "Usa imports absolutos con @/ en vez de subir de directorio.",
            },
          ],
        },
      ],
    },
  },
];

export default config;
