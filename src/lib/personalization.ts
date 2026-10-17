import { supabase } from "./supabase";

export interface Attempt {
  id?: string;
  user_id: string;
  question_id: string;
  chosen_option: string;
  is_correct: boolean;
  time_spent_seconds: number;
  mode: "practice" | "mock" | "challenge" | "battle";
  created_at?: string;
}

export interface WeakSpot {
  topic: string;
  total: number;
  correct: number;
  accuracy: number;
}

const ATTEMPTS_PREFIX = "medscope_attempts_";

// Local storage caching for ultra-responsive UI & offline ward support
function getCachedAttempts(userId: string): Attempt[] {
  try {
    const raw = localStorage.getItem(ATTEMPTS_PREFIX + userId);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCachedAttempts(userId: string, attempts: Attempt[]) {
  try {
    localStorage.setItem(ATTEMPTS_PREFIX + userId, JSON.stringify(attempts));
  } catch {
    /* storage unavailable */
  }
}

/**
 * Record a candidate's answer attempt:
 * - Immediately updates local cached state for instant feedback.
 * - Fire-and-forget syncs to Supabase PostgreSQL attempts table.
 */
export async function recordAttempt(
  userId: string,
  questionId: string,
  chosenOption: string,
  isCorrect: boolean,
  timeSpentSeconds: number = 0,
  mode: "practice" | "mock" | "challenge" | "battle" = "practice"
) {
  const newAttempt: Attempt = {
    user_id: userId,
    question_id: questionId,
    chosen_option: chosenOption,
    is_correct: isCorrect,
    time_spent_seconds: timeSpentSeconds,
    mode,
    created_at: new Date().toISOString(),
  };

  // 1. Local Cache
  const cached = getCachedAttempts(userId);
  cached.unshift(newAttempt);
  saveCachedAttempts(userId, cached.slice(0, 500));

  // 2. Supabase Sync (Non-blocking)
  try {
    void supabase.from("attempts").insert({
      user_id: userId,
      question_id: questionId,
      chosen_option: chosenOption,
      is_correct: isCorrect,
      time_spent_seconds: timeSpentSeconds,
      mode,
    });
  } catch (err) {
    console.error("Failed to sync attempt to Supabase:", err);
  }

  // 3. Update Study Streak
  void updateStudyStreak(userId);
}

/**
 * Identify weak spots based on accuracy:
 * Groups attempts by topic and identifies areas with < 60% accuracy.
 */
export function getWeakSpots(
  attempts: { topic?: string; is_correct: boolean }[]
): WeakSpot[] {
  const map: Record<string, { total: number; correct: number }> = {};

  attempts.forEach((a) => {
    const topic = a.topic || "General";
    if (!map[topic]) map[topic] = { total: 0, correct: 0 };
    map[topic].total++;
    if (a.is_correct) map[topic].correct++;
  });

  return Object.entries(map)
    .map(([topic, stats]) => ({
      topic,
      total: stats.total,
      correct: stats.correct,
      accuracy: Math.round((stats.correct / stats.total) * 100),
    }))
    .filter((s) => s.total >= 3 && s.accuracy < 65)
    .sort((a, b) => a.accuracy - b.accuracy);
}

/**
 * Update candidate study streak in Supabase profiles
 */
export async function updateStudyStreak(userId: string) {
  try {
    const today = new Date().toISOString().split("T")[0];
    const { data: profile } = await supabase
      .from("profiles")
      .select("streak, last_study_date")
      .eq("id", userId)
      .maybeSingle();

    if (!profile) return;

    const last = profile.last_study_date;
    if (last === today) return; // Already counted today

    let newStreak = (profile.streak || 0) + 1;
    // If missed more than 1 day, reset streak to 1
    if (last) {
      const diffDays = Math.floor(
        (new Date(today).getTime() - new Date(last).getTime()) / (1000 * 3600 * 24)
      );
      if (diffDays > 1) newStreak = 1;
    }

    await supabase
      .from("profiles")
      .update({
        streak: newStreak,
        last_study_date: today,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);
  } catch (err) {
    console.error("Streak update error:", err);
  }
}
