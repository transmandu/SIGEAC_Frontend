"use client"

import { useState } from "react"
import { MoreHorizontal, Loader2, Pencil, Trash2 } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useCompanyStore } from "@/stores/CompanyStore"
import { useUpdateRetailer, useDeleteRetailer } from "@/actions/ajustes/globales/comercios/actions"
import { Retailer } from "@/types"

const formSchema = z.object({
  name: z.string().min(2, { message: "El nombre debe tener al menos 2 carácteres." }),
  address: z.string().optional(),
  phone: z.string().optional(),
})

export function RetailerDropdownActions({ retailer }: { retailer: Retailer }) {
  const { selectedCompany } = useCompanyStore()
  const { updateRetailer } = useUpdateRetailer()
  const { deleteRetailer } = useDeleteRetailer()

  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: retailer.name ?? "",
      address: retailer.address ?? "",
      phone: retailer.phone ?? "",
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await updateRetailer.mutateAsync({
        id: retailer.id,
        ...values,
        company: selectedCompany!.slug,
      })
    } catch (error) {
    }
    setEditOpen(false)
  }

  const onDelete = async () => {
    try {
      await deleteRetailer.mutateAsync({
        id: retailer.id,
        company: selectedCompany!.slug,
      })
    } catch (error) {
    }
    setDeleteOpen(false)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menú</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setEditOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" /> Editar
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onSelect={() => setDeleteOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* ── Editar ── */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[490px]">
          <DialogHeader>
            <DialogTitle>Editar Comercio</DialogTitle>
            <DialogDescription>Actualice la información del comercio.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-2 justify-center">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Nombre del Comercio</FormLabel>
                      <FormControl>
                        <Input placeholder="EJ: Ferretería EPA, Mercado Libre, etc..." {...field} />
                      </FormControl>
                      <FormDescription>Tienda física o sitio en línea donde se compra.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Nro. de TLF</FormLabel>
                      <FormControl>
                        <Input placeholder="..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Ubicación</FormLabel>
                      <FormControl>
                        <Input placeholder="..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button
                className="bg-primary mt-2 text-white hover:bg-blue-900 disabled:bg-primary/70"
                disabled={updateRetailer?.isPending}
                type="submit"
              >
                {updateRetailer?.isPending ? <Loader2 className="size-4 animate-spin" /> : <p>Guardar cambios</p>}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* ── Eliminar ── */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este comercio?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará <span className="font-semibold">{retailer.name}</span> del registro de comercios.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                onDelete()
              }}
              disabled={deleteRetailer?.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteRetailer?.isPending ? <Loader2 className="size-4 animate-spin" /> : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
