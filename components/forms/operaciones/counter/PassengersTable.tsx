"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectSeparator,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Plus, Trash2, AlertCircle, Check, ChevronsUpDown, Globe, Building2 } from "lucide-react";
import { LodgeType, PaxPassenger } from "@/types";
import { useGetClients } from "@/hooks/aerolinea/clientes/useGetClients";

interface PassengersTableProps {
  passengers: Omit<PaxPassenger, "id">[];
  onChange: (passengers: Omit<PaxPassenger, "id">[]) => void;
  readOnly?: boolean;
  company: string;
}

const LODGE_OPTIONS: { label: string; value: LodgeType }[] = [
  { label: "TURISTAS", value: "TURISTAS" },
  { label: "RESIDENTE", value: "RESIDENTE" },
  { label: "EMPLEADO", value: "EMPLEADO" },
  { label: "N/A", value: "N/A" },
];

export const PassengersTable = ({
  passengers,
  onChange,
  readOnly = false,
  company,
}: PassengersTableProps) => {
  // Clientes desde la tabla 'clients'
  const { data: clients, isLoading: loadingClients } = useGetClients(company);

  // Estados para opciones dinámicas creadas en caliente
  const [customNationalities, setCustomNationalities] = useState<string[]>([]);
  const [customAgencies, setCustomAgencies] = useState<string[]>([]);

  // Estados de modales para agregar nuevas opciones
  const [nationalityModalOpen, setNationalityModalOpen] = useState(false);
  const [targetPaxIndexForNationality, setTargetPaxIndexForNationality] = useState<number | null>(null);
  const [newNationalityInput, setNewNationalityInput] = useState("");

  const [agencyModalOpen, setAgencyModalOpen] = useState(false);
  const [targetPaxIndexForAgency, setTargetPaxIndexForAgency] = useState<number | null>(null);
  const [newAgencyInput, setNewAgencyInput] = useState("");

  // Lista unificada de nacionalidades
  const allNationalities = useMemo(() => {
    const base = ["VENEZOLANO", "EXTRANJERO"];
    const fromPassengers = passengers
      .map((p) => p.nationality?.trim().toUpperCase())
      .filter((n): n is string => Boolean(n));

    return Array.from(new Set([...base, ...customNationalities, ...fromPassengers]));
  }, [customNationalities, passengers]);

  // Lista unificada de agencias (clientes de la BD + personalizadas)
  const allAgencies = useMemo(() => {
    const fromDb = (clients || [])
      .map((c) => c.name?.trim().toUpperCase())
      .filter((name): name is string => Boolean(name));

    const fromPassengers = passengers
      .map((p) => p.agency?.trim().toUpperCase())
      .filter((a): a is string => Boolean(a));

    return Array.from(new Set([...fromDb, ...customAgencies, ...fromPassengers])).sort();
  }, [clients, customAgencies, passengers]);

  const handleAddRow = () => {
    if (passengers.length >= 19) return;
    const nextSeat = passengers.length + 1;
    onChange([
      ...passengers,
      {
        seat_number: nextSeat,
        full_name: "",
        nationality: "VENEZOLANO",
        id_number: "",
        lodge_type: "TURISTAS",
        agency: "",
        body_weight: 0,
        luggage_weight: 0,
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
        field === "full_name" || field === "id_number" || field === "agency"
          ? typeof value === "string" ? value.toUpperCase() : value
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
  const ids = passengers.map((p) => p.id_number.trim().toUpperCase()).filter(Boolean);
  const duplicateIds = ids.filter((id, i) => ids.indexOf(id) !== i);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
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
            className="flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" /> Agregar Asiento
          </Button>
        )}
      </div>

      {duplicateIds.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 border border-destructive/20 p-2.5 rounded-md">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>
            Atención: Hay cédulas o documentos duplicados en el manifiesto ({duplicateIds.join(", ")}).
          </span>
        </div>
      )}

      <div className="rounded-md border overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="py-2 px-2 text-center w-12 font-semibold">#</th>
              <th className="py-2 px-3 text-left min-w-[200px] font-semibold">
                Nombre Completo *
              </th>
              <th className="py-2 px-2 text-center w-40 font-semibold">
                Nacionalidad *
              </th>
              <th className="py-2 px-2 text-center w-36 font-semibold">
                Cédula / ID *
              </th>
              <th className="py-2 px-2 text-center w-36 font-semibold">
                Tipo (LODGE) *
              </th>
              <th className="py-2 px-3 text-left w-52 font-semibold">
                Agencia / Cliente
              </th>
              {!readOnly && (
                <th className="py-2 px-2 text-center w-12 font-semibold"></th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y">
            {passengers.length === 0 ? (
              <tr>
                <td
                  colSpan={readOnly ? 6 : 7}
                  className="py-8 text-center text-muted-foreground italic"
                >
                  No hay pasajeros registrados. Haga clic en &quot;Agregar Asiento&quot; para registrar uno.
                </td>
              </tr>
            ) : (
              passengers.map((pax, index) => {
                const isDuplicate =
                  pax.id_number &&
                  duplicateIds.includes(pax.id_number.trim().toUpperCase());

                return (
                  <tr key={index} className="hover:bg-muted/30">
                    {/* Número de asiento */}
                    <td className="py-1.5 px-2 text-center font-bold text-muted-foreground">
                      {pax.seat_number}
                    </td>

                    {/* Nombre completo */}
                    <td className="py-1.5 px-2">
                      <Input
                        value={pax.full_name}
                        disabled={readOnly}
                        placeholder="Ej. PÉREZ JUAN"
                        onChange={(e) =>
                          handleChangeField(index, "full_name", e.target.value)
                        }
                        className="h-8 text-xs font-medium uppercase"
                      />
                    </td>

                    {/* Nacionalidad: Select desplegable */}
                    <td className="py-1.5 px-2">
                      <Select
                        value={pax.nationality}
                        disabled={readOnly}
                        onValueChange={(val) => handleNationalitySelect(index, val)}
                      >
                        <SelectTrigger className="h-8 text-xs text-center font-medium">
                          <SelectValue placeholder="Nacionalidad" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Opciones Principales</SelectLabel>
                            <SelectItem value="VENEZOLANO">VENEZOLANO</SelectItem>
                            <SelectItem value="EXTRANJERO">EXTRANJERO</SelectItem>
                            <SelectItem value="JURIDICO">JURIDICO</SelectItem>
                          </SelectGroup>

                          {allNationalities.filter(
                            (n) => n !== "VENEZOLANO" && n !== "EXTRANJERO",
                          ).length > 0 && (
                            <SelectGroup>
                              <SelectSeparator />
                              <SelectLabel>Otras Nacionalidades</SelectLabel>
                              {allNationalities
                                .filter(
                                  (n) => n !== "VENEZOLANO" && n !== "EXTRANJERO",
                                )
                                .map((nat) => (
                                  <SelectItem key={nat} value={nat}>
                                    {nat}
                                  </SelectItem>
                                ))}
                            </SelectGroup>
                          )}

                          {!readOnly && (
                            <SelectGroup>
                              <SelectItem
                                value="__add_new_nationality__"
                                className="pl-2 text-primary font-semibold cursor-pointer"
                              >
                                <span className="flex items-center gap-1.5 text-xs text-primary">
                                  <Plus className="h-3.5 w-3.5" /> Otra nacionalidad...
                                </span>
                              </SelectItem>
                            </SelectGroup>
                          )}
                        </SelectContent>
                      </Select>
                    </td>

                    {/* Cédula / Pasaporte */}
                    <td className="py-1.5 px-2">
                      <Input
                        value={pax.id_number}
                        disabled={readOnly}
                        placeholder="V-12345678"
                        onChange={(e) =>
                          handleChangeField(index, "id_number", e.target.value)
                        }
                        className={`h-8 text-xs text-center uppercase ${
                          isDuplicate ? "border-destructive focus-visible:ring-destructive" : ""
                        }`}
                      />
                    </td>

                    {/* Tipo / Lodge */}
                    <td className="py-1.5 px-2">
                      <Select
                        value={pax.lodge_type}
                        disabled={readOnly}
                        onValueChange={(val) =>
                          handleChangeField(index, "lodge_type", val as LodgeType)
                        }
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {LODGE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>

                    {/* Agencia: Desplegable con lista de Clients de BD + opción nueva */}
                    <td className="py-1.5 px-2">
                      <AgencyCombobox
                        value={pax.agency || ""}
                        disabled={readOnly}
                        agencies={allAgencies}
                        loading={loadingClients}
                        onChange={(val) => handleChangeField(index, "agency", val)}
                        onOpenNewModal={() => {
                          setTargetPaxIndexForAgency(index);
                          setNewAgencyInput("");
                          setAgencyModalOpen(true);
                        }}
                      />
                    </td>

                    {/* Eliminar fila */}
                    {!readOnly && (
                      <td className="py-1.5 px-2 text-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveRow(index)}
                          className="h-7 w-7 text-destructive hover:text-destructive/80"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL: AGREGAR OTRA NACIONALIDAD */}
      <Dialog open={nationalityModalOpen} onOpenChange={setNationalityModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" /> Agregar Nacionalidad
            </DialogTitle>
            <DialogDescription>
              Especifique la nacionalidad para asignarla al pasajero y añadirla a la lista.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleConfirmNewNationality} className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-2">
              <Input
                placeholder="Ej. COLOMBIANO, ESPAÑOL, CHILENO..."
                value={newNationalityInput}
                onChange={(e) => setNewNationalityInput(e.target.value.toUpperCase())}
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
              <Button
                type="submit"
                disabled={!newNationalityInput.trim()}
              >
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
              <Building2 className="h-5 w-5 text-primary" /> Registrar Nueva Agencia
            </DialogTitle>
            <DialogDescription>
              Ingrese el nombre de la agencia o cliente asociado a los pasajeros de este vuelo.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleConfirmNewAgency} className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-2">
              <Input
                placeholder="Ej. WAKU, CANAIMA TOURS, VENETUR..."
                value={newAgencyInput}
                onChange={(e) => setNewAgencyInput(e.target.value.toUpperCase())}
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
              <Button
                type="submit"
                disabled={!newAgencyInput.trim()}
              >
                Guardar Agencia
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

/**
 * Componente desplegable para la columna Agencia con búsqueda integrada
 * y opción directa para registrar / agregar una nueva opción.
 */
interface AgencyComboboxProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  agencies: string[];
  loading?: boolean;
  onOpenNewModal: () => void;
}

const AgencyCombobox = ({
  value,
  onChange,
  disabled = false,
  agencies,
  loading = false,
  onOpenNewModal,
}: AgencyComboboxProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const searchUpper = search.trim().toUpperCase();

  const filtered = useMemo(() => {
    if (!searchUpper) return agencies;
    return agencies.filter((a) => a.includes(searchUpper));
  }, [agencies, searchUpper]);

  const hasExactMatch = agencies.some((a) => a === searchUpper);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          disabled={disabled}
          className="h-8 text-xs w-full justify-between font-normal px-2.5 bg-background"
        >
          <span className="truncate">
            {value || <span className="text-muted-foreground italic">Sin Agencia (—)</span>}
          </span>
          <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Buscar agencia..."
            value={search}
            onValueChange={setSearch}
            className="text-xs h-8"
          />
          <CommandList className="max-h-52 text-xs">
            <CommandEmpty>
              <div className="p-2 text-center text-xs text-muted-foreground">
                <p>No se encontró ninguna agencia.</p>
                {searchUpper && !hasExactMatch && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="mt-2 w-full text-xs text-primary font-semibold justify-center"
                    onClick={() => {
                      onChange(searchUpper);
                      setOpen(false);
                      setSearch("");
                    }}
                  >
                    <Plus className="h-3 w-3 mr-1" /> Usar &quot;{searchUpper}&quot;
                  </Button>
                )}
              </div>
            </CommandEmpty>

            <CommandGroup heading="Opciones">
              <CommandItem
                value="__none__"
                onSelect={() => {
                  onChange("");
                  setOpen(false);
                }}
                className="text-xs flex items-center justify-between cursor-pointer"
              >
                <span className="italic text-muted-foreground">Sin Agencia (—)</span>
                {!value && <Check className="h-3 w-3 text-primary" />}
              </CommandItem>
            </CommandGroup>

            <CommandSeparator />

            <CommandGroup heading={loading ? "Cargando clientes..." : "Clientes / Agencias Registradas"}>
              {filtered.map((agency) => (
                <CommandItem
                  key={agency}
                  value={agency}
                  onSelect={() => {
                    onChange(agency);
                    setOpen(false);
                  }}
                  className="text-xs flex items-center justify-between cursor-pointer"
                >
                  <span className="truncate font-medium">{agency}</span>
                  {value === agency && <Check className="h-3 w-3 text-primary" />}
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandSeparator />

            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  setOpen(false);
                  onOpenNewModal();
                }}
                className="text-xs text-primary font-semibold cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Registrar nueva agencia...
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
