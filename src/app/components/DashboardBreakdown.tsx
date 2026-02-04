"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, CartesianGrid, XAxis, YAxis } from 'recharts';
import type { CategorySlice, RiskPoint } from './types';

export type DashboardBreakdownProps = {
  categoryData: CategorySlice[];
  riskData: RiskPoint[];
};

export default function DashboardBreakdown({ categoryData, riskData }: DashboardBreakdownProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-white rounded-2xl p-6 border border-gray-200/80">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Categories</h3>
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie data={categoryData} dataKey="value" cx="50%" cy="50%" outerRadius={75} innerRadius={45} strokeWidth={0}>
              {categoryData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: '#fff',
                border: '1px solid #e5e5e5',
                borderRadius: '12px',
                fontSize: '13px',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              wrapperStyle={{
                fontSize: '13px',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-200/80">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Risk Assessment</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={riskData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis
              dataKey="level"
              stroke="#8E8E93"
              axisLine={false}
              tickLine={false}
              style={{ fontSize: '13px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
            />
            <YAxis
              stroke="#8E8E93"
              axisLine={false}
              tickLine={false}
              style={{ fontSize: '13px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
            />
            <Tooltip
              contentStyle={{
                background: '#fff',
                border: '1px solid #e5e5e5',
                borderRadius: '12px',
                fontSize: '13px',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
              }}
            />
            <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={40}>
              {riskData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
