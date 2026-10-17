"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import type { CountryCode } from "libphonenumber-js/max";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  fieldClass,
  triggerButtonClass,
} from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import {
  DEFAULT_PHONE_COUNTRY,
  composePhone,
  formatNationalInput,
  getFeaturedPhoneCountries,
  getPhoneCountries,
  phoneDial,
  phonePlaceholder,
  readInternational,
  splitPhone,
  type PhoneCountryOption,
} from "@/lib/phone";
import { cn } from "@/lib/utils";

export interface PhoneInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "defaultValue" | "onChange" | "type"
> {
  /** Teléfono en E.164 (`+584141234567`) o vacío. */
  value?: string | null;
  /** Recibe el E.164 de lo escrito, o `""` si el campo queda vacío. */
  onChange: (value: string) => void;
  /** País que se preselecciona cuando no hay valor. */
  defaultCountry?: CountryCode;
}

/**
 * Campo de teléfono estándar del sistema: selector de país con su código
 * internacional + número nacional que se formatea al escribir según el país.
 * Al formulario siempre le entrega E.164, el mismo formato que guarda el backend.
 */
export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  (
    {
      value,
      onChange,
      defaultCountry = DEFAULT_PHONE_COUNTRY,
      disabled,
      className,
      onBlur,
      "aria-invalid": ariaInvalid,
      ...inputProps
    },
    ref,
  ) => {
    const initial = React.useMemo(
      () => splitPhone(value, defaultCountry),
      // Solo el valor con el que nace: lo demás lo mantiene el estado.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [],
    );
    const [country, setCountry] = React.useState<CountryCode>(initial.country);
    const [national, setNational] = React.useState(initial.national);
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState("");

    // Lo último que emitió este campo: distingue el eco de lo que el usuario
    // escribe de un cambio venido de fuera (un reset, cargar el registro).
    const lastEmitted = React.useRef(value ?? "");

    React.useEffect(() => {
      const incoming = value ?? "";
      if (incoming === lastEmitted.current) return;

      lastEmitted.current = incoming;

      if (incoming === "") {
        setNational("");
        return;
      }

      const next = splitPhone(incoming, defaultCountry);
      setCountry(next.country);
      setNational(next.national);
    }, [value, defaultCountry]);

    const emit = (nextCountry: CountryCode, digits: string) => {
      const composed = composePhone(nextCountry, digits);
      lastEmitted.current = composed;
      onChange(composed);
    };

    const handleNationalChange = (
      event: React.ChangeEvent<HTMLInputElement>,
    ) => {
      const raw = event.target.value;

      // Un número con código internacional (`+57 300…`, pegado o tecleado)
      // cambia el país. Mientras el código está incompleto (`+`, `+5`) se deja
      // lo escrito tal cual y el valor queda vacío, para no perder el `+`.
      if (raw.trim().startsWith("+")) {
        const international = readInternational(raw);

        if (international) {
          setCountry(international.country);
          setNational(
            formatNationalInput(international.country, international.digits),
          );
          emit(international.country, international.digits);
        } else {
          setNational(raw.replace(/[^\d+]/g, ""));
          emit(country, "");
        }
        return;
      }

      const digits = raw.replace(/\D/g, "");
      setNational(formatNationalInput(country, digits));
      emit(country, digits);
    };

    const handleCountrySelect = (option: PhoneCountryOption) => {
      setCountry(option.code);
      setNational(formatNationalInput(option.code, national));
      emit(option.code, national);
      setOpen(false);
      setQuery("");
    };

    const featured = React.useMemo(() => getFeaturedPhoneCountries(), []);
    const all = React.useMemo(() => getPhoneCountries(), []);

    const renderOption = (option: PhoneCountryOption, prefix: string) => (
      <CommandItem
        key={`${prefix}-${option.code}`}
        value={`${option.name} ${option.code} ${option.dial} ${prefix}`}
        onSelect={() => handleCountrySelect(option)}
      >
        <Check
          className={cn(
            "mr-2 size-4",
            option.code === country ? "opacity-100" : "opacity-0",
          )}
        />
        <span className="truncate">{option.name}</span>
        <span className="ml-auto pl-3 text-xs tabular-nums text-muted-foreground">
          {option.dial}
        </span>
      </CommandItem>
    );

    return (
      // `flex-wrap`: si el espacio no alcanza para el país y el formato
      // completo del número, el número baja a su propia línea con todo el
      // ancho, en vez de quedar cortado.
      <div className={cn("flex flex-wrap gap-2", className)}>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              role="combobox"
              aria-label="País del teléfono"
              aria-invalid={ariaInvalid}
              disabled={disabled}
              className={cn(
                triggerButtonClass,
                "w-auto min-w-24 shrink-0 gap-1.5 px-2.5",
              )}
            >
              <span className="font-medium">{country}</span>
              <span className="tabular-nums text-muted-foreground">
                {phoneDial(country)}
              </span>
              <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-0" align="start">
            <Command>
              <CommandInput
                placeholder="Buscar país o código..."
                value={query}
                onValueChange={setQuery}
              />
              <CommandList>
                <CommandEmpty>No se encontró el país.</CommandEmpty>
                {/* Al buscar, los frecuentes ya salen en la lista completa. */}
                {!query && (
                  <CommandGroup heading="Frecuentes">
                    {featured.map((option) => renderOption(option, "f"))}
                  </CommandGroup>
                )}
                <CommandGroup heading={query ? undefined : "Todos los países"}>
                  {all.map((option) => renderOption(option, "a"))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <Input
          {...inputProps}
          ref={ref}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          disabled={disabled}
          aria-invalid={ariaInvalid}
          placeholder={phonePlaceholder(country) || inputProps.placeholder}
          value={national}
          onChange={handleNationalChange}
          onBlur={onBlur}
          // 8.5rem: lo que ocupa el formato más largo habitual (`(305)
          // 555-0123`) sin cortarse. Con menos, el campo baja de línea.
          className={cn(
            fieldClass,
            "min-w-34 flex-1 basis-34 px-2.5 tabular-nums placeholder:text-muted-foreground/60",
          )}
        />
      </div>
    );
  },
);

PhoneInput.displayName = "PhoneInput";
