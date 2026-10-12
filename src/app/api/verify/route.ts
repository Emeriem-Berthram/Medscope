import { NextRequest, NextResponse } from "next/server";

/* Server-side Paystack payment verification.
   POST /api/verify
   Body: { reference: string }
   The secret key never leaves the server.
   In production, also check that the paid amount
   matches the plan and that the customer email
   belongs to the requesting user. */

const SECRET_KEY = process.env.PAYSTACK_SECRET_KEY ?? "";

export async function POST(req: NextRequest) {
  if (!SECRET_KEY) {
    return NextResponse.json(
      { error: "Paystack secret key not configured" },
      { status: 500 }
    );
  }

  const { reference } = await req.json();
  if (!reference) {
    return NextResponse.json(
      { error: "Reference is required" },
      { status: 400 }
    );
  }

  const res = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: {
        Authorization: `Bearer ${SECRET_KEY}`,
      },
    }
  );
  const data = await res.json();

  if (!data.status) {
    return NextResponse.json(
      { verified: false, error: data.message ?? "Verification failed" },
      { status: 400 }
    );
  }

  const tx = data.data;
  const verified = tx.status === "success";

  return NextResponse.json({
    verified,
    reference: tx.reference,
    amount: tx.amount,
    currency: tx.currency,
    status: tx.status,
    email: tx.customer?.email,
    paidAt: tx.paid_at,
  });
}
