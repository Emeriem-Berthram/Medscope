"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth";
import { DEPARTMENTS, EXAMS, SUBS } from "@/lib/questions";
import { isBookmarked, searchQuestions, toggleBookmark } from "@/lib/store";

export default function QuestionBank() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [exam, setExam] = useState("");
  const [faculty, setFaculty] = useState("");
  const [sub, setSub] = useState("");
  const [openId, setOpenId] = useState<number | null>(null);
  const [, force] = useState(0);

  const userId = user?.id ?? "";
  const results = useMemo(
    () =>
      searchQuestions({
        text: query,
        exam: exam || undefined,
        faculty: faculty || undefined,
        sub: sub || undefined,
      }),
    [query, exam, faculty, sub]
  );

  useEffect(() => {
    setOpenId(null);
  }, [query, exam, faculty, sub]);

  if (!user) return null;

  const open = results.find((q) => q.id === openId);

  return (
    <div>
      <h1 className="text-2xl font-bold text-burgundy-950">Question bank</h1>
      <p className="mt-1 text-sm text-burgundy-800/70">
        Real recall questions, tagged by exam, department and
        sub-specialty.
      </p>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search any keyword…"
          className="rounded-lg border border-burgundy-200 bg-cream-50 px-3 py-2.5 outline-none focus:border-burgundy-500 focus:ring-2 focus:ring-burgundy-100"
        />
        <select
          value={exam}
          onChange={(e) => {
            setExam(e.target.value);
            setFaculty("");
            setSub("");
          }}
          className="rounded-lg border border-burgundy-200 bg-cream-50 px-3 py-2.5"
        >
          <option value="">All exams</option>
          {EXAMS.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
        <select
          value={faculty}
          onChange={(e) => {
            setFaculty(e.target.value);
            setSub("");
          }}
          className="rounded-lg border border-burgundy-200 bg-cream-50 px-3 py-2.5"
        >
          <option value="">All departments</option>
          {DEPARTMENTS.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
        {SUBS[faculty] && (
          <select
            value={sub}
            onChange={(e) => setSub(e.target.value)}
            className="rounded-lg border border-burgundy-200 bg-cream-50 px-3 py-2.5"
          >
            <option value="">All sub-specialties</option>
            {SUBS[faculty].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        )}
      </div>

      <p className="mt-4 text-sm text-burgundy-800/70">
        {results.length} question{results.length === 1 ? "" : "s"}
        {exam ? ` · ${exam}` : ""}
        {faculty ? ` · ${faculty}` : ""}
        {sub ? ` · ${sub}` : ""}
      </p>

      {open ? (
        <section className="mt-4 rounded-2xl border border-burgundy-100 bg-cream-50 p-6">
          <div className="flex items-center justify-between text-xs font-semibold text-burgundy-600">
            <span>
              {open.exam} · {open.faculty}
              {open.sub ? ` · ${open.sub}` : ""} · {open.topic}
            </span>
            <button
              onClick={() => {
                toggleBookmark(userId, open.id);
                force((n) => n + 1);
              }}
              className="rounded-full border border-burgundy-200 px-3 py-1 text-burgundy-700 hover:bg-burgundy-50"
            >
              {isBookmarked(userId, open.id) ? "★ Bookmarked" : "☆ Bookmark"}
            </button>
          </div>
          <p className="mt-4 text-lg text-burgundy-950">{open.text}</p>
          <ul className="mt-4 space-y-2 text-sm">
            {open.options.map((opt, i) => (
              <li
                key={opt}
                className={`rounded-lg border px-3 py-2 ${
                  opt === open.correct
                    ? "border-burgundy-400 bg-burgundy-50 font-semibold text-burgundy-700"
                    : "border-burgundy-100"
                }`}
              >
                <span className="mr-2 font-bold text-burgundy-400">
                  {String.fromCharCode(65 + i)}
                </span>
                {opt}
              </li>
            ))}
          </ul>
          <div className="mt-4 rounded-xl bg-burgundy-50 p-4 text-sm text-burgundy-900/80">
            <p className="font-semibold text-burgundy-800">
              Answer: {open.correct}
            </p>
            <p className="mt-1">{open.explanation}</p>
          </div>
          <button
            onClick={() => setOpenId(null)}
            className="mt-4 text-sm font-semibold text-burgundy-600 hover:underline"
          >
            Back to results
          </button>
        </section>
      ) : (
        <ul className="mt-4 space-y-2">
          {results.map((q) => (
            <li key={q.id}>
              <button
                onClick={() => setOpenId(q.id)}
                className="flex w-full items-center justify-between gap-4 rounded-xl border border-burgundy-100 bg-cream-50 p-4 text-left hover:border-burgundy-300"
              >
                <div>
                  <p className="text-burgundy-950">{q.text}</p>
                  <p className="mt-1 text-xs font-semibold text-burgundy-600">
                    {q.exam} · {q.faculty}
                    {q.sub ? ` · ${q.sub}` : ""} · {q.topic}
                  </p>
                </div>
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleBookmark(userId, q.id);
                    force((n) => n + 1);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.stopPropagation();
                      toggleBookmark(userId, q.id);
                      force((n) => n + 1);
                    }
                  }}
                  className="shrink-0 text-lg text-burgundy-500"
                  title="Bookmark"
                >
                  {isBookmarked(userId, q.id) ? "★" : "☆"}
                </span>
              </button>
            </li>
          ))}
          {results.length === 0 && (
            <li className="rounded-xl border border-burgundy-100 bg-cream-50 p-8 text-center text-burgundy-800/70">
              No questions in the bank yet — questions will be uploaded
              soon.
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
