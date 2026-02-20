"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import axiosInstance from "@/lib/axios"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Props {
  userId: number
  isActive: boolean
}

export default function UserStatusButton({ userId, isActive }: Props) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (newStatus: boolean) => {
      // axiosInstance ya tiene baseURL + token
      await axiosInstance.put(`/user/${userId}/status`, { isActive: newStatus })
      return newStatus
    },
    onMutate: async (newStatus) => {
      await queryClient.cancelQueries({ queryKey: ["users"] })
      const previousUsers = queryClient.getQueryData<any>(["users"])

      queryClient.setQueryData(["users"], (old: any) => {
        if (!old) return old
        return old.map((user: any) =>
          user.id === userId ? { ...user, isActive: newStatus ? "1" : "0"} : user
        )
      })

      return { previousUsers }
    },
    onError: (_, __, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(["users"], context.previousUsers)
      }
      toast.error("No se pudo actualizar el usuario")
    },
    onSuccess: (newStatus) => {
      toast.success(
        newStatus
          ? "Usuario reactivado correctamente"
          : "Usuario deshabilitado correctamente"
      )
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })

  const newStatus = !isActive

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <button disabled={mutation.isPending}>
          <Badge
            className={`cursor-pointer transition-all hover:opacity-80 ${
              isActive ? "bg-emerald-500" : "bg-rose-500"
            } ${mutation.isPending ? "opacity-50" : ""}`}
          >
            {mutation.isPending
              ? "Procesando..."
              : isActive
              ? "ACTIVO"
              : "INACTIVO"}
          </Badge>
        </button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isActive ? "Deshabilitar usuario" : "Reactivar usuario"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            ¿Deseas {isActive ? "deshabilitar" : "reactivar"} este usuario?
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={mutation.isPending}
            onClick={() => {
              mutation.mutate(newStatus)
              setOpen(false)
            }}
          >
            Confirmar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}