"use client";

import { useState, useEffect } from "react";
import { X, Copy, Check, UserPlus } from "lucide-react";

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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-slate-200 shadow-soft-xl animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-linear-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-soft">
              <UserPlus className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900">
                Add Family Member
              </h3>
              <p className="text-sm text-slate-600">Create a new account</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2.5">
              Child's Name
            </label>
            <input
              type="text"
              placeholder="e.g., Emma, Oliver"
              className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 text-base transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2.5">
              Access PIN Code
            </label>
            <div className="bg-linear-to-br from-primary-50 to-primary-100/50 rounded-xl p-5 border-2 border-primary-200">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs font-bold text-primary-700 mb-2 uppercase tracking-wide">
                    Generated PIN
                  </p>
                  <p className="text-4xl font-bold text-primary-900 tracking-widest">
                    {generatedPin}
                  </p>
                  <p className="text-xs text-primary-700 mt-2">
                    {copiedPin
                      ? "Copied to clipboard!"
                      : "Share with your child"}
                  </p>
                </div>
                <button
                  onClick={copyPin}
                  className="w-14 h-14 bg-linear-to-br from-primary-500 to-primary-600 rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all flex items-center justify-center shadow-soft"
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

        <button className="w-full mt-8 bg-linear-to-r from-primary-500 to-primary-600 text-white py-4 rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all font-bold text-base shadow-soft hover:shadow-soft-lg">
          Create Account
        </button>
      </div>
    </div>
  );
}
