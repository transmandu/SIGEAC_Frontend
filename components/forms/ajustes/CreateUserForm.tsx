"use client"

import { useCreateUser } from "@/actions/aerolinea/usuarios/actions";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAddModulesToUser } from "@/actions/sistema/usuarios/actions";
import { useGetCompanies } from "@/hooks/sistema/useGetCompanies";
import { useGetLocationsByCompanies } from "@/hooks/sistema/useGetLocationsByCompanies";
import { useGetRoles } from "@/hooks/sistema/usuario/useGetRoles";
import { useGetUsers } from "@/hooks/sistema/usuario/useGetUsers";
import { cn } from "@/lib/utils";
import loadingGif from '@/public/loading2.gif';
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown, Eye, EyeOff, Loader2 } from 'lucide-react';
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { Badge } from "../../ui/badge";
import { Checkbox } from "../../ui/checkbox";
import { Label } from "../../ui/label";
import { Separator } from "../../ui/separator";
import { Location as AppLocation } from '@/types';

const FormSchema = z.object({
  first_name: z.string().min(3, {
    message: "El usuario debe tener al menos 3 caracteres.",
  }),
  last_name: z.string().min(2, {
    message: "La contraseña debe tener al menos 5 caracteres.",
  }),
  username: z.string().min(2, {
    message: "La contraseña debe tener al menos 5 caracteres.",
  }),
  password: z.string().min(2, {
    message: "La contraseña debe tener al menos 5 caracteres.",
  }),
  email: z.string({
    message: "Debe ingresar un correo electrónico válido."
  }),
  roles: z.array(z.string(), {
    message: "Debe seleccionar un rol."
  }),
  companies_locations: z.array(
    z.object({
      companyID: z.number(),
      locationID: z.array(z.number().or(z.string())).min(1, {
        message: "Debe seleccionar al menos una ubicación.",
      })
    })
  ).min(1, {
    message: "Debe seleccionar una empresa.",
  }),
  module_ids: z.array(z.number()).optional(),
  isActive: z.boolean(),
})


type FormSchemaType = z.infer<typeof FormSchema>

const resolveCreatedUserId = (response: unknown): string | undefined => {
  const r = response as {
    data?: { user?: { id?: string | number }; id?: string | number };
    user?: { id?: string | number };
    id?: string | number;
  };
  const id = r?.data?.user?.id ?? r?.user?.id ?? r?.data?.id ?? r?.id;
  return id !== undefined && id !== null ? String(id) : undefined;
};

export function CreateUserForm() {

  const { data: users, error, isLoading } = useGetUsers();

  const { data: companies, error: companiesError, isLoading: isCompaniesLoading } = useGetCompanies();

  const { data: companies_locations, error: companies_locationsError, isLoading: companies_locationsLoading } = useGetLocationsByCompanies();

  const [selectedCompanyId, setSelectedCompanyId] = useState<number | undefined>(undefined);

  const { data: roles, error: rolesError, isLoading: isRolesLoading } = useGetRoles(selectedCompanyId);

  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const [selectedModuleIds, setSelectedModuleIds] = useState<number[]>([]);

  const [openRoles, setOpenRoles] = useState(false);

  const [openModules, setOpenModules] = useState(false);

  const [showPwd, setShowPwd] = useState(false);

  const { createUser } = useCreateUser();

  const { addModules } = useAddModulesToUser();

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      companies_locations: [],
      first_name: "",
      last_name: "",
      username: "",
      password: "",
      email: "",
      isActive: true,
    },
  })

  const { setValue, control, setError, clearErrors } = form;
  const firstName = useWatch({ control, name: 'first_name' });
  const lastName = useWatch({ control, name: 'last_name' });
  const [debouncedUsername, setDebouncedUsername] = useState("");


  useEffect(() => {
    const handler = setTimeout(() => {
      if (firstName && lastName) {
        const newUsername = `${firstName.charAt(0)}${lastName}`.toLowerCase();
        const isUsernameTaken = users?.some(user => user.username === newUsername);

        if (isUsernameTaken) {
          setError("username", {
            type: "manual",
            message: "El nombre de usuario ya está en uso."
          });
        } else {
          clearErrors("username");
          setDebouncedUsername(newUsername);
        }
      }
    }, 500); // Ajusta el tiempo del debounce según sea necesario

    return () => {
      clearTimeout(handler);
    };
  }, [firstName, lastName, clearErrors, setError, users]);

  useEffect(() => {
    if (debouncedUsername) {
      setValue('username', debouncedUsername);
    }
  }, [debouncedUsername, setValue]);

  const handleRoleSelect = (currentValue: string) => {
    setSelectedRoles((prevSelected) =>
      prevSelected.includes(currentValue)
        ? prevSelected.filter((value) => value !== currentValue)
        : [...prevSelected, currentValue]
    );
  };

  const isRoleSelected = (value: string) => selectedRoles.includes(value);

  const handleModuleSelect = (moduleId: number) => {
    setSelectedModuleIds((prevSelected) =>
      prevSelected.includes(moduleId)
        ? prevSelected.filter((id) => id !== moduleId)
        : [...prevSelected, moduleId]
    );
  };

  const isModuleSelected = (moduleId: number) => selectedModuleIds.includes(moduleId);

  const handleCompanyChange = (companyID: string) => {
    const parsedCompanyID = Number(companyID);
    setSelectedCompanyId(parsedCompanyID);
    form.setValue('companies_locations', [{ companyID: parsedCompanyID, locationID: [] }]);
    setSelectedRoles([]);
    setSelectedModuleIds([]);
  };


  // Usar useEffect para actualizar el valor del formulario
  useEffect(() => {
    form.setValue('roles', selectedRoles);
  }, [selectedRoles, form]);

  useEffect(() => {
    form.setValue('module_ids', selectedModuleIds);
  }, [selectedModuleIds, form]);

  const onSubmit = async (data: FormSchemaType) => {
    try {
      // Verifica si el nombre de usuario ya existe
      const isUsernameTaken = users?.some(user => user.username === data.username);

      if (isUsernameTaken) {
        setError("username", {
          type: "manual",
          message: "El nombre de usuario ya está en uso."
        });
        return;
      } else {
        clearErrors("username");

        // Convertir roles de string a number
        const rolesAsNumbers = data.roles.map(role => Number(role));

        // Crear una copia de los datos con los roles convertidos
        const formattedData = {
          ...data,
          roles: rolesAsNumbers
        };

        const userResponse = await createUser.mutateAsync(formattedData);
        const newUserId = resolveCreatedUserId(userResponse);

        if (selectedCompanyId && data.module_ids && data.module_ids.length > 0) {
          if (!newUserId) {
            console.error("No se pudo determinar el ID del usuario recién creado para asignar los módulos.", userResponse);
          } else {
            await addModules.mutateAsync({
              userId: newUserId,
              companyId: selectedCompanyId,
              moduleIds: data.module_ids,
            });
          }
        }
      }
    } catch (error) {
      console.error("Error al crear usuario:", error);
    }
  };
  const locationsByCompany = useMemo(() => {
    if (!companies_locations) return {};

    return companies_locations.reduce((acc, item) => {
      acc[item.company_id] = item.locations;
      return acc;
    }, {} as Record<number, AppLocation[]>);
  }, [companies_locations]);

  const selectedCompanyModules = useMemo(() => {
    return companies?.find((company) => company.id === selectedCompanyId)?.modules ?? [];
  }, [companies, selectedCompanyId]);
  
  return (
    <Form {...form}>

      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col space-y-3">
        <div className="grid grid-cols-2">
          <div className="space-y-3">
            <div className='flex gap-2 items-center'>
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Angel" {...field} />
                    </FormControl>
                    <FormMessage className="text-xs" />
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
                      <Input placeholder="Ej: Perez" {...field} />
                    </FormControl>
                    <FormMessage className="text-xs" />
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
                    <Input placeholder="Ej: example@example.com" {...field} />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Usuario</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: aperez" {...field} />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex gap-2 items-center">Contraseña {showPwd ? <EyeOff onClick={() => setShowPwd(!showPwd)} className="size-5 cursor-pointer hover:scale-110 transition-all" /> : <Eye onClick={() => setShowPwd(!showPwd)} className="size-5 cursor-pointer hover:scale-110 transition-all" />}</FormLabel>
                  <FormControl>
                    <Input type={showPwd ? "text" : "password"} {...field} />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </div>
          <div className="flex flex-col justify-center items-center space-y-3 w-full mt-2">
            <FormItem className="flex flex-col w-[200px]">
              <FormLabel>Empresa</FormLabel>
              <Select
                value={selectedCompanyId ? selectedCompanyId.toString() : undefined}
                onValueChange={handleCompanyChange}
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
                  if (!selectedCompanyId) return;

                  const currentValue = [...(field.value || [])]; // ✅ no mutar referencia

                  const companyIndex = currentValue.findIndex(
                    (item) => item.companyID === selectedCompanyId
                  );

                  if (companyIndex === -1 && isSelected) {
                    currentValue.push({
                      companyID: selectedCompanyId,
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

                const locations = selectedCompanyId ? (locationsByCompany[selectedCompanyId] || []) : [];

                return (
                  <FormItem className="flex flex-col items-start rounded-md space-y-2 py-2 px-6 w-full">
                    <FormLabel>Ubicaciones</FormLabel>

                    {!selectedCompanyId && (
                      <p className="text-xs text-muted-foreground">
                        Seleccione una empresa primero.
                      </p>
                    )}

                    {/* 🔄 Loading */}
                    {selectedCompanyId && companies_locationsLoading && (
                      <Loader2 className="animate-spin size-4" />
                    )}

                    {selectedCompanyId && !companies_locationsLoading && locations.length === 0 && (
                      <p className="text-xs text-muted-foreground">
                        No hay ubicaciones
                      </p>
                    )}

                    <div className="flex flex-col gap-2">
                      {locations.map((loc) => (
                        <div
                          className="flex items-center space-x-2"
                          key={loc.id}
                        >
                          <Checkbox
                            checked={Boolean(
                              field.value?.find(
                                (item) =>
                                  item.companyID === selectedCompanyId &&
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
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Rol(es)</FormLabel>
                  <Popover open={openRoles} onOpenChange={setOpenRoles}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-[200px] justify-between"
                        disabled={!selectedCompanyId}
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
                          selectedRoles.length <= 0 && (selectedCompanyId ? "Seleccione..." : "Seleccione una empresa primero")
                        }
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command>
                        <CommandInput placeholder="Buscar rol..." />
                        <CommandList>
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
                                className="flex items-center justify-start pl-1 pr-1 py-1 text-[12px] cursor-pointer"
                              >
                                <div className="flex items-center gap-1 w-full text-left">
                                  <Check
                                    className={cn(
                                      "h-3 w-3 shrink-0",
                                      isRoleSelected(role.id.toString()) ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  <span className="truncate flex-1 text-left leading-none tracking-tighter">
                                    {role.name}
                                  </span>
                                </div>
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
                        className="w-[200px] justify-between"
                        disabled={!selectedCompanyId}
                      >
                        {selectedModuleIds?.length > 0 && (
                          <>
                            <Separator orientation="vertical" className="mx-2 h-4" />
                            <Badge
                              variant="secondary"
                              className="rounded-sm px-1 font-normal lg:hidden"
                            >
                              {selectedModuleIds.length}
                            </Badge>
                            <div className="hidden space-x-1 lg:flex">
                              {selectedModuleIds.length > 2 ? (
                                <Badge
                                  variant="secondary"
                                  className="rounded-sm px-1 font-normal"
                                >
                                  {selectedModuleIds.length} seleccionados
                                </Badge>
                              ) : (
                                selectedCompanyModules
                                  .filter((option) => selectedModuleIds.includes(option.id))
                                  .map((option) => (
                                    <Badge
                                      variant="secondary"
                                      key={option.id}
                                      className="rounded-sm px-1 font-medium"
                                    >
                                      {option.label}
                                    </Badge>
                                  ))
                              )}
                            </div>
                          </>
                        )}
                        {
                          selectedModuleIds.length <= 0 && (selectedCompanyId ? "Seleccione..." : "Seleccione una empresa primero")
                        }
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command>
                        <CommandInput placeholder="Buscar módulo..." />
                        <CommandList>
                          <CommandEmpty>No se encontraron módulos.</CommandEmpty>
                          <CommandGroup>
                            {selectedCompanyModules.map((module) => (

                              <CommandItem
                                key={module.id}
                                value={module.label}
                                onSelect={() => handleModuleSelect(module.id)}
                                className="flex items-center justify-start pl-1 pr-1 py-1 text-[12px] cursor-pointer"
                              >
                                <div className="flex items-center gap-1 w-full text-left">
                                  <Check
                                    className={cn(
                                      "h-3 w-3 shrink-0",
                                      isModuleSelected(module.id) ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  <span className="truncate flex-1 text-left leading-none tracking-tighter">
                                    {module.label}
                                  </span>
                                </div>
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
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-col items-start rounded-md space-y-2 py-2">
              <FormLabel>¿Se encuentra activo?</FormLabel>
              <div className="flex gap-2 items-center justify-center">
                <FormControl>
                  <Checkbox
                    className="checked:bg-primary"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Sí, el usuario se encuentra activo.
                  </FormLabel>
                </div>
              </div>
            </FormItem>
          )}
        />
        <div className="flex justify-between items-center gap-x-4">
          <Separator className="flex-1" />
          <p className="text-muted-foreground">SIGEAC</p>
          <Separator className="flex-1" />
        </div>
        <Button className="bg-primary text-white hover:bg-blue-900 disabled:bg-slate-50 disabled:border-dashed disabled:border-black" disabled={createUser?.isPending} type="submit">
          {createUser?.isPending ? <Image className="text-black" src={loadingGif} width={170} height={170} alt="Loading..." /> : <p>Crear Usuario</p>}
        </Button>
      </form>
    </Form>
  )
}
