"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import SubscribeModal from "./subscribe-modal";

export default function PricingButton({
  plan,
  label,
}: {
  plan: "free" | "monthly" | "annual";
  label: string;
}) {
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  if (plan === "free") {
    return (
      <Link
        href="/signup"
        className="mt-6 rounded-full bg-burgundy-600 px-6 py-3 font-semibold text-cream-50 hover:bg-burgundy-700"
      >
        {label}
      </Link>
    );
  }

  if (!user) {
    return (
      <Link
        href="/signup"
        className="mt-6 rounded-full bg-burgundy-600 px-6 py-3 font-semibold text-cream-50 hover:bg-burgundy-700"
      >
        {label}
      </Link>
    );
  }

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className="mt-6 rounded-full bg-burgundy-600 px-6 py-3 font-semibold text-cream-50 hover:bg-burgundy-700"
      >
        {label}
      </button>
      <SubscribeModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
