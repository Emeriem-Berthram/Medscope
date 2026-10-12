"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    const { data, error } = await supabase.auth.updateUser({
      password,
    });
    setBusy(false);
    if (error) {
      setError(
        error.message.toLowerCase().includes("expired")
          ? "That reset link has expired. Request a new one."
          : error.message
      );
      return;
    }
    if (data.user) setDone(true);
  };

  if (done) {
    return (
      <div className="mt-6 rounded-2xl bg-burgundy-50 p-6 text-center">
        <p className="text-lg font-bold text-burgundy-700">
          Password updated
        </p>
        <p className="mt-1 text-sm text-burgundy-800/70">
          Sign in with your new password.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      <label className="block">
        <span className="text-sm font-medium text-burgundy-900">
          New password
        </span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mt-1 w-full rounded-lg border border-burgundy-200 px-3 py-2.5 outline-none focus:border-burgundy-500 focus:ring-2 focus:ring-burgundy-100"
          placeholder="••••••••"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-burgundy-900">
          Repeat new password
        </span>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          className="mt-1 w-full rounded-lg border border-burgundy-200 px-3 py-2.5 outline-none focus:border-burgundy-500 focus:ring-2 focus:ring-burgundy-100"
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
        className="w-full rounded-full bg-burgundy-500 py-3 font-semibold text-white hover:bg-burgundy-600 disabled:opacity-60"
      >
        {busy ? "Updating…" : "Update password"}
      </button>
    </form>
  );
}
