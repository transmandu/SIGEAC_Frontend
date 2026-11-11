"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  Loader2,
  MessageSquare,
  Plane,
  Copy,
  Check,
  ArrowRight,
  Save,
  Calendar,
  Compass,
} from "lucide-react";
import {
  useParseWhatsApp,
  useImportWhatsAppDrafts,
} from "@/actions/counter/actions";
import type {
  WhatsAppParseResult,
  WhatsAppParsedFlight,
  FlightType,
  PaxPassenger,
} from "@/types";
import { toast } from "sonner";

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  pax: {
    label: "Pasajeros",
    color: "bg-blue-100 text-blue-800 border-blue-200",
  },
  frio: { label: "Frío", color: "bg-cyan-100 text-cyan-800 border-cyan-200" },
  carga: {
    label: "Carga",
    color: "bg-amber-100 text-amber-800 border-amber-200",
  },
  agua: { label: "Agua", color: "bg-teal-100 text-teal-800 border-teal-200" },
};

interface Props {
  open: boolean;
  onClose: () => void;
  company: string;
}

export default function WhatsAppImportModal({ open, onClose, company }: Props) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [rawText, setRawText] = useState("");
  const [result, setResult] = useState<WhatsAppParseResult | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Parámetros comunes para guardar en borrador
  const [flightDate, setFlightDate] = useState<string>(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [route, setRoute] = useState<string>("PZO-CAJ");
  const [selectedFlightsIndices, setSelectedFlightsIndices] = useState<
    number[]
  >([]);

  const parseMutation = useParseWhatsApp(company);
  const importDraftsMutation = useImportWhatsAppDrafts(company);

  const handleParse = async () => {
    if (!rawText.trim()) return;

    try {
      const data = await parseMutation.mutateAsync(rawText);
      if (data) {
        setResult(data);
        // Por defecto, todos los vuelos detectados están seleccionados
        setSelectedFlightsIndices(data.flights.map((_, i) => i));
        setStep(2);
      }
    } catch {
      // Handled by onError in mutation
    }
  };

  const handleClose = () => {
    setStep(1);
    setRawText("");
    setResult(null);
    setCopiedIndex(null);
    onClose();
  };

  const toggleFlightSelection = (index: number) => {
    setSelectedFlightsIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  const handleSaveAllAsDrafts = async () => {
    if (!result || selectedFlightsIndices.length === 0) return;

    const flightsToSave = result.flights.filter((_, idx) =>
      selectedFlightsIndices.includes(idx),
    );

    try {
      await importDraftsMutation.mutateAsync({
        flight_date: flightDate,
        route,
        flights: flightsToSave,
      });

      handleClose();
    } catch {
      // Error notificado en mutation
    }
  };

  const handleLoadFlightIntoForm = (
    flight: WhatsAppParsedFlight,
    flightIndex: number,
  ) => {
    const prefilledPassengers: Omit<PaxPassenger, "id">[] = [];
    let seatCounter = 1;

    flight.items
      .filter((item) => item.type === "pax")
      .forEach((item) => {
        for (let i = 0; i < item.pax_count; i++) {
          prefilledPassengers.push({
            seat_number: seatCounter++,
            full_name: `RESERVA ${item.client.toUpperCase()} (${i + 1})`,
            nationality: "VENEZOLANO",
            id_number: `${item.client.toUpperCase().slice(0, 10)}-P${i + 1}-${seatCounter - 1}`,
            lodge_type: "TOURIST",
            agency: item.client.toUpperCase(),
            luggage_weight: null,
            body_weight: 0,
            payment_method: null,
            amount_paid: 0,
            return_flight: false,
          });
        }
      });

    let flightType: FlightType = "HYBRID";
    if (flight.pax_count > 0 && flight.cargo_weight === 0) {
      flightType = "PAX";
    } else if (flight.pax_count === 0 && flight.cargo_weight > 0) {
      flightType = "CARGO_ONLY";
    }

    const prefillData = {
      flightType,
      passengers: prefilledPassengers,
      source: `Vuelo #${flightIndex + 1} desde WhatsApp (${flight.items.length} ítems, ${flight.total_weight} kg)`,
    };

    sessionStorage.setItem(
      "sigeac_prefill_pax_flight",
      JSON.stringify(prefillData),
    );
    toast.success(
      `Datos del Vuelo #${flightIndex + 1} preparados en el formulario.`,
    );
    handleClose();
    router.push(`/${company}/operaciones/counter/nuevo`);
  };

  const handleCopySummaryForWhatsApp = (
    flight: WhatsAppParsedFlight,
    index: number,
  ) => {
    const isPurePax = flight.cargo_weight === 0 && flight.pax_count > 0;
    const maxFlightWeight = isPurePax ? 1900 : 1800;

    let text = `✈️ VUELO ${index + 1} - MANIFIESTO RESUMEN\n`;
    text += `------------------------------------\n`;
    flight.items.forEach((item) => {
      text += `${item.client} - ${item.type.toUpperCase()} - ${item.weight} kg`;
      if (item.type === "pax") {
        text += ` (${item.pax_count} pax)`;
      }
      text += `\n`;
    });
    text += `------------------------------------\n`;
    text += `TOTAL PESO: ${flight.total_weight} kg / ${maxFlightWeight} kg\n`;
    text += `TOTAL PAX: ${flight.pax_count}\n`;
    text += `TOTAL CARGA: ${flight.cargo_weight} kg\n`;

    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success("Resumen copiado al portapapeles listo para WhatsApp");
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-3xl max-h-[92vh] flex flex-col overflow-hidden p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <MessageSquare className="h-5 w-5 text-green-600" />
            Importar lista desde WhatsApp
          </DialogTitle>
          <DialogDescription>
            Pega el texto que envía el personal de carga para separar
            automáticamente pasajeros, carga y distribución en vuelos.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-1">
          {/* PASO 1: Pegar texto */}
          {step === 1 && (
            <div className="space-y-4 pt-2">
              <div className="rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground space-y-1">
                <p className="font-semibold text-foreground">
                  Formato reconocido por línea:
                </p>
                <p>
                  <code>Cliente - tipo - peso</code> &nbsp;(ej.{" "}
                  <code>Paola - 2pax - 200</code>,{" "}
                  <code>Nirvana - frío - 248</code>,{" "}
                  <code>Waku - agua - 360</code>)
                </p>
                <p>
                  El sistema ignorará automáticamente líneas de TOTALES,
                  separadores de días y encabezados de WhatsApp.
                </p>
              </div>

              <Textarea
                placeholder={`Nirvana - frío - 248 \nPaola. - frío -  356\nPaola - carga - 567\nMaria varaste - carga - 74\nLoais - carga - 220\nPaola - 2pax - 200\nPablo - 1pax - 100\nWaku - agua - 360\nGalindez - 1pax - 100`}
                rows={12}
                className="font-mono text-xs leading-relaxed"
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
              />

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={handleClose}
                >
                  Cancelar
                </Button>
                <Button
                  className="w-full sm:w-auto"
                  onClick={handleParse}
                  disabled={!rawText.trim() || parseMutation.isPending}
                >
                  {parseMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Procesar lista
                </Button>
              </div>
            </div>
          )}

          {/* PASO 2: Vista previa y confirmación */}
          {step === 2 && result && (
            <div className="space-y-5 pt-2">
              {result.warnings.length > 0 && (
                <div className="rounded-md border border-amber-200 bg-amber-50 p-3 space-y-1">
                  {result.warnings.map((w, i) => (
                    <p key={i} className="text-xs text-amber-800 flex gap-2">
                      <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                      {w}
                    </p>
                  ))}
                </div>
              )}

              {/* Parámetros para guardar en borrador */}
              <div className="rounded-lg border bg-muted/40 p-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="import_flight_date"
                    className="text-xs flex items-center gap-1.5 font-medium"
                  >
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />{" "}
                    Fecha de los vuelos
                  </Label>
                  <Input
                    id="import_flight_date"
                    type="date"
                    value={flightDate}
                    onChange={(e) => setFlightDate(e.target.value)}
                    className="h-8 text-xs bg-background"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="import_route"
                    className="text-xs flex items-center gap-1.5 font-medium"
                  >
                    <Compass className="h-3.5 w-3.5 text-muted-foreground" />{" "}
                    Ruta estimada
                  </Label>
                  <Input
                    id="import_route"
                    value={route}
                    onChange={(e) => setRoute(e.target.value.toUpperCase())}
                    placeholder="PZO-CAJ"
                    className="h-8 text-xs bg-background uppercase font-mono"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <p className="text-sm font-medium">
                  Se detectaron{" "}
                  <span className="text-primary font-bold">
                    {result.flights.length} vuelo(s)
                  </span>{" "}
                  respetando la capacidad máxima de la aeronave (1 900 kg solo
                  pasajeros / 1 800 kg con carga):
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="self-end sm:self-auto shrink-0"
                  onClick={() => setStep(1)}
                >
                  Modificar texto
                </Button>
              </div>

              {result.flights.map((flight, index) => {
                const isPurePax =
                  flight.cargo_weight === 0 && flight.pax_count > 0;
                const maxFlightWeight = isPurePax ? 1900 : 1800;
                const weightPct = Math.min(
                  (flight.total_weight / maxFlightWeight) * 100,
                  100,
                );
                const isOverweight =
                  flight.total_weight > maxFlightWeight ||
                  flight.pax_count > 19;
                const isSelected = selectedFlightsIndices.includes(index);

                return (
                  <div
                    key={index}
                    className={`rounded-lg border p-4 space-y-3 shadow-sm transition-colors ${
                      isSelected
                        ? "bg-card border-primary/50"
                        : "bg-muted/20 border-border opacity-70"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleFlightSelection(index)}
                          aria-label={`Seleccionar vuelo ${index + 1}`}
                        />
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <Plane className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="font-semibold text-sm">
                            Vuelo Sugerido #{index + 1}
                          </span>
                          <span className="text-xs text-muted-foreground ml-2">
                            ({flight.items.length} ítems registrados)
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <Badge variant="outline" className="bg-background">
                          {flight.pax_count} pax
                        </Badge>
                        <Badge variant="outline" className="bg-background">
                          {flight.cargo_weight} kg carga
                        </Badge>
                        <Badge
                          variant="secondary"
                          className={
                            isOverweight
                              ? "bg-destructive/10 text-destructive font-bold"
                              : "font-semibold"
                          }
                        >
                          {flight.total_weight} / {maxFlightWeight} kg
                        </Badge>
                      </div>
                    </div>

                    {/* Barra de progreso de peso */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-muted-foreground">
                        <span>
                          Ocupación de peso ({Math.round(weightPct)}%)
                        </span>
                        <span>
                          {maxFlightWeight - flight.total_weight >= 0
                            ? `${Math.round((maxFlightWeight - flight.total_weight) * 100) / 100} kg disponibles`
                            : "Excede capacidad"}
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isOverweight ? "bg-destructive" : "bg-primary"
                          }`}
                          style={{ width: `${weightPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Tabla de ítems */}
                    <div className="max-h-48 overflow-y-auto rounded border">
                      <table className="w-full text-xs">
                        <thead className="bg-muted sticky top-0">
                          <tr className="border-b text-muted-foreground">
                            <th className="text-left py-1.5 px-3 font-medium">
                              Cliente / Empresa
                            </th>
                            <th className="text-left py-1.5 px-3 font-medium">
                              Categoría
                            </th>
                            <th className="text-right py-1.5 px-3 font-medium">
                              Peso (kg)
                            </th>
                            <th className="text-right py-1.5 px-3 font-medium">
                              Pasajeros
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {flight.items.map((item, itemIdx) => {
                            const meta =
                              TYPE_LABELS[item.type] ?? TYPE_LABELS.carga;
                            return (
                              <tr key={itemIdx} className="hover:bg-muted/20">
                                <td className="py-1.5 px-3 font-medium capitalize">
                                  {item.client}
                                </td>
                                <td className="py-1.5 px-3">
                                  <span
                                    className={`inline-block rounded border px-1.5 py-0.5 text-[10px] font-medium ${meta.color}`}
                                  >
                                    {meta.label}
                                  </span>
                                </td>
                                <td className="py-1.5 px-3 text-right font-mono">
                                  {item.weight} kg
                                </td>
                                <td className="py-1.5 px-3 text-right font-mono">
                                  {item.type === "pax" ? (
                                    <span className="font-bold text-blue-600">
                                      {item.pax_count}
                                    </span>
                                  ) : (
                                    "-"
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Acciones individuales por vuelo */}
                    <div className="flex flex-wrap justify-between items-center gap-2 pt-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-xs h-8 gap-1.5"
                        onClick={() =>
                          handleCopySummaryForWhatsApp(flight, index)
                        }
                      >
                        {copiedIndex === index ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-green-600" />
                            Copiado
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            Copiar para WhatsApp
                          </>
                        )}
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-xs h-8 gap-1.5"
                        onClick={() => handleLoadFlightIntoForm(flight, index)}
                      >
                        Abrir solo este en formulario
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}

              {/* Botón Guardar en Borrador */}
              <div className="sticky bottom-0 bg-background/95 backdrop-blur py-3 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={() => setStep(1)}
                >
                  ← Volver
                </Button>

                <Button
                  onClick={handleSaveAllAsDrafts}
                  disabled={
                    selectedFlightsIndices.length === 0 ||
                    importDraftsMutation.isPending
                  }
                  className="w-full sm:w-auto gap-2 bg-green-600 hover:bg-green-700 text-white"
                >
                  {importDraftsMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Guardar {selectedFlightsIndices.length} vuelo(s) en Borrador
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
