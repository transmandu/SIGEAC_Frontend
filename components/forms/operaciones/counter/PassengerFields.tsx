"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Check, ChevronsUpDown, Plus, Trash2 } from "lucide-react";
import { LodgeType, PaxPassenger } from "@/types";

const LODGE_OPTIONS: { label: string; value: LodgeType }[] = [
  { label: "TURISTAS", value: "TOURIST" },
  { label: "RESIDENTE", value: "RESIDENT" },
  { label: "PARTICULAR", value: "PARTICULAR" },
  { label: "EMPLEADO", value: "EMPLOYEE" },
  { label: "N/A", value: "N/A" },
];

const normalizeLodgeValue = (val: string | null | undefined): LodgeType => {
  if (!val) return "N/A";
  const upper = val.toUpperCase();
  if (upper === "TURISTA" || upper === "TURISTAS") return "TOURIST";
  if (upper === "RESIDENTE" || upper === "RESIDENTES") return "RESIDENT";
  if (upper === "EMPLEADO" || upper === "EMPLEADOS") return "EMPLOYEE";
  return upper as LodgeType;
};

type PassengerField = keyof Omit<PaxPassenger, "id">;

export interface PassengerFieldsProps {
  /**
   * `table` devuelve celdas `<td>` para la tabla de escritorio y `card`
   * devuelve una tarjeta apilada para móvil. Los controles son los mismos
   * en ambas variantes: solo cambia el wrapper visual.
   */
  variant: "table" | "card";
  index: number;
  pax: Omit<PaxPassenger, "id">;
  readOnly: boolean;
  isCounter: boolean;
  isDuplicate: boolean;
  allNationalities: string[];
  allAgencies: string[];
  loadingClients: boolean;
  onChangeField: (index: number, field: PassengerField, value: any) => void;
  onNationalitySelect: (index: number, value: string) => void;
  onOpenNewAgency: (index: number) => void;
  onRemove: (index: number) => void;
}

/** Etiqueta + control apilados; solo se usa en la variante tarjeta. */
const CardField = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) => (
  <div className="flex min-w-0 flex-col gap-1.5">
    <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
      {label}
    </span>
    {children}
  </div>
);

export const PassengerFields = ({
  variant,
  index,
  pax,
  readOnly,
  isCounter,
  isDuplicate,
  allNationalities,
  allAgencies,
  loadingClients,
  onChangeField,
  onNationalitySelect,
  onOpenNewAgency,
  onRemove,
}: PassengerFieldsProps) => {
  const isTable = variant === "table";
  const controlHeight = isTable ? "h-8 text-xs" : "h-9 text-sm";

  const nameControl = (
    <Input
      value={pax.full_name}
      disabled={readOnly}
      placeholder="Ej. PÉREZ JUAN"
      onChange={(e) => onChangeField(index, "full_name", e.target.value)}
      className={`${controlHeight} font-medium uppercase ${isTable ? "" : "text-center"}`}
    />
  );

  const nationalityControl = (
    <Select
      value={pax.nationality}
      disabled={readOnly}
      onValueChange={(val) => onNationalitySelect(index, val)}
    >
      <SelectTrigger className={`${controlHeight} text-center font-medium`}>
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
              .filter((n) => n !== "VENEZOLANO" && n !== "EXTRANJERO")
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
  );

  const idNumberControl = (
    <Input
      value={pax.id_number}
      disabled={readOnly}
      placeholder="V-12345678"
      onChange={(e) => onChangeField(index, "id_number", e.target.value)}
      className={`${controlHeight} text-center uppercase ${
        isDuplicate ? "border-destructive focus-visible:ring-destructive" : ""
      }`}
    />
  );

  const luggageControl = (
    <Input
      type="text"
      disabled={readOnly}
      placeholder="Equipaje"
      value={pax.luggage_weight ?? ""}
      onChange={(e) => onChangeField(index, "luggage_weight", e.target.value)}
      className={`${controlHeight} text-center uppercase font-medium`}
    />
  );

  const bodyWeightControl = (
    <Input
      type="number"
      step="0.01"
      min="0"
      disabled={readOnly}
      placeholder="0.00"
      value={pax.body_weight ?? ""}
      onChange={(e) =>
        onChangeField(
          index,
          "body_weight",
          e.target.value === "" ? null : Number(e.target.value),
        )
      }
      className={`${controlHeight} text-center font-mono`}
    />
  );

  const lodgeControl = (
    <Select
      value={normalizeLodgeValue(pax.lodge_type)}
      disabled={readOnly}
      onValueChange={(val) =>
        onChangeField(index, "lodge_type", val as LodgeType)
      }
    >
      <SelectTrigger className={controlHeight}>
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
  );

  const agencyControl = (
    <AgencyCombobox
      value={pax.agency || ""}
      disabled={readOnly}
      agencies={allAgencies}
      loading={loadingClients}
      onChange={(val) => onChangeField(index, "agency", val)}
      onOpenNewModal={() => onOpenNewAgency(index)}
      isTable={isTable}
    />
  );

  const paymentMethodControl = (
    <Input
      disabled={readOnly}
      placeholder="FP"
      value={pax.payment_method ?? ""}
      onChange={(e) => onChangeField(index, "payment_method", e.target.value)}
      className={`${controlHeight} text-center uppercase font-mono`}
    />
  );

  const amountPaidControl = (
    <Input
      type="number"
      step="0.01"
      min="0"
      disabled={readOnly}
      placeholder="0.00"
      value={pax.amount_paid ?? ""}
      onChange={(e) =>
        onChangeField(
          index,
          "amount_paid",
          e.target.value === "" ? null : Number(e.target.value),
        )
      }
      className={`${controlHeight} text-center font-mono`}
    />
  );

  const returnControl = (
    <Checkbox
      checked={Boolean(pax.return_flight)}
      disabled={readOnly}
      onCheckedChange={(checked) =>
        onChangeField(index, "return_flight", Boolean(checked))
      }
    />
  );

  const removeButton = (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={() => onRemove(index)}
      className={`${isTable ? "h-7 w-7" : "h-8 w-8"} text-destructive hover:text-destructive/80`}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );

  if (variant === "table") {
    return (
      <>
        <td className="py-1.5 px-2 text-center font-bold text-muted-foreground">
          {pax.seat_number}
        </td>
        <td className="py-1.5 px-2">{nameControl}</td>
        <td className="py-1.5 px-2">{nationalityControl}</td>
        <td className="py-1.5 px-2">{idNumberControl}</td>
        {isCounter && (
          <>
            <td className="py-1.5 px-2">{luggageControl}</td>
            <td className="py-1.5 px-2">{bodyWeightControl}</td>
          </>
        )}
        <td className="py-1.5 px-2">{lodgeControl}</td>
        <td className="py-1.5 px-2">{agencyControl}</td>
        {isCounter && (
          <>
            <td className="py-1.5 px-2">{paymentMethodControl}</td>
            <td className="py-1.5 px-2">{amountPaidControl}</td>
            <td className="py-1.5 px-2 text-center">
              <div className="flex justify-center items-center h-8">
                {returnControl}
              </div>
            </td>
          </>
        )}
        {!readOnly && (
          <td className="py-1.5 px-2 text-center">{removeButton}</td>
        )}
      </>
    );
  }

  return (
    // `relative` contiene el <select> nativo oculto de Radix (position:absolute),
    // igual que en el wrapper de la tabla, para que no escape al documento.
    <div
      data-pax-card={pax.seat_number}
      className="relative flex scroll-mt-20 flex-col gap-3 rounded-lg border p-3.5"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">Asiento {pax.seat_number}</span>
        {!readOnly && removeButton}
      </div>

      <CardField label="Nombre Completo *">{nameControl}</CardField>

      <div className="grid grid-cols-2 gap-3">
        <CardField label="Nacionalidad *">{nationalityControl}</CardField>
        <CardField label="Cédula / ID *">{idNumberControl}</CardField>
      </div>

      <CardField label="Tipo (LODGE) *">{lodgeControl}</CardField>

      <CardField label="Agencia / Cliente">{agencyControl}</CardField>

      {isCounter && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <CardField label="Luggage">{luggageControl}</CardField>
            <CardField label="W (Kg)">{bodyWeightControl}</CardField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <CardField label="FP">{paymentMethodControl}</CardField>
            <CardField label="Monto ($)">{amountPaidControl}</CardField>
          </div>

          <div className="flex items-center gap-2 rounded-md border px-3 py-2">
            {returnControl}
            <span className="text-sm font-medium">Return</span>
          </div>
        </>
      )}
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
  isTable?: boolean;
}

const AgencyCombobox = ({
  value,
  onChange,
  disabled = false,
  agencies,
  loading = false,
  onOpenNewModal,
  isTable = false,
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
          type="button"
          variant="outline"
          role="combobox"
          disabled={disabled}
          className={`${
            isTable ? "h-8 text-xs px-2.5" : "h-9 text-sm px-3"
          } w-full justify-between font-normal bg-background`}
        >
          <span className="truncate">
            {value || (
              <span className="text-muted-foreground italic">
                Sin Agencia (—)
              </span>
            )}
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
                    <Plus className="h-3 w-3 mr-1" /> Usar &quot;{searchUpper}
                    &quot;
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
                <span className="italic text-muted-foreground">
                  Sin Agencia (—)
                </span>
                {!value && <Check className="h-3 w-3 text-primary" />}
              </CommandItem>
            </CommandGroup>

            <CommandSeparator />

            <CommandGroup
              heading={
                loading
                  ? "Cargando clientes..."
                  : "Clientes / Agencias Registradas"
              }
            >
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
                  {value === agency && (
                    <Check className="h-3 w-3 text-primary" />
                  )}
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
