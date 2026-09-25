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

interface OverlappingBarChartProps {
  data: GeneralStats;
  title: string;
  height?: number;
  barSize?: number;
  bar_first_name: string;
  bar_second_name: string;
}

export const OverlappingBarChartComponent = ({
  data,
  title,
  height = 260,
  barSize = 48,
  bar_first_name,
  bar_second_name,
}: OverlappingBarChartProps) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const axisColor = useMemo(() => (isDark ? "#e5e7eb" : "#111827"), [isDark]);
  const gridColor = useMemo(() => (isDark ? "#4b5563" : "#d1d5db"), [isDark]);

  if (!data.closed && !data.open) {
    return (
      <p className="text-sm text-muted-foreground">
        No hay datos para mostrar.
      </p>
    );
  }

  // Las barras se superponen: la total (bar_first_name) detrás y la
  // ejecutada (bar_second_name) adelante.
  const chartData = [
    {
      name: "Estadísticas",
      first: data.open,
      second: data.closed,
    },
  ];

  return (
    <div className="w-full">
      {title && (
        <h2 className="text-base md:text-lg font-semibold mb-4 pt-6 text-center">
          {title}
        </h2>
      )}

      <div style={{ width: "100%", height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 16, right: 24, left: 8, bottom: 16 }}
            barSize={barSize}
            barGap={-barSize}
            barCategoryGap={20}
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
              dataKey="first"
              name={bar_first_name}
              fill="#64bda5ff"
              radius={[4, 4, 0, 0]}
            />

            <Bar
              dataKey="second"
              name={bar_second_name}
              fill="#0369a1"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default OverlappingBarChartComponent;
