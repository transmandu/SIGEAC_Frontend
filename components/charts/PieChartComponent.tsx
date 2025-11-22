"use client";

import { pieChartData } from "@/types";
import { useMemo } from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";


type Props = {
  data: pieChartData[];
  title: string;
  height?: number;
  colors?: string[];
};

const DEFAULT_COLORS = [
  "#64bda5ff",
  "#0369a1",
  "#7c3aed",
  "#ea580c",
  "#16a34a",
  "#be123c",
  "#4b5563",
];

export const PieChartComponent: React.FC<Props> = ({
  data,
  title,
  height = 260,
  colors = DEFAULT_COLORS,
}) => {
  const palette = useMemo(
    () => (colors && colors.length > 0 ? colors : DEFAULT_COLORS),
    [colors]
  );

  const total = useMemo(
    () =>
      data.reduce((acc, item) => acc + (Number(item.value) || 0), 0),
    [data]
  );

  if (!data || data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No hay datos para mostrar.
      </p>
    );
  }

  return (
    <div className="w-full">
      <h2 className="mb-2 text-sm font-semibold">{title}</h2>

      <div style={{ width: "100%", height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius="40%"
              outerRadius="80%"
              paddingAngle={2}
              label={({ name, value }) => {
                const v = Number(value);
                if (!total) return name;
                const pct = ((v / total) * 100).toFixed(0);
                return `${name} (${pct}%)`;
              }}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${entry.name}-${index}`}
                  fill={palette[index % palette.length]}
                />
              ))}
            </Pie>

            <Tooltip
              formatter={(value: number, _name, payload: any) => {
                const v = Number(value) || 0;
                const pct = total ? (v / total) * 100 : 0;
                return [
                  `${v.toLocaleString("es-ES")} (${pct.toFixed(1)}%)`,
                  payload?.name,
                ];
              }}
            />

            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
