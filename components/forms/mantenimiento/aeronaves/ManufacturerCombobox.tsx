"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FormControl, FormDescription, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCreateManufacturer } from "@/actions/general/fabricantes/actions"
import { useCompanyStore } from "@/stores/CompanyStore"
import { Manufacturer } from "@/types"

interface ManufacturerComboboxProps {
  value: string | undefined
  onChange: (value: string) => void
  manufacturers?: Manufacturer[]
  isLoading?: boolean
  isError?: boolean
  label?: string
  description?: string
  placeholder?: string
  filterType?: "AIRCRAFT" | "ENGINE" | "APU" | "PROPELLER" | "GENERAL" | "ALL"
  showTypeSelector?: boolean
  disabled?: boolean
}

export function ManufacturerCombobox({
  value,
  onChange,
  manufacturers,
  isLoading = false,
  isError = false,
  label = "Fabricante",
  description,
  placeholder = "Seleccionar o crear fabricante...",
  filterType = "ALL",
  showTypeSelector = false,
  disabled = false,
}: ManufacturerComboboxProps) {
  const { selectedCompany } = useCompanyStore()
  const { createManufacturer } = useCreateManufacturer()
  
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newManufacturerType, setNewManufacturerType] = useState<"ENGINE" | "APU" | "PROPELLER" | "GENERAL">("GENERAL")
  const [newManufacturerDescription, setNewManufacturerDescription] = useState("")

  // Filtrar fabricantes según el tipo
  const filteredManufacturers = manufacturers?.filter((m) => {
    if (filterType === "ALL") return true
    if (filterType === "AIRCRAFT") return m.type === "AIRCRAFT"
    
    // Excluir fabricantes de aeronaves para partes
    if (m.type === "AIRCRAFT") return false
    
    // Si se especifica un tipo de parte (ENGINE, APU, PROPELLER)
    if (filterType === "ENGINE" || filterType === "APU" || filterType === "PROPELLER") {
      return m.type === filterType || m.type === "GENERAL"
    }
    
    // Para partes sin categoría específica, mostrar solo GENERAL
    return m.type === "GENERAL"
  }) || []

  const handleCreate = async () => {
    if (!searchValue.trim()) return
    
    try {
      const manufacturerType = filterType === "AIRCRAFT" ? "AIRCRAFT" : newManufacturerType
      
      const result = await createManufacturer.mutateAsync({
        company: selectedCompany?.slug,
        data: {
          name: searchValue,
          type: manufacturerType,
          description: newManufacturerDescription || `Fabricante ${manufacturerType}`,
        }
      })
      
      // Si el backend devuelve el ID, usarlo; de lo contrario, usar el nombre
      if (result?.id) {
        onChange(result.id.toString())
      } else {
        onChange(searchValue)
      }
      
      // Cerrar y resetear
      setOpen(false)
      setShowCreateForm(false)
      setSearchValue("")
      setNewManufacturerDescription("")
      setNewManufacturerType("GENERAL")
    } catch (error) {
      console.error("Error al crear fabricante:", error)
    }
  }

  return (
    <FormItem className="flex flex-col">
      <FormLabel>{label}</FormLabel>
      <Popover open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen)
        if (!isOpen) {
          setShowCreateForm(false)
          setSearchValue("")
          setNewManufacturerDescription("")
          setNewManufacturerType("GENERAL")
        }
      }}>
        <PopoverTrigger asChild>
          <FormControl>
            <Button
              disabled={disabled || isLoading || isError}
              variant="outline"
              role="combobox"
              className={cn(
                "justify-between",
                !value && "text-muted-foreground"
              )}
            >
              {isLoading && <Loader2 className="size-4 animate-spin mr-2" />}
              {value
                ? manufacturers?.find((m) => m.id.toString() === value || m.name === value)?.name
                : placeholder
              }
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput 
              placeholder="Buscar o escribir..." 
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandList>
              <CommandEmpty>
                <div className="p-3">
                  {!showCreateForm ? (
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-3">
                        No se encontró &quot;{searchValue}&quot;
                      </p>
                      <Button
                        size="sm"
                        onClick={() => setShowCreateForm(true)}
                        disabled={!searchValue.trim()}
                      >
                        Crear &quot;{searchValue}&quot;
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-center">
                        <p className="text-sm font-medium mb-2">
                          Crear: &quot;{searchValue}&quot;
                        </p>
                      </div>
                      
                      {showTypeSelector && filterType !== "AIRCRAFT" && (
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-muted-foreground">
                            Tipo *
                          </label>
                          <Select 
                            value={newManufacturerType} 
                            onValueChange={(val: "ENGINE" | "APU" | "PROPELLER" | "GENERAL") => setNewManufacturerType(val)}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ENGINE">Fuentes de Poder</SelectItem>
                              <SelectItem value="APU">APU</SelectItem>
                              <SelectItem value="PROPELLER">Hélice</SelectItem>
                              <SelectItem value="GENERAL">General</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">
                          Descripción
                        </label>
                        <Input
                          className="h-8"
                          placeholder="Descripción..."
                          value={newManufacturerDescription}
                          onChange={(e) => setNewManufacturerDescription(e.target.value)}
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setShowCreateForm(false)
                            setNewManufacturerType("GENERAL")
                            setNewManufacturerDescription("")
                          }}
                          className="flex-1"
                        >
                          Cancelar
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleCreate}
                          disabled={createManufacturer.isPending}
                          className="flex-1"
                        >
                          {createManufacturer.isPending ? "Creando..." : "Crear"}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CommandEmpty>
              <CommandGroup>
                {filteredManufacturers.map((manufacturer) => (
                  <CommandItem
                    value={manufacturer.name}
                    key={manufacturer.id}
                    onSelect={() => {
                      onChange(manufacturer.id.toString())
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        manufacturer.id.toString() === value || manufacturer.name === value
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {manufacturer.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {description && (
        <FormDescription className="text-xs">
          {description}
        </FormDescription>
      )}
      <FormMessage />
    </FormItem>
  )
}

