"use client"

import { useEffect, useState } from "react"
import { ArrowDown, ArrowUp, Loader2, Minus, Tag } from "lucide-react"

import { useUpdateRequisitionPriority } from "@/actions/mantenimiento/compras/requisiciones/actions"
import { useCompanyStore } from "@/stores/CompanyStore"
import type { Requisition } from "@/types/purchase"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import LoadingPage from "@/components/misc/LoadingPage"

const priorityOptions = [
  { value: "HIGH", label: "Alta", icon: ArrowUp, className: "text-red-500" },
  { value: "MEDIUM", label: "Media", icon: Minus, className: "text-amber-500" },
  { value: "LOW", label: "Baja", icon: ArrowDown, className: "text-green-500" },
]

const PriorityOptionLabel = ({ value }: { value: string }) => {
  const option = priorityOptions.find((p) => p.value === value)
  if (!option) return null
  const Icon = option.icon

  return (
    <span className="flex items-center gap-2">
      <Icon className={`size-3.5 ${option.className}`} />
      {option.label}
    </span>
  )
}

type Item = {
  id: number
  label: string
  priority?: string
}

type Props = {
  req: Requisition
  open: boolean
  setOpen: (open: boolean) => void
  onSuccess?: () => void
}

const UpdateRequisitionPriorityDialog = ({ req, open, setOpen, onSuccess }: Props) => {
  const { selectedCompany } = useCompanyStore()
  const { updatePriorityRequisition } = useUpdateRequisitionPriority()

  const [headerPriority, setHeaderPriority] = useState<string | undefined>(req.priority)
  const [articlePriorities, setArticlePriorities] = useState<Record<number, string>>({})

  const articleItems: Item[] = (req.batch ?? []).flatMap((batch) =>
    (batch.batch_articles ?? [])
      .filter((article): article is typeof article & { id: number } => article.id != null)
      .map((article) => ({
        id: article.id,
        label: `${batch.name} · ${article.article_part_number}`,
        priority: article.priority,
      }))
  )

  const generalArticleItems: Item[] = (req.general_articles ?? []).map((article) => ({
    id: article.id,
    label: article.description,
    priority: article.priority,
  }))

  const items = [...articleItems, ...generalArticleItems]

  useEffect(() => {
    if (open) {
      setHeaderPriority(req.priority)
      setArticlePriorities({})
    }
  }, [open, req.priority])

  if (!selectedCompany) return <LoadingPage />

  const handleSubmit = async () => {
    const articles = articleItems
      .filter((item) => articlePriorities[item.id] && articlePriorities[item.id] !== item.priority)
      .map((item) => ({ id: item.id, priority: articlePriorities[item.id] }))

    const general_articles = generalArticleItems
      .filter((item) => articlePriorities[item.id] && articlePriorities[item.id] !== item.priority)
      .map((item) => ({ id: item.id, priority: articlePriorities[item.id] }))

    await updatePriorityRequisition.mutateAsync({
      id: req.id,
      data: {
        priority: headerPriority !== req.priority ? headerPriority : null,
        articles,
        general_articles,
      },
      company: selectedCompany.slug
    })

    setOpen(false)
    onSuccess?.()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="
          sm:max-w-[460px]
          rounded-3xl
          border border-border/50
          bg-background/95
          backdrop-blur-xl
          shadow-2xl
          overflow-hidden
        "
      >
        <DialogHeader className="flex flex-col items-center text-center space-y-3">
          <div
            className="
              flex items-center justify-center
              size-12 rounded-2xl
              border border-amber-500/15
              bg-amber-500/[0.08]
            "
          >
            <Tag className="size-5 text-amber-600" />
          </div>

          <DialogTitle className="text-[16px] font-semibold tracking-tight">
            Cambiar prioridad
          </DialogTitle>

          <DialogDescription className="text-sm text-muted-foreground text-center leading-relaxed max-w-sm">
            Actualiza la prioridad de la solicitud{" "}
            <span className="font-medium text-foreground">{req.order_number}</span>
            {items.length > 0 && " y, opcionalmente, la de sus artículos"}.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 max-h-[50vh] overflow-y-auto px-1">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Prioridad de la solicitud (opcional)
            </label>
            <Select value={headerPriority} onValueChange={setHeaderPriority}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione prioridad..." />
              </SelectTrigger>
              <SelectContent>
                {priorityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <PriorityOptionLabel value={option.value} />
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {items.length > 0 && (
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-muted-foreground">
                Prioridad de los artículos (opcional)
              </label>

              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-2">
                  <span className="flex-1 text-sm truncate" title={item.label}>
                    {item.label}
                  </span>
                  <Select
                    value={articlePriorities[item.id] ?? item.priority}
                    onValueChange={(value) =>
                      setArticlePriorities((prev) => ({ ...prev, [item.id]: value }))
                    }
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Sin cambio" />
                    </SelectTrigger>
                    <SelectContent>
                      {priorityOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <PriorityOptionLabel value={option.value} />
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="pt-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="rounded-xl"
          >
            Cancelar
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={updatePriorityRequisition.isPending}
            className="rounded-xl bg-amber-500/90 hover:bg-amber-500"
          >
            {updatePriorityRequisition.isPending && (
              <Loader2 className="mr-2 size-4 animate-spin" />
            )}
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default UpdateRequisitionPriorityDialog
