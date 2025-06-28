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
import { Loader2, Eye, EyeOff, Check, ChevronsUpDown } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useGetJobTitles } from '@/hooks/sistema/cargo/useGetJobTitles';
import { useGetDepartments } from '@/hooks/sistema/departamento/useGetDepartment';
import { useGetLocationsByCompany } from '@/hooks/sistema/useGetLocationsByCompany';
import { useCompanyStore } from '@/stores/CompanyStore';
import { useCreateEmployee } from '@/actions/general/empleados/actions';
import { Checkbox } from '../ui/checkbox';
import { useState, useEffect } from 'react';
import { useGetRoles } from '@/hooks/sistema/usuario/useGetRoles';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';

const formSchema = z.object({
  // Datos del empleado
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

  // Opción para crear usuario
  createUser: z.boolean().optional(),

  // Datos del usuario (condicionales)
  username: z.string().min(3, 'Mínimo 3 caracteres').optional(),
  password: z.string().min(5, 'Mínimo 5 caracteres').optional(),
  email: z.string().email('Correo inválido').optional(),
  roles: z.array(z.string()).optional(),
}).superRefine((data, ctx) => {
  // Validación condicional si createUser es true
  if (data.createUser) {
    if (!data.username) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Requerido",
        path: ["username"]
      });
    }
    if (!data.password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Requerido",
        path: ["password"]
      });
    }
    if (!data.email) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Requerido",
        path: ["email"]
      });
    }
    if (!data.roles || data.roles.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Seleccione al menos un rol",
        path: ["roles"]
      });
    }
  }
});

type EmployeeForm = z.infer<typeof formSchema>;

export function CreateEmployeeForm() {
  const { selectedCompany } = useCompanyStore();
  const { createEmployee } = useCreateEmployee();
  const [step, setStep] = useState<1 | 2>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [openRoles, setOpenRoles] = useState(false);

  // Obtener datos necesarios
  const { data: locations, isLoading: isLocLoading } = useGetLocationsByCompany(selectedCompany?.split(' ').join(''));
  const { data: departments, isLoading: isDepartmentsLoading } = useGetDepartments(selectedCompany?.split(' ').join(''));
  const { data: jobTitles, isLoading: isJobTitlesLoading } = useGetJobTitles(selectedCompany?.split(' ').join(''));
  const { data: roles, isLoading: isRolesLoading } = useGetRoles();

  const form = useForm<EmployeeForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      dni: '',
      middle_name: '',
      second_last_name: '',
      createUser: false,
      roles: [],
    },
  });

  // Generar username automáticamente
  useEffect(() => {
    if (form.watch('createUser') && form.watch('first_name') && form.watch('last_name')) {
      const username = `${form.getValues('first_name').charAt(0)}${form.getValues('last_name')}`.toLowerCase();
      form.setValue('username', username);
    }
  }, [form.watch('createUser'), form.watch('first_name'), form.watch('last_name')]);

  // Manejar selección de roles
  const handleRoleSelect = (roleId: string) => {
    const newRoles = selectedRoles.includes(roleId)
      ? selectedRoles.filter(id => id !== roleId)
      : [...selectedRoles, roleId];
    setSelectedRoles(newRoles);
    form.setValue('roles', newRoles);
  };

  const isRoleSelected = (roleId: string) => selectedRoles.includes(roleId);

  const onSubmit = async (data: EmployeeForm) => {
    try {
      const employeeData = {
        // Datos del empleado
        first_name: data.first_name,
        middle_name: data.middle_name,
        last_name: data.last_name,
        second_last_name: data.second_last_name,
        dni_type: data.dni_type,
        blood_type: data.blood_type,
        dni: data.dni,
        department_id: data.department_id,
        job_title_id: data.job_title_id,
        location_id: data.location_id,
        company: selectedCompany!.split(' ').join(''),
      };
      const userData = data.createUser ?? {
        username: data.username,
        password: data.password,
        email: data.email,
        roles: data.roles?.map(Number) || [],
      }
      await createEmployee.mutateAsync(employeeData);
    } catch (error) {
      console.error('Error creating employee:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
        {step === 1 && (
          <>
            <h3 className="text-lg font-medium">Datos del Empleado</h3>

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
                    <FormLabel>Segundo Nombre</FormLabel>
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
                    <FormLabel>Primer Apellido</FormLabel>
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
                    <FormLabel>Segundo Apellido</FormLabel>
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
                    <FormLabel>T. de Doc.</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue="V">
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
                    <FormLabel>Tipo de Sangre</FormLabel>
                    <Select onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="A-">A-</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="B-">B-</SelectItem>
                        <SelectItem value="AB+">AB+</SelectItem>
                        <SelectItem value="AB-">AB-</SelectItem>
                        <SelectItem value="O+">O+</SelectItem>
                        <SelectItem value="O-">O-</SelectItem>
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
                    <Select
                      onValueChange={field.onChange}
                      disabled={isJobTitlesLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
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
                    <Select
                      onValueChange={field.onChange}
                      disabled={isDepartmentsLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
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
                  <Select
                    onValueChange={field.onChange}
                    disabled={isLocLoading}
                  >
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

            <FormField
              control={form.control}
              name="createUser"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 p-4 border rounded-lg">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="!mt-0">
                    ¿Crear usuario para este empleado?
                  </FormLabel>
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button
                type="button"
                onClick={() => setStep(2)}
                disabled={createEmployee.isPending}
              >
                Siguiente
                {createEmployee.isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              </Button>
            </div>
          </>
        )}

        {step === 2 && form.watch("createUser") && (
          <>
            <h3 className="text-lg font-medium">Datos del Usuario</h3>

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de Usuario</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej. jperez"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        // Mantener el username en lowercase
                        form.setValue('username', e.target.value.toLowerCase());
                      }}
                    />
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
                    <Input
                      type="email"
                      placeholder="Ej. juan.perez@empresa.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    Contraseña
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-muted-foreground hover:text-primary"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Mínimo 5 caracteres"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="roles"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Roles</FormLabel>
                  <Popover open={openRoles} onOpenChange={setOpenRoles}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="w-full justify-between"
                      >
                        {selectedRoles.length > 0 ? (
                          <div className="flex gap-1 flex-wrap">
                            {roles
                              ?.filter(role => selectedRoles.includes(role.id.toString()))
                              .map(role => (
                                <Badge key={role.id} variant="secondary">
                                  {role.name}
                                </Badge>
                              ))}
                          </div>
                        ) : (
                          "Seleccione roles..."
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Buscar roles..." />
                        <CommandList>
                          <CommandEmpty>No se encontraron roles</CommandEmpty>
                          <CommandGroup>
                            {isRolesLoading ? (
                              <div className="flex justify-center py-4">
                                <Loader2 className="h-4 w-4 animate-spin" />
                              </div>
                            ) : (
                              roles?.map((role) => (
                                <CommandItem
                                  key={role.id}
                                  value={role.id.toString()}
                                  onSelect={() => handleRoleSelect(role.id.toString())}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      isRoleSelected(role.id.toString())
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {role.name}
                                </CommandItem>
                              ))
                            )}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
              >
                Anterior
              </Button>
              <Button type="submit" disabled={createEmployee.isPending}>
                {createEmployee.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  "Crear Empleado y Usuario"
                )}
              </Button>
            </div>
          </>
        )}

        {step === 2 && !form.watch("createUser") && (
          <div className="flex flex-col gap-4">
            <div className="p-4 border rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">
                No se creará un usuario para este empleado. Puede crear uno más tarde si es necesario.
              </p>
            </div>
            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
              >
                Anterior
              </Button>
              <Button type="submit" disabled={createEmployee.isPending}>
                {createEmployee.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando empleado...
                  </>
                ) : (
                  "Crear Empleado"
                )}
              </Button>
            </div>
          </div>
        )}
      </form>
    </Form>
  );
}
