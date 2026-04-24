"use client";

import { useUpdateEmployee } from "@/actions/general/empleados/actions";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGetJobTitles } from "@/hooks/sistema/cargo/useGetJobTitles";
import { useGetDepartments } from "@/hooks/sistema/departamento/useGetDepartment";
import { useGetLocationsByCompany } from "@/hooks/sistema/useGetLocationsByCompany";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useGetUsers } from "@/hooks/sistema/useGetUsers";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Upload, Trash2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

/* =========================
   SCHEMA
========================= */

const formSchema = z.object({
  first_name: z.string().min(1),
  middle_name: z.string().optional(),
  last_name: z.string().min(1),
  second_last_name: z.string().optional(),
  dni: z.string(),
  dni_type: z.string(),
  blood_type: z.string(),
  job_title_id: z.string(),
  department_id: z.string(),
  location_id: z.string(),
  user_id: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  birth_date: z.string().optional(),
  profile_photo: z.any().optional(),
});

type FormValues = z.infer<typeof formSchema>;

/* =========================
   TYPES
========================= */

interface Option {
  id: string | number;
  name?: string;
  address?: string;
}

interface Props {
  employee: any;
  onSuccess?: () => void;
}

/* =========================
   COMPONENT
========================= */

export function UpdateEmployeeForm({
  employee,
  onSuccess,
}: Props) {
  const { selectedCompany } = useCompanyStore();
  const updateEmployee = useUpdateEmployee();
  const [step, setStep] = useState<1 | 2>(1);

  const { data: locations } = useGetLocationsByCompany(selectedCompany?.slug);
  const { data: departments } = useGetDepartments(selectedCompany?.slug);
  const { data: jobTitles } = useGetJobTitles(selectedCompany?.slug);
  const { data: users } = useGetUsers();

  const fileRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const imageSrc = preview || employee?.photo_url;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: "",
      middle_name: "",
      last_name: "",
      second_last_name: "",
      dni: "",
      dni_type: "",
      blood_type: "",
      job_title_id: "",
      department_id: "",
      location_id: "",
      user_id: "",
      email: "",
      phone: "",
      address: "",
      profile_photo: null,
      birth_date: "",
    },
  });

  /* =========================
     RESET ESTABLE
  ========================= */

  useEffect(() => {
    if (!employee) return;

    form.reset({
      first_name: employee.first_name ?? "",
      middle_name: employee.middle_name ?? "",
      last_name: employee.last_name ?? "",
      second_last_name: employee.second_last_name ?? "",
      dni: employee.dni ?? "",
      dni_type: employee.dni_type ?? "",
      blood_type: employee.blood_type ?? "",
      job_title_id: employee.job_title_id
        ? String(employee.job_title_id)
        : "",
      department_id: employee.department_id
        ? String(employee.department_id)
        : "",
      location_id: employee.location_id
        ? String(employee.location_id)
        : "",
      user_id: employee.user_id ? String(employee.user_id) : "",
      email: employee.email ?? "",
      phone: employee.phone ?? "",
      address: employee.address ?? "",
      profile_photo: undefined,
      birth_date: employee.birth_date ?? "",
    });
  }, [employee, form]);

  /* =========================
     STEP NAV
  ========================= */

  const nextStep = async () => {
    const valid = await form.trigger([
      "first_name",
      "last_name",
      "dni",
      "dni_type",
      "blood_type",
    ]);

    if (valid) setStep(2);
  };

  const prevStep = () => setStep(1);

  const handleSelectFile = () => {
    fileRef.current?.click();
  };

  const handleRemovePhoto = () => {
    form.setValue("profile_photo", undefined);
  };

  /* =========================
     SUBMIT (FORMDATA SAFE)
  ========================= */
const buildFormData = (values: FormValues, original: any) => {
  const formData = new FormData();

  const REQUIRED = new Set([
    "first_name",
    "last_name",
    "dni",
    "dni_type",
    "blood_type",
    "job_title_id",
    "department_id",
    "location_id",
  ]);

  Object.entries(values).forEach(([key, value]) => {
    const originalValue = original?.[key];

    // 1. eliminar basura real
    if (value === undefined || value === null) return;
    if (typeof value === "string" && value.trim() === "") {
      if (REQUIRED.has(key)) return; // evita mandar vacío en obligatorios
      return;
    }

    // 2. evitar overwrite innecesario
    if (
      typeof value !== "object" &&
      String(value) === String(originalValue ?? "")
    ) {
      return;
    }

    // 3. file
    if (value instanceof File) {
      formData.append(key, value);
      return;
    }

    formData.append(key, String(value));
  });

  return formData;
};

    const onSubmit = async (values: FormValues) => {
    if (step !== 2) return;
    if (!selectedCompany) return;

    const formData = buildFormData(values, employee);

    await updateEmployee.mutateAsync({
        company: selectedCompany.slug,
        id: Number(employee.id),
        data: formData,
    });

    onSuccess?.();
    };

  /* =========================
     HELPERS
  ========================= */

  const isEmpty = (v?: string) => !v || v === "";

  const normalizeOptions = (data?: Option[]) =>
    data?.map((o) => ({
      id: String(o.id),
      label: o.name ?? o.address ?? "Sin nombre",
    })) ?? [];

  /* =========================
     SELECT FIELD (TIPADO)
  ========================= */

  type SelectFieldProps = {
    name: keyof FormValues;
    label: string;
    options: { id: string; label: string }[];
    placeholder: string;
  };

  const SelectField = ({
    name,
    label,
    options,
    placeholder,
  }: SelectFieldProps) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select value={field.value || ""} onValueChange={field.onChange}>
            <FormControl>
              <SelectTrigger
                className={
                  isEmpty(field.value) ? "text-muted-foreground opacity-60" : ""
                }
              >
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>

            <SelectContent>
              {options.map((o) => (
                <SelectItem key={o.id} value={o.id}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormItem>
      )}
    />
  );

  /* =========================
     RENDER
  ========================= */

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); } }} className="space-y-8">
        <div className="flex items-center w-full">
        <div className="flex-1" />
        <span className="text-xs text-muted-foreground">
            Paso {step} de 2
        </span>
        </div>

        {/* ================= STEP 1 ================= */}
        {step === 1 && (
        <div className="border rounded-xl p-6 bg-muted/20">
            
            {/* HEADER */}
            <div className="mb-6">
            <p className="text-sm font-medium">Datos personales</p>
            <p className="text-xs text-muted-foreground">
                Información básica del empleado
            </p>
            </div>

            {/* CONTENIDO */}
            <div className="grid grid-cols-12 gap-6 items-stretch">
            <div className="col-span-12 md:col-span-7 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                      <FormLabel>Segundo nombre</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ""} />
                      </FormControl>
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
                      <FormLabel>Apellido</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="second_last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Segundo apellido</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ""} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="dni_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo DNI</FormLabel>
                      <Select key={field.value} value={field.value || ""} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sin asignar" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="V">V</SelectItem>
                          <SelectItem value="E">E</SelectItem>
                          <SelectItem value="J">J</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dni"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>DNI</FormLabel>
                      <FormControl>
                        <Input {...field} disabled />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="blood_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sangre</FormLabel>
                      <Select key={field.value} value={field.value || ""} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sin asignar" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                            (b) => (
                              <SelectItem key={b} value={b}>
                                {b}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* AVATAR */}
            <div className="col-span-12 md:col-span-5 flex">
            <div className="border rounded-xl bg-muted/20 p-6 w-full h-full flex flex-col">
                
                {/* HEADER */}
                <div className="flex justify-center items-center mb-4">
                <p className="text-sm font-medium">Foto del empleado</p>
                </div>

                {/* CONTENIDO (imagen centrada) */}
                <div className="flex justify-center items-center flex-1">
                <div className="relative w-40 h-40 rounded-full overflow-hidden border-2 border-muted shadow-sm bg-background">
                    {imageSrc ? (
                    <Image
                        src={imageSrc}
                        alt="Empleado"
                        fill
                        className="object-cover"
                    />
                    ) : (
                    <span className="text-xs text-muted-foreground text-center px-4">
                        Sin foto<br />del empleado
                    </span>
                    )}
                </div>
                </div>

                {/* ACCIONES */}
                <div className="flex justify-center gap-4 pt-4">
                <TooltipProvider>
                    <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                        type="button"
                        onClick={handleSelectFile}
                        className="p-2 rounded-full border hover:bg-muted transition hover:scale-105"
                        >
                        <Upload className="w-4 h-4" />
                        </button>
                    </TooltipTrigger>
                    <TooltipContent>Cambiar imagen</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="p-2 rounded-full border hover:bg-destructive/10 transition hover:scale-105"
                        >
                        <Trash2 className="w-4 h-4 text-destructive" />
                        </button>
                    </TooltipTrigger>
                    <TooltipContent>Eliminar imagen</TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    form.setValue("profile_photo", file);

                    const url = URL.createObjectURL(file);
                    setPreview(url);
                    }}
                />
                </div>

            </div>
            </div>
            </div>
          </div>
        )}

        {/* ================= STEP 2 ================= */}
        {step === 2 && (
        <div className="space-y-6">

            {/* ================= BLOQUE 1 ================= */}
            <div className="border rounded-xl p-6 space-y-4 bg-muted/20">
            
            {/* HEADER */}
            <div>
                <p className="text-sm font-medium">Datos adicionales</p>
                <p className="text-xs text-muted-foreground">
                Información de contacto del empleado
                </p>
            </div>

            {/* GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                <FormField
                name="email"
                control={form.control}
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Email personal</FormLabel>
                    <FormControl>
                        <Input
                        {...field}
                        value={field.value ?? ""}
                        placeholder="Ej. correo@ejemplo.com"
                        />
                    </FormControl>
                    </FormItem>
                )}
                />

                <FormField
                name="phone"
                control={form.control}
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                        <Input
                        {...field}
                        value={field.value ?? ""}
                        placeholder="Ej. +58 412 1234567"
                        />
                    </FormControl>
                    </FormItem>
                )}
                />

                <FormField
                name="birth_date"
                control={form.control}
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Fecha de nacimiento</FormLabel>
                    <FormControl>
                        <Input
                        type="date"
                        {...field}
                        value={field.value ?? ""}
                        />
                    </FormControl>
                    </FormItem>
                )}
                />

                <FormField
                name="address"
                control={form.control}
                render={({ field }) => (
                    <FormItem className="md:col-span-3">
                    <FormLabel>Dirección</FormLabel>
                    <FormControl>
                        <Input
                        {...field}
                        value={field.value ?? ""}
                        placeholder="Ej. Av. Principal, Edificio X, Piso Y"
                        />
                    </FormControl>
                    </FormItem>
                )}
                />

            </div>
            </div>

            {/* ================= BLOQUE 2 ================= */}
            <div className="border rounded-xl p-6 space-y-4">

            {/* HEADER */}
            <div>
                <p className="text-sm font-medium">Datos organizacionales</p>
                <p className="text-xs text-muted-foreground">
                Asignaciones internas del empleado
                </p>
            </div>

            {/* GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <SelectField
                name="user_id"
                label="Usuario"
                placeholder="Sin usuario"
                options={(() => {
                    const base = users ?? [];

                    const mapped = base.map((u) => ({
                    id: String(u.id),
                    label: u.username,
                    }));

                    const currentUserId = employee?.user_id
                    ? String(employee.user_id)
                    : null;

                    const exists = currentUserId
                    ? mapped.some((u) => u.id === currentUserId)
                    : true;

                    // fallback defensivo
                    if (!exists && employee?.user) {
                    mapped.unshift({
                        id: String(employee.user.id),
                        label: employee.user.username,
                    });
                    }

                    return mapped;
                })()}
                />

                <SelectField
                name="job_title_id"
                label="Cargo"
                placeholder="Sin cargo"
                options={normalizeOptions(jobTitles)}
                />

                <SelectField
                name="department_id"
                label="Departamento"
                placeholder="Sin departamento"
                options={normalizeOptions(departments)}
                />

                <SelectField
                name="location_id"
                label="Ubicación"
                placeholder="Sin ubicación"
                options={normalizeOptions(locations)}
                />

            </div>
            </div>

        </div>
        )}

        {/* ================= ACTIONS ================= */}
        <div className="flex justify-between border-t pt-4">
          {step === 2 ? (
            <Button type="button" variant="outline" onClick={prevStep}>
              Atrás
            </Button>
          ) : (
            <div />
          )}

          {step === 1 ? (
            <Button type="button" onClick={(e) => { e.preventDefault(); nextStep(); }}>
              Siguiente
            </Button>
          ) : (
            <Button type="submit" disabled={updateEmployee.isPending}>
              {updateEmployee.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Guardar
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}