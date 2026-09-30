"use client";

import {
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";

interface Props {
  data: number[];
  color: string;
}

export default function Sparkline({
  data,
  color,
}: Props) {
  return (
    <div className="w-full h-16">

      <ResponsiveContainer>

        <LineChart
          data={data.map((v) => ({ value: v }))}
        >

          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={3}
            dot={false}
          />

        </LineChart>

      </ResponsiveContainer>

    </div>
  );
}