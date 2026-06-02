"use client"

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Loader2 } from "lucide-react"

import { useUpdateDepartment } from "@/actions/general/departamento/actions"
import { useCompanyStore } from "@/stores/CompanyStore"
import { Department } from "@/types"

/* =========================
   VALIDATION
========================= */
const departmentSchema = z.object({
  acronym: z.string().min(1, "El acrónimo es obligatorio"),
  name: z.string().min(1, "El nombre es obligatorio"),
  email: z.string().email("Correo no válido"),
})

type DepartmentForm = z.infer<typeof departmentSchema>

type Props = {
  department: Department
  onClose?: () => void
  onSuccess?: () => void
}

export function UpdateDepartmentForm({
  department,
  onClose,
  onSuccess,
}: Props) {
  const { selectedCompany } = useCompanyStore()
  const { updateDepartment } = useUpdateDepartment()

  /* =========================
     FORM (con valores previos)
  ========================= */
  const form = useForm<DepartmentForm>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      acronym: department.acronym ?? "",
      name: department.name ?? "",
      email: department.email ?? "",
    },
  })

  /* =========================
     SUBMIT (PATCH LÓGICO)
     - solo envía lo que existe en form
     - lo no editado se mantiene igual en backend
  ========================= */
  const onSubmit = async (data: DepartmentForm) => {
    if (!selectedCompany) return

    await updateDepartment.mutateAsync({
      id: department.id,
      acronym: data.acronym,
      name: data.name,
      email: data.email,
      company: selectedCompany.slug,
    })

    onSuccess?.()
    onClose?.()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {/* =========================
            ACRONYM
        ========================= */}
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

        {/* =========================
            NAME
        ========================= */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej: Tecnología de la Información"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* =========================
            EMAIL
        ========================= */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Correo electrónico</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="correo@empresa.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* =========================
            ACTIONS
        ========================= */}
        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            disabled={updateDepartment.isPending}
            className="bg-blue-600 hover:bg-blue-600/90"
          >
            {updateDepartment.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              "Guardar cambios"
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}