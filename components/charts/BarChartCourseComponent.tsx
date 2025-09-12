"use client";
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
import CourseListDialog from "../dialogs/CourseListDialog";
import { useState } from "react";

interface GeneralStats {
  attended: number;
  not_attended: number;
  total: number;
}
interface courseStats {
  attended: number;
  not_attended: number;
  total: number;
  attended_percentage: number;
  not_attended_percentage: number;
}
interface BarChartProps {
  data: courseStats;
  title: string;
  width: string;
  height: string;
  bar_first_name: string;
  bar_second_name: string;
}

const BarChartCourseComponent = ({
  data,
  title,
  width,
  height,
  bar_first_name,
  bar_second_name,
}: BarChartProps) => {
  const { theme } = useTheme();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [message, setMessage] = useState("");
  console.log("DATA FROM COURSE", data);
  if (!data.attended && !data.not_attended) {
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
          attended: data.attended,
          not_attended: data.not_attended,
        },
      ]
    : [];
  console.log("value this is the data", values);
  const handleClick = (message: string) => {
    if (message === "ABIERTO") {
      setMessage("Planificados");
    } else {
      setMessage("Ejecutados");
    }
    setIsDialogOpen(true);
  };
  return (
    <>
      <h1 className="text-sm font-semibold">{title}</h1>
      <ResponsiveContainer width={width} height={height} aspect={3}>
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
              dataKey="attended"
              name={`${bar_first_name}`}
              stackId="a"
              fill={theme === "light" ? "#80d5c0" : "#89f4c7"}
              onClick={() => handleClick("ABIERTO")}
            />

            <Bar
              dataKey="not_attended"
              name={`${bar_second_name}`}
              stackId="a"
              fill={theme === "light" ? "#8ea7f0" : "#8f8dfe"}
              onClick={() => handleClick("CERRADO")}
            />
          </BarChart>
        ) : (
          <p>No hay datos disponibles para mostrar el gráfico.</p>
        )}
      </ResponsiveContainer>

      {/* <CourseListDialog
        title={`Detalles de cursos ${message}`}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      /> */}
    </>
  );
};

export default BarChartCourseComponent;
