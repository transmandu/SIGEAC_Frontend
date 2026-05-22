"use client";

import { useUpdateCompany } from "@/actions/sistema/empresas/actions";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Upload, Trash2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

/* =========================
   SCHEMA
========================= */
const FormSchema = z.object({
  description: z.string(),
  fiscal_address: z.string(),
  rif: z.string(),

  cod_inac: z.string().optional(),
  cod_iata: z.string().optional(),
  cod_oaci: z.string().optional(),

  phone_number: z.string(),
  alt_phone_number: z.string().optional(),

  modules: z.array(z.string()),
  locations: z.array(z.string()),

  logo: z.any().optional(),
});

type FormValues = z.infer<typeof FormSchema>;

interface Props {
  company: any;
  onSuccess?: () => void;
}

export function CompanyUpdateForm({ company, onSuccess }: Props) {
  const updateCompany = useUpdateCompany();

  const fileRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      description: "",
      fiscal_address: "",
      rif: "",
      phone_number: "",
      alt_phone_number: "",
      cod_inac: "",
      cod_iata: "",
      cod_oaci: "",
      modules: [],
      locations: [],
      logo: undefined,
    },
  });

  /* =========================
     INIT
  ========================= */
  useEffect(() => {
    if (!company) return;

    form.reset({
      description: company.description ?? "",
      fiscal_address: company.fiscal_address ?? "",
      rif: company.rif ?? "",
      phone_number: String(company.phone_number ?? ""),
      alt_phone_number: String(company.alt_phone_number ?? ""),
      cod_inac: company.cod_inac ?? "",
      cod_iata: company.cod_iata ?? "",
      cod_oaci: company.cod_oaci ?? "",
      modules: company.modules?.map((m: any) => String(m.id)) ?? [],
      locations: company.locations?.map((l: any) => String(l.id)) ?? [],
      logo: undefined,
    });
  }, [company, form]);

  /* =========================
     FILE
  ========================= */
  const handleFile = (file?: File) => {
    if (!file) return;
    form.setValue("logo", file, { shouldDirty: true });
    setPreview(URL.createObjectURL(file));
  };

  const removeLogo = () => {
    form.setValue("logo", undefined, { shouldDirty: true });
    setPreview(null);
  };

  /* =========================
     SUBMIT (SMART PATCH FORM)
  ========================= */
  const onSubmit = async (values: FormValues) => {
    if (!company) return;

    const formData = new FormData();

    const appendIfValid = (key: string, value: any) => {
      if (value !== undefined && value !== null && value !== "") {
        formData.append(key, value);
      }
    };

    /* =========================
       SCALARS
    ========================= */
    appendIfValid("description", values.description);
    appendIfValid("fiscal_address", values.fiscal_address);
    appendIfValid("rif", values.rif);
    appendIfValid("phone_number", values.phone_number);
    appendIfValid("alt_phone_number", values.alt_phone_number);
    appendIfValid("cod_inac", values.cod_inac);
    appendIfValid("cod_iata", values.cod_iata);
    appendIfValid("cod_oaci", values.cod_oaci);

    /* =========================
       MODULES (sync completo solo si viene)
    ========================= */
    values.modules.forEach((id) => {
      formData.append("modules[]", String(id));
    });

    /* =========================
       LOCATIONS (sync completo solo si viene)
    ========================= */
    values.locations.forEach((id) => {
      formData.append("locations[]", String(id));
    });

    /* =========================
       LOGO
    ========================= */
    if (values.logo instanceof File) {
      formData.append("logo", values.logo);
    }

    await updateCompany.updateCompany.mutateAsync({
      id: company.id,
      data: formData,
    });

    onSuccess?.();
  };

  const logoSrc = preview || company?.logo_url;

  /* =========================
     UI
  ========================= */
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* INFO */}
          <div className="border rounded-xl p-4 space-y-3">
            <FormField
              name="description"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              name="fiscal_address"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección fiscal</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              name="rif"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>RIF</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          {/* CONTACTO */}
          <div className="border rounded-xl p-4 space-y-3">
            <FormField
              name="phone_number"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              name="alt_phone_number"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono alterno</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* LOGO */}
        <div className="flex justify-between items-center border rounded-xl p-4">
          <div className="relative size-16 border rounded-lg overflow-hidden">
            {logoSrc ? (
              <Image src={logoSrc} alt="logo" fill className="object-cover" />
            ) : (
              <div className="text-xs flex items-center justify-center h-full">
                Sin logo
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button type="button" onClick={() => fileRef.current?.click()}>
              <Upload className="size-4" />
            </Button>

            <Button type="button" onClick={removeLogo}>
              <Trash2 className="size-4" />
            </Button>

            <input
              ref={fileRef}
              type="file"
              hidden
              accept="image/*"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </div>
        </div>

        {/* SUBMIT */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={updateCompany.updateCompany.isPending}
          >
            {updateCompany.updateCompany.isPending && (
              <Loader2 className="mr-2 size-4 animate-spin" />
            )}
            Guardar cambios
          </Button>
        </div>

      </form>
    </Form>
  );
}