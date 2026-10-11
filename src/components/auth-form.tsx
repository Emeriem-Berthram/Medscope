"use client";

import { FormEvent, useState } from "react";
import { useAuth } from "@/lib/auth";

export default function AuthForm({ mode }: { mode: "signin" | "signup" }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { signIn, signUp } = useAuth();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (mode === "signup") {
        if (name.trim().length < 2) throw new Error("Enter your full name.");
        if (password.length < 6)
          throw new Error("Password must be at least 6 characters.");
        await signUp(name.trim(), email.trim(), password);
      } else {
        await signIn(email.trim(), password);
      }
      window.location.href = "/app";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      {mode === "signup" && (
        <label className="block">
          <span className="text-sm font-medium text-teal-900">Full name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-teal-200 px-3 py-2.5 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            placeholder="Dr. Amina Yusuf"
          />
        </label>
      )}
      <label className="block">
        <span className="text-sm font-medium text-teal-900">Email</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 w-full rounded-lg border border-teal-200 px-3 py-2.5 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          placeholder="you@example.com"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-teal-900">Password</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mt-1 w-full rounded-lg border border-teal-200 px-3 py-2.5 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          placeholder="••••••••"
        />
      </label>

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-full bg-teal-500 py-3 font-semibold text-white hover:bg-teal-600 disabled:opacity-60"
      >
        {busy
          ? "Please wait…"
          : mode === "signup"
            ? "Create free account"
            : "Sign in"}
      </button>
    </form>
  );
}
