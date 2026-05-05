'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

import { CreateEmployeeForm } from '@/components/forms/general/CreateEmployeeForm';

export function CreateEmployeeDialog() {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false)
  const [pos, setPos] = useState({ x: 50, y: 50 })
  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!hovered) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setPos({ x, y })
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
<Button
  onClick={() => setOpen(true)}
  onMouseEnter={() => setHovered(true)}
  onMouseLeave={() => setHovered(false)}
  onMouseMove={handleMouseMove}
  variant="outline"
  className="relative overflow-hidden flex items-center justify-center gap-2 border border-dashed border-slate-400/50 dark:border-slate-400/30 bg-white/60 dark:bg-slate-900/30 backdrop-blur text-slate-800 dark:text-slate-200 font-medium tracking-wide shadow-sm transition-all duration-200 hover:border-blue-400/60 dark:hover:border-blue-300/40 hover:bg-blue-50/20 dark:hover:bg-blue-950/10 hover:text-blue-900 dark:hover:text-blue-200 hover:shadow-md hover:-translate-y-[1px] active:translate-y-0 active:shadow-sm focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:ring-offset-2 before:absolute before:inset-0 before:pointer-events-none before:transition-opacity before:duration-300"
  style={{
    backgroundImage: hovered
      ? `radial-gradient(circle at ${pos.x}% ${pos.y}%, rgba(147,197,253,0.08), rgba(99,102,241,0.03), transparent 75%)`
      : 'none'
  }}
>
  Crear Empleado
</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>Crear Empleado</DialogTitle>
          <DialogDescription>
            Completa la información para registrar un nuevo empleado.
          </DialogDescription>
        </DialogHeader>
        <CreateEmployeeForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
