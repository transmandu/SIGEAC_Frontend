'use client'

import { createContext, useContext, useState } from 'react'
import { cn } from '@/lib/utils'
import type { Quote } from '@/types/purchase'
import QuotePreviewPanel from './QuotePreviewPanel'

const QuotePreviewContext = createContext<
  ((quote: Quote) => void) | null
>(null)

const QuotePreviewSelectedContext = createContext<number | null>(null)

export function useQuotePreview() {
  return useContext(QuotePreviewContext)
}

export function useQuotePreviewSelectedId() {
  return useContext(QuotePreviewSelectedContext)
}

interface QuoteSplitViewProps {
  children: React.ReactNode
}

export default function QuoteSplitView({ children }: QuoteSplitViewProps) {
  const [selected, setSelected] = useState<Quote | null>(null)

  const onPreview = (quote: Quote) => {
    setSelected((prev) =>
      prev?.id === quote.id ? null : quote
    )
  }

  return (
    <QuotePreviewContext.Provider value={onPreview}>
      <QuotePreviewSelectedContext.Provider value={selected?.id ?? null}>
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
            <QuotePreviewPanel
              quote={selected}
              onClose={() => setSelected(null)}
            />
          </div>
        )}
      </QuotePreviewSelectedContext.Provider>
    </QuotePreviewContext.Provider>
  )
}
