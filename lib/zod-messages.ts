import * as z from "zod";

/**
 * zod 4 reescribió sus mensajes por defecto apuntando al programador ("Invalid
 * input: expected string, received undefined" para un campo vacío) y su locale
 * `es` traduce la misma jerga. Acá se define lo que ve el usuario cuando el
 * validador no trae `message` propio.
 */
const mensajes: z.core.$ZodErrorMap = (issue) => {
  switch (issue.code) {
    case "invalid_type":
      if (issue.input === undefined || issue.input === null)
        return "Este campo es obligatorio.";
      if (issue.expected === "int") return "Debe ser un número entero.";
      if (issue.expected === "number") return "Debe ser un número.";
      if (issue.expected === "date") return "Debe ser una fecha válida.";
      return "Valor inválido.";

    case "too_small": {
      const minimo = Number(issue.minimum);
      if (issue.origin === "string")
        return minimo <= 1
          ? "Este campo es obligatorio."
          : `Debe tener al menos ${minimo} caracteres.`;
      if (issue.origin === "array")
        return minimo <= 1
          ? "Seleccione al menos una opción."
          : `Seleccione al menos ${minimo} opciones.`;
      return issue.inclusive
        ? `Debe ser mayor o igual a ${minimo}.`
        : `Debe ser mayor a ${minimo}.`;
    }

    case "too_big": {
      const maximo = Number(issue.maximum);
      if (issue.origin === "string")
        return `No puede tener más de ${maximo} ${maximo === 1 ? "carácter" : "caracteres"}.`;
      return issue.inclusive
        ? `Debe ser menor o igual a ${maximo}.`
        : `Debe ser menor a ${maximo}.`;
    }

    case "invalid_format":
      return issue.format === "email"
        ? "Correo electrónico inválido."
        : "El formato no es válido.";

    case "invalid_value":
      return "Seleccione una opción válida.";

    case "invalid_union":
      return "Valor inválido.";

    default:
      return undefined;
  }
};

// El locale queda como respaldo de los códigos que el mapa no cubre.
z.config({ ...z.locales.es(), customError: mensajes });
