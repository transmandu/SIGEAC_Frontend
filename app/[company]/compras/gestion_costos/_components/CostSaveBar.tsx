'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { CheckCircle2, Save } from 'lucide-react'

type Props = {
  hasChanges: boolean
  modifiedCount: number
  onSave: () => void
  loading?: boolean
}

const CostSaveBar = ({
  hasChanges,
  modifiedCount,
  onSave,
  loading,
}: Props) => {
  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 z-50',
        'transition-all duration-300 ease-out',
        hasChanges
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-4 pointer-events-none'
      )}
    >
      <div
        className={cn(
          'flex items-center gap-4',
          'px-4 py-2 rounded-2xl border',
          'bg-white/80 dark:bg-slate-900/70',
          'border-slate-200/60 dark:border-slate-700/60',
          'backdrop-blur-md',
          'shadow-[0_8px_30px_rgba(0,0,0,0.08)]'
        )}
      >
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-[#439A97]" />

          <span className="text-xs font-medium text-foreground">
            Cambios sin guardar
          </span>

          <Badge
            variant="secondary"
            className="text-[10px] bg-[#CBEDD5] text-[#439A97] border-0"
          >
            {modifiedCount}
          </Badge>
        </div>

        <div className="h-4 w-px bg-slate-300/60 dark:bg-slate-700/60" />

        <Button
          size="sm"
          onClick={onSave}
          disabled={loading || !hasChanges}
          className={cn(
            'h-8 px-3 gap-2 text-xs',
            'bg-[#439A97] hover:bg-[#3a8683]',
            'text-white',
            'shadow-sm'
          )}
        >
          <Save className="h-3.5 w-3.5" />
          Guardar
        </Button>
      </div>
    </div>
  )
}

export default CostSaveBar