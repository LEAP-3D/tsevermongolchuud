"use client";

import { TrashIcon } from "lucide-react";

type BlacklistItem = {
  id: string;
  url: string;
  category: string | null;
  createdAt: string;
};

type BlacklistTableProps = {
  blacklist: BlacklistItem[];
  loading: boolean;
  onDelete: (id: string) => void;
};

export default function BlacklistTable({
  blacklist,
  loading,
  onDelete,
}: BlacklistTableProps) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                URL
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Added On
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  Loading blacklist...
                </td>
              </tr>
            ) : blacklist.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  No blacklisted sites
                </td>
              </tr>
            ) : (
              blacklist.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 break-all">
                    <div className="text-sm font-medium text-gray-900">
                      {item.url}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {item.category ? (
                      <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                        {item.category}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">No category</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => onDelete(item.id)}
                      className="inline-flex items-center gap-1 text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="w-4 h-4" />
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
