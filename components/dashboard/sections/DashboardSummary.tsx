'use client'

import { BarChart3 } from 'lucide-react'
import { Card, CardHeader, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface DashboardSummaryProps {
  companySlug: string
}

export default function DashboardSummary({ companySlug }: DashboardSummaryProps) {
  const router = useRouter()

  return (
    <div>
      {/* Mensaje de bienvenida */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Bienvenido a <span className="text-blue-600 block italic">SIGEAC</span>
        </h1>
        <p className="text-lg max-w-3xl mx-auto leading-relaxed">
          Plataforma integral para la gestión y control de operaciones aeronáuticas.
          Acceda a herramientas especializadas para administrar el inventario,
          supervisar operaciones y garantizar el cumplimiento normativo.
        </p>
      </div>

      {/* CTA */}
      <div className="flex justify-center mb-12">
        <Card className="hover:shadow-lg transition-all duration-300 border-blue-200">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-3 justify-center">
              <div className="bg-blue-100 p-2 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-xl">Consulta de Inventario</CardTitle>
            </div>
            <CardDescription className="text-base pt-2">
              Acceda al sistema completo de gestión de inventario aeronáutico
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={() => router.push(`/${companySlug}/almacen/inventario`)}
            >
              Ver Inventario Completo
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
