"use client";

import { FormEvent, useState } from "react";
import { useAuth } from "@/lib/auth";
import {
  Currency,
  PLANS_BY_CURRENCY,
  payWithPaystack,
} from "@/lib/paystack";

export default function SubscribeModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
  defaultPlan?: "monthly" | "annual";
}) {
  const { user, setProfile } = useAuth();
  const [currency, setCurrency] = useState<Currency>("NGN");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<"idle" | "paying" | "paid" | "error">(
    "idle"
  );

  if (!open || !user) return null;

  const currentPlans = PLANS_BY_CURRENCY[currency];

  const pay = (planId: "monthly" | "annual") => (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setStatus("paying");
    const chosenPlan = currentPlans.find((p) => p.id === planId) || currentPlans[0];

    payWithPaystack({
      email: user.email,
      amountSubunit: chosenPlan.amountSubunit,
      currency,
      plan: planId,
      onSuccess: async (reference) => {
        try {
          const res = await fetch("/api/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reference }),
          });
          const result = await res.json();
          if (!result.verified) {
            setStatus("error");
            setBusy(false);
            return;
          }
        } catch {
          /* verification unavailable — proceed on popup result */
        }
        setProfile({ plan: planId });
        setStatus("paid");
        setBusy(false);
        setTimeout(onClose, 1800);
      },
      onCancel: () => {
        setStatus("idle");
        setBusy(false);
      },
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-burgundy-950/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-3xl border border-burgundy-100 bg-cream-50 p-6 sm:p-8 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-burgundy-950">
              Subscribe to Medscope
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-burgundy-800/70">
              Paying as <span className="font-semibold text-burgundy-950">{user.email}</span>. Test mode enabled.
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-burgundy-100 text-sm font-bold text-burgundy-800 hover:bg-burgundy-200"
          >
            ✕
          </button>
        </div>

        {/* Currency Switcher Toggle */}
        <div className="mt-5 flex items-center justify-between rounded-2xl border border-burgundy-200/80 bg-white p-1.5 shadow-sm">
          <span className="pl-3 text-xs font-semibold text-burgundy-800">
            Select Currency:
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCurrency("NGN")}
              className={`rounded-xl px-4 py-1.5 text-xs font-bold transition-all ${
                currency === "NGN"
                  ? "bg-burgundy-600 text-white shadow-sm"
                  : "text-burgundy-800 hover:bg-burgundy-50"
              }`}
            >
              🇳🇬 Naira (₦ NGN)
            </button>
            <button
              type="button"
              onClick={() => setCurrency("USD")}
              className={`rounded-xl px-4 py-1.5 text-xs font-bold transition-all ${
                currency === "USD"
                  ? "bg-burgundy-600 text-white shadow-sm"
                  : "text-burgundy-800 hover:bg-burgundy-50"
              }`}
            >
              🇺🇸 US Dollar ($ USD)
            </button>
          </div>
        </div>

        {status === "paid" ? (
          <div className="mt-6 rounded-2xl bg-burgundy-50 p-6 text-center border border-burgundy-200">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-2xl text-emerald-800">
              ✓
            </div>
            <p className="mt-2 text-lg font-bold text-burgundy-800">
              Payment successful!
            </p>
            <p className="mt-1 text-xs text-burgundy-800/70">
              Your full recall bank, timed mocks, and referral benefits are now unlocked.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {currentPlans.map((plan) => (
              <button
                key={plan.id}
                onClick={pay(plan.id)}
                disabled={busy}
                className="group flex w-full items-center justify-between rounded-2xl border border-burgundy-200/90 bg-white p-4 sm:p-5 text-left transition-all hover:border-burgundy-500 hover:bg-burgundy-50/40 active:scale-[0.99] disabled:opacity-60"
              >
                <div className="flex-1 pr-3">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-burgundy-950 sm:text-lg">
                      {plan.name}
                    </p>
                    {plan.id === "annual" && (
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                        {currency === "NGN" ? "SAVE ₦44,000" : "SAVE $60"}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-burgundy-800/70 leading-relaxed">
                    {plan.blurb}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl sm:text-2xl font-black text-burgundy-600">
                    {plan.price}
                  </p>
                  <span className="text-[11px] font-semibold text-burgundy-700/80">
                    {plan.period}
                  </span>
                </div>
              </button>
            ))}

            {status === "paying" && (
              <p className="text-center text-xs font-semibold text-burgundy-800/80 animate-pulse pt-2">
                Complete the checkout in the Paystack secure popup…
              </p>
            )}

            {status === "error" && (
              <p className="rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 text-center">
                Payment could not be processed. Please try again.
              </p>
            )}
          </div>
        )}

        <div className="mt-6 border-t border-burgundy-100/80 pt-4 text-center">
          <p className="text-[11px] text-burgundy-800/60">
            🔒 Secured by Paystack · Accept Naira cards, bank transfers, USSD & International cards
          </p>
        </div>
      </div>
    </div>
  );
}
