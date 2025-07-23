'use client';

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { useGetDepartments } from '@/hooks/sistema/departamento/useGetDepartment';
import { useCreateJobTitle } from '@/actions/general/cargo/actions';
import { useCompanyStore } from '@/stores/CompanyStore';


const jobTitleSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  description: z.string().min(1, 'La descripción es obligatoria'),
  departmentId: z.string().min(1, 'El departamento es obligatorio'),
});

type JobTitleForm = z.infer<typeof jobTitleSchema>;

export function CreateJobTitleForm({ onSuccess }: { onSuccess?: () => void }) {
  const form = useForm<JobTitleForm>({
    resolver: zodResolver(jobTitleSchema),
    defaultValues: {
      name: '',
      description: '',
      departmentId: '',
    },
  });

  const { selectedStation, selectedCompany } = useCompanyStore()
  const { data: departments, isLoading } = useGetDepartments(selectedCompany?.slug);
  const { createJobTitle } = useCreateJobTitle();

const onSubmit = async (data: JobTitleForm) => {
  const formattedData = {
    name: data.name,
    description: data.description,
    department: {
      id: parseInt(data.departmentId, 10),
    },
  };

  await createJobTitle.mutateAsync(formattedData);

  onSuccess?.();
  form.reset();
};

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Analista de Sistemas" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Input placeholder="Descripción del cargo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="departmentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Departamento</FormLabel>
              <Select
                disabled={isLoading}
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un departamento" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {departments?.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id.toString()}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end pt-2">
          <Button type="submit">Guardar</Button>
        </div>
      </form>
    </Form>
  );
}
