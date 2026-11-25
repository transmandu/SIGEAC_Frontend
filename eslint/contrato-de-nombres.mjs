/**
 * Contrato de nombres de personas: el nombre completo de un usuario o empleado
 * se escribe SIEMPRE con `fullName()` de `@/lib/person-name` ("NOMBRE APELLIDO",
 * en mayúsculas). Armarlo a mano —en una plantilla, con `+`, con `join` o dentro
 * de JSX— produce una forma más de escribirlo; estas reglas lo vuelven un error
 * de lint, en el editor y en el CI, con el mensaje que dice qué usar.
 *
 * Solo se prohíbe UNIR `first_name` con `last_name` para mostrarlos. Leer uno
 * solo (la columna "Nombre", el valor de un campo de formulario, mapear un
 * payload) sigue siendo libre.
 *
 * Se combina con `contrato-de-errores.mjs` en `eslint.config.mjs`: dos bloques
 * `no-restricted-syntax` sobre los mismos archivos se pisan entre sí.
 */

const HOW =
  "Usa fullName(persona) de @/lib/person-name (o formalName / initialsOf del mismo archivo): es la única forma de escribir el nombre de una persona, siempre en mayúsculas.";

// `a.first_name` o `a?.first_name`, en cualquier parte del subárbol.
const field = (name) => `MemberExpression[property.name='${name}']`;

// Hijo directo: el campo suelto, o dentro de `?.`.
const direct = (name) =>
  `:matches(MemberExpression[property.name='${name}'], ChainExpression[expression.property.name='${name}'])`;

// Hijo directo de un elemento JSX: {a.first_name}, {a?.first_name}, {a.first_name || "N/A"}.
const jsxChild = (name) =>
  `:matches(JSXExpressionContainer[expression.property.name='${name}'], JSXExpressionContainer[expression.expression.property.name='${name}'], JSXExpressionContainer[expression.left.property.name='${name}'], JSXExpressionContainer[expression.left.expression.property.name='${name}'])`;

export const archivosSinContratoDeNombres = ["lib/person-name.ts"];

export const reglasDeNombres = [
  {
    selector: `TemplateLiteral:has(${field("first_name")}):has(${field("last_name")})`,
    message: `No interpoles first_name y last_name para armar un nombre. ${HOW}`,
  },
  {
    selector: `BinaryExpression[operator='+']:has(${field("first_name")}):has(${field("last_name")})`,
    message: `No concatenes first_name y last_name para armar un nombre. ${HOW}`,
  },
  {
    selector: `ArrayExpression:has(> ${direct("first_name")}):has(> ${direct("last_name")})`,
    message: `No unas first_name y last_name en un arreglo (join) para armar un nombre. ${HOW}`,
  },
  {
    selector: `JSXElement:has(> ${jsxChild("first_name")}):has(> ${jsxChild("last_name")})`,
    message: `No pintes first_name y last_name sueltos en JSX para armar un nombre. ${HOW}`,
  },
];
