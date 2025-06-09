'use client';

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateEmployee } from "@/actions/general/usuarios/actions"; 
import { Loader2 } from "lucide-react";

// Schema Zod
const FormSchema = z.object({
  first_name: z.string().min(1, "Requerido"),
  last_name: z.string().min(1, "Requerido"),
  dni: z.string().min(1, "Requerido"),
  company: z.string().min(1, "Requerido"),
  job_title_id: z.string().min(1, "Selecciona un cargo"),
  department_id: z.string().min(1, "Selecciona un departamento"),
  location_id: z.string().min(1, "Selecciona una ubicación"),
});

// Formulario
export function CreateEmployeeForm({ jobTitles, departments, locations }: {
  jobTitles: { id: number, name: string }[],
  departments: { id: number, name: string }[],
  locations: { id: number, name: string }[]
}) {
  const { mutateAsync, isPending } = useCreateEmployee();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      dni: '',
      company: '',
      job_title_id: '',
      department_id: '',
      location_id: ''
    }
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    const payload = {
      first_name: data.first_name,
      last_name: data.last_name,
      dni: data.dni,
      company: data.company,
      job_title: { id: parseInt(data.job_title_id) },
      department: { id: parseInt(data.department_id) },
      location: { id: parseInt(data.location_id) },
    };

    await mutateAsync(payload);
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl><Input placeholder="Ej: Juan" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Apellido</FormLabel>
                <FormControl><Input placeholder="Ej: Pérez" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dni"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cédula</FormLabel>
                <FormControl><Input placeholder="Ej: V12345678" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Compañía</FormLabel>
                <FormControl><Input placeholder="Ej: Transmandu" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="job_title_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cargo</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Selecciona un cargo" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {jobTitles.map((j) => (
                      <SelectItem key={j.id} value={String(j.id)}>{j.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="department_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Departamento</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Selecciona un departamento" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {departments.map((d) => (
                      <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ubicación</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Selecciona una ubicación" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {locations.map((l) => (
                      <SelectItem key={l.id} value={String(l.id)}>{l.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={isPending} className="gap-2">
          {isPending ? <><Loader2 className="animate-spin size-4" />Creando...</> : "Crear Empleado"}
        </Button>
      </form>
    </Form>
  );
}
