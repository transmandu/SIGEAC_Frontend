"use client";

import { useGetVoluntaryReportsByDateRange } from "@/hooks/sms/useGetVoluntaryReportsByDateRange";
import { ReportingStats, VoluntaryReport } from "@/types";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

interface StatsDataByYear {
  name: string;
  total_reports: number;
  open_reports: number;
  closed_reports: number;
}

interface BarChartProps {
  data: ReportingStats;
  title: string;
  width: string;
  height: string;
  from: string;
  to: string;
}

const BarChartComponent = ({
  data,
  title,
  width,
  height,
  from,
  to,
}: BarChartProps) => {
  const { theme } = useTheme();
  const router = useRouter();
  const [clickedBarType, setClickedBarType] = useState<string | null>(null);
  const [openList, setOpenList] = useState(false);
  const [barData, setBarData] = useState<VoluntaryReport[] | null>(null);
  const {
    data: reportsData,
    isLoading,
    isError,
  } = useGetVoluntaryReportsByDateRange(from, to);
  const filterReportsByStatus = (
    reports: VoluntaryReport[],
    status: string
  ): VoluntaryReport[] => {
    return reports.filter((report) => report.status === status);
  };


  if (!data.closed_reports && !data.open_reports) {
    return (
      <p className="text-lg text-muted-foreground">
        No hay datos para mostrar.
      </p>
    );
  }

  const values: StatsDataByYear[] = data
    ? [
        {
          name: `${title}`,
          total_reports: data.total_reports,
          open_reports: data.open_reports,
          closed_reports: data.closed_reports,
        },
      ]
    : [];
  return (
    <>
      <h1 className="text-sm font-semibold">{title}</h1>
      <ResponsiveContainer width={width} height={height} aspect={1}>
        {values ? (
          <BarChart
            width={300}
            height={600}
            data={values}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
            barSize={160}
          >
            <CartesianGrid
              strokeDasharray="4"
              stroke={theme === "light" ? "#000" : "#fff"}
              opacity={0.5}
            />
            <XAxis
              dataKey="name"
              stroke={theme === "light" ? "black" : "white"}
              tick={{ fontSize: 12 }} 
            />
            <YAxis
              allowDecimals={false}
              type="number"
              domain={[0, "dataMax"]}
              stroke={theme === "light" ? "black" : "white"}
            />
            <Tooltip />
            <Legend />
            <Bar
              dataKey="open_reports"
              name={"En Proceso"}
              stackId="a"
              fill={theme === "light" ? "#80d5c0" : "#89f4c7"}

            />

            <Bar
              dataKey="closed_reports"
              name={"Gestionados"}
              stackId="a"
              fill={theme === "light" ? "#8ea7f0" : "#8f8dfe"}

            />
          </BarChart>
        ) : (
          <p>No hay datos disponibles para mostrar el gráfico.</p>
        )}
      </ResponsiveContainer>

      <Dialog open={openList} onOpenChange={setOpenList}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalles de Reportes</DialogTitle>
          </DialogHeader>
          {barData ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Numero de Reporte</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Ver mas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {barData.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>RVP-{report.report_number}</TableCell>
                    <TableCell>{report.status}</TableCell>
                    <TableCell>
                      <Button
                        onClick={() => {
                          router.push(
                            `/transmandu/sms/reportes_voluntarios/${report.id}`
                          );
                        }}
                        size="sm"
                      >
                        Ver Detalles
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <TableRow>
              <TableCell colSpan={4} style={{ textAlign: "center" }}>
                No hay detalles disponibles para esta selección.
              </TableCell>
            </TableRow>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BarChartComponent;
