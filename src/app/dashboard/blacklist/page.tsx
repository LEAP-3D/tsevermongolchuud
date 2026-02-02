// src/app/dashboard/blacklist/page.tsx
"use client";

import { useEffect, useState } from "react";
import { PlusIcon } from "lucide-react";

import BlacklistTable from "../statistics/BlacklistTable";
import BlacklistAddForm from "../../../components/BlacklistAddForm";

type BlacklistItem = {
  id: string;
  url: string;
  category: string | null;
  createdAt: string;
};

export default function BlacklistPage() {
  const [blacklist, setBlacklist] = useState<BlacklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void fetchBlacklist();
  }, []);

  const fetchBlacklist = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/dashboard/blacklist");
      const data = await res.json();
      setBlacklist(data.blacklist || []);
    } catch (error) {
      console.error("Error fetching blacklist:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (url: string, category: string) => {
    try {
      setSubmitting(true);
      const res = await fetch("/api/dashboard/blacklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          category: category || null,
        }),
      });

      if (res.ok) {
        setShowAddForm(false);
        void fetchBlacklist();
      }
    } catch (error) {
      console.error("Error adding to blacklist:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this site from blacklist?")) return;

    try {
      const res = await fetch(`/api/dashboard/blacklist?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        void fetchBlacklist();
      }
    } catch (error) {
      console.error("Error deleting blacklist item:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Blacklist</h1>
        <button
          onClick={() => setShowAddForm((v) => !v)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <PlusIcon className="w-5 h-5" />
          Add Site
        </button>
      </div>

      {/* Add form */}
      {showAddForm && (
        <BlacklistAddForm
          onAdd={handleAdd}
          onCancel={() => setShowAddForm(false)}
          submitting={submitting}
        />
      )}

      {/* Table */}
      <BlacklistTable
        blacklist={blacklist}
        loading={loading}
        onDelete={handleDelete}
      />

      {/* Footer */}
      {!loading && blacklist.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm text-blue-800">
            <strong>{blacklist.length}</strong> site
            {blacklist.length !== 1 ? "s" : ""} blocked
          </div>
        </div>
      )}
    </div>
  );
}
