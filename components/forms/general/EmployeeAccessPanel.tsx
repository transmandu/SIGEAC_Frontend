"use client";

import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, Eye, EyeOff, KeyRound } from "lucide-react";
import { Control, useFormContext, useWatch } from "react-hook-form";

import {
  fieldClass,
  hintClass,
  selectTriggerClass,
  triggerButtonClass,
} from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import { PanelFieldLabel, PanelSection } from "@/components/forms/PanelSection";
import { RequiredIndicator } from "@/components/misc/RequiredIndicator";
import {
  SegmentedTabs,
  SegmentedTabsList,
  SegmentedTabsTrigger,
} from "@/components/misc/SegmentedTabs";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
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
} from "@/components/ui/select";
import { useGetUsers } from "@/hooks/sistema/usuario/useGetUsers";
import { useGetRoles } from "@/hooks/sistema/usuario/useGetRoles";
import { useGetCompanies } from "@/hooks/sistema/useGetCompanies";
import { useGetLocationsByCompanies } from "@/hooks/sistema/useGetLocationsByCompanies";
import { locationLabel } from "@/lib/locations";
import { cn } from "@/lib/utils";
import { EmployeeUserPicker, type UserOption } from "./EmployeeUserPicker";
import type { AccessMode, CreateEmployeeFormValues } from "./employeeSchema";

/** Lista de opciones que se marcan y desmarcan, en un popover con buscador. */
function MultiPick({
  options,
  selected,
  onChange,
  placeholder,
  searchPlaceholder,
  emptyText,
  disabled,
  invalid,
}: {
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
  searchPlaceholder: string;
  emptyText: string;
  disabled?: boolean;
  invalid?: boolean;
}) {
  const [open, setOpen] = useState(false);

  const summary = selected.length
    ? selected.length <= 2
      ? options
          .filter((option) => selected.includes(option.value))
          .map((option) => option.label)
          .join(", ")
      : `${selected.length} seleccionados`
    : placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          aria-invalid={invalid}
          className={cn(
            triggerButtonClass,
            !selected.length && "text-muted-foreground",
          )}
        >
          <span className="truncate">{summary}</span>
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="pointer-events-auto w-(--radix-popover-trigger-width) min-w-64 p-0"
        align="start"
      >
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const checked = selected.includes(option.value);

                return (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() =>
                      onChange(
                        checked
                          ? selected.filter((value) => value !== option.value)
                          : [...selected, option.value],
                      )
                    }
                  >
                    <Check
                      className={cn(
                        "mr-2 size-4",
                        checked ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {option.label}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

const MODES: { value: AccessMode; label: string }[] = [
  { value: "none", label: "Sin acceso" },
  { value: "existing", label: "Vincular usuario" },
  { value: "new", label: "Crear usuario" },
];

/**
 * Acceso al sistema del empleado nuevo (solo SUPERUSER: la API de usuarios, roles
 * y empresas lo es). Tres caminos: ninguno, vincular un usuario que ya existe o
 * crear uno con su empresa, ubicaciones, roles y módulos.
 */
export function EmployeeAccessPanel({
  control,
  disabled,
}: {
  control: Control<CreateEmployeeFormValues>;
  disabled?: boolean;
}) {
  const { setValue, getValues } = useFormContext<CreateEmployeeFormValues>();
  const [showPassword, setShowPassword] = useState(false);

  const access = useWatch({ control, name: "access" });
  const companyId = useWatch({ control, name: "new_user.company_id" });
  const locationIds = useWatch({ control, name: "new_user.location_ids" });
  const roleIds = useWatch({ control, name: "new_user.role_ids" });
  const moduleIds = useWatch({ control, name: "new_user.module_ids" });

  const { data: users, isLoading: loadingUsers } = useGetUsers();
  const { data: companies } = useGetCompanies();
  const { data: locationsByCompany, isLoading: loadingLocations } =
    useGetLocationsByCompanies();
  const { data: roles } = useGetRoles(
    companyId ? Number(companyId) : undefined,
  );

  const userOptions = useMemo<UserOption[]>(
    () =>
      (users ?? [])
        .filter((user) => !user.employee || user.employee.length === 0)
        .map((user) => ({
          id: String(user.id),
          label: user.username,
          detail: `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim(),
        })),
    [users],
  );

  const companyLocations = useMemo(
    () =>
      locationsByCompany?.find(
        (entry) => String(entry.company_id) === companyId,
      )?.locations ?? [],
    [locationsByCompany, companyId],
  );

  const companyModules =
    companies?.find((company) => String(company.id) === companyId)?.modules ??
    [];

  const changeMode = (next: AccessMode) => {
    setValue("access", next, { shouldDirty: true });

    if (next !== "existing") setValue("user_id", "");

    // El correo de la cuenta suele ser el mismo de la persona.
    if (next === "new" && !getValues("new_user.email")) {
      setValue("new_user.email", getValues("email"));
    }

    // El usuario sugerido: inicial del nombre + apellido, como se usa en la empresa.
    if (next === "new" && !getValues("new_user.username")) {
      const first = getValues("first_name").trim();
      const last = getValues("last_name").trim();

      if (first && last) {
        setValue(
          "new_user.username",
          `${first[0]}${last}`.toLowerCase().replace(/\s+/g, ""),
        );
      }
    }
  };

  const changeCompany = (next: string) => {
    setValue("new_user.company_id", next, { shouldValidate: true });
    setValue("new_user.location_ids", []);
    setValue("new_user.role_ids", []);
    setValue("new_user.module_ids", []);
  };

  return (
    <PanelSection
      icon={KeyRound}
      title="Acceso al sistema"
      hint="Si la persona va a iniciar sesión, vincule o cree su usuario."
    >
      <div className="space-y-4">
        <SegmentedTabs
          value={access}
          onValueChange={(value) => changeMode(value as AccessMode)}
        >
          <SegmentedTabsList size="sm" className="max-sm:w-full">
            {MODES.map(({ value, label }) => (
              <SegmentedTabsTrigger
                key={value}
                value={value}
                disabled={disabled}
              >
                {label}
              </SegmentedTabsTrigger>
            ))}
          </SegmentedTabsList>
        </SegmentedTabs>

        {access === "none" && (
          <p className="text-[13px] text-muted-foreground max-sm:text-sm">
            La persona queda registrada sin poder iniciar sesión. Se le puede
            vincular un usuario después, editando al empleado.
          </p>
        )}

        {access === "existing" && (
          <FormField
            control={control}
            name="user_id"
            render={({ field, fieldState }) => (
              <FormItem>
                <PanelFieldLabel preventClick>
                  Usuario
                  <RequiredIndicator invalid={!!fieldState.error} />
                </PanelFieldLabel>
                <EmployeeUserPicker
                  value={field.value}
                  onChange={field.onChange}
                  options={userOptions}
                  loading={loadingUsers}
                  disabled={disabled}
                  invalid={!!fieldState.error}
                />
                <FormDescription className={hintClass}>
                  Solo aparecen los usuarios que aún no son de ningún empleado.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {access === "new" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={control}
              name="new_user.username"
              render={({ field, fieldState }) => (
                <FormItem>
                  <PanelFieldLabel>
                    Nombre de usuario
                    <RequiredIndicator invalid={!!fieldState.error} />
                  </PanelFieldLabel>
                  <FormControl>
                    <Input
                      autoComplete="off"
                      placeholder="Ej: jperez"
                      disabled={disabled}
                      className={fieldClass}
                      {...field}
                      onChange={(event) =>
                        field.onChange(
                          event.target.value.toLowerCase().replace(/\s/g, ""),
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="new_user.password"
              render={({ field, fieldState }) => (
                <FormItem>
                  <PanelFieldLabel>
                    Contraseña
                    <RequiredIndicator invalid={!!fieldState.error} />
                  </PanelFieldLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="Mínimo 5 caracteres"
                        disabled={disabled}
                        className={cn(fieldClass, "pr-10")}
                        {...field}
                      />
                    </FormControl>
                    <button
                      type="button"
                      onClick={() => setShowPassword((shown) => !shown)}
                      aria-label={
                        showPassword
                          ? "Ocultar la contraseña"
                          : "Mostrar la contraseña"
                      }
                      className="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="new_user.email"
              render={({ field, fieldState }) => (
                <FormItem className="sm:col-span-2">
                  <PanelFieldLabel>
                    Correo del usuario
                    <RequiredIndicator invalid={!!fieldState.error} />
                  </PanelFieldLabel>
                  <FormControl>
                    <Input
                      type="email"
                      autoComplete="off"
                      placeholder="Ej: correo@empresa.com"
                      disabled={disabled}
                      className={fieldClass}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="new_user.company_id"
              render={({ field, fieldState }) => (
                <FormItem className="sm:col-span-2">
                  <PanelFieldLabel preventClick>
                    Empresa a la que accede
                    <RequiredIndicator invalid={!!fieldState.error} />
                  </PanelFieldLabel>
                  <Select
                    value={field.value}
                    onValueChange={changeCompany}
                    disabled={disabled}
                  >
                    <FormControl>
                      <SelectTrigger
                        className={cn(selectTriggerClass, "w-full")}
                      >
                        <SelectValue placeholder="Seleccione..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {companies?.map((company) => (
                        <SelectItem key={company.id} value={String(company.id)}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {companyId && (
              <>
                <FormField
                  control={control}
                  name="new_user.location_ids"
                  render={({ fieldState }) => (
                    <FormItem className="sm:col-span-2">
                      <PanelFieldLabel>
                        Ubicaciones
                        <RequiredIndicator invalid={!!fieldState.error} />
                      </PanelFieldLabel>
                      {loadingLocations ? (
                        <p className={hintClass}>Cargando ubicaciones...</p>
                      ) : companyLocations.length === 0 ? (
                        <p className={hintClass}>
                          La empresa no tiene ubicaciones.
                        </p>
                      ) : (
                        <div className="grid gap-1 sm:grid-cols-2">
                          {companyLocations.map((location) => {
                            const checked = locationIds.includes(location.id);

                            return (
                              <label
                                key={location.id}
                                className="flex min-h-9 cursor-pointer items-center gap-2.5 rounded-md border px-3 text-sm transition-colors hover:border-blue-400/40 max-sm:min-h-11 max-sm:text-base"
                              >
                                <Checkbox
                                  checked={checked}
                                  disabled={disabled}
                                  onCheckedChange={(next) =>
                                    setValue(
                                      "new_user.location_ids",
                                      next === true
                                        ? [...locationIds, location.id]
                                        : locationIds.filter(
                                            (id) => id !== location.id,
                                          ),
                                      {
                                        shouldDirty: true,
                                        shouldValidate: true,
                                      },
                                    )
                                  }
                                />
                                <span className="truncate">
                                  {locationLabel(location)}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="new_user.role_ids"
                  render={({ fieldState }) => (
                    <FormItem>
                      <PanelFieldLabel preventClick>
                        Roles
                        <RequiredIndicator invalid={!!fieldState.error} />
                      </PanelFieldLabel>
                      <MultiPick
                        options={(roles ?? []).map((role) => ({
                          value: String(role.id),
                          label: role.name,
                        }))}
                        selected={roleIds}
                        onChange={(next) =>
                          setValue("new_user.role_ids", next, {
                            shouldDirty: true,
                            shouldValidate: true,
                          })
                        }
                        placeholder="Seleccione..."
                        searchPlaceholder="Buscar rol..."
                        emptyText="No se encontraron roles."
                        disabled={disabled}
                        invalid={!!fieldState.error}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="new_user.module_ids"
                  render={() => (
                    <FormItem>
                      <PanelFieldLabel preventClick>Módulos</PanelFieldLabel>
                      <MultiPick
                        options={companyModules.map((module) => ({
                          value: String(module.id),
                          label: module.label,
                        }))}
                        selected={moduleIds.map(String)}
                        onChange={(next) =>
                          setValue("new_user.module_ids", next.map(Number), {
                            shouldDirty: true,
                          })
                        }
                        placeholder="Seleccione..."
                        searchPlaceholder="Buscar módulo..."
                        emptyText="La empresa no tiene módulos."
                        disabled={disabled}
                      />
                    </FormItem>
                  )}
                />
              </>
            )}
          </div>
        )}
      </div>
    </PanelSection>
  );
}
