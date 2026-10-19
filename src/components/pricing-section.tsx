"use client";

import { useState } from "react";
import PricingButton from "./pricing-button";
import { Currency, PLANS_BY_CURRENCY } from "@/lib/paystack";

export default function PricingSection() {
  const [currency, setCurrency] = useState<Currency>("NGN");

  const plans = PLANS_BY_CURRENCY[currency];
  const monthlyPlan = plans.find((p) => p.id === "monthly")!;
  const annualPlan = plans.find((p) => p.id === "annual")!;

  const items = [
    {
      name: "Free",
      price: currency === "NGN" ? "₦0" : "$0",
      period: "",
      desc: "10 questions a month, Free Resources library, no card needed.",
      plan: "free" as const,
      cta: "Create free account",
      badge: null,
    },
    {
      name: monthlyPlan.name,
      price: monthlyPlan.price,
      period: monthlyPlan.period,
      desc: monthlyPlan.blurb,
      plan: "monthly" as const,
      cta: "Subscribe",
      badge: null,
    },
    {
      name: annualPlan.name,
      price: annualPlan.price,
      period: annualPlan.period,
      desc: annualPlan.blurb,
      plan: "annual" as const,
      cta: currency === "NGN" ? "Subscribe — save ₦44,000" : "Subscribe — save $60",
      badge: currency === "NGN" ? "Save ₦44,000/yr" : "Save $60/yr",
    },
  ];

  return (
    <section id="pricing" className="mx-auto max-w-6xl px-4 py-16">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-burgundy-950">Simple pricing</h2>
          <p className="mt-3 max-w-2xl text-burgundy-800/80">
            Start free. Subscribe to the college and faculty you&apos;re actually sitting —
            you never pay for a bank you won&apos;t open.
          </p>
        </div>

        {/* Currency Switcher */}
        <div className="flex items-center rounded-2xl border border-burgundy-200/90 bg-white p-1.5 shadow-xs">
          <span className="px-2 text-xs font-semibold text-burgundy-800 hidden sm:inline">
            Currency:
          </span>
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

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {items.map((p) => (
          <div
            key={p.name}
            className={`flex flex-col rounded-2xl border bg-cream-50 p-6 transition hover:shadow-md ${
              p.plan === "annual"
                ? "border-burgundy-400 ring-2 ring-burgundy-500/20"
                : "border-burgundy-100"
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-burgundy-700">{p.name}</h3>
              {p.badge && (
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                  {p.badge}
                </span>
              )}
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <p className="text-3xl font-bold text-burgundy-950">{p.price}</p>
              {p.period && (
                <span className="text-sm font-semibold text-burgundy-800/70">
                  {p.period}
                </span>
              )}
            </div>
            <p className="mt-3 flex-1 text-sm text-burgundy-900/70">{p.desc}</p>
            <PricingButton plan={p.plan} label={p.cta} />
          </div>
        ))}
      </div>
    </section>
  );
}
