"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth";
import { DEPARTMENTS, EXAMS, QUESTIONS, Question } from "@/lib/questions";
import {
  createRoom,
  generateCode,
  getRoom,
  joinRoom,
  listBattleRooms,
  saveRoom,
  Room,
} from "@/lib/rooms";

type Phase = "lobby" | "create" | "waiting" | "game" | "results";

interface Bot {
  name: string;
  delay: number;
  accuracy: number;
}

const BOT_NAMES = [
  "Dr. Chidi O.",
  "Dr. Fatima B.",
  "Dr. Emeka N.",
  "Dr. Kemi A.",
  "Dr. Tunde B.",
];

export default function BattleRoom() {
  const { user } = useAuth();
  const [phase, setPhase] = useState<Phase>("lobby");
  const [battles, setBattles] = useState<Room[]>([]);

  // create form
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [exam, setExam] = useState("");
  const [faculty, setFaculty] = useState("");
  const [questionCount, setQuestionCount] = useState(20);
  const [seconds, setSeconds] = useState(40);
  const [startMode, setStartMode] = useState<"now" | "later">("now");
  const [scheduledFor, setScheduledFor] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");

  // room + game state
  const [room, setRoom] = useState<Room | null>(null);
  const [pool, setPool] = useState<(Question & { id: number })[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(40);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [winner, setWinner] = useState("");
  const botsRef = useRef<Bot[]>([]);

  if (!user) return null;

  function refreshBattles() {
    setBattles(listBattleRooms());
  }

  useEffect(refreshBattles, [phase]);

  const question = pool[qIndex];

  // countdown
  useEffect(() => {
    if (phase !== "game" || revealed) return;
    if (timeLeft <= 0) {
      endQuestion(null);
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, timeLeft, revealed]);

  // simulated opponents answering
  useEffect(() => {
    if (phase !== "game" || revealed || !room) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    botsRef.current.forEach((bot, i) => {
      if (room.players[i + 1] === undefined) return;
      const t = setTimeout(
        () => {
          if (!question) return;
          const correct = Math.random() < bot.accuracy;
          botAnswer(room.players[i + 1].name, correct, true);
        },
        bot.delay * 1000
      );
      timers.push(t);
    });
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, qIndex, revealed]);

  function buildPool(r: Room) {
    const base = QUESTIONS.map((q, i) => ({ ...q, id: i }));
    const filtered = base.filter(
      (q) =>
        (!r.faculty || q.faculty === r.faculty) &&
        (!r.topic || q.topic === r.topic) &&
        (!r.exam || q.exam === r.exam)
    );
    return [...filtered].sort(() => Math.random() - 0.5).slice(0, r.questionCount);
  }

  function botAnswer(name: string, correct: boolean, isBot: boolean) {
    if (!room || revealed) return;
    const player = room.players.find((p) => p.name === name);
    if (!player) return;
    player.score = Math.round((player.score + (correct ? 2 : -0.5)) * 10) / 10;
    player.answered += 1;
    if (correct) player.correct += 1;
    if (isBot && correct && !winner) setWinner(name);
    saveRoom(room);
    setRoom({ ...room });
    const humanAnswered =
      room.players[0].answered > qIndex || selected !== null;
    const allBotsDone = room.players
      .slice(1)
      .every((p) => p.answered > qIndex);
    if ((humanAnswered && allBotsDone) || allBotsDone) {
      endQuestion(null);
    }
  }

  function endQuestion(_: string | null) {
    if (!room) return;
    setRevealed(true);
    setTimeout(() => {
      if (qIndex + 1 >= room.questionCount) {
        setPhase("results");
      } else {
        setQIndex((i) => i + 1);
        setSelected(null);
        setRevealed(false);
        setWinner("");
        setTimeLeft(room.secondsPerQuestion);
      }
    }, 3000);
  }

  function answer(opt: string) {
    if (!room || revealed) return;
    const correct = opt === question.correct;
    const me = room.players[0];
    me.score = Math.round((me.score + (correct ? 2 : -0.5)) * 10) / 10;
    me.answered += 1;
    if (correct) {
      me.correct += 1;
      if (!winner) setWinner(me.name);
    }
    setSelected(opt);
    saveRoom(room);
    setRoom({ ...room });
    const allBotsDone = room.players
      .slice(1)
      .every((p) => p.answered > qIndex);
    if (allBotsDone) endQuestion(null);
  }

  function createBattle(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!title.trim()) return setError("Give the battle a title.");
    if (!faculty) return setError("Choose a department.");
    if (!topic.trim()) return setError("Enter a topic, e.g. Cardiology.");
    if (startMode === "later" && !scheduledFor)
      return setError("Pick a date and time.");
    const newRoom = createRoom({
      code: generateCode(),
      kind: "battle",
      title: title.trim(),
      topic: topic.trim(),
      exam: exam || "NPMCN",
      faculty,
      questionCount,
      secondsPerQuestion: seconds,
      host: user?.name ?? "",
      players: [{ name: user?.name ?? "", score: 0, answered: 0, correct: 0 }],
      status: startMode === "now" ? "waiting" : "waiting",
      scheduledFor: startMode === "later" ? scheduledFor : undefined,
      visibility,
      currentQuestion: 0,
      createdAt: Date.now(),
    });
    setRoom(newRoom);
    setPhase("waiting");
  }

  function joinBattle(code: string) {
    const joined = getRoom(code);
    if (!joined) return setError("Battle not found.");
    setRoom(joined);
    setPhase("waiting");
  }

  function startBattle() {
    if (!room) return;
    const p = buildPool(room);
    if (p.length === 0) {
      setError(
        "No questions in the bank for this topic yet — battles unlock once questions are uploaded."
      );
      return;
    }
    // add simulated opponents (up to 20 total)
    const botCount = Math.min(4, 20 - room.players.length);
    const bots: Bot[] = [];
    for (let i = 0; i < botCount; i++) {
      const name = `${BOT_NAMES[i % BOT_NAMES.length]}${i >= BOT_NAMES.length ? ` ${Math.floor(i / BOT_NAMES.length) + 1}` : ""}`;
      room.players.push({ name, score: 0, answered: 0, correct: 0 });
      bots.push({
        name,
        delay: 3 + Math.random() * (room.secondsPerQuestion - 5),
        accuracy: 0.55 + Math.random() * 0.35,
      });
    }
    botsRef.current = bots;
    setPool(p);
    setQIndex(0);
    setSelected(null);
    setRevealed(false);
    setWinner("");
    setTimeLeft(room.secondsPerQuestion);
    room.status = "live";
    saveRoom(room);
    setPhase("game");
  }

  /* ---------- lobby ---------- */
  if (phase === "lobby") {
    return (
      <div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-burgundy-950">
              Battle room
            </h1>
            <p className="mt-1 text-sm text-burgundy-800/70">
              Up to 20 doctors. Fastest correct answer takes
              2 points — a wrong answer costs 0.5.
            </p>
          </div>
          <button
            onClick={() => setPhase("create")}
            className="rounded-full bg-burgundy-600 px-6 py-2.5 font-semibold text-cream-50 hover:bg-burgundy-700"
          >
            Create battle
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            joinBattle(joinCode);
          }}
          className="mt-6 flex gap-3"
        >
          <input
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            placeholder="Enter battle code"
            className="w-48 rounded-lg border border-burgundy-200 bg-cream-50 px-3 py-2.5 uppercase tracking-widest outline-none focus:border-burgundy-500"
          />
          <button
            type="submit"
            className="rounded-full border border-burgundy-300 px-6 py-2.5 font-semibold text-burgundy-700 hover:bg-burgundy-50"
          >
            Join battle
          </button>
        </form>

        {error && (
          <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <h2 className="mt-8 font-bold text-burgundy-950">Live and upcoming battles</h2>
        {battles.length === 0 ? (
          <p className="mt-3 text-sm text-burgundy-800/70">
            No public battles yet. Create one and other doctors
            will see it here.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {battles.map((b) => (
              <li
                key={b.code}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-burgundy-100 bg-cream-50 p-5"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-burgundy-950">{b.title}</p>
                    <span className="inline-flex items-center gap-1 rounded-full bg-burgundy-600 px-2 py-0.5 text-xs font-semibold text-cream-50">
                      <span className="h-1.5 w-1.5 rounded-full bg-cream-50" />
                      Live
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-burgundy-800/70">
                    {b.faculty} · {b.topic} · {b.questionCount} questions ·{" "}
                    {b.secondsPerQuestion}s each · host {b.host}
                  </p>
                  {b.scheduledFor && (
                    <p className="text-xs text-burgundy-800/60">
                      Scheduled for {new Date(b.scheduledFor).toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-burgundy-800/70">
                    {b.players.length}/20 joined
                  </p>
                  <button
                    onClick={() => joinBattle(b.code)}
                    className="mt-2 rounded-full bg-burgundy-600 px-5 py-2 text-sm font-semibold text-cream-50 hover:bg-burgundy-700"
                  >
                    Join battle
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  /* ---------- create ---------- */
  if (phase === "create") {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold text-burgundy-950">
          Create a battle
        </h1>
        <form
          onSubmit={createBattle}
          className="mt-6 space-y-4 rounded-2xl border border-burgundy-100 bg-cream-50 p-6"
        >
          <label className="block">
            <span className="text-sm font-medium">Battle title</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Cardiology battle"
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
              <span className="text-sm font-medium">Number of questions</span>
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
              <span className="text-sm font-medium">Time per question (seconds)</span>
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
          <fieldset>
            <legend className="mb-2 text-sm font-medium">Start mode</legend>
            <div className="flex gap-2">
              {(["now", "later"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setStartMode(m)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${
                    startMode === m
                      ? "bg-burgundy-600 text-cream-50"
                      : "border border-burgundy-200 text-burgundy-700 hover:bg-burgundy-50"
                  }`}
                >
                  {m === "now" ? "Start immediately" : "Schedule for later"}
                </button>
              ))}
            </div>
            {startMode === "later" && (
              <input
                type="datetime-local"
                value={scheduledFor}
                onChange={(e) => setScheduledFor(e.target.value)}
                className="mt-3 w-full rounded-lg border border-burgundy-200 bg-cream-50 px-3 py-2.5"
              />
            )}
          </fieldset>
          <fieldset>
            <legend className="mb-2 text-sm font-medium">Visibility</legend>
            <div className="flex gap-2">
              {(["public", "private"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setVisibility(v)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold capitalize ${
                    visibility === v
                      ? "bg-burgundy-600 text-cream-50"
                      : "border border-burgundy-200 text-burgundy-700 hover:bg-burgundy-50"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-burgundy-800/60">
              Public battles appear on every doctor&apos;s dashboard.
            </p>
          </fieldset>
          <button
            type="submit"
            className="w-full rounded-full bg-burgundy-600 py-3 font-semibold text-cream-50 hover:bg-burgundy-700"
          >
            Create battle
          </button>
        </form>
      </div>
    );
  }

  /* ---------- waiting ---------- */
  if (phase === "waiting" && room) {
    return (
      <div className="mx-auto max-w-xl">
        <h1 className="text-2xl font-bold text-burgundy-950">{room.title}</h1>
        <p className="mt-1 text-sm text-burgundy-800/70">
          {room.faculty} · {room.topic} · {room.questionCount} questions ·{" "}
          {room.secondsPerQuestion}s each
          {room.visibility === "public" && " · Public"}
        </p>
        {room.scheduledFor && (
          <p className="mt-2 text-sm text-burgundy-800/70">
            Scheduled for {new Date(room.scheduledFor).toLocaleString()}
          </p>
        )}
        <section className="mt-6 rounded-2xl border border-burgundy-100 bg-cream-50 p-8 text-center">
          <p className="text-sm font-medium text-burgundy-800/70">Battle code</p>
          <p className="mt-2 text-5xl font-bold tracking-[0.3em] text-burgundy-600">
            {room.code}
          </p>
          <p className="mt-4 text-sm text-burgundy-800/70">
            Share this code — other doctors join from the battle
            room.
          </p>
          <p className="mt-6 font-semibold text-burgundy-900">
            {room.players.length}/20 joined
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {room.players.map((p) => (
              <span
                key={p.name}
                className="rounded-full border border-burgundy-200 px-3 py-1 text-sm text-burgundy-800"
              >
                {p.name}
              </span>
            ))}
          </div>
          <button
            onClick={() => {
              const joined = joinRoom(room.code, `Opponent ${room.players.length} (demo)`);
              if (joined) setRoom(joined);
            }}
            className="mt-4 rounded-full border border-burgundy-300 px-5 py-2 text-sm font-semibold text-burgundy-700 hover:bg-burgundy-50"
          >
            Simulate an opponent (demo)
          </button>
          <button
            onClick={startBattle}
            className="mt-4 rounded-full bg-burgundy-600 px-8 py-3 font-semibold text-cream-50 hover:bg-burgundy-700"
          >
            Start battle
          </button>
        </section>
      </div>
    );
  }

  /* ---------- game ---------- */
  if (phase === "game" && room && question) {
    const pct = (timeLeft / room.secondsPerQuestion) * 100;
    const sorted = [...room.players].sort((a, b) => b.score - a.score);
    return (
      <div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-burgundy-950">
              {room.title}
            </h1>
            <p className="text-sm text-burgundy-800/70">
              Question {qIndex + 1} of {room.questionCount} ·{" "}
              {question.topic}
            </p>
          </div>
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

        <div className="mt-4 overflow-hidden rounded-2xl border border-burgundy-100 bg-cream-50">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-burgundy-100 bg-burgundy-50/60 text-left text-xs font-semibold uppercase tracking-wider text-burgundy-700">
                <th className="px-4 py-2">Rank</th>
                <th className="px-4 py-2">Doctor</th>
                <th className="px-4 py-2">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-burgundy-50">
              {sorted.map((p, i) => (
                <tr
                  key={p.name}
                  className={p.name === room.players[0].name ? "bg-burgundy-50/70 font-semibold" : ""}
                >
                  <td className="px-4 py-2 text-burgundy-600">#{i + 1}</td>
                  <td className="px-4 py-2 text-burgundy-950">
                    {p.name}
                    {p.name === room.players[0].name && (
                      <span className="ml-2 rounded-full bg-burgundy-600 px-2 py-0.5 text-xs text-cream-50">
                        You
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 font-bold text-burgundy-600">{p.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <section className="mt-4 rounded-2xl border border-burgundy-100 bg-cream-50 p-6">
          <p className="text-lg text-burgundy-950">{question.text}</p>
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
                {winner ? `${winner} was fastest — +2 points` : "Time up"}
              </p>
              <p className="mt-1 text-sm text-burgundy-900/80">
                Answer: {question.correct}. {question.explanation}
              </p>
            </div>
          )}
        </section>
      </div>
    );
  }

  /* ---------- results ---------- */
  if (phase === "results" && room) {
    const sorted = [...room.players].sort((a, b) => b.score - a.score);
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold text-burgundy-950">
          Battle complete
        </h1>
        <section className="mt-6 rounded-2xl border border-burgundy-100 bg-cream-50 p-6 text-center">
          <p className="text-sm font-medium text-burgundy-800/70">Winner</p>
          <p className="mt-1 text-3xl font-bold text-burgundy-600">
            {sorted[0]?.name}
          </p>
          <div className="mt-6 grid gap-3">
            {sorted.map((p, i) => (
              <div
                key={p.name}
                className="flex items-center justify-between rounded-xl border border-burgundy-100 bg-cream-50 px-4 py-3"
              >
                <span className="text-burgundy-600">#{i + 1}</span>
                <span className="font-semibold text-burgundy-950">{p.name}</span>
                <span className="text-sm text-burgundy-800/70">
                  {p.correct}/{p.answered}
                </span>
                <span className="text-xl font-bold text-burgundy-600">{p.score}</span>
              </div>
            ))}
          </div>
        </section>
        <h2 className="mt-8 font-bold text-burgundy-950">
          Questions, answers and explanations
        </h2>
        <div className="mt-4 space-y-3">
          {pool.map((q, i) => (
            <div
              key={q.id}
              className="rounded-xl border border-burgundy-100 bg-cream-50 p-4"
            >
              <p className="text-sm font-semibold text-burgundy-950">
                {i + 1}. {q.text}
              </p>
              <p className="mt-1 text-sm text-burgundy-700">Answer: {q.correct}</p>
              <p className="mt-1 text-xs text-burgundy-900/70">{q.explanation}</p>
            </div>
          ))}
        </div>
        <button
          onClick={() => setPhase("lobby")}
          className="mt-8 rounded-full bg-burgundy-600 px-8 py-3 font-semibold text-cream-50 hover:bg-burgundy-700"
        >
          Back to battle room
        </button>
      </div>
    );
  }

  return null;
}
