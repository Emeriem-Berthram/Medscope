"use client";

import { FormEvent, useState, useMemo, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { supabase, getAuthRedirectUrl } from "@/lib/supabase";

export default function AuthForm({ mode }: { mode: "signin" | "signup" }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [resending, setResending] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [showResendBtn, setShowResendBtn] = useState(false);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const { signIn, signUp } = useAuth();

  // Secure Password Criteria Checklist
  const passwordCriteria = useMemo(() => {
    return {
      minLength: password.length >= 8,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    };
  }, [password]);

  const passwordScore = useMemo(() => {
    let score = 0;
    if (passwordCriteria.minLength) score++;
    if (passwordCriteria.hasUpper) score++;
    if (passwordCriteria.hasLower) score++;
    if (passwordCriteria.hasNumber) score++;
    if (passwordCriteria.hasSpecial) score++;
    return score;
  }, [passwordCriteria]);

  const isPasswordSecure = passwordScore === 5;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const emailParam = params.get("email");
      if (emailParam) {
        setEmail(emailParam);
      }
      if (params.get("verified") === "true") {
        setInfoMessage(
          "✓ Email verified successfully! Please sign in with your credentials to access your dashboard."
        );
      } else if (window.location.hash.includes("access_token")) {
        setInfoMessage(
          "✓ Verification confirmed! Your account is active. Please sign in below."
        );
      }
    }
  }, []);

  const handleResendVerification = async () => {
    if (!email.trim()) {
      setError("Please enter your registered email address.");
      return;
    }
    setResending(true);
    setError("");
    setInfoMessage("");
    try {
      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email: email.trim().toLowerCase(),
        options: {
          emailRedirectTo: getAuthRedirectUrl("/login?verified=true"),
        },
      });
      if (resendError) throw resendError;
      setInfoMessage(
        "Verification email resent! Please check your inbox and spam folder."
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to resend verification email."
      );
    } finally {
      setResending(false);
    }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setInfoMessage("");
    setShowResendBtn(false);
    setBusy(true);

    const cleanEmail = email.trim().toLowerCase();

    try {
      if (resetMode) {
        // First try the instant candidate password reset RPC if a new password is provided
        if (password.trim().length >= 8) {
          try {
            const { data: rpcSuccess } = await supabase.rpc(
              "reset_candidate_password",
              {
                candidate_email: cleanEmail,
                new_password: password.trim(),
              }
            );
            if (rpcSuccess) {
              setInfoMessage(
                "✓ Password updated successfully! Signing you into your dashboard..."
              );
              await signIn(cleanEmail, password.trim());
              window.location.href = "/app";
              return;
            }
          } catch {
            // Fallback to email reset link
          }
        }

        const { error: resetError } =
          await supabase.auth.resetPasswordForEmail(cleanEmail, {
            redirectTo: getAuthRedirectUrl("/login"),
          });
        if (resetError) throw resetError;
        setResetSent(true);
        return;
      }

      if (mode === "signup") {
        if (name.trim().length < 2) {
          throw new Error("Please enter your full name.");
        }
        if (!passwordCriteria.minLength) {
          throw new Error("Password must be at least 8 characters long.");
        }
        if (!passwordCriteria.hasUpper) {
          throw new Error(
            "Password must contain at least one uppercase letter (A-Z)."
          );
        }
        if (!passwordCriteria.hasLower) {
          throw new Error(
            "Password must contain at least one lowercase letter (a-z)."
          );
        }
        if (!passwordCriteria.hasNumber) {
          throw new Error("Password must contain at least one number (0-9).");
        }
        if (!passwordCriteria.hasSpecial) {
          throw new Error(
            "Password must contain at least one special character (!@#$%...)."
          );
        }

        const params = new URLSearchParams(window.location.search);
        const result = await signUp(
          name.trim(),
          cleanEmail,
          password,
          params.get("ref") ?? ""
        );

        if (result === "already-registered") {
          setAlreadyRegistered(true);
          setError("");
          setBusy(false);
          return;
        }

        if (result === "verification-required") {
          setResetSent(false);
          setError("");
          setBusy(false);
          window.location.href = "/verify-email";
          return;
        }
      } else {
        await signIn(cleanEmail, password);
      }

      // Smooth transition to dashboard
      window.location.href = "/app";
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      if (
        msg.toLowerCase().includes("already registered") ||
        msg.toLowerCase().includes("already exists") ||
        msg.toLowerCase().includes("user_already_exists")
      ) {
        setAlreadyRegistered(true);
        setError("");
      } else {
        setError(msg);
        if (
          msg.toLowerCase().includes("not confirmed") ||
          msg.toLowerCase().includes("not verified")
        ) {
          setShowResendBtn(true);
        }
      }
    } finally {
      setBusy(false);
    }
  };

  if (resetSent) {
    return (
      <div className="mt-6 rounded-2xl bg-burgundy-50 p-6 text-center">
        <p className="text-lg font-bold text-burgundy-700">Check your inbox</p>
        <p className="mt-1 text-sm text-burgundy-800/70">
          We sent a password reset link to {email.trim().toLowerCase()}. The
          link expires after a short time.
        </p>
        <button
          type="button"
          onClick={() => {
            setResetSent(false);
            setResetMode(false);
          }}
          className="mt-4 rounded-full border border-burgundy-200 bg-white px-5 py-2 text-xs font-semibold text-burgundy-700 hover:bg-burgundy-50"
        >
          Return to sign in
        </button>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      {alreadyRegistered && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50/95 p-5 shadow-sm space-y-3">
          <div className="flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-200 text-amber-900 font-bold text-base">
              ℹ
            </span>
            <div>
              <h3 className="font-bold text-amber-950 text-sm sm:text-base">
                Account Already Registered
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-amber-900/90 leading-relaxed">
                An account with the email <strong className="font-bold text-amber-950">{email.trim().toLowerCase()}</strong> is already registered. Please sign in with your credentials to access your dashboard.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <a
              href={`/login?email=${encodeURIComponent(email.trim().toLowerCase())}`}
              className="flex-1 rounded-full bg-burgundy-600 py-2.5 text-center text-xs sm:text-sm font-bold text-cream-50 shadow-sm transition-all hover:bg-burgundy-700 active:scale-95"
            >
              Sign In to Your Account →
            </a>
            <button
              type="button"
              onClick={() => {
                setResetMode(true);
                setAlreadyRegistered(false);
              }}
              className="rounded-full border border-burgundy-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-burgundy-700 hover:bg-burgundy-50"
            >
              Reset Password
            </button>
          </div>
        </div>
      )}

      <form onSubmit={submit} className="space-y-4">
      {mode === "signup" && (
        <label className="block">
          <span className="text-sm font-medium text-burgundy-900">
            Full name
          </span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 w-full rounded-xl border border-burgundy-200 px-3.5 py-2.5 outline-none transition focus:border-burgundy-500 focus:ring-2 focus:ring-burgundy-100"
            placeholder="John Doe"
          />
        </label>
      )}

      <label className="block">
        <span className="text-sm font-medium text-burgundy-900">Email address</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 w-full rounded-xl border border-burgundy-200 px-3.5 py-2.5 outline-none transition focus:border-burgundy-500 focus:ring-2 focus:ring-burgundy-100"
          placeholder="doctor@example.com"
        />
      </label>

      {resetMode ? (
        <div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-burgundy-900">
              New Password (Optional)
            </span>
            <span className="text-[11px] text-burgundy-600 font-semibold">
              Min 8 characters
            </span>
          </div>
          <div className="relative mt-1">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-burgundy-200 px-3.5 py-2.5 pr-10 outline-none transition focus:border-burgundy-500 focus:ring-2 focus:ring-burgundy-100"
              placeholder="Enter new password to reset directly"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-burgundy-400 hover:text-burgundy-700 p-1 text-sm"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
          <p className="mt-1 text-[11px] text-burgundy-800/70">
            Enter a new password (8+ chars) to update immediately, or leave blank to receive an email reset link.
          </p>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-burgundy-900">
              Password
            </span>
            {mode === "signup" && (
              <span className="text-[11px] font-semibold text-burgundy-600">
                Secure Password Required
              </span>
            )}
          </div>
          <div className="relative mt-1">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-burgundy-200 px-3.5 py-2.5 pr-10 outline-none transition focus:border-burgundy-500 focus:ring-2 focus:ring-burgundy-100"
              placeholder="••••••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-burgundy-400 hover:text-burgundy-700 p-1"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                  />
                </svg>
              ) : (
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Secure Password Requirements Live Checklist (on signup) */}
          {mode === "signup" && (
            <div className="mt-3 space-y-2 rounded-xl border border-burgundy-100 bg-cream-50/70 p-3 text-xs">
              {/* Strength Meter Bar */}
              <div className="flex items-center justify-between text-[11px] font-semibold text-burgundy-900 mb-1">
                <span>Strength:</span>
                <span
                  className={
                    passwordScore <= 2
                      ? "text-rose-600"
                      : passwordScore <= 4
                      ? "text-amber-600"
                      : "text-emerald-700 font-bold"
                  }
                >
                  {passwordScore === 0
                    ? "Empty"
                    : passwordScore <= 2
                    ? "Weak"
                    : passwordScore <= 4
                    ? "Medium"
                    : "Strong ✓"}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-burgundy-200/50">
                <div
                  className={`h-full transition-all duration-300 ${
                    passwordScore <= 2
                      ? "bg-rose-500"
                      : passwordScore <= 4
                      ? "bg-amber-500"
                      : "bg-emerald-600"
                  }`}
                  style={{ width: `${(passwordScore / 5) * 100}%` }}
                />
              </div>

              {/* Criteria Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 text-[11px]">
                <div
                  className={`flex items-center gap-1.5 ${
                    passwordCriteria.minLength
                      ? "font-semibold text-emerald-700"
                      : "text-burgundy-800/60"
                  }`}
                >
                  <span>{passwordCriteria.minLength ? "✓" : "○"}</span>
                  <span>At least 8 characters</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 ${
                    passwordCriteria.hasUpper
                      ? "font-semibold text-emerald-700"
                      : "text-burgundy-800/60"
                  }`}
                >
                  <span>{passwordCriteria.hasUpper ? "✓" : "○"}</span>
                  <span>Uppercase letter (A-Z)</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 ${
                    passwordCriteria.hasLower
                      ? "font-semibold text-emerald-700"
                      : "text-burgundy-800/60"
                  }`}
                >
                  <span>{passwordCriteria.hasLower ? "✓" : "○"}</span>
                  <span>Lowercase letter (a-z)</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 ${
                    passwordCriteria.hasNumber
                      ? "font-semibold text-emerald-700"
                      : "text-burgundy-800/60"
                  }`}
                >
                  <span>{passwordCriteria.hasNumber ? "✓" : "○"}</span>
                  <span>At least one number (0-9)</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 sm:col-span-2 ${
                    passwordCriteria.hasSpecial
                      ? "font-semibold text-emerald-700"
                      : "text-burgundy-800/60"
                  }`}
                >
                  <span>{passwordCriteria.hasSpecial ? "✓" : "○"}</span>
                  <span>Special character (!@#$%^&*...)</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {infoMessage && (
        <p
          role="status"
          className="rounded-xl bg-emerald-50 border border-emerald-200 px-3.5 py-2.5 text-xs font-semibold text-emerald-800"
        >
          {infoMessage}
        </p>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-xl bg-red-50 border border-red-200 px-3.5 py-2.5 text-xs text-red-700 space-y-2"
        >
          <p>{error}</p>
          {showResendBtn && (
            <button
              type="button"
              disabled={resending}
              onClick={handleResendVerification}
              className="mt-1 block rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-red-700 disabled:opacity-50"
            >
              {resending ? "Sending..." : "Resend Verification Email →"}
            </button>
          )}
          {mode === "signin" && !resetMode && (
            <button
              type="button"
              onClick={() => {
                setResetMode(true);
                setError("");
              }}
              className="mt-1 block text-left text-xs font-semibold text-burgundy-700 underline hover:text-burgundy-900"
            >
              Forgotten or lost password? Click here to reset →
            </button>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={busy || (mode === "signup" && !isPasswordSecure)}
        className="w-full rounded-full bg-burgundy-600 py-3 font-semibold text-cream-50 shadow-sm transition-all hover:bg-burgundy-700 active:scale-95 disabled:opacity-50"
      >
        {busy
          ? "Please wait…"
          : resetMode
          ? password.trim().length >= 8
            ? "Reset Password & Sign In"
            : "Send reset link"
          : mode === "signup"
          ? "Create free account"
          : "Sign in"}
      </button>

      {mode === "signin" && (
        <p className="text-center text-sm pt-1">
          <button
            type="button"
            onClick={() => {
              setResetMode((v) => !v);
              setError("");
              setInfoMessage("");
            }}
            className="font-semibold text-burgundy-600 hover:underline text-xs sm:text-sm"
          >
            {resetMode ? "Back to sign in" : "Forgot password?"}
          </button>
        </p>
      )}
    </form>
    </div>
  );
}
