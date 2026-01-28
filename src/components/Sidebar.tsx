// src/components/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HistoryIcon,
  ShieldIcon,
  FolderIcon,
  BarChartIcon,
  SettingsIcon,
} from "lucide-react";

const navigation = [
  { name: "History", href: "/dashboard/history", icon: HistoryIcon },
  { name: "Blacklist", href: "/dashboard/blacklist", icon: ShieldIcon },
  { name: "Categories", href: "/dashboard/categories", icon: FolderIcon },
  { name: "Statistics", href: "/dashboard/statistics", icon: BarChartIcon },
  { name: "Settings", href: "/dashboard/settings", icon: SettingsIcon },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white shadow-lg">
      <div className="flex items-center justify-center h-16 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800">Extension Dashboard</h1>
      </div>

      <nav className="mt-6 px-3">
        {navigation.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-4 py-3 mb-2 rounded-lg transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <item.icon
                className={`w-5 h-5 mr-3 ${
                  isActive ? "text-blue-600" : "text-gray-400"
                }`}
              />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
