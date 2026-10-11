import { QUESTIONS, Question } from "./questions";

/* ---------- types ---------- */

export interface Attempt {
  questionId: number;
  correct: boolean;
  at: number;
}

interface UserData {
  bookmarks: number[];
  attempts: Attempt[];
  mocks: { score: number; total: number; at: number }[];
}

/* ---------- storage ---------- */

function key(userId: string): string {
  return `medscope_data_${userId}`;
}

function load(userId: string): UserData {
  try {
    const raw = localStorage.getItem(key(userId));
    if (raw) return JSON.parse(raw) as UserData;
  } catch {
    /* ignore */
  }
  return { bookmarks: [], attempts: [], mocks: [] };
}

function save(userId: string, data: UserData) {
  localStorage.setItem(key(userId), JSON.stringify(data));
}

/* ---------- bookmarks ---------- */

export function getBookmarks(userId: string): number[] {
  return load(userId).bookmarks;
}

export function isBookmarked(userId: string, questionId: number): boolean {
  return getBookmarks(userId).includes(questionId);
}

export function toggleBookmark(userId: string, questionId: number): number[] {
  const data = load(userId);
  data.bookmarks = data.bookmarks.includes(questionId)
    ? data.bookmarks.filter((id) => id !== questionId)
    : [...data.bookmarks, questionId];
  save(userId, data);
  return data.bookmarks;
}

/* ---------- attempts / performance ---------- */

export function recordAttempt(userId: string, questionId: number, correct: boolean) {
  const data = load(userId);
  data.attempts.push({ questionId, correct, at: Date.now() });
  save(userId, data);
}

export function getAttempts(userId: string): Attempt[] {
  return load(userId).attempts;
}

export function recordMock(userId: string, score: number, total: number) {
  const data = load(userId);
  data.mocks.push({ score, total, at: Date.now() });
  save(userId, data);
}

export function getMocks(userId: string): UserData["mocks"] {
  return load(userId).mocks;
}

export function accuracy(userId: string): number {
  const attempts = getAttempts(userId);
  if (!attempts.length) return 0;
  const correct = attempts.filter((a) => a.correct).length;
  return Math.round((correct / attempts.length) * 100);
}

/* ---------- weak areas ---------- */

export interface WeakArea {
  faculty: string;
  topic: string;
  attempted: number;
  correct: number;
  pct: number;
}

export function weakAreas(userId: string): WeakArea[] {
  const attempts = getAttempts(userId);
  const byTopic = new Map<string, { faculty: string; topic: string; attempted: number; correct: number }>();
  attempts.forEach((a) => {
    const q = QUESTIONS[a.questionId];
    if (!q) return;
    const k = `${q.faculty}|${q.topic}`;
    const entry = byTopic.get(k) ?? { faculty: q.faculty, topic: q.topic, attempted: 0, correct: 0 };
    entry.attempted += 1;
    if (a.correct) entry.correct += 1;
    byTopic.set(k, entry);
  });
  return [...byTopic.values()]
    .map((e) => ({ ...e, pct: Math.round((e.correct / e.attempted) * 100) }))
    .sort((a, b) => a.pct - b.pct);
}

/* ---------- search ---------- */

export function searchQuestions(query: {
  text?: string;
  exam?: string;
  faculty?: string;
  sub?: string;
}): (Question & { id: number })[] {
  return QUESTIONS.map((q, i) => ({ ...q, id: i })).filter((q) => {
    if (query.exam && q.exam !== query.exam) return false;
    if (query.faculty && q.faculty !== query.faculty) return false;
    if (query.sub && q.sub !== query.sub) return false;
    if (query.text) {
      const t = query.text.toLowerCase();
      const hay = `${q.text} ${q.options.join(" ")} ${q.explanation} ${q.topic} ${q.faculty} ${q.sub}`.toLowerCase();
      if (!hay.includes(t)) return false;
    }
    return true;
  });
}

/* ---------- leaderboard ---------- */

export interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  accuracy: number;
  mocks: number;
  isYou?: boolean;
}

const PEERS: [string, number, number, number][] = [
  ["Dr. Chidi Okafor", 94, 91, 22],
  ["Dr. Fatima Bello", 89, 87, 19],
  ["Dr. Emeka Nwosu", 86, 84, 17],
  ["Dr. Kemi Adeyemi", 82, 80, 15],
  ["Dr. Tunde Balogun", 78, 76, 14],
  ["Dr. Ngozi Eze", 74, 72, 12],
  ["Dr. Musa Ibrahim", 69, 67, 11],
  ["Dr. Adaobi Okonkwo", 63, 61, 9],
  ["Dr. Yusuf Abdullahi", 58, 55, 8],
];

export function leaderboard(userId: string, userName: string): LeaderboardEntry[] {
  const mocks = getMocks(userId);
  const myAccuracy = accuracy(userId);
  const myBest = mocks.length ? Math.max(...mocks.map((m) => Math.round((m.score / m.total) * 100))) : 0;
  const rows: [string, number, number, number][] = [
    ...PEERS,
    [userName || "You", myBest, myAccuracy, mocks.length],
  ]
    .sort((a, b) => b[1] - a[1])
    .map(([name, score, acc, m], i) => ({
      rank: i + 1,
      name,
      score,
      accuracy: acc,
      mocks: m,
      isYou: name === (userName || "You"),
    }));
  return rows;
}
