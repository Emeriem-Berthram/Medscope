"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useAuth } from "@/lib/auth";
import { DEPARTMENTS, EXAMS, QUESTIONS, Question } from "@/lib/questions";
import {
  createRoom,
  fetchRoom,
  fetchPublicBattles,
  generateCode,
  getRoom,
  joinRoom,
  listBattleRooms,
  saveRoom,
  subscribeRoom,
  Room,
} from "@/lib/rooms";
import BattleChat from "@/components/battle-chat";

type Phase = "lobby" | "waiting" | "game" | "results";
type Tab = "browse" | "my-battles" | "created-battles";

interface Bot {
  name: string;
  delay: number;
  accuracy: number;
}

const BOT_NAMES = [
  "Dr. Sarah K.",
  "Dr. Michael R.",
  "Dr. Fatima A.",
  "Dr. Emeka E.",
  "Dr. Amara O.",
  "Dr. Chidi O.",
  "Dr. Kemi A.",
  "Dr. Tunde B.",
];

// Seed public battles to match the exact rich SaaS hub layout from Image 2
const SEED_BATTLES: {
  code: string;
  title: string;
  subtitle: string;
  topic: string;
  faculty: string;
  iconBg: string;
  iconColor: string;
  badgeBg: string;
  badgeText: string;
  iconType: "heart" | "pill" | "surgery" | "baby" | "microscope";
  playersCount: number;
  maxPlayers: number;
  duration: string;
  hostName: string;
  status: "live" | "waiting";
  questionCount: number;
  secondsPerQuestion: number;
}[] = [
  {
    code: "CARD01",
    title: "Cardiology MCQ Battle",
    subtitle: "Test your knowledge on cardiology — heart sounds, arrhythmias, ECG interpretation & HF",
    topic: "Cardiology",
    faculty: "Internal Medicine",
    iconBg: "bg-rose-100",
    iconColor: "text-rose-600",
    badgeBg: "bg-rose-50 border border-rose-200",
    badgeText: "text-rose-700",
    iconType: "heart",
    playersCount: 12,
    maxPlayers: 20,
    duration: "20 mins",
    hostName: "Dr. Sarah K.",
    status: "live",
    questionCount: 20,
    secondsPerQuestion: 40,
  },
  {
    code: "PHARM2",
    title: "Pharmacology Challenge",
    subtitle: "Drug mechanisms & pharmacokinetics · Autonomic drugs, antimicrobials & toxicology",
    topic: "Pharmacology",
    faculty: "Basic Medical Sciences",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    badgeBg: "bg-blue-50 border border-blue-200",
    badgeText: "text-blue-700",
    iconType: "pill",
    playersCount: 8,
    maxPlayers: 20,
    duration: "15 mins",
    hostName: "Dr. Michael R.",
    status: "live",
    questionCount: 15,
    secondsPerQuestion: 30,
  },
  {
    code: "SURG03",
    title: "Surgery Essentials",
    subtitle: "Pre-op, post-op, ATLS & trauma care · Acute abdomen & surgical emergencies",
    topic: "Surgery",
    faculty: "Surgery",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    badgeBg: "bg-emerald-50 border border-emerald-200",
    badgeText: "text-emerald-700",
    iconType: "surgery",
    playersCount: 15,
    maxPlayers: 20,
    duration: "25 mins",
    hostName: "Dr. Fatima A.",
    status: "live",
    questionCount: 20,
    secondsPerQuestion: 40,
  },
  {
    code: "PAED04",
    title: "Paediatrics Practice",
    subtitle: "Common neonatal growth & development milestones, vaccines & pediatric emergencies",
    topic: "Paediatrics",
    faculty: "Paediatrics",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    badgeBg: "bg-purple-50 border border-purple-200",
    badgeText: "text-purple-700",
    iconType: "baby",
    playersCount: 4,
    maxPlayers: 20,
    duration: "30 mins",
    hostName: "Dr. Emeka E.",
    status: "waiting",
    questionCount: 20,
    secondsPerQuestion: 40,
  },
  {
    code: "PATH05",
    title: "Pathology Marathon",
    subtitle: "Histology, neoplasms & biopsy cases · Cell injury and systemic pathology",
    topic: "Pathology",
    faculty: "Pathology",
    iconBg: "bg-teal-100",
    iconColor: "text-teal-600",
    badgeBg: "bg-teal-50 border border-teal-200",
    badgeText: "text-teal-700",
    iconType: "microscope",
    playersCount: 18,
    maxPlayers: 20,
    duration: "40 mins",
    hostName: "Dr. Amara O.",
    status: "live",
    questionCount: 30,
    secondsPerQuestion: 40,
  },
];

const TOPIC_CHIPS = [
  "All Topics",
  "Anatomy",
  "Surgery",
  "Paediatrics",
  "OBGYN",
  "Radiology",
  "Pathology",
  "Pharmacology",
  "Cardiology",
  "Internal Medicine",
];

export default function BattleRoom() {
  const { user } = useAuth();
  const [phase, setPhase] = useState<Phase>("lobby");
  const [activeTab, setActiveTab] = useState<Tab>("browse");
  const [battles, setBattles] = useState<Room[]>([]);
  const [selectedTopic, setSelectedTopic] = useState("All Topics");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Create Battle panel form state
  const [createTitle, setCreateTitle] = useState("");
  const [createTopic, setCreateTopic] = useState("Cardiology");
  const [createDescription, setCreateDescription] = useState("");
  const [createExam, setCreateExam] = useState("NPMCN");
  const [createFaculty, setCreateFaculty] = useState("Internal Medicine");
  const [createQuestionCount, setCreateQuestionCount] = useState(20);
  const [createSeconds, setCreateSeconds] = useState(40);
  const [createVisibility, setCreateVisibility] = useState<"public" | "private">("public");
  const [createStartMode, setCreateStartMode] = useState<"now" | "later">("now");
  const [createScheduledFor, setCreateScheduledFor] = useState("");
  const [allowLiveChat, setAllowLiveChat] = useState(true);
  const [hostCanKick, setHostCanKick] = useState(true);
  const [questionSource, setQuestionSource] = useState<"bank" | "custom">("bank");
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [error, setError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  // Room + Game state
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
    void fetchPublicBattles().then((fetched) => {
      if (fetched && fetched.length > 0) {
        setBattles(fetched);
      }
    });
  }

  useEffect(() => {
    refreshBattles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const question = pool[qIndex];

  // Countdown
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

  // Simulated bot opponents answering in live game
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

  // Sync remote room state over Supabase Realtime
  useEffect(() => {
    if (!room || phase === "results" || phase === "lobby") return;
    const unsub = subscribeRoom(room.code, (r) => setRoom(r));
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room?.code, phase]);

  function buildPool(r: Room) {
    const base = QUESTIONS.map((q, i) => ({ ...q, id: i }));
    const filtered = base.filter(
      (q) =>
        (!r.faculty || q.faculty === r.faculty) &&
        (!r.topic || q.topic === r.topic) &&
        (!r.exam || q.exam === r.exam)
    );
    const result = filtered.length > 0 ? filtered : base;
    return [...result].sort(() => Math.random() - 0.5).slice(0, r.questionCount);
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
    }, 2800);
  }

  function answer(opt: string) {
    if (!room || revealed || !question) return;
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
    endQuestion(null);
  }

  function handleCreateBattle(e: FormEvent) {
    e.preventDefault();
    setError("");
    setFormSuccess("");
    if (!createTitle.trim()) return setError("Please enter a battle title.");
    if (!createTopic.trim()) return setError("Please select or enter a topic.");

    const newCode = generateCode();
    const newRoom: Room = {
      code: newCode,
      kind: "battle",
      title: createTitle.trim(),
      topic: createTopic.trim(),
      exam: createExam || "NPMCN",
      faculty: createFaculty || "Clinical Medicine",
      questionCount: createQuestionCount,
      secondsPerQuestion: createSeconds,
      host: user?.name ?? "Doctor",
      players: [{ name: user?.name ?? "Doctor", score: 0, answered: 0, correct: 0 }],
      status: "waiting",
      scheduledFor: createStartMode === "later" ? createScheduledFor : undefined,
      visibility: createVisibility,
      currentQuestion: 0,
      createdAt: Date.now(),
    };

    createRoom(newRoom);
    setRoom(newRoom);
    setPhase("waiting");
    setFormSuccess("Battle created successfully!");
  }

  async function handleJoinSeedOrCustom(code: string, seedItem?: (typeof SEED_BATTLES)[0]) {
    setError("");
    let targetRoom = getRoom(code) ?? (await fetchRoom(code));

    if (!targetRoom && seedItem) {
      // Seed room initialization on first join
      targetRoom = createRoom({
        code: seedItem.code,
        kind: "battle",
        title: seedItem.title,
        topic: seedItem.topic,
        exam: "NPMCN",
        faculty: seedItem.faculty,
        questionCount: seedItem.questionCount,
        secondsPerQuestion: seedItem.secondsPerQuestion,
        host: seedItem.hostName,
        players: [
          { name: user?.name ?? "Doctor", score: 0, answered: 0, correct: 0 },
          { name: seedItem.hostName, score: 0, answered: 0, correct: 0 },
          { name: "Dr. Chidi O.", score: 0, answered: 0, correct: 0 },
          { name: "Dr. Fatima B.", score: 0, answered: 0, correct: 0 },
        ],
        status: seedItem.status,
        visibility: "public",
        currentQuestion: 0,
        createdAt: Date.now(),
      });
    }

    if (!targetRoom) {
      setError("Battle not found or has concluded.");
      return;
    }

    const joined = joinRoom(targetRoom.code, user?.name ?? "Doctor") ?? targetRoom;
    setRoom(joined);
    setPhase("waiting");
  }

  function startLiveBattleNow() {
    if (!room) return;
    const p = buildPool(room);
    if (p.length === 0) {
      setError("No questions found for this topic pool.");
      return;
    }

    // Spawn bot participants up to 8 for realistic competition
    const needed = Math.max(0, Math.min(8 - room.players.length, 6));
    const bots: Bot[] = [];
    for (let i = 0; i < needed; i++) {
      const name = BOT_NAMES[i % BOT_NAMES.length];
      if (!room.players.some((pl) => pl.name === name)) {
        room.players.push({ name, score: 0, answered: 0, correct: 0 });
      }
      bots.push({
        name,
        delay: 2 + Math.random() * (room.secondsPerQuestion - 4),
        accuracy: 0.65 + Math.random() * 0.25,
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

  // Filtered public battles
  const filteredBattles = useMemo(() => {
    return SEED_BATTLES.filter((b) => {
      const matchTopic =
        selectedTopic === "All Topics" ||
        b.topic.toLowerCase().includes(selectedTopic.toLowerCase()) ||
        b.title.toLowerCase().includes(selectedTopic.toLowerCase());
      const matchSearch =
        !searchQuery ||
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.topic.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus =
        statusFilter === "all" || b.status === statusFilter;
      return matchTopic && matchSearch && matchStatus;
    });
  }, [selectedTopic, searchQuery, statusFilter]);

  /* ========================================================
     RENDER: LOBBY (Matches Image 2 SaaS Hub Exactly)
     ======================================================== */
  if (phase === "lobby") {
    return (
      <div className="space-y-6 pb-12">
        {/* Top Hero Banner (Rich Blue Gradient + Facing Doctors Graphic) */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 p-6 text-white shadow-xl sm:p-8">
          {/* Subtle background glow */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />

          <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
            {/* Banner Left Info */}
            <div className="max-w-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-xl backdrop-blur-md shadow-inner">
                  ⚔️
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                    Battle Room
                  </h1>
                </div>
              </div>
              <p className="mt-2 text-sm text-blue-100 sm:text-base leading-relaxed">
                Practice MCQ battles, compete with real students.
                Test speed & skills and climb the leaderboard.
              </p>

              {/* Stats badges / pills */}
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 backdrop-blur-md">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live (14)
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 backdrop-blur-md">
                  📊 Real-time Leaderboard
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 backdrop-blur-md">
                  ⚡ Battle Stats
                </span>
              </div>
            </div>

            {/* Banner Right Graphic: Two Doctors Facing Off with "VS" badge */}
            <div className="relative flex shrink-0 items-center justify-center gap-4 py-2">
              {/* Doctor 1 (Left, Male Doctor in Scrubs with speech bubble) */}
              <div className="flex flex-col items-center">
                <div className="mb-1 rounded-lg bg-white/90 px-2 py-0.5 text-[11px] font-bold text-blue-900 shadow-sm animate-bounce">
                  ...
                </div>
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/40 bg-gradient-to-tr from-blue-950 to-blue-800 shadow-lg">
                  <span className="text-2xl">👨‍⚕️</span>
                </div>
                <span className="mt-1 text-[11px] font-semibold text-blue-100">P1</span>
              </div>

              {/* Center "VS" Badge */}
              <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 font-extrabold text-white shadow-[0_0_15px_rgba(34,211,238,0.6)]">
                VS
              </div>

              {/* Doctor 2 (Right, Female Doctor with Stethoscope & speech bubble) */}
              <div className="flex flex-col items-center">
                <div className="mb-1 rounded-lg bg-white/90 px-2 py-0.5 text-[11px] font-bold text-blue-900 shadow-sm animate-bounce">
                  ?!
                </div>
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/40 bg-gradient-to-tr from-indigo-950 to-indigo-800 shadow-lg">
                  <span className="text-2xl">👩‍⚕️</span>
                </div>
                <span className="mt-1 text-[11px] font-semibold text-blue-100">P2</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation (Browse, My Battles, Created Battles) */}
        <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2">
          <button
            onClick={() => setActiveTab("browse")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
              activeTab === "browse"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <span>🧭</span>
            <span>Browse</span>
          </button>
          <button
            onClick={() => setActiveTab("my-battles")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
              activeTab === "my-battles"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <span>📋</span>
            <span>My Battles</span>
          </button>
          <button
            onClick={() => setActiveTab("created-battles")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
              activeTab === "created-battles"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <span>📁</span>
            <span>Created Battles</span>
          </button>
        </div>

        {/* Filter Toolbar: Search + Filter Dropdowns */}
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-12">
            {/* Search Input */}
            <div className="relative sm:col-span-5 md:col-span-6">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                🔍
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search battles by topic or title..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 shadow-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Dropdown Filters */}
            <div className="flex gap-2 sm:col-span-7 md:col-span-6">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-700 shadow-xs outline-none focus:border-blue-500"
              >
                <option value="all">Type: All</option>
                <option value="rapid">Speed Battle</option>
                <option value="timed">Standard MCQ</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-700 shadow-xs outline-none focus:border-blue-500"
              >
                <option value="all">Status: All</option>
                <option value="live">Live Now</option>
                <option value="waiting">In Waiting</option>
              </select>

              <select
                className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-700 shadow-xs outline-none focus:border-blue-500"
              >
                <option value="popular">Sort: Most Popular</option>
                <option value="newest">Sort: Newest</option>
                <option value="fastest">Sort: Speed</option>
              </select>
            </div>
          </div>

          {/* Topic Pills Row */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {TOPIC_CHIPS.map((chip) => {
              const active = selectedTopic === chip;
              return (
                <button
                  key={chip}
                  onClick={() => setSelectedTopic(chip)}
                  className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                    active
                      ? "bg-blue-600 text-white shadow-xs"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {chip}
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* ========================================================
            2-COLUMN LAYOUT: Public Battles (Left) + Create Battle (Right)
            ======================================================== */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
          
          {/* LEFT COLUMN (8 COLS): Public Battles Feed */}
          <div className="space-y-4 lg:col-span-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Public Battles</h2>
                <p className="text-xs text-slate-500">
                  Join a live battle or wait for an upcoming session
                </p>
              </div>

              {/* Private Code Quick Enter */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (joinCodeInput.trim()) {
                    handleJoinSeedOrCustom(joinCodeInput.trim().toUpperCase());
                  }
                }}
                className="hidden items-center gap-2 sm:flex"
              >
                <input
                  type="text"
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value)}
                  placeholder="Private Code"
                  className="w-28 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-900 outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-900 transition"
                >
                  Join
                </button>
              </form>
            </div>

            {/* Custom User-Created Battles (if any) */}
            {battles.length > 0 && (
              <div className="space-y-3">
                {battles.map((b) => (
                  <div
                    key={b.code}
                    className="flex flex-col justify-between gap-4 rounded-2xl border border-blue-200 bg-blue-50/50 p-5 shadow-xs transition hover:shadow-md sm:flex-row sm:items-center"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-xl text-white shadow-sm">
                        🩺
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-slate-900">{b.title}</h3>
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-bold text-blue-800">
                            Custom Room
                          </span>
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                            ● {b.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-600">
                          {b.faculty} · {b.topic} · {b.questionCount} questions · {b.secondsPerQuestion}s each
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                          <span>👥 {b.players.length}/20 joined</span>
                          <span>👑 Host: {b.host}</span>
                          <span className="font-mono font-bold text-blue-700">Code: {b.code}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleJoinSeedOrCustom(b.code)}
                      className="shrink-0 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-700 transition"
                    >
                      Join Battle
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Public Seed Battles List matching Image 2 */}
            <div className="space-y-3">
              {filteredBattles.map((b) => {
                return (
                  <div
                    key={b.code}
                    className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition hover:border-blue-200 hover:shadow-md sm:flex-row sm:items-center"
                  >
                    {/* Left: Icon + Details */}
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${b.iconBg} ${b.iconColor} text-xl shadow-xs`}
                      >
                        {b.iconType === "heart" && "❤️"}
                        {b.iconType === "pill" && "💊"}
                        {b.iconType === "surgery" && "🩺"}
                        {b.iconType === "baby" && "🧸"}
                        {b.iconType === "microscope" && "🔬"}
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-slate-900">{b.title}</h3>
                          {b.status === "live" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              LIVE
                            </span>
                          ) : (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                              IN WAITING
                            </span>
                          )}
                        </div>

                        <p className="mt-1 text-xs text-slate-500 line-clamp-1">
                          {b.subtitle}
                        </p>

                        {/* Badges / Meta row */}
                        <div className="mt-2.5 flex flex-wrap items-center gap-2.5 text-xs text-slate-500">
                          <span
                            className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${b.badgeBg} ${b.badgeText}`}
                          >
                            {b.topic}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            👥 {b.playersCount}/{b.maxPlayers}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            ⏱ {b.duration}
                          </span>
                          <span className="inline-flex items-center gap-1 text-slate-600 font-medium">
                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-200 text-[9px]">
                              👨‍⚕️
                            </span>
                            Hosted by {b.hostName}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Join Action */}
                    <div className="shrink-0 sm:text-right">
                      <button
                        onClick={() => handleJoinSeedOrCustom(b.code, b)}
                        className="w-full rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-700 transition sm:w-auto"
                      >
                        Join Battle
                      </button>
                    </div>
                  </div>
                );
              })}

              {filteredBattles.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
                  <p className="text-base font-semibold">No battles found for this filter</p>
                  <p className="mt-1 text-xs">Try selecting &apos;All Topics&apos; or clear the search query.</p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN (4 COLS): "Create Battle" Panel (Matches Image 2 Exactly!) */}
          <div className="lg:col-span-4">
            <div className="sticky top-20 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
              {/* Header */}
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 text-lg">
                  🛡️
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Create Battle</h2>
                  <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">
                    Set up a new MCQ battle and invite your peers to join. Choose topic, timer, question count and live chat mode.
                  </p>
                </div>
              </div>

              {formSuccess && (
                <div className="mt-4 rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-800">
                  {formSuccess}
                </div>
              )}

              {/* Create Battle Form */}
              <form onSubmit={handleCreateBattle} className="mt-5 space-y-4 text-xs">
                {/* Battle Title */}
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Battle Title
                  </label>
                  <input
                    type="text"
                    value={createTitle}
                    onChange={(e) => setCreateTitle(e.target.value)}
                    placeholder="e.g. Cardiology Masters Challenge"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
                  />
                </div>

                {/* Topic Dropdown */}
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Topic
                  </label>
                  <select
                    value={createTopic}
                    onChange={(e) => setCreateTopic(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-500"
                  >
                    <option value="Cardiology">Cardiology</option>
                    <option value="Anatomy">Anatomy</option>
                    <option value="Surgery">Surgery</option>
                    <option value="Paediatrics">Paediatrics</option>
                    <option value="Obstetrics & Gynaecology">Obstetrics & Gynaecology</option>
                    <option value="Pharmacology">Pharmacology</option>
                    <option value="Pathology">Pathology</option>
                    <option value="Radiology">Radiology</option>
                    <option value="Internal Medicine">Internal Medicine</option>
                  </select>
                </div>

                {/* Description (optional) */}
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Description (optional)
                  </label>
                  <textarea
                    rows={2}
                    value={createDescription}
                    onChange={(e) => setCreateDescription(e.target.value)}
                    placeholder="Quick notes about what this battle will cover..."
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
                  />
                </div>

                {/* Battle Settings Sub-heading */}
                <div className="pt-2 border-t border-slate-100">
                  <span className="block font-bold text-slate-900 text-xs mb-2">
                    Battle Settings
                  </span>

                  {/* Question Count & Time Per Question */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        Questions
                      </label>
                      <select
                        value={createQuestionCount}
                        onChange={(e) => setCreateQuestionCount(Number(e.target.value))}
                        className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs"
                      >
                        <option value={10}>10 questions</option>
                        <option value={15}>15 questions</option>
                        <option value={20}>20 questions</option>
                        <option value={30}>30 questions</option>
                        <option value={40}>40 questions</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        Time per question
                      </label>
                      <select
                        value={createSeconds}
                        onChange={(e) => setCreateSeconds(Number(e.target.value))}
                        className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs"
                      >
                        <option value={20}>20 seconds</option>
                        <option value={30}>30 seconds</option>
                        <option value={40}>40 seconds</option>
                        <option value={60}>60 seconds</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Visibility */}
                <div>
                  <span className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Visibility
                  </span>
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="visibility"
                        checked={createVisibility === "public"}
                        onChange={() => setCreateVisibility("public")}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-slate-700 font-medium">Public (anyone can join)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="visibility"
                        checked={createVisibility === "private"}
                        onChange={() => setCreateVisibility("private")}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-slate-700 font-medium">Private (code only)</span>
                    </label>
                  </div>
                </div>

                {/* Start Mode */}
                <div>
                  <span className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Start Mode
                  </span>
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="startMode"
                        checked={createStartMode === "now"}
                        onChange={() => setCreateStartMode("now")}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-slate-700 font-medium">Start immediately</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="startMode"
                        checked={createStartMode === "later"}
                        onChange={() => setCreateStartMode("later")}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-slate-700 font-medium">Schedule for later</span>
                    </label>
                  </div>
                  {createStartMode === "later" && (
                    <input
                      type="datetime-local"
                      value={createScheduledFor}
                      onChange={(e) => setCreateScheduledFor(e.target.value)}
                      className="mt-2 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs text-slate-800"
                    />
                  )}
                </div>

                {/* Host Privileges & Toggles */}
                <div className="pt-2 border-t border-slate-100 space-y-2.5">
                  <span className="block font-bold text-slate-900 text-xs">
                    Host Privileges
                  </span>
                  
                  {/* Toggle 1: Live Chat */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-800">Allow public live chat</p>
                      <p className="text-[10px] text-slate-500">Up to 20 doctors can message in real-time</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAllowLiveChat(!allowLiveChat)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        allowLiveChat ? "bg-blue-600" : "bg-slate-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${
                          allowLiveChat ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Toggle 2: Host Controls */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-800">Host can kick / pause</p>
                      <p className="text-[10px] text-slate-500">Moderate players and session flow</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setHostCanKick(!hostCanKick)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        hostCanKick ? "bg-blue-600" : "bg-slate-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${
                          hostCanKick ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Select Questions Radio */}
                <div className="pt-2 border-t border-slate-100">
                  <span className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Select Questions
                  </span>
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="qSource"
                        checked={questionSource === "bank"}
                        onChange={() => setQuestionSource("bank")}
                        className="text-blue-600"
                      />
                      <span className="text-slate-700">Medscope Question Bank (high-yield)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="qSource"
                        checked={questionSource === "custom"}
                        onChange={() => setQuestionSource("custom")}
                        className="text-slate-400"
                      />
                      <span className="text-slate-500">Custom questions pool</span>
                    </label>
                  </div>
                </div>

                {/* Action Button: Create Battle */}
                <button
                  type="submit"
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-md hover:bg-blue-700 active:scale-[0.99] transition"
                >
                  <span>⚔️</span>
                  <span>Create Battle</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ========================================================
     RENDER: WAITING ROOM PHASE (With Live 20-User Battle Chat)
     ======================================================== */
  if (phase === "waiting" && room) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 py-4">
        {/* Top Header Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800">
                <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                Battle Lobby · Code: {room.code}
              </span>
              <h1 className="mt-2 text-2xl font-extrabold text-slate-900">
                {room.title}
              </h1>
              <p className="mt-1 text-xs text-slate-500">
                {room.faculty} · {room.topic} · {room.questionCount} questions ·{" "}
                {room.secondsPerQuestion}s per question
              </p>
            </div>

            <button
              onClick={() => setPhase("lobby")}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              ← Leave Lobby
            </button>
          </div>
        </div>

        {/* 2-Column: Players Grid + Live Chat Panel */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-12 items-start">
          {/* Left: Players Arena */}
          <div className="space-y-4 md:col-span-7">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Share battle code with peers
              </span>
              <p className="mt-2 font-mono text-4xl font-extrabold tracking-widest text-blue-600">
                {room.code}
              </p>
              <p className="mt-3 text-xs text-slate-500">
                Up to 20 doctors can join this battle live. When everyone is ready, start the battle!
              </p>

              {/* Roster of Joined Doctors */}
              <div className="mt-6 text-left">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-slate-700">
                    Doctors in Room ({room.players.length}/20)
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-600">
                    ● Ready to Battle
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {room.players.map((p, idx) => (
                    <div
                      key={p.name}
                      className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50/80 px-3 py-2 text-xs font-semibold text-slate-800"
                    >
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-[10px] text-blue-800">
                        {idx + 1}
                      </span>
                      <span className="truncate">{p.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Controls */}
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const joined = joinRoom(
                      room.code,
                      BOT_NAMES[room.players.length % BOT_NAMES.length] || `Doctor ${room.players.length + 1}`
                    );
                    if (joined) setRoom({ ...joined });
                  }}
                  className="rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  + Add Simulated Doctor (Demo)
                </button>

                <button
                  type="button"
                  onClick={startLiveBattleNow}
                  className="rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 active:scale-[0.99] transition"
                >
                  ⚔️ Start Battle Now
                </button>
              </div>
            </div>
          </div>

          {/* Right: Live Battle Chat (Realtime WebSocket) */}
          <div className="md:col-span-5">
            <BattleChat
              roomCode={room.code}
              currentUserId={user.id}
              currentUserName={user.name || "Doctor"}
              isHost={room.host === user.name}
            />
          </div>
        </div>
      </div>
    );
  }

  /* ========================================================
     RENDER: LIVE GAME PHASE (Scoreboard + Questions + Live Chat)
     ======================================================== */
  if (phase === "game" && room && question) {
    const pct = (timeLeft / room.secondsPerQuestion) * 100;
    const sorted = [...room.players].sort((a, b) => b.score - a.score);

    return (
      <div className="mx-auto max-w-5xl space-y-4 py-2">
        {/* Game Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-blue-600 px-2 py-0.5 text-xs font-bold text-white">
                Battle Live
              </span>
              <h2 className="font-bold text-slate-900">{room.title}</h2>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              Question {qIndex + 1} of {room.questionCount} · {question.topic}
            </p>
          </div>

          {/* Digital Timer */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Time Left:</span>
            <div
              className={`rounded-xl px-4 py-1.5 font-mono text-xl font-extrabold ${
                timeLeft < 10
                  ? "bg-rose-100 text-rose-700 animate-pulse"
                  : "bg-blue-50 text-blue-700"
              }`}
            >
              {timeLeft < 10 ? `0${timeLeft}` : timeLeft}s
            </div>
          </div>
        </div>

        {/* Timer Bar */}
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className={`h-full transition-all duration-300 ${
              timeLeft < 10 ? "bg-rose-500" : "bg-blue-600"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* 2-Column: Question & Answers (Left) + Live Scoreboard & Chat (Right) */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
          {/* Left (7 cols): Question & 4 Answer Options */}
          <div className="space-y-4 lg:col-span-7">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <span className="rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">
                Clinical Question {qIndex + 1}
              </span>
              <p className="mt-4 text-base font-bold text-slate-900 sm:text-lg leading-relaxed">
                {question.text}
              </p>

              {/* 4 Options */}
              <div className="mt-6 space-y-3">
                {question.options.map((opt, i) => {
                  const letter = String.fromCharCode(65 + i);
                  const isCorrect = opt === question.correct;
                  const isPicked = selected === opt;

                  let btnStyle =
                    "border-slate-200 bg-white text-slate-900 hover:border-blue-300 hover:bg-blue-50/50";
                  let badgeStyle = "bg-slate-100 text-slate-700 font-bold";

                  if (revealed && isCorrect) {
                    btnStyle =
                      "border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold ring-2 ring-emerald-400";
                    badgeStyle = "bg-emerald-600 text-white font-bold";
                  } else if (revealed && isPicked && !isCorrect) {
                    btnStyle = "border-rose-400 bg-rose-50 text-rose-950";
                    badgeStyle = "bg-rose-600 text-white font-bold";
                  } else if (isPicked) {
                    btnStyle = "border-blue-600 bg-blue-50 text-blue-950 font-bold ring-2 ring-blue-500";
                    badgeStyle = "bg-blue-600 text-white font-bold";
                  }

                  return (
                    <button
                      key={opt}
                      type="button"
                      disabled={revealed}
                      onClick={() => answer(opt)}
                      className={`flex w-full items-center gap-3.5 rounded-xl border p-3.5 text-left transition duration-150 ${btnStyle}`}
                    >
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs ${badgeStyle}`}
                      >
                        {letter}
                      </div>
                      <span className="text-sm">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Feedback when revealed */}
              {revealed && (
                <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
                  <p className="font-bold text-blue-900">
                    {winner ? `⚡ ${winner} answered fastest (+2 pts)` : "⏱ Time Expired"}
                  </p>
                  <p className="mt-1 text-xs text-blue-950 leading-relaxed">
                    Correct Answer: <strong className="font-semibold">{question.correct}</strong>.{" "}
                    {question.explanation}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right (5 cols): Live Scoreboard & Live Chat */}
          <div className="space-y-4 lg:col-span-5">
            {/* Live Leaderboard */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Live Battle Rank
              </h3>
              <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 text-xs">
                {sorted.map((p, idx) => (
                  <div
                    key={p.name}
                    className={`flex items-center justify-between py-2 px-1 ${
                      p.name === user.name ? "bg-blue-50/70 font-bold text-blue-900 rounded-lg" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 text-slate-400">#{idx + 1}</span>
                      <span className="truncate max-w-[140px]">{p.name}</span>
                      {p.name === user.name && (
                        <span className="rounded bg-blue-600 px-1.5 py-0.2 text-[10px] text-white">
                          You
                        </span>
                      )}
                    </div>
                    <span className="font-mono font-bold text-blue-700">{p.score} pts</span>
                  </div>
                ))}
              </div>
            </div>

            {/* In-Game Live Chat */}
            <BattleChat
              roomCode={room.code}
              currentUserId={user.id}
              currentUserName={user.name || "Doctor"}
              isHost={room.host === user.name}
            />
          </div>
        </div>
      </div>
    );
  }

  /* ========================================================
     RENDER: RESULTS PHASE
     ======================================================== */
  if (phase === "results" && room) {
    const sorted = [...room.players].sort((a, b) => b.score - a.score);
    return (
      <div className="mx-auto max-w-2xl space-y-6 py-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-lg">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-3xl shadow-inner">
            🏆
          </div>
          <h1 className="mt-4 text-2xl font-black text-slate-900">Battle Complete</h1>
          <p className="mt-1 text-xs text-slate-500">{room.title}</p>

          <div className="mt-4 inline-block rounded-2xl bg-amber-50 border border-amber-200 px-6 py-3">
            <span className="block text-xs font-semibold text-amber-700">Winner</span>
            <span className="text-xl font-black text-amber-950">{sorted[0]?.name}</span>
          </div>

          {/* Full Rank Table */}
          <div className="mt-6 divide-y divide-slate-100 text-left text-xs">
            {sorted.map((p, i) => (
              <div key={p.name} className="flex items-center justify-between py-2.5">
                <span className="font-bold text-slate-500">#{i + 1}</span>
                <span className="font-semibold text-slate-900">{p.name}</span>
                <span className="text-slate-500">{p.correct} correct</span>
                <span className="font-mono font-bold text-blue-600">{p.score} pts</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => setPhase("lobby")}
            className="mt-6 rounded-xl bg-blue-600 px-8 py-3 text-sm font-bold text-white shadow-md hover:bg-blue-700 transition"
          >
            Back to Battle Room Hub
          </button>
        </div>
      </div>
    );
  }

  return null;
}
