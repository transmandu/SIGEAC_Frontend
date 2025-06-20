'use client';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useCreateEmployee } from '@/actions/general/usuarios/actions';
import { useGetJobTitles } from '@/hooks/sistema/cargo/useGetJobTitles';
import { useGetDepartments } from '@/hooks/sistema/departamento/useGetDepartment';
import { useGetLocationsByCompany } from '@/hooks/sistema/useGetLocationsByCompany';
import { useCompanyStore } from '@/stores/CompanyStore';
// import { useDepartments } from '@/hooks/...';
// import { useJobTitles } from '@/hooks/...';

const formSchema = z.object({
  first_name: z.string().min(1, 'Requerido'),
  last_name: z.string().min(1, 'Requerido'),
  dni: z.string().min(5, 'Requerido'),
  department_id: z.string(),
  job_title_id: z.string(),
  location_id: z.string(),
});

type EmployeeForm = z.infer<typeof formSchema>;

export function CreateEmployeeForm({ onSuccess }: { onSuccess?: () => void }) {
  const {selectedCompany } = useCompanyStore();
  const form = useForm<EmployeeForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      dni: '',
      department: '',
      job_title: '',
      location: '',
    },
  });

  const { mutateAsync, isPending } = useCreateEmployee();
  const { data: locations, isLoading: isLocLoading, isError: isLocError } = useGetLocationsByCompany(selectedCompany?.split(' ').join(''));
  const { data: departments, isLoading: isDepartmentsLoading, isError: isDepartmentError } = useGetDepartments(selectedCompany?.split(' ').join(''));
  const { data: jobTitles, isLoading: isJobTitlesLoading, isError: isJobTitlesError } = useGetJobTitles(selectedCompany?.split(' ').join(''));

  const onSubmit = async (data: EmployeeForm) => {
    await mutateAsync(data);
    form.reset();
    onSuccess?.();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input placeholder="Ej. Juan" {...field} />
                </FormControl>
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
                <FormControl>
                  <Input placeholder="Ej. Pérez" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="dni"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cédula</FormLabel>
              <FormControl>
                <Input placeholder="Ej. V12345678" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="job_title_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cargo</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger disabled={isJobTitlesLoading || isJobTitlesError}>
                      <SelectValue placeholder="Selecciona un cargo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                     {jobTitles?.map((title) => (
                      <SelectItem key={title.id} value={title.id.toString()}>
                        {title.name}
                      </SelectItem>
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
                  <FormControl>
                    <SelectTrigger disabled={isDepartmentsLoading || isDepartmentError}>
                      <SelectValue placeholder="Selecciona un departamento" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                     {departments?.map((d) => (
                      <SelectItem key={d.id} value={d.id.toString()}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="location_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ubicación</FormLabel>
              <Select disabled={isLocLoading || isLocError} onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una ubicación" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                   {locations?.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id.toString()}>
                      {loc.address} - {loc.type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="animate-spin size-4 mr-2" />}
            Crear
          </Button>
        </div>
      </form>
    </Form>
  );
}
