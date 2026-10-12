"use client";

import { useAuth } from "@/lib/auth";
import { accuracy, getAttempts, getMocks, weakAreas } from "@/lib/store";

export default function Performance() {
  const { user } = useAuth();
  if (!user) return null;

  const acc = accuracy(user.id);
  const attempts = getAttempts(user.id);
  const mocks = getMocks(user.id);
  const weak = weakAreas(user.id);

  const correct = attempts.filter((a) => a.correct).length;
  const bestMock = mocks.length
    ? Math.max(...mocks.map((m) => Math.round((m.score / m.total) * 100)))
    : 0;

  return (
    <div>
      <h1 className="text-2xl font-bold text-burgundy-950">Performance</h1>
      <p className="mt-1 text-sm text-burgundy-800/70">
        Your accuracy, trends and ranked weak areas — updated after every
        session.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-2xl bg-burgundy-500 p-5 text-white">
          <p className="text-3xl font-bold">{acc}%</p>
          <p className="mt-1 text-xs">Overall accuracy</p>
        </div>
        <div className="rounded-2xl border border-burgundy-100 bg-cream-50 p-5">
          <p className="text-3xl font-bold text-burgundy-600">{correct}</p>
          <p className="mt-1 text-xs">Correct answers</p>
        </div>
        <div className="rounded-2xl border border-burgundy-100 bg-cream-50 p-5">
          <p className="text-3xl font-bold text-burgundy-600">{attempts.length}</p>
          <p className="mt-1 text-xs">Questions attempted</p>
        </div>
        <div className="rounded-2xl border border-burgundy-100 bg-cream-50 p-5">
          <p className="text-3xl font-bold text-burgundy-600">{bestMock}%</p>
          <p className="mt-1 text-xs">Best mock score</p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-burgundy-100 bg-cream-50 p-6">
          <h2 className="font-bold text-burgundy-950">Weak areas — revise in this order</h2>
          {weak.length === 0 ? (
            <p className="mt-3 text-sm text-burgundy-800/70">
              Practise questions and your weakest topics will be ranked here.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {weak.map((w, i) => (
                <li key={`${w.faculty}-${w.topic}`}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-burgundy-950">
                      <span className="mr-2 font-bold text-burgundy-400">{i + 1}.</span>
                      {w.topic}{" "}
                      <span className="text-burgundy-800/50">· {w.faculty}</span>
                    </span>
                    <span className="font-semibold text-burgundy-600">
                      {w.correct}/{w.attempted} · {w.pct}%
                    </span>
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
        </section>

        <section className="rounded-2xl border border-burgundy-100 bg-cream-50 p-6">
          <h2 className="font-bold text-burgundy-950">Mock history</h2>
          {mocks.length === 0 ? (
            <p className="mt-3 text-sm text-burgundy-800/70">
              No mocks sat yet. A timed mock under real conditions is the best
              way to check your readiness.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-burgundy-50">
              {[...mocks].reverse().map((m, i) => (
                <li key={m.at} className="flex items-center justify-between py-3">
                  <span className="text-sm text-burgundy-950">
                    Mock {mocks.length - i}
                  </span>
                  <span className="text-sm font-semibold text-burgundy-600">
                    {m.score}/{m.total} · {Math.round((m.score / m.total) * 100)}%
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
