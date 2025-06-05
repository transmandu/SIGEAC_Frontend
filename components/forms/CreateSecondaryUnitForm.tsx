'use client';
import { useCreateSecondaryUnit, useCreateUnit } from "@/actions/general/unidades/actions";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../ui/button";
import { useGetUnits } from "@/hooks/general/unidades/useGetPrimaryUnits";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";


const formSchema = z.object({
  secondary_unit: z.string().min(3, {
    message: "El nombre debe tener al menos 3 carácters.",
  }),
  convertion_rate: z.coerce.number(),
  quantity_unit: z.coerce.number(),
  unit_id: z.number(),
})


interface FormProps {
  onClose: () => void,
}

export default function CreateSecondaryUnitForm({ onClose }: FormProps) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")
  const { createSecondaryUnit } = useCreateSecondaryUnit();
  const { data: primaryUnits, isLoading: primaryLoading } = useGetUnits()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      convertion_rate: 0,
    },
  })
  const { control } = form;

  useEffect(() => {
    if (value) {
      form.setValue("unit_id", Number(value))
    }
  }, [form, value])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await createSecondaryUnit.mutate({
      ...values,
    });
    onClose()
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={control}
          name="secondary_unit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input placeholder="EJ: C. de 24u, Paquete de 6u, etc..." {...field} />
              </FormControl>
              <FormDescription>
                Este será el nombre de su unidad.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="convertion_rate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unidades</FormLabel>
              <FormControl>
                <Input placeholder="EJ: Kilogramo, Litro, Mililitro" {...field} />
              </FormControl>
              <FormDescription>
                ¿Cuantas unidades trae su unidad secundaria?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="unit_id"
          render={({ field }) => (
            <FormItem className="flex flex-col mt-2">
              <FormLabel>Unidad Primaria</FormLabel>
              <FormControl>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      disabled={primaryLoading}
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-[200px] justify-between"
                    >
                      {primaryUnits && (value
                        ? primaryUnits.find((primaryUnits) => primaryUnits.id.toString() === value)?.label
                        : "Seleccione...")}
                      <ChevronsUpDown className="opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0">
                    <Command>
                      <CommandInput placeholder="Buscar unidad primaria..." />
                      <CommandList>
                        <CommandEmpty>No existen unidades primarias.</CommandEmpty>
                        <CommandGroup>
                          {primaryUnits && primaryUnits.map((primaryUnit) => (
                            <CommandItem
                              key={primaryUnit.id}
                              value={primaryUnit.id.toString()}
                              onSelect={(currentValue) => {
                                setValue(currentValue === value ? "" : currentValue)
                                setOpen(false)
                              }}
                            >
                              {primaryUnit.label}
                              <Check
                                className={cn(
                                  "ml-auto",
                                  value === primaryUnit.id.toString() ? "opacity-100" : "opacity-0"
                                )}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </FormControl>
              <FormDescription>
                Este será el valor referencial a la unidad primaria.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="quantity_unit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor por Unidad</FormLabel>
              <FormControl>
                <Input placeholder="EJ: 1, 0.5, etc..." {...field} />
              </FormControl>
              <FormDescription>
                Este será el valor por cada unidad de su unidad secundaria.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="bg-primary mt-2 text-white hover:bg-blue-900 disabled:bg-primary/70" disabled={createSecondaryUnit?.isPending} type="submit">
          {createSecondaryUnit?.isPending ? <Loader2 className="size-4 animate-spin" /> : <p>Crear</p>}
        </Button>
      </form>
    </Form>
  )
}
