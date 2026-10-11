"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/lib/auth";
import { QUESTIONS } from "@/lib/questions";
import { recordAttempt, recordMock } from "@/lib/store";

const MOCK_LENGTH = 10;
const MOCK_SECONDS = 300;

type Phase = "intro" | "exam" | "done";

export default function MockExam() {
  const { user } = useAuth();
  const [phase, setPhase] = useState<Phase>("intro");
  const [questions, setQuestions] = useState<(typeof QUESTIONS & { id: number })[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const answersRef = useRef<Record<number, string>>({});
  const [current, setCurrent] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(MOCK_SECONDS);

  const pool = useMemo(() => {
    const base = QUESTIONS.map((q, i) => ({ ...q, id: i }));
    const filtered = user?.faculty
      ? base.filter((q) => q.faculty === user.faculty)
      : base;
    return [...filtered].sort(() => Math.random() - 0.5);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.faculty, phase === "intro"]);

  useEffect(() => {
    if (phase !== "exam" || secondsLeft <= 0) return;
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, secondsLeft]);

  useEffect(() => {
    if (phase === "exam" && secondsLeft === 0) finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  function finish() {
    const finalAnswers = answersRef.current;
    const score = questions.filter((q) => finalAnswers[q.id] === q.correct).length;
    if (user && questions.length) {
      recordMock(user.id, score, questions.length);
      questions.forEach((q) => {
        if (finalAnswers[q.id]) recordAttempt(user.id, q.id, finalAnswers[q.id] === q.correct);
      });
    }
    setPhase("done");
  }

  const start = () => {
    const picked = pool.slice(0, Math.min(MOCK_LENGTH, pool.length));
    setQuestions(picked);
    setAnswers({});
    answersRef.current = {};
    setCurrent(0);
    setSecondsLeft(MOCK_SECONDS);
    setPhase("exam");
  };

  const select = (questionId: number, opt: string) => {
    const next = { ...answers, [questionId]: opt };
    setAnswers(next);
    answersRef.current = next;
  };

  if (!user) return null;

  if (pool.length === 0) {
    return (
      <div className="mx-auto max-w-xl">
        <h1 className="text-2xl font-bold text-teal-950">Timed mock exam</h1>
        <div className="mt-6 rounded-2xl border border-teal-100 bg-white p-10 text-center">
          <p className="font-bold text-teal-950">No questions yet</p>
          <p className="mt-2 text-sm text-teal-800/70">
            Mock exams unlock as soon as questions are uploaded to the
            bank.
          </p>
        </div>
      </div>
    );
  }

  if (phase === "intro") {
    return (
      <div className="mx-auto max-w-xl">
        <h1 className="text-2xl font-bold text-teal-950">Timed mock exam</h1>
        <p className="mt-1 text-sm text-teal-800/70">
          {user.faculty ? `${user.faculty} mock` : "Mixed mock"} under real exam
          conditions.
        </p>
        <section className="mt-6 rounded-2xl border border-teal-100 bg-white p-6">
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-teal-800/70">Questions</dt>
              <dd className="font-semibold text-teal-950">{MOCK_LENGTH}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-teal-800/70">Time limit</dt>
              <dd className="font-semibold text-teal-950">5 minutes</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-teal-800/70">Scoring</dt>
              <dd className="font-semibold text-teal-950">Instant, question by question</dd>
            </div>
          </dl>
          <button
            onClick={start}
            className="mt-6 w-full rounded-full bg-teal-500 py-3 font-semibold text-white hover:bg-teal-600"
          >
            Start mock
          </button>
        </section>
      </div>
    );
  }

  if (phase === "done") {
    const score = questions.filter((q) => answers[q.id] === q.correct).length;
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold text-teal-950">Mock complete</h1>
        <section className="mt-6 rounded-2xl border border-teal-100 bg-white p-6 text-center">
          <p className="text-5xl font-bold text-teal-600">{pct}%</p>
          <p className="mt-2 text-sm text-teal-800/70">
            {score} of {questions.length} correct
          </p>
          <div className="mt-6 grid gap-3 text-left">
            {questions.map((q, i) => (
              <div
                key={q.id}
                className={`rounded-xl border p-4 ${
                  answers[q.id] === q.correct
                    ? "border-teal-200 bg-teal-50/50"
                    : "border-red-200 bg-red-50/50"
                }`}
              >
                <p className="text-sm font-semibold text-teal-950">
                  {i + 1}. {q.text}
                </p>
                <p className="mt-1 text-sm">
                  {answers[q.id] === q.correct ? (
                    <span className="font-semibold text-teal-700">
                      Correct — {q.correct}
                    </span>
                  ) : (
                    <span className="font-semibold text-red-700">
                      You chose {answers[q.id] ?? "—"} · correct answer: {q.correct}
                    </span>
                  )}
                </p>
                <p className="mt-1 text-xs text-teal-900/70">{q.explanation}</p>
              </div>
            ))}
          </div>
          <button
            onClick={start}
            className="mt-6 rounded-full bg-teal-500 px-6 py-3 font-semibold text-white hover:bg-teal-600"
          >
            Sit another mock
          </button>
        </section>
      </div>
    );
  }

  const q = questions[current];
  const mm = Math.floor(secondsLeft / 60);
  const ss = String(secondsLeft % 60).padStart(2, "0");

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-teal-950">Mock exam</h1>
        <p
          className={`rounded-full px-4 py-1.5 font-mono font-bold ${
            secondsLeft < 60 ? "bg-red-100 text-red-700" : "bg-teal-100 text-teal-800"
          }`}
        >
          {mm}:{ss}
        </p>
      </div>
      <p className="mt-1 text-sm text-teal-800/70">
        Question {current + 1} of {questions.length}
      </p>

      <form
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          finish();
        }}
        className="mt-6 rounded-2xl border border-teal-100 bg-white p-6"
      >
        <p className="text-lg text-teal-950">{q.text}</p>
        <div className="mt-4 space-y-2">
          {q.options.map((opt, i) => (
            <label
              key={opt}
              className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 ${
                answers[q.id] === opt
                  ? "border-teal-500 bg-teal-50"
                  : "border-teal-100 hover:bg-teal-50"
              }`}
            >
              <input
                type="radio"
                name={`mock-${q.id}`}
                checked={answers[q.id] === opt}
                onChange={() => select(q.id, opt)}
                className="accent-teal-500"
              />
              <span className="font-bold text-teal-400">{String.fromCharCode(65 + i)}</span>
              <span className="text-teal-950">{opt}</span>
            </label>
          ))}
        </div>
        <div className="mt-6 flex justify-between">
          <button
            type="button"
            onClick={() => setCurrent((c) => Math.max(0, c - 1))}
            disabled={current === 0}
            className="rounded-full border border-teal-200 px-5 py-2 text-sm font-semibold text-teal-700 hover:bg-teal-50 disabled:opacity-40"
          >
            Previous
          </button>
          {current < questions.length - 1 ? (
            <button
              type="button"
              onClick={() => setCurrent((c) => c + 1)}
              className="rounded-full bg-teal-500 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-600"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              className="rounded-full bg-teal-600 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-700"
            >
              Submit mock
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
