"use client";

import { useCreateEmployee } from "@/actions/general/empleados/actions";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useGetJobTitles } from '@/hooks/sistema/cargo/useGetJobTitles';
import { useGetDepartments } from '@/hooks/sistema/departamento/useGetDepartment';
import { useGetLocationsByCompanies } from '@/hooks/sistema/useGetLocationsByCompanies';
import { useGetLocationsByCompany } from '@/hooks/sistema/useGetLocationsByCompany';
import { useGetRoles } from '@/hooks/sistema/usuario/useGetRoles';
import { cn } from '@/lib/utils';
import { useCompanyStore } from '@/stores/CompanyStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, ChevronsUpDown, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../ui/accordion';
import { Badge } from '../../ui/badge';
import { Checkbox } from '../../ui/checkbox';
import { Label } from '../../ui/label';
import { useGetCompanies } from '@/hooks/sistema/useGetCompanies';
import { useCreateUser } from '@/actions/general/usuarios/actions';
import { ScrollArea } from "@/components/ui/scroll-area";

const formSchema = z
  .object({
    // Datos del empleado
    first_name: z.string().min(1, "Requerido"),
    middle_name: z.string().optional(),
    last_name: z.string().min(1, "Requerido"),
    second_last_name: z.string().optional(),
    dni_type: z.string(),
    blood_type: z.string(),
    dni: z.string().min(6, "Requerido"),
    department_id: z.string(),
    job_title_id: z.string(),
    location_id: z.string(),

    // Opción para crear usuario
    createUser: z.boolean(),

    // Datos del usuario (condicionales)
    username: z.string().min(3, "Mínimo 3 caracteres").optional(),
    password: z.string().min(5, "Mínimo 5 caracteres").optional(),
    email: z.string().email("Correo inválido").optional(),
    roles: z.array(z.string()).optional(),
    companies_locations: z
      .array(
        z.object({
          companyID: z.number(),
          locationID: z.array(z.number().or(z.string())),
        })
      )
      .optional(),
  })
  .superRefine((data, ctx) => {
    // Validación condicional si createUser es true
    if (data.createUser) {
      if (!data.username) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Requerido",
          path: ["username"],
        });
      }
      if (!data.password) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Requerido",
          path: ["password"],
        });
      }
      if (!data.email) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Requerido",
          path: ["email"],
        });
      }
      if (!data.roles || data.roles.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Seleccione al menos un rol",
          path: ["roles"],
        });
      }
    }
  });
type EmployeeForm = z.infer<typeof formSchema>;

export function CreateEmployeeForm({ onSuccess }: { onSuccess?: () => void }) {
  const { selectedCompany } = useCompanyStore();
  const { createEmployee } = useCreateEmployee();
  const { createUser } = useCreateUser();
  const [step, setStep] = useState<1 | 2>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [openRoles, setOpenRoles] = useState(false);

  // Obtener datos necesarios
  const { data: locations, isLoading: isLocLoading } = useGetLocationsByCompany(
    selectedCompany?.slug
  );
  const { data: departments, isLoading: isDepartmentsLoading } =
    useGetDepartments(selectedCompany?.slug);
  const { data: jobTitles, isLoading: isJobTitlesLoading } = useGetJobTitles(
    selectedCompany?.slug
  );
  const { data: roles, isLoading: isRolesLoading } = useGetRoles();
  const {
    data: companies,
    error: companiesError,
    isLoading: isCompaniesLoading,
  } = useGetCompanies();
  const {
    data: companies_locations,
    error: companies_locationsError,
    isLoading: companies_locationsLoading,
  } = useGetLocationsByCompanies();

  const form = useForm<EmployeeForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      dni: "",
      dni_type: 'V',
      middle_name: "",
      second_last_name: "",
      createUser: false,
      roles: [],
    },
  });

  // Generar username automáticamente
  useEffect(() => {
    if (
      form.watch("createUser") &&
      form.watch("first_name") &&
      form.watch("last_name")
    ) {
      const username =
        `${form.getValues("first_name").charAt(0)}${form.getValues("last_name")}`.toLowerCase();
      form.setValue("username", username);
    }
  }, [
    form.watch("createUser"),
    form.watch("first_name"),
    form.watch("last_name"),
  ]);

  // Manejar selección de roles
  const handleRoleSelect = (roleId: string) => {
    const newRoles = selectedRoles.includes(roleId)
      ? selectedRoles.filter((id) => id !== roleId)
      : [...selectedRoles, roleId];
    setSelectedRoles(newRoles);
    form.setValue("roles", newRoles);
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
        company: selectedCompany!.slug,
      };

      // Solo incluir datos de usuario si createUser es true
      const userData = data.createUser
        ? {
            isActive: true,
            first_name: data.first_name,
            companies_locations: data.companies_locations,
            last_name: data.last_name,
            username: data.username!,
            password: data.password,
            email: data.email!,
            roles: data.roles?.map(Number) || [],
          }
        : null;
      if (data.createUser && userData) {
        const userResponse = await createUser.mutateAsync(userData);
        // 2. Luego creamos el empleado con el user_id
        await createEmployee.mutateAsync({
          ...employeeData,
          user_id: userResponse.user.id, // Asume que el backend devuelve el ID del usuario
        });
      } else {
        // Si no se va a crear usuario, solo creamos el empleado
        await createEmployee.mutateAsync(employeeData);
      }
       onSuccess?.();
    } catch (error) {
      console.error("Error creating employee:", error);
    }
  };

  const handleNextStep = () => {
    if (form.watch("createUser")) {
      setStep(2);
    } else {
      // Si no se va a crear usuario, enviar directamente el formulario
      form.handleSubmit(onSubmit)();
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
                name="middle_name"
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
                name="last_name"
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

            <div className="flex gap-2 w-full">
              <FormField
                control={form.control}
                name="dni_type"
                render={({ field }) => (
                  <FormItem className="w-1/3">
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
                  <FormItem className="w-full">
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
                  <FormItem className="w-1/3">
                    <FormLabel>T. de Sangre</FormLabel>
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
                          <SelectItem
                            key={title.id}
                            value={title.id.toString()}
                          >
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
                onClick={handleNextStep}
                disabled={createEmployee.isPending}
              >
                {form.watch("createUser") ? "Siguiente" : "Crear Empleado"}
                {createEmployee.isPending && (
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                )}
              </Button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="flex gap-2 items-center justify-center w-full">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Nombre de Usuario</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej. jperez"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          form.setValue(
                            "username",
                            e.target.value.toLowerCase()
                          );
                        }}
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
                  <FormItem className="w-full mt-1 space-y-3">
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
            </div>

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
                              ?.filter((role) =>
                                selectedRoles.includes(role.id.toString())
                              )
                              .map((role) => (
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
                                  onSelect={() =>
                                    handleRoleSelect(role.id.toString())
                                  }
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      isRoleSelected(role.id.toString())
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {role.label}as
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
            {
              companies && (
                <FormField
              control={form.control}
              name="companies_locations"
              render={({ field }) => {
                const handleLocationChange = (
                  companyID: number,
                  locationID: number,
                  isSelected: boolean | string
                ) => {
                  // Parse the current value or initialize it
                  const currentValue = field.value || [];

                  // Find the company entry in the array
                  const companyIndex = currentValue.findIndex(
                    (item) => item.companyID === companyID
                  );

                  if (companyIndex === -1 && isSelected) {
                    // Add a new company with the location if it doesn't exist
                    currentValue.push({
                      companyID,
                      locationID: [locationID],
                    });
                  } else if (companyIndex !== -1) {
                    const company = currentValue[companyIndex];
                    if (isSelected) {
                      // Add the locationID if it's not already included
                      if (!company.locationID.includes(locationID)) {
                        company.locationID.push(locationID);
                      }
                    } else {
                      // Remove the locationID if deselected
                      company.locationID = company.locationID.filter(
                        (id) => id !== locationID
                      );

                      // Remove the company entry if no locations are left
                      if (company.locationID.length === 0) {
                        currentValue.splice(companyIndex, 1);
                      }
                    }
                  }

                  // Update the form state
                  field.onChange([...currentValue]);
                };

                return (
                  <FormItem className="flex flex-col items-start rounded-md space-y-2 py-2 px-6">
                    <FormLabel>Ubicaciones</FormLabel>
                    <ScrollArea className={cn("h-auto w-full", companies!.length > 4 && "h-[250px]" )}>
                      <Accordion className="w-full" type="single" collapsible>
                      {companies &&
                        companies_locations &&
                        companies.map((company) => (
                          <AccordionItem key={company.id} value={company.name}>
                            <AccordionTrigger>{company.name}</AccordionTrigger>
                            <AccordionContent>
                              {companies_locations &&
                                companies_locations
                                  .filter(
                                    (location) =>
                                      location.company_id === company.id
                                  )
                                  .map((location) => (
                                    <div
                                      className="flex flex-col gap-2"
                                      key={location.company_id}
                                    >
                                      {location.locations.map((loc) => (
                                        <div
                                          className="flex items-center space-x-2"
                                          key={loc.id}
                                        >
                                          <Checkbox
                                            checked={Boolean(
                                              field.value?.find(
                                                (item) =>
                                                  item.companyID ===
                                                    company.id &&
                                                  item.locationID.includes(
                                                    loc.id
                                                  )
                                              )
                                            )}
                                            onCheckedChange={(isSelected) =>
                                              handleLocationChange(
                                                company.id,
                                                loc.id,
                                                isSelected
                                              )
                                            }
                                          />
                                          <Label>{loc.address}</Label>
                                        </div>
                                      ))}
                                    </div>
                                  ))}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      {(companiesError || companies_locationsError) && (
                        <p>
                          Ha ocurrido un error cargando las empresas y/o
                          ubicaciones...
                        </p>
                      )}
                      </Accordion>
                    </ScrollArea>
                  </FormItem>
                );
              }}
            />
              )
            }

            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
              >
                Anterior
              </Button>
              <Button
                type="submit"
                disabled={createEmployee.isPending || createUser.isPending}
              >
                {createEmployee.isPending || createUser.isPending ? (
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
      </form>
    </Form>
  );
}
