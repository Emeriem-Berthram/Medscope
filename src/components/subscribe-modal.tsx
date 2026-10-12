"use client";

import { FormEvent, useState } from "react";
import { useAuth } from "@/lib/auth";
import { PLANS, payWithPaystack } from "@/lib/paystack";

export default function SubscribeModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { user, setProfile } = useAuth();
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<"idle" | "paying" | "paid" | "error">(
    "idle"
  );

  if (!open || !user) return null;

  const pay = (plan: "monthly" | "annual") => (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setStatus("paying");
    payWithPaystack({
      email: user.email,
      amountKobo:
        plan === "annual"
          ? PLANS[1].amountKobo
          : PLANS[0].amountKobo,
      plan,
      onSuccess: (reference) => {
        // Test mode: mark the plan active. In production,
        // verify the reference server-side before granting access.
        setProfile({ plan });
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-burgundy-950/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl border border-burgundy-100 bg-cream-50 p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-burgundy-950">
          Subscribe to Medscope
        </h2>
        <p className="mt-1 text-sm text-burgundy-800/70">
          Paying as {user.email}. Test mode — no real money moves.
        </p>

        {status === "paid" ? (
          <div className="mt-6 rounded-2xl bg-burgundy-50 p-6 text-center">
            <p className="text-lg font-bold text-burgundy-700">
              Payment successful
            </p>
            <p className="mt-1 text-sm text-burgundy-800/70">
              Your full question bank is unlocked.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {PLANS.map((plan) => (
              <button
                key={plan.id}
                onClick={pay(plan.id)}
                disabled={busy}
                className="flex w-full items-center justify-between rounded-2xl border border-burgundy-100 bg-cream-50 p-5 text-left hover:border-burgundy-400 disabled:opacity-60"
              >
                <div>
                  <p className="font-bold text-burgundy-950">{plan.name}</p>
                  <p className="mt-1 text-xs text-burgundy-800/70">
                    {plan.blurb}
                  </p>
                </div>
                <p className="ml-4 text-xl font-bold text-burgundy-600">
                  {plan.price}
                </p>
              </button>
            ))}
            {status === "paying" && (
              <p className="text-center text-sm text-burgundy-800/70">
                Complete the payment in the Paystack popup…
              </p>
            )}
            {status === "error" && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                Payment failed. Try again.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
