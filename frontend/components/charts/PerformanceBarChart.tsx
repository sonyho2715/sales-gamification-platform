'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PerformanceBarChartProps {
  data: Array<{
    name: string;
    sales: number;
    goal?: number;
  }>;
  title?: string;
}

export default function PerformanceBarChart({ data, title = "Team Performance" }: PerformanceBarChartProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <h3 className="text-xl font-bold text-gray-900 mb-6">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="name"
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
            formatter={(value: number) => `$${value.toLocaleString()}`}
          />
          <Legend />
          <Bar
            dataKey="sales"
            fill="#6366f1"
            radius={[8, 8, 0, 0]}
            name="Sales"
          />
          {data[0]?.goal !== undefined && (
            <Bar
              dataKey="goal"
              fill="#e5e7eb"
              radius={[8, 8, 0, 0]}
              name="Goal"
            />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
