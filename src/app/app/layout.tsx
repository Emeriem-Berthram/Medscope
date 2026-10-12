"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { ReactNode } from "react";

const NAV = [
  { href: "/app", label: "Dashboard", end: true },
  { href: "/app/questions", label: "Question bank" },
  { href: "/app/practice", label: "Practise" },
  { href: "/app/mock", label: "Mock exam" },
  { href: "/app/challenge", label: "Challenge room" },
  { href: "/app/battle", label: "Battle room" },
  { href: "/app/radiographs", label: "Radiographs" },
  { href: "/app/lab-slides", label: "Laboratory slides" },
  { href: "/app/performance", label: "Performance" },
  { href: "/app/bookmarks", label: "Bookmarks" },
  { href: "/app/resources", label: "Free Resources" },
  { href: "/app/leaderboard", label: "Leaderboard" },
  { href: "/app/tournaments", label: "Tournaments" },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-burgundy-50/40">
      <header className="sticky top-0 z-20 border-b border-burgundy-100 bg-cream-50/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link href="/app" className="text-xl font-bold tracking-tight text-burgundy-600">
            Medscope
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-burgundy-800/70 sm:block">
              {user.name} · {user.exam || "No exam"} · {user.faculty || "no department"}
            </span>
            <button
              onClick={signOut}
              className="rounded-full border border-burgundy-200 px-4 py-1.5 text-sm font-semibold text-burgundy-700 hover:bg-burgundy-50"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[220px_1fr]">
        <nav className="space-y-1">
          {NAV.map((item) => {
            const active = item.end
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-lg px-3 py-2 text-sm font-semibold ${
                  active
                    ? "bg-burgundy-500 text-white"
                    : "text-burgundy-800 hover:bg-burgundy-100/70"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
