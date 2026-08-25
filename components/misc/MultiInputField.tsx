'use client';

import { useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  fieldClass,
  hintClass,
  labelClass,
} from '@/components/forms/mantenimiento/almacen/_components/form-theme';

type Props = {
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  /** Rótulo propio. Se omite cuando el campo ya vive dentro de un FormItem. */
  label?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  normalize?: (s: string) => string;
  delimiters?: string[];
  maxItems?: number;
};

export const MultiInputField = ({
  values,
  onChange,
  placeholder = 'Ej: 234ABAC',
  label,
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
    if ((key === 'enter' || key === 'tab') && inputValue.trim()) {
      e.preventDefault();
      addValue();
      return;
    }
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
      {label && <label className={labelClass}>{label}</label>}

      <div className="flex gap-2">
        <Input
          ref={inputRef}
          value={inputValue}
          disabled={disabled}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={placeholder}
          className={cn(fieldClass, 'flex-1')}
        />
        <Button
          type="button"
          variant="outline"
          onClick={addValue}
          disabled={disabled || !inputValue.trim()}
          className={cn(fieldClass, 'shrink-0 px-4')}
        >
          Agregar
        </Button>
      </div>

      {values.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {values.map((value, index) => (
            <Badge
              key={`${value}-${index}`}
              variant="secondary"
              className="flex max-w-full items-center gap-1 rounded-md py-1 pl-2.5 pr-1.5 text-[13px] font-normal"
            >
              <span className="truncate">{value}</span>
              <button
                type="button"
                onClick={() => removeValue(index)}
                disabled={disabled}
                aria-label={`Quitar ${value}`}
                className="inline-flex h-4 w-4 items-center justify-center rounded hover:bg-foreground/10"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      <p className={hintClass}>
        {values.length === 0
          ? 'Escriba y presione Enter para agregar.'
          : typeof maxItems === 'number'
            ? `${values.length} de ${maxItems} agregados.`
            : `${values.length} agregado${values.length === 1 ? '' : 's'}.`}
      </p>
    </div>
  );
};