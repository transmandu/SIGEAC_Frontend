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
import { useAddModulesToUser } from '@/actions/sistema/usuarios/actions';
import { useGetJobTitles } from '@/hooks/sistema/cargo/useGetJobTitles';
import { useGetDepartments } from '@/hooks/sistema/departamento/useGetDepartment';
import { useGetLocationsByCompanies } from '@/hooks/sistema/useGetLocationsByCompanies';
import { useGetLocationsByCompany } from '@/hooks/sistema/useGetLocationsByCompany';
import { useGetRoles } from '@/hooks/sistema/usuario/useGetRoles';
import { useGetUsers } from '@/hooks/sistema/usuario/useGetUsers';
import { cn } from '@/lib/utils';
import { useCompanyStore } from '@/stores/CompanyStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, ChevronsUpDown, Eye, EyeOff, Loader2, Camera, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Badge } from '../../ui/badge';
import { Checkbox } from '../../ui/checkbox';
import { Label } from '../../ui/label';
import { Separator } from '../../ui/separator';
import { useGetCompanies } from '@/hooks/sistema/useGetCompanies';
import { useCreateUser } from '@/actions/general/usuarios/actions';
import Image from "next/image";
import { Department, Location as AppLocation } from "@/types";

const formSchema = z
  .object({
    first_name: z.string().min(1, "Requerido"),
    middle_name: z.string().optional(),
    last_name: z.string().min(1, "Requerido"),
    second_last_name: z.string().optional(),
    dni_type: z.string(),
    blood_type: z.string(),
    gender: z.enum(["MALE", "FEMALE"]),
    dni: z.string().min(6, "Requerido"),
    department_id: z.string(),
    job_title_id: z.string(),
    location_id: z.string(),
    profile_photo: z
      .any()
      .optional()
      .refine((file) => {
        if (!file) return true;
        return file instanceof File;
      }, "Archivo inválido"),
    createUser: z.boolean(),
    existing_user_id: z.string().optional(),
    username: z.string().min(3, "Mínimo 3 caracteres").optional(),
    password: z.string().min(5, "Mínimo 5 caracteres").optional(),
    email: z.string().email("Correo inválido").optional(),
    roles: z.array(z.string()).optional(),
    module_ids: z.array(z.number()).optional(),
    companies_locations: z
      .array(
        z.object({
          companyID: z.number(),
          locationID: z.array(z.number()),
        })
      )
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.createUser && !data.existing_user_id) {
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
      if (!data.companies_locations || data.companies_locations.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Debe seleccionar al menos una ubicación",
          path: ["companies_locations"],
        });
      }
    }
  });
type EmployeeForm = z.infer<typeof formSchema>;

const resolveCreatedUserId = (response: unknown): string | undefined => {
  const r = response as {
    data?: { user?: { id?: string | number }; id?: string | number };
    user?: { id?: string | number };
    id?: string | number;
  };
  const id = r?.data?.user?.id ?? r?.user?.id ?? r?.data?.id ?? r?.id;
  return id !== undefined && id !== null ? String(id) : undefined;
};

export function CreateEmployeeForm({ onSuccess }: { onSuccess?: () => void }) {
  const { selectedCompany } = useCompanyStore();
  const createEmployee = useCreateEmployee();
  const { createUser } = useCreateUser();
  const { addModules } = useAddModulesToUser();
  const [step, setStep] = useState<1 | 2>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [openRoles, setOpenRoles] = useState(false);
  const [openModules, setOpenModules] = useState(false);
  const [openUserSearch, setOpenUserSearch] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [selectedUserCompanyId, setSelectedUserCompanyId] = useState<number | undefined>(undefined);

  const { data: locations, isLoading: isLocLoading } = useGetLocationsByCompany(
    selectedCompany?.slug
  );
  const { data: departments, isLoading: isDepartmentsLoading } =
    useGetDepartments(selectedCompany?.slug);
  const { data: jobTitles, isLoading: isJobTitlesLoading } = useGetJobTitles(
    selectedCompany?.slug
  );
  const { data: roles, error: rolesError, isLoading: isRolesLoading } = useGetRoles(selectedUserCompanyId);
  const {
    data: companies,
    error: companiesError,
    isLoading: isCompaniesLoading,
  } = useGetCompanies();
  const {
    data: companies_locations,
    isLoading: companies_locationsLoading,
  } = useGetLocationsByCompanies();
  const { data: users, isLoading: isUsersLoading } = useGetUsers();

  const availableUsers = useMemo(
    () => users?.filter((user) => !user.employee || user.employee.length === 0),
    [users]
  );

  const locationsByCompany = useMemo(() => {
    if (!companies_locations) return {};

    return companies_locations.reduce((acc, item) => {
      acc[item.company_id] = item.locations;
      return acc;
    }, {} as Record<number, AppLocation[]>);
  }, [companies_locations]);

  const selectedUserCompanyModules = useMemo(() => {
    return companies?.find((company) => company.id === selectedUserCompanyId)?.modules ?? [];
  }, [companies, selectedUserCompanyId]);

  const form = useForm<EmployeeForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      dni: "",
      dni_type: 'V',
      blood_type: "",
      gender: "MALE",
      middle_name: "",
      second_last_name: "",
      createUser: false,
      roles: [],
    },
  });
  const selectedRoles = form.watch("roles") || [];
  const selectedModuleIds = form.watch("module_ids") || [];
  const existingUserId = form.watch("existing_user_id");
  const selectedExistingUser = availableUsers?.find(
    (user) => String(user.id) === existingUserId
  );

  const shouldCreateUser = form.watch("createUser");
  const firstName = form.watch("first_name");
  const lastName = form.watch("last_name");

  useEffect(() => {
    if (shouldCreateUser && firstName && lastName && !form.getValues("username")) {
      const username = `${firstName.charAt(0)}${lastName}`.toLowerCase();
      form.setValue("username", username);
    }
  }, [shouldCreateUser, firstName, lastName, form]);

  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  const handleRoleSelect = (roleId: string) => {
    const current = form.getValues("roles") || [];

    const newRoles = current.includes(roleId)
      ? current.filter((id) => id !== roleId)
      : [...current, roleId];

    form.setValue("roles", newRoles);
  };

  const isRoleSelected = (roleId: string) => selectedRoles.includes(roleId);

  const handleModuleSelect = (moduleId: number) => {
    const current = form.getValues("module_ids") || [];

    const newModules = current.includes(moduleId)
      ? current.filter((id) => id !== moduleId)
      : [...current, moduleId];

    form.setValue("module_ids", newModules);
  };

  const isModuleSelected = (moduleId: number) => selectedModuleIds.includes(moduleId);

  const handleUserCompanyChange = (companyID: string) => {
    const parsedCompanyID = Number(companyID);
    setSelectedUserCompanyId(parsedCompanyID);
    form.setValue('companies_locations', [{ companyID: parsedCompanyID, locationID: [] }]);
    form.setValue('roles', []);
    form.setValue('module_ids', []);
  };

  const handleSelectExistingUser = (userId: string | number) => {
    const parsedUserId = String(userId);
    form.setValue('existing_user_id', parsedUserId === existingUserId ? undefined : parsedUserId);
    form.setValue('createUser', false);
    setOpenUserSearch(false);
  };

  const onSubmit = async (data: EmployeeForm) => {
    if (!selectedCompany) return;

    try {
      let userId: number | null = null;
      if (data.existing_user_id) {
        userId = Number(data.existing_user_id);
      } else if (data.createUser && createUser) {
        const userData = {
          isActive: true,
          first_name: data.first_name,
          last_name: data.last_name,
          companies_locations: data.companies_locations,
          username: data.username!,
          password: data.password!,
          email: data.email!,
          roles: data.roles?.map(Number) || [],
        };
        const userResponse = await createUser.mutateAsync(userData);
        const newUserId = resolveCreatedUserId(userResponse);
        userId = newUserId ? Number(newUserId) : null;

        if (selectedUserCompanyId && data.module_ids && data.module_ids.length > 0) {
          if (!newUserId) {
            console.error("No se pudo determinar el ID del usuario recién creado para asignar los módulos.", userResponse);
          } else {
            await addModules.mutateAsync({
              userId: newUserId,
              companyId: selectedUserCompanyId,
              moduleIds: data.module_ids,
            });
          }
        }
      }
      await createEmployee.mutateAsync({
        first_name: data.first_name,
        middle_name: data.middle_name,
        last_name: data.last_name,
        second_last_name: data.second_last_name,
        dni: data.dni,
        dni_type: data.dni_type,
        blood_type: data.blood_type,
        gender: data.gender,
        job_title_id: data.job_title_id,
        department_id: data.department_id,
        location_id: data.location_id,
        user_id: userId ? String(userId) : undefined,
        company: selectedCompany.slug,
        profile_photo: data.profile_photo,
      });

      // 3. Reset UI
      onSuccess?.();
      form.reset();
      setStep(1);
      setPhotoFile(null);

      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
      setPhotoPreview(null);

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

  const flattenDepartments = (departments: Department[]): Department[] =>
    departments.flatMap((department) => [
      department,
      ...flattenDepartments(department.descendants ?? []),
    ]);

  const allDepartments = departments
    ? flattenDepartments(departments)
    : [];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">

        {step === 1 && (
          <>
            <h3 className="text-lg font-medium">Datos del Empleado</h3>

            {/* ================= GRID 50/50 ================= */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

              {/* =============== LEFT COLUMN =============== */}
              <div className="flex flex-col items-center gap-4">

                <FormField
                  control={form.control}
                  name="profile_photo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Foto Carnet</FormLabel>

                      <FormControl>
                        <div className="flex items-center gap-6">

                          <Input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            id="photo-upload"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;

                              field.onChange(file);
                              setPhotoFile(file);
                              setPhotoPreview(URL.createObjectURL(file));
                            }}
                          />

                          <label htmlFor="photo-upload" className="cursor-pointer">
                            <div className="relative group h-20 w-20">

                              {photoPreview ? (
                                <Image
                                  src={photoPreview}
                                  alt="preview"
                                  width={80}
                                  height={80}
                                  className="h-20 w-20 rounded-full object-cover border"
                                />
                              ) : (
                                <div className="h-20 w-20 rounded-full border flex items-center justify-center text-xs text-muted-foreground">
                                  Sin foto
                                </div>
                              )}

                              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                <Camera className="h-4 w-4 text-white" />
                              </div>

                              {photoPreview && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();

                                    field.onChange(undefined);
                                    setPhotoFile(null);

                                    URL.revokeObjectURL(photoPreview);
                                    setPhotoPreview(null);
                                  }}
                                  className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              )}

                            </div>
                          </label>

                        </div>
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4 w-full">

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

              </div>

              {/* =============== RIGHT COLUMN =============== */}
              <div className="flex flex-col gap-4">

                <div className="grid grid-cols-12 gap-4 w-full items-end">
                  
                  <FormField
                    control={form.control}
                    name="dni_type"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>T. Doc</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value ?? ""}>
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dni"
                    render={({ field }) => (
                      <FormItem className="col-span-5">
                        <FormLabel>Cédula</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej. 12345678" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="blood_type"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Sangre</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value ?? ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="+" />
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem className="col-span-3">
                        <FormLabel>Género</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value ?? ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="-" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="MALE">Hombre</SelectItem>
                            <SelectItem value="FEMALE">Mujer</SelectItem>
                          </SelectContent>
                        </Select>
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
                        <Select
                          onValueChange={field.onChange}
                          value={field.value ?? ""}
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
                          value={field.value ?? ""}
                          disabled={isDepartmentsLoading}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un departamento" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {allDepartments.map((d) => (
                              <SelectItem key={d.id} value={d.id.toString()}>
                                {d.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                        value={field.value ?? ""}
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
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="existing_user_id"
                  render={() => (
                    <FormItem className="flex flex-col gap-2 p-4 border rounded-lg">
                      <FormLabel>¿Vincular a un usuario ya creado?</FormLabel>
                      <Popover open={openUserSearch} onOpenChange={setOpenUserSearch}>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full justify-between"
                          >
                            {selectedExistingUser
                              ? `${selectedExistingUser.first_name} ${selectedExistingUser.last_name} (${selectedExistingUser.username})`
                              : "Buscar usuario por nombre o usuario..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[400px] p-0">
                          <Command>
                            <CommandInput placeholder="Buscar usuario..." />
                            <CommandList>
                              <CommandEmpty>No se encontraron usuarios disponibles.</CommandEmpty>
                              <CommandGroup>
                                {
                                  isUsersLoading && <Loader2 className="animate-spin size-4" />
                                }
                                {availableUsers?.map((user) => (
                                  <CommandItem
                                    key={user.id}
                                    value={`${user.first_name} ${user.last_name} ${user.username}`}
                                    onSelect={() => handleSelectExistingUser(user.id)}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        existingUserId === String(user.id) ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    {user.first_name} {user.last_name} ({user.username})
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      {selectedExistingUser && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="self-start text-muted-foreground"
                          onClick={() => form.setValue('existing_user_id', undefined)}
                        >
                          Quitar selección
                        </Button>
                      )}
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
                          disabled={!!existingUserId}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            if (checked) {
                              form.setValue('existing_user_id', undefined);
                            }
                          }}
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
                  </Button>
                </div>

              </div>

            </div>
          </>
        )}

        {step === 2 && (
          <div className="flex justify-center">
            <div className="w-full max-w-2xl space-y-6">

              <h3 className="text-lg font-medium">
                Datos de Usuario
              </h3>

              <div className="grid grid-cols-2 gap-8">

                <div className="space-y-6">

                  <div className="grid grid-cols-2 gap-4">

                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Usuario</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Nombre de usuario"
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value.toLowerCase().trim()
                                )
                              }
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
                          <FormLabel>Contraseña</FormLabel>
                          <FormControl>
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
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
                        <FormLabel>Correo electrónico</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Ej. correo@empresa.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <p className="text-xs text-muted-foreground -mt-4">
                    Usa una contraseña segura para el acceso del usuario
                  </p>

                </div>

                <div className="space-y-6">

                  <FormItem className="flex flex-col">
                    <FormLabel>Empresa</FormLabel>
                    <Select
                      value={selectedUserCompanyId ? selectedUserCompanyId.toString() : undefined}
                      onValueChange={handleUserCompanyChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {
                          isCompaniesLoading && <Loader2 className="animate-spin size-4" />
                        }
                        {companies?.map((company) => (
                          <SelectItem key={company.id} value={company.id.toString()}>
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {
                      companiesError && <p className="text-center text-muted-foreground text-sm">Ha ocurrido un error al cargar las empresas...</p>
                    }
                  </FormItem>

                  <FormField
                    control={form.control}
                    name="companies_locations"
                    render={({ field }) => {

                      const handleLocationChange = (
                        locationID: number,
                        isSelected: boolean | string
                      ) => {
                        if (!selectedUserCompanyId) return;

                        const currentValue = [...(field.value || [])];

                        const companyIndex = currentValue.findIndex(
                          (item) => item.companyID === selectedUserCompanyId
                        );

                        if (companyIndex === -1 && isSelected) {
                          currentValue.push({
                            companyID: selectedUserCompanyId,
                            locationID: [locationID],
                          });
                        } else if (companyIndex !== -1) {
                          const company = currentValue[companyIndex];

                          if (isSelected) {
                            if (!company.locationID.includes(locationID)) {
                              company.locationID.push(locationID);
                            }
                          } else {
                            company.locationID = company.locationID.filter(
                              (id) => id !== locationID
                            );
                          }
                        }

                        field.onChange(currentValue);
                      };

                      const userLocations = selectedUserCompanyId
                        ? (locationsByCompany[selectedUserCompanyId] || [])
                        : [];

                      return (
                        <FormItem className="flex flex-col items-start rounded-md space-y-2 py-2 px-4 border">
                          <FormLabel>Ubicaciones</FormLabel>

                          {!selectedUserCompanyId && (
                            <p className="text-xs text-muted-foreground">
                              Seleccione una empresa primero.
                            </p>
                          )}

                          {selectedUserCompanyId && companies_locationsLoading && (
                            <Loader2 className="animate-spin size-4" />
                          )}

                          {selectedUserCompanyId && !companies_locationsLoading && userLocations.length === 0 && (
                            <p className="text-xs text-muted-foreground">
                              No hay ubicaciones
                            </p>
                          )}

                          <div className="flex flex-col gap-2">
                            {userLocations.map((loc) => (
                              <div
                                className="flex items-center space-x-2"
                                key={loc.id}
                              >
                                <Checkbox
                                  checked={Boolean(
                                    field.value?.find(
                                      (item) =>
                                        item.companyID === selectedUserCompanyId &&
                                        item.locationID.includes(loc.id)
                                    )
                                  )}
                                  onCheckedChange={(isSelected) =>
                                    handleLocationChange(loc.id, isSelected)
                                  }
                                />
                                <Label>{loc.address}</Label>
                              </div>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />

                  <FormField
                    control={form.control}
                    name="roles"
                    render={() => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Rol(es)</FormLabel>
                        <Popover open={openRoles} onOpenChange={setOpenRoles}>
                          <PopoverTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              className="w-full justify-between"
                              disabled={!selectedUserCompanyId}
                            >
                              {selectedRoles?.length > 0 && (
                                <>
                                  <Separator orientation="vertical" className="mx-2 h-4" />
                                  <Badge
                                    variant="secondary"
                                    className="rounded-sm px-1 font-normal lg:hidden"
                                  >
                                    {selectedRoles.length}
                                  </Badge>
                                  <div className="hidden space-x-1 lg:flex">
                                    {selectedRoles.length > 2 ? (
                                      <Badge
                                        variant="secondary"
                                        className="rounded-sm px-1 font-normal"
                                      >
                                        {selectedRoles.length} seleccionados
                                      </Badge>
                                    ) : (
                                      roles?.filter((option) => selectedRoles.includes(option.id.toString()))
                                        .map((option) => (
                                          <Badge
                                            variant="secondary"
                                            key={option.name}
                                            className="rounded-sm px-1 font-medium"
                                          >
                                            {option.name}
                                          </Badge>
                                        ))
                                    )}
                                  </div>
                                </>
                              )}
                              {
                                selectedRoles.length <= 0 && (selectedUserCompanyId ? "Seleccione..." : "Seleccione una empresa primero")
                              }
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80 p-0">
                            <Command>
                              <CommandInput placeholder="Buscar rol..." />
                              <CommandList className="max-h-60 overflow-auto">
                                <CommandEmpty>No se encontraron roles.</CommandEmpty>
                                <CommandGroup>
                                  {
                                    isRolesLoading && <Loader2 className="animate-spin size-4" />
                                  }
                                  {roles?.map((role) => (
                                    <CommandItem
                                      key={role.id}
                                      value={role.name}
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
                                  ))}
                                  {
                                    rolesError && <p className="text-center text-muted-foreground text-sm">Ha ocurrido un error al cargar los roles...</p>
                                  }
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="module_ids"
                    render={() => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Módulo(s)</FormLabel>
                        <Popover open={openModules} onOpenChange={setOpenModules}>
                          <PopoverTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              className="w-full justify-between"
                              disabled={!selectedUserCompanyId}
                            >
                              {selectedModuleIds.length > 0
                                ? `${selectedModuleIds.length} módulo(s)`
                                : (selectedUserCompanyId ? "Seleccionar módulos" : "Seleccione una empresa primero")}
                              <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                            </Button>
                          </PopoverTrigger>

                          <PopoverContent className="w-80 p-0">
                            <Command>
                              <CommandInput placeholder="Buscar módulo..." />
                              <CommandList className="max-h-60 overflow-auto">
                                <CommandEmpty>No hay módulos</CommandEmpty>
                                <CommandGroup>
                                  {selectedUserCompanyModules.map((module) => (
                                    <CommandItem
                                      key={module.id}
                                      value={module.label}
                                      onSelect={() => handleModuleSelect(module.id)}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          isModuleSelected(module.id)
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      {module.label}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                </div>

              </div>

              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                >
                  Volver
                </Button>

                <Button
                  type="button"
                  onClick={form.handleSubmit(onSubmit)}
                  disabled={createEmployee.isPending}
                >
                  Crear Usuario + Empleado
                </Button>
              </div>

            </div>
          </div>
        )}

      </form>
    </Form>
  );
}
