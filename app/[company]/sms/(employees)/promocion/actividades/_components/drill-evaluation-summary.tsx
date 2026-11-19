"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ClipboardCheck,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteDialog } from "@/components/dialogs/shared/ConfirmDeleteDialog";
import { useDeleteDrillEvaluation } from "@/actions/sms/drill_evaluations/actions";
import { useGetDrillEvaluation } from "@/hooks/sms/drill_evaluations/useGetDrillEvaluation";
import { hasDrillActivityCategory } from "@/lib/sms/activity-categories";
import { formatCalendarDate } from "@/lib/date";
import { useCompanyStore } from "@/stores/CompanyStore";
import type {
  DrillAuthorizedEmployeeRef,
  DrillEmployeeRef,
  DrillEvaluation,
  DrillParticipantKind,
} from "@/types/sms/drill-evaluation";

interface DrillEvaluationSummaryProps {
  activityNumber: string;
  categories?: { name: string }[];
  drillType?: "PARCIAL" | "MESA" | null;
}

const PARTICIPANT_SECTIONS: {
  kind: DrillParticipantKind;
  title: string;
  showJobTitle?: boolean;
}[] = [
  { kind: "PARTICIPANT", title: "Participantes" },
  {
    kind: "EXTINGUISHER_EXPERIENCED",
    title: "Personal con experiencia en extintores",
  },
  {
    kind: "AERONAUTICAL_FIREFIGHTER",
    title: "Bomberos aeronáuticos",
    showJobTitle: true,
  },
  { kind: "MANDATORY", title: "Participantes obligatorios" },
];

const employeeName = (employee?: DrillEmployeeRef | null) =>
  employee ? `${employee.first_name} ${employee.last_name}`.trim() : null;

const authorizedName = (employee?: DrillAuthorizedEmployeeRef | null) =>
  employee?.full_name ?? null;

const personName = (
  employee?: DrillEmployeeRef | null,
  authorized?: DrillAuthorizedEmployeeRef | null,
  name?: string | null,
) => employeeName(employee) ?? authorizedName(authorized) ?? name ?? "—";

const TypeBadge = ({ type }: { type: DrillEvaluation["type"] }) => (
  <Badge
    className={
      type === "PARCIAL"
        ? "border border-amber-200 bg-amber-100 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400"
        : "border border-sky-200 bg-sky-100 text-sky-700 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-400"
    }
  >
    {type === "PARCIAL" ? "Simulacro parcial" : "Simulacro de mesa"}
  </Badge>
);

export function DrillEvaluationSummary({
  activityNumber,
  categories,
  drillType,
}: DrillEvaluationSummaryProps) {
  const { selectedCompany } = useCompanyStore();
  const company = selectedCompany?.slug;
  const [openDelete, setOpenDelete] = useState(false);

  // Mismo criterio que la página: `isLoading` es false en una query
  // deshabilitada y el resumen mostraba "sin evaluación" antes de tiempo.
  const { data: evaluation, isPending: isLoading } = useGetDrillEvaluation({
    company,
    activityNumber,
  });
  const { deleteDrillEvaluation } = useDeleteDrillEvaluation();

  const hasDrillCategory = hasDrillActivityCategory(categories);
  const evaluationHref = `/${company}/sms/promocion/actividades/${activityNumber}/evaluacion`;

  if (!hasDrillCategory && (!evaluation || !evaluation.id) && !isLoading) {
    return null;
  }

  return (
    <>
      <div className="rounded-lg border border-border/60 p-4 sm:p-5">
        <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-sm font-semibold uppercase tracking-wide">
              Evaluación de simulacro
            </h2>
          </div>

          {evaluation && evaluation.id ? (
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href={evaluationHref}>
                  <Pencil className="mr-2 h-3.5 w-3.5" />
                  Editar
                </Link>
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => setOpenDelete(true)}
                disabled={!evaluation?.id}
              >
                <Trash2 className="mr-2 h-3.5 w-3.5" />
                Eliminar
              </Button>
            </div>
          ) : (
            <Button asChild size="sm">
              <Link href={evaluationHref}>
                <Plus className="mr-2 h-3.5 w-3.5" />
                Registrar evaluación
              </Link>
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : !evaluation || !evaluation.id ? (
          <div className="rounded-lg border border-dashed border-border/60 px-4 py-8 text-center">
            <p className="text-sm text-muted-foreground">
              Esta actividad todavía no tiene una evaluación de simulacro.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {drillType
                ? `La actividad requiere un simulacro ${
                    drillType === "PARCIAL" ? "parcial" : "de mesa"
                  }.`
                : "El tipo de simulacro se define al registrar la evaluación."}
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <TypeBadge type={evaluation.type} />
              <span className="font-mono text-xs tracking-wide text-muted-foreground">
                {evaluation.number}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <InfoField
                label="Fecha"
                value={formatCalendarDate(evaluation.date, "PPP")}
              />
              <InfoField
                label="Horario"
                value={`${toTime(evaluation.start_time)} - ${toTime(
                  evaluation.end_time,
                )}`}
              />
              <InfoField label="Lugar" value={evaluation.place} />
              <InfoField
                label="Coordinador"
                value={personName(
                  evaluation.coordinator_employee,
                  evaluation.coordinator_authorized_employee,
                  evaluation.coordinator_name,
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <InfoField
                label="Emergencia planteada"
                value={evaluation.emergency}
              />
              {evaluation.type === "MESA" ? (
                <InfoField label="Objetivo" value={evaluation.objective} />
              ) : (
                <InfoField
                  label="Hipótesis planteada"
                  value={evaluation.hypothesis}
                />
              )}
            </div>

            <section>
              <SectionTitle>Evaluadores</SectionTitle>
              <div className="flex flex-wrap gap-2 border-t border-border/60 pt-3">
                {(evaluation.evaluators ?? []).length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sin datos.</p>
                ) : (
                  evaluation.evaluators.map((evaluator) => (
                    <span
                      key={evaluator.id}
                      className="rounded border border-border/40 bg-muted/20 px-2 py-1 text-xs"
                    >
                      {personName(
                        evaluator.employee,
                        evaluator.authorized_employee,
                        evaluator.name,
                      )}
                      {evaluator.is_lead ? " · Principal" : ""}
                    </span>
                  ))
                )}
              </div>
            </section>

            {evaluation.type === "PARCIAL" && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <InfoField
                  label="Empleados participantes"
                  value={evaluation.employee_participants_count}
                />
                <InfoField
                  label="Personas foráneas"
                  value={evaluation.foreign_people_count}
                />
                <InfoField
                  label="Personas evacuadas"
                  value={evaluation.evacuated_count}
                />
              </div>
            )}

            {PARTICIPANT_SECTIONS.filter(
              (section) =>
                (evaluation.type === "MESA") === (section.kind === "MANDATORY"),
            ).map((section) => {
              const rows = (evaluation.participants ?? []).filter(
                (participant) => participant.kind === section.kind,
              );

              if (rows.length === 0) return null;

              return (
                <section key={section.kind}>
                  <SectionTitle>{section.title}</SectionTitle>
                  <div className="divide-y divide-border/30 border-t border-border/60">
                    {rows.map((participant) => (
                      <div
                        key={participant.id}
                        className="flex flex-wrap items-center justify-between gap-2 px-1 py-2 text-sm"
                      >
                        <span>{participant.name}</span>
                        {section.showJobTitle && participant.job_title ? (
                          <span className="text-xs text-muted-foreground">
                            {participant.job_title}
                          </span>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}

            {evaluation.type === "PARCIAL" ? (
              <>
                <section>
                  <SectionTitle>Eventos y evaluación</SectionTitle>
                  <div className="overflow-x-auto rounded border border-border/40">
                    <table className="min-w-full divide-y divide-border/40 text-sm">
                      <thead className="bg-muted/30">
                        <tr>
                          <Th>Evento</Th>
                          <Th>Hora</Th>
                          <Th>Pregunta</Th>
                          <Th>Respuesta</Th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30">
                        {(evaluation.events ?? []).map((event) => (
                          <tr key={event.id}>
                            <Td>
                              <p className="font-medium">{event.name}</p>
                              {event.observations ? (
                                <p className="text-xs text-muted-foreground">
                                  {event.observations}
                                </p>
                              ) : null}
                            </Td>
                            <Td>{event.registered_time || "—"}</Td>
                            <Td>{event.question}</Td>
                            <Td>
                              <AnswerBadge value={event.answer} />
                            </Td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                {(evaluation.findings ?? []).length > 0 && (
                  <section>
                    <SectionTitle>Fallas detectadas</SectionTitle>
                    <ul className="list-disc space-y-1 border-t border-border/60 pt-3 pl-5 text-sm">
                      {(evaluation.findings ?? []).map((finding) => (
                        <li key={finding.id}>{finding.description}</li>
                      ))}
                    </ul>
                  </section>
                )}
              </>
            ) : (
              <>
                <section>
                  <SectionTitle>Matriz de evaluación</SectionTitle>
                  <div className="overflow-x-auto rounded border border-border/40">
                    <table className="min-w-full divide-y divide-border/40 text-sm">
                      <thead className="bg-muted/30">
                        <tr>
                          <Th>Criterio evaluado</Th>
                          <Th>Indicador de desempeño</Th>
                          <Th>Cumplimiento</Th>
                          <Th>Observaciones</Th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30">
                        {(evaluation.matrix_rows ?? []).map((row) => (
                          <tr key={row.id}>
                            <Td>{row.criterion}</Td>
                            <Td>{row.performance_indicator}</Td>
                            <Td>
                              <AnswerBadge value={row.compliance} />
                            </Td>
                            <Td>{row.observations || "—"}</Td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <InfoField
                  label="Observaciones finales"
                  value={evaluation.observations}
                />
              </>
            )}

            {(evaluation.improvement_actions ?? []).length > 0 && (
              <section>
                <SectionTitle>Acciones de mejora</SectionTitle>
                <div className="overflow-x-auto rounded border border-border/40">
                  <table className="min-w-full divide-y divide-border/40 text-sm">
                    <thead className="bg-muted/30">
                      <tr>
                        <Th>Acción</Th>
                        <Th>Responsable</Th>
                        {evaluation.type === "PARCIAL" ? (
                          <Th>Fecha límite</Th>
                        ) : null}
                        <Th>Responsable de la empresa</Th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {(evaluation.improvement_actions ?? []).map((action) => (
                        <tr key={action.id}>
                          <Td>{action.action}</Td>
                          <Td>
                            {personName(
                              action.responsible_employee,
                              action.responsible_authorized_employee,
                              action.responsible_name,
                            )}
                          </Td>
                          {evaluation.type === "PARCIAL" ? (
                            <Td>
                              {action.deadline
                                ? formatCalendarDate(action.deadline, "PPP")
                                : "—"}
                            </Td>
                          ) : null}
                          <Td>
                            {personName(
                              action.company_responsible_employee,
                              action.company_responsible_authorized_employee,
                              action.company_responsible_name,
                            )}
                          </Td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      <ConfirmDeleteDialog
        open={openDelete}
        onOpenChange={setOpenDelete}
        title="Eliminar evaluación de simulacro"
        entityName={evaluation?.number}
        warning="Se eliminarán también sus participantes, eventos, matriz y acciones de mejora."
        isPending={deleteDrillEvaluation.isPending}
        onConfirm={async () => {
          if (!company || !evaluation?.id) return;

          await deleteDrillEvaluation.mutateAsync({
            company,
            activityNumber,
            id: evaluation.id,
          });
        }}
      />
    </>
  );
}

const toTime = (value?: string | null) =>
  value ? String(value).slice(0, 5) : "—";

function InfoField({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="rounded border border-border/40 px-3 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 whitespace-pre-line text-sm">
        {value === null || value === undefined || value === "" ? "—" : value}
      </p>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
      {children}
    </h3>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="whitespace-nowrap px-3 py-2 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
      {children}
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return (
    <td className="px-3 py-2 align-top text-sm text-muted-foreground">
      {children}
    </td>
  );
}

function AnswerBadge({ value }: { value: string }) {
  const className =
    value === "SI"
      ? "border border-green-200 bg-green-100 text-green-700 dark:border-green-800 dark:bg-green-950/40 dark:text-green-400"
      : value === "NO"
        ? "border border-red-200 bg-red-100 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400"
        : "border border-amber-200 bg-amber-100 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400";

  return <Badge className={className}>{value === "NA" ? "N/A" : value}</Badge>;
}
