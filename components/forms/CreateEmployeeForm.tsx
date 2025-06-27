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

import { useGetJobTitles } from '@/hooks/sistema/cargo/useGetJobTitles';
import { useGetDepartments } from '@/hooks/sistema/departamento/useGetDepartment';
import { useGetLocationsByCompany } from '@/hooks/sistema/useGetLocationsByCompany';
import { useCompanyStore } from '@/stores/CompanyStore';
import { useCreateEmployee } from '@/actions/general/empleados/actions';
import { Checkbox } from '../ui/checkbox';

const formSchema = z.object({
  first_name: z.string().min(1, 'Requerido'),
  middle_name: z.string().optional(),
  last_name: z.string().min(1, 'Requerido'),
  second_last_name: z.string().optional(),
  dni_type: z.string(),
  blood_type: z.string(),
  dni: z.string().min(6, 'Requerido'),
  department_id: z.string(),
  job_title_id: z.string(),
  location_id: z.string(),
  // createUser: z.boolean().optional(),
});

type EmployeeForm = z.infer<typeof formSchema>;

export function CreateEmployeeForm({ onSubmit }: {  onSubmit: (data: EmployeeForm) => void }) {
  const {selectedCompany } = useCompanyStore();
  const form = useForm<EmployeeForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      dni: '',
      middle_name: '',
      second_last_name: '',
    },
  });
  const { data: locations, isLoading: isLocLoading, isError: isLocError } = useGetLocationsByCompany(selectedCompany?.split(' ').join(''));
  const { data: departments, isLoading: isDepartmentsLoading, isError: isDepartmentError } = useGetDepartments(selectedCompany?.split(' ').join(''));
  const { data: jobTitles, isLoading: isJobTitlesLoading, isError: isJobTitlesError } = useGetJobTitles(selectedCompany?.split(' ').join(''));

  return (
    <Form {...form}>
      <form onSubmit={async (e) => {
          e.preventDefault();
          try {
            const isValid = await form.trigger();
            if (isValid) {
              await onSubmit(form.getValues());
            }
          } catch (error) {
            console.error("Form submission error:", error);
          }
        }} className="space-y-4 mt-4">
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
                <FormLabel>Seg. Nombre</FormLabel>
                <FormControl>
                  <Input placeholder="Ej. David" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="middle_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prim. Apellido</FormLabel>
                <FormControl>
                  <Input placeholder="Ej. Perez" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="second_last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Segun. Apellido</FormLabel>
                <FormControl>
                  <Input placeholder="Ej. Alfonso" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className='flex gap-2 w-full'>
          <FormField
            control={form.control}
            name="dni_type"
            render={({ field }) => (
              <FormItem className='w-1/3'>
                <FormLabel>Documento</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={"V"}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="V / J" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="V">V</SelectItem>
                    <SelectItem value="J">J</SelectItem>
                    <SelectItem value="E">E</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        <FormField
          control={form.control}
          name="dni"
          render={({ field }) => (
            <FormItem className='w-full'>
              <FormLabel>Cédula</FormLabel>
              <FormControl>
                <Input placeholder="Ej. V12345678" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
            control={form.control}
            name="blood_type"
            render={({ field }) => (
              <FormItem className='w-1/3'>
                <FormLabel>T. de Sangre</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={"V"}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="V / J" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="V">A+</SelectItem>
                    <SelectItem value="J">A-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="B+">B+-</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="0-">O-</SelectItem>
                  </SelectContent>
                </Select>
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
      {/* <FormField
        control={form.control}
        name="createUser"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Crear usuario para este empleado</FormLabel>
              <p className="text-sm text-muted-foreground">
                El empleado podrá acceder al sistema con credenciales
              </p>
            </div>
          </FormItem>
        )}
      /> */}
        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && <Loader2 className="animate-spin size-4 mr-2" />}
            {/* {form.watch('createUser') ? 'Continuar' : 'Crear'} */}
            Crear
          </Button>
        </div>
      </form>
    </Form>
  );
}
