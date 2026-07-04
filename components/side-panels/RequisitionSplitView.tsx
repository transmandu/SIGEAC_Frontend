'use client'

import { createContext, useContext, useState } from 'react'
import { cn } from '@/lib/utils'
import type { Requisition } from '@/types/purchase'
import RequisitionPreviewPanel from './RequisitionPreviewPanel'

const RequisitionPreviewContext = createContext<
  ((requisition: Requisition) => void) | null
>(null)

export function useRequisitionPreview() {
  return useContext(RequisitionPreviewContext)
}

interface RequisitionSplitViewProps {
  children: React.ReactNode
}

export default function RequisitionSplitView({ children }: RequisitionSplitViewProps) {
  const [selected, setSelected] = useState<Requisition | null>(null)

  const onPreview = (requisition: Requisition) => {
    setSelected((prev) =>
      prev?.id === requisition.id ? null : requisition
    )
  }

  return (
    <RequisitionPreviewContext.Provider value={onPreview}>
      <div
        className={cn(
          'transition-[margin-right] duration-300 ease-in-out',
          selected && 'lg:mr-[420px]'
        )}
      >
        {children}
      </div>

      {selected && (
        <div
          className="
            fixed right-0 top-0 bottom-0 z-[900]
            hidden lg:flex flex-col
            w-[420px]
            border-l bg-background
            shadow-[0_0_40px_rgba(0,0,0,0.12)]
            animate-in slide-in-from-right duration-300 ease-in-out
          "
        >
          <RequisitionPreviewPanel
            requisition={selected}
            onClose={() => setSelected(null)}
          />
        </div>
      )}
    </RequisitionPreviewContext.Provider>
  )
}
