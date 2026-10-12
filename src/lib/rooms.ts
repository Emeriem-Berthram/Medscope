/* Room state (Challenge Room and Battle Room).
   Hybrid backend:
   - localStorage is the immediate source of truth (instant UI)
   - Supabase Postgres mirrors rooms so they persist across devices
   - Supabase Realtime broadcast syncs live state between players
   The anon key is public by design; tighten with RLS when
   Supabase Auth replaces the demo login. */

import { supabase } from "./supabase";

export interface RoomPlayer {
  name: string;
  score: number;
  answered: number;
  correct: number;
}

export interface Room {
  code: string;
  kind: "challenge" | "battle";
  title: string;
  topic: string;
  exam: string;
  faculty: string;
  questionCount: number;
  secondsPerQuestion: number;
  host: string;
  players: RoomPlayer[];
  status: "waiting" | "live" | "finished";
  scheduledFor?: string;
  visibility: "public" | "private";
  currentQuestion: number;
  createdAt: number;
}

function key(code: string): string {
  return `medscope_room_${code}`;
}

export function generateCode(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/* ---------- Supabase mirroring (fire and forget) ---------- */

async function mirrorRoom(room: Room) {
  try {
    const { data: existing } = await supabase
      .from("rooms")
      .select("code")
      .eq("code", room.code)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("rooms")
        .update({
          status: room.status,
          current_question: room.currentQuestion,
        })
        .eq("code", room.code);
    } else {
      await supabase.from("rooms").insert({
        code: room.code,
        kind: room.kind,
        title: room.title,
        topic: room.topic,
        exam: room.exam,
        faculty: room.faculty,
        question_count: room.questionCount,
        seconds_per_question: room.secondsPerQuestion,
        host: room.host,
        visibility: room.visibility,
        status: room.status,
        scheduled_for: room.scheduledFor ?? null,
      });
    }

    for (const p of room.players) {
      await supabase.from("room_players").upsert({
        room_code: room.code,
        player_name: p.name,
        score: p.score,
        answered: p.answered,
        correct: p.correct,
      });
    }
  } catch {
    /* offline or tables not created yet — localStorage still works */
  }
}

/* ---------- broadcast ---------- */

type Listener = (room: Room) => void;
const listeners = new Map<string, Listener[]>();
const sendChannels = new Map<string, ReturnType<typeof supabase.channel>>();

function sendChannel(code: string) {
  let ch = sendChannels.get(code);
  if (!ch) {
    ch = supabase.channel(`room:${code}`);
    ch.subscribe();
    sendChannels.set(code, ch);
  }
  return ch;
}

export function subscribeRoom(code: string, onState: Listener) {
  const list = listeners.get(code) ?? [];
  list.push(onState);
  listeners.set(code, list);

  const channel = supabase
    .channel(`room:${code}`)
    .on("broadcast", { event: "state" }, (payload) => {
      const room = payload.payload as Room;
      localStorage.setItem(key(room.code), JSON.stringify(room));
      (listeners.get(code) ?? []).forEach((fn) => fn(room));
    })
    .subscribe();

  return () => {
    const arr = listeners.get(code) ?? [];
    listeners.set(code, arr.filter((fn) => fn !== onState));
    supabase.removeChannel(channel);
  };
}

function broadcast(room: Room) {
  try {
    sendChannel(room.code).send({
      type: "broadcast",
      event: "state",
      payload: room,
    });
  } catch {
    /* ignore */
  }
}

/* ---------- storage operations ---------- */

export function createRoom(room: Room): Room {
  localStorage.setItem(key(room.code), JSON.stringify(room));
  if (room.kind === "battle" && room.visibility === "public") {
    const list = listBattles();
    list.unshift(room.code);
    localStorage.setItem("medscope_battle_list", JSON.stringify(list.slice(0, 50)));
  }
  void mirrorRoom(room);
  broadcast(room);
  return room;
}

export function getRoom(code: string): Room | null {
  try {
    const raw = localStorage.getItem(key(code));
    return raw ? (JSON.parse(raw) as Room) : null;
  } catch {
    return null;
  }
}

/* Fetch from Supabase when the room isn't on this device yet */
export async function fetchRoom(code: string): Promise<Room | null> {
  const local = getRoom(code);
  if (local) return local;
  try {
    const { data } = await supabase
      .from("rooms")
      .select("*")
      .eq("code", code)
      .maybeSingle();
    if (!data) return null;
    const { data: players } = await supabase
      .from("room_players")
      .select("*")
      .eq("room_code", code);
    const room: Room = {
      code: data.code,
      kind: data.kind,
      title: data.title,
      topic: data.topic,
      exam: data.exam ?? "",
      faculty: data.faculty ?? "",
      questionCount: data.question_count,
      secondsPerQuestion: data.seconds_per_question,
      host: data.host,
      players: (players ?? []).map((p) => ({
        name: p.player_name,
        score: Number(p.score),
        answered: p.answered,
        correct: p.correct,
      })),
      status: data.status,
      scheduledFor: data.scheduled_for ?? undefined,
      visibility: data.visibility,
      currentQuestion: data.current_question ?? 0,
      createdAt: new Date(data.created_at).getTime(),
    };
    localStorage.setItem(key(room.code), JSON.stringify(room));
    return room;
  } catch {
    return null;
  }
}

export function saveRoom(room: Room) {
  localStorage.setItem(key(room.code), JSON.stringify(room));
  void mirrorRoom(room);
  broadcast(room);
}

export function listBattles(): string[] {
  try {
    const raw = localStorage.getItem("medscope_battle_list");
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function listBattleRooms(): Room[] {
  return listBattles()
    .map((code) => getRoom(code))
    .filter((r): r is Room => r !== null && r.status !== "finished");
}

/* Public battles from Supabase, so every device sees them */
export async function fetchPublicBattles(): Promise<Room[]> {
  try {
    const { data } = await supabase
      .from("rooms")
      .select("*")
      .eq("kind", "battle")
      .eq("visibility", "public")
      .neq("status", "finished")
      .order("created_at", { ascending: false })
      .limit(50);
    if (!data) return [];
    const rooms: Room[] = [];
    for (const d of data) {
      const { data: players } = await supabase
        .from("room_players")
        .select("*")
        .eq("room_code", d.code);
      rooms.push({
        code: d.code,
        kind: d.kind,
        title: d.title,
        topic: d.topic,
        exam: d.exam ?? "",
        faculty: d.faculty ?? "",
        questionCount: d.question_count,
        secondsPerQuestion: d.seconds_per_question,
        host: d.host,
        players: (players ?? []).map((p) => ({
          name: p.player_name,
          score: Number(p.score),
          answered: p.answered,
          correct: p.correct,
        })),
        status: d.status,
        scheduledFor: d.scheduled_for ?? undefined,
        visibility: d.visibility,
        currentQuestion: d.current_question ?? 0,
        createdAt: new Date(d.created_at).getTime(),
      });
    }
    return rooms;
  } catch {
    return [];
  }
}

export function joinRoom(code: string, playerName: string): Room | null {
  const room = getRoom(code.toUpperCase().trim());
  if (!room) return null;
  if (room.players.some((p) => p.name.toLowerCase() === playerName.toLowerCase())) {
    return room;
  }
  const maxPlayers = room.kind === "battle" ? 20 : 2;
  if (room.players.length >= maxPlayers) return null;
  room.players.push({ name: playerName, score: 0, answered: 0, correct: 0 });
  if (room.kind === "challenge" && room.players.length === 2 && room.status === "waiting") {
    room.status = "live";
  }
  saveRoom(room);
  return room;
}

export function answerInRoom(
  code: string,
  playerName: string,
  correct: boolean
): Room | null {
  const room = getRoom(code);
  if (!room) return null;
  const player = room.players.find((p) => p.name === playerName);
  if (!player) return null;
  player.score = Math.round((player.score + (correct ? 2 : -0.5)) * 10) / 10;
  player.answered += 1;
  if (correct) player.correct += 1;
  saveRoom(room);
  return room;
}
