"use client";

import { AlertCircle } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  INDIVIDUAL_TYPE_HINT,
  INDIVIDUAL_TYPE_LABEL,
  parseIdentifiers,
  repeatedIdentifiers,
  type IndividualType,
} from "@/types/general-article-individual";
import { fieldClass, selectTriggerClass } from "./form-theme";
import { TokenList } from "./TokenList";

export interface IndividualIdentifiersDraft {
  type: IndividualType | "";
  /** Identificadores agregados, uno por línea. */
  text: string;
}

export const EMPTY_INDIVIDUALS_DRAFT: IndividualIdentifiersDraft = {
  type: "",
  text: "",
};

/**
 * Lo que se envía al backend, o null si todavía no hay con qué. Se usa con el
 * mismo criterio al confirmar una entrada y al identificar artículos individuales después.
 */
export function individualsPayload(draft: IndividualIdentifiersDraft) {
  const identifiers = parseIdentifiers(draft.text);

  if (!draft.type || identifiers.length === 0) return null;

  return { type: draft.type, identifiers };
}

/** Por qué el borrador no puede enviarse todavía, o null si está listo. */
export function individualsDraftError(
  draft: IndividualIdentifiersDraft,
  max: number,
): string | null {
  const identifiers = parseIdentifiers(draft.text);

  if (identifiers.length === 0) return null;
  if (!draft.type) return "Seleccione el tipo.";

  const repeated = repeatedIdentifiers(identifiers);
  if (repeated.length > 0) {
    return `Repetidos: ${repeated.slice(0, 3).join(", ")}${repeated.length > 3 ? "…" : ""}.`;
  }

  if (identifiers.length > max) {
    return `Máximo ${max}. Quite ${identifiers.length - max}.`;
  }

  return null;
}

interface Props {
  draft: IndividualIdentifiersDraft;
  onChange: (next: IndividualIdentifiersDraft) => void;
  types: IndividualType[];
  /** Si el artículo ya tiene individuales, su tipo no cambia. */
  lockedType?: IndividualType | null;
  /** Cuántos artículos pueden identificarse en esta operación. */
  max: number;
  disabled?: boolean;
  /** Mensaje de error del servidor, ya traducido. */
  serverError?: string | null;
  /** Aspecto de los campos; por defecto el de los formularios de almacén. */
  fieldClassName?: string;
}

const normalize = (value: string) => value.trim().toUpperCase();

/**
 * Captura de artículos individuales: el tipo y un identificador por unidad
 * (serial del fabricante o correlativo rotulado). Mismo gesto que los seriales
 * de un artículo por lote —escribir, Enter, insignia quitable—, pero aquí el
 * sistema no crea artículos nuevos: marca cuáles de los que entran se controlan
 * uno por uno. El sistema no genera identificadores.
 */
export function IndividualIdentifiersField({
  draft,
  onChange,
  types,
  lockedType,
  max,
  disabled,
  serverError,
  fieldClassName,
}: Props) {
  const inputClass = fieldClassName ?? fieldClass;
  const selectClass = fieldClassName ?? selectTriggerClass;
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const identifiers = parseIdentifiers(draft.text);
  const error = individualsDraftError(draft, max) ?? serverError ?? null;
  const full = identifiers.length >= max;

  const commit = (next: string[]) => onChange({ ...draft, text: next.join("\n") });

  const addMany = (raw: string[]) => {
    const next = [...identifiers];
    for (const value of raw.map(normalize).filter(Boolean)) {
      if (!next.some((item) => item.toUpperCase() === value)) next.push(value);
    }
    commit(next);
  };

  const add = () => {
    if (!inputValue.trim()) return;
    addMany([inputValue]);
    setInputValue("");
    inputRef.current?.focus();
  };

  const remove = (index: number) => {
    commit(identifiers.filter((_, i) => i !== index));
    inputRef.current?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (event.key === "Enter") {
      event.preventDefault();
      add();
      return;
    }

    if (event.key === "Backspace" && !inputValue && identifiers.length) {
      event.preventDefault();
      remove(identifiers.length - 1);
    }
  };

  // Una columna pegada desde una hoja de cálculo se agrega completa.
  const handlePaste: React.ClipboardEventHandler<HTMLInputElement> = (event) => {
    const pasted = parseIdentifiers(event.clipboardData.getData("text"));
    if (pasted.length <= 1) return;

    event.preventDefault();
    addMany(pasted);
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label className="text-[13px] font-medium">Tipo</Label>
        {lockedType ? (
          <p className="text-sm font-medium">{INDIVIDUAL_TYPE_LABEL[lockedType]}</p>
        ) : (
          <Select
            disabled={disabled}
            value={draft.type}
            onValueChange={(value) =>
              onChange({ ...draft, type: value as IndividualType })
            }
          >
            <SelectTrigger className={selectClass}>
              <span
                className={cn("truncate", !draft.type && "text-muted-foreground")}
              >
                {draft.type
                  ? INDIVIDUAL_TYPE_LABEL[draft.type]
                  : "Seleccione el tipo"}
              </span>
            </SelectTrigger>
            <SelectContent>
              {types.map((type) => (
                <SelectItem key={type} value={type}>
                  <span className="block">{INDIVIDUAL_TYPE_LABEL[type]}</span>
                  <span className="block text-xs text-muted-foreground">
                    {INDIVIDUAL_TYPE_HINT[type]}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <Label className="text-[13px] font-medium">Identificador</Label>
          <span className="text-xs tabular-nums text-muted-foreground">
            {identifiers.length} de {max}
          </span>
        </div>

        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={inputValue}
            disabled={disabled || full}
            onChange={(event) => setInputValue(event.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder="Ej: SN-0001"
            aria-invalid={!!error}
            className={cn(inputClass, "flex-1")}
          />
          <Button
            type="button"
            variant="outline"
            onClick={add}
            disabled={disabled || full || !inputValue.trim()}
            className={cn(inputClass, "shrink-0 px-4")}
          >
            Agregar
          </Button>
        </div>

        <TokenList
          values={identifiers}
          onRemove={remove}
          disabled={disabled}
          numbered
        />

        {!error && identifiers.length === 0 && (
          <p className="text-xs text-muted-foreground">
            Escriba el identificador de cada artículo y presione Enter.
          </p>
        )}

        {error && (
          <p className="flex items-start gap-1.5 text-xs text-destructive">
            <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
