"use client";

import { AnimatePresence, motion } from "motion/react";
import { Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties, Ref } from "react";
import { createPortal } from "react-dom";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { quoteInputClass } from "./quote-field";

export interface Suggestion {
  key: string | number;
  label: string;
  /** Línea secundaria (p. ej. el último costo registrado). */
  hint?: string;
}

const MAX_VISIBLE = 6;

const normalize = (value: string | null | undefined) =>
  (value ?? "").trim().toLowerCase();

/**
 * Campo de texto libre con sugerencias. La lista solo propone: escribir otra
 * cosa es válido. Se dibuja en el `body` (con posición fija) para no recortarse
 * dentro de las tarjetas con `overflow-hidden`, y por eso necesita
 * `pointer-events-auto`: un diálogo modal deja el resto de la página sin
 * eventos y, sin esto, las opciones no se podrían tocar.
 *
 * La lista no desplaza (máximo seis): el bloqueo de scroll del diálogo
 * también impide desplazar lo que vive fuera de él.
 */
export function SuggestInput({
  value,
  onChange,
  onBlur,
  inputRef,
  suggestions,
  onPick,
  disabled,
  invalid,
  hideExactMatch,
  placeholder = "N/A",
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  inputRef: Ref<HTMLInputElement>;
  suggestions: Suggestion[];
  onPick: (suggestion: Suggestion) => void;
  disabled?: boolean;
  invalid?: boolean | string;
  /** Oculta la sugerencia idéntica a lo escrito: ya no aporta nada. */
  hideExactMatch?: boolean;
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const anchorRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<CSSProperties>({});

  const typed = normalize(value);
  const matching = suggestions.filter((suggestion) => {
    const label = normalize(suggestion.label);
    if (hideExactMatch && label === typed) return false;
    return label.includes(typed);
  });
  const visible = matching.slice(0, MAX_VISIBLE);
  const hidden = matching.length - visible.length;

  const showDropdown = open && !disabled && visible.length > 0;
  const hasSuggestions = suggestions.length > 0;

  useEffect(() => {
    if (!showDropdown || !anchorRef.current) return;

    function reposition() {
      if (!anchorRef.current) return;
      const rect = anchorRef.current.getBoundingClientRect();
      // Sin espacio debajo (campo al pie de la pantalla o con teclado
      // abierto) la lista se abre hacia arriba.
      const below = window.innerHeight - rect.bottom;
      const openUp = below < 220 && rect.top > below;

      setStyle({
        position: "fixed",
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
        ...(openUp
          ? { bottom: window.innerHeight - rect.top + 4 }
          : { top: rect.bottom + 4 }),
      });
    }

    reposition();
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [showDropdown]);

  const pick = (suggestion: Suggestion) => {
    onPick(suggestion);
    setOpen(false);
    setActive(-1);
  };

  return (
    <div ref={anchorRef} className="relative">
      <Input
        ref={inputRef}
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          setActive(-1);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          // Se espera un instante para que el toque sobre una opción llegue
          // antes de que la lista desaparezca.
          setTimeout(() => {
            setOpen(false);
            setActive(-1);
            onBlur();
          }, 150);
        }}
        onKeyDown={(event) => {
          if (!showDropdown) return;

          if (event.key === "ArrowDown") {
            event.preventDefault();
            setActive((current) => (current + 1) % visible.length);
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActive((current) =>
              current <= 0 ? visible.length - 1 : current - 1,
            );
          } else if (event.key === "Enter" && active >= 0) {
            // Sin esto Enter enviaría el formulario entero.
            event.preventDefault();
            pick(visible[active]);
          }
        }}
        placeholder={placeholder}
        disabled={disabled}
        role="combobox"
        aria-expanded={showDropdown}
        aria-autocomplete="list"
        autoComplete="off"
        className={cn(
          quoteInputClass,
          hasSuggestions && "pr-7",
          invalid && "border-destructive/60 ring-1 ring-destructive/30",
          className,
        )}
      />

      {hasSuggestions && (
        <Sparkles
          aria-hidden
          className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-primary opacity-70"
        />
      )}

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {showDropdown && (
              <motion.div
                key="suggestions"
                role="listbox"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4, pointerEvents: "none" }}
                transition={{ duration: 0.1 }}
                style={style}
                className="pointer-events-auto min-w-44 overflow-hidden rounded-lg border border-border bg-popover p-1 shadow-md"
              >
                {visible.map((suggestion, index) => (
                  <button
                    key={suggestion.key}
                    type="button"
                    role="option"
                    aria-selected={index === active}
                    onPointerDown={(event) => {
                      event.preventDefault();
                      pick(suggestion);
                    }}
                    className={cn(
                      "flex w-full flex-col gap-0.5 rounded-md px-2.5 py-2 text-left text-[13px] hover:bg-accent hover:text-accent-foreground max-sm:py-3",
                      index === active && "bg-accent text-accent-foreground",
                    )}
                  >
                    <span className="font-medium leading-snug wrap-anywhere">
                      {suggestion.label}
                    </span>
                    {suggestion.hint && (
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {suggestion.hint}
                      </span>
                    )}
                  </button>
                ))}

                {hidden > 0 && (
                  <p className="px-2.5 py-1.5 text-xs text-muted-foreground">
                    {hidden} más: siga escribiendo para acotar.
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
}
