import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

export default [
  // Flat config solo ignora node_modules por su cuenta.
  {
    ignores: [".next/**", "next-env.d.ts", "public/**"],
  },
  ...nextCoreWebVitals,
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
              message: "Usa imports absolutos con @/ en vez de subir de directorio.",
            },
          ],
        },
      ],
    },
  },
];
