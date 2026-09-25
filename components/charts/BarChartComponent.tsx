"use client";

import { GeneralStats } from "@/types";
import { useTheme } from "next-themes";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
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
  showValueLabels?: boolean;
  forceLight?: boolean;
}

const BarChartComponent = ({
  data,
  title,
  height = 260,
  barSize = 48,
  bar_first_name,
  bar_second_name,
  showValueLabels = false,
  forceLight = false,
}: BarChartProps) => {
  const { theme } = useTheme();
  const isDark = forceLight ? false : theme === "dark";

  const axisColor = useMemo(() => (isDark ? "#e5e7eb" : "#111827"), [isDark]);
  const gridColor = useMemo(() => (isDark ? "#4b5563" : "#d1d5db"), [isDark]);

  // Colores para las barras
  const barColors = useMemo(
    () => ({
      open: isDark ? "#64bda5ff" : "#64bda5ff",
      closed: isDark ? "#0369a1" : "#0369a1",
    }),
    [isDark],
  );

  /* eslint-disable react/display-name */
  const renderValueLabel = (total: number, color: string) => (props: any) => {
    const { x, y, width, height, value } = props ?? {};
    if (!value || Number(value) <= 0) return null;
    if (height < 16 || x == null || y == null || width == null) return null;
    const pct = total > 0 ? (Number(value) / total) * 100 : 0;
    return (
      <text
        x={x + width / 2}
        y={y + height / 2}
        dominantBaseline="central"
        textAnchor="middle"
        fontSize={11}
        fontWeight={700}
        fill={color}
      >
        {`${Number(value).toLocaleString("es-ES")} (${pct.toFixed(1)}%)`}
      </text>
    );
  };
  /* eslint-enable react/display-name */

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
              formatter={(value) => Number(value).toLocaleString("es-ES")}
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
            >
              {showValueLabels && (
                <LabelList
                  dataKey="open"
                  content={renderValueLabel(data.total, "#0d3a30")}
                />
              )}
            </Bar>

            <Bar
              dataKey="closed"
              name={bar_second_name}
              stackId="a"
              fill={barColors.closed}
            >
              {showValueLabels && (
                <LabelList
                  dataKey="closed"
                  content={renderValueLabel(data.total, "#ffffff")}
                />
              )}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BarChartComponent;
