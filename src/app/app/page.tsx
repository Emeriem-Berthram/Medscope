"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useAuth } from "@/lib/auth";
import { accuracy, getAttempts, getMocks, weakAreas } from "@/lib/store";
import { DEPARTMENTS, EXAMS } from "@/lib/questions";

export default function Dashboard() {
  const { user, setProfile } = useAuth();
  const [onboarding, setOnboarding] = useState(!user?.exam || !user?.faculty);

  if (!user) return null;

  const acc = accuracy(user.id);
  const attempts = getAttempts(user.id);
  const mocks = getMocks(user.id);
  const weak = weakAreas(user.id).slice(0, 5);

  const finishOnboarding = (e: FormEvent) => {
    e.preventDefault();
    if (user.exam && user.faculty) setOnboarding(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-teal-950">
        {user.name ? `${user.name.split(" ")[0]}'s dashboard` : "Dashboard"}
      </h1>
      <p className="mt-1 text-sm text-teal-800/70">
        {user.exam && user.faculty
          ? `${user.exam} · ${user.faculty} · ${user.plan} plan`
          : "Tell us your exam so the bank filters to your paper."}
      </p>

      {onboarding ? (
        <section className="mt-8 rounded-2xl border border-teal-100 bg-white p-8">
          <h2 className="text-xl font-bold text-teal-950">
            Which exam are you sitting?
          </h2>
          <form onSubmit={finishOnboarding} className="mt-6 space-y-6">
            <fieldset>
              <legend className="mb-2 text-sm font-medium text-teal-900">Exam</legend>
              <div className="flex flex-wrap gap-2">
                {EXAMS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setProfile({ exam: c })}
                    className={`rounded-full px-4 py-2 text-sm font-semibold ${
                      user.exam === c
                        ? "bg-teal-500 text-white"
                        : "border border-teal-200 text-teal-700 hover:bg-teal-50"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="mb-2 text-sm font-medium text-teal-900">Department</legend>
              <div className="flex flex-wrap gap-2">
                {DEPARTMENTS.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setProfile({ faculty: f })}
                    className={`rounded-full px-4 py-2 text-sm font-semibold ${
                      user.faculty === f
                        ? "bg-teal-500 text-white"
                        : "border border-teal-200 text-teal-700 hover:bg-teal-50"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </fieldset>
            <button
              type="submit"
              disabled={!user.exam || !user.faculty}
              className="rounded-full bg-teal-500 px-6 py-3 font-semibold text-white hover:bg-teal-600 disabled:opacity-50"
            >
              Start practising
            </button>
          </form>
        </section>
      ) : (
        <>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-2xl bg-teal-500 p-5 text-white">
              <p className="text-3xl font-bold">{acc}%</p>
              <p className="mt-1 text-xs">Accuracy</p>
            </div>
            <div className="rounded-2xl border border-teal-100 bg-white p-5">
              <p className="text-3xl font-bold text-teal-600">{attempts.length}</p>
              <p className="mt-1 text-xs">Questions attempted</p>
            </div>
            <div className="rounded-2xl border border-teal-100 bg-white p-5">
              <p className="text-3xl font-bold text-teal-600">{mocks.length}</p>
              <p className="mt-1 text-xs">Mocks sat</p>
            </div>
            <div className="rounded-2xl border border-teal-100 bg-white p-5">
              <p className="text-3xl font-bold text-teal-600">
                {user.plan === "free" ? Math.max(20 - attempts.length, 0) : "∞"}
              </p>
              <p className="mt-1 text-xs">Free questions left</p>
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <section className="rounded-2xl border border-teal-100 bg-white p-6">
              <h2 className="font-bold text-teal-950">Your weakest areas</h2>
              {weak.length === 0 ? (
                <p className="mt-3 text-sm text-teal-800/70">
                  Practise a few questions and your weakest topics will appear here,
                  ranked for revision.
                </p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {weak.map((w) => (
                    <li key={`${w.faculty}-${w.topic}`}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-teal-950">
                          {w.topic} <span className="text-teal-800/50">· {w.faculty}</span>
                        </span>
                        <span className="font-semibold text-teal-600">{w.pct}%</span>
                      </div>
                      <div className="mt-1 h-2 overflow-hidden rounded-full bg-teal-50">
                        <div
                          className={`h-full rounded-full ${w.pct < 60 ? "bg-red-400" : "bg-teal-500"}`}
                          style={{ width: `${w.pct}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <Link
                href="/app/performance"
                className="mt-5 inline-block rounded-full bg-teal-500 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-600"
              >
                View full performance
              </Link>
            </section>

            <section className="rounded-2xl border border-teal-100 bg-white p-6">
              <h2 className="font-bold text-teal-950">Keep going</h2>
              <ul className="mt-4 space-y-3">
                <li className="flex items-center justify-between rounded-xl border border-teal-50 p-3">
                  <div>
                    <p className="font-medium text-teal-950">Question bank</p>
                    <p className="text-xs text-teal-800/60">Search and drill by topic</p>
                  </div>
                  <Link href="/app/questions" className="text-sm font-semibold text-teal-600 hover:underline">
                    Open
                  </Link>
                </li>
                <li className="flex items-center justify-between rounded-xl border border-teal-50 p-3">
                  <div>
                    <p className="font-medium text-teal-950">Timed mock exam</p>
                    <p className="text-xs text-teal-800/60">Real exam conditions</p>
                  </div>
                  <Link href="/app/mock" className="text-sm font-semibold text-teal-600 hover:underline">
                    Start mock
                  </Link>
                </li>
                <li className="flex items-center justify-between rounded-xl border border-teal-50 p-3">
                  <div>
                    <p className="font-medium text-teal-950">Free Resources</p>
                    <p className="text-xs text-teal-800/60">Checklists and case presentations</p>
                  </div>
                  <Link href="/app/resources" className="text-sm font-semibold text-teal-600 hover:underline">
                    Browse
                  </Link>
                </li>
                <li className="flex items-center justify-between rounded-xl border border-teal-50 p-3">
                  <div>
                    <p className="font-medium text-teal-950">Leaderboard</p>
                    <p className="text-xs text-teal-800/60">See where you rank</p>
                  </div>
                  <Link href="/app/leaderboard" className="text-sm font-semibold text-teal-600 hover:underline">
                    View
                  </Link>
                </li>
              </ul>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
