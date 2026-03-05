"use client";
/* eslint-disable max-lines */

import { Check, Crown, Loader2, X } from "lucide-react";

export type BillingPlanView = {
  code: string;
  name: string;
  description: string | null;
  priceMnt: number;
  durationMonths: number;
  maxChildren: number;
  currency: string;
};

export type BillingSummaryView = {
  isPaid: boolean;
  maxChildren: number;
  activePlanCode: string | null;
  activePlanName: string | null;
  subscriptionEndsAt?: string | Date | null;
  childCount: number;
  remainingSlots: number;
};

type BillingUpgradeModalProps = {
  open: boolean;
  plans: BillingPlanView[];
  summary: BillingSummaryView | null;
  loading: boolean;
  error: string;
  checkingOutPlanCode: string | null;
  onClose: () => void;
  onCheckout: (planCode: string) => void;
};

const formatMnt = (amount: number) =>
  new Intl.NumberFormat("mn-MN", {
    style: "currency",
    currency: "MNT",
    maximumFractionDigits: 0,
  }).format(amount);

const formatDuration = (months: number) => {
  if (months === 1) return "1 month";
  return `${months} months`;
};

const formatDate = (value: string | Date | null | undefined) => {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
};

export default function BillingUpgradeModal({
  open,
  plans,
  summary,
  loading,
  error,
  checkingOutPlanCode,
  onClose,
  onCheckout,
}: BillingUpgradeModalProps) {
  if (!open) return null;

  const paidUntilLabel = formatDate(summary?.subscriptionEndsAt ?? null);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-4xl rounded-2xl border border-gray-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Subscription Plans</h3>
            <p className="mt-1 text-sm text-gray-600">
              Free plan supports 1 child. Upgrade for multiple children.
            </p>
            {summary && (
              <p className="mt-2 text-xs text-gray-500">
                Current:{" "}
                <span className="font-semibold text-gray-700">
                  {summary.activePlanName ?? "Free plan"}
                </span>{" "}
                | Children:{" "}
                <span className="font-semibold text-gray-700">
                  {summary.childCount}/{summary.maxChildren}
                </span>
                {paidUntilLabel ? (
                  <>
                    {" "}
                    | Paid until{" "}
                    <span className="font-semibold text-gray-700">{paidUntilLabel}</span>
                  </>
                ) : null}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-gray-200 p-2 hover:bg-gray-50"
            aria-label="Close"
          >
            <X className="h-4 w-4 text-gray-600" />
          </button>
        </div>

        <div className="px-5 py-4">
          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          {loading ? (
            <div className="flex min-h-32 items-center justify-center text-sm text-gray-600">
              Loading billing plans...
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {plans.map((plan) => {
                const isActive = summary?.activePlanCode === plan.code;
                const isCheckingOut = checkingOutPlanCode === plan.code;

                return (
                  <div
                    key={plan.code}
                    className={`rounded-2xl border p-4 ${
                      isActive
                        ? "border-emerald-200 bg-emerald-50/60"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <h4 className="text-base font-semibold text-gray-900">{plan.name}</h4>
                      {isActive ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
                          <Check className="h-3.5 w-3.5" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700">
                          <Crown className="h-3.5 w-3.5" />
                          Premium
                        </span>
                      )}
                    </div>
                    <p className="mb-3 text-sm text-gray-600">
                      {plan.description ?? "Premium multi-child access plan."}
                    </p>
                    <div className="mb-1 text-2xl font-bold text-gray-900">
                      {formatMnt(plan.priceMnt)}
                    </div>
                    <p className="mb-3 text-xs text-gray-500">
                      {formatDuration(plan.durationMonths)} | Up to {plan.maxChildren} children
                    </p>
                    <button
                      type="button"
                      onClick={() => onCheckout(plan.code)}
                      disabled={Boolean(checkingOutPlanCode) || isActive}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isCheckingOut ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Redirecting...
                        </>
                      ) : isActive ? (
                        "Current Plan"
                      ) : (
                        "Pay With Bonum"
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
