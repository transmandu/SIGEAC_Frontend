"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { useGetProductSuggestions } from "@/hooks/operaciones/cargo/useGetProductSuggestions";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface ProductAutocompleteInputProps {
  company: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function ProductAutocompleteInput({
  company,
  value,
  onChange,
  placeholder = "Ej. BOLSA CON GRIFO",
  className,
}: ProductAutocompleteInputProps) {
  const [search, setSearch] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [dropdownStyle, setDropdownStyle] = useState({
    position: "fixed" as const,
    top: 0,
    left: 0,
    width: 0,
    zIndex: 9999,
  });

  const { data: suggestions, isLoading } = useGetProductSuggestions(
    company,
    search,
  );

  // Calcular posición del dropdown basada en el input
  const updateDropdownPosition = useCallback(() => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: "fixed",
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
      });
    }
  }, []);

  // Efecto para cerrar al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Efecto para actualizar posición cuando se abre el dropdown
  useEffect(() => {
    if (isOpen) {
      updateDropdownPosition();
      window.addEventListener("scroll", updateDropdownPosition, true);
      window.addEventListener("resize", updateDropdownPosition);
      return () => {
        window.removeEventListener("scroll", updateDropdownPosition, true);
        window.removeEventListener("resize", updateDropdownPosition);
      };
    }
  }, [isOpen, updateDropdownPosition]);

  const handleSelect = (product: string) => {
    const upperProduct = product.toUpperCase();
    onChange(upperProduct);
    setSearch(upperProduct);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.toUpperCase();
    setSearch(newValue);
    onChange(newValue);
    setIsOpen(true);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <Input
        data-tour="cargo-crear-items-producto"
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        className={cn(
          "bg-transparent h-8 text-sm focus-visible:bg-background uppercase",
          className,
        )}
        value={search}
        onChange={handleInputChange}
        onFocus={() => {
          setIsOpen(true);
          updateDropdownPosition();
        }}
        autoComplete="off"
      />

      {/* Dropdown con position: fixed para escapar de overflow-hidden */}
      {isOpen && search.length >= 2 && (
        <div
          style={dropdownStyle}
          className="bg-popover border border-border rounded-md shadow-lg max-h-[200px] overflow-y-auto"
        >
          {isLoading ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              Buscando...
            </div>
          ) : suggestions && suggestions.length > 0 ? (
            suggestions.map((product) => (
              <div
                key={product}
                className={cn(
                  "px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground flex items-center justify-between",
                  product === value && "bg-accent",
                )}
                onClick={() => handleSelect(product)}
              >
                <span className="truncate">{product}</span>
                {product === value && (
                  <Check className="h-3 w-3 text-primary shrink-0" />
                )}
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              No se encontraron productos.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
