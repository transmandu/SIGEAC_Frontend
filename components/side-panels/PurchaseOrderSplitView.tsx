'use client'

import { createContext, useContext, useState } from 'react'
import { cn } from '@/lib/utils'
import type { PurchaseOrder } from '@/types/purchase'
import PurchaseOrderPreviewPanel from './PurchaseOrderPreviewPanel'

const PurchaseOrderPreviewContext = createContext<
  ((purchaseOrder: PurchaseOrder) => void) | null
>(null)

const PurchaseOrderPreviewSelectedContext = createContext<number | null>(null)

export function usePurchaseOrderPreview() {
  return useContext(PurchaseOrderPreviewContext)
}

export function usePurchaseOrderPreviewSelectedId() {
  return useContext(PurchaseOrderPreviewSelectedContext)
}

interface PurchaseOrderSplitViewProps {
  children: React.ReactNode
}

export default function PurchaseOrderSplitView({ children }: PurchaseOrderSplitViewProps) {
  const [selected, setSelected] = useState<PurchaseOrder | null>(null)

  const onPreview = (purchaseOrder: PurchaseOrder) => {
    setSelected((prev) =>
      prev?.id === purchaseOrder.id ? null : purchaseOrder
    )
  }

  return (
    <PurchaseOrderPreviewContext.Provider value={onPreview}>
      <PurchaseOrderPreviewSelectedContext.Provider value={selected?.id ?? null}>
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
            <PurchaseOrderPreviewPanel
              purchaseOrder={selected}
              onClose={() => setSelected(null)}
            />
          </div>
        )}
      </PurchaseOrderPreviewSelectedContext.Provider>
    </PurchaseOrderPreviewContext.Provider>
  )
}
