"use client";

import { useState, useEffect } from "react";
import { X, Copy, Check } from "lucide-react";

type AddChildModalProps = {
  onClose: () => void;
};

export default function AddChildModal({ onClose }: AddChildModalProps) {
  const [generatedPin, setGeneratedPin] = useState("");
  const [copiedPin, setCopiedPin] = useState(false);

  useEffect(() => {
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    setTimeout(() => setGeneratedPin(pin), 0);
  }, []);

  const copyPin = () => {
    if (!generatedPin) return;
    void navigator.clipboard.writeText(generatedPin);
    setCopiedPin(true);
    setTimeout(() => setCopiedPin(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/90 rounded-3xl p-8 max-w-md w-full border border-white/80 shadow-2xl backdrop-blur">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-semibold text-slate-900">
            Add New Child
          </h3>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Child`s Name
            </label>
            <input
              type="text"
              placeholder="e.g., Emma, Oliver"
              className="w-full px-4 py-3 bg-white border border-white/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 text-base"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Access PIN Code
            </label>
            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100/70 mb-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs text-amber-700 mb-1">Generated PIN</p>
                  <p className="text-3xl font-bold font-mono text-amber-900 tracking-widest">
                    {generatedPin}
                  </p>
                </div>
                <button
                  onClick={copyPin}
                  className="w-12 h-12 bg-slate-900 rounded-2xl hover:bg-slate-800 transition-colors flex items-center justify-center"
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
        <button className="w-full mt-6 bg-slate-900 text-white py-3 rounded-2xl hover:bg-slate-800 transition-colors font-semibold text-base shadow-sm">
          Create Child Account
        </button>
      </div>
    </div>
  );
}
