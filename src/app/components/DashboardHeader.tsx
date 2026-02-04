"use client";

export type DashboardHeaderProps = {
  timeFilter: string;
  onChangeTimeFilter: (filter: string) => void;
};

export default function DashboardHeader({ timeFilter, onChangeTimeFilter }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl md:text-4xl font-semibold text-gray-900 mb-1">Dashboard</h1>
        <p className="text-sm md:text-base text-gray-500">Monitor your family&apos;s internet activity</p>
      </div>
      <div className="flex items-center gap-0 bg-gray-100 rounded-lg p-1 w-full md:w-auto">
        {['24h', '7days', '30days'].map(filter => (
          <button
            key={filter}
            onClick={() => onChangeTimeFilter(filter)}
            className={`flex-1 md:flex-none px-4 py-2 rounded-md text-sm font-medium transition-all ${
              timeFilter === filter ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {filter === '24h' ? '24h' : filter === '7days' ? '7d' : '30d'}
          </button>
        ))}
      </div>
    </div>
  );
}
