"use client";

import { GeneralStats } from "@/types";
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
  data: GeneralStats;
  title: string;
  width: string;
  height: string;
  bar_first_name: string;
  bar_second_name: string;
}

const BarChartComponent = ({
  data,
  title,
  width,
  height,
  bar_first_name,
  bar_second_name,
}: BarChartProps) => {
  const { theme } = useTheme();

  if (!data.closed && !data.open) {
    return (
      <p className="text-lg text-muted-foreground">
        No hay datos para mostrar.
      </p>
    );
  }

  const values: GeneralStats[] = data
    ? [
        {
          total: data.total,
          open: data.open,
          closed: data.closed,
        },
      ]
    : [];

  return (
    <>
      <h1 className="text-sm font-semibold">{title}</h1>
      <ResponsiveContainer >
        {values ? (
          <BarChart
            width={200}
            height={400}
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
              dataKey="open"
              name={`${bar_first_name}`}
              stackId="a"
              fill={theme === "light" ? "#80d5c0" : "#89f4c7"}
            />

            <Bar
              dataKey="closed"
              name={`${bar_second_name}`}
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
