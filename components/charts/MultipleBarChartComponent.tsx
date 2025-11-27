"use client";

import { pieChartData } from "@/types";
import { useTheme } from "next-themes";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface BarChartProps {
  data: pieChartData[];
  title: string;
  height?: number;
  barSize?: number;
}

const MultipleBarChartComponent: React.FC<BarChartProps> = ({
  data,
  title,
  height = 260,
  barSize = 48,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const axisColor = useMemo(() => (isDark ? "#e5e7eb" : "#111827"), [isDark]);
  const gridColor = useMemo(() => (isDark ? "#4b5563" : "#d1d5db"), [isDark]);
  const barColor = useMemo(() => (isDark ? "#6366f1" : "#4f46e5"), [isDark]);

  if (!data || data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No hay datos para mostrar.
      </p>
    );
  }

  return (
    <>
      <h2 className="mb-2 text-sm font-semibold text-wrap">{title}</h2>
      <div style={{ width: "100%", height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 16, right: 24, left: 8, bottom: 16 }}
            barSize={barSize}
          >
            <CartesianGrid
              strokeDasharray="4"
              stroke={gridColor}
              opacity={0.6}
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
              labelFormatter={(label) => `Categoría: ${label}`}
              contentStyle={{
                color: "#000",
              }}
            />

            <Bar
              dataKey="value"
              name="Valor"
              fill={barColor}
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
};

export default MultipleBarChartComponent;
