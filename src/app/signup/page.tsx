import Link from "next/link";
import AuthForm from "@/components/auth-form";

export const metadata = {
  title: "Sign up free — Medscope",
  description:
    "Create a free Medscope account. 10 questions a month and Free Resources, no card needed.",
};

export default function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-14">
      <InviteBanner searchParams={searchParams} />
      <div className="rounded-2xl border border-burgundy-100 bg-cream-50 p-8">
        <h1 className="text-3xl font-bold text-burgundy-950">
          Create your free account
        </h1>
        <p className="mt-2 text-sm text-burgundy-800/70">
          10 free questions a month and the Free Resources library. No card
          needed.
        </p>
        <AuthForm mode="signup" />
        <p className="mt-5 text-center text-sm text-burgundy-800/70">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-burgundy-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}

async function InviteBanner({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const ref = (await searchParams).ref;
  if (!ref) return null;
  return (
    <p className="mb-4 rounded-xl border border-burgundy-200 bg-burgundy-50 px-4 py-3 text-center text-sm font-semibold text-burgundy-800">
      You were invited with code {ref}
    </p>
  );
}
