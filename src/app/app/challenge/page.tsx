"use client";

import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { DEPARTMENTS, EXAMS, Question, getQuestionsForTopic } from "@/lib/questions";
import {
  answerInRoom,
  createRoom,
  fetchRoom,
  generateCode,
  getRoom,
  joinRoom,
  saveRoom,
  subscribeRoom,
  Room,
} from "@/lib/rooms";

type Phase = "create" | "waiting" | "game" | "results";

export default function ChallengeRoom() {
  const { user } = useAuth();
  const [phase, setPhase] = useState<Phase>("create");
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("Cardiology");
  const [exam, setExam] = useState("NPMCN");
  const [faculty, setFaculty] = useState("Internal Medicine");
  const [questionCount, setQuestionCount] = useState(20);
  const [seconds, setSeconds] = useState(40);
  const [code, setCode] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [joinName, setJoinName] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // game state
  const [room, setRoom] = useState<Room | null>(null);
  const [qIndex, setQIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(40);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [pool, setPool] = useState<(Question & { id: number })[]>([]);

  const currentRoom = room ?? undefined;

  if (!user) return null;

  // Active player turn
  const activePlayer =
    currentRoom && currentRoom.players.length >= 2
      ? currentRoom.players[qIndex % 2]
      : currentRoom?.players[0] ?? null;

  const question = pool[qIndex] || pool[0];

  // countdown timer in live game
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

  // sync remote room state over Supabase Realtime
  useEffect(() => {
    if (!code || phase === "results" || phase === "create") return;
    const unsub = subscribeRoom(code, (r) => {
      setRoom(r);
      // Ensure pool is built on both devices
      if (pool.length === 0) {
        const p = buildPool(r);
        setPool(p);
      }
    });
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, phase, pool.length]);

  function buildPool(r: Room) {
    const rawQuestions = getQuestionsForTopic(
      r.topic,
      r.questionCount || 20,
      r.exam,
      r.faculty
    );
    return rawQuestions.map((q, i) => ({ ...q, id: i }));
  }

  function handleTimeout() {
    if (!currentRoom) return;
    const player = activePlayer || currentRoom.players[0];
    if (player) {
      player.answered += 1;
      saveRoom(currentRoom);
    }
    setRevealed(true);
    setTimeout(nextQuestion, 2000);
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

  // The creator gets first access to the room immediately!
  function createChallenge(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!title.trim()) return setError("Please enter a challenge title.");
    if (!faculty) return setError("Please select a department.");
    if (!topic.trim()) return setError("Please select or enter a topic.");

    const newCode = generateCode();
    const newRoom: Room = {
      code: newCode,
      kind: "challenge",
      title: title.trim(),
      topic: topic.trim(),
      exam: exam || "NPMCN",
      faculty,
      questionCount,
      secondsPerQuestion: seconds,
      host: user?.name ?? "Doctor",
      players: [{ name: user?.name ?? "Doctor", score: 0, answered: 0, correct: 0 }],
      status: "waiting",
      visibility: "private",
      currentQuestion: 0,
      createdAt: Date.now(),
    };

    createRoom(newRoom);
    setCode(newRoom.code);
    setRoom(newRoom);

    // Build question pool dynamically for this topic
    const p = buildPool(newRoom);
    setPool(p);
    setTimeLeft(newRoom.secondsPerQuestion);
    setQIndex(0);
    setSelected(null);
    setRevealed(false);

    // Creator has immediate access to the room and waits inside for the opponent!
    setPhase("game");
  }

  async function joinChallenge(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!joinCode.trim()) return setError("Please enter the room code.");
    if (!joinName.trim()) return setError("Please enter your name.");
    await fetchRoom(joinCode);
    const joined = joinRoom(joinCode, joinName.trim());
    if (!joined) return setError("Room is full or the code is invalid.");
    setRoom(joined);
    setCode(joined.code);

    const p = buildPool(joined);
    setPool(p);
    setTimeLeft(joined.secondsPerQuestion);
    setQIndex(joined.currentQuestion || 0);
    setSelected(null);
    setRevealed(false);

    // Second user joins directly into the active challenge room!
    setPhase("game");
  }

  function startGame() {
    if (!currentRoom) return;
    const p = buildPool(currentRoom);
    if (p.length === 0) {
      setError("No questions found for this topic pool.");
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
    if (!currentRoom || revealed || !question) return;
    const correct = opt === question.correct;
    const scoringPlayerName =
      activePlayer?.name || user?.name || currentRoom.players[0]?.name || "Doctor";

    const updated = answerInRoom(currentRoom.code, scoringPlayerName, correct);
    if (updated) setRoom(updated);

    setSelected(opt);
    setRevealed(true);

    // If correct, advance quickly to next question
    setTimeout(nextQuestion, correct ? 800 : 2200);
  }

  const copyRoomCode = () => {
    if (!code) return;
    navigator.clipboard?.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* ========================================================
     PHASE 1: CREATE OR JOIN FORM
     ======================================================== */
  if (phase === "create") {
    return (
      <div className="space-y-6 pb-12">
        {/* Top Hero Banner matching Battle Room gradient & aesthetic with 1/4th doctor picture */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-burgundy-950 via-burgundy-900 to-burgundy-850 p-6 text-cream-50 shadow-xl sm:p-8 border border-burgundy-800/80">
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-burgundy-600/20 blur-3xl" />

          <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
            {/* Banner Left Info (3/4th) */}
            <div className="max-w-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-xl backdrop-blur-md shadow-inner border border-burgundy-700/60">
                  ⚔️
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl text-white">
                    Challenge Room
                  </h1>
                </div>
              </div>
              <p className="mt-2 text-sm text-burgundy-100 sm:text-base leading-relaxed">
                Invite a colleague or peer. You take turns answering the same
                recall MCQs — 2 points per correct answer, −0.5 per wrong one.
              </p>

              {/* Stats badges */}
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-burgundy-800/70 border border-burgundy-700 px-3 py-1.5 backdrop-blur-md text-cream-100">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Turn-based Recall
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-burgundy-800/70 border border-burgundy-700 px-3 py-1.5 backdrop-blur-md text-cream-100">
                  👥 1-on-1 Head-to-Head
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-burgundy-800/70 border border-burgundy-700 px-3 py-1.5 backdrop-blur-md text-cream-100">
                  ⚡ Real-time Peer Sync
                </span>
              </div>
            </div>

            {/* Banner Right: Picture of Doctors in 1/4th of the hero section */}
            <div className="relative shrink-0 w-full md:w-1/4 max-w-[220px] self-center md:self-auto">
              <div className="overflow-hidden rounded-2xl border-2 border-amber-400/40 shadow-xl ring-1 ring-white/15 bg-burgundy-950 aspect-[4/3]">
                <Image
                  src="/challenge-room.jpg"
                  alt="Doctors facing off in challenge room"
                  width={300}
                  height={225}
                  unoptimized
                  priority
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="mt-1.5 text-center">
                <span className="inline-block rounded-full bg-burgundy-800/80 border border-burgundy-700/80 px-2.5 py-0.5 text-[10px] font-bold text-amber-200">
                  Clinical Face-Off ⚔️
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-2xl space-y-6">

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
            {error}
          </div>
        )}

        {/* Create Challenge Form */}
        <form
          onSubmit={createChallenge}
          className="mt-6 space-y-4 rounded-2xl border border-burgundy-100 bg-cream-50 p-6 shadow-xs"
        >
          <div className="flex items-center gap-2 pb-2 border-b border-burgundy-200/60">
            <span className="text-lg">⚔️</span>
            <h2 className="font-bold text-burgundy-950">Create a New Challenge</h2>
          </div>

          <label className="block">
            <span className="text-xs font-semibold text-burgundy-900">
              Challenge title
            </span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Cardiology Head-to-Head"
              className="mt-1 w-full rounded-xl border border-burgundy-200 bg-white px-3.5 py-2.5 text-xs text-burgundy-950 outline-none focus:border-burgundy-600 focus:ring-1 focus:ring-burgundy-100"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-semibold text-burgundy-900">Exam</span>
              <select
                value={exam}
                onChange={(e) => setExam(e.target.value)}
                className="mt-1 w-full rounded-xl border border-burgundy-200 bg-white px-3 py-2.5 text-xs text-burgundy-950 outline-none focus:border-burgundy-600"
              >
                {EXAMS.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-xs font-semibold text-burgundy-900">
                Department
              </span>
              <select
                value={faculty}
                onChange={(e) => {
                  setFaculty(e.target.value);
                  if (e.target.value === "Internal Medicine") setTopic("Cardiology");
                  else if (e.target.value === "Surgery") setTopic("Surgery");
                  else if (e.target.value === "Pediatrics") setTopic("Paediatrics");
                  else if (e.target.value === "Radiology") setTopic("Radiography");
                }}
                className="mt-1 w-full rounded-xl border border-burgundy-200 bg-white px-3 py-2.5 text-xs text-burgundy-950 outline-none focus:border-burgundy-600"
              >
                {DEPARTMENTS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block">
            <span className="text-xs font-semibold text-burgundy-900">
              Topic (Questions will populate for this topic)
            </span>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Physiology, Radiography, Cardiology, Pharmacology..."
              className="mt-1 w-full rounded-xl border border-burgundy-200 bg-white px-3.5 py-2.5 text-xs text-burgundy-950 outline-none focus:border-burgundy-600 focus:ring-1 focus:ring-burgundy-100"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-semibold text-burgundy-900">
                Number of questions
              </span>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="mt-1 w-full rounded-xl border border-burgundy-200 bg-white px-3 py-2.5 text-xs text-burgundy-950 outline-none focus:border-burgundy-600"
              >
                <option value={10}>10 questions</option>
                <option value={20}>20 questions</option>
                <option value={30}>30 questions</option>
                <option value={40}>40 questions</option>
              </select>
            </label>

            <label className="block">
              <span className="text-xs font-semibold text-burgundy-900">
                Seconds per question
              </span>
              <select
                value={seconds}
                onChange={(e) => setSeconds(Number(e.target.value))}
                className="mt-1 w-full rounded-xl border border-burgundy-200 bg-white px-3 py-2.5 text-xs text-burgundy-950 outline-none focus:border-burgundy-600"
              >
                <option value={20}>20 seconds</option>
                <option value={30}>30 seconds</option>
                <option value={40}>40 seconds</option>
                <option value={60}>60 seconds</option>
              </select>
            </label>
          </div>

          <button
            type="submit"
            className="w-full rounded-full bg-burgundy-600 py-3 text-sm font-bold text-cream-50 shadow-md hover:bg-burgundy-700 active:scale-95 transition"
          >
            Create & Enter Challenge Room →
          </button>
        </form>

        {/* Join Challenge Form */}
        <form
          onSubmit={joinChallenge}
          className="mt-6 space-y-4 rounded-2xl border border-burgundy-100 bg-cream-50 p-6 shadow-xs"
        >
          <div className="flex items-center gap-2 pb-2 border-b border-burgundy-200/60">
            <span className="text-lg">🤝</span>
            <h2 className="font-bold text-burgundy-950">Join an Existing Challenge</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              placeholder="Room code (e.g. 7X9K2P)"
              className="rounded-xl border border-burgundy-200 bg-white px-3.5 py-2.5 text-xs uppercase tracking-widest font-mono font-bold text-burgundy-950 outline-none focus:border-burgundy-600"
            />
            <input
              value={joinName}
              onChange={(e) => setJoinName(e.target.value)}
              placeholder="Your name"
              className="rounded-xl border border-burgundy-200 bg-white px-3.5 py-2.5 text-xs text-burgundy-950 outline-none focus:border-burgundy-600"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-full border border-burgundy-300 py-2.5 text-sm font-semibold text-burgundy-800 hover:bg-burgundy-100 transition"
          >
            Join Challenge →
          </button>
        </form>
      </div>
    </div>
  );
}

  /* ========================================================
     PHASE 2: WAITING SCREEN
     ======================================================== */
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

        <section className="mt-6 rounded-2xl border border-burgundy-100 bg-cream-50 p-8 text-center shadow-md">
          <p className="text-xs font-bold uppercase tracking-wider text-burgundy-800">Room code</p>
          <div className="mt-2 flex items-center justify-center gap-3">
            <span className="text-4xl sm:text-5xl font-black font-mono tracking-widest text-burgundy-600">
              {currentRoom.code}
            </span>
            <button
              type="button"
              onClick={copyRoomCode}
              className="rounded-xl bg-burgundy-100 border border-burgundy-200 px-3 py-1.5 text-xs font-bold text-burgundy-800 hover:bg-burgundy-200 transition"
            >
              {copied ? "✓ Copied" : "Copy"}
            </button>
          </div>
          <p className="mt-4 text-xs sm:text-sm text-burgundy-800/80 max-w-md mx-auto">
            Share this code with your colleague. You can enter the challenge room now and wait inside!
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            {currentRoom.players.map((p, i) => (
              <div
                key={p.name}
                className="rounded-xl border border-burgundy-200 bg-white p-4 text-left"
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-burgundy-600">
                  Player {i + 1}
                </p>
                <p className="mt-1 font-bold text-burgundy-950 truncate">{p.name}</p>
                <span className="text-[10px] text-emerald-600 font-semibold">● Connected</span>
              </div>
            ))}
            {currentRoom.players.length === 1 && (
              <div className="rounded-xl border border-dashed border-burgundy-300 p-4 text-left bg-burgundy-50/50">
                <p className="text-xs font-semibold uppercase tracking-wider text-burgundy-600">
                  Player 2
                </p>
                <p className="mt-1 text-xs text-burgundy-800/70">
                  Waiting for opponent…
                </p>
              </div>
            )}
          </div>

          {/* Direct access button: Creator can enter challenge room immediately */}
          <div className="mt-6 flex flex-col gap-2">
            <button
              onClick={startGame}
              className="rounded-full bg-burgundy-600 px-8 py-3 text-sm font-bold text-cream-50 shadow-md hover:bg-burgundy-700 transition active:scale-95"
            >
              Enter Challenge Room (Wait inside) →
            </button>
            <button
              onClick={() => setPhase("create")}
              className="text-xs text-burgundy-700 hover:underline pt-2 font-medium"
            >
              ← Back to Challenge Setup
            </button>
          </div>
        </section>
      </div>
    );
  }

  /* ========================================================
     PHASE 3: LIVE CHALLENGE ARENA (Burgundy & Cream Palette, No Blue)
     ======================================================== */
  if (phase === "game" && currentRoom && question) {
    const pct = (timeLeft / currentRoom.secondsPerQuestion) * 100;
    const player1 = currentRoom.players[0] || { name: user.name || "Doctor", score: 0 };
    const player2 = currentRoom.players[1] || { name: "Waiting for Opponent…", score: 0 };
    const hasOpponentJoined = currentRoom.players.length >= 2;

    return (
      <div className="mx-auto max-w-4xl py-2">
        {/* Waiting For Opponent Alert Banner inside room */}
        {!hasOpponentJoined && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-500/40 bg-amber-950/40 px-5 py-3 text-xs shadow-md">
            <div className="flex items-center gap-2.5">
              <span className="flex h-3 w-3 rounded-full bg-amber-400 animate-pulse" />
              <span className="font-bold text-amber-200">
                You are in the room! Waiting for Opponent to join:
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-burgundy-200 text-xs">Room Code:</span>
              <span className="font-mono font-bold tracking-widest text-amber-300 bg-burgundy-950 px-3 py-1 rounded-lg border border-amber-500/40 text-sm">
                {currentRoom.code}
              </span>
              <button
                type="button"
                onClick={copyRoomCode}
                className="rounded-lg bg-burgundy-800 hover:bg-burgundy-700 px-3 py-1 text-xs font-bold text-cream-50 transition border border-burgundy-600 shadow-xs"
              >
                {copied ? "✓ Copied" : "Copy Code"}
              </button>
            </div>
          </div>
        )}

        {/* Outer Arena Monitor Frame */}
        <div className="relative overflow-hidden rounded-3xl border-4 border-burgundy-800/90 bg-gradient-to-b from-burgundy-950 via-[#260009] to-burgundy-950 p-5 shadow-2xl md:p-8 text-cream-50">
          
          {/* Top Scoreboard Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-burgundy-800/80 pb-5">
            {/* Player 1 Score Box */}
            <div className="rounded-xl border border-burgundy-700 bg-burgundy-900/90 px-4 py-2 text-center shadow-md min-w-[110px]">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-burgundy-300">
                {player1.name} {player1.name === user.name && "(You)"}
              </span>
              <span className="text-xl font-black font-mono text-amber-400 sm:text-2xl">
                {player1.score}
              </span>
            </div>

            {/* Center Scoreboard Pill */}
            <div className="flex flex-1 items-center justify-center gap-3 rounded-2xl border border-burgundy-800 bg-burgundy-950/80 px-4 py-2.5 shadow-inner">
              <div className="text-center">
                <span className="block text-[9px] font-bold uppercase tracking-wider text-amber-400">
                  Round
                </span>
                <div className="flex gap-1 justify-center mt-0.5">
                  {[1, 2, 3].map((r) => (
                    <span
                      key={r}
                      className={`h-2 w-2 rounded-full ${
                        r <= Math.min(Math.floor(qIndex / 3) + 1, 3)
                          ? "bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                          : "bg-burgundy-800"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="text-center">
                <span className="block text-[9px] font-bold uppercase tracking-wider text-amber-400">
                  Question
                </span>
                <div className="flex gap-1 justify-center mt-0.5">
                  {[1, 2, 3].map((q) => (
                    <span
                      key={q}
                      className={`h-2 w-2 rounded-full ${
                        q <= (qIndex % 3) + 1
                          ? "bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                          : "bg-burgundy-800"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="hidden h-3 w-32 overflow-hidden rounded-full bg-burgundy-900 sm:block">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-burgundy-500 transition-all duration-300 shadow-[0_0_12px_rgba(245,158,11,0.4)]"
                  style={{ width: `${pct}%` }}
                />
              </div>

              {/* Digital Stopwatch Timer */}
              <div className="rounded-lg bg-burgundy-900/90 border border-amber-500/30 px-3 py-1 font-mono text-xl font-bold tracking-widest text-amber-300 sm:text-2xl">
                {timeLeft < 10 ? `0${timeLeft}` : timeLeft}s
              </div>
            </div>

            {/* Player 2 Score Box */}
            <div className="rounded-xl border border-burgundy-700 bg-burgundy-900/90 px-4 py-2 text-center shadow-md min-w-[110px]">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-burgundy-300">
                {player2.name}
              </span>
              <span className="text-xl font-black font-mono text-amber-400 sm:text-2xl">
                {hasOpponentJoined ? player2.score : "⏳"}
              </span>
            </div>
          </div>

          {/* Turn Indicator */}
          <div className="my-3 flex items-center justify-between text-xs">
            <span className="rounded-full bg-burgundy-800/80 border border-burgundy-700 px-3 py-1 font-semibold text-amber-300">
              Turn: {activePlayer?.name || user.name || "Doctor"}
            </span>
            <span className="text-burgundy-300">
              Question {qIndex + 1} of {currentRoom.questionCount}
            </span>
          </div>

          {/* Center Question Screen */}
          <div className="my-6 text-center">
            <p className="text-lg font-bold text-white sm:text-2xl md:text-3xl leading-snug">
              {question.text}
            </p>
            <p className="mt-2 text-xs text-amber-300/80">
              Exam Recall: {currentRoom.topic} · {currentRoom.faculty || "Clinical Knowledge"}
            </p>
          </div>

          {/* 2x2 Grid Answer Cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            {question.options.map((opt, i) => {
              const letter = String.fromCharCode(65 + i);
              const isPicked = selected === opt;
              const isCorrect = opt === question.correct;

              let cardStyle =
                "border-burgundy-800/90 bg-burgundy-950/60 text-white hover:border-burgundy-500 hover:bg-burgundy-900/60";
              let badgeStyle = "bg-burgundy-800 text-cream-100";

              if (revealed && isCorrect) {
                cardStyle =
                  "border-emerald-500 bg-emerald-950/80 text-emerald-100 ring-2 ring-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]";
                badgeStyle = "bg-emerald-500 text-slate-950 font-bold";
              } else if (revealed && isPicked && !isCorrect) {
                cardStyle =
                  "border-rose-500 bg-rose-950/80 text-rose-100 ring-2 ring-rose-500";
                badgeStyle = "bg-rose-500 text-white";
              } else if (isPicked) {
                cardStyle =
                  "border-amber-400 bg-amber-950/60 text-amber-200 font-bold ring-2 ring-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)]";
                badgeStyle = "bg-amber-400 text-burgundy-950 font-bold";
              }

              return (
                <button
                  key={opt}
                  type="button"
                  disabled={revealed}
                  onClick={() => answer(opt)}
                  className={`flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-all duration-200 ${cardStyle}`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-base font-bold shadow-sm ${badgeStyle}`}
                  >
                    {letter}
                  </div>
                  <span className="text-sm font-medium leading-normal sm:text-base">
                    {opt}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Revealed Feedback */}
          {revealed && (
            <div className="mt-6 rounded-2xl border border-amber-500/40 bg-burgundy-950/90 p-4 text-center">
              <p className="text-base font-bold text-amber-300">
                {selected === question.correct
                  ? "✓ Correct — +2 points awarded!"
                  : timeLeft <= 0
                    ? "⏱ Time Up"
                    : `✗ Incorrect (−0.5). Correct answer: ${question.correct}`}
              </p>
              <p className="mt-1 text-xs text-cream-100 max-w-xl mx-auto leading-relaxed">
                {question.explanation}
              </p>
            </div>
          )}

          {/* Bottom Controls */}
          <div className="mt-8 flex items-center justify-between border-t border-burgundy-800/80 pt-4 text-xs">
            <button
              onClick={() => setPhase("create")}
              className="text-burgundy-300 hover:text-white transition font-medium"
            >
              ← Leave Room
            </button>
            <button
              onClick={nextQuestion}
              className="rounded-lg bg-burgundy-800/80 hover:bg-burgundy-700 px-3.5 py-1.5 font-bold text-cream-100 transition border border-burgundy-700"
            >
              Next Question →
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ========================================================
     PHASE 4: RESULTS PHASE
     ======================================================== */
  if (phase === "results" && currentRoom) {
    const sorted = [...currentRoom.players].sort((a, b) => b.score - a.score);
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold text-burgundy-950">
          Challenge complete
        </h1>
        <section className="mt-6 rounded-2xl border border-burgundy-100 bg-cream-50 p-6 text-center shadow-md">
          <p className="text-xs font-bold uppercase tracking-wider text-burgundy-800/80">Winner</p>
          <p className="mt-1 text-3xl font-black text-burgundy-600">
            {sorted[0]?.name || "Doctor"}
          </p>
          <div className="mt-6 grid gap-3">
            {sorted.map((p) => (
              <div
                key={p.name}
                className="flex items-center justify-between rounded-xl border border-burgundy-200 bg-white px-4 py-3 shadow-xs"
              >
                <span className="font-semibold text-burgundy-950">{p.name}</span>
                <span className="text-sm text-burgundy-800/80">
                  {p.correct}/{p.answered} correct
                </span>
                <span className="text-xl font-bold font-mono text-burgundy-600">
                  {p.score} pts
                </span>
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
              <p className="mt-1 text-sm font-semibold text-burgundy-700">
                Answer: {q.correct}
              </p>
              <p className="mt-1 text-xs text-burgundy-900/80 leading-relaxed">{q.explanation}</p>
            </div>
          ))}
        </div>

        <button
          onClick={() => {
            setPhase("create");
            setRoom(null);
            setError("");
          }}
          className="mt-8 rounded-full bg-burgundy-600 px-8 py-3 font-semibold text-cream-50 shadow-md hover:bg-burgundy-700 transition"
        >
          New challenge
        </button>
      </div>
    );
  }

  return null;
}
