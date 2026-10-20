"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { ReactNode, useState, useEffect } from "react";

const NAV = [
  { href: "/app", label: "Dashboard", icon: "📊", end: true },
  { href: "/app/questions", label: "Question bank", icon: "📚" },
  { href: "/app/practice", label: "Practise", icon: "✍️" },
  { href: "/app/mock", label: "Mock exam", icon: "⏱️" },
  { href: "/app/radiographs", label: "Radiographs", icon: "🩻" },
  { href: "/app/lab-slides", label: "Laboratory slides", icon: "🔬" },
  { href: "/app/battle", label: "Battle room", icon: "🏆" },
  { href: "/app/challenge", label: "Challenge room", icon: "⚔️" },
  { href: "/app/performance", label: "Performance", icon: "📈" },
  { href: "/app/bookmarks", label: "Bookmarks", icon: "🔖" },
  { href: "/app/resources", label: "Free Resources", icon: "💡" },
  { href: "/app/leaderboard", label: "Leaderboard", icon: "🥇" },
  { href: "/app/tournaments", label: "Tournaments", icon: "🎯" },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // If session check finished and user is not authenticated, redirect to /login
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  // Handle ESC key to dismiss drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-burgundy-200 border-t-burgundy-600" />
          <p className="text-sm font-semibold text-burgundy-900">
            Loading your Medscope workspace...
          </p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-burgundy-50/40 text-burgundy-950">
      {/* Sticky Top Header */}
      <header className="sticky top-0 z-30 border-b border-burgundy-100 bg-cream-50/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-burgundy-200/90 bg-white text-burgundy-800 shadow-sm transition-all hover:bg-burgundy-50 active:scale-95 md:hidden"
            >
              {mobileMenuOpen ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>

            {/* Brand Logo & Tagline */}
            <Link href="/app" className="flex items-center gap-2.5 group">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-burgundy-700 via-burgundy-800 to-burgundy-950 text-cream-50 shadow-md ring-1 ring-burgundy-500/20">
                <svg viewBox="0 0 32 32" className="h-5 w-5" fill="none">
                  <path
                    d="M16 23C13 21 8 21 4 23V8C8 6 13 6 16 8M16 23C19 21 24 21 28 23V8C24 6 19 6 16 8M16 23V8"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M16 4L9 7.5L16 11L23 7.5L16 4Z"
                    fill="currentColor"
                    fillOpacity="0.35"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M21 9.5V13"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <circle cx="16" cy="15" r="1.5" fill="#fef08a" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-base sm:text-lg font-extrabold tracking-tight text-burgundy-950 font-serif leading-tight">
                  Medscope
                </span>
                <span className="text-[10px] sm:text-[11px] font-medium tracking-wide text-burgundy-700/85 leading-none">
                  Learn • Revise • Succeed
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden text-xs sm:text-sm text-burgundy-800/80 md:block">
              {user.name} · {user.exam || "No exam"} · {user.faculty || "no department"}
            </span>
            <span className="rounded-full bg-burgundy-100/80 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-burgundy-800 border border-burgundy-200/60">
              {user.plan}
            </span>
            <button
              onClick={signOut}
              className="hidden sm:inline-block rounded-full border border-burgundy-200 bg-white px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold text-burgundy-700 shadow-sm hover:bg-burgundy-50 transition-all active:scale-95"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Horizontal Quick-Navigation Bar (swipeable chips, visible only on mobile screens < md) */}
      <nav
        aria-label="Mobile Quick Navigation"
        className="sticky top-[53px] sm:top-[57px] z-20 border-b border-burgundy-100 bg-cream-50/95 backdrop-blur-md px-3 py-2 md:hidden overflow-x-auto no-scrollbar scroll-smooth shadow-xs"
      >
        <div className="flex items-center gap-1.5 min-w-max">
          {NAV.map((item) => {
            const active = item.end
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all active:scale-95 ${
                  active
                    ? "bg-burgundy-600 text-white shadow-sm font-bold"
                    : "text-burgundy-900 bg-burgundy-100/70 hover:bg-burgundy-200/80"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile Slide-Over Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-burgundy-950/60 backdrop-blur-sm transition-opacity duration-300 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col bg-cream-50 shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Mobile Navigation"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-burgundy-900 bg-gradient-to-r from-burgundy-900 to-burgundy-950 px-4 py-3.5 text-cream-50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-burgundy-800 text-cream-50 shadow-sm ring-1 ring-burgundy-600/30">
              <svg viewBox="0 0 32 32" className="h-4 w-4" fill="none">
                <path
                  d="M16 23C13 21 8 21 4 23V8C8 6 13 6 16 8M16 23C19 21 24 21 28 23V8C24 6 19 6 16 8M16 23V8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M16 4L9 7.5L16 11L23 7.5L16 4Z"
                  fill="currentColor"
                  fillOpacity="0.35"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <circle cx="16" cy="15" r="1.5" fill="#fef08a" />
              </svg>
            </div>
            <div>
              <p className="font-extrabold text-sm leading-tight text-white font-serif">Medscope</p>
              <p className="text-[10px] text-burgundy-200/90 font-medium tracking-wide">Learn • Revise • Succeed</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-burgundy-800 text-burgundy-200 hover:bg-burgundy-700 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Doctor Candidate Profile Card */}
        <div className="border-b border-burgundy-100/90 bg-burgundy-50/70 p-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-burgundy-600 font-bold text-white shadow-sm text-sm">
              {user.name ? user.name[0].toUpperCase() : "M"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-burgundy-950">
                Dr. {user.name || "Candidate"}
              </p>
              <p className="truncate text-[11px] text-burgundy-800/75">
                {user.exam || "College"} · {user.faculty || "Faculty"}
              </p>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="rounded-full bg-burgundy-200/80 px-2 py-0.5 font-bold uppercase tracking-wider text-burgundy-900 text-[10px]">
              {user.plan} Plan
            </span>
            <span className="text-[11px] text-burgundy-700 font-medium">Recalls Bank Online</span>
          </div>
        </div>

        {/* Navigation Links Scrollable List */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-burgundy-500">
            Navigation
          </p>
          {NAV.map((item) => {
            const active = item.end
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-all ${
                  active
                    ? "bg-burgundy-600 text-white shadow-sm font-bold"
                    : "text-burgundy-900 hover:bg-burgundy-100/70 active:bg-burgundy-200"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span className="truncate">{item.label}</span>
                {active && (
                  <span className="ml-auto h-2 w-2 rounded-full bg-cream-50" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Drawer Discipline Quote & Settings */}
        <div className="p-3 border-t border-burgundy-100/80 bg-cream-50 space-y-2">
          <div className="rounded-2xl bg-gradient-to-br from-burgundy-900 via-burgundy-800 to-burgundy-950 p-3 text-cream-50 shadow-sm border border-burgundy-700/50">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 text-xs shadow-xs">
                💡
              </span>
              <p className="text-[11px] font-semibold leading-snug text-cream-100">
                Discipline today builds your future tomorrow.
              </p>
            </div>
            <div className="mt-1 text-center text-xs">
              <span className="text-rose-300">🤍</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setSettingsOpen(true);
              }}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-burgundy-200 bg-white py-2 text-xs font-semibold text-burgundy-800 hover:bg-burgundy-50 shadow-xs"
            >
              <span>⚙️</span>
              <span>Settings</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setHelpOpen(true);
              }}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-burgundy-200 bg-white py-2 text-xs font-semibold text-burgundy-800 hover:bg-burgundy-50 shadow-xs"
            >
              <span>❓</span>
              <span>Help</span>
            </button>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="border-t border-burgundy-100/90 p-3 bg-cream-50">
          <button
            onClick={signOut}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-burgundy-200 bg-white py-2.5 text-xs font-bold text-burgundy-700 shadow-sm hover:bg-burgundy-50 active:scale-98 transition-all"
          >
            <span>🚪</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Layout Grid: Default sidebar visible across all sections including Radiology and Laboratory */}
      <div className="mx-auto max-w-7xl px-3 sm:px-6 py-4 sm:py-8 grid gap-6 lg:gap-8 md:grid-cols-[200px_1fr] lg:grid-cols-[220px_1fr] items-start">
        <aside className="hidden md:flex md:flex-col md:sticky md:top-16 md:self-start md:h-[calc(100vh-5.5rem)] space-y-3 justify-between pb-2">
          <nav aria-label="Desktop Navigation" className="space-y-1 overflow-y-auto pr-1 no-scrollbar flex-1 min-h-0">
            {NAV.map((item) => {
              const active = item.end
                ? pathname === item.href
                : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs lg:text-sm font-semibold transition-all ${
                    active
                      ? "bg-burgundy-600 text-white shadow-sm font-bold"
                      : "text-burgundy-850 hover:bg-burgundy-100/70"
                  }`}
                >
                  <span className="text-base shrink-0">{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Far Bottom Left Sidebar Section: Discipline card + Settings + Help & Support */}
          <div className="pt-3 space-y-2.5 border-t border-burgundy-200/60 mt-auto shrink-0">
            {/* Discipline Quote Card */}
            <div className="rounded-2xl bg-gradient-to-br from-burgundy-900 via-burgundy-800 to-burgundy-950 p-3 text-cream-50 shadow-sm border border-burgundy-700/50">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-amber-500 to-rose-500 text-xs shadow-xs">
                  💡
                </span>
                <p className="text-[11px] font-semibold leading-snug text-cream-100">
                  Discipline today builds your future tomorrow.
                </p>
              </div>
              <div className="mt-1 text-center text-xs">
                <span className="text-rose-300">🤍</span>
              </div>
            </div>

            {/* Settings & Help Links pinned at the far bottom left */}
            <div className="space-y-0.5 pt-1">
              <button
                type="button"
                onClick={() => setSettingsOpen(true)}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs lg:text-sm font-bold text-burgundy-900 hover:bg-burgundy-100/80 transition-all text-left group"
              >
                <span className="text-base shrink-0 group-hover:rotate-45 transition-transform">⚙️</span>
                <span className="truncate">Settings</span>
              </button>
              <button
                type="button"
                onClick={() => setHelpOpen(true)}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs lg:text-sm font-bold text-burgundy-900 hover:bg-burgundy-100/80 transition-all text-left group"
              >
                <span className="text-base shrink-0 group-hover:scale-110 transition-transform">❓</span>
                <span className="truncate">Help &amp; Support</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="min-w-0 pb-24 md:pb-8 w-full">{children}</main>
      </div>

      {/* Interactive Mobile Bottom Navigation Bar (App Bar, visible only on screens < md) */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-burgundy-200/80 bg-cream-50/95 backdrop-blur-md px-2 py-1 shadow-[0_-4px_20px_rgba(110,20,40,0.08)] md:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around">
          <Link
            href="/app"
            className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-all active:scale-95 ${
              pathname === "/app"
                ? "text-burgundy-700 font-bold"
                : "text-burgundy-800/60 hover:text-burgundy-900"
            }`}
          >
            <span className="text-lg">📊</span>
            <span className="text-[10px] mt-0.5">Dashboard</span>
            {pathname === "/app" && (
              <span className="h-1 w-1 rounded-full bg-burgundy-600 mt-0.5" />
            )}
          </Link>

          <Link
            href="/app/questions"
            className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-all active:scale-95 ${
              pathname.startsWith("/app/questions")
                ? "text-burgundy-700 font-bold"
                : "text-burgundy-800/60 hover:text-burgundy-900"
            }`}
          >
            <span className="text-lg">📚</span>
            <span className="text-[10px] mt-0.5">Bank</span>
            {pathname.startsWith("/app/questions") && (
              <span className="h-1 w-1 rounded-full bg-burgundy-600 mt-0.5" />
            )}
          </Link>

          <Link
            href="/app/practice"
            className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-all active:scale-95 ${
              pathname.startsWith("/app/practice")
                ? "text-burgundy-700 font-bold"
                : "text-burgundy-800/60 hover:text-burgundy-900"
            }`}
          >
            <span className="text-lg">✍️</span>
            <span className="text-[10px] mt-0.5">Practise</span>
            {pathname.startsWith("/app/practice") && (
              <span className="h-1 w-1 rounded-full bg-burgundy-600 mt-0.5" />
            )}
          </Link>

          <Link
            href="/app/mock"
            className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-all active:scale-95 ${
              pathname.startsWith("/app/mock")
                ? "text-burgundy-700 font-bold"
                : "text-burgundy-800/60 hover:text-burgundy-900"
            }`}
          >
            <span className="text-lg">⏱️</span>
            <span className="text-[10px] mt-0.5">Mock</span>
            {pathname.startsWith("/app/mock") && (
              <span className="h-1 w-1 rounded-full bg-burgundy-600 mt-0.5" />
            )}
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-all active:scale-95 ${
              mobileMenuOpen
                ? "text-burgundy-700 font-bold"
                : "text-burgundy-800/60 hover:text-burgundy-900"
            }`}
          >
            <span className="text-lg">☰</span>
            <span className="text-[10px] mt-0.5">Menu</span>
            {mobileMenuOpen && (
              <span className="h-1 w-1 rounded-full bg-burgundy-600 mt-0.5" />
            )}
          </button>
        </div>
      </div>

      {/* Settings Modal */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-burgundy-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-burgundy-100 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-burgundy-100">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-burgundy-100 text-burgundy-800 text-sm">
                  ⚙️
                </span>
                <h3 className="font-bold text-burgundy-950 text-base">Account & Settings</h3>
              </div>
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="h-8 w-8 rounded-full text-burgundy-400 hover:bg-burgundy-50 hover:text-burgundy-900 flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-burgundy-900 block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  disabled
                  value={user.name || "Merisco Merisco"}
                  className="w-full rounded-xl border border-burgundy-200 bg-burgundy-50/50 px-3.5 py-2 text-xs font-medium text-burgundy-950"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-burgundy-900 block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full rounded-xl border border-burgundy-200 bg-burgundy-50/50 px-3.5 py-2 text-xs font-medium text-burgundy-950"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-burgundy-900 block mb-1">
                  Registered Target Exam
                </label>
                <div className="rounded-xl border border-burgundy-200 bg-white px-3.5 py-2 text-xs font-medium text-burgundy-900 flex items-center justify-between">
                  <span>{user.exam || "WACP / WACS Primaries"}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-burgundy-700 bg-burgundy-100 px-2 py-0.5 rounded-full">
                    {user.plan}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-burgundy-100 bg-cream-50/70 p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-burgundy-950">
                  <span>Battle Sound Effects</span>
                  <span className="text-emerald-700 font-bold">Enabled ✓</span>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold text-burgundy-950">
                  <span>Study Reminders</span>
                  <span className="text-emerald-700 font-bold">Active ✓</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="rounded-full bg-burgundy-600 px-5 py-2 text-xs font-bold text-white hover:bg-burgundy-700 shadow-sm"
              >
                Close Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help & Support Modal */}
      {helpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-burgundy-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-burgundy-100 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-burgundy-100">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-burgundy-100 text-burgundy-800 text-sm">
                  ❓
                </span>
                <h3 className="font-bold text-burgundy-950 text-base">Medscope Help & Support</h3>
              </div>
              <button
                type="button"
                onClick={() => setHelpOpen(false)}
                className="h-8 w-8 rounded-full text-burgundy-400 hover:bg-burgundy-50 hover:text-burgundy-900 flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs text-burgundy-900">
              <p className="leading-relaxed">
                Need help with your postgraduate revision, battle rooms, or subscription activation? Our academic and technical medical team is available 24/7.
              </p>

              <div className="space-y-2 pt-1">
                <a
                  href="mailto:support@medscope.ng"
                  className="flex items-center justify-between rounded-xl border border-burgundy-200 bg-cream-50 p-3 hover:bg-burgundy-50 transition"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">✉️</span>
                    <div>
                      <p className="font-bold text-burgundy-950">Email Support</p>
                      <p className="text-[11px] text-burgundy-700">support@medscope.ng</p>
                    </div>
                  </div>
                  <span className="text-burgundy-600 font-bold">Send →</span>
                </a>

                <div className="rounded-xl border border-burgundy-200 bg-cream-50 p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-base">⚡</span>
                    <div>
                      <p className="font-bold text-burgundy-950">Battle Room Protocols</p>
                      <p className="text-[11px] text-burgundy-700">
                        Battles run live in real-time. Correct answers score +2, incorrect -0.5.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setHelpOpen(false)}
                className="rounded-full bg-burgundy-600 px-5 py-2 text-xs font-bold text-white hover:bg-burgundy-700 shadow-sm"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
