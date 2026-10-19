"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useAuth } from "@/lib/auth";
import { DEPARTMENTS, EXAMS, Question, getQuestionsForTopic } from "@/lib/questions";
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
    iconColor: "text-rose-700",
    badgeBg: "bg-rose-50 border border-rose-200",
    badgeText: "text-rose-800",
    iconType: "heart",
    playersCount: 6,
    maxPlayers: 20,
    duration: "20 mins",
    hostName: "Dr. Sarah K.",
    status: "live",
    questionCount: 20,
    secondsPerQuestion: 40,
  },
  {
    code: "PHYS01",
    title: "Physiology High-Yield Battle",
    subtitle: "Resting membrane potentials, Frank-Starling law, GFR clearance & surfactant mechanics",
    topic: "Physiology",
    faculty: "Basic Medical Sciences",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-800",
    badgeBg: "bg-amber-50 border border-amber-200",
    badgeText: "text-amber-800",
    iconType: "pill",
    playersCount: 4,
    maxPlayers: 20,
    duration: "20 mins",
    hostName: "Dr. Kalu N.",
    status: "live",
    questionCount: 20,
    secondsPerQuestion: 40,
  },
  {
    code: "RAD02",
    title: "Radiography & Imaging Challenge",
    subtitle: "CXR silhouette signs, CT acute hemorrhage attenuation, MRI sequences & contrast pearls",
    topic: "Radiography",
    faculty: "Radiology",
    iconBg: "bg-burgundy-100",
    iconColor: "text-burgundy-700",
    badgeBg: "bg-burgundy-50 border border-burgundy-200",
    badgeText: "text-burgundy-800",
    iconType: "microscope",
    playersCount: 5,
    maxPlayers: 20,
    duration: "25 mins",
    hostName: "Dr. Bamidele T.",
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
    iconBg: "bg-burgundy-100",
    iconColor: "text-burgundy-800",
    badgeBg: "bg-burgundy-50 border border-burgundy-200",
    badgeText: "text-burgundy-800",
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
    iconColor: "text-emerald-700",
    badgeBg: "bg-emerald-50 border border-emerald-200",
    badgeText: "text-emerald-800",
    iconType: "surgery",
    playersCount: 7,
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
    iconColor: "text-purple-700",
    badgeBg: "bg-purple-50 border border-purple-200",
    badgeText: "text-purple-800",
    iconType: "baby",
    playersCount: 4,
    maxPlayers: 20,
    duration: "30 mins",
    hostName: "Dr. Emeka E.",
    status: "waiting",
    questionCount: 20,
    secondsPerQuestion: 40,
  },
];

const TOPIC_CHIPS = [
  "All Topics",
  "Physiology",
  "Radiography",
  "Cardiology",
  "Pharmacology",
  "Anatomy",
  "Surgery",
  "Paediatrics",
  "Pathology",
  "Obstetrics & Gynaecology",
  "Internal Medicine",
];

// Clinical ECG strip component for Cardiology questions
function ClinicalEcgStrip() {
  const [showHdVisual, setShowHdVisual] = useState(false);

  return (
    <div className="space-y-2">
      <div className="overflow-hidden rounded-xl border border-rose-300/60 bg-[#fff5f6] p-3 shadow-inner">
        <div className="flex items-center justify-between text-[10px] font-bold text-rose-800/90 mb-1.5">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-rose-600 animate-pulse" />
            Diagnostic ECG Reference · Leads II, III & aVF (Inferior ST Elevation)
          </span>
          <button
            type="button"
            onClick={() => setShowHdVisual(!showHdVisual)}
            className="rounded bg-rose-100 hover:bg-rose-200 text-rose-900 px-2 py-0.5 text-[9px] font-bold transition flex items-center gap-1"
          >
            <span>🔍</span>
            <span>{showHdVisual ? "Hide HD Reference" : "View HD Diagnostic Strip"}</span>
          </button>
        </div>

        {showHdVisual ? (
          <div className="overflow-hidden rounded-lg border border-burgundy-900 bg-burgundy-950 p-1">
            <Image
              src="/battle-live-arena.jpg"
              alt="High Definition Battle Arena Clinical Diagnostic"
              width={1024}
              height={765}
              unoptimized
              priority
              className="h-auto w-full object-cover rounded"
            />
          </div>
        ) : (
          <svg
            viewBox="0 0 600 135"
            className="h-auto w-full select-none"
            preserveAspectRatio="none"
          >
            <defs>
              <pattern
                id="ecg-small-grid-hd"
                width="6"
                height="6"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 6 0 L 0 0 0 6"
                  fill="none"
                  stroke="#fca5a5"
                  strokeWidth="0.45"
                  strokeOpacity="0.65"
                />
              </pattern>
              <pattern
                id="ecg-big-grid-hd"
                width="30"
                height="30"
                patternUnits="userSpaceOnUse"
              >
                <rect width="30" height="30" fill="url(#ecg-small-grid-hd)" />
                <path
                  d="M 30 0 L 0 0 0 30"
                  fill="none"
                  stroke="#f87171"
                  strokeWidth="0.95"
                  strokeOpacity="0.8"
                />
              </pattern>
            </defs>

            {/* Pink Grid Background */}
            <rect width="600" height="135" fill="url(#ecg-big-grid-hd)" />

            {/* Lead II Line */}
            <text x="8" y="26" fill="#881337" fontSize="12" fontWeight="bold">
              II
            </text>
            <path
              d="M 35 25 Q 48 25 55 21 Q 60 25 68 25 L 72 31 L 76 6 L 80 34 L 84 25 L 94 18 Q 110 16 128 25 L 165 25 M 175 25 Q 188 25 195 21 Q 200 25 208 25 L 212 31 L 216 6 L 220 34 L 224 25 L 234 18 Q 250 16 268 25 L 305 25 M 315 25 Q 328 25 335 21 Q 340 25 348 25 L 352 31 L 356 6 L 360 34 L 364 25 L 374 18 Q 390 16 408 25 L 445 25 M 455 25 Q 468 25 475 21 Q 480 25 488 25 L 492 31 L 496 6 L 500 34 L 504 25 L 514 18 Q 530 16 548 25 L 590 25"
              fill="none"
              stroke="#881337"
              strokeWidth="1.9"
            />

            {/* Lead III Line */}
            <text x="8" y="70" fill="#881337" fontSize="12" fontWeight="bold">
              III
            </text>
            <path
              d="M 35 69 Q 48 69 55 65 Q 60 69 68 69 L 72 75 L 76 50 L 80 78 L 84 69 L 94 62 Q 110 60 128 69 L 165 69 M 175 69 Q 188 69 195 65 Q 200 69 208 69 L 212 75 L 216 50 L 220 78 L 224 69 L 234 62 Q 250 60 268 69 L 305 69 M 315 69 Q 328 69 335 65 Q 340 69 348 69 L 352 75 L 356 50 L 360 78 L 364 69 L 374 62 Q 390 60 408 69 L 445 69 M 455 69 Q 468 69 475 65 Q 480 69 488 69 L 492 75 L 496 50 L 500 78 L 504 69 L 514 62 Q 530 60 548 69 L 590 69"
              fill="none"
              stroke="#9f1239"
              strokeWidth="1.9"
            />

            {/* Lead aVF Line */}
            <text x="8" y="114" fill="#881337" fontSize="11" fontWeight="bold">
              aVF
            </text>
            <path
              d="M 40 113 Q 53 113 60 109 Q 65 113 73 113 L 77 119 L 81 94 L 85 122 L 89 113 L 99 106 Q 115 104 133 113 L 170 113 M 180 113 Q 193 113 200 109 Q 205 113 213 113 L 217 119 L 221 94 L 225 122 L 229 113 L 239 106 Q 255 104 273 113 L 310 113 M 320 113 Q 333 113 340 109 Q 345 113 353 113 L 357 119 L 361 94 L 365 122 L 369 113 L 379 106 Q 395 104 413 113 L 450 113 M 460 113 Q 473 113 480 109 Q 485 113 493 113 L 497 119 L 501 94 L 505 122 L 509 113 L 519 106 Q 535 104 553 113 L 590 113"
              fill="none"
              stroke="#9f1239"
              strokeWidth="1.9"
            />
          </svg>
        )}
      </div>
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
  const [createTopic, setCreateTopic] = useState("Physiology");
  const [createDescription, setCreateDescription] = useState("");
  const [createExam, setCreateExam] = useState("NPMCN");
  const [createFaculty, setCreateFaculty] = useState("Basic Medical Sciences");
  const [createQuestionCount, setCreateQuestionCount] = useState(20);
  const [createSeconds, setCreateSeconds] = useState(40);
  const [createVisibility, setCreateVisibility] = useState<"public" | "private">("public");
  const [createStartMode, setCreateStartMode] = useState<"now" | "later">("now");
  const [createScheduledFor, setCreateScheduledFor] = useState("");
  const [allowLiveChat, setAllowLiveChat] = useState(true);
  const [hostCanKick, setHostCanKick] = useState(true);
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
  const [scheduledCountdown, setScheduledCountdown] = useState<string>("");

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

  const question = pool[qIndex] || pool[0];

  // Countdown timer in live game
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

  // Scheduled battle countdown timer (displays message: "Battle starts in...")
  useEffect(() => {
    if (phase !== "waiting" || !room) return;

    function updateScheduledTimer() {
      if (!room?.scheduledFor) {
        setScheduledCountdown("Waiting for host to start battle...");
        return;
      }
      const targetTime = new Date(room.scheduledFor).getTime();
      const now = Date.now();
      const diff = targetTime - now;

      if (diff <= 0) {
        setScheduledCountdown("Starting battle now...");
        startLiveBattleNow(room);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      const parts = [];
      if (hours > 0) parts.push(`${String(hours).padStart(2, "0")}h`);
      parts.push(`${String(mins).padStart(2, "0")}m`);
      parts.push(`${String(secs).padStart(2, "0")}s`);

      setScheduledCountdown(parts.join(" : "));
    }

    updateScheduledTimer();
    const interval = setInterval(updateScheduledTimer, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, room?.scheduledFor]);

  // Sync remote room state over Supabase Realtime
  useEffect(() => {
    if (!room || phase === "results" || phase === "lobby") return;
    const unsub = subscribeRoom(room.code, (r) => {
      setRoom(r);
      if (r.status === "live" && phase === "waiting") {
        startLiveBattleNow(r);
      }
    });
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room?.code, phase]);

  // Dynamic question pool builder matching the room topic
  function buildPool(r: Room) {
    const rawQuestions = getQuestionsForTopic(
      r.topic,
      r.questionCount || 20,
      r.exam,
      r.faculty
    );
    return rawQuestions.map((q, i) => ({ ...q, id: i }));
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
    }, 1800);
  }

  function handleSelectOption(opt: string) {
    if (submitted || revealed) return;
    setSelected(opt);
  }

  // Once a user clicks submit answer and the answer is correct,
  // the next question immediately pops up and starts counting!
  function handleSubmitAnswer() {
    if (!room || revealed || !question || !selected || submitted) return;
    setSubmitted(true);
    const correct = selected === question.correct;

    const me =
      room.players.find((p) => p.name === (user?.name ?? "Doctor")) ||
      room.players[0];

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

    if (correct) {
      // Immediate advance: next question pops up and starts counting!
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
      }, 350);
    } else {
      // Wrong answer: reveal correct answer briefly then advance
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
      }, 2200);
    }
  }

  function handleCreateBattle(e: FormEvent) {
    e.preventDefault();
    setError("");
    setFormSuccess("");
    if (!createTitle.trim()) return setError("Please enter a battle title.");
    if (!createTopic.trim()) return setError("Please select or enter a topic.");

    const newCode = `MED-${generateCode().slice(0, 4)}`;
    const isScheduled = createStartMode === "later";

    const newRoom: Room = {
      code: newCode,
      kind: "battle",
      title: createTitle.trim(),
      topic: createTopic.trim(),
      exam: createExam || "NPMCN",
      faculty: createFaculty || "Basic Medical Sciences",
      questionCount: createQuestionCount,
      secondsPerQuestion: createSeconds,
      host: user?.name ?? "Doctor",
      players: [
        { name: user?.name ?? "Doctor", score: 0, answered: 0, correct: 0 },
      ],
      status: isScheduled ? "waiting" : "live",
      scheduledFor: isScheduled ? createScheduledFor : undefined,
      visibility: createVisibility,
      currentQuestion: 0,
      createdAt: Date.now(),
    };

    createRoom(newRoom);
    setRoom(newRoom);

    if (isScheduled) {
      setPhase("waiting");
    } else {
      startLiveBattleNow(newRoom);
    }
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
          { name: seedItem.hostName, score: 0, answered: 0, correct: 0 },
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

    const isScheduled =
      (joined.scheduledFor && new Date(joined.scheduledFor).getTime() > Date.now()) ||
      joined.status === "waiting";

    if (isScheduled) {
      setPhase("waiting");
    } else {
      startLiveBattleNow(joined);
    }
  }

  function startLiveBattleNow(existingRoom?: Room) {
    const current = existingRoom || room;
    if (!current) return;
    const p = buildPool(current);
    if (p.length === 0) {
      setError("No questions found for this topic pool.");
      return;
    }

    setPool(p);
    setQIndex(0); // Always start from Question 1!
    setSelected(null);
    setSubmitted(false);
    setRevealed(false);
    setWinner("");
    setTimeLeft(current.secondsPerQuestion);
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

  const copyRoomCode = () => {
    if (!room) return;
    navigator.clipboard?.writeText(room.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  /* ========================================================
     PHASE 1: LOBBY (Warm Burgundy & Cream Palette, No Blue)
     ======================================================== */
  if (phase === "lobby") {
    return (
      <div className="space-y-6 pb-12">
        {/* Top Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-burgundy-950 via-burgundy-900 to-burgundy-850 p-6 text-cream-50 shadow-xl sm:p-8 border border-burgundy-800/80">
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-burgundy-600/20 blur-3xl" />

          <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
            {/* Banner Left Info */}
            <div className="max-w-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-xl backdrop-blur-md shadow-inner border border-burgundy-700/60">
                  ⚔️
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl text-white">
                    Battle Room
                  </h1>
                </div>
              </div>
              <p className="mt-2 text-sm text-burgundy-100 sm:text-base leading-relaxed">
                Practice MCQ battles and compete live with doctors and peers.
                Test speed & diagnostic skills and climb the leaderboard.
              </p>

              {/* Stats badges */}
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-burgundy-800/70 border border-burgundy-700 px-3 py-1.5 backdrop-blur-md text-cream-100">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live Battles
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-burgundy-800/70 border border-burgundy-700 px-3 py-1.5 backdrop-blur-md text-cream-100">
                  📊 Real-time Leaderboard
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-burgundy-800/70 border border-burgundy-700 px-3 py-1.5 backdrop-blur-md text-cream-100">
                  ⚡ 2 Pts per Correct Recall
                </span>
              </div>
            </div>

            {/* Banner Right Graphic: Two Doctors Facing Off */}
            <div className="relative flex shrink-0 items-center justify-center gap-4 py-2">
              <div className="flex flex-col items-center">
                <div className="mb-1 rounded-lg bg-white/95 px-2 py-0.5 text-[11px] font-bold text-burgundy-950 shadow-sm animate-bounce">
                  Ready!
                </div>
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-amber-400/60 bg-gradient-to-tr from-burgundy-950 to-burgundy-800 shadow-lg">
                  <span className="text-2xl">👨‍⚕️</span>
                </div>
                <span className="mt-1 text-[11px] font-semibold text-burgundy-200">Doctor 1</span>
              </div>

              <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-burgundy-600 font-extrabold text-white shadow-[0_0_15px_rgba(245,158,11,0.4)] border border-amber-300/40">
                VS
              </div>

              <div className="flex flex-col items-center">
                <div className="mb-1 rounded-lg bg-white/95 px-2 py-0.5 text-[11px] font-bold text-burgundy-950 shadow-sm animate-bounce">
                  Let&apos;s go!
                </div>
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-amber-400/60 bg-gradient-to-tr from-burgundy-950 to-burgundy-800 shadow-lg">
                  <span className="text-2xl">👩‍⚕️</span>
                </div>
                <span className="mt-1 text-[11px] font-semibold text-burgundy-200">Doctor 2</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-burgundy-200/80 pb-2">
          <button
            onClick={() => setActiveTab("browse")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
              activeTab === "browse"
                ? "bg-burgundy-600 text-cream-50 shadow-sm"
                : "text-burgundy-900 hover:bg-burgundy-100/70 hover:text-burgundy-950"
            }`}
          >
            <span>🧭</span>
            <span>Browse</span>
          </button>
          <button
            onClick={() => setActiveTab("my-battles")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
              activeTab === "my-battles"
                ? "bg-burgundy-600 text-cream-50 shadow-sm"
                : "text-burgundy-900 hover:bg-burgundy-100/70 hover:text-burgundy-950"
            }`}
          >
            <span>📋</span>
            <span>My Battles</span>
          </button>
          <button
            onClick={() => setActiveTab("created-battles")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
              activeTab === "created-battles"
                ? "bg-burgundy-600 text-cream-50 shadow-sm"
                : "text-burgundy-900 hover:bg-burgundy-100/70 hover:text-burgundy-950"
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
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-burgundy-400">
                🔍
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search battles by topic or title..."
                className="w-full rounded-xl border border-burgundy-200 bg-white py-2.5 pl-10 pr-4 text-sm text-burgundy-950 shadow-xs outline-none focus:border-burgundy-600 focus:ring-2 focus:ring-burgundy-100"
              />
            </div>

            <div className="flex gap-2 sm:col-span-7 md:col-span-6">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="flex-1 rounded-xl border border-burgundy-200 bg-white px-3 py-2.5 text-xs font-medium text-burgundy-900 shadow-xs outline-none focus:border-burgundy-600"
              >
                <option value="all">Type: All</option>
                <option value="rapid">Speed Battle</option>
                <option value="timed">Standard MCQ</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex-1 rounded-xl border border-burgundy-200 bg-white px-3 py-2.5 text-xs font-medium text-burgundy-900 shadow-xs outline-none focus:border-burgundy-600"
              >
                <option value="all">Status: All</option>
                <option value="live">Live Now</option>
                <option value="waiting">In Waiting</option>
              </select>

              <select
                className="flex-1 rounded-xl border border-burgundy-200 bg-white px-3 py-2.5 text-xs font-medium text-burgundy-900 shadow-xs outline-none focus:border-burgundy-600"
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
                      ? "bg-burgundy-600 text-cream-50 shadow-xs"
                      : "border border-burgundy-200 bg-white text-burgundy-900 hover:border-burgundy-300 hover:bg-cream-100/60"
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
                <h2 className="text-lg font-bold text-burgundy-950">Public Battles</h2>
                <p className="text-xs text-burgundy-800/70">
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
                  className="w-28 rounded-lg border border-burgundy-200 bg-white px-2.5 py-1.5 text-xs font-bold uppercase tracking-wider text-burgundy-950 outline-none focus:border-burgundy-600"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-burgundy-600 px-3 py-1.5 text-xs font-semibold text-cream-50 hover:bg-burgundy-700 transition"
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
                    className="flex flex-col justify-between gap-4 rounded-2xl border border-burgundy-200 bg-burgundy-50/50 p-5 shadow-xs transition hover:shadow-md sm:flex-row sm:items-center"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-burgundy-600 text-xl text-cream-50 shadow-sm">
                        🩺
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-burgundy-950">{b.title}</h3>
                          <span className="rounded-full bg-burgundy-100 px-2 py-0.5 text-[11px] font-bold text-burgundy-800">
                            Custom Room
                          </span>
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                            ● {b.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-burgundy-800/80">
                          {b.faculty} · {b.topic} · {b.questionCount} questions · {b.secondsPerQuestion}s each
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-burgundy-800/70">
                          <span>👥 {b.players.length}/20 joined</span>
                          <span>👑 Host: {b.host}</span>
                          <span className="font-mono font-bold text-burgundy-700">Code: {b.code}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleJoinSeedOrCustom(b.code)}
                      className="shrink-0 rounded-xl bg-burgundy-600 px-5 py-2.5 text-sm font-bold text-cream-50 shadow-sm hover:bg-burgundy-700 transition"
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
                  className="flex flex-col justify-between gap-4 rounded-2xl border border-burgundy-100 bg-white p-5 shadow-xs transition hover:border-burgundy-300 hover:shadow-md sm:flex-row sm:items-center"
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
                        <h3 className="font-bold text-burgundy-950">{b.title}</h3>
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

                      <p className="mt-1 text-xs text-burgundy-800/80 line-clamp-1">
                        {b.subtitle}
                      </p>

                      <div className="mt-2.5 flex flex-wrap items-center gap-2.5 text-xs text-burgundy-800/70">
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
                        <span className="inline-flex items-center gap-1 text-burgundy-900 font-medium">
                          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-burgundy-100 text-[9px]">
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
                      className="w-full rounded-xl bg-burgundy-600 px-6 py-2.5 text-sm font-bold text-cream-50 shadow-sm hover:bg-burgundy-700 transition sm:w-auto"
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
            <div className="sticky top-20 rounded-2xl border border-burgundy-200/90 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-burgundy-50 text-burgundy-700 text-lg">
                  🛡️
                </div>
                <div>
                  <h2 className="text-base font-bold text-burgundy-950">Create Battle</h2>
                  <p className="mt-0.5 text-xs text-burgundy-800/70 leading-relaxed">
                    Set up a new MCQ battle with topic-specific questions and invite peers to join.
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
                  <label className="block font-semibold text-burgundy-950 mb-1">
                    Battle Title
                  </label>
                  <input
                    type="text"
                    value={createTitle}
                    onChange={(e) => setCreateTitle(e.target.value)}
                    placeholder="e.g. Physiology Battle Room"
                    className="w-full rounded-lg border border-burgundy-200 px-3 py-2 text-xs text-burgundy-950 outline-none focus:border-burgundy-600 focus:ring-1 focus:ring-burgundy-100"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-burgundy-950 mb-1">
                    Topic (Questions will populate dynamically for this topic)
                  </label>
                  <select
                    value={createTopic}
                    onChange={(e) => {
                      setCreateTopic(e.target.value);
                      if (e.target.value === "Physiology" || e.target.value === "Pharmacology") {
                        setCreateFaculty("Basic Medical Sciences");
                      } else if (e.target.value === "Radiography") {
                        setCreateFaculty("Radiology");
                      }
                    }}
                    className="w-full rounded-lg border border-burgundy-200 bg-white px-3 py-2 text-xs text-burgundy-950 outline-none focus:border-burgundy-600"
                  >
                    <option value="Physiology">Physiology</option>
                    <option value="Radiography">Radiography & Imaging</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Pharmacology">Pharmacology</option>
                    <option value="Anatomy">Anatomy</option>
                    <option value="Surgery">Surgery</option>
                    <option value="Paediatrics">Paediatrics</option>
                    <option value="Obstetrics & Gynaecology">Obstetrics & Gynaecology</option>
                    <option value="Pathology">Pathology</option>
                    <option value="Internal Medicine">Internal Medicine</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-burgundy-950 mb-1">
                    Description (optional)
                  </label>
                  <textarea
                    rows={2}
                    value={createDescription}
                    onChange={(e) => setCreateDescription(e.target.value)}
                    placeholder="Quick notes about what this battle will cover..."
                    className="w-full rounded-lg border border-burgundy-200 px-3 py-2 text-xs text-burgundy-950 outline-none focus:border-burgundy-600 focus:ring-1 focus:ring-burgundy-100"
                  />
                </div>

                <div className="pt-2 border-t border-burgundy-100">
                  <span className="block font-bold text-burgundy-950 text-xs mb-2">
                    Battle Settings
                  </span>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-burgundy-800/80 mb-1">
                        Questions
                      </label>
                      <select
                        value={createQuestionCount}
                        onChange={(e) => setCreateQuestionCount(Number(e.target.value))}
                        className="w-full rounded-lg border border-burgundy-200 bg-white px-2 py-1.5 text-xs text-burgundy-950"
                      >
                        <option value={10}>10 questions</option>
                        <option value={15}>15 questions</option>
                        <option value={20}>20 questions</option>
                        <option value={30}>30 questions</option>
                        <option value={40}>40 questions</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-burgundy-800/80 mb-1">
                        Time per question
                      </label>
                      <select
                        value={createSeconds}
                        onChange={(e) => setCreateSeconds(Number(e.target.value))}
                        className="w-full rounded-lg border border-burgundy-200 bg-white px-2 py-1.5 text-xs text-burgundy-950"
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
                  <span className="block text-[11px] font-semibold text-burgundy-950 mb-1">
                    Visibility
                  </span>
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="visibility"
                        checked={createVisibility === "public"}
                        onChange={() => setCreateVisibility("public")}
                        className="text-burgundy-600 focus:ring-burgundy-500"
                      />
                      <span className="text-burgundy-900 font-medium">Public (anyone can join)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="visibility"
                        checked={createVisibility === "private"}
                        onChange={() => setCreateVisibility("private")}
                        className="text-burgundy-600 focus:ring-burgundy-500"
                      />
                      <span className="text-burgundy-900 font-medium">Private (code only)</span>
                    </label>
                  </div>
                </div>

                <div>
                  <span className="block text-[11px] font-semibold text-burgundy-950 mb-1">
                    Start Mode
                  </span>
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="startMode"
                        checked={createStartMode === "now"}
                        onChange={() => setCreateStartMode("now")}
                        className="text-burgundy-600 focus:ring-burgundy-500"
                      />
                      <span className="text-burgundy-900 font-medium">Start immediately</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="startMode"
                        checked={createStartMode === "later"}
                        onChange={() => setCreateStartMode("later")}
                        className="text-burgundy-600 focus:ring-burgundy-500"
                      />
                      <span className="text-burgundy-900 font-medium">Schedule for later</span>
                    </label>
                  </div>
                  {createStartMode === "later" && (
                    <input
                      type="datetime-local"
                      value={createScheduledFor}
                      onChange={(e) => setCreateScheduledFor(e.target.value)}
                      className="mt-2 w-full rounded-lg border border-burgundy-200 px-2 py-1.5 text-xs text-burgundy-950"
                    />
                  )}
                </div>

                <div className="pt-2 border-t border-burgundy-100 space-y-2.5">
                  <span className="block font-bold text-burgundy-950 text-xs">
                    Host Privileges
                  </span>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-burgundy-950">Allow public live chat</p>
                      <p className="text-[10px] text-burgundy-800/70">Real-time room chat for all joined doctors</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAllowLiveChat(!allowLiveChat)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        allowLiveChat ? "bg-burgundy-600" : "bg-burgundy-200"
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
                      <p className="font-semibold text-burgundy-950">Host can kick / pause</p>
                      <p className="text-[10px] text-burgundy-800/70">Moderate participants and flow</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setHostCanKick(!hostCanKick)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        hostCanKick ? "bg-burgundy-600" : "bg-burgundy-200"
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
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-burgundy-600 py-3 text-sm font-bold text-cream-50 shadow-md hover:bg-burgundy-700 active:scale-[0.99] transition"
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
     PHASE 2: SCHEDULED BATTLE (WAITING FOR TIME TO START)
     Questions do not pop up; countdown message is shown!
     ======================================================== */
  if (phase === "waiting" && room) {
    const isHost = room.host === (user?.name ?? "Doctor");
    const scheduledDateFormatted = room.scheduledFor
      ? new Date(room.scheduledFor).toLocaleString(undefined, {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : null;

    return (
      <div className="-mx-4 -my-8 min-h-screen bg-gradient-to-b from-burgundy-950 via-[#220008] to-burgundy-950 text-cream-50 p-4 sm:p-6 lg:p-8 font-sans selection:bg-burgundy-600 selection:text-white">
        {/* Navigation Header */}
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-burgundy-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-burgundy-600 to-amber-600 text-white font-bold shadow-md shadow-burgundy-900/50">
              ✚
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white sm:text-xl">
                Medscope
              </span>
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-burgundy-300">
                <span>Learn</span>
                <span>›</span>
                <span>Practice</span>
                <span>›</span>
                <span className="text-amber-400 font-semibold">Scheduled Battle Waiting</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setPhase("lobby")}
              className="flex items-center gap-1.5 rounded-xl border border-burgundy-700/80 bg-burgundy-900/80 px-3.5 py-1.5 text-xs font-semibold text-burgundy-200 hover:border-burgundy-500 hover:text-white transition"
            >
              <span>←</span>
              <span>Back to Lobby</span>
            </button>

            {/* User Pill */}
            <div className="flex items-center gap-2 rounded-xl border border-burgundy-800 bg-burgundy-900/90 py-1 pl-1 pr-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-burgundy-700 text-xs font-bold text-cream-50">
                {user.name ? user.name[0] : "D"}
              </div>
              <span className="text-xs font-semibold text-cream-100">
                {user.name || "Doctor"}
              </span>
            </div>
          </div>
        </header>

        {/* 2-Column Scheduled Waiting Room */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
          {/* Main Waiting Card */}
          <div className="space-y-5 lg:col-span-7">
            <div className="rounded-3xl border border-burgundy-800/90 bg-[#36000e]/80 backdrop-blur-md p-6 sm:p-8 shadow-2xl text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/20 text-3xl shadow-inner border border-amber-500/40">
                ⏳
              </div>

              <div className="mt-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/40 px-3.5 py-1 text-xs font-bold text-amber-300 uppercase tracking-wider">
                  <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                  Scheduled Battle Session
                </span>
              </div>

              <h1 className="mt-3 text-2xl font-black text-white sm:text-3xl">
                {room.title}
              </h1>

              <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-xs text-burgundy-200">
                <span className="rounded-md bg-burgundy-800/80 px-2.5 py-1 font-semibold text-amber-300 border border-burgundy-700">
                  {room.topic}
                </span>
                <span>•</span>
                <span>{room.faculty}</span>
                <span>•</span>
                <span>{room.questionCount} Questions</span>
                <span>•</span>
                <span>{room.secondsPerQuestion}s per question</span>
              </div>

              {/* Big Scheduled Countdown Clock */}
              <div className="my-6 rounded-2xl border border-amber-500/30 bg-burgundy-950/70 p-6 shadow-inner">
                <p className="text-xs font-bold tracking-widest text-amber-400 uppercase">
                  Battle Starts In
                </p>
                <p className="mt-2 font-mono text-3xl sm:text-5xl font-black text-white tracking-wider">
                  {scheduledCountdown || "Waiting for countdown..."}
                </p>
                {scheduledDateFormatted && (
                  <p className="mt-2 text-xs text-burgundy-300">
                    Scheduled for {scheduledDateFormatted}
                  </p>
                )}
              </div>

              {/* Room Code Card */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-burgundy-800 bg-burgundy-900/60 p-4 text-left">
                <div>
                  <span className="text-[11px] font-semibold text-burgundy-300 block">
                    Invite colleagues to join this battle:
                  </span>
                  <span className="font-mono text-lg font-black tracking-widest text-amber-300">
                    {room.code}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={copyRoomCode}
                  className="rounded-xl bg-burgundy-800 hover:bg-burgundy-700 border border-burgundy-600 px-4 py-2 text-xs font-bold text-cream-50 transition"
                >
                  {copiedCode ? "✓ Code Copied!" : "📋 Copy Room Code"}
                </button>
              </div>

              {/* Host actions */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                {isHost && (
                  <button
                    type="button"
                    onClick={() => startLiveBattleNow()}
                    className="rounded-xl bg-gradient-to-r from-burgundy-600 via-burgundy-500 to-amber-600 hover:from-burgundy-500 hover:to-amber-500 px-6 py-3 text-sm font-black text-white shadow-lg transition active:scale-95"
                  >
                    ⚔️ Start Battle Now (Skip Wait)
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setPhase("lobby")}
                  className="rounded-xl border border-burgundy-700 bg-burgundy-900/90 px-5 py-3 text-sm font-bold text-burgundy-200 hover:text-white transition"
                >
                  Back to Hub
                </button>
              </div>
            </div>

            {/* Participants in Room */}
            <div className="rounded-2xl border border-burgundy-800/90 bg-[#36000e]/80 p-5 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-burgundy-800">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <span>👥</span>
                  <span>Joined Doctors ({room.players.length} / 20)</span>
                </h3>
                <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                  Ready
                </span>
              </div>

              <div className="mt-3 space-y-2">
                {room.players.map((p, idx) => (
                  <div
                    key={p.name}
                    className="flex items-center justify-between rounded-xl bg-burgundy-950/40 p-2.5 border border-burgundy-800/60"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-burgundy-800 text-xs font-bold text-cream-50">
                        {p.name.slice(0, 1)}
                      </div>
                      <span className="truncate text-xs font-semibold text-cream-100">
                        {p.name} {p.name === user.name && "(You)"}
                      </span>
                    </div>
                    {idx === 0 ? (
                      <span className="rounded bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                        Host
                      </span>
                    ) : (
                      <span className="text-[11px] font-mono text-emerald-400">
                        Connected
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Live Chat while Waiting */}
          <div className="lg:col-span-5">
            <BattleChat
              roomCode={room.code}
              currentUserId={user.id}
              currentUserName={user.name || "Doctor"}
              isHost={isHost}
            />
          </div>
        </div>
      </div>
    );
  }

  /* ========================================================
     PHASE 3: LIVE BATTLE ARENA (Active MCQ Game)
     Dynamic questions according to topic; instant advance on correct!
     ======================================================== */
  if (phase === "game" && room) {
    const currentQuestionDisplay = question || {
      text: `Clinical case in ${room.topic}: select the most appropriate diagnosis or management.`,
      topic: room.topic,
      faculty: room.faculty,
      options: ["Option A", "Option B", "Option C", "Option D"],
      correct: "Option A",
      explanation: "Targeted clinical diagnostic approach provides optimal management.",
    };

    const pct = (timeLeft / room.secondsPerQuestion) * 100;
    const sortedLeaderboard = [...room.players].sort((a, b) => b.score - a.score);

    const isCardioTopic =
      room.topic.toLowerCase().includes("cardio") ||
      currentQuestionDisplay.text.toLowerCase().includes("ecg") ||
      currentQuestionDisplay.text.toLowerCase().includes("lead");

    return (
      <div className="-mx-4 -my-8 min-h-screen bg-gradient-to-b from-burgundy-950 via-[#220008] to-burgundy-950 text-cream-50 p-4 sm:p-6 lg:p-8 font-sans selection:bg-burgundy-600 selection:text-white">
        
        {/* Arena Top Navigation Header */}
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-burgundy-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-burgundy-600 to-amber-600 text-white font-bold shadow-md shadow-burgundy-900/50">
              ✚
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white sm:text-xl">
                Medscope
              </span>
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-burgundy-300">
                <span>Learn</span>
                <span>›</span>
                <span>Practice</span>
                <span>›</span>
                <span className="text-amber-400 font-semibold">Battle Arena</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setPhase("lobby")}
              className="flex items-center gap-1.5 rounded-xl border border-burgundy-700/80 bg-burgundy-900/80 px-3.5 py-1.5 text-xs font-semibold text-burgundy-200 hover:border-burgundy-500 hover:text-white transition"
            >
              <span>←</span>
              <span>Back to Lobby</span>
            </button>

            {/* Notification Bell */}
            <div className="relative flex h-8 w-8 items-center justify-center rounded-xl border border-burgundy-800 bg-burgundy-900 text-burgundy-300">
              🔔
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-500" />
            </div>

            {/* User Pill */}
            <div className="flex items-center gap-2 rounded-xl border border-burgundy-800 bg-burgundy-900/90 py-1 pl-1 pr-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-burgundy-700 text-xs font-bold text-cream-50">
                {user.name ? user.name[0] : "D"}
              </div>
              <span className="text-xs font-semibold text-cream-100">
                {user.name || "Doctor"}
              </span>
            </div>
          </div>
        </header>

        {/* 3-COLUMN LIVE COMMAND CENTER ARENA */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 items-start">
          
          {/* COLUMN 1: LEFT SIDEBAR (Room Info & Leaderboard) */}
          <div className="space-y-4 lg:col-span-3">
            
            {/* Room Info Card */}
            <div className="rounded-2xl border border-burgundy-800/90 bg-[#36000e]/80 backdrop-blur-md p-5 shadow-xl">
              <button
                onClick={() => setPhase("lobby")}
                className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-burgundy-300 hover:text-amber-300 transition"
              >
                <span>←</span>
                <span>Back to Rooms</span>
              </button>

              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-burgundy-600 to-amber-600 text-white font-bold text-xl shadow-lg shadow-burgundy-900/40">
                  🩺
                </div>
                <div>
                  <h2 className="font-extrabold text-white text-base leading-snug">
                    {room.title}
                  </h2>
                  <p className="mt-0.5 text-xs text-burgundy-300">
                    Live MCQ Showdown
                  </p>
                </div>
              </div>

              {/* Status Pill */}
              <div className="mt-3.5 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-0.5 text-[11px] font-bold text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE
                </span>
                <span className="text-[11px] font-semibold text-amber-300">
                  {room.topic}
                </span>
              </div>

              {/* Metadata List */}
              <div className="mt-5 space-y-3 border-t border-burgundy-800/80 pt-4 text-xs">
                {/* Room Code */}
                <div className="flex items-center justify-between">
                  <span className="text-burgundy-300">🏷️ Room Code:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold tracking-wider text-amber-300">
                      {room.code}
                    </span>
                    <button
                      onClick={copyRoomCode}
                      className="rounded p-1 text-burgundy-300 hover:bg-burgundy-800 hover:text-white"
                      title="Copy code"
                    >
                      {copiedCode ? "✓" : "📋"}
                    </button>
                  </div>
                </div>

                {/* Players */}
                <div className="flex items-center justify-between">
                  <span className="text-burgundy-300">👥 Players:</span>
                  <span className="font-bold text-cream-100">
                    {room.players.length} / 20
                  </span>
                </div>

                {/* Time per Question */}
                <div className="flex items-center justify-between">
                  <span className="text-burgundy-300">⏱️ Time per question:</span>
                  <span className="font-bold text-cream-100">
                    {room.secondsPerQuestion} Seconds
                  </span>
                </div>

                {/* Total Questions */}
                <div className="flex items-center justify-between">
                  <span className="text-burgundy-300">❓ Total Questions:</span>
                  <span className="font-bold text-cream-100">
                    {room.questionCount}
                  </span>
                </div>
              </div>
            </div>

            {/* Leaderboard Card */}
            <div className="rounded-2xl border border-burgundy-800/90 bg-[#36000e]/80 p-5 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-burgundy-800/80">
                <div className="flex items-center gap-2">
                  <span className="text-base">🏆</span>
                  <h3 className="font-bold text-sm text-white">Leaderboard</h3>
                </div>
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                  Live Pts
                </span>
              </div>

              {/* Leaderboard List */}
              <div className="mt-3 space-y-2.5 max-h-72 overflow-y-auto pr-1 scrollbar-none">
                {sortedLeaderboard.map((p, idx) => {
                  let badge = (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-burgundy-950 text-[10px] font-bold text-burgundy-300">
                      {idx + 1}
                    </span>
                  );
                  if (idx === 0) badge = <span className="text-sm">🥇</span>;
                  if (idx === 1) badge = <span className="text-sm">🥈</span>;
                  if (idx === 2) badge = <span className="text-sm">🥉</span>;

                  const isMe = p.name === (user?.name ?? "Doctor");

                  return (
                    <div
                      key={p.name}
                      className={`flex items-center justify-between rounded-xl px-2.5 py-1.5 transition ${
                        isMe
                          ? "bg-amber-500/15 border border-amber-500/40 text-amber-200 font-bold"
                          : "text-cream-100 hover:bg-burgundy-900/50"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {badge}
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-burgundy-800 text-[11px] font-semibold text-cream-100">
                          {p.name.slice(0, 1)}
                        </div>
                        <span className="truncate text-xs font-medium">
                          {p.name} {isMe && "(You)"}
                        </span>
                      </div>
                      <span className="font-mono text-xs font-bold text-amber-400 shrink-0">
                        {p.score} pts
                      </span>
                    </div>
                  );
                })}
              </div>

              {room.players.length === 1 && (
                <p className="mt-3 text-[11px] text-burgundy-300 text-center">
                  Share code <strong className="text-amber-300">{room.code}</strong> to battle peers!
                </p>
              )}
            </div>
          </div>

          {/* COLUMN 2: CENTER ARENA (HUD, Question, ECG if cardio, Options, Submit) */}
          <div className="space-y-4 lg:col-span-6">
            
            {/* Top HUD Card: Question Counter + Progress Bar + Digital Timer */}
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-burgundy-800/90 bg-[#36000e]/80 p-4 shadow-xl">
              <span className="text-xs sm:text-sm font-bold text-cream-100 shrink-0">
                Question {String(qIndex + 1).padStart(2, "0")} / {room.questionCount}
              </span>

              {/* Amber / Burgundy Gradient Progress Bar */}
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-burgundy-950/90 shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-burgundy-500 transition-all duration-300 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                  style={{ width: `${pct}%` }}
                />
              </div>

              {/* Digital Stopwatch Timer Badge */}
              <div className="flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-950/40 px-3 py-1 font-mono text-xs sm:text-sm font-bold text-amber-300 shadow-inner shrink-0">
                <span>⏱</span>
                <span>00:{String(timeLeft).padStart(2, "0")}</span>
              </div>
            </div>

            {/* Main Question Box */}
            <div className="rounded-2xl border border-burgundy-800/90 bg-[#36000e]/80 p-6 shadow-2xl">
              {/* Category Pill */}
              <div className="mb-3.5">
                <span className="inline-block rounded-md bg-burgundy-800 border border-burgundy-700 px-3 py-1 text-[11px] font-extrabold tracking-wider text-amber-300 uppercase shadow-sm">
                  {currentQuestionDisplay.topic || room.topic}
                </span>
              </div>

              {/* Question Text */}
              <h1 className="text-base sm:text-lg md:text-xl font-bold leading-relaxed text-white">
                {currentQuestionDisplay.text}
              </h1>

              {/* Clinical ECG Strip (Rendered specifically for Cardiology cases) */}
              {isCardioTopic && (
                <div className="my-5">
                  <ClinicalEcgStrip />
                </div>
              )}

              {/* 4 Interactive Option Cards */}
              <div className="mt-5 space-y-3">
                {currentQuestionDisplay.options.map((opt, i) => {
                  const letter = String.fromCharCode(65 + i);
                  const isPicked = selected === opt;
                  const isCorrect = opt === currentQuestionDisplay.correct;

                  let cardStyle =
                    "border-burgundy-800/80 bg-burgundy-950/60 text-cream-100 hover:border-burgundy-600 hover:bg-burgundy-900/60";
                  let badgeStyle = "bg-burgundy-800 text-burgundy-200 font-bold";

                  if (revealed && isCorrect) {
                    cardStyle =
                      "border-emerald-500 bg-emerald-950/60 text-emerald-200 ring-2 ring-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]";
                    badgeStyle = "bg-emerald-500 text-slate-950 font-bold";
                  } else if (revealed && isPicked && !isCorrect) {
                    cardStyle =
                      "border-rose-500 bg-rose-950/60 text-rose-200 ring-2 ring-rose-500/50";
                    badgeStyle = "bg-rose-500 text-white font-bold";
                  } else if (isPicked) {
                    cardStyle =
                      "border-amber-400 bg-amber-950/50 text-amber-200 ring-2 ring-amber-400/50 shadow-[0_0_15px_rgba(245,158,11,0.25)]";
                    badgeStyle = "bg-amber-400 text-burgundy-950 font-bold";
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
                        ? "bg-gradient-to-r from-burgundy-600 via-burgundy-500 to-amber-600 hover:from-burgundy-500 hover:to-amber-500 text-white shadow-burgundy-900/50 cursor-pointer"
                        : "bg-burgundy-950/80 text-burgundy-600 border border-burgundy-900 cursor-not-allowed"
                    }`}
                  >
                    <span>✔</span>
                    <span>Submit Answer</span>
                  </button>
                ) : (
                  <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-3.5 text-center">
                    <p className="text-xs font-bold text-emerald-400">
                      ✓ Answer Submitted!
                    </p>
                  </div>
                )}

                <p className="mt-2.5 text-center text-[11px] font-medium text-burgundy-300">
                  ⚡ Correct answers advance immediately (+2 pts)!
                </p>
              </div>

              {/* Feedback when revealed */}
              {revealed && (
                <div className="mt-4 rounded-xl border border-amber-500/30 bg-burgundy-950/80 p-4">
                  <p className="text-sm font-bold text-amber-300">
                    {winner ? `⚡ ${winner} was fastest (+2 pts)` : "⏱ Time Expired"}
                  </p>
                  <p className="mt-1 text-xs text-cream-100 leading-relaxed">
                    Correct Answer: <strong className="font-semibold text-emerald-400">{currentQuestionDisplay.correct}</strong>.{" "}
                    {currentQuestionDisplay.explanation}
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Host / Moderator Strip */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-burgundy-800/90 bg-[#36000e]/80 p-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-burgundy-800 text-sm">
                  👑
                </div>
                <div>
                  <p className="text-xs font-bold text-white">
                    Host: {room.host || (user?.name ?? "Doctor")}
                  </p>
                  <p className="text-[11px] text-burgundy-300">
                    {room.players.length} {room.players.length === 1 ? "doctor" : "doctors"} in battle · Question {qIndex + 1} of {room.questionCount}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => endQuestion(null)}
                className="rounded-xl border border-burgundy-700 bg-burgundy-800/90 px-4 py-2 text-xs font-bold text-cream-100 hover:border-burgundy-500 hover:text-white transition"
              >
                Skip Question →
              </button>
            </div>
          </div>

          {/* COLUMN 3: RIGHT SIDEBAR (Room Participants & Realtime Chat) */}
          <div className="space-y-4 lg:col-span-3">
            
            {/* Room Participants Card (Genuine players only, no bots!) */}
            <div className="rounded-2xl border border-burgundy-800/90 bg-[#36000e]/80 p-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-burgundy-800/80">
                <div className="flex items-center gap-2">
                  <span className="text-sm">👥</span>
                  <h3 className="font-bold text-xs text-white">
                    Room Participants ({room.players.length})
                  </h3>
                </div>
                <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                  Online
                </span>
              </div>

              {/* Participants Avatars List */}
              <div className="mt-3 space-y-2 max-h-56 overflow-y-auto pr-1 scrollbar-none text-xs">
                {room.players.map((p, i) => (
                  <div
                    key={p.name}
                    className="flex items-center justify-between rounded-xl p-1.5 hover:bg-burgundy-900/50 transition"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-burgundy-700 to-burgundy-800 font-bold text-[11px] text-white border border-burgundy-600">
                        {p.name.slice(0, 1)}
                        <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 border border-[#36000e]" />
                      </div>
                      <span className="truncate font-medium text-cream-100">
                        {p.name} {p.name === user.name && "(You)"}
                      </span>
                    </div>

                    {i === 0 ? (
                      <span className="rounded bg-amber-500/20 border border-amber-500/40 px-1.5 py-0.5 text-[9px] font-bold text-amber-300">
                        Host
                      </span>
                    ) : (
                      <span className="text-[10px] text-emerald-400 font-mono">
                        Playing
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Live Realtime Battle Room Chat (Live Supabase Realtime, with Send button) */}
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
     PHASE 4: RESULTS PHASE
     ======================================================== */
  if (phase === "results" && room) {
    const sorted = [...room.players].sort((a, b) => b.score - a.score);
    return (
      <div className="-mx-4 -my-8 min-h-screen bg-gradient-to-b from-burgundy-950 via-[#220008] to-burgundy-950 text-cream-50 p-6 flex items-center justify-center">
        <div className="w-full max-w-xl rounded-3xl border border-burgundy-800 bg-[#36000e]/95 p-8 text-center shadow-2xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/20 text-3xl shadow-inner border border-amber-500/30">
            🏆
          </div>
          <h1 className="mt-4 text-2xl font-black text-white">Battle Showdown Complete</h1>
          <p className="mt-1 text-xs text-burgundy-300">{room.title}</p>

          <div className="mt-5 inline-block rounded-2xl bg-amber-500/10 border border-amber-500/30 px-6 py-3">
            <span className="block text-xs font-semibold text-amber-400">Winner</span>
            <span className="text-xl font-black text-white">{sorted[0]?.name || "Doctor"}</span>
          </div>

          <div className="mt-6 divide-y divide-burgundy-800/80 text-left text-xs">
            {sorted.map((p, i) => (
              <div key={p.name} className="flex items-center justify-between py-2.5">
                <span className="font-bold text-burgundy-300">#{i + 1}</span>
                <span className="font-semibold text-cream-100">{p.name}</span>
                <span className="text-burgundy-300">{p.correct} correct</span>
                <span className="font-mono font-bold text-amber-400">{p.score} pts</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => setPhase("lobby")}
            className="mt-6 rounded-xl bg-gradient-to-r from-burgundy-600 to-amber-600 px-8 py-3 text-sm font-bold text-white shadow-md hover:from-burgundy-500 hover:to-amber-500 transition"
          >
            Back to Battle Room Hub
          </button>
        </div>
      </div>
    );
  }

  return null;
}
