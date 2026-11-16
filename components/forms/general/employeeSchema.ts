import { z } from "zod";

import { phoneSchema, toPhoneValue } from "@/lib/phone";
import type { Employee } from "@/types";

export const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
export const DNI_TYPES = ["V", "E", "J"] as const;

/** Sin acceso al sistema, vincular un usuario que ya existe o crear uno nuevo. */
export type AccessMode = "none" | "existing" | "new";

const same = (a: string | null | undefined, b: string | null | undefined) =>
  (a ?? "").trim().toLowerCase() === (b ?? "").trim().toLowerCase();

const today = () => new Date().toLocaleDateString("en-CA");

/** Lo mínimo de otro empleado para detectar cédula o correo repetidos antes de enviar. */
export type KnownEmployee = Pick<Employee, "id" | "dni" | "email">;

export interface EmployeeSchemaOptions {
  /** Todos los empleados conocidos (activos e inactivos), para los duplicados. */
  employees?: KnownEmployee[];
  /** El empleado que se edita: se ignora a sí mismo y la cédula no se revisa. */
  current?: Employee;
}

const employeeObject = ({ current }: EmployeeSchemaOptions) =>
  z.object({
    first_name: z
      .string()
      .trim()
      .min(1, { message: "Ingrese el nombre." })
      .max(255, { message: "No puede superar los 255 caracteres." }),
    middle_name: z.string().trim().max(255),
    last_name: z
      .string()
      .trim()
      .min(1, { message: "Ingrese el apellido." })
      .max(255, { message: "No puede superar los 255 caracteres." }),
    second_last_name: z.string().trim().max(255),
    dni_type: z.enum(DNI_TYPES),
    dni: z
      .string()
      .trim()
      .regex(/^[0-9A-Za-z]{5,20}$/, {
        message: "La cédula son de 5 a 20 letras o números, sin espacios.",
      }),
    gender: z.enum(["MALE", "FEMALE"], { message: "Seleccione el género." }),
    blood_type: z.string(),
    birth_date: z.string().refine((value) => value === "" || value <= today(), {
      message: "La fecha de nacimiento no puede ser futura.",
    }),
    email: z
      .string()
      .trim()
      .refine((value) => value === "" || z.email().safeParse(value).success, {
        message: "Escriba un correo válido.",
      }),
    phone: phoneSchema({ keep: current?.phone }),
    address: z.string().trim().max(255),
    start_date: z.string(),
    job_title_id: z.string().min(1, { message: "Seleccione el cargo." }),
    department_id: z
      .string()
      .min(1, { message: "Seleccione el departamento." }),
    location_id: z.string().min(1, { message: "Seleccione la ubicación." }),
    /** Vacío = sin usuario. */
    user_id: z.string(),
    profile_photo: z.instanceof(File).optional(),
    remove_photo: z.boolean(),
  });

/** Lo que se pide para crear un usuario junto con el empleado. */
export const newUserSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, { message: "Mínimo 3 caracteres." })
    .max(255, { message: "No puede superar los 255 caracteres." }),
  password: z.string().min(5, { message: "Mínimo 5 caracteres." }),
  email: z.email({ message: "Escriba un correo válido." }),
  company_id: z.string().min(1, { message: "Seleccione la empresa." }),
  location_ids: z
    .array(z.number())
    .min(1, { message: "Seleccione al menos una ubicación." }),
  role_ids: z
    .array(z.string())
    .min(1, { message: "Seleccione al menos un rol." }),
  module_ids: z.array(z.number()),
});

export type NewUserValues = z.infer<typeof newUserSchema>;

/** Cédula y correo repetidos entre los empleados ya conocidos. */
const checkDuplicates = (
  { employees, current }: EmployeeSchemaOptions,
  values: { dni: string; email: string },
  ctx: z.RefinementCtx,
) => {
  const others = (employees ?? []).filter(
    (employee) => employee.id !== current?.id,
  );

  if (!current && others.some((other) => same(other.dni, values.dni))) {
    ctx.addIssue({
      code: "custom",
      path: ["dni"],
      message: "Ya existe un empleado con esa cédula.",
    });
  }

  if (
    values.email !== "" &&
    others.some((other) => same(other.email, values.email))
  ) {
    ctx.addIssue({
      code: "custom",
      path: ["email"],
      message: "Ya hay un empleado con ese correo.",
    });
  }
};

/**
 * Esquema de la edición. Obligatorios los que la base exige (nombre, apellido,
 * cédula, género, cargo, departamento y ubicación); el resto se puede dejar
 * vacío. La cédula y el correo no se pueden repetir: el servidor lo vuelve a
 * comprobar, esto solo lo adelanta.
 */
export const buildEmployeeSchema = (options: EmployeeSchemaOptions = {}) =>
  employeeObject(options).superRefine((values, ctx) =>
    checkDuplicates(options, values, ctx),
  );

/**
 * Alta: lo mismo más el acceso al sistema. Con "crear usuario" se exigen
 * también los datos de la cuenta; con "vincular", el usuario elegido.
 */
export const buildCreateEmployeeSchema = (
  options: EmployeeSchemaOptions = {},
) =>
  employeeObject(options)
    .extend({
      access: z.enum(["none", "existing", "new"]),
      new_user: z.object({
        username: z.string(),
        password: z.string(),
        email: z.string(),
        company_id: z.string(),
        location_ids: z.array(z.number()),
        role_ids: z.array(z.string()),
        module_ids: z.array(z.number()),
      }),
    })
    .superRefine((values, ctx) => {
      checkDuplicates(options, values, ctx);

      if (values.access === "existing" && values.user_id === "") {
        ctx.addIssue({
          code: "custom",
          path: ["user_id"],
          message: "Elija el usuario que se va a vincular.",
        });
      }

      if (values.access === "new") {
        const result = newUserSchema.safeParse(values.new_user);

        if (!result.success) {
          for (const issue of result.error.issues) {
            ctx.addIssue({
              code: "custom",
              path: ["new_user", ...issue.path],
              message: issue.message,
            });
          }
        }
      }
    });

export type EmployeeFormValues = z.infer<
  ReturnType<typeof buildEmployeeSchema>
>;
export type CreateEmployeeFormValues = z.infer<
  ReturnType<typeof buildCreateEmployeeSchema>
>;

export const EMPLOYEE_FIELD_LABELS: Record<string, string> = {
  first_name: "Nombre",
  middle_name: "Segundo nombre",
  last_name: "Apellido",
  second_last_name: "Segundo apellido",
  dni_type: "Tipo de documento",
  dni: "Cédula",
  gender: "Género",
  blood_type: "Tipo de sangre",
  birth_date: "Fecha de nacimiento",
  email: "Correo",
  phone: "Teléfono",
  address: "Dirección",
  start_date: "Fecha de ingreso",
  job_title_id: "Cargo",
  department_id: "Departamento",
  location_id: "Ubicación",
  user_id: "Usuario",
  profile_photo: "Foto",
  "new_user.username": "Nombre de usuario",
  "new_user.password": "Contraseña",
  "new_user.email": "Correo del usuario",
  "new_user.company_id": "Empresa",
  "new_user.location_ids": "Ubicaciones del usuario",
  "new_user.role_ids": "Roles",
};

/** Valores iniciales de la edición, tal como están guardados. */
export const employeeToValues = (employee: Employee): EmployeeFormValues => ({
  first_name: employee.first_name ?? "",
  middle_name: employee.middle_name ?? "",
  last_name: employee.last_name ?? "",
  second_last_name: employee.second_last_name ?? "",
  dni_type: (DNI_TYPES as readonly string[]).includes(employee.dni_type)
    ? (employee.dni_type as (typeof DNI_TYPES)[number])
    : "V",
  dni: employee.dni ?? "",
  gender: employee.gender,
  blood_type: employee.blood_type ?? "",
  birth_date: employee.birth_date ?? "",
  email: employee.email ?? "",
  phone: toPhoneValue(employee.phone),
  address: employee.address ?? "",
  start_date: employee.start_date ?? "",
  job_title_id: employee.job_title_id ? String(employee.job_title_id) : "",
  department_id: employee.department_id ? String(employee.department_id) : "",
  location_id: employee.location_id ? String(employee.location_id) : "",
  user_id: employee.user_id ? String(employee.user_id) : "",
  profile_photo: undefined,
  remove_photo: false,
});

const FIELDS_TO_COMPARE = [
  "first_name",
  "middle_name",
  "last_name",
  "second_last_name",
  "dni_type",
  "gender",
  "blood_type",
  "birth_date",
  "email",
  "phone",
  "address",
  "start_date",
  "job_title_id",
  "department_id",
  "location_id",
  "user_id",
] as const;

/**
 * Solo lo que el usuario cambió, como FormData. Un campo opcional que quedó
 * vacío viaja vacío: el servidor lo guarda como "sin dato", que es como se borra
 * un valor. Devuelve `null` si no hay nada que enviar.
 */
export const diffEmployee = (
  employee: Employee,
  values: EmployeeFormValues,
): FormData | null => {
  const original = employeeToValues(employee);
  const formData = new FormData();
  let changed = false;

  for (const key of FIELDS_TO_COMPARE) {
    const next = String(values[key] ?? "").trim();

    if (next === String(original[key] ?? "").trim()) continue;

    formData.append(key, next);
    changed = true;
  }

  if (values.profile_photo) {
    formData.append("profile_photo", values.profile_photo);
    changed = true;
  } else if (values.remove_photo) {
    formData.append("remove_photo", "1");
    changed = true;
  }

  return changed ? formData : null;
};
