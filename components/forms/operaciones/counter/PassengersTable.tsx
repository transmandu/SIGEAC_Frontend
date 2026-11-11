"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, AlertCircle, Globe, Building2 } from "lucide-react";
import { PaxPassenger } from "@/types";
import { useGetClients } from "@/hooks/aerolinea/clientes/useGetClients";
import { PassengerFields } from "./PassengerFields";

interface PassengersTableProps {
  passengers: Omit<PaxPassenger, "id">[];
  onChange: (passengers: Omit<PaxPassenger, "id">[]) => void;
  readOnly?: boolean;
  company: string;
  isCounterStaff?: boolean;
}

export const PassengersTable = ({
  passengers,
  onChange,
  readOnly = false,
  company,
  isCounterStaff,
}: PassengersTableProps) => {
  const { user } = useAuth();
  const userRoles = useMemo(
    () => user?.roles?.map((r: { name: string }) => r.name) || [],
    [user],
  );
  const isCounter =
    isCounterStaff ??
    userRoles.some((r: string) =>
      ["OPERADOR_COUNTER", "SUPERUSER"].includes(r),
    );

  // Referencia a la lista móvil y bandera de "acabo de agregar un asiento".
  const mobileListRef = useRef<HTMLDivElement>(null);
  const shouldScrollToLastCard = useRef(false);

  // Al agregar un asiento, llevar la tarjeta nueva a la vista en móvil. El foco
  // lo pone el usuario: no abrimos el teclado automáticamente.
  useEffect(() => {
    if (!shouldScrollToLastCard.current) return;
    shouldScrollToLastCard.current = false;

    if (window.matchMedia("(min-width: 768px)").matches) return;

    const cards = mobileListRef.current?.querySelectorAll("[data-pax-card]");
    cards?.[cards.length - 1]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [passengers.length]);

  // Clientes desde la tabla 'clients'
  const { data: clients, isLoading: loadingClients } = useGetClients(company);

  // Estados para opciones dinámicas creadas en caliente
  const [customNationalities, setCustomNationalities] = useState<string[]>([]);
  const [customAgencies, setCustomAgencies] = useState<string[]>([]);

  // Estados de modales para agregar nuevas opciones
  const [nationalityModalOpen, setNationalityModalOpen] = useState(false);
  const [targetPaxIndexForNationality, setTargetPaxIndexForNationality] =
    useState<number | null>(null);
  const [newNationalityInput, setNewNationalityInput] = useState("");

  const [agencyModalOpen, setAgencyModalOpen] = useState(false);
  const [targetPaxIndexForAgency, setTargetPaxIndexForAgency] = useState<
    number | null
  >(null);
  const [newAgencyInput, setNewAgencyInput] = useState("");

  // Lista unificada de nacionalidades
  const allNationalities = useMemo(() => {
    const base = ["VENEZOLANO", "EXTRANJERO"];
    const fromPassengers = passengers
      .map((p) => p.nationality?.trim().toUpperCase())
      .filter((n): n is string => Boolean(n));

    return Array.from(
      new Set([...base, ...customNationalities, ...fromPassengers]),
    );
  }, [customNationalities, passengers]);

  // Lista unificada de agencias (clientes de la BD + personalizadas)
  const allAgencies = useMemo(() => {
    const fromDb = (clients || [])
      .map((c) => c.name?.trim().toUpperCase())
      .filter((name): name is string => Boolean(name));

    const fromPassengers = passengers
      .map((p) => p.agency?.trim().toUpperCase())
      .filter((a): a is string => Boolean(a));

    return Array.from(
      new Set([...fromDb, ...customAgencies, ...fromPassengers]),
    ).sort();
  }, [clients, customAgencies, passengers]);

  const handleAddRow = () => {
    if (passengers.length >= 19) return;
    shouldScrollToLastCard.current = true;
    const nextSeat = passengers.length + 1;
    onChange([
      ...passengers,
      {
        seat_number: nextSeat,
        full_name: "",
        nationality: "VENEZOLANO",
        id_number: "",
        lodge_type: "TOURIST",
        agency: "",
        luggage_weight: null,
        body_weight: null,
        payment_method: null,
        amount_paid: null,
        return_flight: false,
      },
    ]);
  };

  const handleRemoveRow = (index: number) => {
    const updated = passengers
      .filter((_, i) => i !== index)
      .map((p, i) => ({ ...p, seat_number: i + 1 }));
    onChange(updated);
  };

  const handleChangeField = (
    index: number,
    field: keyof Omit<PaxPassenger, "id">,
    value: any,
  ) => {
    const updated = [...passengers];
    updated[index] = {
      ...updated[index],
      [field]:
        field === "full_name" ||
        field === "id_number" ||
        field === "agency" ||
        field === "payment_method" ||
        field === "luggage_weight"
          ? typeof value === "string"
            ? value.toUpperCase()
            : value
          : value,
    };
    onChange(updated);
  };

  // Manejo de selección de nacionalidad (detecta cuando se elige "+ Otra nacionalidad")
  const handleNationalitySelect = (index: number, val: string) => {
    if (val === "__add_new_nationality__") {
      setTargetPaxIndexForNationality(index);
      setNewNationalityInput("");
      setNationalityModalOpen(true);
      return;
    }
    handleChangeField(index, "nationality", val);
  };

  const handleOpenNewAgencyModal = (index: number) => {
    setTargetPaxIndexForAgency(index);
    setNewAgencyInput("");
    setAgencyModalOpen(true);
  };

  // Confirmar agregar nueva nacionalidad
  const handleConfirmNewNationality = (e?: React.FormEvent) => {
    e?.preventDefault();
    const formatted = newNationalityInput.trim().toUpperCase();
    if (!formatted) return;

    if (!customNationalities.includes(formatted)) {
      setCustomNationalities((prev) => [...prev, formatted]);
    }

    if (targetPaxIndexForNationality !== null) {
      handleChangeField(targetPaxIndexForNationality, "nationality", formatted);
    }

    setNationalityModalOpen(false);
    setNewNationalityInput("");
    setTargetPaxIndexForNationality(null);
  };

  // Confirmar agregar nueva agencia
  const handleConfirmNewAgency = (e?: React.FormEvent) => {
    e?.preventDefault();
    const formatted = newAgencyInput.trim().toUpperCase();
    if (!formatted) return;

    if (!customAgencies.includes(formatted)) {
      setCustomAgencies((prev) => [...prev, formatted]);
    }

    if (targetPaxIndexForAgency !== null) {
      handleChangeField(targetPaxIndexForAgency, "agency", formatted);
    }

    setAgencyModalOpen(false);
    setNewAgencyInput("");
    setTargetPaxIndexForAgency(null);
  };

  // Detección de cédulas duplicadas
  const ids = passengers
    .map((p) => p.id_number.trim().toUpperCase())
    .filter(Boolean);
  const duplicateIds = ids.filter((id, i) => ids.indexOf(id) !== i);

  const isDuplicatePassenger = (pax: Omit<PaxPassenger, "id">) =>
    Boolean(
      pax.id_number &&
      duplicateIds.includes(pax.id_number.trim().toUpperCase()),
    );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-base font-semibold">Lista de Pasajeros</h3>
          <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded">
            {passengers.length} / 19 asientos ocupados
          </span>
        </div>

        {!readOnly && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddRow}
            disabled={passengers.length >= 19}
            className="flex items-center gap-1.5 w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" /> Agregar Asiento
          </Button>
        )}
      </div>

      {duplicateIds.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 border border-destructive/20 p-2.5 rounded-md">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>
            Atención: Hay cédulas o documentos duplicados en el manifiesto (
            {duplicateIds.join(", ")}).
          </span>
        </div>
      )}

      {/* Móvil (< md): una tarjeta apilada por pasajero. La tabla tiene 11
          columnas y ~1250px de ancho; en un teléfono obliga a desplazarse
          horizontalmente para completar cada pasajero. Ambas variantes
          comparten estado y controles (PassengerFields). */}
      <div ref={mobileListRef} className="flex flex-col gap-3 md:hidden">
        {passengers.length === 0 ? (
          <div className="rounded-md border border-dashed px-4 py-8 text-center text-sm italic text-muted-foreground">
            No hay pasajeros registrados. Presione &quot;Agregar Asiento&quot;
            para registrar uno.
          </div>
        ) : (
          passengers.map((pax, index) => (
            <PassengerFields
              key={index}
              variant="card"
              index={index}
              pax={pax}
              readOnly={readOnly}
              isCounter={isCounter}
              isDuplicate={isDuplicatePassenger(pax)}
              allNationalities={allNationalities}
              allAgencies={allAgencies}
              loadingClients={loadingClients}
              onChangeField={handleChangeField}
              onNationalitySelect={handleNationalitySelect}
              onOpenNewAgency={handleOpenNewAgencyModal}
              onRemove={handleRemoveRow}
            />
          ))
        )}

        {/* Mismo CTA al final de la lista: permite agregar el siguiente
            pasajero sin volver a subir hasta el encabezado. */}
        {passengers.length > 0 && !readOnly && (
          <Button
            type="button"
            variant="outline"
            onClick={handleAddRow}
            disabled={passengers.length >= 19}
            className="flex w-full items-center justify-center gap-1.5"
          >
            <Plus className="h-4 w-4" /> Agregar Asiento
          </Button>
        )}
      </div>

      {/* Tablet / escritorio: tabla original, sin cambios de comportamiento. */}
      {/* `relative` es obligatorio aquí: Radix Select monta un <select> nativo
          oculto con position:absolute. Sin un ancestro posicionado su bloque
          contenedor es el viewport, así que escapa al recorte de overflow-x y
          estira el documento hasta el ancho de la tabla (~1250px). En móvil eso
          habilita el paneo horizontal de la página y al abrir el select (Radix
          hace foco + scrollIntoView) la pantalla se va hacia la derecha. */}
      <div className="relative hidden rounded-md border overflow-x-auto w-full max-w-full md:block">
        <table
          className={`w-full text-sm ${isCounter ? "min-w-312.5" : "min-w-212.5"}`}
        >
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="py-2.5 px-3 text-center w-12 font-semibold whitespace-nowrap">
                #
              </th>
              <th className="py-2.5 px-3 text-center min-w-55 font-semibold whitespace-nowrap">
                Nombre Completo *
              </th>
              <th className="py-2.5 px-3 text-center w-44 min-w-42.5 font-semibold whitespace-nowrap">
                Nacionalidad *
              </th>
              <th className="py-2.5 px-3 text-center w-36 min-w-35 font-semibold whitespace-nowrap">
                Cédula / ID *
              </th>
              {isCounter && (
                <>
                  <th className="py-2.5 px-3 text-center w-36 min-w-35 font-semibold whitespace-nowrap">
                    Luggage
                  </th>
                  <th className="py-2.5 px-3 text-center w-28 min-w-25 font-semibold whitespace-nowrap">
                    W (Kg)
                  </th>
                </>
              )}
              <th className="py-2.5 px-3 text-center w-40 min-w-37.5 font-semibold whitespace-nowrap">
                Tipo (LODGE) *
              </th>
              <th className="py-2.5 px-3 text-left w-56 min-w-50 font-semibold whitespace-nowrap">
                Agencia / Cliente
              </th>
              {isCounter && (
                <>
                  <th className="py-2.5 px-3 text-center w-28 min-w-25 font-semibold whitespace-nowrap">
                    FP
                  </th>
                  <th className="py-2.5 px-3 text-center w-32 min-w-27.5 font-semibold whitespace-nowrap">
                    M ($)
                  </th>
                  <th className="py-2.5 px-3 text-center w-20 min-w-20 font-semibold whitespace-nowrap">
                    Return
                  </th>
                </>
              )}
              {!readOnly && (
                <th className="py-2.5 px-3 text-center w-12 font-semibold whitespace-nowrap"></th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y">
            {passengers.length === 0 ? (
              <tr>
                <td
                  colSpan={(isCounter ? 11 : 6) + (readOnly ? 0 : 1)}
                  className="py-8 text-center text-muted-foreground italic text-sm"
                >
                  No hay pasajeros registrados. Haga clic en &quot;Agregar
                  Asiento&quot; para registrar uno.
                </td>
              </tr>
            ) : (
              passengers.map((pax, index) => (
                <tr key={index} className="hover:bg-muted/30">
                  <PassengerFields
                    variant="table"
                    index={index}
                    pax={pax}
                    readOnly={readOnly}
                    isCounter={isCounter}
                    isDuplicate={isDuplicatePassenger(pax)}
                    allNationalities={allNationalities}
                    allAgencies={allAgencies}
                    loadingClients={loadingClients}
                    onChangeField={handleChangeField}
                    onNationalitySelect={handleNationalitySelect}
                    onOpenNewAgency={handleOpenNewAgencyModal}
                    onRemove={handleRemoveRow}
                  />
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL: AGREGAR OTRA NACIONALIDAD */}
      <Dialog
        open={nationalityModalOpen}
        onOpenChange={setNationalityModalOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" /> Agregar Nacionalidad
            </DialogTitle>
            <DialogDescription>
              Especifique la nacionalidad para asignarla al pasajero y añadirla
              a la lista.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleConfirmNewNationality}
            className="flex flex-col gap-4 py-2"
          >
            <div className="flex flex-col gap-2">
              <Input
                placeholder="Ej. COLOMBIANO, ESPAÑOL, CHILENO..."
                value={newNationalityInput}
                onChange={(e) =>
                  setNewNationalityInput(e.target.value.toUpperCase())
                }
                className="uppercase"
                autoFocus
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setNationalityModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={!newNationalityInput.trim()}>
                Agregar Nacionalidad
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL: AGREGAR NUEVA AGENCIA / CLIENTE */}
      <Dialog open={agencyModalOpen} onOpenChange={setAgencyModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" /> Registrar Nueva
              Agencia
            </DialogTitle>
            <DialogDescription>
              Ingrese el nombre de la agencia o cliente asociado a los pasajeros
              de este vuelo.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleConfirmNewAgency}
            className="flex flex-col gap-4 py-2"
          >
            <div className="flex flex-col gap-2">
              <Input
                placeholder="Ej. WAKU, CANAIMA TOURS, VENETUR..."
                value={newAgencyInput}
                onChange={(e) =>
                  setNewAgencyInput(e.target.value.toUpperCase())
                }
                className="uppercase"
                autoFocus
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setAgencyModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={!newAgencyInput.trim()}>
                Guardar Agencia
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
