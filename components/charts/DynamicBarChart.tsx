import { pieChartData } from "@/types";
import { useTheme } from "next-themes";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useState } from "react";
import { COLORS } from "@/lib/utils";
import { TickItem } from "recharts/types/util/types";

interface DynamicBarChartProps {
  data: pieChartData[];
  title?: string;
  height: string;
  width: string;
  aspect?: number;
  activeDecimal?: boolean;
  fontSize?: number;
  isCustomizedAxis?: boolean;
}

interface CustomizedAxisTickProps {
  x: number;
  y: number;
  payload: TickItem;
  theme: "light" | "dark";
  fontSize?: number;
}

const CustomizedAxisTick = ({
  x,
  y,
  payload,
  theme,
  fontSize, // Valor por defecto
}: CustomizedAxisTickProps) => {
  if (!payload || !payload.value) {
    return null;
  }

  const verticalSpacing = 7; // Espacio entre líneas de la misma etiqueta
  const spaceToChart = 5; // Espacio adicional hacia el gráfico

  return (
    <g transform={`translate(${x},${y + spaceToChart})`}>
      <text
        x={0}
        y={20}
        dy={verticalSpacing / 2}
        textAnchor="middle"
        fill={theme === "light" ? "black" : "white"}
        fontSize={16}
      >
        {payload.value}
      </text>
    </g>
  );
};

const DynamicBarChart = ({
  data,
  title,
  height,
  width,
  activeDecimal,
  aspect,
  fontSize,
  isCustomizedAxis = true,
}: DynamicBarChartProps) => {
  const { theme } = useTheme();
  const [clickedBarName, setClickedBarName] = useState<string | null>(null);

  const handleBarClick = (entry: pieChartData) => {
    const name = entry.name;
    setClickedBarName(name);
  };

  return (
      <ResponsiveContainer aspect={0.7}>
        <BarChart
          margin={{ top: 20, right: 30, left: 20, bottom: 120 }}
          width={730}
          height={250}
          data={data}
          // recharts 3 dejó de pasar activePayload al handler: ahora entrega el
          // índice de la barra activa, y lo entrega como texto ("2") o null, así
          // que el dato se busca en el arreglo.
          onClick={({ activeIndex }) => {
            const entry = activeIndex == null ? undefined : data[Number(activeIndex)];

            if (entry) {
              handleBarClick(entry);
            }
          }}
        >
          <CartesianGrid strokeDasharray="4" />
          <XAxis
            dataKey="name"
            stroke={theme === "light" ? "black" : "white"}
            height={60}
            tick={
              isCustomizedAxis
                ? (props) => (
                    <CustomizedAxisTick
                      x={Number(props.x)}
                      y={Number(props.y)}
                      payload={props.payload}
                      theme={theme === "light" ? "light" : "dark"}
                      fontSize={fontSize || 12}
                    />
                  )
                : undefined
            }
            interval={0} // Show all ticks
          />
          <YAxis
            domain={[0, "dataMax"]}
            allowDecimals={activeDecimal ? true : false}
            stroke={theme === "light" ? "black" : "white"}
          />
          <Tooltip />
          <Legend iconSize={0} />
          <Bar dataKey="value" fill="#8884d8" barSize={90} name={" "}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

  );
};

export default DynamicBarChart;
