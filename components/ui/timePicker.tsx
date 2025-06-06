"use client";

import * as React from "react";
import { format, parse, isValid } from "date-fns";
import { Clock as ClockIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { UseFormReturn, FieldValues, Path } from "react-hook-form";

type TimeProp<T extends FieldValues> = {
  form: UseFormReturn<T>;
  name: Path<T>;
  title: string;
};

export function TimePicker<T extends FieldValues>({
  form,
  name,
  title,
}: TimeProp<T>) {
  return (
    <>
      <FormField
        control={form.control}
        name={name}
        render={({ field }) => {
          const handleChange = (event: { target: { value: any } }) => {
            const timeString = event.target.value;
            const time = parse(timeString, "HH:mm", new Date());
            if (isValid(time)) {
              field.onChange(time);
            }
          };

          return (
            <FormItem className="flex flex-col">
              <FormLabel>{title}</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "HH:mm") // Formato 24 horas
                      ) : (
                        <span>Seleccionar Hora</span>
                      )}
                      <ClockIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <input
                    type="time"
                    value={field.value ? format(field.value, "HH:mm") : ""}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          );
        }}
      />
    </>
  );
}
