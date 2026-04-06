"use client";

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

interface DynamicBarChartProps {
  data: any[];
  title: string;
  height?: number;
  dataKey: string; // La llave del valor, ej: "Total Registradas"
  color?: string;
}

const DynamicBarChartComponent = ({
  data,
  title,
  height = 280,
  dataKey,
  color = "#0ea5e9", // Un azul bonito por defecto
}: DynamicBarChartProps) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const axisColor = useMemo(() => (isDark ? "#e5e7eb" : "#111827"), [isDark]);
  const gridColor = useMemo(() => (isDark ? "#374151" : "#e5e7eb"), [isDark]);
  const finalColor = isDark ? "#38bdf8" : color;

  if (!data || data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No hay datos para mostrar.
      </p>
    );
  }

  return (
    <div className="w-full">
      {title && (
        <h2 className="text-base md:text-lg font-semibold mb-4 pt-4 text-center">
          {title}
        </h2>
      )}
      <div style={{ width: "100%", height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 16, right: 24, left: 0, bottom: 24 }}
          >
            <CartesianGrid
              strokeDasharray="4"
              stroke={gridColor}
              vertical={false}
            />
            <XAxis
              dataKey="name"
              stroke={axisColor}
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              angle={-25} // Inclinamos un poco el texto para que quepan nombres largos
              textAnchor="end"
            />
            <YAxis
              allowDecimals={false}
              stroke={axisColor}
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              cursor={{ fill: isDark ? "#374151" : "#f3f4f6" }}
              contentStyle={{
                backgroundColor: isDark ? "#1f2937" : "#ffffff",
                border: `1px solid ${gridColor}`,
                borderRadius: "8px",
              }}
            />
            <Legend wrapperStyle={{ paddingTop: "20px" }} />
            <Bar
              dataKey={dataKey}
              fill={finalColor}
              radius={[4, 4, 0, 0]}
              barSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DynamicBarChartComponent;
