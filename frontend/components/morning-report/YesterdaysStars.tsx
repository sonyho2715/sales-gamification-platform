'use client';

interface StarPerformer {
  rank: number;
  name: string;
  location: string;
  sales: number;
  fcp: number;
  fcpPercentage: number;
  salesPerHour: number;
  starDays: number;
}

interface YesterdaysStarsProps {
  data?: StarPerformer[];
}

export default function YesterdaysStars({ data }: YesterdaysStarsProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Yesterday's Stars</h3>
        <p className="text-gray-500">No data available for the selected date.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-8">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Yesterday's Stars</h2>
        <p className="text-gray-600 mt-2">Top performers from {new Date(Date.now() - 86400000).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {data.slice(0, 3).map((performer, index) => (
          <div
            key={index}
            className={`relative rounded-xl p-6 text-center transform transition-all ${
              index === 0
                ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white scale-105 shadow-2xl'
                : index === 1
                ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white shadow-xl'
                : 'bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-lg'
            }`}
          >
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl ${
                index === 0 ? 'bg-yellow-500 text-yellow-900' :
                index === 1 ? 'bg-gray-400 text-gray-900' :
                'bg-orange-500 text-orange-900'
              }`}>
                {index + 1}
              </div>
            </div>
            <div className="mt-4">
              <p className="font-bold text-2xl mb-1">{performer.name}</p>
              <p className="text-sm opacity-90 mb-3">{performer.location}</p>
              <div className="bg-white bg-opacity-20 rounded-lg p-3 mb-2">
                <p className="text-3xl font-bold">${performer.sales.toLocaleString()}</p>
                <p className="text-xs opacity-90 mt-1">Total Sales</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white bg-opacity-20 rounded p-2">
                  <p className="font-semibold">{performer.fcpPercentage.toFixed(1)}%</p>
                  <p className="opacity-90">FCP</p>
                </div>
                <div className="bg-white bg-opacity-20 rounded p-2">
                  <p className="font-semibold">${performer.salesPerHour.toLocaleString()}</p>
                  <p className="opacity-90">$/Hr</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Ranked Table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rank
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Salesperson
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Sales
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                FCP
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                FCP %
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sales/Hour
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Star Days
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((performer) => (
              <tr
                key={performer.rank}
                className={`hover:bg-gray-50 transition-colors ${
                  performer.rank <= 3 ? 'bg-yellow-50' : ''
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span
                      className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                        performer.rank === 1
                          ? 'bg-yellow-500 text-yellow-900'
                          : performer.rank === 2
                          ? 'bg-gray-400 text-gray-900'
                          : performer.rank === 3
                          ? 'bg-orange-500 text-orange-900'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {performer.rank}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{performer.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{performer.location}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="text-sm font-semibold text-gray-900">
                    ${performer.sales.toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="text-sm text-gray-900">
                    ${performer.fcp.toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className={`text-sm font-medium ${
                    performer.fcpPercentage >= 50 ? 'text-green-600' :
                    performer.fcpPercentage >= 40 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {performer.fcpPercentage.toFixed(1)}%
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="text-sm text-gray-900">
                    ${performer.salesPerHour.toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    {performer.starDays}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
