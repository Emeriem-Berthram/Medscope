import Link from "next/link";
import AuthForm from "@/components/auth-form";

export const metadata = {
  title: "Sign in — Medscope",
  description: "Sign in to your Medscope account to continue practising.",
};

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-14">
      <div className="rounded-2xl border border-teal-100 p-8">
        <h1 className="text-3xl font-bold text-teal-950">Welcome back</h1>
        <p className="mt-2 text-sm text-teal-800/70">
          Sign in to continue your preparation.
        </p>
        <AuthForm mode="signin" />
        <p className="mt-5 text-center text-sm text-teal-800/70">
          New to Medscope?{" "}
          <Link href="/signup" className="font-semibold text-teal-600 hover:underline">
            Create a free account
          </Link>
        </p>
      </div>
    </main>
  );
}
