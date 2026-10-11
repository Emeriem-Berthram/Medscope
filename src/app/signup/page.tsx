import Link from "next/link";
import AuthForm from "@/components/auth-form";

export const metadata = {
  title: "Sign up free — Medscope",
  description:
    "Create a free Medscope account. 20 questions a month and Free Resources, no card needed.",
};

export default function SignupPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-14">
      <div className="rounded-2xl border border-teal-100 p-8">
        <h1 className="text-3xl font-bold text-teal-950">
          Create your free account
        </h1>
        <p className="mt-2 text-sm text-teal-800/70">
          20 free questions a month and the Free Resources library. No card
          needed.
        </p>
        <AuthForm mode="signup" />
        <p className="mt-5 text-center text-sm text-teal-800/70">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-teal-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
