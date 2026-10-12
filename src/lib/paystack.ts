/* Paystack checkout (test mode).
   Uses the official @paystack/inline-js package so the
   checkout ships with our build — no external script,
   no deprecated CDN, and no popup-blocker issues.
   Amounts are in kobo (₦12,000 = 1,200,000).
   The package touches window at import time, so it is
   loaded lazily inside the pay function (never on the
   server during prerendering). */

export const PAYSTACK_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_PAYSTACK_KEY ??
  "pk_test_6d1a59ef58a32c0ae8ed1b9afe17c241a48dc82f";

export const PLANS = [
  {
    id: "monthly" as const,
    name: "Monthly",
    price: "₦12,000/mo",
    amountKobo: 1200000,
    blurb:
      "Full bank for your college & faculty, timed mocks, analytics, offline packs.",
  },
  {
    id: "annual" as const,
    name: "Annual",
    price: "₦10,000/yr",
    amountKobo: 1000000,
    blurb:
      "Everything in Monthly — save ₦134,000 a year, priority support and exam-season updates.",
  },
];

interface PayOptions {
  email: string;
  amountKobo: number;
  plan: "monthly" | "annual";
  onSuccess: (reference: string) => void;
  onCancel: () => void;
}

export async function payWithPaystack({
  email,
  amountKobo,
  onSuccess,
  onCancel,
}: PayOptions) {
  const { default: PaystackPop } = await import("@paystack/inline-js");
  const paystack = new PaystackPop();
  paystack.newTransaction({
    key: PAYSTACK_PUBLIC_KEY,
    email,
    amount: amountKobo,
    currency: "NGN",
    // Paystack only allows -, ., = and alphanumeric
    // characters in a reference.
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
