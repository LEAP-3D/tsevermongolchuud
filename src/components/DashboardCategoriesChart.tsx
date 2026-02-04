"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { PieChartIcon } from "lucide-react";

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
    <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-soft">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-linear-to-br from-secondary-500 to-secondary-600 rounded-xl flex items-center justify-center shadow-soft">
          <PieChartIcon className="w-6 h-6 text-white" strokeWidth={2.5} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900">
            Content Categories
          </h3>
          <p className="text-sm text-slate-600">Usage breakdown</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            cx="50%"
            cy="50%"
            outerRadius={90}
            innerRadius={55}
            strokeWidth={0}
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "#ffffff",
              border: "2px solid #e2e8f0",
              borderRadius: "16px",
              padding: "12px 16px",
              boxShadow: "0 4px 16px 0 rgba(0, 0, 0, 0.08)",
            }}
            itemStyle={{
              fontSize: "14px",
              fontWeight: 600,
              color: "#0f172a",
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            wrapperStyle={{
              fontSize: "14px",
              fontWeight: 600,
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
