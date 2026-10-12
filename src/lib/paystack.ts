/* Paystack checkout (test mode).
   Loads the Paystack popup script on demand — no package
   needed. Amounts are in kobo (₦12,000 = 1,200,000). */

export const PAYSTACK_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_PAYSTACK_KEY ??
  "pk_test_6d1a59ef58a32c0ae8ed1b9afe17c241a48dc82f";

export const PLANS = [
  {
    id: "monthly" as const,
    name: "Monthly",
    price: "₦12,000/mo",
    amountKobo: 1200000,
    blurb: "Full bank for your college & faculty, timed mocks, analytics, offline packs.",
  },
  {
    id: "annual" as const,
    name: "Annual",
    price: "₦10,000/yr",
    amountKobo: 1000000,
    blurb: "Everything in Monthly — save ₦134,000 a year, priority support and exam-season updates.",
  },
];

function loadPaystackScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject(new Error("no window"));
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src*="js.paystack.co"]'
    );
    if (existing) {
      if ((window as any).PaystackPop) return resolve();
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", reject);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/1.0.3/paystack.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Paystack failed to load"));
    document.body.appendChild(script);
  });
}

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
  plan,
  onSuccess,
  onCancel,
}: PayOptions) {
  await loadPaystackScript();
  const handler = (window as any).PaystackPop.setup({
    key: PAYSTACK_PUBLIC_KEY,
    email,
    amount: amountKobo,
    currency: "NGN",
    ref: `medscope_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 8)}`,
    callback: (response: { reference: string }) =>
      onSuccess(response.reference),
    onClose: onCancel,
  });
  handler.openIframe();
}

export function planIdFromReference(plan: "monthly" | "annual") {
  return plan === "annual" ? "annual" : "monthly";
}
