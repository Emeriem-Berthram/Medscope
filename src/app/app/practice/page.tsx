"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { QUESTIONS } from "@/lib/questions";
import { recordAttempt } from "@/lib/store";

export default function Practice() {
  const router = useRouter();
  const { user } = useAuth();
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);

  const pool = useMemo(() => {
    if (!user?.faculty) return QUESTIONS.map((q, i) => ({ ...q, id: i }));
    return QUESTIONS.map((q, i) => ({ ...q, id: i })).filter(
      (q) => q.faculty === user.faculty
    );
  }, [user?.faculty]);

  if (!user) return null;

  if (pool.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-burgundy-950">Practise</h1>
        <div className="mt-6 rounded-2xl border border-burgundy-100 bg-cream-50 p-10 text-center">
          <p className="font-bold text-burgundy-950">No questions yet</p>
          <p className="mt-2 text-sm text-burgundy-800/70">
            Questions will be uploaded to the bank soon.
          </p>
        </div>
      </div>
    );
  }

  const question = pool[index % pool.length];

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (selected === null) return;
    const correct = selected === question.correct;
    setChecked(true);
    setAnswered((a) => a + 1);
    if (correct) setScore((s) => s + 1);
    recordAttempt(user.id, question.id, correct);
  };

  const next = () => {
    setSelected(null);
    setChecked(false);
    setIndex((i) => i + 1);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-burgundy-950">Practise</h1>
          <p className="mt-1 text-sm text-burgundy-800/70">
            {user.faculty ? `${user.faculty} question set` : "Mixed question set"} — every
            question has an explanation.
          </p>
        </div>
        <div className="rounded-xl border border-burgundy-100 bg-cream-50 px-4 py-2 text-sm">
          Score: <span className="font-bold text-burgundy-600">{score}</span> / {answered}
        </div>
      </div>

      <section className="mt-6 rounded-2xl border border-burgundy-100 bg-cream-50 p-6">
        <div className="flex items-center justify-between text-xs font-semibold text-burgundy-600">
          <span>
            {question.exam} · {question.faculty}
            {question.sub ? ` · ${question.sub}` : ""} · {question.topic}
          </span>
          <span>Question {index + 1}</span>
        </div>
        <p className="mt-4 text-lg text-burgundy-950">{question.text}</p>
        <form onSubmit={submit} className="mt-4 space-y-2">
          {question.options.map((opt, i) => (
            <label
              key={opt}
              className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 ${
                checked
                  ? opt === question.correct
                    ? "border-burgundy-500 bg-burgundy-50"
                    : selected === opt
                      ? "border-red-300 bg-red-50"
                      : "border-burgundy-100"
                  : selected === opt
                    ? "border-burgundy-500 bg-burgundy-50"
                    : "border-burgundy-100 hover:bg-burgundy-50"
              }`}
            >
              <input
                type="radio"
                name="option"
                checked={selected === opt}
                disabled={checked}
                onChange={() => setSelected(opt)}
                className="accent-burgundy-500"
              />
              <span className="font-bold text-burgundy-400">{String.fromCharCode(65 + i)}</span>
              <span className="text-burgundy-950">{opt}</span>
            </label>
          ))}
          {!checked && (
            <button
              type="submit"
              disabled={selected === null}
              className="mt-4 rounded-full bg-burgundy-500 px-6 py-2.5 font-semibold text-white hover:bg-burgundy-600 disabled:opacity-50"
            >
              Check answer
            </button>
          )}
        </form>
        {checked && (
          <div className="mt-4 rounded-xl bg-burgundy-50 p-4">
            <p className="text-sm font-semibold text-burgundy-800">
              {selected === question.correct
                ? "Correct — well done."
                : `Not quite. The answer is ${question.correct}.`}
            </p>
            <p className="mt-2 text-sm text-burgundy-900/80">{question.explanation}</p>
            <button
              onClick={next}
              className="mt-4 rounded-full bg-burgundy-600 px-6 py-2.5 font-semibold text-white hover:bg-burgundy-700"
            >
              Next question
            </button>
          </div>
        )}
      </section>

      {user.plan === "free" && answered > 0 && answered % 20 === 0 && (
        <p className="mt-4 rounded-xl border border-burgundy-100 bg-cream-50 p-4 text-sm text-burgundy-800/80">
          You&apos;ve used your 20 free questions this month.{" "}
          <button onClick={() => router.push("/app/mock")} className="font-semibold text-burgundy-600 hover:underline">
            Subscribe to keep practising
          </button>
        </p>
      )}
    </div>
  );
}
