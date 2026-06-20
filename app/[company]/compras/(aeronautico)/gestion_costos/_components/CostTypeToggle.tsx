'use client'

import { cn } from '@/lib/utils'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Boxes,
  Wrench,
  Layers,
  Cpu,
  Package,
  Droplets,
} from 'lucide-react'

type CostType = 'ARTICLE' | 'GENERAL'

type Category =
  | 'all'
  | 'COMPONENT'
  | 'PART'
  | 'CONSUMABLE'
  | 'TOOL'

type Props = {
  type: CostType
  setType: (type: CostType) => void

  category: Category
  setCategory: (category: Category) => void
}

const categoryLabels: Record<Category, string> = {
  all: 'Todos',
  COMPONENT: 'Componente',
  PART: 'Parte',
  CONSUMABLE: 'Consumible',
  TOOL: 'Herramienta',
}

const categoryIcons: Record<Category, any> = {
  all: Layers,
  COMPONENT: Cpu,
  PART: Package,
  CONSUMABLE: Droplets,
  TOOL: Wrench,
}

const categories: Category[] = [
  'all',
  'COMPONENT',
  'PART',
  'CONSUMABLE',
  'TOOL',
]

const CostTypeToggle = ({
  type,
  setType,
  category,
  setCategory,
}: Props) => {
  return (
    <div className="flex flex-col items-center gap-2 w-full">

      <Tabs
        value={type}
        onValueChange={(val) => {
          const next = val as CostType
          setType(next)
          if (next === 'GENERAL') setCategory('all')
        }}
        className="w-full flex justify-center"
      >
        <TabsList
          className={cn(
            'px-8 py-3 rounded-2xl border backdrop-blur-md',
            'bg-slate-200/50 border-slate-200/40',
            'dark:bg-slate-800/60 dark:border-slate-800/60'
          )}
        >
          <div className="flex gap-2">

            <TabsTrigger
              value="ARTICLE"
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-medium transition-all duration-200',
                'flex items-center justify-center gap-2',
                'text-muted-foreground hover:text-[#439A97]',
                'data-[state=active]:bg-white/80 dark:data-[state=active]:bg-slate-900/50',
                'data-[state=active]:text-[#439A97]',
                'data-[state=active]:shadow-[0_0_18px_rgba(67,154,151,0.25)]',
                'data-[state=active]:ring-1 data-[state=active]:ring-[#CBEDD5]'
              )}
            >
              <Boxes className="w-4 h-4 shrink-0" />
              Artículos
            </TabsTrigger>

            <TabsTrigger
              value="GENERAL"
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-medium transition-all duration-200',
                'flex items-center justify-center gap-2',
                'text-muted-foreground hover:text-[#439A97]',
                'data-[state=active]:bg-white/80 dark:data-[state=active]:bg-slate-900/50',
                'data-[state=active]:text-[#439A97]',
                'data-[state=active]:shadow-[0_0_18px_rgba(67,154,151,0.25)]',
                'data-[state=active]:ring-1 data-[state=active]:ring-[#CBEDD5]'
              )}
            >
              <Wrench className="w-4 h-4 shrink-0" />
              General / Ferretería
            </TabsTrigger>

          </div>
        </TabsList>
      </Tabs>

      <AnimatePresence mode="wait">
        {type === 'ARTICLE' && (
          <motion.div
            key="categories"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={cn(
              'flex flex-wrap justify-center gap-2',
              'px-12 py-1.5 rounded-xl border backdrop-blur-sm', // ⬅️ más ancho también aquí
              'bg-slate-200/50 border-slate-200/40',
              'dark:bg-slate-800/60 dark:border-slate-800/60'
            )}
          >
            {categories.map((cat) => {
              const isActive = category === cat
              const Icon = categoryIcons[cat]

              return (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200',
                    'flex items-center justify-center gap-1.5',
                    isActive
                      ? [
                          'bg-white/80 dark:bg-slate-900/60',
                          'text-[#439A97]',
                          'shadow-sm',
                          'ring-1 ring-[#CBEDD5]',
                        ]
                      : [
                          'text-muted-foreground',
                          'hover:text-[#439A97]',
                          'hover:bg-white/60 dark:hover:bg-slate-900/40',
                        ]
                  )}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  {categoryLabels[cat]}
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}

export default CostTypeToggle