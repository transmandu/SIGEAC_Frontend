import { z } from "zod";

import { companyNow, formatCalendarDate, toCalendarPayload } from "@/lib/date";
import {
  END_TYPES_REQUIRING_REASON,
  REASON_MAX,
  SELECTABLE_CHANGE_TYPES,
  SELECTABLE_END_TYPES,
} from "@/lib/employee-lifecycle";
import type { EmploymentEndType } from "@/types";

/** Hoy en la zona de la compañía, como yyyy-MM-dd. */
export const lifecycleToday = () => toCalendarPayload(companyNow()) ?? "";

const required = (message: string) => z.string().min(1, { message });

const reasonField = z
  .string()
  .trim()
  .max(REASON_MAX, {
    message: `No puede superar los ${REASON_MAX} caracteres.`,
  });

/** Una fecha vacía significa "hoy": el backend la completa con el día de la empresa. */
const dayRules = (
  label: string,
  notBefore: string | null | undefined,
  value: string,
  ctx: z.RefinementCtx,
  path: string,
  beforeLabel: string,
) => {
  if (value === "") return;

  if (value > lifecycleToday()) {
    ctx.addIssue({
      code: "custom",
      path: [path],
      message: `${label} no puede ser futura.`,
    });
    return;
  }

  if (notBefore && value < notBefore) {
    ctx.addIssue({
      code: "custom",
      path: [path],
      message: `${label} no puede ser anterior al ${formatCalendarDate(notBefore, "date", "")}${beforeLabel}.`,
    });
  }
};

export interface CurrentAssignmentIds {
  job_title_id: string;
  department_id: string;
  location_id: string;
}

/** Hay al menos un cambio respecto de la asignación vigente. */
export const assignmentChanged = (
  current: CurrentAssignmentIds,
  next: CurrentAssignmentIds,
) =>
  current.job_title_id !== next.job_title_id ||
  current.department_id !== next.department_id ||
  current.location_id !== next.location_id;

/**
 * Cambio de cargo, departamento o sede. `startedAt` es el inicio de la
 * asignación que se cierra: el cambio no puede ser anterior.
 */
export const buildChangeAssignmentSchema = (startedAt?: string | null) =>
  z
    .object({
      job_title_id: required("Seleccione el cargo."),
      department_id: required("Seleccione el departamento."),
      location_id: required("Seleccione la sede."),
      change_type: z.enum(SELECTABLE_CHANGE_TYPES, {
        message: "Seleccione el motivo del cambio.",
      }),
      reason: reasonField,
      effective_date: z.string(),
    })
    .superRefine((values, ctx) => {
      if (values.change_type === "OTHER" && values.reason === "") {
        ctx.addIssue({
          code: "custom",
          path: ["reason"],
          message: "Explique el motivo del cambio.",
        });
      }

      dayRules(
        "La fecha del cambio",
        startedAt,
        values.effective_date,
        ctx,
        "effective_date",
        ", cuando comenzó la asignación actual",
      );
    });

export type ChangeAssignmentValues = z.input<
  ReturnType<typeof buildChangeAssignmentSchema>
>;

/** Baja: el tipo de egreso es obligatorio; el motivo, según el tipo. */
export const buildTerminateSchema = (periodStartedAt?: string | null) =>
  z
    .object({
      end_type: z.enum(SELECTABLE_END_TYPES, {
        message: "Seleccione el tipo de egreso.",
      }),
      end_reason: reasonField,
      end_date: z.string(),
    })
    .superRefine((values, ctx) => {
      if (
        END_TYPES_REQUIRING_REASON.includes(
          values.end_type as EmploymentEndType,
        ) &&
        values.end_reason === ""
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["end_reason"],
          message: "Indique qué ocurrió.",
        });
      }

      dayRules(
        "La fecha de egreso",
        periodStartedAt,
        values.end_date,
        ctx,
        "end_date",
        ", cuando comenzó este periodo",
      );
    });

export type TerminateValues = z.input<ReturnType<typeof buildTerminateSchema>>;

/** Recontratación: asignación inicial del periodo nuevo. */
export const buildRehireSchema = (lastEndedAt?: string | null) =>
  z
    .object({
      job_title_id: required("Seleccione el cargo."),
      department_id: required("Seleccione el departamento."),
      location_id: required("Seleccione la sede."),
      start_date: z.string(),
    })
    .superRefine((values, ctx) =>
      dayRules(
        "La fecha de reingreso",
        lastEndedAt,
        values.start_date,
        ctx,
        "start_date",
        ", el último egreso",
      ),
    );

export type RehireValues = z.input<ReturnType<typeof buildRehireSchema>>;

/**
 * Corrección de un periodo ya registrado. Las fechas son obligatorias (aquí
 * no existe "hoy por defecto"); `closed` indica si el periodo ya terminó.
 */
export const buildCorrectPeriodSchema = (closed: boolean) =>
  z
    .object({
      started_at: required("Indique la fecha de ingreso."),
      ended_at: z.string(),
      end_type: z.string(),
      end_reason: reasonField,
    })
    .superRefine((values, ctx) => {
      dayRules(
        "La fecha de ingreso",
        null,
        values.started_at,
        ctx,
        "started_at",
        "",
      );

      if (!closed) return;

      if (values.ended_at === "") {
        ctx.addIssue({
          code: "custom",
          path: ["ended_at"],
          message: "Indique la fecha de egreso.",
        });
      } else {
        dayRules(
          "La fecha de egreso",
          values.started_at,
          values.ended_at,
          ctx,
          "ended_at",
          ", el ingreso",
        );
      }

      if (!SELECTABLE_END_TYPES.some((type) => type === values.end_type)) {
        ctx.addIssue({
          code: "custom",
          path: ["end_type"],
          message: "Seleccione el tipo de egreso.",
        });
      } else if (
        END_TYPES_REQUIRING_REASON.includes(
          values.end_type as EmploymentEndType,
        ) &&
        values.end_reason === ""
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["end_reason"],
          message: "Indique qué ocurrió.",
        });
      }
    });

export type CorrectPeriodValues = z.input<
  ReturnType<typeof buildCorrectPeriodSchema>
>;

/**
 * Corrección de una asignación del historial. La primera de cada periodo no
 * tiene fecha ni motivo propios (son los del ingreso): `first` los omite.
 */
export const buildCorrectAssignmentSchema = (first: boolean) =>
  z
    .object({
      job_title_id: required("Seleccione el cargo."),
      department_id: required("Seleccione el departamento."),
      location_id: required("Seleccione la sede."),
      started_at: z.string(),
      change_type: z.string(),
      reason: reasonField,
    })
    .superRefine((values, ctx) => {
      if (first) return;

      dayRules(
        "La fecha del cambio",
        null,
        values.started_at,
        ctx,
        "started_at",
        "",
      );

      if (
        !SELECTABLE_CHANGE_TYPES.some((type) => type === values.change_type)
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["change_type"],
          message: "Seleccione el motivo del cambio.",
        });
      } else if (values.change_type === "OTHER" && values.reason === "") {
        ctx.addIssue({
          code: "custom",
          path: ["reason"],
          message: "Explique el motivo del cambio.",
        });
      }
    });

export type CorrectAssignmentValues = z.input<
  ReturnType<typeof buildCorrectAssignmentSchema>
>;

export const LIFECYCLE_FIELD_LABELS: Record<string, string> = {
  job_title_id: "Cargo",
  department_id: "Departamento",
  location_id: "Sede",
  change_type: "Motivo del cambio",
  reason: "Detalle del motivo",
  effective_date: "Fecha del cambio",
  end_type: "Tipo de egreso",
  end_reason: "Detalle del egreso",
  end_date: "Fecha de egreso",
  start_date: "Fecha de reingreso",
  started_at: "Fecha de inicio",
  ended_at: "Fecha de egreso",
  assignment: "Asignación",
  employee: "Empleado",
};
