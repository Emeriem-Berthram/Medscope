"use client";

import { FormEvent, useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export default function AuthForm({ mode }: { mode: "signin" | "signup" }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const { signIn, signUp } = useAuth();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (resetMode) {
        const { error: resetError } =
          await supabase.auth.resetPasswordForEmail(email.trim(), {
            redirectTo: `${window.location.origin}/login`,
          });
        if (resetError) throw resetError;
        // Always show this, even if the email is unknown,
        // so real accounts cannot be discovered.
        setResetSent(true);
        return;
      }
      if (mode === "signup") {
        if (name.trim().length < 2) throw new Error("Enter your full name.");
        if (password.length < 6)
          throw new Error("Password must be at least 6 characters.");
        const params = new URLSearchParams(window.location.search);
        const result = await signUp(
          name.trim(),
          email.trim(),
          password,
          params.get("ref") ?? ""
        );
        if (result === "verification-required") {
          setResetSent(false);
          setError("");
          setBusy(false);
          window.location.href = "/verify-email";
          return;
        }
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

  if (resetSent) {
    return (
      <div className="mt-6 rounded-2xl bg-burgundy-50 p-6 text-center">
        <p className="text-lg font-bold text-burgundy-700">
          Check your inbox
        </p>
        <p className="mt-1 text-sm text-burgundy-800/70">
          We sent a password reset link to {email.trim()}. The link
          expires after a short time.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      {mode === "signup" && (
        <label className="block">
          <span className="text-sm font-medium text-burgundy-900">Full name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-burgundy-200 px-3 py-2.5 outline-none focus:border-burgundy-500 focus:ring-2 focus:ring-burgundy-100"
            placeholder="Dr. Amina Yusuf"
          />
        </label>
      )}
      <label className="block">
        <span className="text-sm font-medium text-burgundy-900">Email</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 w-full rounded-lg border border-burgundy-200 px-3 py-2.5 outline-none focus:border-burgundy-500 focus:ring-2 focus:ring-burgundy-100"
          placeholder="you@example.com"
        />
      </label>
      {!resetMode && (
        <label className="block">
          <span className="text-sm font-medium text-burgundy-900">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-burgundy-200 px-3 py-2.5 outline-none focus:border-burgundy-500 focus:ring-2 focus:ring-burgundy-100"
            placeholder="••••••••"
          />
        </label>
      )}

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-full bg-burgundy-500 py-3 font-semibold text-white hover:bg-burgundy-600 disabled:opacity-60"
      >
        {busy
          ? "Please wait…"
          : resetMode
            ? "Send reset link"
            : mode === "signup"
              ? "Create free account"
              : "Sign in"}
      </button>

      {mode === "signin" && (
        <p className="text-center text-sm">
          <button
            type="button"
            onClick={() => setResetMode((v) => !v)}
            className="font-semibold text-burgundy-600 hover:underline"
          >
            {resetMode ? "Back to sign in" : "Forgot password?"}
          </button>
        </p>
      )}
    </form>
  );
}
