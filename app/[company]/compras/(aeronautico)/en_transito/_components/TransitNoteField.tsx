"use client";

import { useRef } from "react";
import { Plus } from "lucide-react";

import { textareaClass } from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import { Textarea } from "@/components/ui/textarea";
import {
  TRANSIT_UPDATE_NOTE_MAX,
  TRANSIT_UPDATE_SUGGESTIONS,
  appendSuggestion,
  suggestionLabel,
} from "@/lib/purchases/transit-updates";
import { cn } from "@/lib/utils";

interface Props {
  id: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  rows?: number;
  placeholder?: string;
  /** Frases sugeridas bajo el cuadro, como las respuestas rápidas de un chat. */
  suggestions?: boolean;
}

/**
 * Cuadro de texto de una novedad. Las sugerencias no se eligen aparte: al
 * pulsar una se escribe en el texto, donde se puede seguir editando. Las que ya
 * están escritas dejan de ofrecerse. Bajo el cuadro, el contador de caracteres
 * (cambia de color cerca del límite).
 */
export function TransitNoteField({
  id,
  value,
  onChange,
  disabled,
  rows = 3,
  placeholder,
  suggestions = true,
}: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const available = TRANSIT_UPDATE_SUGGESTIONS.filter(
    (suggestion) => !value.includes(suggestion),
  );
  const showSuggestions = suggestions && available.length > 0;
  const nearLimit = value.length >= TRANSIT_UPDATE_NOTE_MAX * 0.9;

  const insert = (suggestion: string) => {
    const next = appendSuggestion(value, suggestion);
    onChange(next);

    // El cursor al final: quien toca una sugerencia sigue escribiendo a partir de ella.
    requestAnimationFrame(() => {
      const field = ref.current;
      if (!field) return;
      field.focus();
      field.setSelectionRange(next.length, next.length);
    });
  };

  return (
    <div className="space-y-2">
      <Textarea
        ref={ref}
        id={id}
        rows={rows}
        maxLength={TRANSIT_UPDATE_NOTE_MAX}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className={cn(textareaClass, "max-sm:text-base")}
      />

      <div className="flex items-center justify-between gap-3">
        <span className="text-[13px] text-muted-foreground">
          {showSuggestions ? "Sugerencias" : ""}
        </span>
        <span
          className={cn(
            "text-[13px] tabular-nums",
            nearLimit
              ? "font-medium text-amber-600 dark:text-amber-400"
              : "text-muted-foreground",
          )}
        >
          {value.length}/{TRANSIT_UPDATE_NOTE_MAX}
        </span>
      </div>

      {showSuggestions && (
        <div
          role="group"
          aria-label="Sugerencias"
          className="-mt-0.5 flex flex-wrap gap-2"
        >
          {available.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              disabled={disabled}
              onClick={() => insert(suggestion)}
              className={cn(
                "flex min-h-8 items-center gap-1.5 rounded-lg border px-2.5 py-1 text-left text-[13px] transition-colors duration-200 max-sm:min-h-10 max-sm:text-sm",
                "border-slate-300/80 bg-background/40 text-foreground/80 hover:border-blue-400/40 hover:bg-primary/3 hover:text-foreground dark:border-slate-600/60",
                "disabled:cursor-not-allowed disabled:opacity-50",
              )}
            >
              <Plus className="size-3 shrink-0 text-muted-foreground" />
              {suggestionLabel(suggestion)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
