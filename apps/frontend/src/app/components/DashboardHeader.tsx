"use client";

export type DashboardHeaderProps = {
  childName?: string;
  childrenOptions: Array<{ id: number; name: string }>;
  selectedChildId: number | null;
  onChangeChild: (childId: number) => void;
  timeFilter: string;
  onChangeTimeFilter: (filter: string) => void;
};

export default function DashboardHeader({
  childName,
  childrenOptions,
  selectedChildId,
  onChangeChild,
  timeFilter,
  onChangeTimeFilter
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl md:text-4xl font-semibold text-gray-900 mb-1">Dashboard</h1>
        <p className="text-sm md:text-base text-gray-500">
          {childName ? `Activity for ${childName}` : "Select a child to view activity"}
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end w-full md:w-auto">
        <select
          value={selectedChildId ?? ""}
          onChange={(event) => {
            if (event.target.value === "") return;
            onChangeChild(Number(event.target.value));
          }}
          className="w-full sm:w-48 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
        >
          {childrenOptions.length === 0 && <option value="">No children</option>}
          {childrenOptions.map(child => (
            <option key={child.id} value={child.id}>
              {child.name}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-0 bg-gray-100 rounded-lg p-1 w-full sm:w-auto">
          {[
            { key: "today", label: "Today" },
            { key: "7d", label: "7d" },
            { key: "30d", label: "30d" },
          ].map(filter => (
            <button
              key={filter.key}
              onClick={() => onChangeTimeFilter(filter.key)}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-medium transition-all ${
                timeFilter === filter.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
