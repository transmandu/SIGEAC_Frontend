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

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCreateDepartment } from '@/actions/general/departamento/actions';
import { useCompanyStore } from '@/stores/CompanyStore';
import { Loader2 } from 'lucide-react';

const departmentSchema = z.object({
  acronym: z.string().min(1, 'El acrónimo es obligatorio'),
  name: z.string().min(1, 'El nombre es obligatorio'),
  email: z.string().email('Correo no válido'),
});

type DepartmentForm = z.infer<typeof departmentSchema>;

export function CreateDepartmentForm({ onSuccess }: { onSuccess?: () => void }) {
  const {selectedCompany} = useCompanyStore();
  const form = useForm<DepartmentForm>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      acronym: '',
      name: '',
      email: '',
    },
  });

  const { createDepartment } = useCreateDepartment();

const onSubmit = async (data: DepartmentForm) => {
  await createDepartment.mutateAsync({
    ...data,
    company: selectedCompany?.split(' ').join(''),
  });
  onSuccess?.();
  form.reset();
};

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="acronym"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Acrónimo</FormLabel>
              <FormControl>
                <Input placeholder="Ej: IT" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Tecnología de la Información" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Correo Electrónico</FormLabel>
              <FormControl>
                <Input type="email" placeholder="correo@empresa.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end pt-2">
          <Button disabled={createDepartment.isPending} type="submit">{createDepartment.isPending ? <Loader2 className='animate-spin' /> : "Guardar"}</Button>
        </div>
      </form>
    </Form>
  );
}
