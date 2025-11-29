"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface LineChartData {
  name: string;
  value: number ;
}

interface SimpleLineChartProps {
  data: LineChartData[];
  height?: number;
  title?: string;
  lineColor?: string;
  strokeWidth?: number;
  showGrid?: boolean;
  showTooltip?: boolean;
  showLegend?: boolean;
  dataKey?: string;
  lineName?: string;
}

const SimpleLineChart: React.FC<SimpleLineChartProps> = ({
  data,
  height = 400,
  title,
  lineColor = "#8884d8",
  strokeWidth = 3,
  showGrid = true,
  showTooltip = true,
  showLegend = false,
  dataKey = "value",
  lineName = "Value",
}) => {
  if (!data || data.length === 0) {
    return <p className="text-sm text-muted-foreground">No data available.</p>;
  }

  return (
    <div className="w-full">
      {title && (
        <h2 className="text-lg font-semibold mb-4 text-center">{title}</h2>
      )}

      <div style={{ width: "100%", height, maxHeight: "70vh" }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            style={{ aspectRatio: 1.618 }}
            margin={{ top: 16, right: 24, left: 8, bottom: 16 }}
          >
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}

            <XAxis
              dataKey="name"
              padding={{ left: 20, right: 20 }}
              tick={{ fontSize: 12 }}
            />

            <YAxis width={40} tick={{ fontSize: 12 }} allowDecimals={false} />

            {showTooltip && (
              <Tooltip
                formatter={(value: number) => [value, lineName]}
                labelFormatter={(label) => `${label}`}
              />
            )}

            {showLegend && <Legend />}

            <Line
              type="monotone"
              dataKey={dataKey}
              name={lineName}
              stroke={lineColor}
              strokeWidth={strokeWidth}
              activeDot={{ r: 8 }}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SimpleLineChart;
