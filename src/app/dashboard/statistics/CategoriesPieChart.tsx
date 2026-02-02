"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type CategoryData = {
  name: string;
  value: number;
  color: string;
};

type CategoriesPieChartProps = {
  data: CategoryData[];
};

export default function CategoriesPieChart({ data }: CategoriesPieChartProps) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200/80">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Categories</h3>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            cx="50%"
            cy="50%"
            outerRadius={75}
            innerRadius={45}
            strokeWidth={0}
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "#fff",
              border: "1px solid #e5e5e5",
              borderRadius: "12px",
            }}
          />
          <Legend verticalAlign="bottom" height={36} iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
