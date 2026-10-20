"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import SubscribeModal from "@/components/subscribe-modal";

export default function Dashboard() {
  const { user } = useAuth();
  const [greeting, setGreeting] = useState("Good morning");
  const [readingPlanModalOpen, setReadingPlanModalOpen] = useState(false);
  const [flashcardModalOpen, setFlashcardModalOpen] = useState(false);
  const [subscribeModalOpen, setSubscribeModalOpen] = useState(false);
  const [planSubject, setPlanSubject] = useState("Anatomy");
  const [planHours, setPlanHours] = useState("2");
  const [planSuccess, setPlanSuccess] = useState(false);

  // Interactive toggle states for Reminders
  const [dailyStudyReminder, setDailyStudyReminder] = useState(true);
  const [readingPlanReminder, setReadingPlanReminder] = useState(true);
  const [pastQuestionsReminder, setPastQuestionsReminder] = useState(true);

  // Schedule task checks
  const [tasksChecked, setTasksChecked] = useState<{ [key: string]: boolean }>({
    anatomy: false,
    physiology: false,
    biochemistry: true,
  });

  // Calculate greeting dynamically based on local time
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting("Good morning");
    } else if (hour < 18) {
      setGreeting("Good afternoon");
    } else {
      setGreeting("Good evening");
    }
  }, []);

  // Placeholder name: will change to the person's name when he signs up
  const displayName = user?.name?.trim() ? user.name.trim() : "Merisco";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "MM";

  const toggleTask = (key: string) => {
    setTasksChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP GREETINGS & CANDIDATE PROFILE BAR */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-3xl bg-white p-4 sm:p-6 shadow-sm border border-burgundy-100">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-burgundy-950 font-serif">
            {greeting}, {displayName}! 👋
          </h1>
          <p className="mt-1 text-xs sm:text-sm font-medium text-burgundy-800/75">
            Ready to make progress today?
          </p>
        </div>

        {/* Right Header: Notification Bell + Avatar Profile */}
        <div className="flex items-center gap-3 sm:gap-4 self-end sm:self-auto">
          {/* Notification Bell */}
          <button
            type="button"
            aria-label="Notifications"
            className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-burgundy-200/80 bg-burgundy-50/50 text-burgundy-800 hover:bg-burgundy-100/70 transition-all shadow-xs"
          >
            <span className="text-lg">🔔</span>
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
          </button>

          {/* User Profile Pill */}
          <div className="flex items-center gap-3 pl-1">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-burgundy-800 via-burgundy-700 to-rose-700 text-sm font-bold text-cream-50 shadow-md ring-2 ring-burgundy-500/20">
              {initials}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-burgundy-950 leading-tight">
                {displayName}
              </p>
              <p className="text-[11px] font-medium text-burgundy-700/80 leading-snug">
                {user?.faculty || "Medical Student"}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* 2. MAIN 2-COLUMN DASHBOARD GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ========================================================= */}
        {/* LEFT COLUMN: MAIN STUDY FLOW (8 cols)                     */}
        {/* ========================================================= */}
        <div className="lg:col-span-8 space-y-6 min-w-0">
          {/* HERO BANNER: Deep Burgundy Gradient blending with Battle Arena */}
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-burgundy-950 via-burgundy-900 to-rose-950 p-6 sm:p-8 text-cream-50 shadow-xl border border-burgundy-800/60">
            <div className="relative z-10 max-w-lg">
              <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-amber-300 backdrop-blur-md border border-amber-300/30">
                MEDSCOPE
              </span>
              <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-serif leading-tight">
                Your goals. Our support.
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-burgundy-100/90 leading-relaxed font-light">
                Study smarter, stay consistent, achieve your dreams.
              </p>
            </div>

            {/* Glowing Medical Stethoscope & ECG wave vector decoration */}
            <div className="pointer-events-none absolute -bottom-6 -right-6 h-48 w-48 sm:h-56 sm:w-56 opacity-25">
              <svg viewBox="0 0 200 200" fill="none" className="h-full w-full">
                <circle cx="100" cy="100" r="80" stroke="#f43f5e" strokeWidth="2" strokeDasharray="6 6" />
                <path
                  d="M20 100 Q 40 100 50 85 L 60 120 L 70 70 L 80 130 L 90 100 L 180 100"
                  stroke="#fbbf24"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </section>

          {/* TOP 4 STAT CARDS */}
          <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {/* Card 1: Reading Streak */}
            <div className="rounded-2xl border border-burgundy-100 bg-white p-4 shadow-sm transition hover:shadow-md">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-100 text-amber-700 text-sm">
                  🔥
                </span>
                <span className="text-xs font-semibold text-burgundy-900/80">
                  Reading Streak
                </span>
              </div>
              <p className="mt-2 text-xl sm:text-2xl font-extrabold text-burgundy-950 font-serif">
                5 days
              </p>
              <p className="mt-0.5 text-[11px] font-medium text-amber-700">
                Keep it going!
              </p>
            </div>

            {/* Card 2: Daily Study Goal */}
            <div className="rounded-2xl border border-burgundy-100 bg-white p-4 shadow-sm transition hover:shadow-md">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-purple-100 text-purple-700 text-sm">
                  ⏱️
                </span>
                <span className="text-xs font-semibold text-burgundy-900/80">
                  Daily Study Goal
                </span>
              </div>
              <p className="mt-2 text-xl sm:text-2xl font-extrabold text-burgundy-950 font-serif">
                2 hours
              </p>
              <div className="mt-2 h-1.5 w-full rounded-full bg-burgundy-100">
                <div className="h-1.5 rounded-full bg-gradient-to-r from-purple-600 to-burgundy-600 w-3/4" />
              </div>
            </div>

            {/* Card 3: Topics Completed */}
            <div className="rounded-2xl border border-burgundy-100 bg-white p-4 shadow-sm transition hover:shadow-md">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 text-sm">
                  ✅
                </span>
                <span className="text-xs font-semibold text-burgundy-900/80">
                  Topics Completed
                </span>
              </div>
              <p className="mt-2 text-xl sm:text-2xl font-extrabold text-burgundy-950 font-serif">
                12 of 30
              </p>
              <div className="mt-2 h-1.5 w-full rounded-full bg-emerald-100">
                <div className="h-1.5 rounded-full bg-emerald-600 w-2/5" />
              </div>
            </div>

            {/* Card 4: Overall Progress */}
            <div className="rounded-2xl border border-burgundy-100 bg-white p-4 shadow-sm transition hover:shadow-md flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-burgundy-900/80 block">
                  Overall Progress
                </span>
                <p className="mt-1 text-2xl font-extrabold text-burgundy-950 font-serif">
                  40%
                </p>
              </div>
              {/* Circular Progress Indicator */}
              <div className="relative h-11 w-11 shrink-0">
                <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                  <path
                    className="text-burgundy-100"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-burgundy-600"
                    strokeDasharray="40, 100"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-burgundy-950">
                  40%
                </span>
              </div>
            </div>
          </section>

          {/* BUILD YOUR READING PLAN BANNER */}
          <section className="relative overflow-hidden rounded-3xl border border-burgundy-200/90 bg-gradient-to-r from-purple-50/60 via-burgundy-50/50 to-cream-50 p-5 sm:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-burgundy-600 text-cream-50 text-xl shadow-md">
                  📅
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-burgundy-950 font-serif">
                    Build Your Reading Plan
                  </h3>
                  <p className="mt-0.5 text-xs text-burgundy-800/80 leading-relaxed max-w-md">
                    Create a personalised reading schedule that fits your goals.
                  </p>
                  <button
                    type="button"
                    onClick={() => setReadingPlanModalOpen(true)}
                    className="mt-3 inline-flex items-center gap-2 rounded-full bg-burgundy-600 px-4 py-2 text-xs font-bold text-cream-50 shadow-sm transition hover:bg-burgundy-700 active:scale-95"
                  >
                    <span>+</span>
                    <span>Create Reading Plan →</span>
                  </button>
                </div>
              </div>

              {/* Decorative Calendar Graphic */}
              <div className="hidden md:flex h-20 w-32 shrink-0 items-center justify-center rounded-2xl border border-burgundy-200/70 bg-white/90 p-2 shadow-xs">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-burgundy-700">
                    <span>Plan</span>
                    <span>•</span>
                    <span>Study</span>
                    <span>•</span>
                    <span>Achieve</span>
                  </div>
                  <div className="mt-1 flex items-center justify-center">
                    <span className="rounded-lg bg-burgundy-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                      ✓ Ready
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* TODAY'S READING SCHEDULE TABLE */}
          <section className="rounded-3xl border border-burgundy-100 bg-white p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-burgundy-100">
              <div className="flex items-center gap-2">
                <span className="text-lg">📅</span>
                <h3 className="text-base sm:text-lg font-bold text-burgundy-950 font-serif">
                  Today&apos;s Reading Schedule
                </h3>
              </div>
              <span className="text-xs font-semibold text-burgundy-700 bg-burgundy-50 px-3 py-1 rounded-full border border-burgundy-200/70">
                Fri, 24 Oct 2025
              </span>
            </div>

            <div className="mt-4 overflow-x-auto no-scrollbar">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-burgundy-100 text-[11px] font-bold uppercase tracking-wider text-burgundy-500">
                    <th className="pb-3 pl-1 font-semibold">Subject</th>
                    <th className="pb-3 font-semibold">Task</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 text-right pr-2 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-burgundy-100/70">
                  {/* Row 1: Anatomy */}
                  <tr className="group transition hover:bg-burgundy-50/40">
                    <td className="py-3.5 pl-1">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-700 text-sm">
                          🫀
                        </div>
                        <div>
                          <p className="font-bold text-burgundy-950">Anatomy</p>
                          <p className="text-[11px] text-burgundy-700/70">Surgery</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 font-medium text-burgundy-900">
                      Upper limb
                    </td>
                    <td className="py-3.5">
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-800 border border-amber-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                        In progress
                      </span>
                    </td>
                    <td className="py-3.5 text-right pr-2">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href="/app/questions"
                          className="rounded-full bg-burgundy-600 px-3.5 py-1 text-xs font-bold text-white shadow-xs hover:bg-burgundy-700 active:scale-95 transition"
                        >
                          Continue
                        </Link>
                        <input
                          type="checkbox"
                          checked={tasksChecked.anatomy}
                          onChange={() => toggleTask("anatomy")}
                          className="h-4 w-4 rounded border-burgundy-300 text-burgundy-600 focus:ring-burgundy-500 cursor-pointer"
                        />
                      </div>
                    </td>
                  </tr>

                  {/* Row 2: Physiology */}
                  <tr className="group transition hover:bg-burgundy-50/40">
                    <td className="py-3.5 pl-1">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-burgundy-100 text-burgundy-800 text-sm">
                          🩺
                        </div>
                        <div>
                          <p className="font-bold text-burgundy-950">Physiology</p>
                          <p className="text-[11px] text-burgundy-700/70">Medicine</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 font-medium text-burgundy-900">
                      Cardiovascular system
                    </td>
                    <td className="py-3.5">
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700 border border-slate-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                        Not started
                      </span>
                    </td>
                    <td className="py-3.5 text-right pr-2">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href="/app/questions"
                          className="rounded-full bg-burgundy-600 px-3.5 py-1 text-xs font-bold text-white shadow-xs hover:bg-burgundy-700 active:scale-95 transition"
                        >
                          Start
                        </Link>
                        <input
                          type="checkbox"
                          checked={tasksChecked.physiology}
                          onChange={() => toggleTask("physiology")}
                          className="h-4 w-4 rounded border-burgundy-300 text-burgundy-600 focus:ring-burgundy-500 cursor-pointer"
                        />
                      </div>
                    </td>
                  </tr>

                  {/* Row 3: Biochemistry */}
                  <tr className="group transition hover:bg-burgundy-50/40">
                    <td className="py-3.5 pl-1">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 text-sm">
                          🔬
                        </div>
                        <div>
                          <p className="font-bold text-burgundy-950">Biochemistry</p>
                          <p className="text-[11px] text-burgundy-700/70">Basic Sciences</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 font-medium text-burgundy-900">
                      Enzymes
                    </td>
                    <td className="py-3.5">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-800 border border-emerald-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Completed
                      </span>
                    </td>
                    <td className="py-3.5 text-right pr-2">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href="/app/questions"
                          className="rounded-full border border-burgundy-200 bg-white px-3.5 py-1 text-xs font-bold text-burgundy-800 shadow-xs hover:bg-burgundy-50 transition"
                        >
                          Review
                        </Link>
                        <input
                          type="checkbox"
                          checked={tasksChecked.biochemistry}
                          onChange={() => toggleTask("biochemistry")}
                          className="h-4 w-4 rounded border-emerald-400 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-4 pt-3 border-t border-burgundy-100/70 text-center">
              <Link
                href="/app/practice"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-burgundy-700 hover:text-burgundy-900 transition"
              >
                <span>View today&apos;s full schedule</span>
                <span>→</span>
              </Link>
            </div>
          </section>

          {/* CONTINUE READING SECTION */}
          <section className="rounded-3xl border border-burgundy-100 bg-white p-5 sm:p-6 shadow-sm space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg">📖</span>
                <h3 className="text-base sm:text-lg font-bold text-burgundy-950 font-serif">
                  Continue Reading
                </h3>
              </div>
              <p className="text-xs text-burgundy-700/80">Pick up where you left off</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* Card 1: Pathology */}
              <div className="rounded-2xl border border-burgundy-100 bg-cream-50/60 p-4 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-purple-100 text-purple-700 text-sm">
                      🧬
                    </span>
                    <div>
                      <p className="font-bold text-burgundy-950 text-xs">Pathology</p>
                      <p className="text-[10px] text-burgundy-700/70">Cell injury & adaptation</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[11px] font-semibold text-burgundy-900">
                    <span>Progress</span>
                    <span>65%</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full rounded-full bg-burgundy-100">
                    <div className="h-1.5 rounded-full bg-burgundy-600 w-[65%]" />
                  </div>
                  <p className="mt-2 text-[10px] text-burgundy-600 font-medium">
                    Last read: 2 days ago
                  </p>
                </div>
                <Link
                  href="/app/questions"
                  className="mt-3 block w-full rounded-xl bg-burgundy-600 py-1.5 text-center text-xs font-bold text-white hover:bg-burgundy-700 transition"
                >
                  Continue Reading
                </Link>
              </div>

              {/* Card 2: Pharmacology */}
              <div className="rounded-2xl border border-burgundy-100 bg-cream-50/60 p-4 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 text-sm">
                      💊
                    </span>
                    <div>
                      <p className="font-bold text-burgundy-950 text-xs">Pharmacology</p>
                      <p className="text-[10px] text-burgundy-700/70">Antibiotics</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[11px] font-semibold text-burgundy-900">
                    <span>Progress</span>
                    <span>30%</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full rounded-full bg-emerald-100">
                    <div className="h-1.5 rounded-full bg-emerald-600 w-[30%]" />
                  </div>
                  <p className="mt-2 text-[10px] text-burgundy-600 font-medium">
                    Last read: 4 days ago
                  </p>
                </div>
                <Link
                  href="/app/questions"
                  className="mt-3 block w-full rounded-xl bg-burgundy-600 py-1.5 text-center text-xs font-bold text-white hover:bg-burgundy-700 transition"
                >
                  Continue Reading
                </Link>
              </div>

              {/* Card 3: Microbiology */}
              <div className="rounded-2xl border border-burgundy-100 bg-cream-50/60 p-4 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-100 text-amber-700 text-sm">
                      🔬
                    </span>
                    <div>
                      <p className="font-bold text-burgundy-950 text-xs">Microbiology</p>
                      <p className="text-[10px] text-burgundy-700/70">Bacterial Infections</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[11px] font-semibold text-burgundy-900">
                    <span>Progress</span>
                    <span>20%</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full rounded-full bg-amber-100">
                    <div className="h-1.5 rounded-full bg-amber-600 w-[20%]" />
                  </div>
                  <p className="mt-2 text-[10px] text-burgundy-600 font-medium">
                    Last read: 5 days ago
                  </p>
                </div>
                <Link
                  href="/app/questions"
                  className="mt-3 block w-full rounded-xl bg-burgundy-600 py-1.5 text-center text-xs font-bold text-white hover:bg-burgundy-700 transition"
                >
                  Continue Reading
                </Link>
              </div>
            </div>
          </section>

          {/* REVISION & PAST QUESTIONS */}
          <section className="rounded-3xl border border-burgundy-100 bg-white p-5 sm:p-6 shadow-sm space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg">⚙️</span>
                <h3 className="text-base sm:text-lg font-bold text-burgundy-950 font-serif">
                  Revision & Past Questions
                </h3>
              </div>
              <p className="text-xs text-burgundy-700/80">
                Practice, review and strengthen your knowledge.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Card 1: Past Questions */}
              <Link
                href="/app/questions"
                className="group rounded-2xl border border-burgundy-100 bg-cream-50/40 p-4 shadow-xs transition hover:bg-burgundy-50 hover:border-burgundy-300 hover:shadow-md"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-burgundy-100 text-burgundy-800 text-lg group-hover:scale-110 transition">
                  📑
                </span>
                <p className="mt-3 text-xs font-bold text-burgundy-950">Past Questions</p>
                <p className="mt-0.5 text-[11px] text-burgundy-700/70">Test your knowledge</p>
              </Link>

              {/* Card 2: Flashcards */}
              <button
                type="button"
                onClick={() => setFlashcardModalOpen(true)}
                className="group rounded-2xl border border-burgundy-100 bg-cream-50/40 p-4 shadow-xs text-left transition hover:bg-burgundy-50 hover:border-burgundy-300 hover:shadow-md"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-purple-800 text-lg group-hover:scale-110 transition">
                  🗂️
                </span>
                <p className="mt-3 text-xs font-bold text-burgundy-950">Flashcards</p>
                <p className="mt-0.5 text-[11px] text-burgundy-700/70">Quick revision</p>
              </button>

              {/* Card 3: Review Mistakes */}
              <Link
                href="/app/practice"
                className="group rounded-2xl border border-burgundy-100 bg-cream-50/40 p-4 shadow-xs transition hover:bg-burgundy-50 hover:border-burgundy-300 hover:shadow-md"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-800 text-lg group-hover:scale-110 transition">
                  🎯
                </span>
                <p className="mt-3 text-xs font-bold text-burgundy-950">Review Mistakes</p>
                <p className="mt-0.5 text-[11px] text-burgundy-700/70">Learn from errors</p>
              </Link>

              {/* Card 4: Saved Notes */}
              <Link
                href="/app/bookmarks"
                className="group rounded-2xl border border-burgundy-100 bg-cream-50/40 p-4 shadow-xs transition hover:bg-burgundy-50 hover:border-burgundy-300 hover:shadow-md"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 text-lg group-hover:scale-110 transition">
                  📝
                </span>
                <p className="mt-3 text-xs font-bold text-burgundy-950">Saved Notes</p>
                <p className="mt-0.5 text-[11px] text-burgundy-700/70">Your key notes</p>
              </Link>
            </div>
          </section>

          {/* READING PROGRESS & ANALYTICS */}
          <section className="rounded-3xl border border-burgundy-100 bg-white p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">📊</span>
                <h3 className="text-base sm:text-lg font-bold text-burgundy-950 font-serif">
                  Reading Progress & Analytics
                </h3>
              </div>
              <Link
                href="/app/performance"
                className="text-xs font-bold text-burgundy-700 hover:underline"
              >
                View detailed analytics →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
              {/* Metric 1 */}
              <div>
                <p className="text-[11px] font-semibold text-burgundy-700">Weekly Study Hours</p>
                <p className="mt-1 text-lg font-extrabold text-burgundy-950">
                  12.5 <span className="text-xs text-burgundy-600 font-normal">/ 14 hrs</span>
                </p>
                <div className="mt-2 h-1.5 w-full rounded-full bg-burgundy-100">
                  <div className="h-1.5 rounded-full bg-burgundy-600 w-[88%]" />
                </div>
              </div>

              {/* Metric 2 */}
              <div>
                <p className="text-[11px] font-semibold text-burgundy-700">Topics Completed</p>
                <p className="mt-1 text-lg font-extrabold text-burgundy-950">
                  12 <span className="text-xs text-burgundy-600 font-normal">/ 30</span>
                </p>
                <div className="mt-2 h-1.5 w-full rounded-full bg-emerald-100">
                  <div className="h-1.5 rounded-full bg-emerald-600 w-[40%]" />
                </div>
              </div>

              {/* Metric 3: Daily Activity 7-day Bar Chart */}
              <div>
                <p className="text-[11px] font-semibold text-burgundy-700 mb-2">Daily Activity</p>
                <div className="flex items-end justify-between h-12 gap-1 pt-2">
                  {[
                    { day: "Mon", h: "45%" },
                    { day: "Tue", h: "70%" },
                    { day: "Wed", h: "90%" },
                    { day: "Thu", h: "60%" },
                    { day: "Fri", h: "80%" },
                    { day: "Sat", h: "30%" },
                    { day: "Sun", h: "65%" },
                  ].map((d) => (
                    <div key={d.day} className="flex flex-col items-center flex-1">
                      <div
                        style={{ height: d.h }}
                        className="w-full max-w-[12px] rounded-t-sm bg-gradient-to-t from-burgundy-700 to-rose-500"
                      />
                      <span className="text-[9px] text-burgundy-800/70 mt-1 font-medium">
                        {d.day}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Metric 4: Strong & Weak Subjects */}
              <div>
                <p className="text-[11px] font-semibold text-burgundy-700 mb-1.5">
                  Strong & Weak Subjects
                </p>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-burgundy-900">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      Anatomy
                    </span>
                    <span className="font-bold text-burgundy-950">85%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-burgundy-900">
                      <span className="h-2 w-2 rounded-full bg-purple-500" />
                      Physiology
                    </span>
                    <span className="font-bold text-burgundy-950">70%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-burgundy-900">
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                      Pathology
                    </span>
                    <span className="font-bold text-burgundy-950">45%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-burgundy-900">
                      <span className="h-2 w-2 rounded-full bg-rose-500" />
                      Pharmacology
                    </span>
                    <span className="font-bold text-burgundy-950">40%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-burgundy-900">
                      <span className="h-2 w-2 rounded-full bg-sky-500" />
                      Microbiology
                    </span>
                    <span className="font-bold text-burgundy-950">60%</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: SIDEBAR WIDGETS (4 cols)                    */}
        {/* ========================================================= */}
        <div className="lg:col-span-4 space-y-6 min-w-0">
          {/* WIDGET 1: Build Your Reading Plan Action Card */}
          <section className="rounded-3xl border border-burgundy-100 bg-white p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-burgundy-600 text-cream-50 text-base shadow-xs">
                📅
              </span>
              <h3 className="font-bold text-burgundy-950 text-sm sm:text-base font-serif">
                Build Your Reading Plan
              </h3>
            </div>
            <p className="text-xs text-burgundy-800/80 leading-relaxed">
              Set your dates, subjects, topics and daily study time.
            </p>
            <button
              type="button"
              onClick={() => setReadingPlanModalOpen(true)}
              className="w-full rounded-full bg-burgundy-600 py-2.5 text-center text-xs font-bold text-cream-50 shadow-sm transition hover:bg-burgundy-700 active:scale-95"
            >
              Create Reading Plan →
            </button>
          </section>

          {/* WIDGET 2: Upcoming Tasks Calendar & Today's Sessions */}
          <section className="rounded-3xl border border-burgundy-100 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">📅</span>
                <h3 className="font-bold text-burgundy-950 text-sm font-serif">
                  Upcoming Tasks
                </h3>
              </div>
              <Link href="/app/practice" className="text-[11px] font-bold text-burgundy-700 hover:underline">
                View all →
              </Link>
            </div>

            {/* Mini Calendar Month Grid (October 2025) */}
            <div className="rounded-2xl border border-burgundy-100 bg-cream-50/50 p-3 text-center">
              <div className="flex items-center justify-between pb-2 text-xs font-bold text-burgundy-950">
                <button type="button" className="text-burgundy-600 hover:text-burgundy-900 px-1 font-bold">
                  ‹
                </button>
                <span>October 2025</span>
                <button type="button" className="text-burgundy-600 hover:text-burgundy-900 px-1 font-bold">
                  ›
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 text-[10px] font-semibold text-burgundy-600 pb-1">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>

              <div className="grid grid-cols-7 gap-1 text-[11px] font-medium text-burgundy-900">
                <span className="text-burgundy-300">29</span>
                <span className="text-burgundy-300">30</span>
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>

                <span>6</span>
                <span>7</span>
                <span>8</span>
                <span>9</span>
                <span>10</span>
                <span>11</span>
                <span>12</span>

                <span>13</span>
                <span>14</span>
                <span>15</span>
                <span>16</span>
                <span>17</span>
                <span>18</span>
                <span>19</span>

                <span>20</span>
                <span>21</span>
                <span>22</span>
                <span>23</span>
                <span className="flex h-6 w-6 mx-auto items-center justify-center rounded-full bg-burgundy-600 font-bold text-white shadow-xs">
                  24
                </span>
                <span>25</span>
                <span>26</span>

                <span>27</span>
                <span>28</span>
                <span>29</span>
                <span>30</span>
                <span>31</span>
                <span className="text-burgundy-300">1</span>
                <span className="text-burgundy-300">2</span>
              </div>
            </div>

            {/* Today's Sessions */}
            <div className="space-y-2 pt-1">
              <h4 className="text-xs font-bold text-burgundy-950 font-serif">
                Today&apos;s Sessions
              </h4>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-2 rounded-xl bg-burgundy-50/50 p-2 border border-burgundy-100">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                  <div>
                    <p className="font-bold text-burgundy-950 text-[11px]">09:00 – 11:00</p>
                    <p className="text-[11px] text-burgundy-700">Anatomy – Upper limb</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-xl bg-burgundy-50/50 p-2 border border-burgundy-100">
                  <span className="h-2 w-2 rounded-full bg-purple-500 shrink-0" />
                  <div>
                    <p className="font-bold text-burgundy-950 text-[11px]">14:00 – 16:00</p>
                    <p className="text-[11px] text-burgundy-700">Physiology – Cardiovascular</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-xl bg-burgundy-50/50 p-2 border border-burgundy-100">
                  <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                  <div>
                    <p className="font-bold text-burgundy-950 text-[11px]">18:00 – 19:00</p>
                    <p className="text-[11px] text-burgundy-700">Biochemistry – Enzymes</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* WIDGET 3: Reminders */}
          <section className="rounded-3xl border border-burgundy-100 bg-white p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">🔔</span>
                <h3 className="font-bold text-burgundy-950 text-sm font-serif">
                  Reminders
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSubscribeModalOpen(true)}
                className="text-[11px] font-bold text-burgundy-700 hover:underline"
              >
                View all →
              </button>
            </div>

            <div className="space-y-2 pt-1">
              {/* Reminder 1 */}
              <div className="flex items-center justify-between rounded-xl bg-cream-50/60 p-2.5 border border-burgundy-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs">🔔</span>
                  <div>
                    <p className="font-bold text-burgundy-950 text-xs">Daily study reminder</p>
                    <p className="text-[10px] text-burgundy-700">8:00 AM</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDailyStudyReminder(!dailyStudyReminder)}
                  className={`h-5 w-9 rounded-full transition-colors relative ${
                    dailyStudyReminder ? "bg-burgundy-600" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`block h-4 w-4 rounded-full bg-white transition-transform ${
                      dailyStudyReminder ? "translate-x-4" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              {/* Reminder 2 */}
              <div className="flex items-center justify-between rounded-xl bg-cream-50/60 p-2.5 border border-burgundy-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs">🔔</span>
                  <div>
                    <p className="font-bold text-burgundy-950 text-xs">Reading plan reminder</p>
                    <p className="text-[10px] text-burgundy-700">7:00 PM</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setReadingPlanReminder(!readingPlanReminder)}
                  className={`h-5 w-9 rounded-full transition-colors relative ${
                    readingPlanReminder ? "bg-burgundy-600" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`block h-4 w-4 rounded-full bg-white transition-transform ${
                      readingPlanReminder ? "translate-x-4" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              {/* Reminder 3 */}
              <div className="flex items-center justify-between rounded-xl bg-cream-50/60 p-2.5 border border-burgundy-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs">🔔</span>
                  <div>
                    <p className="font-bold text-burgundy-950 text-xs">Past questions reminder</p>
                    <p className="text-[10px] text-burgundy-700">9:00 PM</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPastQuestionsReminder(!pastQuestionsReminder)}
                  className={`h-5 w-9 rounded-full transition-colors relative ${
                    pastQuestionsReminder ? "bg-burgundy-600" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`block h-4 w-4 rounded-full bg-white transition-transform ${
                      pastQuestionsReminder ? "translate-x-4" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>
          </section>

          {/* WIDGET 4: Bookmarks & Saved Materials */}
          <section className="rounded-3xl border border-burgundy-100 bg-white p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">🔖</span>
                <h3 className="font-bold text-burgundy-950 text-sm font-serif">
                  Bookmarks & Saved Materials
                </h3>
              </div>
              <Link href="/app/bookmarks" className="text-[11px] font-bold text-burgundy-700 hover:underline">
                View all →
              </Link>
            </div>

            <div className="space-y-2 text-xs">
              <Link
                href="/app/bookmarks"
                className="flex items-center justify-between rounded-xl bg-cream-50/60 p-2.5 border border-burgundy-100 hover:bg-burgundy-50 transition"
              >
                <div className="flex items-center gap-2">
                  <span>📄</span>
                  <span className="font-semibold text-burgundy-950">Renal system – Notes</span>
                </div>
                <span className="text-burgundy-600">→</span>
              </Link>

              <Link
                href="/app/bookmarks"
                className="flex items-center justify-between rounded-xl bg-cream-50/60 p-2.5 border border-burgundy-100 hover:bg-burgundy-50 transition"
              >
                <div className="flex items-center gap-2">
                  <span>📊</span>
                  <span className="font-semibold text-burgundy-950">Drug classifications – Chart</span>
                </div>
                <span className="text-burgundy-600">→</span>
              </Link>

              <Link
                href="/app/bookmarks"
                className="flex items-center justify-between rounded-xl bg-cream-50/60 p-2.5 border border-burgundy-100 hover:bg-burgundy-50 transition"
              >
                <div className="flex items-center gap-2">
                  <span>📑</span>
                  <span className="font-semibold text-burgundy-950">Lecture slides – Pathology</span>
                </div>
                <span className="text-burgundy-600">→</span>
              </Link>

              <Link
                href="/app/bookmarks"
                className="flex items-center justify-between rounded-xl bg-cream-50/60 p-2.5 border border-burgundy-100 hover:bg-burgundy-50 transition"
              >
                <div className="flex items-center gap-2">
                  <span>⭐</span>
                  <span className="font-semibold text-burgundy-950">Important formulas</span>
                </div>
                <span className="text-burgundy-600">→</span>
              </Link>

              <Link
                href="/app/bookmarks"
                className="flex items-center justify-between rounded-xl bg-cream-50/60 p-2.5 border border-burgundy-100 hover:bg-burgundy-50 transition"
              >
                <div className="flex items-center gap-2">
                  <span>🕒</span>
                  <span className="font-semibold text-burgundy-950">Recently viewed</span>
                </div>
                <span className="text-burgundy-600">→</span>
              </Link>
            </div>
          </section>

          {/* WIDGET 5: INSPIRATIONAL QUOTE CARD */}
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-burgundy-900 via-burgundy-800 to-rose-950 p-6 text-cream-50 shadow-md border border-burgundy-700/60">
            <div className="relative z-10 space-y-3">
              <span className="text-2xl text-rose-300">⚡</span>
              <p className="text-base sm:text-lg font-bold font-serif leading-snug text-white">
                &ldquo;Small steps every day lead to big results.&rdquo;
              </p>
              <div className="pt-2 flex items-center justify-between border-t border-white/10 text-xs font-semibold text-burgundy-200">
                <span>Medscope</span>
                <span className="text-amber-300">Dr. {displayName}</span>
              </div>
            </div>

            {/* Glowing stethoscope decorative background */}
            <div className="pointer-events-none absolute -bottom-4 -right-4 h-32 w-32 opacity-20">
              <svg viewBox="0 0 100 100" fill="none" className="h-full w-full">
                <circle cx="50" cy="50" r="40" stroke="#f43f5e" strokeWidth="2" />
                <path d="M20 50 Q 35 50 45 35 L 55 65 L 65 50 L 80 50" stroke="#ffffff" strokeWidth="2" />
              </svg>
            </div>
          </section>
        </div>
      </div>

      {/* CREATE READING PLAN MODAL */}
      {readingPlanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-burgundy-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-burgundy-100 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-burgundy-100">
              <div className="flex items-center gap-2">
                <span className="text-xl">📅</span>
                <h3 className="font-bold text-burgundy-950 text-base font-serif">
                  Personalised Reading Plan
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setReadingPlanModalOpen(false);
                  setPlanSuccess(false);
                }}
                className="h-8 w-8 rounded-full text-burgundy-400 hover:bg-burgundy-50 hover:text-burgundy-900 flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {planSuccess ? (
              <div className="py-6 text-center space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 text-2xl font-bold">
                  ✓
                </div>
                <h4 className="font-bold text-burgundy-950 text-base">Plan Activated!</h4>
                <p className="text-xs text-burgundy-800/80 leading-relaxed">
                  Your daily study goal of {planHours} hours for {planSubject} is now scheduled on your dashboard.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setReadingPlanModalOpen(false);
                    setPlanSuccess(false);
                  }}
                  className="rounded-full bg-burgundy-600 px-6 py-2 text-xs font-bold text-white hover:bg-burgundy-700 shadow-sm"
                >
                  Done
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setPlanSuccess(true);
                }}
                className="mt-4 space-y-4"
              >
                <div>
                  <label className="text-xs font-semibold text-burgundy-900 block mb-1">
                    Select Target Subject
                  </label>
                  <select
                    value={planSubject}
                    onChange={(e) => setPlanSubject(e.target.value)}
                    className="w-full rounded-xl border border-burgundy-200 bg-white px-3.5 py-2 text-xs font-medium text-burgundy-900 outline-none focus:border-burgundy-600"
                  >
                    <option value="Anatomy">Anatomy & Histology</option>
                    <option value="Physiology">Physiology</option>
                    <option value="Biochemistry">Biochemistry</option>
                    <option value="Pathology">Pathology</option>
                    <option value="Pharmacology">Pharmacology</option>
                    <option value="Internal Medicine">Internal Medicine</option>
                    <option value="Surgery">General Surgery</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-burgundy-900 block mb-1">
                    Daily Study Target (Hours)
                  </label>
                  <select
                    value={planHours}
                    onChange={(e) => setPlanHours(e.target.value)}
                    className="w-full rounded-xl border border-burgundy-200 bg-white px-3.5 py-2 text-xs font-medium text-burgundy-900 outline-none focus:border-burgundy-600"
                  >
                    <option value="1">1 hour / day</option>
                    <option value="2">2 hours / day (Recommended)</option>
                    <option value="3">3 hours / day (Intensive)</option>
                    <option value="4">4+ hours / day (Exam Sprint)</option>
                  </select>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setReadingPlanModalOpen(false)}
                    className="rounded-full border border-burgundy-200 bg-white px-4 py-2 text-xs font-semibold text-burgundy-700 hover:bg-burgundy-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-full bg-burgundy-600 px-5 py-2 text-xs font-bold text-white hover:bg-burgundy-700 shadow-sm"
                  >
                    Save & Schedule Plan
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* FLASHCARDS MODAL */}
      {flashcardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-burgundy-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-burgundy-100 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-burgundy-100">
              <div className="flex items-center gap-2">
                <span className="text-xl">🗂️</span>
                <h3 className="font-bold text-burgundy-950 text-base font-serif">
                  Quick High-Yield Flashcards
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setFlashcardModalOpen(false)}
                className="h-8 w-8 rounded-full text-burgundy-400 hover:bg-burgundy-50 hover:text-burgundy-900 flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="rounded-2xl border-2 border-burgundy-200 bg-gradient-to-br from-burgundy-50 to-cream-50 p-6 text-center shadow-inner">
                <span className="text-[10px] font-bold uppercase tracking-wider text-burgundy-600 bg-burgundy-100 px-2 py-0.5 rounded-full">
                  Cardiology Flashcard
                </span>
                <h4 className="mt-3 text-sm font-bold text-burgundy-950 leading-relaxed">
                  What is the hallmark ECG change seen within the first hour of hyperacute transmural myocardial infarction?
                </h4>
                <div className="mt-4 pt-3 border-t border-burgundy-200/70">
                  <p className="text-xs font-bold text-emerald-800">
                    Answer: Hyperacute peaked T-waves followed by ST-segment elevation.
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Link
                  href="/app/questions"
                  className="flex-1 rounded-full bg-burgundy-600 py-2.5 text-center text-xs font-bold text-white hover:bg-burgundy-700 shadow-sm"
                >
                  Practise More Flashcards →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBSCRIBE MODAL */}
      <SubscribeModal
        open={subscribeModalOpen}
        onClose={() => setSubscribeModalOpen(false)}
      />
    </div>
  );
}
