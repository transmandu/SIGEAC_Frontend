"use client";

import type { ComponentType, ReactNode } from "react";
import {
  AlertCircle,
  AreaChartIcon,
  Building2,
  CalendarDays,
  CheckCheck,
  Percent,
  Search,
  Users,
  X,
} from "lucide-react";

import { PieChartComponent } from "@/components/charts/PieChartComponent";
import { EmptyState } from "@/components/misc/EmptyState";
import { EmployeeAvatar } from "@/app/[company]/ajustes/empresa/empleados/_components/EmployeeAvatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AttendanceData } from "@/hooks/sms/useGetActivityAttendanceList";
import { cn } from "@/lib/utils";

type IconComponent = ComponentType<{ className?: string }>;

/** Un solo mapa de color para los estados de actividad (SMS y aeronáutica). */
export const ACTIVITY_STATUS_STYLES: Record<string, string> = {
  ABIERTO:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-400",
  CERRADO:
    "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-400",
  PROCESO:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-400",
  PENDIENTE:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-400",
  PENDING:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-400",
};

const ACTIVITY_STATUS_LABELS: Record<string, string> = {
  ABIERTO: "Abierto",
  CERRADO: "Cerrado",
  PROCESO: "En proceso",
  PENDIENTE: "Pendiente",
  PENDING: "Pendiente",
};

export function StatusBadge({ status }: { status?: string | null }) {
  if (!status) return null;

  const key = status.toUpperCase();

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 font-medium",
        ACTIVITY_STATUS_STYLES[key] ??
          "border-border/60 bg-muted text-foreground",
      )}
    >
      <span
        aria-hidden="true"
        className="size-1.5 shrink-0 rounded-full bg-current"
      />
      {ACTIVITY_STATUS_LABELS[key] ?? status.replace("_", " ")}
    </Badge>
  );
}

export const initialsOf = (firstName?: string, lastName?: string) =>
  `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "?";

export const initialsFromName = (name?: string | null) =>
  (name ?? "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase() || "?";

export function SectionLabel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-[11px] font-medium uppercase tracking-wide text-muted-foreground",
        className,
      )}
    >
      {children}
    </p>
  );
}

export function InfoItem({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: IconComponent;
  label: string;
  value: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5",
        className,
      )}
    >
      <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        <Icon className="size-3.5 shrink-0" />
        <span>{label}</span>
      </div>
      <div className="mt-1 text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  iconClassName,
  children,
}: {
  icon: IconComponent;
  label: string;
  value: ReactNode;
  hint?: string;
  iconClassName?: string;
  children?: ReactNode;
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="flex h-full flex-col gap-3 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {label}
            </p>
            <p className="mt-1.5 font-mono text-2xl font-bold leading-none tracking-tight tabular-nums text-foreground">
              {value}
            </p>
            {hint && (
              <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
            )}
          </div>
          <span
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-xl",
              iconClassName ?? "bg-primary/10 text-primary",
            )}
          >
            <Icon className="size-5" />
          </span>
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

/** Cabecera tipo expediente: referencia, estado, título y ficha resumida. */
export function ActivityDetailHeader({
  activityNumber,
  title,
  subtitle,
  status,
  badges,
  actions,
  meta,
  icon: Icon = CalendarDays,
}: {
  activityNumber?: string | null;
  title: string;
  subtitle?: ReactNode;
  status?: string | null;
  badges?: ReactNode;
  actions?: ReactNode;
  meta?: ReactNode;
  icon?: IconComponent;
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="space-y-5 p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15 sm:size-14">
              <Icon className="size-6 sm:size-7" />
            </div>
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                {activityNumber && (
                  <span className="rounded-md border border-border/60 bg-muted/40 px-1.5 py-0.5 font-mono text-[11px] tracking-wide text-muted-foreground">
                    {activityNumber}
                  </span>
                )}
                <StatusBadge status={status} />
                {badges}
              </div>
              <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm text-muted-foreground">{subtitle}</p>
              )}
            </div>
          </div>

          {actions && (
            <div className="flex w-full shrink-0 flex-col gap-2 sm:flex-row lg:w-auto">
              {actions}
            </div>
          )}
        </div>

        {meta && (
          <>
            <Separator />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {meta}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function ActivityDetailSkeleton() {
  return (
    <div className="space-y-6" aria-hidden="true">
      <Card>
        <CardContent className="space-y-5 p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-4">
              <Skeleton className="size-12 rounded-2xl sm:size-14" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-7 w-72 max-w-full" />
                <Skeleton className="h-4 w-48 max-w-full" />
              </div>
            </div>
            <Skeleton className="h-10 w-40" />
          </div>
          <Skeleton className="h-px w-full" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-16 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-28 rounded-xl" />
        ))}
      </div>

      <Skeleton className="h-11 w-full rounded-lg" />
      <Skeleton className="h-72 w-full rounded-xl" />
    </div>
  );
}

export function PersonRow({
  role,
  name,
  dni,
  initials,
}: {
  role: string;
  name: string;
  dni?: string | null;
  initials?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Avatar className="size-9 border border-border/60">
        <AvatarFallback className="bg-muted text-[11px] font-semibold text-muted-foreground">
          {initials ?? initialsFromName(name)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <SectionLabel>{role}</SectionLabel>
        <p className="mt-0.5 truncate text-sm font-medium text-foreground">
          {name || "N/A"}
        </p>
        {dni ? (
          <p className="font-mono text-[11px] tracking-wide text-muted-foreground">
            DNI {dni}
          </p>
        ) : null}
      </div>
    </div>
  );
}

/** Filtro por nombre o DNI compartido por las tablas de participantes. */
export const filterAttendance = (
  rows: AttendanceData[] | undefined,
  query: string,
) => {
  const list = rows ?? [];
  const term = query.trim().toLowerCase();

  if (!term) return list;

  return list.filter((row) => {
    const name = `${row.employee?.first_name ?? ""} ${
      row.employee?.last_name ?? ""
    }`.toLowerCase();
    const dni = (row.employee?.dni ?? row.employee_dni ?? "").toLowerCase();

    return name.includes(term) || dni.includes(term);
  });
};

/** Tabla de inscritos/asistencia con búsqueda y estados vacíos unificados. */
export function RosterSection({
  icon: Icon,
  title,
  description,
  total,
  rows,
  showAttendance = false,
  isLoading,
  isError,
  errorMessage,
  searchValue,
  onSearchChange,
  emptyTitle,
  emptyDescription,
}: {
  icon: IconComponent;
  title: string;
  description: string;
  total: number;
  rows: AttendanceData[];
  showAttendance?: boolean;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  emptyTitle: string;
  emptyDescription: string;
}) {
  const hasSearch = searchValue.trim().length > 0;

  return (
    <Card>
      <CardHeader className="gap-4 space-y-0 pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="size-4" />
            </span>
            <div className="space-y-0.5">
              <CardTitle className="text-base">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="font-mono tabular-nums"
              aria-label={`${total} registros`}
            >
              {total}
            </Badge>
            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchValue}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Buscar por nombre o DNI"
                aria-label="Buscar por nombre o DNI"
                disabled={total === 0}
                className="h-9 pl-8"
              />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : isError ? (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertTitle>No se pudo cargar la lista</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        ) : total === 0 ? (
          <EmptyState
            icon={Icon}
            title={emptyTitle}
            description={emptyDescription}
            className="py-10"
          />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={Search}
            title="Sin coincidencias"
            description={`No se encontraron registros para "${searchValue}".`}
            className="py-10"
          />
        ) : (
          <div className="overflow-hidden rounded-lg border border-border/60">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Participante</TableHead>
                  <TableHead className="hidden w-28 sm:table-cell">
                    Origen
                  </TableHead>
                  {showAttendance && (
                    <TableHead className="w-32">Asistencia</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row, index) => {
                  const firstName = row.employee?.first_name ?? "";
                  const lastName = row.employee?.last_name ?? "";
                  const fullName =
                    `${firstName} ${lastName}`.trim() || "Sin nombre";
                  const dni = row.employee?.dni || row.employee_dni || "";
                  const isExternal = row.employee_type === "authorized";

                  return (
                    <TableRow key={row.id}>
                      <TableCell className="px-4 text-xs tabular-nums text-muted-foreground">
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <EmployeeAvatar
                            employee={{
                              id: row.employee?.id,
                              first_name: firstName,
                              last_name: lastName,
                              dni,
                              photo_url: row.employee?.photo_url,
                              photo_url_lg: row.employee?.photo_url_lg,
                            }}
                            className="size-8 text-[10px]"
                          />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">
                              {fullName}
                            </p>
                            <p className="font-mono text-[11px] tracking-wide text-muted-foreground">
                              DNI {dni || "N/A"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {isExternal ? (
                          <Badge
                            variant="outline"
                            className="gap-1 text-[10px] text-muted-foreground"
                          >
                            <Building2 className="size-3" />
                            Externo
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            Interno
                          </span>
                        )}
                      </TableCell>
                      {showAttendance && (
                        <TableCell>
                          {row.attended ? (
                            <Badge
                              variant="outline"
                              className="gap-1 border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-400"
                            >
                              <CheckCheck className="size-3.5" />
                              Asistió
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="gap-1 border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-400"
                            >
                              <X className="size-3.5" />
                              No asistió
                            </Badge>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Lectura rápida de la asistencia: porcentaje grande y barra partida. Sustituye
 * dos barras apiladas por un solo indicador proporcional.
 */
export function AttendanceSnapshot({
  attended,
  notAttended,
  total,
  rate,
}: {
  attended: number;
  notAttended: number;
  total: number;
  rate: number;
}) {
  const attendedShare = total > 0 ? (attended / total) * 100 : 0;
  const notAttendedShare = total > 0 ? (notAttended / total) * 100 : 0;

  return (
    <Card>
      <CardContent className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <SectionLabel>Tasa de asistencia</SectionLabel>
            <div className="mt-1 flex items-baseline gap-2">
              <p className="font-mono text-3xl font-bold leading-none tabular-nums text-foreground">
                {rate}%
              </p>
              <p className="text-sm text-muted-foreground">
                {attended} de {total} registros
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald-500" />
              Asistentes{" "}
              <span className="font-mono tabular-nums text-foreground">
                {attended}
              </span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-rose-500" />
              Inasistentes{" "}
              <span className="font-mono tabular-nums text-foreground">
                {notAttended}
              </span>
            </span>
          </div>
        </div>

        <div
          className="mt-4 flex h-2.5 w-full overflow-hidden rounded-full bg-muted"
          role="img"
          aria-label={`${rate}% de asistencia sobre ${total} registros`}
        >
          <div
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${attendedShare}%` }}
          />
          <div
            className="h-full bg-rose-500 transition-all duration-500"
            style={{ width: `${notAttendedShare}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

/** Pestaña de estadísticas: dona proporcional + lectura de cumplimiento. */
export function AttendanceStatsPanel({
  attended,
  notAttended,
  total,
  rate,
}: {
  attended: number;
  notAttended: number;
  total: number;
  rate: number;
}) {
  const pieData = [
    { name: "Asistentes", value: attended },
    { name: "Inasistentes", value: notAttended },
  ];

  const compliance =
    rate >= 80
      ? {
          label: "Asistencia alta",
          className:
            "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-400",
        }
      : rate >= 50
        ? {
            label: "Asistencia parcial",
            className:
              "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-400",
          }
        : {
            label: "Asistencia baja",
            className:
              "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-400",
          };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <AreaChartIcon className="size-4" />
            </span>
            <div className="space-y-0.5">
              <CardTitle className="text-base">
                Distribución de asistencia
              </CardTitle>
              <CardDescription>
                Proporción entre asistentes e inasistentes
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <PieChartComponent
            data={pieData}
            title=""
            height={280}
            colors={["#10b981", "#f43f5e"]}
          />
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald-500" />
              Asistentes{" "}
              <span className="font-mono tabular-nums text-foreground">
                {attended}
              </span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-rose-500" />
              Inasistentes{" "}
              <span className="font-mono tabular-nums text-foreground">
                {notAttended}
              </span>
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Percent className="size-4" />
            </span>
            <div className="space-y-0.5">
              <CardTitle className="text-base">
                Cumplimiento de la actividad
              </CardTitle>
              <CardDescription>
                Lectura sobre el total de inscritos
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          <div>
            <div className="flex flex-wrap items-end justify-between gap-2">
              <p className="font-mono text-4xl font-bold leading-none tabular-nums text-foreground">
                {rate}%
              </p>
              <Badge
                variant="outline"
                className={cn("font-medium", compliance.className)}
              >
                {compliance.label}
              </Badge>
            </div>

            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${rate}%` }}
              />
            </div>

            <p className="mt-2 text-xs text-muted-foreground">
              {attended} asistentes sobre {total} registros.
            </p>
          </div>

          <Separator />

          <div className="space-y-3">
            <SummaryRow label="Total registrado" value={total} />
            <SummaryRow
              label="Asistentes"
              value={attended}
              valueClassName="text-emerald-600 dark:text-emerald-400"
            />
            <SummaryRow
              label="Inasistentes"
              value={notAttended}
              valueClassName="text-rose-600 dark:text-rose-400"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: number;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={cn(
          "font-mono text-sm font-semibold tabular-nums text-foreground",
          valueClassName,
        )}
      >
        {value}
      </span>
    </div>
  );
}

/** Estado vacío reutilizable para las pestañas que no dependen de una tabla. */
export function TabEmptyState({
  title,
  description,
  icon: Icon = Users,
}: {
  title: string;
  description: string;
  icon?: IconComponent;
}) {
  return (
    <Card>
      <CardContent>
        <EmptyState
          icon={Icon}
          title={title}
          description={description}
          className="py-12"
        />
      </CardContent>
    </Card>
  );
}
