"use client";

type StatsCardsProps = {
  totalVisits: number;
  totalBlocked: number;
};

export default function StatsCards({
  totalVisits,
  totalBlocked,
}: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-sm font-medium text-gray-500">Total Visits</div>
        <div className="mt-2 text-3xl font-bold text-gray-900">
          {totalVisits.toLocaleString()}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-sm font-medium text-gray-500">Total Blocked</div>
        <div className="mt-2 text-3xl font-bold text-red-600">
          {totalBlocked.toLocaleString()}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-sm font-medium text-gray-500">Total Allowed</div>
        <div className="mt-2 text-3xl font-bold text-green-600">
          {(totalVisits - totalBlocked).toLocaleString()}
        </div>
      </div>
    </div>
  );
}
