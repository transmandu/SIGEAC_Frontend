'use client';

import { useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
  /** Normaliza cada item antes de guardar. Por defecto: trim + uppercase */
  normalize?: (s: string) => string;
  /** Separadores para pegar múltiples: ej. "A, B; C" */
  delimiters?: string[];
  /** Máximo de items (opcional) */
  maxItems?: number;
};

export const MultiInputField = ({
  values,
  onChange,
  placeholder = 'Ej: 234ABAC',
  label = 'Nros. alternos',
  disabled = false,
  className,
  normalize = (s) => s.trim().toUpperCase(),
  delimiters = [',', ';', '\n', '\t'],
  maxItems,
}: Props) => {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  const set = useMemo(() => new Set(values.map((v) => normalize(v))), [values, normalize]);

  const splitByDelimiters = (raw: string) => {
    if (!raw) return [];
    const regex = new RegExp(`[${delimiters.map((d) => `\\${d}`).join('')}]`, 'g');
    return raw.split(regex).map(normalize).filter(Boolean);
  };

  const commit = (items: string[]) => {
    if (!items.length) return;
    const current = [...values];
    for (const item of items) {
      if (maxItems && current.length >= maxItems) break;
      if (!set.has(normalize(item))) current.push(normalize(item));
    }
    if (current.length !== values.length) onChange(current);
  };

  const addValue = () => {
    const items = splitByDelimiters(inputValue);
    commit(items.length ? items : [inputValue]);
    setInputValue('');
    inputRef.current?.focus();
  };

  const removeValue = (index: number) => {
    const next = values.filter((_, i) => i !== index);
    onChange(next);
    inputRef.current?.focus();
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (disabled) return;
    const key = e.key.toLowerCase();

    // Enter o Tab para agregar
    if ((key === 'enter' || key === 'tab') && inputValue.trim()) {
      e.preventDefault();
      addValue();
      return;
    }

    // Backspace con input vacío -> elimina último
    if (key === 'backspace' && !inputValue && values.length) {
      e.preventDefault();
      removeValue(values.length - 1);
    }
  };

  const handlePaste: React.ClipboardEventHandler<HTMLInputElement> = (e) => {
    const text = e.clipboardData.getData('text');
    const items = splitByDelimiters(text);
    if (items.length) {
      e.preventDefault();
      commit(items);
    }
  };

  return (
    <div className={cn('w-full space-y-2', className)}>
      {label && <label className="text-sm font-medium text-foreground">{label}</label>}

      {/* Contenedor con foco visible */}
      <div>
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={inputValue}
            disabled={disabled}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={placeholder}
            className="flex-1"
            aria-label="Agregar número alterno"
          />
          <Button type="button" onClick={addValue} disabled={disabled || !inputValue.trim()}>
            Agregar
          </Button>
        </div>

        {/* Chips */}
        <div className="mt-3 flex flex-wrap gap-2">
          {values.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Presiona Enter o Tab para agregar. Acepta coma, punto y coma y salto de línea.
            </p>
          ) : (
            values.map((value, index) => (
              <Badge
                key={`${value}-${index}`}
                variant="secondary"
                className="group flex max-w-full items-center gap-1 rounded-full px-2 py-1 text-xs"
              >
                <span className="truncate">{value}</span>
                <button
                  type="button"
                  aria-label={`Quitar ${value}`}
                  onClick={() => removeValue(index)}
                  className="ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-foreground/10"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </Badge>
            ))
          )}
        </div>

        {/* Límite opcional */}
        {typeof maxItems === 'number' && (
          <div className="mt-2 text-right text-xs text-muted-foreground">
            {values.length}/{maxItems}
          </div>
        )}
      </div>
    </div>
  );
};
