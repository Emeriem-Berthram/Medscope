"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth";
import { DEPARTMENTS, EXAMS, QUESTIONS, Question } from "@/lib/questions";
import {
  answerInRoom,
  createRoom,
  generateCode,
  getRoom,
  joinRoom,
  saveRoom,
} from "@/lib/rooms";

type Phase = "create" | "waiting" | "game" | "results";

export default function ChallengeRoom() {
  const { user } = useAuth();
  const [phase, setPhase] = useState<Phase>("create");
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [exam, setExam] = useState("");
  const [faculty, setFaculty] = useState("");
  const [questionCount, setQuestionCount] = useState(40);
  const [seconds, setSeconds] = useState(40);
  const [code, setCode] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [joinName, setJoinName] = useState("");
  const [error, setError] = useState("");

  // game state
  const [room, setRoom] = useState(getRoom("") as ReturnType<typeof getRoom>);
  const [qIndex, setQIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(40);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [pool, setPool] = useState<(Question & { id: number })[]>([]);

  const currentRoom = room ?? undefined;

  if (!user) return null;

  const activePlayer =
    currentRoom && currentRoom.players.length === 2
      ? currentRoom.players[qIndex % 2]
      : null;

  const question = pool[qIndex];

  // countdown
  useEffect(() => {
    if (phase !== "game" || revealed) return;
    if (timeLeft <= 0) {
      handleTimeout();
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, timeLeft, revealed]);

  function buildPool(r: NonNullable<ReturnType<typeof getRoom>>) {
    const base = QUESTIONS.map((q, i) => ({ ...q, id: i }));
    const filtered = base.filter(
      (q) =>
        (!r.faculty || q.faculty === r.faculty) &&
        (!r.topic || q.topic === r.topic) &&
        (!r.exam || q.exam === r.exam)
    );
    return [...filtered].sort(() => Math.random() - 0.5).slice(0, r.questionCount);
  }

  function handleTimeout() {
    if (!currentRoom) return;
    const player = currentRoom.players[qIndex % 2];
    player.answered += 1;
    saveRoom(currentRoom);
    setRevealed(true);
    setTimeout(nextQuestion, 2500);
  }

  function nextQuestion() {
    if (!currentRoom) return;
    if (qIndex + 1 >= currentRoom.questionCount) {
      setPhase("results");
      return;
    }
    setQIndex((i) => i + 1);
    setSelected(null);
    setRevealed(false);
    setTimeLeft(currentRoom.secondsPerQuestion);
  }

  function createChallenge(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!title.trim()) return setError("Give the challenge a title.");
    if (!faculty) return setError("Choose a department.");
    if (!topic.trim()) return setError("Enter a topic, e.g. Cardiology.");
    const newRoom = createRoom({
      code: generateCode(),
      kind: "challenge",
      title: title.trim(),
      topic: topic.trim(),
      exam: exam || "NPMCN",
      faculty,
      questionCount,
      secondsPerQuestion: seconds,
      host: user?.name ?? "",
      players: [{ name: user?.name ?? "", score: 0, answered: 0, correct: 0 }],
      status: "waiting",
      visibility: "private",
      currentQuestion: 0,
      createdAt: Date.now(),
    });
    setCode(newRoom.code);
    setRoom(newRoom);
    setPhase("waiting");
  }

  function joinChallenge(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!joinCode.trim()) return setError("Enter the room code.");
    if (!joinName.trim()) return setError("Enter your name.");
    const joined = joinRoom(joinCode, joinName.trim());
    if (!joined) return setError("Room is full or the code is wrong.");
    setRoom(joined);
    setCode(joined.code);
    setPhase("waiting");
  }

  function startGame() {
    if (!currentRoom) return;
    const p = buildPool(currentRoom);
    if (p.length === 0) {
      setError(
        "No questions in the bank for this topic yet — challenges unlock once questions are uploaded."
      );
      return;
    }
    setPool(p);
    setTimeLeft(currentRoom.secondsPerQuestion);
    setQIndex(0);
    setSelected(null);
    setRevealed(false);
    currentRoom.status = "live";
    saveRoom(currentRoom);
    setPhase("game");
  }

  function answer(opt: string) {
    if (!currentRoom || revealed) return;
    const correct = opt === question.correct;
    const updated = answerInRoom(currentRoom.code, activePlayer?.name ?? "", correct);
    if (updated) setRoom(updated);
    setSelected(opt);
    setRevealed(true);
    setTimeout(nextQuestion, 2500);
  }

  /* ---------- create form ---------- */
  if (phase === "create") {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold text-burgundy-950">Challenge room</h1>
        <p className="mt-1 text-sm text-burgundy-800/70">
          Invite one other doctor. You take turns answering the same
          MCQs — 2 points per correct answer, −0.5 per wrong one.
        </p>
        <form
          onSubmit={createChallenge}
          className="mt-6 space-y-4 rounded-2xl border border-burgundy-100 bg-cream-50 p-6"
        >
          <label className="block">
            <span className="text-sm font-medium">Challenge title</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Cardiology challenge"
              className="mt-1 w-full rounded-lg border border-burgundy-200 bg-cream-50 px-3 py-2.5 outline-none focus:border-burgundy-500"
            />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium">Exam</span>
              <select
                value={exam}
                onChange={(e) => setExam(e.target.value)}
                className="mt-1 w-full rounded-lg border border-burgundy-200 bg-cream-50 px-3 py-2.5"
              >
                {EXAMS.map((e) => (
                  <option key={e}>{e}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium">Department</span>
              <select
                value={faculty}
                onChange={(e) => setFaculty(e.target.value)}
                className="mt-1 w-full rounded-lg border border-burgundy-200 bg-cream-50 px-3 py-2.5"
              >
                <option value="">Choose…</option>
                {DEPARTMENTS.map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </select>
            </label>
          </div>
          <label className="block">
            <span className="text-sm font-medium">Topic</span>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Cardiology"
              className="mt-1 w-full rounded-lg border border-burgundy-200 bg-cream-50 px-3 py-2.5 outline-none focus:border-burgundy-500"
            />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium">Questions</span>
              <input
                type="number"
                min={1}
                max={40}
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-burgundy-200 bg-cream-50 px-3 py-2.5"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Seconds per question</span>
              <input
                type="number"
                min={5}
                max={120}
                value={seconds}
                onChange={(e) => setSeconds(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-burgundy-200 bg-cream-50 px-3 py-2.5"
              />
            </label>
          </div>
          {error && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="w-full rounded-full bg-burgundy-600 py-3 font-semibold text-cream-50 hover:bg-burgundy-700"
          >
            Create challenge
          </button>
        </form>

        <form
          onSubmit={joinChallenge}
          className="mt-6 space-y-4 rounded-2xl border border-burgundy-100 bg-cream-50 p-6"
        >
          <h2 className="font-bold text-burgundy-950">Join a challenge</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              placeholder="Room code"
              className="rounded-lg border border-burgundy-200 bg-cream-50 px-3 py-2.5 uppercase tracking-widest outline-none focus:border-burgundy-500"
            />
            <input
              value={joinName}
              onChange={(e) => setJoinName(e.target.value)}
              placeholder="Your name"
              className="rounded-lg border border-burgundy-200 bg-cream-50 px-3 py-2.5 outline-none focus:border-burgundy-500"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-full border border-burgundy-300 py-2.5 font-semibold text-burgundy-700 hover:bg-burgundy-50"
          >
            Join challenge
          </button>
        </form>
      </div>
    );
  }

  /* ---------- waiting ---------- */
  if (phase === "waiting" && currentRoom) {
    return (
      <div className="mx-auto max-w-xl">
        <h1 className="text-2xl font-bold text-burgundy-950">
          Challenge room
        </h1>
        <p className="mt-1 text-lg font-semibold text-burgundy-800">
          {currentRoom.title}
        </p>
        <p className="mt-1 text-sm text-burgundy-800/70">
          {currentRoom.faculty} · {currentRoom.topic} ·{" "}
          {currentRoom.questionCount} questions · {currentRoom.secondsPerQuestion}s each
        </p>
        <section className="mt-6 rounded-2xl border border-burgundy-100 bg-cream-50 p-8 text-center">
          <p className="text-sm font-medium text-burgundy-800/70">Room code</p>
          <p className="mt-2 text-5xl font-bold tracking-[0.3em] text-burgundy-600">
            {currentRoom.code}
          </p>
          <p className="mt-4 text-sm text-burgundy-800/70">
            Send this code to your opponent. The questions appear once
            they join.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            {currentRoom.players.map((p, i) => (
              <div
                key={p.name}
                className="rounded-xl border border-burgundy-100 bg-cream-50 p-4"
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-burgundy-600">
                  Player {i + 1}
                </p>
                <p className="mt-1 font-bold text-burgundy-950">{p.name}</p>
              </div>
            ))}
            {currentRoom.players.length === 1 && (
              <div className="rounded-xl border border-dashed border-burgundy-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-burgundy-600">
                  Player 2
                </p>
                <p className="mt-1 text-sm text-burgundy-800/60">
                  Waiting for opponent…
                </p>
              </div>
            )}
          </div>
          {currentRoom.players.length === 1 && (
            <button
              onClick={() => {
                const joined = joinRoom(currentRoom.code, "Opponent (demo)");
                if (joined) {
                  setRoom(joined);
                }
              }}
              className="mt-4 rounded-full bg-burgundy-600 px-6 py-2.5 text-sm font-semibold text-cream-50 hover:bg-burgundy-700"
            >
              Simulate opponent joining (demo)
            </button>
          )}
          {currentRoom.players.length === 2 && (
            <button
              onClick={startGame}
              className="mt-6 rounded-full bg-burgundy-600 px-8 py-3 font-semibold text-cream-50 hover:bg-burgundy-700"
            >
              Start challenge
            </button>
          )}
        </section>
      </div>
    );
  }

  /* ---------- game ---------- */
  if (phase === "game" && currentRoom && question) {
    const pct = (timeLeft / currentRoom.secondsPerQuestion) * 100;
    return (
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-burgundy-950">
            {currentRoom.title}
          </h1>
          <p className="rounded-full bg-burgundy-600 px-4 py-1.5 font-mono font-bold text-cream-50">
            {timeLeft}s
          </p>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-burgundy-100">
          <div
            className={`h-full rounded-full ${timeLeft < 10 ? "bg-red-500" : "bg-burgundy-500"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 text-center">
          {currentRoom.players.map((p, i) => (
            <div
              key={p.name}
              className={`rounded-xl border p-3 ${
                qIndex % 2 === i
                  ? "border-burgundy-500 bg-burgundy-50"
                  : "border-burgundy-100 bg-cream-50"
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-burgundy-600">
                Player {i + 1}
              </p>
              <p className="text-sm font-semibold text-burgundy-950">
                {p.name}
                {qIndex % 2 === i && " — your turn"}
              </p>
              <p className="text-2xl font-bold text-burgundy-600">{p.score}</p>
              <p className="text-xs text-burgundy-800/60">
                {p.correct}/{p.answered} correct
              </p>
            </div>
          ))}
        </div>

        <section className="mt-4 rounded-2xl border border-burgundy-100 bg-cream-50 p-6">
          <p className="text-xs font-semibold text-burgundy-600">
            Question {qIndex + 1} of {currentRoom.questionCount} ·{" "}
            {question.topic}
          </p>
          <p className="mt-3 text-lg text-burgundy-950">{question.text}</p>
          <div className="mt-4 space-y-2">
            {question.options.map((opt, i) => {
              const isCorrect = opt === question.correct;
              const isPicked = selected === opt;
              let style = "border-burgundy-100 hover:bg-burgundy-50";
              if (revealed && isCorrect)
                style = "border-burgundy-500 bg-burgundy-50 font-semibold text-burgundy-800";
              else if (revealed && isPicked)
                style = "border-red-300 bg-red-50";
              else if (isPicked) style = "border-burgundy-500 bg-burgundy-50";
              return (
                <button
                  key={opt}
                  onClick={() => answer(opt)}
                  disabled={revealed}
                  className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left ${style}`}
                >
                  <span className="font-bold text-burgundy-400">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="text-burgundy-950">{opt}</span>
                </button>
              );
            })}
          </div>
          {revealed && (
            <div className="mt-4 rounded-xl bg-burgundy-50 p-4">
              <p className="text-sm font-semibold text-burgundy-800">
                {selected === question.correct
                  ? "Correct — +2 points"
                  : timeLeft <= 0
                    ? "Time up"
                    : `Wrong — −0.5. The answer is ${question.correct}.`}
              </p>
              <p className="mt-1 text-sm text-burgundy-900/80">
                {question.explanation}
              </p>
            </div>
          )}
        </section>
      </div>
    );
  }

  /* ---------- results ---------- */
  if (phase === "results" && currentRoom) {
    const sorted = [...currentRoom.players].sort((a, b) => b.score - a.score);
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold text-burgundy-950">
          Challenge complete
        </h1>
        <section className="mt-6 rounded-2xl border border-burgundy-100 bg-cream-50 p-6 text-center">
          <p className="text-sm font-medium text-burgundy-800/70">Winner</p>
          <p className="mt-1 text-3xl font-bold text-burgundy-600">
            {sorted[0]?.name}
          </p>
          <div className="mt-6 grid gap-3">
            {sorted.map((p) => (
              <div
                key={p.name}
                className="flex items-center justify-between rounded-xl border border-burgundy-100 bg-cream-50 px-4 py-3"
              >
                <span className="font-semibold text-burgundy-950">{p.name}</span>
                <span className="text-sm text-burgundy-800/70">
                  {p.correct}/{p.answered} correct
                </span>
                <span className="text-xl font-bold text-burgundy-600">{p.score}</span>
              </div>
            ))}
          </div>
        </section>
        <h2 className="mt-8 font-bold text-burgundy-950">Review every question</h2>
        <div className="mt-4 space-y-3">
          {pool.map((q, i) => (
            <div
              key={q.id}
              className="rounded-xl border border-burgundy-100 bg-cream-50 p-4"
            >
              <p className="text-sm font-semibold text-burgundy-950">
                {i + 1}. {q.text}
              </p>
              <p className="mt-1 text-sm text-burgundy-700">
                Answer: {q.correct}
              </p>
              <p className="mt-1 text-xs text-burgundy-900/70">{q.explanation}</p>
            </div>
          ))}
        </div>
        <button
          onClick={() => {
            setPhase("create");
            setRoom(null as unknown as ReturnType<typeof getRoom>);
            setError("");
          }}
          className="mt-8 rounded-full bg-burgundy-600 px-8 py-3 font-semibold text-cream-50 hover:bg-burgundy-700"
        >
          New challenge
        </button>
      </div>
    );
  }

  return null;
}
