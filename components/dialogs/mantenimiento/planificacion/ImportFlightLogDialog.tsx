"use client";

import {
  type FlightLogReport,
  type FlightLogRowError,
  useImportFlightLog,
} from "@/actions/mantenimiento/planificacion/vuelos/import";
import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import { ActionTriggerButton } from "@/components/misc/ActionTriggerButton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetMaintenanceAircrafts } from "@/hooks/mantenimiento/planificacion/useGetMaintenanceAircrafts";
import { formatNumber, parseDecimalInput } from "@/lib/formatNumber";
import { notifyError } from "@/lib/notify-error";
import { formatDate } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import { isAxiosError } from "axios";
import {
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  Loader2,
  Upload,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// El informe se muestra con 2 decimales; el servidor guarda y compara a ese mismo nivel.
const hours = (value: number | null | undefined) =>
  formatNumber(value, { minDecimals: 2, maxDecimals: 2, fallback: "—" });

const counts = (value: number | null | undefined) =>
  formatNumber(value, { maxDecimals: 2, fallback: "—" });

/** "1.234,5" → 1234.5; vacío → null; texto no numérico → NaN. */
const readExpected = (text: string): number | null => {
  if (!text.trim()) return null;
  return parseDecimalInput(text) ?? Number.NaN;
};

interface ServerFailure {
  message: string;
  rows: FlightLogRowError[];
  total: number;
  overlap: boolean;
}

/** Lo que el servidor rechazó, listo para mostrar; null si no fue un rechazo de datos. */
const readFailure = (error: unknown): ServerFailure | null => {
  if (!isAxiosError(error) || error.response?.status !== 422) return null;

  const data = error.response.data ?? {};
  const rows: FlightLogRowError[] = Array.isArray(data.errors) ? data.errors : [];
  const fileMessage: string | undefined =
    data.errors?.file?.[0] ?? (rows.length ? undefined : data.message);

  if (!rows.length && !fileMessage) return null;

  return {
    message: rows.length
      ? (data.message ?? "El archivo tiene filas con errores.")
      : fileMessage!,
    rows,
    total: data.errors_total ?? rows.length,
    overlap: Boolean(fileMessage?.includes("allow_overlap")),
  };
};

function ReportView({ report }: { report: FlightLogReport }) {
  const { aircraft_counters: counters, reconciliation } = report;
  const mismatch = Object.values(reconciliation ?? {}).some((r) => !r.matches);

  return (
    <div className="space-y-5">
      {reconciliation && (
        <Alert variant={mismatch ? "destructive" : "default"}>
          {mismatch ? (
            <AlertTriangle className="h-4 w-4" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          <AlertTitle>
            {mismatch ? "No cuadra con lo esperado" : "Cuadra con lo esperado"}
          </AlertTitle>
          <AlertDescription>
            <ul className="mt-1 space-y-0.5 text-sm">
              {reconciliation.hours && (
                <li>
                  Horas: quedarían en {hours(reconciliation.hours.after)}, se
                  esperaban {hours(reconciliation.hours.expected)}
                  {!reconciliation.hours.matches &&
                    ` (diferencia ${hours(reconciliation.hours.difference)})`}
                  .
                </li>
              )}
              {reconciliation.cycles && (
                <li>
                  Ciclos: quedarían en {counts(reconciliation.cycles.after)}, se
                  esperaban {counts(reconciliation.cycles.expected)}
                  {!reconciliation.cycles.matches &&
                    ` (diferencia ${counts(reconciliation.cycles.difference)})`}
                  .
                </li>
              )}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-wrap gap-2 text-sm">
        <Badge variant="secondary">{report.rows.imported} vuelos</Badge>
        <Badge variant="secondary">
          {formatDate(report.period.from)} – {formatDate(report.period.to)}
        </Badge>
        {report.rows.skipped_blank > 0 && (
          <Badge variant="outline">
            {report.rows.skipped_blank} filas vacías ignoradas
          </Badge>
        )}
        {report.rows.skipped_zero > 0 && (
          <Badge variant="outline">
            {report.rows.skipped_zero} filas en 0 omitidas
          </Badge>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{report.aircraft}</TableHead>
              <TableHead className="text-right">Antes</TableHead>
              <TableHead className="text-right">Se suma</TableHead>
              <TableHead className="text-right">Después</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Horas de vuelo</TableCell>
              <TableCell className="text-right tabular-nums">
                {hours(counters.hours.before)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {hours(counters.hours.added)}
              </TableCell>
              <TableCell className="text-right font-semibold tabular-nums">
                {hours(counters.hours.after)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Ciclos de vuelo</TableCell>
              <TableCell className="text-right tabular-nums">
                {counts(counters.cycles.before)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {counts(counters.cycles.added)}
              </TableCell>
              <TableCell className="text-right font-semibold tabular-nums">
                {counts(counters.cycles.after)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {report.parts.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">
            Partes instaladas ({report.parts.length})
          </p>
          <div className="max-h-64 overflow-auto rounded-md border">
            <Table>
              <TableHeader className="sticky top-0 bg-background">
                <TableRow>
                  <TableHead>Parte</TableHead>
                  <TableHead className="text-right">TSN</TableHead>
                  <TableHead className="text-right">TSO</TableHead>
                  <TableHead className="text-right">CSN</TableHead>
                  <TableHead className="text-right">CSO</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.parts.map((part) => (
                  <TableRow key={part.part_id}>
                    <TableCell>
                      <div className="text-sm font-medium">
                        {part.type || "Parte"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {part.part_number}
                        {part.serial ? ` · ${part.serial}` : ""}
                      </div>
                    </TableCell>
                    {(
                      [
                        "time_since_new",
                        "time_since_overhaul",
                        "cycles_since_new",
                        "cycles_since_overhaul",
                      ] as const
                    ).map((key) => {
                      const { before, after } = part.counters[key];
                      return (
                        <TableCell
                          key={key}
                          className="text-right text-xs tabular-nums"
                        >
                          {before === null ? (
                            <span className="text-muted-foreground">N/A</span>
                          ) : (
                            <>
                              <span className="text-muted-foreground">
                                {counts(before)} →{" "}
                              </span>
                              <span className="font-semibold">
                                {counts(after)}
                              </span>
                            </>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {report.warnings.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Avisos</AlertTitle>
          <AlertDescription>
            <ul className="mt-1 list-disc space-y-0.5 pl-4 text-sm">
              {report.warnings.slice(0, 10).map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
              {report.warnings.length > 10 && (
                <li>… y {report.warnings.length - 10} avisos más.</li>
              )}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

/**
 * Carga masiva del historial de vuelos de una aeronave desde un Excel. Solo
 * SUPERUSER (el servidor también lo exige). Primero se simula: el informe muestra
 * cómo quedarían la aeronave y sus partes y, si se indican, contra los valores
 * esperados; solo entonces se confirma la carga real.
 */
export function ImportFlightLogDialog({
  defaultAircraftId,
}: {
  defaultAircraftId?: string;
}) {
  const { selectedCompany } = useCompanyStore();
  const { data: aircrafts } = useGetMaintenanceAircrafts(selectedCompany?.slug);
  const { importFlightLog } = useImportFlightLog();

  const [open, setOpen] = useState(false);
  const [aircraftId, setAircraftId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [expectedHours, setExpectedHours] = useState("");
  const [expectedCycles, setExpectedCycles] = useState("");
  const [allowOverlap, setAllowOverlap] = useState(false);
  const [report, setReport] = useState<FlightLogReport | null>(null);
  const [failure, setFailure] = useState<ServerFailure | null>(null);

  const selectedAircraftId = aircraftId || defaultAircraftId || "";
  const acronym = aircrafts?.find(
    (a) => String(a.id) === selectedAircraftId,
  )?.acronym;
  const parsedHours = readExpected(expectedHours);
  const parsedCycles = readExpected(expectedCycles);
  const expectedInvalid =
    Number.isNaN(parsedHours) || Number.isNaN(parsedCycles);
  const canRun = !!acronym && !!file && !expectedInvalid;

  const reset = () => {
    setAircraftId("");
    setFile(null);
    setExpectedHours("");
    setExpectedCycles("");
    setAllowOverlap(false);
    setReport(null);
    setFailure(null);
  };

  // Cerrar por cualquier vía (Cancelar, Esc, fuera) deja el diálogo como nuevo.
  const close = () => {
    setOpen(false);
    reset();
  };

  const run = async (dryRun: boolean) => {
    if (!canRun || !selectedCompany || !acronym || !file) return;
    setFailure(null);

    try {
      const result = await importFlightLog.mutateAsync({
        company: selectedCompany.slug,
        acronym,
        file,
        dryRun,
        allowOverlap,
        expectedHours: parsedHours,
        expectedCycles: parsedCycles,
      });

      if (dryRun) {
        setReport(result.report);
        return;
      }

      toast.success("¡Importado!", {
        description: `${result.report.rows.imported} vuelos cargados a ${result.report.aircraft}.`,
      });
      close();
    } catch (error) {
      const known = readFailure(error);
      if (known) {
        setReport(null);
        setFailure(known);
      } else {
        notifyError(error, { action: "importar el historial de vuelos" });
      }
    }
  };

  const mismatch = Object.values(report?.reconciliation ?? {}).some(
    (line) => !line.matches,
  );

  const footer = report ? (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setReport(null)}
        disabled={importFlightLog.isPending}
      >
        Volver
      </Button>
      <Button
        type="button"
        variant={mismatch ? "destructive" : "default"}
        onClick={() => run(false)}
        disabled={importFlightLog.isPending}
      >
        {importFlightLog.isPending && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        {mismatch ? "Importar de todos modos" : "Confirmar importación"}
      </Button>
    </>
  ) : (
    <>
      <Button type="button" variant="outline" onClick={() => close()}>
        Cancelar
      </Button>
      <Button
        type="button"
        onClick={() => run(true)}
        disabled={!canRun || importFlightLog.isPending}
      >
        {importFlightLog.isPending && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        Simular importación
      </Button>
    </>
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        <ActionTriggerButton variant="outline" className="h-8 border-dashed">
          <Upload className="mr-2 h-4 w-4" />
          Importar historial
        </ActionTriggerButton>
      </DialogTrigger>
      <FormDialogContent
        icon={FileSpreadsheet}
        title="Importar historial de vuelos"
        description="Cada vuelo del Excel suma sus horas y ciclos a la aeronave y a sus partes instaladas. Primero se simula: nada se guarda hasta que confirme."
        className="sm:max-w-3xl"
        footer={footer}
      >
        {report ? (
          <ReportView report={report} />
        ) : (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Aeronave</Label>
                <Select
                  value={selectedAircraftId}
                  onValueChange={(value) => {
                    setAircraftId(value);
                    setFailure(null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Elige la aeronave..." />
                  </SelectTrigger>
                  <SelectContent>
                    {aircrafts?.map((aircraft) => (
                      <SelectItem key={aircraft.id} value={String(aircraft.id)}>
                        {aircraft.acronym}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="flight-log-file">Archivo Excel</Label>
                {/* Un input de archivo no puede mostrar un archivo ya elegido: al volver
                    del informe aparecía vacío aunque el archivo seguía cargado. Con
                    archivo se muestra su nombre y se ofrece quitarlo. */}
                {file ? (
                  <div className="flex h-9 items-center gap-2 rounded-md border px-3 text-sm">
                    <FileSpreadsheet className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1 truncate" title={file.name}>
                      {file.name}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatNumber(file.size / 1024, { maxDecimals: 1 })} KB
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2"
                      onClick={() => {
                        setFile(null);
                        setFailure(null);
                      }}
                    >
                      Quitar
                    </Button>
                  </div>
                ) : (
                  <Input
                    id="flight-log-file"
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={(event) => {
                      setFile(event.target.files?.[0] ?? null);
                      setFailure(null);
                    }}
                  />
                )}
              </div>
            </div>

            <div className="rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Formato del archivo</p>
              <ul className="mt-1 list-disc space-y-0.5 pl-4">
                <li>
                  Primera hoja, con encabezados <strong>Fecha</strong>,{" "}
                  <strong>Hora</strong> y <strong>Ciclo</strong>.
                </li>
                <li>
                  Fechas en <strong>DD/MM/AAAA</strong>; horas con coma decimal
                  (por ejemplo 2,3).
                </li>
                <li>
                  Las filas vacías se ignoran; si una sola fila es inválida no
                  se importa nada.
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">
                Valores esperados{" "}
                <span className="font-normal text-muted-foreground">
                  (opcional)
                </span>
              </p>
              <p className="text-xs text-muted-foreground">
                Los totales que debería tener la aeronave al terminar. El
                informe indica si cuadra o cuánto se desvía.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="expected-hours">Horas totales</Label>
                  <Input
                    id="expected-hours"
                    inputMode="decimal"
                    placeholder="Ej: 1.234,5"
                    value={expectedHours}
                    onChange={(event) => setExpectedHours(event.target.value)}
                    aria-invalid={Number.isNaN(parsedHours)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="expected-cycles">Ciclos totales</Label>
                  <Input
                    id="expected-cycles"
                    inputMode="decimal"
                    placeholder="Ej: 980"
                    value={expectedCycles}
                    onChange={(event) => setExpectedCycles(event.target.value)}
                    aria-invalid={Number.isNaN(parsedCycles)}
                  />
                </div>
              </div>
              {expectedInvalid && (
                <p className="text-xs text-destructive">
                  Escriba un número válido, por ejemplo 1.234,5.
                </p>
              )}
            </div>

            {failure && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>
                  {failure.rows.length
                    ? "Revise el archivo"
                    : "No se importó nada"}
                </AlertTitle>
                <AlertDescription>
                  <p>{failure.message}</p>
                  {failure.rows.length > 0 && (
                    <ul className="mt-2 max-h-48 list-disc space-y-0.5 overflow-auto pl-4 text-sm">
                      {failure.rows.map((error) => (
                        <li key={`${error.row}-${error.message}`}>
                          {error.row > 0 ? `Fila ${error.row}: ` : ""}
                          {error.message}
                        </li>
                      ))}
                      {failure.total > failure.rows.length && (
                        <li>
                          … y {failure.total - failure.rows.length} errores más.
                        </li>
                      )}
                    </ul>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {failure?.overlap && (
              <div className="flex items-start gap-2 rounded-md border p-3">
                <Checkbox
                  id="allow-overlap"
                  checked={allowOverlap}
                  onCheckedChange={(value) => setAllowOverlap(value === true)}
                />
                <Label htmlFor="allow-overlap" className="text-sm font-normal">
                  Importar de todos modos, aunque la aeronave ya tenga vuelos en
                  ese período. Las horas se sumarán otra vez.
                </Label>
              </div>
            )}
          </div>
        )}
      </FormDialogContent>
    </Dialog>
  );
}
