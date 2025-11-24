"use client";

import { GeneralStats } from "@/types";
import { useTheme } from "next-themes";
import { useMemo } from "react";
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
  data: GeneralStats;
  title: string;
  height?: number;
  barSize?: number;
  bar_first_name: string;
  bar_second_name: string;
}

const BarChartComponent = ({
  data,
  title,
  height = 260,
  barSize = 48,
  bar_first_name,
  bar_second_name,
}: BarChartProps) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const axisColor = useMemo(() => (isDark ? "#e5e7eb" : "#111827"), [isDark]);
  const gridColor = useMemo(() => (isDark ? "#4b5563" : "#d1d5db"), [isDark]);

  // Colores para las barras
  const barColors = useMemo(
    () => ({
      open: isDark ? "#64bda5ff" : "#64bda5ff",
      closed: isDark ? "#0369a1" : "#0369a1",
    }),
    [isDark]
  );

  if (!data.closed && !data.open) {
    return (
      <p className="text-sm text-muted-foreground">
        No hay datos para mostrar.
      </p>
    );
  }

  const chartData = [
    {
      name: "Estadísticas",
      total: data.total,
      open: data.open,
      closed: data.closed,
    },
  ];

  return (
    <>
      <div style={{ width: "100%", height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 16, right: 24, left: 8, bottom: 16 }}
            barSize={barSize}
          >
            <CartesianGrid
              strokeDasharray="4"
              stroke={gridColor}
              opacity={1}
               strokeWidth={2}
            />

            <XAxis
              dataKey="name"
              stroke={axisColor}
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: axisColor, strokeWidth: 1 }}
            />

            <YAxis
              allowDecimals={false}
              type="number"
              domain={[0, "dataMax"]}
              stroke={axisColor}
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: axisColor, strokeWidth: 1 }}
            />

            <Tooltip
              formatter={(value: number) => value.toLocaleString("es-ES")}
              labelFormatter={() => "Resumen"}
              contentStyle={{
                backgroundColor: isDark ? "#1f2937" : "#ffffff",
                border: `1px solid ${gridColor}`,
                borderRadius: "6px",
                fontSize: "12px",
              }}
            />

            <Legend
              wrapperStyle={{
                fontSize: "14px",
                paddingTop: "8px",
              }}
            />

            <Bar
              dataKey="open"
              name={bar_first_name}
              stackId="a"
              fill={barColors.open}
            />

            <Bar
              dataKey="closed"
              name={bar_second_name}
              stackId="a"
              fill={barColors.closed}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
};

export default BarChartComponent;
