'use client'

import { motion, AnimatePresence } from "motion/react"
import {
  Boxes,
  Wrench,
  Layers,
  Cpu,
  Package,
  Droplets,
} from 'lucide-react'
import {
  SegmentedTabs,
  SegmentedTabsList,
  SegmentedTabsTrigger,
} from '@/components/misc/SegmentedTabs'

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

  /** Oculta el selector de tipo cuando el usuario solo tiene acceso a uno */
  showTabs?: boolean
}

const categoryLabels: Record<Category, string> = {
  all: 'Todos',
  COMPONENT: 'Componente',
  PART: 'Parte',
  CONSUMABLE: 'Consumible',
  TOOL: 'Herramienta',
}

const categoryIcons: Record<Category, typeof Layers> = {
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
  showTabs = true,
}: Props) => {
  return (
    <div className="flex w-full flex-col items-center">
      {showTabs && (
        <SegmentedTabs
          value={type}
          onValueChange={(val) => {
            const next = val as CostType
            setType(next)
            if (next === 'GENERAL') setCategory('all')
          }}
        >
          <SegmentedTabsList aria-label="Tipo de costo">
            <SegmentedTabsTrigger value="ARTICLE">
              <Boxes className="size-4 shrink-0" />
              Artículos
            </SegmentedTabsTrigger>

            <SegmentedTabsTrigger value="GENERAL">
              <Wrench className="size-4 shrink-0" />
              General / Ferretería
            </SegmentedTabsTrigger>
          </SegmentedTabsList>
        </SegmentedTabs>
      )}

      <AnimatePresence initial={false}>
        {type === 'ARTICLE' && (
          // La altura se despliega junto con el fundido, así el contenido de
          // abajo baja con la barra en lugar de dar un salto. La separación va
          // como padding interno para que también crezca desde cero.
          <motion.div
            key="categories"
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: 'auto',
              opacity: 1,
              transition: {
                height: { duration: 0.34, ease: [0.22, 1, 0.36, 1] },
                opacity: { duration: 0.28, delay: 0.06, ease: 'easeOut' },
              },
            }}
            exit={{
              height: 0,
              opacity: 0,
              transition: {
                height: { duration: 0.26, ease: [0.4, 0, 0.2, 1] },
                opacity: { duration: 0.16, ease: 'easeIn' },
              },
            }}
            className="w-full overflow-hidden"
          >
            <div className="pt-2">
            <SegmentedTabs
              value={category}
              onValueChange={(val) => setCategory(val as Category)}
            >
              <SegmentedTabsList size="sm" aria-label="Categoría">
                {categories.map((cat) => {
                  const Icon = categoryIcons[cat]

                  return (
                    <SegmentedTabsTrigger key={cat} value={cat}>
                      <Icon className="size-3.5 shrink-0" />
                      {categoryLabels[cat]}
                    </SegmentedTabsTrigger>
                  )
                })}
              </SegmentedTabsList>
            </SegmentedTabs>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default CostTypeToggle
