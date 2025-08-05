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
import { useGetCompanies } from "@/hooks/sistema/useGetCompanies";
import { useGetLocationsByCompanies } from "@/hooks/sistema/useGetLocationsByCompanies";
import { useGetRoles } from "@/hooks/sistema/usuario/useGetRoles";
import { useGetUsers } from "@/hooks/sistema/usuario/useGetUsers";
import { cn } from "@/lib/utils";
import loadingGif from '@/public/loading2.gif';
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown, Eye, EyeOff, Loader2 } from 'lucide-react';
import Image from "next/image";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../ui/accordion";
import { Badge } from "../../ui/badge";
import { Checkbox } from "../../ui/checkbox";
import { Label } from "../../ui/label";
import { Separator } from "../../ui/separator";

interface CreateUserFormProps {
  defaultValues?: Partial<FormSchemaType>;
  onSubmit: (data: FormSchemaType) => void;
}


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
      locationID: z.array(z.number().or(z.string()))
    })
  ).optional(),
  isActive: z.boolean(),
})


type FormSchemaType = z.infer<typeof FormSchema>



export function CreateUserFromEmployeeForm({ defaultValues, onSubmit }: CreateUserFormProps) {

  const { data: users } = useGetUsers();

  const { data: roles, error: rolesError, isLoading: isRolesLoading } = useGetRoles();

  const { data: companies, error: companiesError, isLoading: isCompaniesLoading } = useGetCompanies();

  const { data: companies_locations, error: companies_locationsError, isLoading: companies_locationsLoading } = useGetLocationsByCompanies();

  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const [openRoles, setOpenRoles] = useState(false);

  const [showPwd, setShowPwd] = useState(false);

  const { createUser } = useCreateUser();

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      username: "",
      password: "",
      email: "",
      isActive: true,
      ...defaultValues, // Apply passed default values
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

  // Usar useEffect para actualizar el valor del formulario
  useEffect(() => {
    form.setValue('roles', selectedRoles);
  }, [selectedRoles, form]);


  const isRoleSelected = (value: string) => selectedRoles.includes(value);

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
                          selectedRoles.length <= 0 && "Seleccione..."
                        }
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command>
                        <CommandInput placeholder="Buscar rol..." />
                        <CommandList>
                          <CommandEmpty>No company found.</CommandEmpty>
                          <CommandGroup>
                            {
                              isRolesLoading && <Loader2 className="animate-spin size-4" />
                            }
                            {roles?.map((role) => (
                              <CommandItem
                                key={role.id}
                                value={role.id.toString()}
                                onSelect={() => handleRoleSelect(role.id.toString())}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    isRoleSelected(role.id.toString()) ? "opacity-100" : "opacity-0"
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
              name="companies_locations"
              render={({ field }) => {
                const handleLocationChange = (companyID: number, locationID: number, isSelected: boolean | string) => {
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
                    <Accordion className="w-full" type="single" collapsible>
                      {companies &&
                        companies.map((company) => (
                          <AccordionItem key={company.id} value={company.name}>
                            <AccordionTrigger>{company.name}</AccordionTrigger>
                            <AccordionContent>
                              {companies_locations &&
                                companies_locations
                                  .filter((location) => location.company_id === company.id)
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
                                                  item.companyID === company.id &&
                                                  item.locationID.includes(loc.id)
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
                    </Accordion>
                  </FormItem>
                );
              }}
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
