'use client';

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface PerformanceData {
  totalSales?: {
    actual: number;
    goal: number;
    percentToGoal: number;
    onTrackFor: number;
    amountNeededDaily: number;
    dailyData: Array<{ day: number; sales: number; cumulative: number; goalTrack: number }>;
  };
  fcp?: {
    actual: number;
    goal: number;
    percentToGoal: number;
    dailyData: Array<{ day: number; fcp: number; percentage: number }>;
  };
  starDays?: {
    byLocation: Array<{ location: string; count: number; color: string }>;
    byPerson: Array<{ name: string; count: number }>;
  };
}

interface PerformanceChartsProps {
  data?: PerformanceData;
}

const COLORS = ['#4F46E5', '#7C3AED', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#8B5CF6'];

export default function PerformanceCharts({ data }: PerformanceChartsProps) {
  if (!data) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Company Performance</h3>
        <p className="text-gray-500">No performance data available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Total Sales Section */}
      {data.totalSales && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Total Sales - Month to Date</h3>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4 border border-indigo-200">
              <p className="text-xs text-indigo-600 font-medium uppercase mb-1">Goal</p>
              <p className="text-2xl font-bold text-indigo-900">
                ${data.totalSales.goal.toLocaleString()}
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
              <p className="text-xs text-purple-600 font-medium uppercase mb-1">Actual</p>
              <p className="text-2xl font-bold text-purple-900">
                ${data.totalSales.actual.toLocaleString()}
              </p>
            </div>
            <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg p-4 border border-pink-200">
              <p className="text-xs text-pink-600 font-medium uppercase mb-1">% to Goal</p>
              <p className="text-2xl font-bold text-pink-900">
                {data.totalSales.percentToGoal.toFixed(1)}%
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
              <p className="text-xs text-green-600 font-medium uppercase mb-1">On Track For</p>
              <p className="text-2xl font-bold text-green-900">
                ${data.totalSales.onTrackFor.toLocaleString()}
              </p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
              <p className="text-xs text-orange-600 font-medium uppercase mb-1">Needed Daily</p>
              <p className="text-2xl font-bold text-orange-900">
                ${data.totalSales.amountNeededDaily.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Line Chart */}
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.totalSales.dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="day"
                  stroke="#6B7280"
                  label={{ value: 'Day of Month', position: 'insideBottom', offset: -5 }}
                />
                <YAxis
                  stroke="#6B7280"
                  label={{ value: 'Sales ($)', angle: -90, position: 'insideLeft' }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value: number) => `$${value.toLocaleString()}`}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Legend />
                <ReferenceLine
                  y={data.totalSales.goal}
                  stroke="#EF4444"
                  strokeDasharray="5 5"
                  label="Goal"
                />
                <Line
                  type="monotone"
                  dataKey="cumulative"
                  stroke="#4F46E5"
                  strokeWidth={3}
                  name="Actual Sales"
                  dot={{ fill: '#4F46E5', r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="goalTrack"
                  stroke="#10B981"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="On Track"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* FCP Section */}
      {data.fcp && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">FCP Performance</h3>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
              <p className="text-xs text-blue-600 font-medium uppercase mb-1">Goal</p>
              <p className="text-2xl font-bold text-blue-900">{data.fcp.goal}%</p>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4 border border-indigo-200">
              <p className="text-xs text-indigo-600 font-medium uppercase mb-1">Actual</p>
              <p className="text-2xl font-bold text-indigo-900">{data.fcp.actual.toFixed(1)}%</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
              <p className="text-xs text-purple-600 font-medium uppercase mb-1">% to Goal</p>
              <p className="text-2xl font-bold text-purple-900">{data.fcp.percentToGoal.toFixed(1)}%</p>
            </div>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.fcp.dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="day"
                  stroke="#6B7280"
                  label={{ value: 'Day of Month', position: 'insideBottom', offset: -5 }}
                />
                <YAxis
                  stroke="#6B7280"
                  label={{ value: 'FCP %', angle: -90, position: 'insideLeft' }}
                  domain={[0, 100]}
                />
                <Tooltip
                  formatter={(value: number) => `${value.toFixed(1)}%`}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Legend />
                <ReferenceLine
                  y={data.fcp.goal}
                  stroke="#EF4444"
                  strokeDasharray="5 5"
                  label="Goal"
                />
                <Line
                  type="monotone"
                  dataKey="percentage"
                  stroke="#7C3AED"
                  strokeWidth={3}
                  name="FCP %"
                  dot={{ fill: '#7C3AED', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Star Days Section */}
      {data.starDays && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart - By Location */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Star Days by Location</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.starDays.byLocation}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ location, count }) => `${location}: ${count}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {data.starDays.byLocation.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart - Top Performers */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Top Star Day Performers</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.starDays.byPerson.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '0.5rem',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Bar dataKey="count" fill="#4F46E5" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
