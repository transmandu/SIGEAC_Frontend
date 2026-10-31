import { Fragment } from "react";
import { CheckCircle2, FileCheck2, Plane, Radio } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { ControlItemFlagBadges } from "@/components/planificacion/controles/ControlItemFlagBadges";
import { useGetAvionicsControls } from "@/hooks/mantenimiento/planificacion/useGetAvionicsControls";
import { useGetComponentControls } from "@/hooks/mantenimiento/planificacion/useGetComponentControls";
import { useGetDirectiveControls } from "@/hooks/mantenimiento/planificacion/useGetDirectiveControls";
import { useGetMaintenanceControls } from "@/hooks/mantenimiento/planificacion/useGetMaintenanceControls";
import { AVIONICS_ACTION_LABELS } from "@/lib/avionicsControlLabels";
import {
  COMPONENT_ACTION_LABELS,
  COMPONENT_LIMIT_KIND_LABELS,
} from "@/lib/componentControlLabels";
import {
  DIRECTIVE_AUTHORITY_LABELS,
  DIRECTIVE_COMPLIANCE_TYPE_LABELS,
} from "@/lib/directiveControlLabels";
import {
  computeMaintenanceItem,
  fmtNumber,
  STATUS_META,
  UNIT_SHORT,
} from "@/lib/maintenanceControlCalc";
import { formatDate } from "@/lib/utils";
import {
  AvionicsControlSnapshot,
  AvionicsControlSnapshotItem,
  ComponentControlSnapshot,
  ComponentControlSnapshotItem,
  DirectiveControlSnapshot,
  DirectiveControlSnapshotItem,
  MaintenanceControlSnapshot,
  MaintenanceControlSnapshotItem,
} from "@/types";

import type { ControlSnapshotConfig } from "./ControlSnapshotDialog";
import {
  EstimateCell,
  FrequencyCell,
  NextCell,
  RemainingCell,
} from "./snapshotCells";
import { buildPartGroups, type SnapshotGroup } from "./snapshotGroups";

/**
 * Cómo se arma el diálogo "Consultar Estado" de cada control: mismas
 * secciones y columnas que su pantalla en vivo, sin las de orden de trabajo y
 * acciones (el snapshot es de solo lectura). El cálculo ya viene resuelto del
 * backend; acá solo se agrupa y se formatea.
 */

const mutedCell = "text-sm text-muted-foreground";

// ─── Mantenimiento ──────────────────────────────────────────────────────────

function MaintenanceRows({
  items,
}: {
  items: MaintenanceControlSnapshotItem[];
}) {
  return (
    <>
      {items.map((item) => {
        const computed = computeMaintenanceItem(item);
        const meta = STATUS_META[computed.status];
        return (
          <TableRow key={item.id} className={meta.row}>
            <TableCell className="font-medium">{item.description}</TableCell>
            <FrequencyCell computed={computed} />
            <TableCell>{computed.applied}</TableCell>
            <NextCell computed={computed} />
            <RemainingCell computed={computed} />
            <EstimateCell computed={computed} />
            <TableCell>{computed.providerName}</TableCell>
          </TableRow>
        );
      })}
    </>
  );
}

export const maintenanceSnapshotConfig: ControlSnapshotConfig<MaintenanceControlSnapshot> =
  {
    resource: "maintenance-controls",
    controlLabel: "Control de Mantenimiento",
    description:
      "Reconstruye cómo estaba un control de mantenimiento en una fecha pasada, a partir de su historial de cumplimientos y vuelos.",
    selectPrompt: "Elija un control de mantenimiento para ver su estado.",
    emptyLabel: "Este control no tiene certificados ni servicios registrados.",
    fileBase: "estado_control_mantenimiento",
    useControls: (company) => useGetMaintenanceControls(company),
    columns: [
      "Nombre",
      "Frecuencia",
      "Aplicada",
      "Próximo",
      "Remanente",
      "Estimación",
      "Realizado Por",
    ],
    buildGroups: (snapshot) => {
      const { items, parts } = snapshot;
      const certificates = items.filter((i) => i.item_type === "CERTIFICATE");
      // Un servicio es "de aeronave" cuando no cuelga de ninguna parte: se mira
      // aircraft_part_id, no part_label — una parte sin part_name ni
      // part_number deja part_label vacío y sus servicios caían acá.
      const aircraftServices = items.filter(
        (i) => i.item_type === "SERVICE" && !i.aircraft_part_id,
      );

      const groups: SnapshotGroup[] = [];
      if (certificates.length) {
        groups.push({
          key: "certificates",
          title: "Certificados",
          icon: FileCheck2,
          count: certificates.length,
          rows: <MaintenanceRows items={certificates} />,
        });
      }
      if (aircraftServices.length) {
        groups.push({
          key: "aircraft-services",
          title: "Servicios de Aeronave",
          icon: Plane,
          count: aircraftServices.length,
          rows: <MaintenanceRows items={aircraftServices} />,
        });
      }
      groups.push(
        ...buildPartGroups(
          items,
          parts,
          (partItems) => <MaintenanceRows items={partItems} />,
          (partItems) => partItems[0]?.part_label || "Parte",
        ),
      );
      return groups;
    },
  };

// ─── Directivas ─────────────────────────────────────────────────────────────

function DirectiveRows({ items }: { items: DirectiveControlSnapshotItem[] }) {
  return (
    <>
      {items.map((item) => {
        const computed = item.computed ? computeMaintenanceItem(item) : null;
        const meta = computed ? STATUS_META[computed.status] : null;

        return (
          <TableRow key={item.id} className={meta?.row}>
            <TableCell className="align-top font-medium">
              <span className="flex items-center gap-1.5">
                <span>
                  AD {item.ad_number}
                  {item.revision ? ` ${item.revision}` : ""}
                </span>
                <Badge variant="outline" className="shrink-0 text-[10px]">
                  {DIRECTIVE_AUTHORITY_LABELS[item.authority]}
                </Badge>
              </span>
              <span className="block text-xs font-normal text-muted-foreground">
                {item.description}
              </span>
              {item.reference_document && (
                <span className="block text-xs font-normal text-muted-foreground">
                  {item.reference_document}
                </span>
              )}
              {item.compliance_method && (
                <span className="block text-xs font-normal text-muted-foreground">
                  Método: {item.compliance_method}
                </span>
              )}
            </TableCell>
            <TableCell className="align-top">
              {DIRECTIVE_COMPLIANCE_TYPE_LABELS[item.compliance_type]}
            </TableCell>

            {computed ? (
              <>
                <FrequencyCell computed={computed} />
                <TableCell>
                  {computed.applied}
                  {item.compliance_type === "ONE_TIME" && (
                    <span className="block text-xs italic text-muted-foreground">
                      Fecha de referencia
                    </span>
                  )}
                </TableCell>
                <NextCell computed={computed} />
                <RemainingCell computed={computed} />
                <TableCell>{computed.providerName}</TableCell>
              </>
            ) : item.complied_at ? (
              <>
                <TableCell className={mutedCell}>—</TableCell>
                <TableCell>{formatDate(item.complied_at)}</TableCell>
                <TableCell colSpan={2} className="text-sm">
                  <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="size-3.5 shrink-0" />
                    Cumplida
                  </span>
                  {item.complied_method && (
                    <span className="block text-xs text-muted-foreground">
                      {item.complied_method}
                    </span>
                  )}
                </TableCell>
                <TableCell>{item.complied_provider ?? "—"}</TableCell>
              </>
            ) : (
              <TableCell colSpan={5} className={mutedCell}>
                {item.has_current_compliance
                  ? "Sin plazo definido a esa fecha."
                  : "Sin cumplimiento vigente a esa fecha."}
              </TableCell>
            )}
          </TableRow>
        );
      })}
    </>
  );
}

export const directiveSnapshotConfig: ControlSnapshotConfig<DirectiveControlSnapshot> =
  {
    resource: "directive-controls",
    controlLabel: "Control de Directivas",
    description:
      "Reconstruye cómo estaba un control de directivas de aeronavegabilidad en una fecha pasada, a partir de su historial de cumplimientos y vuelos.",
    selectPrompt: "Elija un control de directivas para ver su estado.",
    emptyLabel: "Este control no tiene directivas registradas.",
    fileBase: "estado_control_directivas",
    useControls: (company) => useGetDirectiveControls(company),
    columns: [
      "Directiva",
      "Tipo",
      "Plazo",
      "Último Cump.",
      "Próximo",
      "Remanente",
      "Realizado Por",
    ],
    buildGroups: ({ items, parts }) => {
      const fuselage = items.filter((i) => !i.aircraft_part_id);
      const groups: SnapshotGroup[] = [];
      if (fuselage.length) {
        groups.push({
          key: "aircraft",
          title: "Aeronave",
          icon: Plane,
          count: fuselage.length,
          rows: <DirectiveRows items={fuselage} />,
        });
      }
      groups.push(
        ...buildPartGroups(items, parts, (partItems) => (
          <DirectiveRows items={partItems} />
        )),
      );
      return groups;
    },
  };

// ─── Componentes ────────────────────────────────────────────────────────────

function ComponentRows({ items }: { items: ComponentControlSnapshotItem[] }) {
  return (
    <>
      {items.map((item) => {
        const computed = computeMaintenanceItem(item);
        const meta = STATUS_META[computed.status];
        const intervals = item.computed?.intervals ?? [];

        return (
          <TableRow key={item.id} className={meta.row}>
            <TableCell className="font-medium">
              {item.description}
              <span className="block text-xs font-normal text-muted-foreground">
                P/N {item.part_number} · S/N {item.serial}
                {item.position ? ` · ${item.position}` : ""}
              </span>
              <span className="mt-1 flex flex-wrap items-center gap-1">
                <Badge variant="outline" className="text-[10px]">
                  {COMPONENT_ACTION_LABELS[item.action]}
                </Badge>
                <ControlItemFlagBadges flags={item.flags} />
              </span>
            </TableCell>
            <TableCell>
              {computed.frequency}
              {computed.extras.map((extra, i) => (
                <span key={i} className="block text-xs text-muted-foreground">
                  Ó {extra.frequency}
                </span>
              ))}
              {item.limit_kinds.length > 0 && (
                <span className="block text-[10px] text-muted-foreground/70">
                  {item.limit_kinds
                    .map((kind) => COMPONENT_LIMIT_KIND_LABELS[kind])
                    .join(" · ")}
                </span>
              )}
            </TableCell>
            <TableCell>
              {computed.applied}
              {computed.appliedSub && (
                <span className="block text-xs text-muted-foreground">
                  Padre: {computed.appliedSub}
                </span>
              )}
            </TableCell>
            <TableCell>
              {intervals.length
                ? intervals.map((iv, i) => (
                    <span
                      key={i}
                      className={
                        i > 0 ? "block text-xs text-muted-foreground" : "block"
                      }
                    >
                      {iv.since_event_value !== null
                        ? `${fmtNumber(iv.since_event_value)} ${UNIT_SHORT[iv.counting_method]}`
                        : "—"}
                    </span>
                  ))
                : "—"}
            </TableCell>
            <NextCell computed={computed} />
            <RemainingCell computed={computed} />
            <EstimateCell computed={computed} />
            <TableCell>{computed.providerName}</TableCell>
          </TableRow>
        );
      })}
    </>
  );
}

export const componentSnapshotConfig: ControlSnapshotConfig<ComponentControlSnapshot> =
  {
    resource: "component-controls",
    controlLabel: "Control de Componentes",
    description:
      "Reconstruye cómo estaba un control de componentes en una fecha pasada, a partir de su historial de cumplimientos y vuelos.",
    selectPrompt: "Elija un control de componentes para ver su estado.",
    emptyLabel: "Este control no tiene componentes registrados.",
    fileBase: "estado_control_componentes",
    useControls: (company) => useGetComponentControls(company),
    columns: [
      "Componente",
      "Límite",
      "Último Cump.",
      "Desde OH",
      "Próximo",
      "Remanente",
      "Estimación",
      "Realizado Por",
    ],
    buildGroups: ({ items, parts }) => {
      const fuselage = items.filter((i) => !i.aircraft_part_id);
      const groups: SnapshotGroup[] = [];
      if (fuselage.length) {
        groups.push({
          key: "fuselage",
          title: "Fuselaje",
          icon: Plane,
          count: fuselage.length,
          rows: <ComponentRows items={fuselage} />,
        });
      }
      groups.push(
        ...buildPartGroups(items, parts, (partItems) => (
          <ComponentRows items={partItems} />
        )),
      );
      return groups;
    },
  };

// ─── Aviónica ───────────────────────────────────────────────────────────────

function AvionicsRows({ items }: { items: AvionicsControlSnapshotItem[] }) {
  return items.map((item) => (
    <Fragment key={item.id}>
      {item.tasks.map((task, t) => {
        const computed = task.computed ? computeMaintenanceItem(task) : null;
        const meta = computed ? STATUS_META[computed.status] : null;

        return (
          <TableRow key={task.id} className={meta?.row}>
            {t === 0 && (
              <TableCell
                rowSpan={item.tasks.length}
                className="align-top font-medium"
              >
                {`${item.description}${item.position ? ` ${item.position}` : ""}`}
                <span className="block text-xs font-normal text-muted-foreground">
                  P/N {item.part_number} · S/N {item.serial}
                </span>
                {item.reference_document && (
                  <span className="block text-xs font-normal text-muted-foreground">
                    {item.reference_document}
                  </span>
                )}
                {item.flags.length > 0 && (
                  <span className="mt-1 flex flex-wrap items-center gap-1">
                    <ControlItemFlagBadges flags={item.flags} />
                  </span>
                )}
              </TableCell>
            )}
            <TableCell>
              {AVIONICS_ACTION_LABELS[task.action]}
              {task.is_on_condition && (
                <span className="block text-xs italic text-muted-foreground">
                  Por condición
                </span>
              )}
            </TableCell>
            {computed ? (
              <>
                <FrequencyCell computed={computed} />
                <TableCell>{computed.applied}</TableCell>
                <NextCell computed={computed} />
                <RemainingCell computed={computed} />
                <TableCell>{computed.providerName}</TableCell>
              </>
            ) : (
              <TableCell colSpan={5} className={mutedCell}>
                {task.is_on_condition
                  ? "Sin plazo — se verifica en tierra en cada inspección y se certifica en el 43-005."
                  : "Sin cumplimiento vigente a esa fecha."}
              </TableCell>
            )}
          </TableRow>
        );
      })}
    </Fragment>
  ));
}

export const avionicsSnapshotConfig: ControlSnapshotConfig<AvionicsControlSnapshot> =
  {
    resource: "avionics-controls",
    controlLabel: "Control de Aviónica",
    description:
      "Reconstruye cómo estaba un control de aviónica en una fecha pasada, a partir de su historial de cumplimientos y vuelos.",
    selectPrompt: "Elija un control de aviónica para ver su estado.",
    emptyLabel: "Este control no tiene equipos registrados.",
    fileBase: "estado_control_avionica",
    useControls: (company) => useGetAvionicsControls(company),
    columns: [
      "Equipo",
      "Tarea",
      "Límite",
      "Último Cump.",
      "Próximo",
      "Remanente",
      "Realizado Por",
    ],
    buildGroups: ({ items }) =>
      items.length
        ? [
            {
              key: "equipment",
              title: "Equipos de Aviónica",
              icon: Radio,
              count: items.length,
              rows: <AvionicsRows items={items} />,
            },
          ]
        : [],
  };
