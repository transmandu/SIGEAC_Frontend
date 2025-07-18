"use client";

import { ReportingStats } from "@/types";
import { useTheme } from "next-themes";
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


interface BarChartProps {
  data: ReportingStats;
  title: string;
  width: string;
  height: string;
}

const BarChartComponent = ({ data, title, width, height }: BarChartProps) => {
  const { theme } = useTheme();

  if (!data.closed_reports && !data.open_reports) {
    return (
      <p className="text-lg text-muted-foreground">
        No hay datos para mostrar.
      </p>
    );
  }

  const values: ReportingStats[] = data
    ? [
        {
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
    </>
  );
};

export default BarChartComponent;
