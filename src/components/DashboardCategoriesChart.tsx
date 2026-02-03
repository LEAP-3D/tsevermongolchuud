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

type DashboardCategoriesChartProps = {
  data: CategoryData[];
};

export default function DashboardCategoriesChart({
  data,
}: DashboardCategoriesChartProps) {
  return (
    <div className="bg-white/75 rounded-3xl p-6 border border-white/80 shadow-[0_18px_45px_-35px_rgba(15,23,42,0.5)] backdrop-blur">
      <h3 className="text-lg font-semibold text-slate-900 mb-6">
        Categories
      </h3>
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
              border: "1px solid #e2e8f0",
              borderRadius: "16px",
            }}
          />
          <Legend verticalAlign="bottom" height={36} iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
