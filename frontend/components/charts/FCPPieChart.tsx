'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface FCPPieChartProps {
  fcpPercentage: number;
  title?: string;
}

const COLORS = ['#6366f1', '#e5e7eb'];

export default function FCPPieChart({ fcpPercentage, title = "FCP Rate" }: FCPPieChartProps) {
  const data = [
    { name: 'FCP', value: fcpPercentage },
    { name: 'Non-FCP', value: 100 - fcpPercentage },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <h3 className="text-xl font-bold text-gray-900 mb-6">{title}</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      <div className="text-center mt-4">
        <p className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          {fcpPercentage.toFixed(1)}%
        </p>
        <p className="text-sm text-gray-500">Current FCP Rate</p>
      </div>
    </div>
  );
}
