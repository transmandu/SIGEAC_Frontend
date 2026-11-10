"use client";

import type { ReactNode } from "react";
import { Contact, IdCard, KeyRound, type LucideIcon } from "lucide-react";

import { formatCalendarDate } from "@/lib/date";
import { locationLabel } from "@/lib/locations";
import { formatPhone } from "@/lib/phone";
import type { Employee } from "@/types";

const GENDER_LABEL: Record<string, string> = {
  MALE: "Hombre",
  FEMALE: "Mujer",
};

const Row = ({ label, value }: { label: string; value?: ReactNode }) => (
  <div className="flex items-baseline justify-between gap-4 py-1.5 max-sm:flex-col max-sm:gap-0">
    <dt className="shrink-0 text-[13px] text-muted-foreground">{label}</dt>
    <dd className="min-w-0 text-right text-sm font-medium wrap-anywhere text-foreground max-sm:text-left max-sm:text-base">
      {value || "—"}
    </dd>
  </div>
);

const Group = ({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
}) => (
  <section className="rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 dark:border-slate-700/60 dark:bg-slate-900/40">
    <h4 className="mb-1 flex items-center gap-2 text-[13px] font-semibold text-foreground/80">
      <Icon className="size-4 text-muted-foreground" />
      {title}
    </h4>
    <dl className="divide-y divide-border/60">{children}</dl>
  </section>
);

/** Lo que la fila no muestra: datos personales, contacto y acceso al sistema. */
export function EmployeeExpandedRow({ employee }: { employee: Employee }) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      <Group icon={IdCard} title="Datos personales">
        <Row label="Género" value={GENDER_LABEL[employee.gender]} />
        <Row label="Tipo de sangre" value={employee.blood_type} />
        <Row
          label="Nacimiento"
          value={formatCalendarDate(employee.birth_date, "date", "")}
        />
      </Group>

      <Group icon={Contact} title="Contacto">
        <Row label="Correo" value={employee.email} />
        <Row label="Teléfono" value={formatPhone(employee.phone)} />
        <Row label="Dirección" value={employee.address} />
      </Group>

      <Group icon={KeyRound} title="Trabajo y acceso">
        <Row
          label="Ubicación"
          value={employee.location ? locationLabel(employee.location) : null}
        />
        <Row
          label={employee.isActive ? "Ingreso" : "Egreso"}
          value={formatCalendarDate(
            employee.isActive ? employee.start_date : employee.end_date,
            "date",
            "",
          )}
        />
        <Row label="Usuario" value={employee.user?.username} />
      </Group>
    </div>
  );
}
