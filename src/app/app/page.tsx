"use client";

import Link from "next/link";
import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { accuracy, getAttempts, getMocks, weakAreas } from "@/lib/store";
import { DEPARTMENTS, EXAMS } from "@/lib/questions";
import { listBattleRooms, fetchPublicBattles, Room } from "@/lib/rooms";
import SubscribeModal from "@/components/subscribe-modal";
import AutomatedOnboarding from "@/components/automated-onboarding";
import { PLANS } from "@/lib/paystack";

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
      <h1 className="text-2xl font-bold text-burgundy-950">
        {user.name ? `${user.name.split(" ")[0]}'s dashboard` : "Dashboard"}
      </h1>
      <p className="mt-1 text-sm text-burgundy-800/70">
        {user.exam && user.faculty
          ? `${user.exam} · ${user.faculty} · ${user.plan} plan`
          : "Tell us your exam so the bank filters to your paper."}
      </p>

      {onboarding ? (
        <div className="mt-8">
          <AutomatedOnboarding onComplete={() => setOnboarding(false)} />
        </div>
      ) : (
        <>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-2xl bg-burgundy-500 p-5 text-white">
              <p className="text-3xl font-bold">{acc}%</p>
              <p className="mt-1 text-xs">Accuracy</p>
            </div>
            <div className="rounded-2xl border border-burgundy-100 bg-cream-50 p-5">
              <p className="text-3xl font-bold text-burgundy-600">{attempts.length}</p>
              <p className="mt-1 text-xs">Questions attempted</p>
            </div>
            <div className="rounded-2xl border border-burgundy-100 bg-cream-50 p-5">
              <p className="text-3xl font-bold text-burgundy-600">{mocks.length}</p>
              <p className="mt-1 text-xs">Mocks sat</p>
            </div>
            <div className="rounded-2xl border border-burgundy-100 bg-cream-50 p-5">
              <p className="text-3xl font-bold text-burgundy-600">
                {user.plan === "free" ? Math.max(10 - attempts.length, 0) : "∞"}
              </p>
              <p className="mt-1 text-xs">Free questions left</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border border-burgundy-100 bg-cream-50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-burgundy-800/70">
                Your plan
              </p>
              <p className="mt-1 text-2xl font-bold text-burgundy-950 capitalize">
                {user.plan === "free" ? "Free" : user.plan === "annual" ? "Annual" : "Monthly"}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                user.plan === "free"
                  ? "border border-burgundy-200 text-burgundy-700"
                  : "bg-burgundy-600 text-cream-50"
              }`}
            >
              {user.plan === "free" ? "10 questions/month" : "Full bank unlocked"}
            </span>
          </div>
          {user.plan === "free" ? (
            <SubscriptionButton />
          ) : (
            <p className="mt-4 text-sm text-burgundy-800/70">
              Thanks for subscribing — your full question bank is
              unlocked.
            </p>
          )}
        </section>

        <SubscriptionCard />
      </div>

      <section className="mt-6 rounded-2xl border border-burgundy-100 bg-cream-50 p-6">
        <h2 className="font-bold text-burgundy-950">
          Invite a colleague
        </h2>
        <p className="mt-2 text-sm text-burgundy-800/70">
          Share your personal invite link — when a doctor signs up
          with it, you both get 5 extra free questions.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <code className="rounded-lg border border-burgundy-200 bg-cream-50 px-3 py-2 text-sm font-bold tracking-wider text-burgundy-700">
            {user.inviteCode}
          </code>
          <button
            onClick={() => {
              navigator.clipboard
                ?.writeText(
                  `https://medscope-app.vercel.app/signup?ref=${user.inviteCode}`
                )
                .catch(() => {});
            }}
            className="rounded-full bg-burgundy-600 px-5 py-2 text-sm font-semibold text-cream-50 hover:bg-burgundy-700"
          >
            Copy invite link
          </button>
        </div>
        <p className="mt-3 break-all text-xs text-burgundy-800/60">
          https://medscope-app.vercel.app/signup?ref={user.inviteCode}
        </p>
      </section>

      {/* Challenge Section with Reference Picture */}
      <section className="mt-8 overflow-hidden rounded-3xl border border-burgundy-200/90 bg-gradient-to-br from-burgundy-950 via-burgundy-900 to-burgundy-950 p-6 text-cream-50 shadow-xl sm:p-8">
        <div className="grid items-center gap-6 md:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-burgundy-800/80 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-burgundy-200">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Live 1v1 Face-Off
            </span>
            <h2 className="mt-3 text-2xl font-bold text-white sm:text-3xl">
              Challenge Room
            </h2>
            <p className="mt-2 text-sm text-burgundy-200/80">
              Go head-to-head with another doctor in real time. Take turns answering the same past exam recalls — 2 points per correct answer, race the timer, and dominate the leaderboard.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/app/challenge"
                className="rounded-full bg-cream-50 px-6 py-2.5 text-sm font-bold text-burgundy-950 shadow-md transition-all hover:bg-cream-100 hover:shadow-lg"
              >
                Enter Challenge Room →
              </Link>
              <Link
                href="/app/battle"
                className="rounded-full border border-burgundy-400/40 px-5 py-2.5 text-sm font-semibold text-cream-50 transition-colors hover:bg-burgundy-800"
              >
                Battle Room (20 Doctors)
              </Link>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-burgundy-400/30 shadow-2xl transition-transform duration-300 hover:scale-[1.01]">
            <Image
              src="/challenge-room.jpg"
              alt="Challenge Room — Two doctors facing off"
              width={1024}
              height={655}
              unoptimized
              priority
              className="h-auto w-full object-cover"
            />
          </div>
        </div>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <section className="rounded-2xl border border-burgundy-100 bg-cream-50 p-6">
              <h2 className="font-bold text-burgundy-950">Your weakest areas</h2>
              {weak.length === 0 ? (
                <p className="mt-3 text-sm text-burgundy-800/70">
                  Practise a few questions and your weakest topics will appear here,
                  ranked for revision.
                </p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {weak.map((w) => (
                    <li key={`${w.faculty}-${w.topic}`}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-burgundy-950">
                          {w.topic} <span className="text-burgundy-800/50">· {w.faculty}</span>
                        </span>
                        <span className="font-semibold text-burgundy-600">{w.pct}%</span>
                      </div>
                      <div className="mt-1 h-2 overflow-hidden rounded-full bg-burgundy-50">
                        <div
                          className={`h-full rounded-full ${w.pct < 60 ? "bg-red-400" : "bg-burgundy-500"}`}
                          style={{ width: `${w.pct}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <Link
                href="/app/performance"
                className="mt-5 inline-block rounded-full bg-burgundy-500 px-5 py-2 text-sm font-semibold text-white hover:bg-burgundy-600"
              >
                View full performance
              </Link>
            </section>

            <section className="rounded-2xl border border-burgundy-100 bg-cream-50 p-6">
              <h2 className="font-bold text-burgundy-950">Keep going</h2>
              <ul className="mt-4 space-y-3">
                <li className="flex items-center justify-between rounded-xl border border-burgundy-50 p-3">
                  <div>
                    <p className="font-medium text-burgundy-950">Question bank</p>
                    <p className="text-xs text-burgundy-800/60">Search and drill by topic</p>
                  </div>
                  <Link href="/app/questions" className="text-sm font-semibold text-burgundy-600 hover:underline">
                    Open
                  </Link>
                </li>
                <li className="flex items-center justify-between rounded-xl border border-burgundy-50 p-3">
                  <div>
                    <p className="font-medium text-burgundy-950">Timed mock exam</p>
                    <p className="text-xs text-burgundy-800/60">Real exam conditions</p>
                  </div>
                  <Link href="/app/mock" className="text-sm font-semibold text-burgundy-600 hover:underline">
                    Start mock
                  </Link>
                </li>
                <li className="flex items-center justify-between rounded-xl border border-burgundy-50 p-3">
                  <div>
                    <p className="font-medium text-burgundy-950">Challenge room</p>
                    <p className="text-xs text-burgundy-800/60">One opponent, take turns</p>
                  </div>
                  <Link href="/app/challenge" className="text-sm font-semibold text-burgundy-600 hover:underline">
                    Play
                  </Link>
                </li>
                <li className="flex items-center justify-between rounded-xl border border-burgundy-50 p-3">
                  <div>
                    <p className="font-medium text-burgundy-950">Battle room</p>
                    <p className="text-xs text-burgundy-800/60">Up to 20 doctors, fastest answer wins</p>
                  </div>
                  <Link href="/app/battle" className="text-sm font-semibold text-burgundy-600 hover:underline">
                    Play
                  </Link>
                </li>
                <li className="flex items-center justify-between rounded-xl border border-burgundy-50 p-3">
                  <div>
                    <p className="font-medium text-burgundy-950">Radiographs</p>
                    <p className="text-xs text-burgundy-800/60">Films and guided reading</p>
                  </div>
                  <Link href="/app/radiographs" className="text-sm font-semibold text-burgundy-600 hover:underline">
                    Open
                  </Link>
                </li>
                <li className="flex items-center justify-between rounded-xl border border-burgundy-50 p-3">
                  <div>
                    <p className="font-medium text-burgundy-950">Laboratory slides</p>
                    <p className="text-xs text-burgundy-800/60">Histology and blood films</p>
                  </div>
                  <Link href="/app/lab-slides" className="text-sm font-semibold text-burgundy-600 hover:underline">
                    Open
                  </Link>
                </li>
                <li className="flex items-center justify-between rounded-xl border border-burgundy-50 p-3">
                  <div>
                    <p className="font-medium text-burgundy-950">Free Resources</p>
                    <p className="text-xs text-burgundy-800/60">Checklists and case presentations</p>
                  </div>
                  <Link href="/app/resources" className="text-sm font-semibold text-burgundy-600 hover:underline">
                    Browse
                  </Link>
                </li>
                <li className="flex items-center justify-between rounded-xl border border-burgundy-50 p-3">
                  <div>
                    <p className="font-medium text-burgundy-950">Leaderboard</p>
                    <p className="text-xs text-burgundy-800/60">See where you rank</p>
                  </div>
                  <Link href="/app/leaderboard" className="text-sm font-semibold text-burgundy-600 hover:underline">
                    View
                  </Link>
                </li>
              </ul>
            </section>
          </div>

          <section className="mt-6 rounded-2xl border border-burgundy-100 bg-cream-50 p-6">
            <h2 className="font-bold text-burgundy-950">
              Public battles
            </h2>
            <BattleList />
          </section>

          <section className="mt-6 rounded-2xl border border-burgundy-100 bg-cream-50 p-6">
            <h2 className="font-bold text-burgundy-950">
              Tournaments & Competitions
            </h2>
            <p className="mt-3 text-sm text-burgundy-800/70">
              Coming soon — multi-round competitions against
              other doctors preparing for the same paper.
            </p>
          </section>
        </>
      )}
    </div>
  );
}

function SubscriptionButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="mt-4 rounded-full bg-burgundy-600 px-5 py-2 text-sm font-semibold text-cream-50 hover:bg-burgundy-700"
      >
        Subscribe now
      </button>
      <SubscribeModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

function SubscriptionCard() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <section className="rounded-2xl border border-burgundy-100 bg-cream-50 p-6">
        <h2 className="font-bold text-burgundy-950">
          Subscribe for the full bank
        </h2>
        <p className="mt-1 text-sm text-burgundy-800/70">
          Every question, every mock, offline packs.
        </p>
        <div className="mt-4 space-y-3">
          {PLANS.map((plan) => (
            <button
              key={plan.id}
              onClick={() => setOpen(true)}
              className="flex w-full items-center justify-between rounded-xl border border-burgundy-100 bg-cream-50 px-4 py-3 text-left hover:border-burgundy-400"
            >
              <div>
                <p className="font-semibold text-burgundy-950">
                  {plan.name}
                </p>
                <p className="text-xs text-burgundy-800/60">
                  {plan.blurb}
                </p>
              </div>
              <p className="ml-3 font-bold text-burgundy-600">
                {plan.price}
              </p>
            </button>
          ))}
        </div>
      </section>
      <SubscribeModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

function BattleList() {
  const [battles, setBattles] = useState<Room[]>([]);
  useEffect(() => {
    setBattles(listBattleRooms());
    void fetchPublicBattles().then(setBattles);
  }, []);
  if (battles.length === 0) {
    return (
      <p className="mt-3 text-sm text-burgundy-800/70">
        No public battles yet. Create one in the battle room and
        it appears here for every doctor.
      </p>
    );
  }
  return (
    <ul className="mt-4 space-y-3">
      {battles.map((b) => (
        <li
          key={b.code}
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-burgundy-50 p-3"
        >
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium text-burgundy-950">{b.title}</p>
              <span className="inline-flex items-center gap-1 rounded-full bg-burgundy-600 px-2 py-0.5 text-xs font-semibold text-cream-50">
                <span className="h-1.5 w-1.5 rounded-full bg-cream-50" />
                Live
              </span>
            </div>
            <p className="mt-1 text-xs text-burgundy-800/60">
              {b.faculty} · {b.topic} · {b.players.length}/20 joined
            </p>
          </div>
          <Link
            href={`/app/battle`}
            className="rounded-full bg-burgundy-600 px-4 py-1.5 text-sm font-semibold text-cream-50 hover:bg-burgundy-700"
          >
            Join battle
          </Link>
        </li>
      ))}
    </ul>
  );
}
