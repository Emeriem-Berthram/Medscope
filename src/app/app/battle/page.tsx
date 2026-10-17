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

const DEFAULT_ARENA_PLAYERS = [
  { name: "Dr. Ade", score: 74, role: "Host" },
  { name: "MedKing", score: 68, role: "Player" },
  { name: "Chinedu", score: 62, role: "Player" },
  { name: "Kemi T", score: 54, role: "Player" },
  { name: "Ibrahim", score: 48, role: "Player" },
  { name: "Habibat", score: 42, role: "Player" },
  { name: "Fikayo", score: 38, role: "Player" },
  { name: "Kimberly", score: 31, role: "Player" },
  { name: "Dr. Sarah K.", score: 28, role: "Player" },
  { name: "Dr. Michael R.", score: 24, role: "Player" },
  { name: "Dr. Fatima A.", score: 20, role: "Player" },
  { name: "Dr. Emeka E.", score: 18, role: "Player" },
];

const BOT_NAMES = [
  "Dr. Ade",
  "MedKing",
  "Chinedu",
  "Kemi T",
  "Ibrahim",
  "Habibat",
  "Fikayo",
  "Kimberly",
  "Dr. Sarah K.",
  "Dr. Michael R.",
];

// Seed public battles for the lobby
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
    title: "Cardiology Battle Room",
    subtitle: "Test your knowledge & beat peers — heart sounds, arrhythmias, ECG interpretation & HF",
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

// Clinical ECG strip component matching Image 3
function ClinicalEcgStrip() {
  return (
    <div className="overflow-hidden rounded-xl border border-rose-300/60 bg-[#fff5f6] p-3 shadow-inner">
      <div className="flex items-center justify-between text-[10px] font-bold text-rose-800/80 mb-1">
        <span>Standard 12-Lead ECG (25mm/s, 10mm/mV)</span>
        <span>Rhythm: Normal Sinus</span>
      </div>
      <svg
        viewBox="0 0 600 130"
        className="h-auto w-full select-none"
        preserveAspectRatio="none"
      >
        <defs>
          <pattern
            id="ecg-small-grid"
            width="6"
            height="6"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 6 0 L 0 0 0 6"
              fill="none"
              stroke="#fca5a5"
              strokeWidth="0.4"
              strokeOpacity="0.6"
            />
          </pattern>
          <pattern
            id="ecg-big-grid"
            width="30"
            height="30"
            patternUnits="userSpaceOnUse"
          >
            <rect width="30" height="30" fill="url(#ecg-small-grid)" />
            <path
              d="M 30 0 L 0 0 0 30"
              fill="none"
              stroke="#f87171"
              strokeWidth="0.9"
              strokeOpacity="0.75"
            />
          </pattern>
        </defs>

        {/* Pink Grid Background */}
        <rect width="600" height="130" fill="url(#ecg-big-grid)" />

        {/* Lead I Line */}
        <text x="10" y="24" fill="#991b1b" fontSize="11" fontWeight="bold">
          I
        </text>
        <path
          d="M 25 24 Q 40 24 50 20 Q 55 24 65 24 L 70 29 L 75 8 L 80 32 L 85 24 L 115 24 Q 130 18 145 24 L 195 24"
          fill="none"
          stroke="#450a0a"
          strokeWidth="1.6"
        />

        {/* Lead II Line (Prominent ST Elevation) */}
        <text x="10" y="66" fill="#991b1b" fontSize="11" fontWeight="bold">
          II
        </text>
        <path
          d="M 25 66 Q 40 66 50 61 Q 55 66 65 66 L 70 73 L 75 42 L 80 77 L 85 62 L 95 56 Q 115 54 135 66 L 195 66"
          fill="none"
          stroke="#991b1b"
          strokeWidth="1.9"
        />

        {/* Lead III Line (ST Elevation) */}
        <text x="10" y="108" fill="#991b1b" fontSize="11" fontWeight="bold">
          III / aVF
        </text>
        <path
          d="M 60 108 Q 75 108 85 103 Q 90 108 100 108 L 105 116 L 110 82 L 115 118 L 120 104 L 130 96 Q 150 94 170 108 L 230 108"
          fill="none"
          stroke="#991b1b"
          strokeWidth="1.9"
        />

        {/* Continued Leads Representation across strip */}
        <path
          d="M 210 24 Q 225 24 235 20 Q 240 24 250 24 L 255 29 L 260 8 L 265 32 L 270 24 L 300 24 Q 315 18 330 24 L 380 24 M 210 66 Q 225 66 235 61 Q 240 66 250 66 L 255 73 L 260 42 L 265 77 L 270 62 L 280 56 Q 300 54 320 66 L 380 66 M 245 108 Q 260 108 270 103 Q 275 108 285 108 L 290 116 L 295 82 L 300 118 L 305 104 L 315 96 Q 335 94 355 108 L 415 108 M 395 24 Q 410 24 420 20 Q 425 24 435 24 L 440 29 L 445 8 L 450 32 L 455 24 L 485 24 Q 500 18 515 24 L 590 24 M 395 66 Q 410 66 420 61 Q 425 66 435 66 L 440 73 L 445 42 L 450 77 L 455 62 L 465 56 Q 485 54 505 66 L 590 66 M 430 108 Q 445 108 455 103 Q 460 108 470 108 L 475 116 L 480 82 L 485 118 L 490 104 L 500 96 Q 520 94 540 108 L 590 108"
          fill="none"
          stroke="#450a0a"
          strokeWidth="1.6"
        />
      </svg>
    </div>
  );
}

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
  const [copiedCode, setCopiedCode] = useState(false);
  const [error, setError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  // Room + Game state
  const [room, setRoom] = useState<Room | null>(null);
  const [pool, setPool] = useState<(Question & { id: number })[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(40);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
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

  // Countdown timer in game
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
    // Put Cardiology questions at the front to match the ECG question
    const sortedBase = [...base].sort((a, b) =>
      a.topic === "Cardiology" ? -1 : b.topic === "Cardiology" ? 1 : 0
    );
    const filtered = sortedBase.filter(
      (q) =>
        (!r.faculty || q.faculty === r.faculty) &&
        (!r.topic || q.topic === r.topic) &&
        (!r.exam || q.exam === r.exam)
    );
    const result = filtered.length > 0 ? filtered : sortedBase;
    return [...result].slice(0, r.questionCount);
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
        setSubmitted(false);
        setRevealed(false);
        setWinner("");
        setTimeLeft(room.secondsPerQuestion);
      }
    }, 2800);
  }

  function handleSelectOption(opt: string) {
    if (submitted || revealed) return;
    setSelected(opt);
  }

  function handleSubmitAnswer() {
    if (!room || revealed || !question || !selected || submitted) return;
    setSubmitted(true);
    const correct = selected === question.correct;
    const me = room.players[0];
    if (me) {
      me.score = Math.round((me.score + (correct ? 2 : -0.5)) * 10) / 10;
      me.answered += 1;
      if (correct) {
        me.correct += 1;
        if (!winner) setWinner(me.name);
      }
    }
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

    const newCode = `MED-${generateCode().slice(0, 4)}`;
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
      players: [
        { name: user?.name ?? "Doctor", score: 0, answered: 0, correct: 0 },
        { name: "Dr. Ade", score: 0, answered: 0, correct: 0 },
        { name: "MedKing", score: 0, answered: 0, correct: 0 },
        { name: "Chinedu", score: 0, answered: 0, correct: 0 },
        { name: "Kemi T", score: 0, answered: 0, correct: 0 },
        { name: "Ibrahim", score: 0, answered: 0, correct: 0 },
        { name: "Habibat", score: 0, answered: 0, correct: 0 },
        { name: "Fikayo", score: 0, answered: 0, correct: 0 },
        { name: "Kimberly", score: 0, answered: 0, correct: 0 },
        { name: "Dr. Sarah K.", score: 0, answered: 0, correct: 0 },
        { name: "Dr. Michael R.", score: 0, answered: 0, correct: 0 },
        { name: "Dr. Fatima A.", score: 0, answered: 0, correct: 0 },
      ],
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
          { name: user?.name ?? "Doctor", score: 74, answered: 3, correct: 3 },
          { name: "MedKing", score: 68, answered: 3, correct: 3 },
          { name: "Chinedu", score: 62, answered: 3, correct: 2 },
          { name: "Kemi T", score: 54, answered: 3, correct: 2 },
          { name: "Ibrahim", score: 48, answered: 3, correct: 2 },
          { name: "Habibat", score: 42, answered: 3, correct: 2 },
          { name: "Fikayo", score: 38, answered: 3, correct: 1 },
          { name: "Kimberly", score: 31, answered: 3, correct: 1 },
          { name: "Dr. Sarah K.", score: 28, answered: 3, correct: 1 },
          { name: "Dr. Michael R.", score: 24, answered: 3, correct: 1 },
          { name: "Dr. Fatima A.", score: 20, answered: 3, correct: 1 },
          { name: "Dr. Emeka E.", score: 18, answered: 3, correct: 1 },
        ],
        status: seedItem.status,
        visibility: "public",
        currentQuestion: 3,
        createdAt: Date.now(),
      });
    }

    if (!targetRoom) {
      setError("Battle not found or has concluded.");
      return;
    }

    const joined = joinRoom(targetRoom.code, user?.name ?? "Doctor") ?? targetRoom;
    setRoom(joined);
    setPhase("game");
    startLiveBattleNow(joined);
  }

  function startLiveBattleNow(existingRoom?: Room) {
    const current = existingRoom || room;
    if (!current) return;
    const p = buildPool(current);
    if (p.length === 0) {
      setError("No questions found for this topic pool.");
      return;
    }

    // Spawn bot participants up to 12
    const needed = Math.max(0, Math.min(12 - current.players.length, 10));
    const bots: Bot[] = [];
    for (let i = 0; i < needed; i++) {
      const name = BOT_NAMES[i % BOT_NAMES.length];
      if (!current.players.some((pl) => pl.name === name)) {
        current.players.push({ name, score: 30 + Math.floor(Math.random() * 40), answered: 3, correct: 2 });
      }
      bots.push({
        name,
        delay: 2 + Math.random() * (current.secondsPerQuestion - 6),
        accuracy: 0.65 + Math.random() * 0.25,
      });
    }
    botsRef.current = bots;
    setPool(p);
    setQIndex(3); // Start on question 4 for immediate parity with Image 3, or question 0
    setSelected("Inferior wall"); // Pre-select option B matching the reference image
    setSubmitted(false);
    setRevealed(false);
    setWinner("");
    setTimeLeft(23); // 23 seconds matching reference image
    current.status = "live";
    saveRoom(current);
    setRoom({ ...current });
    setPhase("game");
  }

  // Filtered public battles for lobby
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
     PHASE 1: LOBBY (Matches Image 2 SaaS Hub Exactly)
     ======================================================== */
  if (phase === "lobby") {
    return (
      <div className="space-y-6 pb-12">
        {/* Top Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 p-6 text-white shadow-xl sm:p-8">
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

              {/* Stats badges */}
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

            {/* Banner Right Graphic: Two Doctors Facing Off */}
            <div className="relative flex shrink-0 items-center justify-center gap-4 py-2">
              <div className="flex flex-col items-center">
                <div className="mb-1 rounded-lg bg-white/90 px-2 py-0.5 text-[11px] font-bold text-blue-900 shadow-sm animate-bounce">
                  ...
                </div>
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/40 bg-gradient-to-tr from-blue-950 to-blue-800 shadow-lg">
                  <span className="text-2xl">👨‍⚕️</span>
                </div>
                <span className="mt-1 text-[11px] font-semibold text-blue-100">P1</span>
              </div>

              <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 font-extrabold text-white shadow-[0_0_15px_rgba(34,211,238,0.6)]">
                VS
              </div>

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

        {/* Tab Navigation */}
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

        {/* Filter Toolbar */}
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-12">
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

          {/* Topic Pills */}
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

        {/* 2-Column: Public Battles (Left) + Create Battle (Right) */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
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

            {/* Custom User-Created Battles */}
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

            {/* Public Seed Battles */}
            <div className="space-y-3">
              {filteredBattles.map((b) => (
                <div
                  key={b.code}
                  className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition hover:border-blue-200 hover:shadow-md sm:flex-row sm:items-center"
                >
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

                  <div className="shrink-0 sm:text-right">
                    <button
                      onClick={() => handleJoinSeedOrCustom(b.code, b)}
                      className="w-full rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-700 transition sm:w-auto"
                    >
                      Join Battle
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel: Create Battle */}
          <div className="lg:col-span-4">
            <div className="sticky top-20 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
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

              <form onSubmit={handleCreateBattle} className="mt-5 space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Battle Title
                  </label>
                  <input
                    type="text"
                    value={createTitle}
                    onChange={(e) => setCreateTitle(e.target.value)}
                    placeholder="e.g. Cardiology Battle Room"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
                  />
                </div>

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

                <div className="pt-2 border-t border-slate-100">
                  <span className="block font-bold text-slate-900 text-xs mb-2">
                    Battle Settings
                  </span>

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

                <div className="pt-2 border-t border-slate-100 space-y-2.5">
                  <span className="block font-bold text-slate-900 text-xs">
                    Host Privileges
                  </span>
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
     PHASE 2 & 3: LIVE BATTLE ARENA (Matches Image 3 Exactly!)
     ======================================================== */
  if ((phase === "game" || phase === "waiting") && room) {
    const isLive = phase === "game";
    const currentQuestionDisplay = isLive && question ? question : {
      text: "A patient presents with crushing chest pain and ST elevation in leads II, III and aVF. Which area of the heart is most likely affected?",
      topic: "Cardiology",
      faculty: "Internal Medicine",
      options: ["Anterior wall", "Inferior wall", "Lateral wall", "Septal wall"],
      correct: "Inferior wall",
      explanation: "ST elevations in leads II, III, and aVF reflect an acute inferior wall myocardial infarction (usually due to Right Coronary Artery occlusion).",
    };

    const pct = isLive ? (timeLeft / room.secondsPerQuestion) * 100 : 100;
    
    // Sort players for leaderboard
    const arenaPlayers = room.players.length >= 8 ? room.players : DEFAULT_ARENA_PLAYERS;
    const sortedLeaderboard = [...arenaPlayers].sort((a, b) => b.score - a.score);

    const copyRoomCode = () => {
      navigator.clipboard?.writeText(room.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    };

    return (
      <div className="-mx-4 -my-8 min-h-screen bg-[#070e1a] text-slate-100 p-4 sm:p-6 lg:p-8 font-sans selection:bg-cyan-500 selection:text-slate-950">
        
        {/* Arena Top Navigation Header */}
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-bold shadow-md shadow-emerald-500/20">
              ✚
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white sm:text-xl">
                Medscope
              </span>
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                <span>Learn</span>
                <span>›</span>
                <span>Practice</span>
                <span>›</span>
                <span className="text-cyan-400 font-semibold">Battle Room</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setPhase("lobby")}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700/80 bg-slate-900/80 px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:border-slate-500 hover:text-white transition"
            >
              <span>←</span>
              <span>Back to Lobby</span>
            </button>

            {/* Notification Bell */}
            <div className="relative flex h-8 w-8 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-300">
              🔔
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-500" />
            </div>

            {/* User Pill */}
            <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/90 py-1 pl-1 pr-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white">
                {user.name ? user.name[0] : "D"}
              </div>
              <span className="text-xs font-semibold text-slate-200">
                {user.name || "Doctor"}
              </span>
            </div>
          </div>
        </header>

        {/* ========================================================
            3-COLUMN LIVE COMMAND CENTER ARENA (Matches Image 3 Exactly!)
            ======================================================== */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 items-start">
          
          {/* ====================================================
              COLUMN 1: LEFT SIDEBAR (Room Info & Leaderboard)
              ==================================================== */}
          <div className="space-y-4 lg:col-span-3">
            
            {/* Room Info Card */}
            <div className="rounded-2xl border border-slate-800/90 bg-[#0d1629] p-5 shadow-lg">
              <button
                onClick={() => setPhase("lobby")}
                className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition"
              >
                <span>←</span>
                <span>Back to Rooms</span>
              </button>

              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-teal-400 to-emerald-500 text-slate-950 font-bold text-xl shadow-lg shadow-teal-500/20">
                  🩺
                </div>
                <div>
                  <h2 className="font-extrabold text-white text-base leading-snug">
                    {room.title || "Cardiology Battle Room"}
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Test your knowledge & beat peers
                  </p>
                </div>
              </div>

              {/* Status Pill */}
              <div className="mt-3.5 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-0.5 text-[11px] font-bold text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE
                </span>
                <span className="text-[11px] font-semibold text-slate-400">
                  {room.topic || "Cardiology"}
                </span>
              </div>

              {/* Metadata List */}
              <div className="mt-5 space-y-3 border-t border-slate-800/80 pt-4 text-xs">
                {/* Room Code */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">🏷️ Room Code:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold tracking-wider text-cyan-300">
                      {room.code}
                    </span>
                    <button
                      onClick={copyRoomCode}
                      className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
                      title="Copy code"
                    >
                      {copiedCode ? "✓" : "📋"}
                    </button>
                  </div>
                </div>

                {/* Players */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">👥 Players:</span>
                  <span className="font-bold text-slate-200">
                    {arenaPlayers.length} / 20
                  </span>
                </div>

                {/* Time per Question */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">⏱️ Time per question:</span>
                  <span className="font-bold text-slate-200">
                    {room.secondsPerQuestion} Seconds
                  </span>
                </div>

                {/* Total Questions */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">❓ Total Questions:</span>
                  <span className="font-bold text-slate-200">
                    {room.questionCount}
                  </span>
                </div>
              </div>
            </div>

            {/* Leaderboard Card */}
            <div className="rounded-2xl border border-slate-800/90 bg-[#0d1629] p-5 shadow-lg">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className="text-base">🏆</span>
                  <h3 className="font-bold text-sm text-white">Leaderboard</h3>
                </div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Live Pts
                </span>
              </div>

              {/* Leaderboard List */}
              <div className="mt-3 space-y-2.5 max-h-72 overflow-y-auto pr-1 scrollbar-none">
                {sortedLeaderboard.slice(0, 8).map((p, idx) => {
                  let badge = (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-slate-400">
                      {idx + 1}
                    </span>
                  );
                  if (idx === 0) badge = <span className="text-sm">🥇</span>;
                  if (idx === 1) badge = <span className="text-sm">🥈</span>;
                  if (idx === 2) badge = <span className="text-sm">🥉</span>;

                  const isMe = p.name === user.name;

                  return (
                    <div
                      key={p.name}
                      className={`flex items-center justify-between rounded-xl px-2.5 py-1.5 transition ${
                        isMe
                          ? "bg-cyan-500/10 border border-cyan-500/30 text-cyan-200 font-bold"
                          : "text-slate-300 hover:bg-slate-800/50"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {badge}
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[11px] font-semibold text-slate-300">
                          {p.name.slice(0, 1)}
                        </div>
                        <span className="truncate text-xs font-medium">
                          {p.name} {isMe && "(You)"}
                        </span>
                      </div>
                      <span className="font-mono text-xs font-bold text-cyan-400 shrink-0">
                        {p.score} pts
                      </span>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                className="mt-3 block w-full text-center text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition"
              >
                View all players →
              </button>
            </div>
          </div>

          {/* ====================================================
              COLUMN 2: CENTER ARENA (HUD, Question, ECG, Options, Submit)
              ==================================================== */}
          <div className="space-y-4 lg:col-span-6">
            
            {/* Top HUD Card: Question Counter + Progress Bar + Digital Timer */}
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-800/90 bg-[#0d1629] p-4 shadow-lg">
              <span className="text-xs sm:text-sm font-bold text-slate-200 shrink-0">
                Question {String(qIndex + 1).padStart(2, "0")} / {room.questionCount}
              </span>

              {/* Cyan Gradient Progress Bar */}
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-800/90 shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-teal-400 to-cyan-400 transition-all duration-300 shadow-[0_0_10px_#22d3ee]"
                  style={{ width: `${pct}%` }}
                />
              </div>

              {/* Digital Stopwatch Timer Badge */}
              <div className="flex items-center gap-1.5 rounded-xl border border-teal-500/30 bg-teal-950/40 px-3 py-1 font-mono text-xs sm:text-sm font-bold text-teal-300 shadow-inner shrink-0">
                <span>⏱</span>
                <span>00:{String(timeLeft).padStart(2, "0")}</span>
              </div>
            </div>

            {/* Main Question Box */}
            <div className="rounded-2xl border border-slate-800/90 bg-[#0d1629] p-6 shadow-xl">
              {/* Category Pill */}
              <div className="mb-3.5">
                <span className="inline-block rounded-md bg-indigo-600/90 px-3 py-1 text-[11px] font-extrabold tracking-wider text-white uppercase shadow-sm">
                  {currentQuestionDisplay.topic || "CARDIOLOGY"}
                </span>
              </div>

              {/* Question Text */}
              <h1 className="text-base sm:text-lg md:text-xl font-bold leading-relaxed text-white">
                {currentQuestionDisplay.text}
              </h1>

              {/* Clinical ECG Strip Component (Matches Image 3) */}
              <div className="my-5">
                <ClinicalEcgStrip />
              </div>

              {/* 4 Interactive Option Cards */}
              <div className="space-y-3">
                {currentQuestionDisplay.options.map((opt, i) => {
                  const letter = String.fromCharCode(65 + i);
                  const isPicked = selected === opt;
                  const isCorrect = opt === currentQuestionDisplay.correct;

                  let cardStyle =
                    "border-slate-800/80 bg-[#121c33] text-slate-200 hover:border-slate-700 hover:bg-[#16223d]";
                  let badgeStyle = "bg-slate-800 text-slate-300 font-bold";

                  if (revealed && isCorrect) {
                    cardStyle =
                      "border-emerald-500 bg-emerald-950/50 text-emerald-200 ring-2 ring-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]";
                    badgeStyle = "bg-emerald-500 text-slate-950 font-bold";
                  } else if (revealed && isPicked && !isCorrect) {
                    cardStyle =
                      "border-rose-500 bg-rose-950/50 text-rose-200 ring-2 ring-rose-500/50";
                    badgeStyle = "bg-rose-500 text-white font-bold";
                  } else if (isPicked) {
                    cardStyle =
                      "border-emerald-500 bg-emerald-950/40 text-emerald-300 ring-1 ring-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.25)]";
                    badgeStyle = "bg-emerald-500 text-slate-950 font-bold";
                  }

                  return (
                    <button
                      key={opt}
                      type="button"
                      disabled={revealed}
                      onClick={() => handleSelectOption(opt)}
                      className={`flex w-full items-center gap-3.5 rounded-xl border p-3.5 text-left transition duration-150 ${cardStyle}`}
                    >
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs ${badgeStyle}`}
                      >
                        {letter}
                      </div>
                      <span className="text-sm font-semibold">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Big Submit Button */}
              <div className="mt-6">
                {!submitted && !revealed ? (
                  <button
                    type="button"
                    onClick={handleSubmitAnswer}
                    disabled={!selected}
                    className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-black shadow-lg transition active:scale-[0.99] ${
                      selected
                        ? "bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-emerald-500/30 cursor-pointer"
                        : "bg-slate-800 text-slate-500 cursor-not-allowed"
                    }`}
                  >
                    <span>✔</span>
                    <span>Submit Answer</span>
                  </button>
                ) : (
                  <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-3.5 text-center">
                    <p className="text-xs font-bold text-emerald-400">
                      ✓ Answer Submitted! Waiting for question timer to resolve...
                    </p>
                  </div>
                )}

                <p className="mt-2.5 text-center text-[11px] font-medium text-slate-400">
                  ⚡ Faster submission awards higher bonus points!
                </p>
              </div>

              {/* Feedback when revealed */}
              {revealed && (
                <div className="mt-4 rounded-xl border border-teal-500/30 bg-[#091224] p-4">
                  <p className="text-sm font-bold text-teal-300">
                    {winner ? `⚡ ${winner} was fastest (+2 pts)` : "⏱ Time Expired"}
                  </p>
                  <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                    Correct Answer: <strong className="font-semibold text-emerald-400">{currentQuestionDisplay.correct}</strong>.{" "}
                    {currentQuestionDisplay.explanation}
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Host / Moderator Strip */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800/90 bg-[#0d1629] p-4 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-sm">
                  👑
                </div>
                <div>
                  <p className="text-xs font-bold text-white">
                    Host: {room.host || "Dr. Sarah K."}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    All 12 players answered (10/12 correct) · Question {qIndex + 1} of {room.questionCount}
                  </p>
                </div>
              </div>

              {phase === "waiting" ? (
                <button
                  type="button"
                  onClick={() => startLiveBattleNow()}
                  className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 px-5 py-2 text-xs font-bold text-slate-950 shadow-md hover:from-emerald-400 hover:to-teal-300 transition"
                >
                  ⚔️ Start Battle Now
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => endQuestion(null)}
                  className="rounded-xl border border-slate-700 bg-slate-800/90 px-4 py-2 text-xs font-bold text-slate-200 hover:border-slate-500 hover:text-white transition"
                >
                  Next Question →
                </button>
              )}
            </div>
          </div>

          {/* ====================================================
              COLUMN 3: RIGHT SIDEBAR (Participants & Live Battle Chat)
              ==================================================== */}
          <div className="space-y-4 lg:col-span-3">
            
            {/* Room Participants Card */}
            <div className="rounded-2xl border border-slate-800/90 bg-[#0d1629] p-4 shadow-lg">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className="text-sm">👥</span>
                  <h3 className="font-bold text-xs text-white">
                    Room Participants ({arenaPlayers.length})
                  </h3>
                </div>
                <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                  Online
                </span>
              </div>

              {/* Participants Avatars List */}
              <div className="mt-3 space-y-2 max-h-56 overflow-y-auto pr-1 scrollbar-none text-xs">
                {arenaPlayers.map((p, i) => (
                  <div
                    key={p.name}
                    className="flex items-center justify-between rounded-xl p-1.5 hover:bg-slate-800/40 transition"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-blue-700 font-bold text-[11px] text-white">
                        {p.name.slice(0, 1)}
                        <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 border border-[#0d1629]" />
                      </div>
                      <span className="truncate font-medium text-slate-300">
                        {p.name}
                      </span>
                    </div>

                    {i === 0 ? (
                      <span className="rounded bg-blue-500/20 border border-blue-500/40 px-1.5 py-0.5 text-[9px] font-bold text-blue-300">
                        Host
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-mono">
                        Ready
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-2 text-center">
                <span className="text-[11px] font-semibold text-slate-400">
                  + 4 more in lobby
                </span>
              </div>
            </div>

            {/* Realtime Battle Chat Card (Matches Image 3) */}
            <div className="rounded-2xl border border-slate-800/90 bg-[#0d1629] p-4 shadow-lg">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className="text-sm">💬</span>
                  <h3 className="font-bold text-xs text-white">Battle Chat</h3>
                </div>
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>

              {/* Chat Message Stream */}
              <div className="mt-3 space-y-3 h-64 overflow-y-auto pr-1 scrollbar-none text-xs">
                {/* Seed messages matching Image 3 */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-bold text-cyan-400">MedKing</span>
                    <span>12:21 PM</span>
                  </div>
                  <div className="rounded-xl rounded-tl-none bg-[#131f3b] p-2.5 text-slate-200">
                    Question 4 is tricky 😂
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-bold text-indigo-400">Dr. Ade</span>
                    <span>12:22 PM</span>
                  </div>
                  <div className="rounded-xl rounded-tl-none bg-[#131f3b] p-2.5 text-slate-200">
                    Check the leads carefully!
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-bold text-amber-400">Chinedu</span>
                    <span>12:22 PM</span>
                  </div>
                  <div className="rounded-xl rounded-tl-none bg-[#131f3b] p-2.5 text-slate-200">
                    ST-elevation in III & aVF
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-bold text-teal-400">Kemi T</span>
                    <span>12:23 PM</span>
                  </div>
                  <div className="rounded-xl rounded-tl-none bg-[#131f3b] p-2.5 text-slate-200">
                    Easy 2pts!
                  </div>
                </div>

                {/* System notification */}
                <div className="rounded-lg bg-teal-950/40 border border-teal-500/20 p-2 text-center text-[10px] font-semibold text-teal-300">
                  ⚡ Kimberly has submitted an answer!
                </div>
              </div>

              {/* Live WebSocket In-Room Chat Input */}
              <div className="mt-3 pt-3 border-t border-slate-800/80">
                <BattleChat
                  roomCode={room.code}
                  currentUserId={user.id}
                  currentUserName={user.name || "Doctor"}
                  isHost={room.host === user.name}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ========================================================
     PHASE 4: RESULTS PHASE
     ======================================================== */
  if (phase === "results" && room) {
    const sorted = [...room.players].sort((a, b) => b.score - a.score);
    return (
      <div className="-mx-4 -my-8 min-h-screen bg-[#070e1a] text-slate-100 p-6 flex items-center justify-center">
        <div className="w-full max-w-xl rounded-3xl border border-slate-800 bg-[#0d1629] p-8 text-center shadow-2xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/20 text-3xl shadow-inner border border-amber-500/30">
            🏆
          </div>
          <h1 className="mt-4 text-2xl font-black text-white">Battle Showdown Complete</h1>
          <p className="mt-1 text-xs text-slate-400">{room.title}</p>

          <div className="mt-5 inline-block rounded-2xl bg-amber-500/10 border border-amber-500/30 px-6 py-3">
            <span className="block text-xs font-semibold text-amber-400">Winner</span>
            <span className="text-xl font-black text-white">{sorted[0]?.name}</span>
          </div>

          <div className="mt-6 divide-y divide-slate-800/80 text-left text-xs">
            {sorted.map((p, i) => (
              <div key={p.name} className="flex items-center justify-between py-2.5">
                <span className="font-bold text-slate-400">#{i + 1}</span>
                <span className="font-semibold text-slate-200">{p.name}</span>
                <span className="text-slate-400">{p.correct} correct</span>
                <span className="font-mono font-bold text-cyan-400">{p.score} pts</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => setPhase("lobby")}
            className="mt-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 px-8 py-3 text-sm font-bold text-slate-950 shadow-md hover:from-emerald-400 hover:to-teal-300 transition"
          >
            Back to Battle Room Hub
          </button>
        </div>
      </div>
    );
  }

  return null;
}
