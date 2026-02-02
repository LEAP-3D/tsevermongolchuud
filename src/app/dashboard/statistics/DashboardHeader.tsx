"use client";

type DashboardHeaderProps = {
  timeFilter: string;
  setTimeFilter: (filter: string) => void;
};

export default function DashboardHeader({
  timeFilter,
  setTimeFilter,
}: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-4xl font-semibold text-gray-900 mb-1">Dashboard</h1>
        <p className="text-base text-gray-500">
          Monitor your family`s internet activity
        </p>
      </div>
      <div className="flex items-center gap-0 bg-gray-100 rounded-lg p-1">
        {["24h", "7days", "30days"].map((filter) => (
          <button
            key={filter}
            onClick={() => setTimeFilter(filter)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              timeFilter === filter
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {filter === "24h" ? "24h" : filter === "7days" ? "7d" : "30d"}
          </button>
        ))}
      </div>
    </div>
  );
}
