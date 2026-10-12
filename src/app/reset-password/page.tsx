import Link from "next/link";
import ResetPasswordForm from "@/components/reset-password-form";

export const metadata = {
  title: "Reset password — Medscope",
  description: "Set a new password for your Medscope account.",
};

export default function ResetPasswordPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-14">
      <div className="rounded-2xl border border-burgundy-100 p-8">
        <h1 className="text-3xl font-bold text-burgundy-950">
          Set a new password
        </h1>
        <p className="mt-2 text-sm text-burgundy-800/70">
          Open the reset link from your email, then choose a new
          password here.
        </p>
        <ResetPasswordForm />
        <p className="mt-5 text-center text-sm text-burgundy-800/70">
          <Link href="/login" className="font-semibold text-burgundy-600 hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
