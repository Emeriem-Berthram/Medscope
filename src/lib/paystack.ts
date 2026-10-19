/* Paystack checkout with Multi-Currency Support (NGN & USD).
   Uses the official @paystack/inline-js package.
   Amounts in NGN are in kobo (₦12,000 = 1,200,000 kobo).
   Amounts in USD are in cents ($15 = 1,500 cents). */

export const PAYSTACK_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_PAYSTACK_KEY ??
  "pk_test_6d1a59ef58a32c0ae8ed1b9afe17c241a48dc82f";

export type Currency = "NGN" | "USD";

export interface PlanItem {
  id: "monthly" | "annual";
  name: string;
  price: string;
  amountSubunit: number; // Kobo for NGN, Cents for USD
  amountKobo: number; // Backward compatibility alias
  period: string;
  blurb: string;
}

export const PLANS_BY_CURRENCY: Record<Currency, PlanItem[]> = {
  NGN: [
    {
      id: "monthly",
      name: "Monthly",
      price: "₦12,000",
      period: "/mo",
      amountSubunit: 1200000,
      amountKobo: 1200000,
      blurb:
        "Full bank for your college & faculty, timed mocks, analytics, offline packs.",
    },
    {
      id: "annual",
      name: "Annual",
      price: "₦100,000",
      period: "/yr",
      amountSubunit: 10000000,
      amountKobo: 10000000,
      blurb:
        "Everything in Monthly — save ₦44,000 a year, priority support and exam-season updates.",
    },
  ],
  USD: [
    {
      id: "monthly",
      name: "Monthly",
      price: "$15",
      period: "/mo",
      amountSubunit: 1500,
      amountKobo: 1500,
      blurb:
        "Full bank for your college & faculty, timed mocks, analytics, offline packs.",
    },
    {
      id: "annual",
      name: "Annual",
      price: "$120",
      period: "/yr",
      amountSubunit: 12000,
      amountKobo: 12000,
      blurb:
        "Everything in Monthly — save $60 a year, priority support and recall pack updates.",
    },
  ],
};

// Default export for backward compatibility
export const PLANS = PLANS_BY_CURRENCY.NGN;

export interface PayOptions {
  email: string;
  amountSubunit?: number;
  amountKobo?: number;
  currency?: Currency;
  plan: "monthly" | "annual";
  onSuccess: (reference: string) => void;
  onCancel: () => void;
}

export async function payWithPaystack({
  email,
  amountSubunit,
  amountKobo,
  currency = "NGN",
  onSuccess,
  onCancel,
}: PayOptions) {
  const finalAmount = amountSubunit ?? amountKobo ?? 1200000;
  const { default: PaystackPop } = await import("@paystack/inline-js");
  const paystack = new PaystackPop();

  paystack.newTransaction({
    key: PAYSTACK_PUBLIC_KEY,
    email,
    amount: finalAmount,
    currency,
    reference: `medscope-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`,
    onSuccess: (transaction) => onSuccess(transaction.reference ?? ""),
    onCancel,
    onError: () => onCancel(),
  });
}

export function planIdFromReference(plan: "monthly" | "annual") {
  return plan === "annual" ? "annual" : "monthly";
}
