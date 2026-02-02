"use client";

import { useState } from "react";
import { Plus, Copy, Check, X } from "lucide-react";

const children = [
  {
    id: 1,
    name: "Emma",
    status: "Active",
    todayUsage: "3h 45m",
    pin: "8472",
    avatar: "E",
  },
  {
    id: 2,
    name: "Oliver",
    status: "Active",
    todayUsage: "2h 12m",
    pin: "5639",
    avatar: "O",
  },
];

export default function ChildrenTab() {
  const [showAddChild, setShowAddChild] = useState(false);
  const [generatedPin, setGeneratedPin] = useState("");
  const [copiedPin, setCopiedPin] = useState(false);

  const generatePin = () => {
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedPin(pin);
  };

  const copyPin = () => {
    if (!generatedPin) return;
    void navigator.clipboard.writeText(generatedPin);
    setCopiedPin(true);
    setTimeout(() => setCopiedPin(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold text-gray-900 mb-1">
            Children
          </h1>
          <p className="text-base text-gray-500">
            Manage and monitor your children's accounts
          </p>
        </div>
        <button
          onClick={() => {
            setShowAddChild(true);
            generatePin();
          }}
          className="px-5 py-2.5 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Child
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {children.map((child) => (
          <div
            key={child.id}
            className="bg-white rounded-2xl p-6 border border-gray-200/80 hover:shadow-lg transition-all"
          >
            <div className="flex items-start gap-4 mb-5">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-sm">
                {child.avatar}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {child.name}
                  </h3>
                  <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    {child.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Active monitoring</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <p className="text-xs text-gray-600 mb-1">Today's Usage</p>
                <p className="text-lg font-semibold text-gray-900">
                  {child.todayUsage}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <p className="text-xs text-gray-600 mb-1">Safety Score</p>
                <p className="text-lg font-semibold text-green-600">Good</p>
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-blue-700 mb-1">
                    Access PIN
                  </p>
                  <p className="text-2xl font-bold font-mono text-blue-900 tracking-wider">
                    {child.pin}
                  </p>
                </div>
                <button className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors">
                  <Copy className="w-5 h-5 text-white" />
                </button>
              </div>
              <p className="text-xs text-blue-700 mt-2">
                Share with your child to access their device
              </p>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors">
                View Activity
              </button>
              <button className="flex-1 px-4 py-2.5 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors">
                Settings
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAddChild && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-gray-200/80 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold text-gray-900">
                Add New Child
              </h3>
              <button
                onClick={() => setShowAddChild(false)}
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Child's Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Emma, Oliver"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Access PIN Code
                </label>
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 mb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-xs text-blue-700 mb-1">
                        Generated PIN
                      </p>
                      <p className="text-3xl font-bold font-mono text-blue-900 tracking-widest">
                        {generatedPin}
                      </p>
                    </div>
                    <button
                      onClick={copyPin}
                      className="w-12 h-12 bg-blue-500 rounded-xl hover:bg-blue-600 transition-colors flex items-center justify-center"
                    >
                      {copiedPin ? (
                        <Check className="w-6 h-6 text-white" />
                      ) : (
                        <Copy className="w-6 h-6 text-white" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <button className="w-full mt-6 bg-blue-500 text-white py-3 rounded-xl hover:bg-blue-600 transition-colors font-semibold text-base shadow-sm">
              Create Child Account
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
