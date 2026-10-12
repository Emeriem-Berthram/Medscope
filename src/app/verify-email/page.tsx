import Link from "next/link";

export const metadata = {
  title: "Verify your email — Medscope",
  description: "Verify your email to activate your Medscope account.",
};

export default function VerifyEmailPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-14">
      <div className="rounded-2xl border border-burgundy-100 p-8 text-center">
        <h1 className="text-3xl font-bold text-burgundy-950">
          Check your inbox
        </h1>
        <p className="mt-3 text-sm text-burgundy-800/70">
          We sent a verification link to your email. Open it to
          activate your Medscope account — your free questions are
          waiting.
        </p>
        <p className="mt-3 text-sm text-burgundy-800/70">
          Can&apos;t find it? Check your spam folder, or{" "}
          <Link href="/login" className="font-semibold text-burgundy-600 hover:underline">
            sign in
          </Link>{" "}
          if you have already verified.
        </p>
      </div>
    </main>
  );
}
