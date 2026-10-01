import { TestChart } from "@/components/misc/TestChart";
import TestSales from "@/components/misc/TestSales";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Activity, CreditCard, DollarSign, Drill } from "lucide-react";

const OverviewTab = () => {
  return (
    <div className="container max-w-6xl mx-auto pt-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 lg:flex-row gap-2 items-center w-screen max-w-6xl mx-auto">
        <div className="flex justify-center items-center">
          <Card className="w-87.5">
            <CardContent className="p-4">
              <div className="flex flex-col">
                <div className="flex justify-between items-center py-1">
                  <p className="text-normal font-semibold">Ingreso Total</p>
                  <DollarSign className="size-4 text-muted-foreground" />
                </div>
                <p className="font-bold text-3xl mb-1">$45,231.50</p>
                <p className="text-xs text-muted-foreground">
                  +20.1% respecto al mes pasado
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="flex justify-center items-center">
          <Card className="w-87.5">
            <CardContent className="p-4">
              <div className="flex flex-col">
                <div className="flex justify-between items-center py-1">
                  <p className="text-normal font-semibold">Piezas Ingresadas</p>
                  <Drill className="size-4 text-muted-foreground" />
                </div>
                <p className="font-bold text-3xl mb-1">+1350</p>
                <p className="text-xs text-muted-foreground">
                  +15.3% respecto al mes pasado
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="flex justify-center items-center">
          <Card className="w-87.5">
            <CardContent className="p-4">
              <div className="flex flex-col">
                <div className="flex justify-between items-center py-1">
                  <p className="text-normal font-semibold">
                    Compras Realizadas
                  </p>
                  <CreditCard className="size-4 text-muted-foreground" />
                </div>
                <p className="font-bold text-3xl mb-1">+2,323</p>
                <p className="text-xs text-muted-foreground">
                  +5.8% respecto al mes pasado
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="flex justify-center items-center">
          <Card className="w-87.5">
            <CardContent className="p-4">
              <div className="flex flex-col">
                <div className="flex justify-between items-center py-1">
                  <p className="text-normal font-semibold">Usuarios Activos</p>
                  <Activity className="size-4 text-muted-foreground" />
                </div>
                <p className="font-bold text-3xl mb-1">123</p>
                <p className="text-xs text-muted-foreground">
                  +6 en la última hora
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="w-dvw max-w-6xl mx-auto flex flex-col xl:flex-row gap-2">
        <div className="w-full pt-4">
          <TestChart />
        </div>
        <div className="w-full pt-4">
          <TestSales />
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
